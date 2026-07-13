import { Text } from "react-native";
import TestRenderer, { act } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";

import { useMetronome } from "@/hooks/useMetronome";
import { createAudioSessionCoordinator } from "@/services/audioSessionCoordinator";
import { createMetronomeService } from "@/services/metronomeService";
import type {
  AudioSessionController,
  AudioSessionOwner,
  AudioSessionStopReason,
} from "@/types/audio";
import type { MetronomeScheduler, MetronomeService } from "@/types/metronome";

function createControlledScheduler(startAtMs = 0) {
  let currentTime = startAtMs;
  let nextTimerId = 1;
  const timers = new Map<number, { readonly runAt: number; readonly callback: () => void }>();

  function flushDueTimers(targetTime: number): void {
    while (true) {
      const nextEntry = [...timers.entries()].sort((left, right) => left[1].runAt - right[1].runAt)[0];
      if (nextEntry === undefined || nextEntry[1].runAt > targetTime) {
        break;
      }

      currentTime = nextEntry[1].runAt;
      timers.delete(nextEntry[0]);
      nextEntry[1].callback();
    }
  }

  const scheduler: MetronomeScheduler = {
    now: () => currentTime,
    setTimeout: (callback: () => void, delayMs: number) => {
      const id = nextTimerId;
      nextTimerId += 1;
      timers.set(id, {
        runAt: currentTime + Math.max(0, delayMs),
        callback,
      });
      return id;
    },
    clearTimeout: (handle: unknown) => {
      timers.delete(Number(handle));
    },
  };

  return {
    scheduler,
    now: () => currentTime,
    advanceBy: (deltaMs: number) => {
      const targetTime = currentTime + deltaMs;
      flushDueTimers(targetTime);
      currentTime = targetTime;
      flushDueTimers(targetTime);
    },
  };
}

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

  const { children } = node.props;

  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map((child) => String(child)).join("");
  }

  return "";
}

const asyncAct = act as unknown as (callback: () => void | Promise<void>) => Promise<void>;

function MetronomeProbe({ service }: { readonly service: MetronomeService }) {
  const metronome = useMetronome({ service });
  const { state } = metronome;

  return (
    <Text testID="metronome-state">
      {[
        state.status,
        state.bpm,
        state.beat.barNumber ?? "none",
        state.beat.beatInBar ?? "none",
        state.beat.isAccentBeat ? "accent" : "plain",
        state.tapTempo.sampleCount,
      ].join("|")}
    </Text>
  );
}

describe("metronome service", () => {
  it("mantém contagem inicial, primeiro tempo e retomada controlada por clock", async () => {
    const clock = createControlledScheduler(0);
    const { calls, controller } = createRecordingController();
    const coordinator = createAudioSessionCoordinator({ controller });
    const service = createMetronomeService({
      bpm: 120,
      countInBars: 1,
      timeSignatureNumerator: 4,
      timeSignatureDenominator: 4,
      scheduler: clock.scheduler,
      now: clock.now,
      audioCoordinator: coordinator,
    });

    expect(service.getState()).toMatchObject({
      status: "stopped",
      bpm: 120,
      countInBars: 1,
    });

    await asyncAct(() => service.start());

    expect(service.getState()).toMatchObject({
      status: "counting_in",
      beat: {
        barNumber: 1,
        beatInBar: 1,
        isAccentBeat: true,
      },
      countIn: {
        barsRemaining: 1,
        beatsRemaining: 4,
        beatInCountIn: 1,
      },
    });

    clock.advanceBy(2000);

    expect(service.getState()).toMatchObject({
      status: "playing",
      beat: {
        barNumber: 1,
        beatInBar: 1,
        isAccentBeat: true,
      },
      countIn: {
        barsRemaining: 0,
        beatsRemaining: 0,
        beatInCountIn: null,
      },
    });

    await asyncAct(() => coordinator.requestSession("reference", { confirmSwitch: true }));

    expect(service.getState()).toMatchObject({
      status: "paused",
      beat: {
        barNumber: 1,
        beatInBar: 1,
        isAccentBeat: true,
        nextBeatAtMs: null,
      },
    });

    await asyncAct(() => coordinator.releaseSession("manual"));

    await asyncAct(() => service.start());

    expect(service.getState()).toMatchObject({
      status: "playing",
      beat: {
        barNumber: 1,
        beatInBar: 1,
        isAccentBeat: true,
      },
    });

    clock.advanceBy(500);

    expect(service.getState()).toMatchObject({
      status: "playing",
      beat: {
        barNumber: 1,
        beatInBar: 2,
        isAccentBeat: false,
      },
    });

    expect(calls).toEqual([
      { kind: "activate", owner: "metronome" },
      { kind: "pause", owner: "metronome", reason: "switch" },
      { kind: "release", owner: "metronome", reason: "switch" },
      { kind: "activate", owner: "reference" },
      { kind: "release", owner: "reference", reason: "manual" },
      { kind: "activate", owner: "metronome" },
    ]);
  });

  it("calcula tap tempo com mediana e reinicia após pausa longa", async () => {
    const clock = createControlledScheduler(0);
    const service = createMetronomeService({
      scheduler: clock.scheduler,
      now: clock.now,
      countInBars: 0,
    });

    await service.tap(0);
    expect(service.getState().tapTempo).toMatchObject({
      sampleCount: 1,
      bpmCandidate: null,
      resetReason: "insufficient_samples",
    });

    await service.tap(500);
    expect(service.getState().tapTempo).toMatchObject({
      sampleCount: 2,
      bpmCandidate: 120,
      resetReason: "none",
    });
    expect(service.getState().bpm).toBe(120);

    await service.tap(1000);
    expect(service.getState().tapTempo).toMatchObject({
      sampleCount: 3,
      bpmCandidate: 120,
      resetReason: "none",
    });

    await service.tap(4200);
    expect(service.getState().tapTempo).toMatchObject({
      sampleCount: 1,
      bpmCandidate: null,
      resetReason: "pause_long",
      lastTapAtMs: 4200,
    });
  });

  it("expõe o estado atualizado pelo hook", async () => {
    const clock = createControlledScheduler(0);
    const service = createMetronomeService({
      bpm: 120,
      countInBars: 0,
      scheduler: clock.scheduler,
      now: clock.now,
    });

    let renderer: ReturnType<typeof TestRenderer.create> | undefined;
    act(() => {
      renderer = TestRenderer.create(<MetronomeProbe service={service} />);
    });

    expect(readText(renderer as ReturnType<typeof TestRenderer.create>, "metronome-state")).toBe(
      "stopped|120|none|none|plain|0",
    );

    await asyncAct(() => service.start());

    expect(readText(renderer as ReturnType<typeof TestRenderer.create>, "metronome-state")).toBe(
      "playing|120|1|1|accent|0",
    );

    await asyncAct(() => {
      clock.advanceBy(500);
    });

    expect(readText(renderer as ReturnType<typeof TestRenderer.create>, "metronome-state")).toBe(
      "playing|120|1|2|plain|0",
    );
  });
});
