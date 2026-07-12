import { describe, expect, it } from "vitest";

import { SongDocumentSchema } from "@/validation";
import { parseSongText, transposeSongDocument } from "@/domain/songs";
import type { SongDocument, SongSegmentDocument } from "@/types/music";

function collectTextSegments(document: SongDocument): readonly string[] {
  return document.sections.flatMap((section) =>
    section.lines.flatMap((line) =>
      line.segments.flatMap((segment) => (segment.type === "text" ? [segment.text] : [])),
    ),
  );
}

function collectChordTokens(document: SongDocument): readonly {
  readonly rootPitchClass: number;
  readonly bassPitchClass: number | null | undefined;
  readonly originalSpelling?: string;
}[] {
  return document.sections.flatMap((section) =>
    section.lines.flatMap((line) =>
      line.segments.flatMap((segment) =>
        segment.type === "chord"
          ? [
              {
                rootPitchClass: segment.chord.rootPitchClass,
                bassPitchClass: segment.chord.bassPitchClass,
                originalSpelling: segment.chord.originalSpelling,
              },
            ]
          : [],
      ),
    ),
  );
}

function getChordSegments(document: SongDocument): readonly Extract<SongSegmentDocument, { readonly type: "chord" }>[] {
  return document.sections.flatMap((section) =>
    section.lines.flatMap((line) =>
      line.segments.flatMap((segment) => (segment.type === "chord" ? [segment] : [])),
    ),
  );
}

describe("song parser", () => {
  it("reconhece formato inline, formato com linha de acordes e preserva a estrutura", () => {
    const result = parseSongText(`[Verse 1]\n[Bb] trecho com [F#] e [D/F#]\nD\nLinha acima da letra`);

    expect(result.warnings).toEqual([]);
    expect(result.unrecognizedChords).toEqual([]);
    expect(result.sections).toEqual([
      {
        id: "song-section-1",
        type: "verse",
        label: "Verse 1",
        lineCount: 3,
      },
    ]);
    expect(result.recognizedChords).toHaveLength(4);
    expect(result.recognizedChords.map((chord) => ({
      rootPitchClass: chord.rootPitchClass,
      bassPitchClass: chord.bassPitchClass ?? null,
      originalSpelling: chord.originalSpelling,
    }))).toEqual([
      {
        rootPitchClass: 10,
        bassPitchClass: null,
        originalSpelling: "Bb",
      },
      {
        rootPitchClass: 6,
        bassPitchClass: null,
        originalSpelling: "F#",
      },
      {
        rootPitchClass: 2,
        bassPitchClass: 6,
        originalSpelling: "D/F#",
      },
      {
        rootPitchClass: 2,
        bassPitchClass: null,
        originalSpelling: "D",
      },
    ]);

    expect(SongDocumentSchema.safeParse(result.document).success).toBe(true);
    expect(result.document.sections).toHaveLength(1);
    expect(result.document.sections[0]?.type).toBe("verse");
    expect(result.document.sections[0]?.label).toBe("Verse 1");
    expect(result.document.sections[0]?.lines).toHaveLength(3);
    expect(result.document.sections[0]?.lines[0]?.type).toBe("lyrics");
    expect(result.document.sections[0]?.lines[1]?.type).toBe("chords");
    expect(result.document.sections[0]?.lines[2]?.type).toBe("lyrics");

    expect(getChordSegments(result.document).map((segment) => ({
      rootPitchClass: segment.chord.rootPitchClass,
      bassPitchClass: segment.chord.bassPitchClass ?? null,
    }))).toEqual([
      { rootPitchClass: 10, bassPitchClass: null },
      { rootPitchClass: 6, bassPitchClass: null },
      { rootPitchClass: 2, bassPitchClass: 6 },
      { rootPitchClass: 2, bassPitchClass: null },
    ]);
  });

  it("transpõe apenas os tokens de acorde e mantém o texto intacto", () => {
    const result = parseSongText(`[Verse 1]\n[Bb] trecho com [F#] e [D/F#]\nD\nLinha acima da letra`);
    const transposed = transposeSongDocument(result.document, 2);

    expect(collectTextSegments(transposed)).toEqual(collectTextSegments(result.document));
    expect(collectChordTokens(transposed)).toEqual([
      {
        rootPitchClass: 0,
        bassPitchClass: null,
        originalSpelling: "Bb",
      },
      {
        rootPitchClass: 8,
        bassPitchClass: null,
        originalSpelling: "F#",
      },
      {
        rootPitchClass: 4,
        bassPitchClass: 8,
        originalSpelling: "D/F#",
      },
      {
        rootPitchClass: 4,
        bassPitchClass: null,
        originalSpelling: "D",
      },
    ]);
    expect(transposeSongDocument(transposed, -2)).toEqual(result.document);
    expect(SongDocumentSchema.safeParse(transposed).success).toBe(true);
  });

  it("gera warnings para markup e acordes não reconhecidos sem descartar texto", () => {
    const result = parseSongText("<script>alert(1)</script>\n[H7] texto");

    expect(result.warnings.map((warning) => warning.code)).toEqual(
      expect.arrayContaining(["script_detected", "unrecognized_chord"]),
    );
    expect(result.unrecognizedChords).toEqual(["H7"]);
    expect(result.recognizedChords).toHaveLength(0);
    expect(collectTextSegments(result.document)).toEqual([
      "<script>alert(1)</script>",
      "[H7]",
      " texto",
    ]);
    expect(SongDocumentSchema.safeParse(result.document).success).toBe(true);
  });
});
