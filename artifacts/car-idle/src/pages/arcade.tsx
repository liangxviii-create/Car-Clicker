import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Bolt, Check, ChevronRight, Clock3, Gauge, RotateCcw, ShieldAlert, Trophy, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/hooks/use-game-state";
import { formatNumber } from "@/lib/utils";

type GameId = "drag" | "pit" | "traffic";
type DragPhase = "idle" | "waiting" | "go" | "result";
type PitPhase = "idle" | "playing" | "result";
type TrafficPhase = "idle" | "playing" | "result";
type Lane = 0 | 1 | 2;

const GAME_META: Record<GameId, { eyebrow: string; title: string; detail: string; accent: string; icon: typeof Bolt }> = {
  drag: {
    eyebrow: "01 / reaction",
    title: "Drag Strip",
    detail: "Hold your nerve. Launch on the signal.",
    accent: "#f5b642",
    icon: Bolt,
  },
  pit: {
    eyebrow: "02 / precision",
    title: "Pit Stop",
    detail: "Thread every service window.",
    accent: "#7ce7d9",
    icon: Wrench,
  },
  traffic: {
    eyebrow: "03 / survival",
    title: "Traffic Run",
    detail: "Find the clean line through midnight.",
    accent: "#ff7652",
    icon: ShieldAlert,
  },
};

function ArcadeHeader({ activeGame, onSelect }: { activeGame: GameId; onSelect: (game: GameId) => void }) {
  const { state, milesPerSecond } = useGameState();
  return (
    <header className="relative overflow-hidden rounded-[1.75rem] border border-[#304056] bg-[#101b2d] px-5 py-6 shadow-[0_24px_70px_rgba(3,9,20,.34)] sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#f5b642]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-52 w-52 rounded-full bg-[#7ce7d9]/10 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-7">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.28em] text-[#7ce7d9]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7ce7d9] shadow-[0_0_12px_#7ce7d9]" />
              Midnight Circuit / Open Play
            </div>
            <h1 className="max-w-2xl font-mono text-3xl font-black uppercase leading-[.95] tracking-[-.08em] text-[#f4f1e8] sm:text-5xl">
              The <span className="text-[#f5b642]">Arcade</span>
              <br />
              is live.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#9eabc0]">
              Three short runs. One clean scorecard. Every win routes straight back to your odometer.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-[260px]">
            <div className="rounded-xl border border-[#304056] bg-[#0b1423]/70 p-3">
              <div className="font-mono text-[9px] uppercase tracking-[.2em] text-[#718099]">Banked miles</div>
              <div className="mt-1 font-mono text-xl font-black tabular-nums text-[#f4f1e8]" data-testid="text-arcade-bank">
                {formatNumber(Math.floor(state.miles))}
              </div>
            </div>
            <div className="rounded-xl border border-[#304056] bg-[#0b1423]/70 p-3">
              <div className="font-mono text-[9px] uppercase tracking-[.2em] text-[#718099]">Cruise rate</div>
              <div className="mt-1 font-mono text-xl font-black tabular-nums text-[#7ce7d9]" data-testid="text-arcade-rate">
                {formatNumber(Math.floor(milesPerSecond))}<span className="ml-1 text-[10px] text-[#718099]">/sec</span>
              </div>
            </div>
          </div>
        </div>
        <nav className="grid grid-cols-1 gap-2 border-t border-[#304056] pt-4 sm:grid-cols-3" aria-label="Arcade games">
          {(Object.keys(GAME_META) as GameId[]).map((id) => {
            const game = GAME_META[id];
            const Icon = game.icon;
            const selected = activeGame === id;
            return (
              <button
                key={id}
                type="button"
                data-testid={`button-select-${id}`}
                onClick={() => onSelect(id)}
                className={`group flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
                  selected ? "border-[#f5b642]/70 bg-[#f5b642]/10" : "border-transparent bg-[#0b1423]/35 hover:border-[#304056] hover:bg-[#0b1423]/70"
                }`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border" style={{ color: game.accent, borderColor: `${game.accent}55`, backgroundColor: `${game.accent}12` }}>
                  <Icon size={17} strokeWidth={2.2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[9px] uppercase tracking-[.18em] text-[#718099]">{game.eyebrow}</span>
                  <span className={`block truncate text-sm font-bold ${selected ? "text-[#f4f1e8]" : "text-[#aab6c9]"}`}>{game.title}</span>
                </span>
                <ChevronRight size={15} className={`transition-transform ${selected ? "translate-x-0 text-[#f5b642]" : "-translate-x-1 text-[#506078] group-hover:translate-x-0"}`} />
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function StatusRail({ label, status, value }: { label: string; status: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#304056] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#7ce7d9] shadow-[0_0_10px_#7ce7d9]" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#718099]">{label}</span>
      </div>
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.16em]">
        <span className="text-[#f4f1e8]" data-testid="status-arcade-phase">{status}</span>
        <span className="text-[#f5b642]" data-testid="text-arcade-live-value">{value}</span>
      </div>
    </div>
  );
}

function DragStrip() {
  const { addBonusMiles } = useGameState();
  const [phase, setPhase] = useState<DragPhase>("idle");
  const [countdown, setCountdown] = useState(3);
  const [reaction, setReaction] = useState<number | null>(null);
  const [reward, setReward] = useState(0);
  const [message, setMessage] = useState("");
  const signalAt = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<DragPhase>("idle");
  phaseRef.current = phase;

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("idle");
    phaseRef.current = "idle";
    setCountdown(3);
    setReaction(null);
    setReward(0);
    setMessage("");
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const start = useCallback(() => {
    if (phaseRef.current === "waiting" || phaseRef.current === "go") return;
    setPhase("waiting");
    phaseRef.current = "waiting";
    setCountdown(3);
    setReaction(null);
    setReward(0);
    setMessage("");
    let ticks = 3;
    const countdownTick = () => {
      ticks -= 1;
      setCountdown(ticks);
      if (ticks <= 0) {
        const delay = 850 + Math.floor(Math.random() * 1900);
        timerRef.current = setTimeout(() => {
          signalAt.current = performance.now();
          setPhase("go");
          phaseRef.current = "go";
        }, delay);
      } else {
        timerRef.current = setTimeout(countdownTick, 700);
      }
    };
    timerRef.current = setTimeout(countdownTick, 700);
  }, []);

  const launch = useCallback(() => {
    if (phaseRef.current === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("result");
      phaseRef.current = "result";
      setReaction(null);
      setReward(0);
      setMessage("False start. Patience is horsepower.");
      return;
    }
    if (phaseRef.current !== "go") return;
    const ms = Math.max(1, Math.round(performance.now() - signalAt.current));
    const earned = ms <= 190 ? 440 : ms <= 310 ? 300 : ms <= 480 ? 180 : 80;
    setReaction(ms);
    setReward(earned);
    setMessage(ms <= 190 ? "Perfect launch." : ms <= 310 ? "Clean launch." : "You got off the line.");
    setPhase("result");
    phaseRef.current = "result";
    addBonusMiles(earned);
  }, [addBonusMiles]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        if (phaseRef.current === "idle" || phaseRef.current === "result") start();
        else launch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [launch, start]);

  const waitingLabel = countdown > 0 ? `0${countdown}` : "READY";
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-[#304056] bg-[#101b2d] shadow-[0_20px_50px_rgba(3,9,20,.22)]">
      <StatusRail label="Drag strip / reaction timing" status={phase === "idle" ? "staged" : phase === "waiting" ? "lights on" : phase === "go" ? "launch" : "run logged"} value={reaction ? `${reaction}ms` : "best: —"} />
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[.86fr_1.14fr]">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.22em] text-[#f5b642]"><Bolt size={14} /> Hold the line</div>
            <h2 className="font-mono text-3xl font-black uppercase tracking-[-.06em] text-[#f4f1e8] sm:text-4xl">Drag Strip</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#9eabc0]">Wait for the amber board to flip green. Hit launch on the first clean beat. Space, Enter, or the pad all work.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-[#304056] bg-[#0b1423]/70 p-3">
              <div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#718099]">Best bracket</div>
              <div className="mt-1 font-mono text-lg font-black text-[#f5b642]" data-testid="text-drag-best">190ms</div>
            </div>
            <div className="rounded-xl border border-[#304056] bg-[#0b1423]/70 p-3">
              <div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#718099]">Max payout</div>
              <div className="mt-1 font-mono text-lg font-black text-[#7ce7d9]" data-testid="text-drag-payout">+440 mi</div>
            </div>
          </div>
        </div>
        <div className="relative flex min-h-[270px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#3f4c62] bg-[#0b1423] p-5">
          <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent 0 28px, rgba(124,231,217,.07) 29px 30px)" }} />
          <div className="relative z-10 mb-4 font-mono text-[10px] uppercase tracking-[.28em] text-[#718099]" data-testid="status-drag-instruction">
            {phase === "idle" ? "Stage your launch" : phase === "waiting" ? `Lights in ${waitingLabel}` : phase === "go" ? "GO / GO / GO" : message}
          </div>
          <button
            type="button"
            data-testid="button-drag-launch"
            onPointerDown={(event) => { event.preventDefault(); phase === "idle" || phase === "result" ? start() : launch(); }}
            className={`relative z-10 grid h-40 w-40 place-items-center rounded-full border-8 font-mono text-center text-2xl font-black uppercase tracking-[-.04em] transition-all duration-200 active:scale-95 sm:h-48 sm:w-48 ${
              phase === "go" ? "border-[#7ce7d9] bg-[#7ce7d9]/20 text-[#d5fff8] shadow-[0_0_0_12px_rgba(124,231,217,.08),0_0_45px_rgba(124,231,217,.55)]" :
                phase === "waiting" ? "border-[#f5b642] bg-[#f5b642]/10 text-[#f5b642] shadow-[0_0_0_12px_rgba(245,182,66,.05)]" :
                  "border-[#45546c] bg-[#152238] text-[#f4f1e8] hover:border-[#f5b642] hover:text-[#f5b642]"
            }`}
          >
            {phase === "idle" ? "Stage" : phase === "waiting" ? waitingLabel : phase === "go" ? "Launch" : reaction ? `${reaction}ms` : "False\nstart"}
          </button>
          {phase === "result" && (
            <div className={`relative z-10 mt-4 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[.16em] ${reward ? "text-[#7ce7d9]" : "text-[#ff7652]"}`} data-testid="status-drag-result">
              {reward ? <Check size={14} /> : <ShieldAlert size={14} />}
              {reward ? `+${formatNumber(reward)} miles banked` : message}
            </div>
          )}
          <div className="relative z-10 mt-5 flex gap-2">
            {(phase === "idle" || phase === "result") && (
              <Button type="button" data-testid="button-drag-start" onClick={start} className="bg-[#f5b642] font-mono text-xs font-black uppercase tracking-[.16em] text-[#101722] hover:bg-[#ffd171]">
                {phase === "result" ? "Run it back" : "Start round"}
              </Button>
            )}
            {phase === "result" && (
              <Button type="button" data-testid="button-drag-reset" onClick={reset} variant="outline" className="border-[#45546c] font-mono text-xs uppercase tracking-[.16em] text-[#b8c4d6]">
                <RotateCcw size={13} /> Reset
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PitStop() {
  const { addBonusMiles } = useGameState();
  const [phase, setPhase] = useState<PitPhase>("idle");
  const [stage, setStage] = useState(1);
  const [needle, setNeedle] = useState(8);
  const [hits, setHits] = useState(0);
  const [reward, setReward] = useState(0);
  const [feedback, setFeedback] = useState("Ready for service");
  const phaseRef = useRef<PitPhase>("idle");
  const needleRef = useRef(needle);
  const stageRef = useRef(stage);
  const hitsRef = useRef(hits);
  phaseRef.current = phase;
  needleRef.current = needle;
  stageRef.current = stage;
  hitsRef.current = hits;

  const target = useMemo(() => {
    const windows = [
      { start: 41, end: 59 },
      { start: 47, end: 63 },
      { start: 37, end: 55 },
    ];
    return windows[stage - 1] ?? windows[0];
  }, [stage]);

  const reset = useCallback(() => {
    setPhase("idle");
    phaseRef.current = "idle";
    setStage(1);
    setNeedle(8);
    setHits(0);
    setReward(0);
    setFeedback("Ready for service");
  }, []);

  const start = useCallback(() => {
    setPhase("playing");
    phaseRef.current = "playing";
    setStage(1);
    stageRef.current = 1;
    setNeedle(8);
    setHits(0);
    hitsRef.current = 0;
    setReward(0);
    setFeedback("Thread the green window");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    let direction = 1;
    const interval = setInterval(() => {
      setNeedle((current) => {
        let next = current + direction * (1.9 + stageRef.current * 0.15);
        if (next >= 96) { next = 96; direction = -1; }
        if (next <= 4) { next = 4; direction = 1; }
        return next;
      });
    }, 32);
    return () => clearInterval(interval);
  }, [phase]);

  const service = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const current = needleRef.current;
    const currentTarget = stageRef.current === 1 ? { start: 41, end: 59 } : stageRef.current === 2 ? { start: 47, end: 63 } : { start: 37, end: 55 };
    const perfect = current >= currentTarget.start + 4 && current <= currentTarget.end - 4;
    const good = current >= currentTarget.start && current <= currentTarget.end;
    if (!good) {
      setFeedback("Missed the service window");
      setReward(0);
      setPhase("result");
      phaseRef.current = "result";
      return;
    }
    const nextHits = hitsRef.current + 1;
    hitsRef.current = nextHits;
    setHits(nextHits);
    if (stageRef.current < 3) {
      const nextStage = stageRef.current + 1;
      stageRef.current = nextStage;
      setStage(nextStage);
      setFeedback(perfect ? "Perfect torque / next station" : "Clean torque / next station");
    } else {
      const earned = perfect ? 520 : 360;
      setReward(earned);
      setFeedback(perfect ? "Full service. Zero wasted motion." : "Service complete. Back on track.");
      setPhase("result");
      phaseRef.current = "result";
      addBonusMiles(earned);
    }
  }, [addBonusMiles]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.code !== "Enter") return;
      event.preventDefault();
      if (phaseRef.current === "idle" || phaseRef.current === "result") start();
      else service();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [service, start]);

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-[#304056] bg-[#101b2d] shadow-[0_20px_50px_rgba(3,9,20,.22)]">
      <StatusRail label="Pit stop / precision timing" status={phase === "idle" ? "in the box" : phase === "playing" ? `station ${stage}/3` : "service logged"} value={phase === "result" && reward ? `+${reward} mi` : `${hits}/3 hits`} />
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[.8fr_1.2fr]">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.22em] text-[#7ce7d9]"><Wrench size={14} /> Precision service</div>
            <h2 className="font-mono text-3xl font-black uppercase tracking-[-.06em] text-[#f4f1e8] sm:text-4xl">Pit Stop</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#9eabc0]">Three stations, one moving window. Hit the sweet spot to keep the crew clean and collect the bigger payout.</p>
          </div>
          <div className="space-y-2 rounded-xl border border-[#304056] bg-[#0b1423]/70 p-3">
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[.16em] text-[#718099]">
              <span>Service sequence</span><span className="text-[#7ce7d9]" data-testid="text-pit-sequence">{hits}/3</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((item) => <div key={item} className={`h-2 flex-1 rounded-full transition-colors duration-200 ${item <= hits ? "bg-[#7ce7d9] shadow-[0_0_12px_rgba(124,231,217,.4)]" : item === stage && phase === "playing" ? "bg-[#f5b642]" : "bg-[#304056]"}`} data-testid={`status-pit-station-${item}`} />)}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#3f4c62] bg-[#0b1423] p-5 sm:p-7">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[.2em] text-[#718099]">
            <span data-testid="status-pit-feedback">{feedback}</span>
            <span className="text-[#f5b642]" data-testid="text-pit-stage">{phase === "playing" ? `STATION 0${stage}` : "SERVICE BAY"}</span>
          </div>
          <div className="relative mt-8 h-14 rounded-xl border border-[#304056] bg-[#121e31]">
            <div className="absolute top-0 h-full rounded-lg bg-[#7ce7d9]/20" style={{ left: `${target.start}%`, width: `${target.end - target.start}%` }} />
            <div className="absolute top-0 h-full border-x border-[#7ce7d9]" style={{ left: `${target.start + 4}%`, width: `${target.end - target.start - 8}%` }} />
            <div className="absolute -top-5 text-[9px] font-bold uppercase tracking-[.12em] text-[#7ce7d9]" style={{ left: `${target.start}%` }}>lock</div>
            <div className="absolute top-[-10px] h-[74px] w-1 rounded-full bg-[#f4f1e8] shadow-[0_0_15px_rgba(244,241,232,.7)] transition-none" style={{ left: `${needle}%`, transform: "translateX(-50%)" }} data-testid="status-pit-needle" />
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold uppercase tracking-[.3em] text-[#a9b6c8]/60">{phase === "playing" ? "Press on green" : "Needle offline"}</div>
          </div>
          <div className="mt-3 flex justify-between font-mono text-[9px] uppercase tracking-[.16em] text-[#506078]">
            <span>Loose</span><span>Perfect torque</span><span>Loose</span>
          </div>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            {phase === "playing" ? (
              <button type="button" data-testid="button-pit-service" onPointerDown={(event) => { event.preventDefault(); service(); }} className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#7ce7d9] bg-[#7ce7d9]/15 font-mono text-sm font-black uppercase tracking-[.18em] text-[#bffff6] transition-all hover:bg-[#7ce7d9]/25 active:scale-[.98]">
                <Check size={17} /> Service / Space
              </button>
            ) : (
              <Button type="button" data-testid="button-pit-start" onClick={start} className="min-h-14 flex-1 bg-[#7ce7d9] font-mono text-xs font-black uppercase tracking-[.18em] text-[#0d1826] hover:bg-[#bffff6]">
                {phase === "result" ? "New service" : "Start pit stop"}
              </Button>
            )}
            {phase === "result" && <Button type="button" data-testid="button-pit-reset" onClick={reset} variant="outline" className="min-h-14 border-[#45546c] font-mono text-xs uppercase tracking-[.16em] text-[#b8c4d6]"><RotateCcw size={14} /> Reset</Button>}
          </div>
          {phase === "result" && <div className={`mt-4 text-center font-mono text-xs font-bold uppercase tracking-[.16em] ${reward ? "text-[#7ce7d9]" : "text-[#ff7652]"}`} data-testid="status-pit-result">{reward ? `+${formatNumber(reward)} miles banked` : "No payout / missed station"}</div>}
        </div>
      </div>
    </section>
  );
}

function TrafficRun() {
  const { addBonusMiles } = useGameState();
  const [phase, setPhase] = useState<TrafficPhase>("idle");
  const [lane, setLane] = useState<Lane>(1);
  const [obstacles, setObstacles] = useState<Array<{ id: number; lane: Lane; y: number }>>([]);
  const [distance, setDistance] = useState(0);
  const [reward, setReward] = useState(0);
  const [message, setMessage] = useState("Clear road / ready");
  const phaseRef = useRef<TrafficPhase>("idle");
  const laneRef = useRef<Lane>(1);
  const distanceRef = useRef(0);
  const obstacleIdRef = useRef(0);
  phaseRef.current = phase;
  laneRef.current = lane;
  distanceRef.current = distance;

  const reset = useCallback(() => {
    setPhase("idle");
    phaseRef.current = "idle";
    setLane(1);
    laneRef.current = 1;
    setObstacles([]);
    setDistance(0);
    distanceRef.current = 0;
    setReward(0);
    setMessage("Clear road / ready");
  }, []);

  const start = useCallback(() => {
    setPhase("playing");
    phaseRef.current = "playing";
    setLane(1);
    laneRef.current = 1;
    setObstacles([]);
    setDistance(0);
    distanceRef.current = 0;
    setReward(0);
    setMessage("Find the clean line");
  }, []);

  const moveLane = useCallback((next: Lane) => {
    if (phaseRef.current !== "playing") return;
    setLane(next);
    laneRef.current = next;
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const spawn = setInterval(() => {
      obstacleIdRef.current += 1;
      const laneValue = Math.floor(Math.random() * 3) as Lane;
      setObstacles((current) => [...current, { id: obstacleIdRef.current, lane: laneValue, y: -12 }]);
    }, 720);
    return () => clearInterval(spawn);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const move = setInterval(() => {
      setObstacles((current) => {
        let crashed = false;
        const next = current
          .map((obstacle) => ({ ...obstacle, y: obstacle.y + 4.2 }))
          .filter((obstacle) => {
            if (obstacle.y > 78 && obstacle.y < 92 && obstacle.lane === laneRef.current) crashed = true;
            return obstacle.y < 108;
          });
        if (crashed && phaseRef.current === "playing") {
          setPhase("result");
          phaseRef.current = "result";
          const earned = Math.floor(distanceRef.current * 7);
          setReward(earned);
          setMessage(earned ? "You threaded the night." : "Contact. The street wins this pass.");
          if (earned) addBonusMiles(earned);
        }
        return next;
      });
      setDistance((current) => {
        const next = current + 1;
        distanceRef.current = next;
        if (next >= 100 && phaseRef.current === "playing") {
          setPhase("result");
          phaseRef.current = "result";
          const earned = 800;
          setReward(earned);
          setMessage("Run complete. Clean all the way through.");
          addBonusMiles(earned);
        }
        return next;
      });
    }, 90);
    return () => clearInterval(move);
  }, [addBonusMiles, phase]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") { event.preventDefault(); moveLane(Math.max(0, laneRef.current - 1) as Lane); }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") { event.preventDefault(); moveLane(Math.min(2, laneRef.current + 1) as Lane); }
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") { event.preventDefault(); moveLane(1); }
      if (event.code === "Space" && (phaseRef.current === "idle" || phaseRef.current === "result")) { event.preventDefault(); start(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveLane, start]);

  const laneNames = ["left", "center", "right"];
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-[#304056] bg-[#101b2d] shadow-[0_20px_50px_rgba(3,9,20,.22)]">
      <StatusRail label="Traffic run / lane dodging" status={phase === "idle" ? "parked" : phase === "playing" ? "moving" : "run logged"} value={`${distance}m`} />
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[.8fr_1.2fr]">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.22em] text-[#ff7652]"><ShieldAlert size={14} /> Urban survival</div>
            <h2 className="font-mono text-3xl font-black uppercase tracking-[-.06em] text-[#f4f1e8] sm:text-4xl">Traffic Run</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#9eabc0]">The lane changes. Your instincts do not. Dodge traffic for 100 meters using arrows, A/S/D, or the lane pads.</p>
          </div>
          <div className="rounded-xl border border-[#304056] bg-[#0b1423]/70 p-3">
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[.16em] text-[#718099]"><span>Run progress</span><span className="text-[#ff7652]" data-testid="text-traffic-distance">{distance} / 100m</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#26354a]"><div className="h-full bg-[#ff7652] transition-[width] duration-100" style={{ width: `${distance}%` }} /></div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#3f4c62] bg-[#0b1423] p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[.2em] text-[#718099]"><span data-testid="status-traffic-message">{message}</span><span className="text-[#ff7652]" data-testid="text-traffic-lane">lane 0{lane + 1}</span></div>
          <div className="relative h-[280px] overflow-hidden rounded-xl border border-[#304056] bg-[#111c2d]">
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(90deg, transparent 32.8%, rgba(158,171,192,.2) 33%, transparent 33.2%, transparent 66.1%, rgba(158,171,192,.2) 66.3%, transparent 66.5%), repeating-linear-gradient(180deg, transparent 0 34px, rgba(124,231,217,.16) 35px 37px, transparent 38px 72px)" }} />
            <div className="absolute inset-x-0 bottom-4 h-12 border-y border-[#ff7652]/20 bg-[#ff7652]/5" />
            {obstacles.map((obstacle) => (
              <div key={obstacle.id} className="absolute h-11 w-10 rounded-lg border-2 border-[#ff7652]/80 bg-[#ff7652]/20 shadow-[0_0_15px_rgba(255,118,82,.2)] transition-none" style={{ left: `${16.7 + obstacle.lane * 33.3}%`, top: `${obstacle.y}%`, transform: "translateX(-50%)" }} data-testid={`status-traffic-obstacle-${obstacle.id}`}>
                <div className="mx-auto mt-2 h-1.5 w-5 rounded-full bg-[#ff7652]" />
                <div className="mx-auto mt-2 h-1 w-3 rounded-full bg-[#f5b642]" />
              </div>
            ))}
            <div className="absolute bottom-4 transition-[left] duration-100" style={{ left: `${16.7 + lane * 33.3}%`, transform: "translateX(-50%)" }}>
              <div className="h-12 w-9 rounded-lg border-2 border-[#7ce7d9] bg-[#7ce7d9]/20 shadow-[0_0_18px_rgba(124,231,217,.4)]">
                <div className="mx-auto mt-2 h-1.5 w-5 rounded-full bg-[#d5fff8]" />
                <div className="mx-auto mt-2 h-1 w-3 rounded-full bg-[#7ce7d9]" />
              </div>
              <div className="mt-1 text-center font-mono text-[8px] font-bold uppercase tracking-[.15em] text-[#7ce7d9]">you</div>
            </div>
            <div className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[.18em] text-[#718099]">I-09 / wet asphalt</div>
          </div>
          <div className="mt-4 flex gap-2">
            {laneNames.map((name, index) => (
              <button key={name} type="button" data-testid={`button-traffic-lane-${name}`} onPointerDown={(event) => { event.preventDefault(); moveLane(index as Lane); }} className={`flex-1 rounded-xl border py-3 font-mono text-[10px] font-black uppercase tracking-[.16em] transition-all active:scale-95 ${lane === index && phase === "playing" ? "border-[#7ce7d9] bg-[#7ce7d9]/15 text-[#bffff6]" : "border-[#304056] bg-[#121e31] text-[#8d9ab0] hover:border-[#ff7652]/60 hover:text-[#f4f1e8]"}`}>
                {name}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[.15em] text-[#506078]"><span>Arrows / A S D</span><span data-testid="status-traffic-round">{phase === "playing" ? "avoid contact" : phase === "result" ? (reward ? `+${formatNumber(reward)} mi` : "no payout") : "press start"}</span></div>
          <div className="mt-4 flex gap-2">
            {phase !== "playing" && <Button type="button" data-testid="button-traffic-start" onClick={start} className="flex-1 bg-[#ff7652] font-mono text-xs font-black uppercase tracking-[.18em] text-[#1d1720] hover:bg-[#ff9a7f]">{phase === "result" ? "Run it back" : "Start run"}</Button>}
            {phase === "result" && <Button type="button" data-testid="button-traffic-reset" onClick={reset} variant="outline" className="border-[#45546c] font-mono text-xs uppercase tracking-[.16em] text-[#b8c4d6]"><RotateCcw size={14} /> Reset</Button>}
          </div>
          {phase === "result" && <div className={`mt-4 text-center font-mono text-xs font-bold uppercase tracking-[.16em] ${reward ? "text-[#7ce7d9]" : "text-[#ff7652]"}`} data-testid="status-traffic-result">{reward ? `+${formatNumber(reward)} miles banked` : "Run ended on contact"}</div>}
        </div>
      </div>
    </section>
  );
}

export default function Arcade() {
  const [activeGame, setActiveGame] = useState<GameId>("drag");
  return (
    <main className="min-h-[100dvh] bg-[#0b1423] px-3 py-4 text-[#f4f1e8] sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <ArcadeHeader activeGame={activeGame} onSelect={setActiveGame} />
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.2em] text-[#718099]"><Clock3 size={13} className="text-[#f5b642]" /> Pick a cabinet / play for keeps</div>
          <div className="hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[.18em] text-[#506078] sm:flex"><Trophy size={13} /> Wins add miles instantly</div>
        </div>
        {activeGame === "drag" && <DragStrip />}
        {activeGame === "pit" && <PitStop />}
        {activeGame === "traffic" && <TrafficRun />}
        <footer className="flex flex-col gap-2 border-t border-[#304056] px-1 pt-4 font-mono text-[9px] uppercase tracking-[.18em] text-[#506078] sm:flex-row sm:items-center sm:justify-between">
          <span>Arcade protocol / v1.4</span>
          <span className="flex items-center gap-2"><Gauge size={12} /> Input: keyboard + pointer + touch</span>
        </footer>
      </div>
    </main>
  );
}