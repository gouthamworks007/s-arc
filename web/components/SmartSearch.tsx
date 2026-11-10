"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Compass } from "lucide-react";
import {
  motion,
  MotionConfig,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

interface SmartSearchProps {
  onSearch: (params: {
    location: string;
    plotSize: string;
    shape: string;
    direction: string;
  }) => void;
}

type Side = "N" | "E" | "S" | "W";
type Pt = [number, number];

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const PLOT_SIZES = [
  { label: "5 cents", tick: "5", sqft: 2178, plus: false, w: 35, l: 62, builtUp: "1,200 – 1,400", value: "5 Cents / 1,200 Sq.Ft" },
  { label: "8 cents", tick: "8", sqft: 3485, plus: false, w: 42, l: 83, builtUp: "1,800 – 2,200", value: "8 Cents / 1,900 Sq.Ft" },
  { label: "10 cents", tick: "10", sqft: 4356, plus: false, w: 48, l: 90, builtUp: "2,400 – 2,800", value: "10 Cents / 2,400 Sq.Ft" },
  { label: "12 cents", tick: "12", sqft: 5227, plus: false, w: 55, l: 95, builtUp: "2,900 – 3,400", value: "12 Cents / 2,900 Sq.Ft" },
  { label: "15 cents", tick: "15", sqft: 6534, plus: false, w: 65, l: 100, builtUp: "3,600 – 4,200", value: "15 Cents / 3,600 Sq.Ft" },
  { label: "20+ cents", tick: "20+", sqft: 8712, plus: true, w: 80, l: 110, builtUp: "4,800 – 6,500", value: "20+ Cents / 5,000+ Sq.Ft" },
];

const PLOT_SHAPES = [
  { id: "Rectangular", label: "Rectangle", desc: "Standard 1:1.5 ratio" },
  { id: "Square", label: "Square", desc: "Balanced 1:1 footprint" },
  { id: "Corner Plot", label: "Corner", desc: "Roads on two sides" },
  { id: "Narrow Frontage", label: "Narrow", desc: "Narrow and deep, built around a courtyard" },
  { id: "Sloped / Contour", label: "Sloped", desc: "Multi-level hillside" },
];

const ROAD_DIRECTIONS: { id: string; label: string; side: Side; hint: string }[] = [
  { id: "North Facing", label: "North", side: "N", hint: "Vaastu compliant" },
  { id: "East Facing", label: "East", side: "E", hint: "Morning sun" },
  { id: "South Facing", label: "South", side: "S", hint: "Cooling breeze" },
  { id: "West Facing", label: "West", side: "W", hint: "Sunset horizon" },
];

const LOCATIONS = [
  "Kochi, Kerala",
  "Trivandrum, Kerala",
  "Calicut, Kerala",
  "Thrissur, Kerala",
  "Kottayam, Kerala",
  "Kannur, Kerala",
  "Palakkad, Kerala",
  "Malappuram, Kerala",
  "Bengaluru, Karnataka",
  "Chennai, Tamil Nadu",
  "Coimbatore, Tamil Nadu",
];

/* -------------------------------------------------------------------------- */
/*  Plot geometry                                                             */
/* -------------------------------------------------------------------------- */

const CX = 130;
const CY = 130;
const MAX_SCALE = 1.36; // px per ft, so bigger plots visibly grow

// Illustrative setbacks (ft) used only for the diagram and footprint estimate.
const FRONT_SETBACK_FT = 10;
const SIDE_SETBACK_FT = 4;
const CORNER_CUT_FT = 14;

const NEXT_SIDE: Record<Side, Side> = { N: "E", E: "S", S: "W", W: "N" };
const CORNER_INDEX: Record<Side, number> = { N: 1, E: 2, S: 3, W: 0 };
const SIDE_NAME: Record<Side, string> = { N: "north", E: "east", S: "south", W: "west" };

const ROADS: Record<
  Side,
  {
    line: { x1: number; y1: number; x2: number; y2: number };
    hit: { x: number; y: number; width: number; height: number };
    text: { x: number; y: number; rotate: number };
  }
> = {
  N: { line: { x1: 20, y1: 20, x2: 240, y2: 20 }, hit: { x: 16, y: 8, width: 228, height: 24 }, text: { x: 130, y: 12, rotate: 0 } },
  E: { line: { x1: 240, y1: 20, x2: 240, y2: 240 }, hit: { x: 228, y: 16, width: 24, height: 228 }, text: { x: 251, y: 130, rotate: 90 } },
  S: { line: { x1: 20, y1: 240, x2: 240, y2: 240 }, hit: { x: 16, y: 228, width: 228, height: 24 }, text: { x: 130, y: 254, rotate: 0 } },
  W: { line: { x1: 20, y1: 20, x2: 20, y2: 240 }, hit: { x: 8, y: 16, width: 24, height: 228 }, text: { x: 9, y: 130, rotate: -90 } },
};

function outline(left: number, top: number, right: number, bottom: number, c: number[]): Pt[] {
  return [
    [left, top + c[0]], [left + c[0], top],
    [right - c[1], top], [right, top + c[1]],
    [right, bottom - c[2]], [right - c[2], bottom],
    [left + c[3], bottom], [left, bottom - c[3]],
  ];
}

function polygonArea(pts: Pt[]) {
  let a = 0;
  pts.forEach(([x1, y1], i) => {
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  });
  return Math.abs(a / 2);
}

function toPath(pts: Pt[], scale: number) {
  return (
    pts
      .map(([x, y], i) => `${i ? "L" : "M"}${(CX + x * scale).toFixed(1)},${(CY + y * scale).toFixed(1)}`)
      .join(" ") + " Z"
  );
}

interface PlotDimensionsInput {
  w: number;
  l: number;
}

function buildModel(dims: PlotDimensionsInput, shapeId: string, side: Side) {
  let w = dims.w;
  let l = dims.l;
  if (shapeId === "Square") w = l = Math.sqrt(dims.w * dims.l);
  if (shapeId === "Narrow Frontage") {
    w = dims.w * 0.7;
    l = (dims.w * dims.l) / w;
  }

  const isCorner = shapeId === "Corner Plot";
  const secondRoad: Side | null = isCorner ? NEXT_SIDE[side] : null;
  const inset = (s: Side) => (s === side || s === secondRoad ? FRONT_SETBACK_FT : SIDE_SETBACK_FT);

  const hw = w / 2;
  const hl = l / 2;
  const cut = isCorner ? Math.min(CORNER_CUT_FT, w / 3, l / 3) : 0;
  const plotCuts = [0, 0, 0, 0];
  plotCuts[CORNER_INDEX[side]] = cut;

  const bl = -hw + inset("W");
  const br = hw - inset("E");
  const bt = -hl + inset("N");
  const bb = hl - inset("S");
  const bCut = cut ? Math.min(cut + 4, (br - bl) / 3, (bb - bt) / 3) : 0;
  const buildCuts = [0, 0, 0, 0];
  buildCuts[CORNER_INDEX[side]] = bCut;

  const scale = Math.min(MAX_SCALE, 168 / Math.max(w, l));
  const buildPts = outline(bl, bt, br, bb, buildCuts);

  const contours = [0.25, 0.5, 0.75].map((f) => {
    const y = CY + (-hl + l * f) * scale;
    const xl = CX - hw * scale;
    const xr = CX + hw * scale;
    return `M${xl.toFixed(1)},${y.toFixed(1)} Q${CX},${(y - 9).toFixed(1)} ${xr.toFixed(1)},${(y + 4).toFixed(1)}`;
  });

  return {
    w,
    l,
    hw,
    hl,
    scale,
    secondRoad,
    contours,
    footprint: polygonArea(buildPts),
    plotD: toPath(outline(-hw, -hl, hw, hl, plotCuts), scale),
    buildD: toPath(buildPts, scale),
  };
}

type Model = ReturnType<typeof buildModel>;

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

function ShapeGlyph({ id }: { id: string }) {
  const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      {id === "Rectangular" && <rect x="4" y="7" width="16" height="10" rx="1" {...line} />}
      {id === "Square" && <rect x="6" y="6" width="12" height="12" rx="1" {...line} />}
      {id === "Corner Plot" && <path d="M4 5h11l5 5v9H4z" {...line} />}
      {id === "Narrow Frontage" && <rect x="8" y="3" width="8" height="18" rx="1" {...line} />}
      {id === "Sloped / Contour" && (
        <>
          <rect x="4" y="5" width="16" height="14" rx="1" {...line} />
          <path d="M4 10c5-3 10-1 16-1M4 15c5-3 10-1 16-1" {...line} strokeWidth={1} />
        </>
      )}
    </svg>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const spring = useSpring(value, { stiffness: 140, damping: 22 });
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString("en-IN"));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  if (reduce) return <span>{Math.round(value).toLocaleString("en-IN")}</span>;
  return <motion.span>{text}</motion.span>;
}

function PlotDiagram({
  model,
  side,
  onPickSide,
  label,
  sloped,
}: {
  model: Model;
  side: Side;
  onPickSide: (s: Side) => void;
  label: string;
  sloped: boolean;
}) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const move = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 170, damping: 22 };

  const topLabel = { x: CX, y: CY - model.hl * model.scale - 7 };
  const leftLabel = { x: CX - model.hw * model.scale - 7, y: CY };

  return (
    <svg viewBox="0 0 260 260" className="w-full h-full" fill="none" role="group" aria-label={label}>
      <defs>
        <pattern id={`grid-${uid}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#E5E2DC" strokeWidth="0.7" />
        </pattern>
        <pattern id={`hatch-${uid}`} width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#AD8065" strokeWidth="1" strokeOpacity="0.3" />
        </pattern>
      </defs>

      <rect width="260" height="260" fill={`url(#grid-${uid})`} rx="12" />

      {/* Roads: click or press Enter on any edge to put the road there */}
      {(Object.keys(ROADS) as Side[]).map((s) => {
        const g = ROADS[s];
        const main = s === side;
        const second = s === model.secondRoad;
        const active = main || second;
        return (
          <g
            key={s}
            role="button"
            tabIndex={0}
            aria-label={`Put the road on the ${SIDE_NAME[s]} side`}
            aria-pressed={main}
            onClick={() => onPickSide(s)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPickSide(s);
              }
            }}
            className="group cursor-pointer outline-none"
          >
            <rect
              {...g.hit}
              rx="6"
              strokeWidth="1.5"
              className="fill-transparent stroke-transparent group-focus-visible:stroke-[#AD8065]"
            />
            <line
              {...g.line}
              stroke={active ? "#171717" : "#D1CDC7"}
              strokeOpacity={main ? 0.8 : second ? 0.4 : 1}
              strokeWidth={active ? 5 : 3}
              strokeDasharray={active ? undefined : "5 4"}
              strokeLinecap="round"
              className={active ? "" : "transition-colors group-hover:stroke-[#171717]"}
            />
            <text
              x={g.text.x}
              y={g.text.y}
              transform={g.text.rotate ? `rotate(${g.text.rotate} ${g.text.x} ${g.text.y})` : undefined}
              fontSize="7.5"
              textAnchor="middle"
              fill="#777777"
              fontFamily="monospace"
              className={active ? "" : "opacity-0 transition-opacity group-hover:opacity-100"}
            >
              {main ? "Main road" : second ? "Side road" : "Road here"}
            </text>
          </g>
        );
      })}

      {/* Plot boundary */}
      <motion.path
        initial={false}
        animate={{ d: model.plotD }}
        transition={move}
        fill="#FFFFFF"
        stroke="#171717"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Contour lines (sloped plots only) */}
      {model.contours.map((d, i) => (
        <motion.path
          key={i}
          initial={false}
          animate={{ d, opacity: sloped ? 1 : 0 }}
          transition={move}
          stroke="#AD8065"
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />
      ))}

      {/* Buildable zone */}
      <motion.path
        initial={false}
        animate={{ d: model.buildD }}
        transition={move}
        fill={`url(#hatch-${uid})`}
        stroke="#AD8065"
        strokeWidth="1.4"
        strokeDasharray="4 3"
        strokeLinejoin="round"
      />

      {/* Dimensions */}
      <motion.g initial={false} animate={topLabel} transition={move}>
        <text fontSize="8" fill="#777777" textAnchor="middle" fontFamily="monospace">
          {Math.round(model.w)} ft
        </text>
      </motion.g>
      <motion.g initial={false} animate={leftLabel} transition={move}>
        <text fontSize="8" fill="#777777" textAnchor="middle" fontFamily="monospace" transform="rotate(-90)">
          {Math.round(model.l)} ft
        </text>
      </motion.g>

      {/* North is always up */}
      <g transform="translate(38 46)" aria-hidden="true">
        <path d="M0,-9 L4,2 L0,0 L-4,2 Z" fill="#AD8065" />
        <text y="13" fontSize="7.5" textAnchor="middle" fill="#171717" fontFamily="monospace">
          N
        </text>
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function SmartSearch({ onSearch }: SmartSearchProps) {
  const [location, setLocation] = useState("Kochi, Kerala");
  const [sizeIdx, setSizeIdx] = useState(2); // default 10 cents
  const [isCustom, setIsCustom] = useState(false);
  const [customCents, setCustomCents] = useState(10);
  const [shapeId, setShapeId] = useState("Rectangular");
  const [directionId, setDirectionId] = useState("North Facing");

  const sliderId = useId();
  const locationId = useId();

  // Active plot size representation (preset vs custom)
  const activeSize = useMemo(() => {
    if (!isCustom) {
      return PLOT_SIZES[sizeIdx];
    }
    const safeCents = customCents > 0 ? customCents : 10;
    const sqft = Math.round(safeCents * 435.6);
    // Typical rectangular aspect ratio 1 : 1.55
    const w = Math.max(15, Math.round(Math.sqrt(sqft / 1.55)));
    const l = Math.max(20, Math.round(sqft / w));
    const minBuilt = Math.round((sqft * 0.55) / 50) * 50;
    const maxBuilt = Math.round((sqft * 0.68) / 50) * 50;
    return {
      label: `${safeCents} cents`,
      tick: `${safeCents}`,
      sqft,
      plus: safeCents >= 20,
      w,
      l,
      builtUp: `${minBuilt.toLocaleString("en-IN")} – ${maxBuilt.toLocaleString("en-IN")}`,
      value: `${safeCents} Cents / ${sqft.toLocaleString("en-IN")} Sq.Ft`,
    };
  }, [isCustom, sizeIdx, customCents]);

  const shape = PLOT_SHAPES.find((s) => s.id === shapeId) ?? PLOT_SHAPES[0];
  const direction = ROAD_DIRECTIONS.find((d) => d.id === directionId) ?? ROAD_DIRECTIONS[0];

  const model = useMemo(
    () => buildModel(activeSize, shapeId, direction.side),
    [activeSize, shapeId, direction.side]
  );

  const pickSide = (side: Side) => {
    const next = ROAD_DIRECTIONS.find((d) => d.side === side);
    if (next) setDirectionId(next.id);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location,
      plotSize: activeSize.value,
      shape: shapeId,
      direction: directionId,
    });
  };

  const diagramLabel = `${activeSize.label} ${shape.label.toLowerCase()} plot with the road on the ${SIDE_NAME[direction.side]} side`;
  const groupTitle = "text-[12px] font-medium text-charcoal font-sans";

  return (
    <MotionConfig reducedMotion="user">
      <section id="search-section" className="py-14 sm:py-20 bg-warm-grey border-y border-warm-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: heading */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-normal font-serif tracking-[-0.01em] text-charcoal leading-[1.08]">
                What are we building on?
              </h2>
              <p className="text-[14px] sm:text-[15px] leading-relaxed text-secondaryText max-w-sm font-light font-sans">
                Set your plot size, shape and road side. The diagram updates as you go, and we match architect-drawn
                plans to it.
              </p>
              <Link
                href="/plot-intelligence"
                className="inline-block text-[13px] font-sans font-medium text-charcoal underline underline-offset-4 decoration-copper hover:text-copper transition-colors"
              >
                Or map your plot on satellite view
              </Link>
            </div>

            {/* Right: controls + live diagram */}
            <div className="lg:col-span-8 bg-white border border-warm-border shadow-subtle p-5 sm:p-7 md:p-8 rounded-2xl">
              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                {/* Diagram (first on mobile so changes stay visible) */}
                <div className="md:col-span-5 md:order-2 self-start md:sticky md:top-24">
                  <div className="p-4 bg-warm-card border border-warm-border/70 rounded-2xl">
                    <div className="relative w-full aspect-square max-w-[300px] mx-auto">
                      <PlotDiagram
                        model={model}
                        side={direction.side}
                        onPickSide={pickSide}
                        label={diagramLabel}
                        sloped={shapeId === "Sloped / Contour"}
                      />
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-[11px] text-mutedText font-sans">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm border border-charcoal bg-white" />
                        Plot
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm border border-dashed border-copper bg-copper/20" />
                        Buildable area
                      </span>
                    </div>

                    <dl className="mt-3 pt-3 border-t border-warm-border/60 space-y-1.5 text-[12px] font-sans">
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-mutedText">Buildable footprint</dt>
                        <dd className="font-medium text-charcoal">
                          about <AnimatedNumber value={model.footprint} /> sq ft
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <dt className="text-mutedText">Estimated built-up area</dt>
                        <dd className="font-medium text-copper">{activeSize.builtUp} sq ft</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Controls */}
                <div className="md:col-span-7 md:order-1 space-y-6">
                  {/* Location */}
                  <div>
                    <label htmlFor={locationId} className={groupTitle}>
                      Location
                    </label>
                    <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-warm-border bg-warm-card px-3 py-2.5 transition-colors focus-within:border-charcoal">
                      <MapPin className="w-4 h-4 text-copper shrink-0" aria-hidden="true" />
                      <select
                        id={locationId}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-transparent text-[13px] font-medium text-charcoal outline-none cursor-pointer font-sans"
                      >
                        {LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Plot size (Presets + Custom) */}
                  <div>
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      <label htmlFor={sliderId} className={groupTitle}>
                        Plot size
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="flex items-baseline gap-1.5 text-[12px] font-sans">
                          <span className="font-semibold text-charcoal">{activeSize.label}</span>
                          <span className="text-mutedText">
                            ({activeSize.sqft.toLocaleString("en-IN")}
                            {!isCustom && PLOT_SIZES[sizeIdx].plus ? "+" : ""} sq ft)
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isCustom) {
                              const cents = Number((PLOT_SIZES[sizeIdx].sqft / 435.6).toFixed(1));
                              setCustomCents(cents);
                              setIsCustom(true);
                            } else {
                              setIsCustom(false);
                            }
                          }}
                          className={`text-[11px] font-sans px-2.5 py-0.5 rounded-full border transition-all ${
                            isCustom
                              ? "bg-copper text-white border-copper font-medium shadow-xs"
                              : "border-warm-border text-charcoal/80 hover:text-copper hover:border-copper bg-warm-card"
                          }`}
                        >
                          {isCustom ? "Custom Active" : "+ Custom"}
                        </button>
                      </div>
                    </div>

                    {!isCustom ? (
                      <>
                        <input
                          id={sliderId}
                          type="range"
                          min={0}
                          max={PLOT_SIZES.length - 1}
                          step={1}
                          value={sizeIdx}
                          onChange={(e) => setSizeIdx(Number(e.target.value))}
                          aria-valuetext={`${activeSize.label}, ${activeSize.sqft.toLocaleString("en-IN")} square feet`}
                          className="mt-3 w-full h-1.5 cursor-pointer accent-copper"
                        />
                        <div className="mt-1 grid grid-cols-6 text-center">
                          {PLOT_SIZES.map((s, i) => (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => setSizeIdx(i)}
                              aria-label={s.label}
                              className={`py-1 text-[12px] font-sans transition-colors ${
                                i === sizeIdx ? "font-semibold text-charcoal" : "text-mutedText hover:text-charcoal"
                              }`}
                            >
                              {s.tick}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="mt-2.5 p-3.5 bg-warm-card border border-warm-border rounded-xl space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-sans">
                          <span className="text-mutedText uppercase tracking-wider font-medium">
                            Custom Parcel Area
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsCustom(false)}
                            className="text-copper hover:underline font-medium"
                          >
                            Return to standard presets
                          </button>
                        </div>

                        {/* Dual input: Cents and Sq.Ft with live two-way sync */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="bg-white border border-warm-border focus-within:border-charcoal rounded-xl px-3 py-2 flex items-center justify-between transition-colors">
                            <input
                              type="number"
                              min={0.5}
                              max={100}
                              step={0.1}
                              value={customCents || ""}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setCustomCents(isNaN(val) ? 0 : val);
                              }}
                              placeholder="e.g. 7.5"
                              className="w-full bg-transparent text-[13px] font-semibold text-charcoal outline-none font-mono"
                            />
                            <span className="text-[11px] text-mutedText font-sans uppercase font-medium pl-1 shrink-0">
                              Cents
                            </span>
                          </div>

                          <div className="bg-white border border-warm-border focus-within:border-charcoal rounded-xl px-3 py-2 flex items-center justify-between transition-colors">
                            <input
                              type="number"
                              min={200}
                              max={50000}
                              step={10}
                              value={Math.round(customCents * 435.6) || ""}
                              onChange={(e) => {
                                const sqft = parseFloat(e.target.value);
                                if (!isNaN(sqft)) {
                                  setCustomCents(Number((sqft / 435.6).toFixed(2)));
                                } else {
                                  setCustomCents(0);
                                }
                              }}
                              placeholder="e.g. 3267"
                              className="w-full bg-transparent text-[13px] font-semibold text-charcoal outline-none font-mono"
                            />
                            <span className="text-[11px] text-mutedText font-sans uppercase font-medium pl-1 shrink-0">
                              Sq.Ft
                            </span>
                          </div>
                        </div>

                        {/* Continuous Slider for custom cents (1 to 30 Cents) */}
                        <div>
                          <input
                            type="range"
                            min={1}
                            max={30}
                            step={0.5}
                            value={Math.min(30, Math.max(1, customCents))}
                            onChange={(e) => setCustomCents(Number(e.target.value))}
                            className="w-full h-1.5 cursor-pointer accent-copper"
                          />
                          <div className="flex justify-between text-[10px] text-mutedText font-mono mt-1">
                            <span>1 Cent</span>
                            <span>10 Cents</span>
                            <span>20 Cents</span>
                            <span>30+ Cents</span>
                          </div>
                        </div>

                        {/* Quick Presets row */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-warm-border/60">
                          <span className="text-[10px] text-mutedText font-sans uppercase">Quick:</span>
                          {[5, 8, 10, 12, 15, 20].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setCustomCents(c)}
                              className={`px-2 py-0.5 rounded text-[11px] font-sans border transition-colors ${
                                customCents === c
                                  ? "bg-copper text-white border-copper font-medium"
                                  : "bg-white text-charcoal/70 border-warm-border hover:border-charcoal hover:text-charcoal"
                              }`}
                            >
                              {c}c
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shape */}
                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <span id="shape-title" className={groupTitle}>
                        Plot shape
                      </span>
                      <span className="text-[12px] text-mutedText font-sans text-right">{shape.desc}</span>
                    </div>
                    <div
                      role="group"
                      aria-labelledby="shape-title"
                      className="mt-1.5 grid grid-cols-5 gap-1 p-1 rounded-xl bg-warm-card border border-warm-border"
                    >
                      {PLOT_SHAPES.map((s) => {
                        const active = s.id === shapeId;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setShapeId(s.id)}
                            className="relative flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-sans font-medium"
                          >
                            {active && (
                              <motion.span
                                layoutId="shape-pill"
                                className="absolute inset-0 rounded-lg bg-charcoal"
                                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                              />
                            )}
                            <span
                              className={`relative z-10 flex flex-col items-center gap-1 transition-colors ${
                                active ? "text-white" : "text-charcoal/70 hover:text-charcoal"
                              }`}
                            >
                              <ShapeGlyph id={s.id} />
                              {s.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Road side */}
                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <span id="road-title" className={groupTitle}>
                        Road side
                      </span>
                      <span className="text-[12px] text-copper font-sans font-medium">{direction.hint}</span>
                    </div>
                    <div
                      role="group"
                      aria-labelledby="road-title"
                      className="mt-1.5 grid grid-cols-4 gap-1 p-1 rounded-xl bg-warm-card border border-warm-border"
                    >
                      {ROAD_DIRECTIONS.map((d) => {
                        const active = d.id === directionId;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setDirectionId(d.id)}
                            className="relative rounded-lg py-2 text-xs font-sans font-medium"
                          >
                            {active && (
                              <motion.span
                                layoutId="road-pill"
                                className="absolute inset-0 rounded-lg bg-copper"
                                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                              />
                            )}
                            <span
                              className={`relative z-10 transition-colors ${
                                active ? "text-white" : "text-charcoal/70 hover:text-charcoal"
                              }`}
                            >
                              {d.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-1.5 text-[11px] text-mutedText font-sans">
                      You can also click a road edge on the diagram.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 bg-charcoal hover:bg-copper text-white text-[13px] font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 rounded-xl shadow-sm group"
                  >
                    <span>Find matching designs</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Direct Link to Live Satellite Workspace with Plot Guide */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[12px] font-sans border-t border-warm-border/60">
                    <span className="text-mutedText">Want to project this on your property?</span>
                    <Link
                      href={`/plot-intelligence?cents=${isCustom ? customCents : (activeSize.sqft / 435.6).toFixed(1)}&shape=${encodeURIComponent(shapeId)}&direction=${encodeURIComponent(directionId)}&location=${encodeURIComponent(location)}&live=true&guide=true`}
                      className="inline-flex items-center gap-1.5 text-copper hover:text-copper-dark font-medium underline underline-offset-4 decoration-copper/60 transition-colors group"
                    >
                      <Compass className="w-3.5 h-3.5 text-copper shrink-0 group-hover:rotate-45 transition-transform" />
                      <span>Use same plot in live location with Plot Guide</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
