'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { FLOW_NODE_TYPES, type FlowNodeData } from './FlowNodes';
import { GRAPH, ROOT_ID, type GraphItem } from '../url-shortener/graph';

const SLOT = 340;
const DROP = 420;
const PUSH = 160;
const GAP_MARGIN = 30;
const TOPIC_BOX = 300;
const LEAF_W = 240;
const LEAF_H = 140;
const ROTATE_STEP = 15;

interface XY {
  x: number;
  y: number;
}

function descendantsOf(id: string, childrenByParent: Map<string, GraphItem[]>): string[] {
  const out: string[] = [];
  const stack = [...(childrenByParent.get(id) ?? [])];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    out.push(cur.id);
    stack.push(...(childrenByParent.get(cur.id) ?? []));
  }
  return out;
}

function rotatePoint(p: XY, deg: number): XY {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos };
}

function pillProps(g: GraphItem) {
  if (!g.edgeLabel) return {};
  const fill = g.edgeKind === 'yes' ? '#15803d' : g.edgeKind === 'no' ? '#dc2626' : '#4f46e5';
  return {
    label: g.edgeLabel,
    labelStyle: { fill: '#ffffff', fontWeight: 800, fontSize: 14 },
    labelBgStyle: { fill },
    labelBgPadding: [10, 6] as [number, number],
    labelBgBorderRadius: 999,
  };
}

type DataRecord = Record<string, unknown>;

function FlowCanvas() {
  const { fitView, getNode, getNodes, zoomIn, zoomOut, getViewport, setViewport } =
    useReactFlow();
  /** Parents whose children have been spawned onto the canvas. */
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>(ROOT_ID);
  /** Edges the user drew themselves. Auto-edges are never created. */
  const [userEdges, setUserEdges] = useState<Edge[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  /** Where freshly spawned children land, captured at spawn time. */
  const spawnPosRef = useRef<Record<string, XY>>({});
  /** Per-node data cache: identical fields reuse the same object so nodes don't re-render. */
  const dataCache = useRef(new Map<string, DataRecord>());
  const draggingNode = useRef(false);
  const mountedRef = useRef(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Positions live in React Flow's own store. Once a node is placed, nothing
  // recomputes its position — no expand, connect, or select ever moves it.
  const [nodes, setNodes, rfOnNodesChange] = useNodesState<Node>([]);

  const childrenByParent = useMemo(() => {
    const m = new Map<string, GraphItem[]>();
    for (const g of GRAPH) {
      if (!g.parentId) continue;
      const arr = m.get(g.parentId) ?? [];
      arr.push(g);
      m.set(g.parentId, arr);
    }
    return m;
  }, []);

  const byId = useMemo(() => new Map(GRAPH.map((g) => [g.id, g])), []);

  const flashHint = useCallback((msg: string) => {
    setHint(msg);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(null), 2600);
  }, []);

  const collapseSubtree = useCallback(
    (targetId: string) => {
      const drop = new Set([targetId, ...descendantsOf(targetId, childrenByParent)]);
      setExpanded((prev) => prev.filter((x) => !drop.has(x)));
      setUserEdges((prev) => prev.filter((e) => !drop.has(e.source) && !drop.has(e.target)));
      for (const id of drop) delete spawnPosRef.current[id];
    },
    [childrenByParent],
  );

  const toggle = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (expanded.includes(id)) {
        for (const d of descendantsOf(id, childrenByParent)) collapseSubtree(d);
        setExpanded((prev) => prev.filter((x) => x !== id));
        setUserEdges((prev) =>
          prev.filter((e) => {
            const t = byId.get(e.target);
            return !(e.source === id && t?.parentId === id);
          }),
        );
        return;
      }
      // Down-only spawn in GRAPH order. Each slot is pushed down until it
      // clears every live node, so nothing ever overlaps.
      const kids = childrenByParent.get(id) ?? [];
      const p = getNode(id)?.position ?? { x: 0, y: 0 };
      const occupied: Array<{ x: number; y: number; w: number; h: number }> = getNodes().map(
        (n) => {
          const kind = byId.get(n.id)?.kind;
          return {
            x: n.position.x,
            y: n.position.y,
            w: kind === 'topic' ? TOPIC_BOX : LEAF_W,
            h: kind === 'topic' ? TOPIC_BOX : LEAF_H,
          };
        },
      );
      const hits = (
        x: number,
        y: number,
        w: number,
        h: number,
        r: { x: number; y: number; w: number; h: number },
      ) =>
        x - GAP_MARGIN < r.x + r.w &&
        x + w + GAP_MARGIN > r.x &&
        y - GAP_MARGIN < r.y + r.h &&
        y + h + GAP_MARGIN > r.y;
      kids.forEach((k, i) => {
        const w = k.kind === 'topic' ? TOPIC_BOX : LEAF_W;
        const h = k.kind === 'topic' ? TOPIC_BOX : LEAF_H;
        const cx = p.x + (i - (kids.length - 1) / 2) * SLOT;
        let cy = p.y + DROP;
        let tries = 0;
        while (tries++ < 12 && occupied.some((r) => hits(cx, cy, w, h, r))) cy += PUSH;
        spawnPosRef.current[k.id] = { x: cx, y: cy };
        occupied.push({ x: cx, y: cy, w, h });
      });
      setExpanded((prev) => [...prev, id]);
    },
    [expanded, childrenByParent, byId, getNode, getNodes, collapseSubtree],
  );

  const select = useCallback((id: string) => setSelectedId(id), []);

  const rotateSubtree = useCallback(
    (id: string, dir: 1 | -1) => {
      setSelectedId(id);
      // Rotate live store positions around the node's current spot.
      const live = new Map(getNodes().map((n) => [n.id, n.position]));
      const center = live.get(id);
      if (!center) return;
      const members = new Set(descendantsOf(id, childrenByParent));
      setNodes((prev) =>
        prev.map((n) => {
          if (!members.has(n.id)) return n;
          const cur = live.get(n.id) ?? n.position;
          const off = rotatePoint(
            { x: cur.x - center.x, y: cur.y - center.y },
            dir * ROTATE_STEP,
          );
          return { ...n, position: { x: center.x + off.x, y: center.y + off.y } };
        }),
      );
    },
    [childrenByParent, getNodes, setNodes],
  );

  /** Nodes linked into the tree: root + anything reachable via user-drawn edges. */
  const linked = useMemo(() => {
    const set = new Set<string>([ROOT_ID]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const e of userEdges) {
        if (set.has(e.source) && !set.has(e.target)) {
          set.add(e.target);
          grew = true;
        }
      }
    }
    return set;
  }, [userEdges]);

  const visibleItems = useMemo(() => {
    const expandedSet = new Set(expanded);
    return GRAPH.filter((g) => {
      if (g.id === ROOT_ID) return true;
      let cur: GraphItem | undefined = g;
      while (cur?.parentId) {
        if (!expandedSet.has(cur.parentId)) return false;
        cur = byId.get(cur.parentId);
      }
      return true;
    });
  }, [expanded, byId]);

  // Reconcile spawned ids into the store. Existing nodes keep their exact
  // object (position + data) unless their display fields changed.
  useEffect(() => {
    const cache = dataCache.current;
    const dataFor = (g: GraphItem): DataRecord => {
      const fresh = {
        label: g.label,
        tag: g.tag,
        expanded: expanded.includes(g.id),
        hasChildren: (childrenByParent.get(g.id)?.length ?? 0) > 0,
        selected: selectedId === g.id,
        showToggle: linked.has(g.id),
        onToggle: toggle,
        onSelect: select,
        onRotate: rotateSubtree,
      } satisfies FlowNodeData as unknown as DataRecord;
      const old = cache.get(g.id);
      if (
        old &&
        old.label === fresh.label &&
        old.tag === fresh.tag &&
        old.expanded === fresh.expanded &&
        old.hasChildren === fresh.hasChildren &&
        old.selected === fresh.selected &&
        old.showToggle === fresh.showToggle
      ) {
        return old;
      }
      cache.set(g.id, fresh);
      return fresh;
    };
    setNodes((prev) => {
      const prevById = new Map(prev.map((n) => [n.id, n]));
      let changed = prev.length !== visibleItems.length;
      const next = visibleItems.map((g) => {
        const old = prevById.get(g.id);
        const data = dataFor(g);
        if (old && old.data === data) return old;
        changed = true;
        if (old) return { ...old, type: g.kind, data };
        return {
          id: g.id,
          type: g.kind,
          position: spawnPosRef.current[g.id] ?? { x: 0, y: 0 },
          data,
        } as Node;
      });
      return changed ? next : prev;
    });
    if (!mountedRef.current) {
      mountedRef.current = true;
      requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }));
    }
  }, [
    visibleItems,
    expanded,
    selectedId,
    linked,
    childrenByParent,
    toggle,
    select,
    rotateSubtree,
    setNodes,
    fitView,
  ]);

  // Edges shown = only what the user drew (filtered to visible nodes).
  const edges = useMemo(() => {
    const visibleIds = new Set(visibleItems.map((g) => g.id));
    return userEdges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target));
  }, [userEdges, visibleItems]);

  const onConnect = useCallback(
    (params: Connection) => {
      const { source, target } = params;
      if (!source || !target) return;
      const item = byId.get(target);
      if (item && item.parentId === source) {
        setUserEdges((prev) => {
          if (prev.some((e) => e.source === source && e.target === target)) return prev;
          return [
            ...prev,
            {
              ...params,
              id: `${source}->${target}`,
              style: { stroke: '#64748b', strokeWidth: 1.5 },
              ...pillProps(item),
            } as Edge,
          ];
        });
        setHint(null);
        setSelectedId(target);
      } else {
        flashHint("Not quite — connect a node to one of its own children.");
      }
    },
    [byId, flashHint],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const removed = changes.filter((c) => c.type === 'remove').map((c) => c.id);
      if (removed.length > 0) {
        setUserEdges((prev) => {
          const gone = new Set(removed);
          const targets = prev.filter((e) => gone.has(e.id)).map((e) => e.target);
          for (const t of targets) collapseSubtree(t);
          return prev.filter((e) => !gone.has(e.id));
        });
      }
    },
    [collapseSubtree],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      rfOnNodesChange(changes);
    },
    [rfOnNodesChange],
  );

  const fitSoon = useCallback(() => {
    requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }));
  }, [fitView]);

  // Ctrl+I / Ctrl+O zoom, Shift+Ctrl+mouse-move pans the canvas.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.code === 'KeyI') {
        e.preventDefault();
        zoomIn({ duration: 200 });
      } else if (mod && e.code === 'KeyO') {
        e.preventDefault();
        zoomOut({ duration: 200 });
      }
    };
    const onMove = (e: MouseEvent) => {
      if (!e.shiftKey || !e.ctrlKey || draggingNode.current) return;
      if (!(e.target as HTMLElement | null)?.closest?.('.react-flow')) return;
      const v = getViewport();
      setViewport({ x: v.x + e.movementX, y: v.y + e.movementY, zoom: v.zoom });
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousemove', onMove);
    };
  }, [zoomIn, zoomOut, getViewport, setViewport]);

  const resetAll = useCallback(() => {
    spawnPosRef.current = {};
    setExpanded([]);
    setUserEdges([]);
    setSelectedId(ROOT_ID);
    setHint(null);
    fitSoon();
  }, [fitSoon]);

  const selected = byId.get(selectedId);
  const expandedCount = visibleItems.length - 1;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={() => {
          draggingNode.current = true;
        }}
        onNodeDragStop={() => {
          draggingNode.current = false;
        }}
        nodeTypes={FLOW_NODE_TYPES}
        elementsSelectable={false}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="!bg-slate-900"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="rgba(148,163,184,0.25)" />
        <Controls position="bottom-left" className="!rounded-lg !border !border-slate-700 !bg-slate-800 !fill-slate-200 !text-slate-200" />
      </ReactFlow>

      {/* Top-left toolbar like AlgoMonster */}
      <div className="absolute left-4 top-4 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/80 p-2 shadow-xl backdrop-blur">
        <button
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
          className="rounded-full bg-sky-400 px-4 py-2 text-sm font-bold text-sky-950 hover:bg-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          Fit
        </button>
        <button
          onClick={() => {
            setExpanded([ROOT_ID]);
            setSelectedId(ROOT_ID);
            fitSoon();
          }}
          className="rounded-full border border-slate-600 bg-white/5 px-4 py-2 text-sm font-bold text-slate-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          Start
        </button>
        <button
          onClick={resetAll}
          className="rounded-full border border-slate-600 bg-white/5 px-4 py-2 text-sm font-bold text-slate-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          Clear
        </button>
        <span className="hidden px-2 text-xs font-medium text-slate-300 lg:inline">
          {hint ?? `${expandedCount} open · + drops parts below · drag handle to connect · ctrl+I/O zoom · shift+ctrl+move pans`}
        </span>
      </div>

      {/* Guide panel */}
      <aside className="absolute bottom-4 right-4 top-20 flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-2xl backdrop-blur">
        <div className="border-b border-slate-700/60 px-4 py-3">
          <div className="text-[11px] font-bold uppercase tracking-widest text-sky-400">Guide</div>
          <div className="text-base font-bold text-white">{selected?.label ?? '—'}</div>
          {selected?.tag ? (
            <span className="mt-1 inline-block rounded-full bg-indigo-500/20 px-2 py-0.5 text-[11px] font-bold text-indigo-300">
              {selected.tag}
            </span>
          ) : null}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 text-sm leading-relaxed text-slate-200">
          <p className="whitespace-pre-line">{selected?.detail}</p>
        </div>
        <div className="border-t border-slate-700/60 px-4 py-2 text-[11px] font-medium text-slate-300">
          + drops parts below · connect to unlock the next +
        </div>
      </aside>
    </div>
  );
}

export default function SystemDesignFlow() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
