import { Text } from "react-native";
import TestRenderer, { act } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";

import { createTunerTarget } from "@/domain/tuner";
import { useTuner } from "@/hooks/useTuner";
import { createTunerService } from "@/services/tunerService";
import type {
  TunerFrequencySample,
  TunerInputSource,
  TunerPermissionResolver,
  TunerService,
} from "@/types/tuner";

function createSyntheticSource() {
  const listeners = new Set<(sample: TunerFrequencySample) => void>();
  let active = false;
  const calls = {
    start: 0,
    stop: 0,
    subscribe: 0,
  };

  const source: TunerInputSource = {
    start: () => {
      calls.start += 1;
      active = true;
      return Promise.resolve();
    },
    stop: () => {
      calls.stop += 1;
      active = false;
      return Promise.resolve();
    },
    subscribe: (listener: (sample: TunerFrequencySample) => void) => {
      calls.subscribe += 1;
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  function emit(sample: TunerFrequencySample): void {
    if (!active) {
      return;
    }

    listeners.forEach((listener) => {
      listener(sample);
    });
  }

  return {
    calls,
    emit,
    source,
  };
}

function createPermissionResolver(): TunerPermissionResolver {
  return {
    requestPermission: vi.fn(() => Promise.resolve("granted" as const)),
  };
}

function readText(renderer: ReturnType<typeof TestRenderer.create>, testID: string): string {
  const node = renderer.root.findAllByProps({ testID })[0] as
    | { readonly props: { readonly children?: unknown } }
    | undefined;

  if (node === undefined) {
    throw new Error(`Node not found: ${testID}`);
  }

  const { children } = node.props;
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map((child) => String(child)).join("");
  }

  return "";
}

function buildSamples(frequency: number, amplitude: number): readonly TunerFrequencySample[] {
  return [
    { frequency, amplitude, timestampMs: 1 },
    { frequency, amplitude, timestampMs: 2 },
    { frequency, amplitude, timestampMs: 3 },
  ];
}

function TunerProbe({ service }: { readonly service: TunerService }) {
  const tuner = useTuner({ service });
  const { state } = tuner;

  return (
    <Text testID="tuner-state">
      {[
        state.status,
        state.permissionStatus,
        state.target?.label ?? "none",
        state.analysis?.noteLabel ?? "none",
        state.guided?.index ?? -1,
        state.guided?.canAdvance ? "advance" : "hold",
      ].join("|")}
    </Text>
  );
}

describe("tuner service", () => {
  it("bloqueia a captura quando nenhuma integracao nativa de permissao foi fornecida", async () => {
    const source = createSyntheticSource();
    const service = createTunerService({ source: source.source });

    await service.start();

    expect(source.calls.start).toBe(0);
    expect(source.calls.subscribe).toBe(0);
    expect(service.getState()).toMatchObject({
      status: "error",
      permissionStatus: "blocked",
    });
  });

  it("exige start explícito, analisa sinal sintético e libera captura no stop", async () => {
    const source = createSyntheticSource();
    const permissionResolver = createPermissionResolver();
    const targetA4 = createTunerTarget({
      label: "A4",
      pitchClass: 9,
      octave: 4,
      calibrationA4: 440,
    });
    const targetB4 = createTunerTarget({
      label: "B4",
      pitchClass: 11,
      octave: 4,
      calibrationA4: 440,
    });

    const service = createTunerService({
      source: source.source,
      permissionResolver,
      mode: "guided",
      guidedTargets: [targetA4, targetB4],
      autoAdvance: false,
    });

    expect(service.getState()).toMatchObject({
      status: "idle",
      permissionStatus: "unknown",
      target: targetA4,
    });
    expect(source.calls.start).toBe(0);

    await service.start();

    expect(source.calls.start).toBe(1);
    expect(service.getState()).toMatchObject({
      status: "listening",
      permissionStatus: "granted",
      target: targetA4,
    });

    buildSamples(440, 0.85).forEach((sample) => {
      source.emit(sample);
    });

    const tunedState = service.getState();
    expect(tunedState.status).toBe("listening");
    expect(tunedState.target).toEqual(targetA4);
    expect(tunedState.analysis).not.toBeNull();
    expect(tunedState.analysis).toMatchObject({
      noteLabel: "A4",
      isStable: true,
      isWithinTolerance: true,
    });
    expect(tunedState.guided).toMatchObject({
      index: 0,
      canAdvance: true,
    });

    await service.advanceTarget();

    const advancedState = service.getState();
    expect(advancedState.target).toEqual(targetB4);
    expect(advancedState.analysis).toBeNull();
    expect(advancedState.guided).toMatchObject({
      index: 1,
      canAdvance: false,
    });

    await service.stop();

    expect(source.calls.stop).toBe(1);
    expect(service.getState()).toMatchObject({
      status: "idle",
    });

    buildSamples(493.88, 0.9).forEach((sample) => {
      source.emit(sample);
    });

    expect(service.getState().status).toBe("idle");
    expect(service.getState().target).toEqual(targetB4);
    expect(service.getState().analysis).toBeNull();
  });

  it("expõe o estado atualizado por meio do hook", async () => {
    const source = createSyntheticSource();
    const permissionResolver = createPermissionResolver();
    const targetA4 = createTunerTarget({
      label: "A4",
      pitchClass: 9,
      octave: 4,
      calibrationA4: 440,
    });

    const service = createTunerService({
      source: source.source,
      permissionResolver,
      mode: "guided",
      guidedTargets: [targetA4],
      autoAdvance: false,
    });

    let renderer: ReturnType<typeof TestRenderer.create> | undefined;
    const asyncAct = act as unknown as (callback: () => Promise<void>) => Promise<void>;

    act(() => {
      renderer = TestRenderer.create(<TunerProbe service={service} />);
    });

    expect(readText(renderer as ReturnType<typeof TestRenderer.create>, "tuner-state")).toBe(
      "idle|unknown|A4|none|0|hold",
    );

    await asyncAct(async () => {
      await service.start();
      buildSamples(440, 0.85).forEach((sample) => {
        source.emit(sample);
      });
    });

    expect(readText(renderer as ReturnType<typeof TestRenderer.create>, "tuner-state")).toContain(
      "listening|granted|A4|A4|0|advance",
    );

    await asyncAct(async () => {
      await service.stop();
    });

    expect(readText(renderer as ReturnType<typeof TestRenderer.create>, "tuner-state")).toContain(
      "idle|granted|A4|A4|0|hold",
    );
  });
});
