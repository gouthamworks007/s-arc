"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronRight,
  FastForward,
  Mail,
  MessageSquare,
  Pause,
  Play,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Content & Constants                                                       */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "sarc_maintenance_subscriber";
const EMAIL_RE = /^\S+@\S+\.\S+$/;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

type MaintenanceScreenProps = {
  /** Send the email to your backend / mailing list. Throw to show an error. */
  onSubscribe?: (email: string) => Promise<void> | void;
};

export default function MaintenanceScreen({
  onSubscribe,
}: MaintenanceScreenProps = {}) {
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Returning visitors see their confirmation instead of the form again.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSavedEmail(stored);
    } catch {}
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError("Enter a valid email address, like name@example.com.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      if (onSubscribe) {
        await onSubscribe(value);
      } else {
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value, source: "maintenance" }),
        });
        if (!res.ok) {
          throw new Error("Subscription failed");
        }
      }
    } catch {
      setError("We couldn’t save your email. Check your connection and try again.");
      setSubmitting(false);
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    setSavedEmail(value);
    setSubmitting(false);
  }

  function resetSubscription() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSavedEmail(null);
    setEmail("");
  }

  const focusRing =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper-light";

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#0E1116] text-stone-100 selection:bg-copper selection:text-white">
      {/* Drafting-sheet grid: fine 24px lines, heavier every 120px, faded at the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(173,128,101,0.16) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(173,128,101,0.16) 1px, transparent 1px),
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 60% 40%, #000 20%, transparent 75%)",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 60% 40%, #000 20%, transparent 75%)",
        }}
      />

      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 pt-6 sm:px-8 sm:pt-8">
        <Link
          href="/"
          className={`group flex items-center rounded-lg ${focusRing}`}
          aria-label="S-ARC Southern Architecture, home"
        >
          <div className="relative h-10 w-[140px] sm:h-11 sm:w-[155px]">
            <Image
              src="/logo-white.png"
              alt="S-ARC Southern Architecture"
              fill
              className="object-contain object-left transition-opacity group-hover:opacity-85"
              priority
            />
          </div>
        </Link>

        <p className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-sm text-amber-200">
          <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
          Scheduled upgrade · Resuming shortly
        </p>
      </header>

      {/* Main */}
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-20 lg:py-16">
        {/* Message and actions */}
        <div className="space-y-10">
          <div className="space-y-5">
            <h1 className="max-w-[18ch] font-serif text-4xl font-normal leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              S-ARC is offline while we upgrade it.
            </h1>
            <p className="max-w-[54ch] text-base leading-relaxed text-stone-300 sm:text-lg">
              Southern Architecture is a curated marketplace connecting homeowners across South India
              with COA-verified architects for KMBR-compliant residential plans and CAD packages.
              We&apos;re temporarily paused for platform upgrades—leave your email and we&apos;ll notify
              you as soon as normal service resumes.
            </p>
          </div>

          {/* Notify form */}
          <section aria-labelledby="notify-heading">
            {savedEmail ? (
              <div
                role="status"
                className="flex items-start gap-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-4"
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p id="notify-heading" className="font-medium">
                    You’re on the list.
                  </p>
                  <p className="text-sm text-stone-300">
                    We’ll email <span className="break-all text-stone-100">{savedEmail}</span> as
                    soon as S-ARC reopens.
                  </p>
                  <button
                    type="button"
                    onClick={resetSubscription}
                    className={`rounded text-sm text-emerald-300 underline underline-offset-4 hover:text-emerald-200 ${focusRing}`}
                  >
                    Use a different email
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-2">
                <label htmlFor="notify-email" id="notify-heading" className="block text-base font-medium">
                  Email me when S-ARC is back
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Mail
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                      aria-hidden="true"
                    />
                    <input
                      id="notify-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="name@example.com"
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? "notify-error" : undefined}
                      className={`h-12 w-full rounded-lg border bg-white/5 pl-10 pr-4 text-base text-white placeholder:text-stone-500 ${
                        error ? "border-red-400/70" : "border-white/20"
                      } ${focusRing}`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`inline-flex h-12 items-center justify-center rounded-lg bg-copper px-6 text-base font-medium text-white transition-colors hover:bg-copper-dark disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                  >
                    {submitting ? "Saving…" : "Notify me"}
                  </button>
                </div>
                {error && (
                  <p id="notify-error" role="alert" className="text-sm text-red-300">
                    {error}
                  </p>
                )}
              </form>
            )}
          </section>

          {/* Urgent contact */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <p className="text-sm text-stone-400">Urgent project or permit question?</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/919446077889?text=Hi%20S-ARC%2C%20I%20have%20an%20urgent%20architectural%20inquiry."
                target="_blank"
                rel="noreferrer"
                className={`inline-flex h-11 items-center gap-2 rounded-lg border border-emerald-400/40 px-4 text-sm text-emerald-300 transition-colors hover:bg-emerald-400/10 ${focusRing}`}
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                WhatsApp the studio
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a
                href="mailto:contact@southernarchitecture.in"
                className={`inline-flex min-h-11 items-center gap-2 break-all rounded-lg border border-white/15 px-4 py-2 text-sm text-stone-200 transition-colors hover:border-copper hover:text-white ${focusRing}`}
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                contact@southernarchitecture.in
              </a>
            </div>
          </section>
        </div>

        {/* Interactive building site */}
        <SiteFigure />
      </main>

      {/* Footer */}
      <footer className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 border-t border-white/10 px-5 py-6 text-sm text-stone-400 sm:flex-row sm:items-center sm:px-8">
        <p>© 2026 S-ARC, Southern Architecture</p>
        <Link
          href="/login"
          className={`inline-flex items-center gap-1 rounded transition-colors hover:text-copper-light ${focusRing}`}
        >
          Staff login
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Interactive building site                                                 */
/*                                                                            */
/*  A small simulation drives the crane: fetch a beam, swing it across, seat  */
/*  it in a bay, repeat. After three beams the floor is poured and a          */
/*  topping-out flag goes up, then the site resets and starts again.          */
/*  Visitors can pick which bay is built next, pause, or speed things up.     */
/* -------------------------------------------------------------------------- */

type Phase =
  | "toStack"
  | "lowerLoad"
  | "hoist"
  | "toBay"
  | "lowerPlace"
  | "release"
  | "liftEmpty"
  | "pour"
  | "topOut"
  | "reset";

const COLS = [80, 160, 240, 320]; // column x positions
const BAYS = [126, 206, 286]; // bay centre x (between columns)
const STACK_X = 406; // laydown area x
const HOOK_UP = 60; // hook height when travelling
const SLOT_Y = 100; // top of a seated beam
const GROUND = 296; // top of the laydown pallet
const CRANE_C = 484; // crane centre line

const COPPER = "#AD8065";
const COPPER_LIGHT = "#E7C9B0";
const AMBER = "#F59E0B";
const LINE = "#64748B";
const FAINT = "#334155";

const BUTTON_FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper-light";

// Zig-zag bracing for the crane mast
const MAST_LATTICE = Array.from({ length: 10 }, (_, i) => {
  const y1 = 300 - i * 26;
  const y2 = y1 - 26;
  const [a, b] = i % 2 === 0 ? [CRANE_C - 10, CRANE_C + 10] : [CRANE_C + 10, CRANE_C - 10];
  return `M${a},${y1} L${b},${y2}`;
}).join(" ");

const SPARKS: [number, number][] = [
  [8, -10],
  [3, -15],
  [5, -12],
  [10, -6],
  [11, -3],
  [2, -9],
];

/** Move toward a target at an eased speed, never overshooting. */
function moveToward(
  cur: number,
  target: number,
  vmax: number,
  k: number,
  vmin: number,
  dt: number,
) {
  const d = target - cur;
  const dist = Math.abs(d);
  if (dist < 0.5) return target;
  const v = Math.min(vmax, Math.max(vmin, dist * k));
  return cur + Math.sign(d) * Math.min(dist, v * dt);
}

function SiteFigure() {
  const [paused, setPaused] = useState(false);
  const [fast, setFast] = useState(false);
  const [placed, setPlaced] = useState<boolean[]>([false, false, false]);
  const [stack, setStack] = useState(3);
  const [carrying, setCarrying] = useState(false);
  const [target, setTarget] = useState<number | null>(null);
  const [next, setNext] = useState<number | null>(null);
  const [pourOn, setPourOn] = useState(false);
  const [topped, setTopped] = useState(false);
  const [fading, setFading] = useState(false);
  const [spark, setSpark] = useState<{ bay: number; n: number } | null>(null);
  const [status, setStatus] = useState("Fetching steel");

  // Mutable simulation state lives in a ref so the animation loop never re-renders per frame.
  const sim = useRef({
    phase: "toStack" as Phase,
    d: 0,
    x: 300,
    vx: 0,
    hook: HOOK_UP,
    sway: 0,
    swayV: 0,
    bay: 0,
    placed: [false, false, false] as boolean[],
    stack: 3,
    queued: null as number | null,
    speed: 1,
    sparkN: 0,
  });

  const trolleyRef = useRef<SVGGElement>(null);
  const swayRef = useRef<SVGGElement>(null);
  const cableRef = useRef<SVGLineElement>(null);
  const loadRef = useRef<SVGGElement>(null);

  useEffect(() => {
    sim.current.speed = fast ? 2.2 : 1;
  }, [fast]);

  // Reduced motion: show the finished floor and wait for the visitor to press Play.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const s = sim.current;
      s.placed = [true, true, true];
      s.stack = 0;
      s.phase = "topOut";
      s.d = 0;
      setPlaced([true, true, true]);
      setStack(0);
      setPourOn(true);
      setTopped(true);
      setStatus("Topped out");
      setPaused(true);
    }
  }, []);

  // The simulation loop. Stops completely while paused.
  useEffect(() => {
    if (paused) return;
    const s = sim.current;
    let raf = 0;
    let last = performance.now();

    const pickBay = () => {
      const free = [0, 1, 2].filter((i) => !s.placed[i]);
      s.bay =
        s.queued !== null && !s.placed[s.queued] ? s.queued : (free[0] ?? 0);
      s.queued = null;
      setNext(null);
      setTarget(s.bay);
    };

    const go = (p: Phase) => {
      s.phase = p;
      s.d = 0;
      switch (p) {
        case "toStack":
          setStatus("Fetching steel");
          break;
        case "lowerLoad":
          setStatus("Hooking beam");
          break;
        case "hoist":
          setStatus("Lifting beam");
          break;
        case "toBay":
          setStatus(`Moving to bay ${s.bay + 1}`);
          break;
        case "lowerPlace":
          setStatus("Setting beam");
          break;
        case "release":
          s.placed[s.bay] = true;
          setPlaced([...s.placed]);
          setCarrying(false);
          setTarget(null);
          setSpark({ bay: s.bay, n: ++s.sparkN });
          setStatus("Beam secured");
          break;
        case "pour":
          setPourOn(true);
          setStatus("Pouring floor");
          break;
        case "topOut":
          setTopped(true);
          setStatus("Topped out");
          break;
        case "reset":
          setFading(true);
          setStatus("Starting next floor");
          break;
        default:
          break;
      }
    };

    const step = (dt: number) => {
      s.vx = 0;

      const moveX = (tx: number) => {
        const prev = s.x;
        s.x = moveToward(s.x, tx, 130, 2.2, 16, dt);
        s.vx = (s.x - prev) / Math.max(dt, 1e-3);
        return Math.abs(s.x - tx) < 0.5;
      };
      const moveHook = (ty: number) => {
        s.hook = moveToward(s.hook, ty, 80, 3, 14, dt);
        return Math.abs(s.hook - ty) < 0.5;
      };
      const dwell = (sec: number) => {
        s.d += dt;
        return s.d >= sec;
      };

      switch (s.phase) {
        case "toStack": {
          const a = moveX(STACK_X);
          const b = moveHook(HOOK_UP);
          if (a && b) go("lowerLoad");
          break;
        }
        case "lowerLoad": {
          if (moveHook(GROUND - 7 * s.stack - 8) && dwell(0.35)) {
            s.stack -= 1;
            setStack(s.stack);
            setCarrying(true);
            pickBay();
            go("hoist");
          }
          break;
        }
        case "hoist": {
          const up = moveHook(HOOK_UP);
          if (s.hook < 78) moveX(BAYS[s.bay]); // only swing once the beam clears the structure
          if (up) go("toBay");
          break;
        }
        case "toBay": {
          moveHook(HOOK_UP);
          if (moveX(BAYS[s.bay])) go("lowerPlace");
          break;
        }
        case "lowerPlace": {
          moveX(BAYS[s.bay]);
          if (moveHook(SLOT_Y - 8)) {
            // Wait for the swinging load to settle before releasing.
            s.d += dt;
            if (Math.abs(s.sway) < 0.7 || s.d > 2) go("release");
          }
          break;
        }
        case "release": {
          if (dwell(0.45)) go("liftEmpty");
          break;
        }
        case "liftEmpty": {
          const up = moveHook(HOOK_UP);
          if (s.hook < 78) moveX(STACK_X);
          if (up) go(s.placed.every(Boolean) ? "pour" : "toStack");
          break;
        }
        case "pour": {
          moveX(STACK_X);
          if (dwell(2.8)) go("topOut");
          break;
        }
        case "topOut": {
          if (dwell(3.4)) go("reset");
          break;
        }
        case "reset": {
          if (dwell(0.9)) {
            s.placed = [false, false, false];
            s.stack = 3;
            s.queued = null;
            s.bay = 0;
            setPlaced([false, false, false]);
            setStack(3);
            setPourOn(false);
            setTopped(false);
            setFading(false);
            setTarget(null);
            setNext(null);
            go("toStack");
          }
          break;
        }
      }

      // Pendulum: the hanging load lags behind the trolley, then rings down.
      const lean = Math.max(-7, Math.min(7, s.vx * 0.045));
      s.swayV += ((lean - s.sway) * 40 - s.swayV * 5) * dt;
      s.sway += s.swayV * dt;
    };

    const apply = () => {
      trolleyRef.current?.setAttribute("transform", `translate(${s.x.toFixed(2)} 0)`);
      swayRef.current?.setAttribute("transform", `rotate(${s.sway.toFixed(2)} 0 41)`);
      cableRef.current?.setAttribute("y2", s.hook.toFixed(2));
      loadRef.current?.setAttribute("transform", `translate(0 ${s.hook.toFixed(2)})`);
    };

    const tick = (now: number) => {
      const raw = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(raw * s.speed);
      apply();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  /** Visitor picks which bay the crane builds next. */
  const requestBay = (b: number) => {
    const s = sim.current;
    if (s.placed[b]) return;
    if (s.phase === "hoist" || s.phase === "toBay") {
      // Already carrying a beam: redirect it right now.
      s.bay = b;
      s.queued = null;
      setNext(null);
      setTarget(b);
      setStatus(`Moving to bay ${b + 1}`);
    } else {
      s.queued = b;
      setNext(b);
    }
    if (paused) setPaused(false);
  };

  return (
    <figure className="mx-auto w-full max-w-xl rounded-sm border border-white/15 bg-[#0E1116]/70 backdrop-blur-sm">
      <div className="p-4 sm:p-6">
        <svg
          viewBox="0 0 560 340"
          role="group"
          aria-label="Interactive illustration of a tower crane building a three-storey structure. Choose an empty bay to decide where the next beam goes."
          className="sarc-scene block h-auto w-full select-none touch-manipulation"
          data-paused={paused}
          fill="none"
        >
          <style>{`
            .sarc-slot { cursor: pointer; outline: none; }
            .sarc-slot:hover .sarc-slot-box { stroke: ${COPPER_LIGHT}; fill: rgba(173,128,101,0.25); }
            .sarc-slot:focus-visible .sarc-slot-hit { stroke: ${COPPER_LIGHT}; stroke-dasharray: 4 3; }

            .sarc-plus { animation: sarc-pulse 2.4s ease-in-out infinite; }
            .sarc-beacon { animation: sarc-blink 1.6s ease-in-out infinite; }
            .sarc-flag { transform-origin: 206px 70px; animation: sarc-wave 1.1s ease-in-out infinite alternate; }

            .sarc-walk-a { animation: sarc-walk 34s linear infinite; --d: 200px; }
            .sarc-walk-b { animation: sarc-walk 42s linear infinite -14s; --d: 230px; }
            .sarc-leg { transform-origin: 0px -5px; animation: sarc-step 0.55s ease-in-out infinite alternate; }
            .sarc-leg-b { animation-direction: alternate-reverse; }

            .sarc-seat { animation: sarc-seat 0.35s ease-out; }
            .sarc-flash { transform-box: fill-box; transform-origin: center; animation: sarc-flash 0.5s ease-out forwards; }
            .sarc-spark { animation: sarc-spark 0.75s ease-out forwards; }

            .sarc-scene[data-paused="true"] .sarc-amb { animation-play-state: paused !important; }

            @keyframes sarc-pulse { 0%,100% { opacity: 0.45; } 50% { opacity: 1; } }
            @keyframes sarc-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.15; } }
            @keyframes sarc-wave { from { transform: skewY(-6deg) scaleX(1); } to { transform: skewY(6deg) scaleX(0.9); } }
            @keyframes sarc-step { from { transform: rotate(-28deg); } to { transform: rotate(28deg); } }
            @keyframes sarc-walk {
              0%   { transform: translateX(0) scaleX(1); }
              46%  { transform: translateX(var(--d)) scaleX(1); }
              50%  { transform: translateX(var(--d)) scaleX(-1); }
              96%  { transform: translateX(0) scaleX(-1); }
              100% { transform: translateX(0) scaleX(1); }
            }
            @keyframes sarc-seat { from { transform: translateY(-3px); opacity: 0.6; } to { transform: none; opacity: 1; } }
            @keyframes sarc-flash { from { opacity: 0.9; transform: scale(0.3); } to { opacity: 0; transform: scale(2.2); } }
            @keyframes sarc-spark {
              0%   { opacity: 1; transform: translate(0, 0); }
              60%  { opacity: 1; transform: translate(var(--dx), var(--dy)); }
              100% { opacity: 0; transform: translate(calc(var(--dx) * 1.4), calc(var(--dy) * 0.2 + 14px)); }
            }

            @media (prefers-reduced-motion: reduce) {
              .sarc-amb, .sarc-seat { animation: none !important; }
              .sarc-fx { display: none; }
              .sarc-trans { transition: none !important; }
            }
          `}</style>

          <defs>
            <pattern
              id="sarc-hatch"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Ground */}
          <line x1="10" y1="300" x2="550" y2="300" stroke={LINE} strokeWidth="1.5" />
          <rect x="10" y="300" width="540" height="10" fill="url(#sarc-hatch)" />

          {/* Footings */}
          {COLS.map((x) => (
            <rect key={`f${x}`} x={x - 6} y="292" width="24" height="8" fill="#1E293B" stroke={LINE} />
          ))}

          {/* Floor 1: built */}
          <rect x="86" y="230" width="240" height="62" fill="rgba(30,41,59,0.45)" stroke={FAINT} />
          {COLS.map((x) => (
            <rect key={`c1${x}`} x={x} y="230" width="12" height="62" fill="#334155" stroke={LINE} />
          ))}
          <rect x="62" y="224" width="286" height="6" fill="#475569" stroke="#94A3B8" />

          {/* Floor 2: framed */}
          {COLS.map((x) => (
            <rect key={`c2${x}`} x={x} y="160" width="12" height="64" fill="#1E293B" stroke={LINE} />
          ))}
          <rect x="62" y="154" width="286" height="6" fill="#334155" stroke={LINE} />

          {/* Scaffolding */}
          <g stroke="#94A3B8" strokeWidth="1" opacity="0.7">
            <line x1="40" y1="300" x2="40" y2="130" />
            <line x1="58" y1="300" x2="58" y2="130" />
            {[300, 230].map((y, i) => {
              const next = [300, 230, 160][i + 1];
              return (
                <g key={`b${y}`}>
                  <line x1="40" y1={y} x2="58" y2={next} />
                  <line x1="58" y1={y} x2="40" y2={next} />
                </g>
              );
            })}
            {[230, 160].map((y) => (
              <line key={`p${y}`} x1="36" y1={y} x2="62" y2={y} stroke={AMBER} strokeWidth="2" />
            ))}
          </g>

          {/* Floor 3 + laydown yard: this group fades out and back in on reset */}
          <g className="sarc-trans" style={{ opacity: fading ? 0 : 1, transition: "opacity 0.8s ease" }}>
            <rect x="70" y="96" width="270" height="58" stroke={FAINT} strokeDasharray="4 4" />

            {/* Rebar */}
            {COLS.map((x) => {
              const cx = x + 6;
              return (
                <g key={`r${x}`} stroke={COPPER}>
                  <line x1={cx} y1="154" x2={cx} y2="104" strokeWidth="2.5" />
                  <line x1={cx - 3} y1="154" x2={cx - 3} y2="110" strokeWidth="1.5" />
                  <line x1={cx + 3} y1="154" x2={cx + 3} y2="110" strokeWidth="1.5" />
                </g>
              );
            })}

            {/* Concrete pour: columns rise, then the roof slab spreads across */}
            {COLS.map((x, i) => (
              <rect
                key={`p${x}`}
                className="sarc-trans"
                x={x}
                y="100"
                width="12"
                height="54"
                fill="#475569"
                fillOpacity="0.92"
                stroke={LINE}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "50% 100%",
                  transform: pourOn ? "scaleY(1)" : "scaleY(0)",
                  transition: pourOn
                    ? `transform 1.4s cubic-bezier(.2,.7,.2,1) ${i * 0.15}s`
                    : "none",
                }}
              />
            ))}
            <rect
              className="sarc-trans"
              x="62"
              y="94"
              width="286"
              height="6"
              fill="#475569"
              stroke="#94A3B8"
              style={{
                transformBox: "fill-box",
                transformOrigin: "0% 50%",
                transform: pourOn ? "scaleX(1)" : "scaleX(0)",
                transition: pourOn ? "transform 1.2s ease-out 1.1s" : "none",
              }}
            />

            {/* Topping-out flag */}
            <g
              className="sarc-trans"
              style={{
                opacity: topped ? 1 : 0,
                transform: topped ? "translateY(0)" : "translateY(26px)",
                transition: topped
                  ? "transform 1.4s cubic-bezier(.2,.8,.2,1) 0.2s, opacity 0.3s"
                  : "none",
              }}
            >
              <line x1="206" y1="94" x2="206" y2="64" stroke="#CBD5E1" strokeWidth="1.2" />
              <polygon className="sarc-amb sarc-flag" points="206,64 228,70 206,76" fill={AMBER} />
            </g>

            {/* Empty bays: choose where the next beam goes */}
            {BAYS.map((cx, i) => {
              if (placed[i]) return null;
              const isTarget = target === i;
              const isNext = next === i;
              return (
                <g
                  key={`slot${i}`}
                  className="sarc-slot"
                  role="button"
                  tabIndex={0}
                  aria-label={`Build the next beam in bay ${i + 1}`}
                  onClick={() => requestBay(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      requestBay(i);
                    }
                  }}
                >
                  <rect className="sarc-slot-hit" x={cx - 34} y="94" width="68" height="60" fill="transparent" />
                  <rect
                    className="sarc-slot-box"
                    x={cx - 32}
                    y={SLOT_Y}
                    width="64"
                    height="7"
                    rx="1"
                    fill={isTarget ? "rgba(173,128,101,0.2)" : "none"}
                    stroke={isTarget || isNext ? COPPER_LIGHT : COPPER}
                    strokeWidth={isTarget || isNext ? 1.6 : 1}
                    strokeDasharray={isTarget ? undefined : "3 3"}
                  />
                  <g className="sarc-amb sarc-plus" stroke={COPPER} strokeWidth="1.5" strokeLinecap="round">
                    <line x1={cx - 5} y1="128" x2={cx + 5} y2="128" />
                    <line x1={cx} y1="123" x2={cx} y2="133" />
                  </g>
                  {isNext && (
                    <text x={cx} y="146" fill={COPPER_LIGHT} fontSize="10" textAnchor="middle">
                      next
                    </text>
                  )}
                </g>
              );
            })}

            {/* Seated beams */}
            {placed.map((p, i) =>
              p ? (
                <g key={`beam${i}`} className="sarc-seat">
                  <rect x={BAYS[i] - 32} y={SLOT_Y} width="64" height="7" rx="1" fill={COPPER} stroke="#E7E5E4" strokeWidth="0.8" />
                  <circle cx={BAYS[i] - 28} cy={SLOT_Y + 3.5} r="1" fill="#E7E5E4" />
                  <circle cx={BAYS[i] + 28} cy={SLOT_Y + 3.5} r="1" fill="#E7E5E4" />
                </g>
              ) : null,
            )}

            {/* Laydown yard: pallet and stacked beams */}
            <rect x={STACK_X - 38} y={GROUND} width="76" height="4" fill="#475569" />
            <rect x={STACK_X - 30} y={GROUND + 4} width="8" height="0" />
            {Array.from({ length: stack }, (_, k) => (
              <rect
                key={`s${k}`}
                x={STACK_X - 32}
                y={GROUND - 7 * (k + 1)}
                width="64"
                height="7"
                rx="1"
                fill={COPPER}
                stroke="#E7E5E4"
                strokeWidth="0.8"
              />
            ))}
          </g>

          {/* Workers: one on the second-floor slab, one on the ground */}
          <g transform="translate(78 154)">
            <Worker className="sarc-amb sarc-walk-a" />
          </g>
          <g transform="translate(100 300)">
            <Worker className="sarc-amb sarc-walk-b" />
          </g>

          {/* Tower crane */}
          <g>
            <line x1={CRANE_C - 10} y1="300" x2={CRANE_C - 10} y2="40" stroke={AMBER} strokeWidth="2.5" />
            <line x1={CRANE_C + 10} y1="300" x2={CRANE_C + 10} y2="40" stroke={AMBER} strokeWidth="2.5" />
            <path d={MAST_LATTICE} stroke={AMBER} strokeWidth="1.25" opacity="0.8" />

            <rect x={CRANE_C - 14} y="38" width="18" height="14" rx="2" fill="#1E293B" stroke={AMBER} />
            <rect x={CRANE_C - 12} y="41" width="7" height="8" fill="#38BDF8" opacity="0.7" />
            <polygon points={`${CRANE_C},10 ${CRANE_C - 14},34 ${CRANE_C + 14},34`} fill="#B45309" stroke={AMBER} />
            <circle className="sarc-amb sarc-beacon" cx={CRANE_C} cy="9" r="2.5" fill="#EF4444" />

            {/* Jib and counter-jib */}
            <line x1={CRANE_C} y1="34" x2="150" y2="34" stroke={AMBER} strokeWidth="3" />
            <line x1={CRANE_C} y1="10" x2="340" y2="34" stroke="#94A3B8" strokeWidth="1.25" />
            <line x1={CRANE_C} y1="10" x2="420" y2="34" stroke="#94A3B8" strokeWidth="1.25" />
            <line x1={CRANE_C} y1="34" x2={CRANE_C + 58} y2="34" stroke={AMBER} strokeWidth="3" />
            <line x1={CRANE_C} y1="10" x2={CRANE_C + 52} y2="34" stroke="#94A3B8" strokeWidth="1.25" />
            <rect x={CRANE_C + 42} y="34" width="18" height="12" fill="#334155" stroke="#CBD5E1" />

            {/* Trolley, swaying cable and load: moved by the simulation, not CSS */}
            <g ref={trolleyRef} transform="translate(300 0)">
              <rect x="-8" y="34" width="16" height="7" rx="1" fill="#B45309" stroke={AMBER} />
              <g ref={swayRef} transform="rotate(0 0 41)">
                <line ref={cableRef} x1="0" y1="41" x2="0" y2={HOOK_UP} stroke="#CBD5E1" strokeWidth="1" />
                <g ref={loadRef} transform={`translate(0 ${HOOK_UP})`}>
                  <rect x="-3" y="-2" width="6" height="5" rx="1" fill="#B45309" stroke={AMBER} />
                  {carrying ? (
                    <g>
                      <line x1="0" y1="3" x2="-30" y2="8" stroke="#94A3B8" strokeWidth="0.8" />
                      <line x1="0" y1="3" x2="30" y2="8" stroke="#94A3B8" strokeWidth="0.8" />
                      <rect x="-32" y="8" width="64" height="7" rx="1" fill={COPPER} stroke="#E7E5E4" strokeWidth="0.8" />
                    </g>
                  ) : (
                    <path d="M0,3 v3 a2.4,2.4 0 1 1 -2.4,2.4" stroke={AMBER} strokeWidth="1.4" fill="none" />
                  )}
                </g>
              </g>
            </g>
          </g>

          {/* Weld sparks where a beam is seated */}
          {spark && (
            <g key={spark.n}>
              {[-32, 32].map((dx, k) => (
                <g key={k} transform={`translate(${BAYS[spark.bay] + dx} ${SLOT_Y + 3})`}>
                  <circle className="sarc-flash sarc-fx" r="5" fill="#FDE68A" />
                  {SPARKS.map(([vx, vy], j) => (
                    <circle
                      key={j}
                      className="sarc-spark sarc-fx"
                      r="1.3"
                      fill="#FBBF24"
                      style={
                        {
                          "--dx": `${(k === 0 ? -1 : 1) * vx}px`,
                          "--dy": `${vy}px`,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </g>
              ))}
            </g>
          )}

          {/* Plot width dimension */}
          <g stroke={COPPER} strokeWidth="1">
            <line x1="70" y1="326" x2="340" y2="326" />
            <line x1="70" y1="321" x2="70" y2="331" />
            <line x1="340" y1="321" x2="340" y2="331" />
          </g>
          <text x="205" y="321" fill={COPPER} fontSize="11" fontFamily="ui-monospace, monospace" textAnchor="middle">
            18.25 m
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 px-4 py-3 sm:px-6">
        <p className="text-sm text-stone-400">
          Pick an empty bay to choose where the crane builds next.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className={`inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-sm text-stone-200 transition-colors hover:border-copper hover:text-white ${BUTTON_FOCUS}`}
          >
            {paused ? (
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {paused ? "Play" : "Pause"}
          </button>
          <button
            type="button"
            onClick={() => setFast((f) => !f)}
            aria-pressed={fast}
            aria-label="Fast forward"
            className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors hover:border-copper hover:text-white ${
              fast
                ? "border-copper bg-copper/20 text-white"
                : "border-white/15 text-stone-200"
            } ${BUTTON_FOCUS}`}
          >
            <FastForward className="h-3.5 w-3.5" aria-hidden="true" />
            2×
          </button>
        </div>
      </div>

      <figcaption className="grid grid-cols-3 divide-x divide-white/15 border-t border-white/15 text-sm">
        <div className="p-3 sm:px-4">
          <p className="text-xs text-stone-400">Project</p>
          <p className="text-stone-100">Platform upgrade</p>
        </div>
        <div className="min-w-0 p-3 sm:px-4">
          <p className="text-xs text-stone-400">Status</p>
          <p className="truncate text-stone-100">{status}</p>
        </div>
        <div className="p-3 sm:px-4">
          <p className="text-xs text-stone-400">Location</p>
          <p className="text-stone-100">Kochi, Kerala</p>
        </div>
      </figcaption>
    </figure>
  );
}

/** A small site worker, drawn with feet at the origin. Pass an animation class to make it walk. */
function Worker({ className }: { className: string }) {
  return (
    <g className={className}>
      <rect className="sarc-amb sarc-leg" x="-1.6" y="-5" width="1.2" height="5" fill="#94A3B8" />
      <rect className="sarc-amb sarc-leg sarc-leg-b" x="0.4" y="-5" width="1.2" height="5" fill="#94A3B8" />
      <rect x="-2" y="-11" width="4" height="6.5" rx="1" fill={COPPER_LIGHT} />
      <circle cx="0" cy="-13" r="1.9" fill="#D6D3D1" />
      <path d="M-2.6,-13.4 a2.6,2.3 0 0 1 5.2,0 z" fill="#FBBF24" />
    </g>
  );
}
