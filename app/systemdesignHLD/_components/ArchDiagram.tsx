'use client';

import {
  ARCH_EDGES,
  ARCH_STEPS,
  ID_CHIP,
  REPLICA_CHIP,
} from '../url-shortener/arch';

const COL_X = [60, 170, 280];
const BOX_W = 100;
const SPAN_CX = 170;
const SPAN_W = 200;
const ROW_Y = [8, 60, 112, 188];
const SPAN_H = 40;
const BOX_H = 62;

function geom(col: number, row: number, span?: boolean) {
  if (span) {
    return { x: SPAN_CX - SPAN_W / 2, y: ROW_Y[row], w: SPAN_W, h: SPAN_H, cx: SPAN_CX };
  }
  return { x: COL_X[col] - BOX_W / 2, y: ROW_Y[row], w: BOX_W, h: BOX_H, cx: COL_X[col] };
}

/** Mini system-design schematic that wires itself up as the learner links nodes. */
export default function ArchDiagram({ linked }: { linked: Set<string> }) {
  const unlocked = new Map(
    ARCH_STEPS.map((s) => [s.id, s.requires.every((r) => linked.has(r))]),
  );
  const showIdChip = ID_CHIP.requires.every((r) => linked.has(r));
  const showReplica = REPLICA_CHIP.requires.every((r) => linked.has(r));

  const boxOf = new Map(ARCH_STEPS.map((s) => [s.id, { ...geom(s.col, s.row, s.span), s }]));

  const wires = ARCH_EDGES.filter(([a, b]) => unlocked.get(a) && unlocked.get(b)).map(
    ([a, b]) => {
      const A = boxOf.get(a)!;
      const B = boxOf.get(b)!;
      const x1 = A.cx;
      const y1 = A.y + A.h;
      const x2 = B.cx;
      const y2 = B.y;
      const d =
        x1 === x2
          ? `M ${x1} ${y1} V ${y2}`
          : `M ${x1} ${y1} C ${x1} ${y1 + 14}, ${x2} ${y2 - 14}, ${x2} ${y2}`;
      return { id: `${a}->${b}`, d };
    },
  );

  return (
    <svg
      viewBox="0 0 340 262"
      className="w-full"
      role="img"
      aria-label="System architecture diagram built so far"
    >
      <defs>
        <marker id="arch-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1 L 8 5 L 0 9" fill="none" stroke="#7d8aa0" strokeWidth="1.6" />
        </marker>
      </defs>
      {wires.map((w) => (
        <path key={w.id} d={w.d} fill="none" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arch-arr)" />
      ))}
      {ARCH_STEPS.map((s) => {
        const g = boxOf.get(s.id)!;
        const on = unlocked.get(s.id);
        const chip =
          s.id === ID_CHIP.parent && showIdChip
            ? ID_CHIP.text
            : s.id === REPLICA_CHIP.parent && showReplica
              ? REPLICA_CHIP.text
              : null;
        return (
          <g key={s.id}>
            <rect
              x={g.x}
              y={g.y}
              width={g.w}
              height={g.h}
              rx={8}
              fill={on ? '#1e293b' : 'rgba(30, 41, 59, 0.35)'}
              stroke={on ? '#475569' : '#475569'}
              strokeWidth={1.5}
              strokeDasharray={on ? undefined : '5 4'}
              opacity={on ? 1 : 0.75}
            />
            <text
              x={g.cx}
              y={g.y + (s.span ? 17 : 20)}
              textAnchor="middle"
              fontSize={s.span ? 12 : 11.5}
              fontWeight={700}
              fill={on ? '#ffffff' : '#64748b'}
            >
              {s.label}
            </text>
            <text
              x={g.cx}
              y={g.y + (s.span ? 31 : 35)}
              textAnchor="middle"
              fontSize={9}
              fill={on ? '#cbd5e1' : '#475569'}
            >
              {s.sub}
            </text>
            {chip && on ? (
              <text
                x={g.cx}
                y={g.y + 50}
                textAnchor="middle"
                fontSize={9}
                fontWeight={700}
                fill="#6ee7b7"
              >
                {chip}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
