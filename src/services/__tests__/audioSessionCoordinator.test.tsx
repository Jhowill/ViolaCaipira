import { describe, expect, it, vi } from "vitest";
import { Text } from "react-native";
import TestRenderer, { act } from "react-test-renderer";

import { AudioSessionProvider, useAudioSession } from "@/state/audio";
import { createAudioSessionCoordinator } from "@/services/audioSessionCoordinator";
import type {
  AudioSessionController,
  AudioSessionOwner,
  AudioSessionStopReason,
} from "@/types/audio";

function createRecordingController() {
  const calls: Array<{
    readonly kind: "activate" | "pause" | "release";
    readonly owner: AudioSessionOwner;
    readonly reason?: AudioSessionStopReason;
  }> = [];

  const controller: AudioSessionController = {
    activate: vi.fn((owner: AudioSessionOwner) => {
      calls.push({ kind: "activate", owner });
      return Promise.resolve();
    }),
    pause: vi.fn((owner: AudioSessionOwner, reason: AudioSessionStopReason) => {
      calls.push({ kind: "pause", owner, reason });
      return Promise.resolve();
    }),
    release: vi.fn((owner: AudioSessionOwner, reason: AudioSessionStopReason) => {
      calls.push({ kind: "release", owner, reason });
      return Promise.resolve();
    }),
  };

  return {
    calls,
    controller,
  };
}

function readText(renderer: ReturnType<typeof TestRenderer.create>, testID: string): string {
  const node = renderer.root.findAllByProps({ testID })[0] as
    | { readonly props: { readonly children?: unknown } }
    | undefined;

  if (node === undefined) {
    throw new Error(`Node not found: ${testID}`);
  }

  const children = node.props.children;

  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map((child) => String(child)).join("");
  }

  return "";
}

function AudioStateProbe() {
  const audio = useAudioSession();
  const { state } = audio;

  return (
    <Text testID="audio-state">
      {[
        state.status,
        state.activeOwner ?? "none",
        state.lastOwner ?? "none",
        state.lastStopReason ?? "none",
        state.pendingOwner ?? "none",
        state.confirmationRequired ? "pending" : "clear",
      ].join("|")}
    </Text>
  );
}

describe("audio session coordinator", () => {
  it("mantém sessões incompatíveis exclusivas até a confirmação", async () => {
    const { calls, controller } = createRecordingController();
    const coordinator = createAudioSessionCoordinator({ controller });

    const started = await coordinator.requestSession("tuner");

    expect(started.granted).toBe(true);
    expect(started.requiresConfirmation).toBe(false);
    expect(started.reason).toBe("started");
    expect(started.state).toMatchObject({
      status: "active",
      activeOwner: "tuner",
      lastOwner: null,
      pendingOwner: null,
      confirmationRequired: false,
    });
    expect(calls).toEqual([{ kind: "activate", owner: "tuner" }]);

    const pending = await coordinator.requestSession("metronome");

    expect(pending.granted).toBe(false);
    expect(pending.requiresConfirmation).toBe(true);
    expect(pending.reason).toBe("confirmation_required");
    expect(pending.state).toMatchObject({
      status: "active",
      activeOwner: "tuner",
      pendingOwner: "metronome",
      confirmationRequired: true,
    });
    expect(calls).toEqual([{ kind: "activate", owner: "tuner" }]);

    const switched = await coordinator.requestSession("metronome", { confirmSwitch: true });

    expect(switched.granted).toBe(true);
    expect(switched.requiresConfirmation).toBe(false);
    expect(switched.reason).toBe("switched");
    expect(calls).toEqual([
      { kind: "activate", owner: "tuner" },
      { kind: "pause", owner: "tuner", reason: "switch" },
      { kind: "release", owner: "tuner", reason: "switch" },
      { kind: "activate", owner: "metronome" },
    ]);
    expect(coordinator.getState()).toMatchObject({
      status: "active",
      activeOwner: "metronome",
      lastOwner: "tuner",
      lastStopReason: null,
      pendingOwner: null,
      confirmationRequired: false,
    });
  });

  it("libera os recursos no background e só retoma com ação explícita", async () => {
    const { calls, controller } = createRecordingController();
    const coordinator = createAudioSessionCoordinator({ controller });

    await coordinator.requestSession("reference");
    await coordinator.handleBackground();

    expect(calls).toEqual([
      { kind: "activate", owner: "reference" },
      { kind: "pause", owner: "reference", reason: "background" },
      { kind: "release", owner: "reference", reason: "background" },
    ]);
    expect(coordinator.getState()).toMatchObject({
      status: "suspended",
      activeOwner: null,
      lastOwner: "reference",
      lastStopReason: "background",
      confirmationRequired: false,
      pendingOwner: null,
    });

    expect(calls.filter((call) => call.kind === "activate")).toHaveLength(1);

    await coordinator.requestSession("reference");

    expect(calls.filter((call) => call.kind === "activate")).toHaveLength(2);
    expect(coordinator.getState()).toMatchObject({
      status: "active",
      activeOwner: "reference",
      lastOwner: "reference",
      lastStopReason: null,
    });
  });

  it("expõe o estado da sessão por meio do hook", async () => {
    const { controller } = createRecordingController();
    const coordinator = createAudioSessionCoordinator({ controller });
    let renderer: ReturnType<typeof TestRenderer.create> | undefined;
    const asyncAct = act as unknown as (callback: () => Promise<void>) => Promise<void>;

    act(() => {
      renderer = TestRenderer.create(
        <AudioSessionProvider coordinator={coordinator}>
          <AudioStateProbe />
        </AudioSessionProvider>,
      );
    });

    expect(readText(renderer as ReturnType<typeof TestRenderer.create>, "audio-state")).toBe(
      "idle|none|none|none|none|clear",
    );

    await asyncAct(async () => {
      await coordinator.requestSession("chord");
    });

    expect(readText(renderer as ReturnType<typeof TestRenderer.create>, "audio-state")).toBe(
      "active|chord|none|none|none|clear",
    );

    await asyncAct(async () => {
      await coordinator.handleInterruption("call");
    });

    expect(readText(renderer as ReturnType<typeof TestRenderer.create>, "audio-state")).toBe(
      "suspended|none|chord|call|none|clear",
    );
  });
});
