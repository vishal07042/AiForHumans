'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export interface FlowNodeData extends Record<string, unknown> {
  label: string;
  tag?: string;
  expanded: boolean;
  hasChildren: boolean;
  selected: boolean;
  /** True once this node is linked into the tree (root always, others after user connects). Gates the + button. */
  showToggle: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onRotate: (id: string, dir: 1 | -1) => void;
}

const BTN_BASE =
  'nodrag flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-bold leading-none shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900';

function PlusButton({
  nodeId,
  expanded,
  onToggle,
  className,
}: {
  nodeId: string;
  expanded: boolean;
  onToggle: (id: string) => void;
  className?: string;
}) {
  return (
    <button
      aria-label={expanded ? 'Collapse' : 'Expand'}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(nodeId);
      }}
      className={`${BTN_BASE} text-xl ${
        expanded
          ? 'bg-slate-100 text-slate-900 hover:bg-white'
          : 'bg-emerald-600 text-white hover:bg-emerald-500'
      } ${className ?? ''}`}
    >
      {expanded ? '−' : '+'}
    </button>
  );
}

function RotateButton({
  nodeId,
  onRotate,
  className,
}: {
  nodeId: string;
  onRotate: (id: string, dir: 1 | -1) => void;
  className?: string;
}) {
  return (
    <button
      aria-label="Rotate subtree"
      title="Rotate subtree (Shift+click reverses)"
      onClick={(e) => {
        e.stopPropagation();
        onRotate(nodeId, e.shiftKey ? -1 : 1);
      }}
      className={`${BTN_BASE} bg-sky-600 text-lg text-white hover:bg-sky-500 ${className ?? ''}`}
    >
      ⟳
    </button>
  );
}

const HANDLE_STYLE = { width: 14, height: 14, background: '#f8fafc', border: '2px solid #334155' };

function TopicDiamondInner({ id, data }: NodeProps) {
  const d = data as unknown as FlowNodeData;
  return (
    <div
      onClick={() => d.onSelect(id)}
      className="relative flex h-[300px] w-[300px] cursor-grab items-center justify-center active:cursor-grabbing"
    >
      <Handle type="target" position={Position.Top} style={HANDLE_STYLE} aria-label="Connect from parent" />
      <div
        className={`flex rotate-45 items-center justify-center transition-colors ${
          d.selected ? 'ring-4 ring-white/90' : ''
        }`}
        style={{
          width: 216,
          height: 216,
          background: d.selected ? 'rgb(251, 191, 36)' : 'rgb(245, 158, 11)',
          borderRadius: 18,
          boxShadow: 'rgba(15, 23, 42, 0.22) 0px 14px 32px',
          border: '1px solid rgba(15, 23, 42, 0.18)',
        }}
      >
        <div
          style={{
            transform: 'rotate(-45deg)',
            textAlign: 'center',
            width: '78%',
            overflowWrap: 'break-word',
            lineHeight: 1.25,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '-0.015em',
            color: 'rgb(17, 24, 39)',
          }}
        >
          {d.tag ? (
            <div
              className="mb-1 text-xs font-extrabold uppercase tracking-wider"
              style={{ color: 'rgba(17, 24, 39, 0.65)' }}
            >
              {d.tag}
            </div>
          ) : null}
          {d.label}
        </div>
      </div>
      {d.hasChildren && d.showToggle ? (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          <RotateButton nodeId={id} onRotate={d.onRotate} />
          <PlusButton nodeId={id} expanded={d.expanded} onToggle={d.onToggle} />
        </div>
      ) : null}
      <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} aria-label="Connect to child" />
    </div>
  );
}

function DetailLeafInner({ id, data }: NodeProps) {
  const d = data as unknown as FlowNodeData;
  return (
    <div
      onClick={() => d.onSelect(id)}
      className="relative cursor-grab active:cursor-grabbing"
      style={{ width: 240, minHeight: 60 }}
    >
      <Handle type="target" position={Position.Top} style={HANDLE_STYLE} aria-label="Connect from parent" />
      <div
        className={`w-[240px] rounded-xl border px-4 py-3 text-center shadow-lg transition-colors [overflow-wrap:anywhere] ${
          d.selected
            ? 'border-white/80 bg-indigo-600 ring-4 ring-white/80'
            : 'border-indigo-300/30 bg-indigo-600 hover:bg-indigo-500'
        }`}
      >
        {d.tag ? (
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-indigo-100">
            {d.tag}
          </div>
        ) : null}
        <div className="text-[17px] font-bold leading-snug break-words text-white">{d.label}</div>
      </div>
      {d.hasChildren && d.showToggle ? (
        <>
          <RotateButton nodeId={id} onRotate={d.onRotate} className="absolute -left-3 -top-3 z-10" />
          <PlusButton
            nodeId={id}
            expanded={d.expanded}
            onToggle={d.onToggle}
            className="absolute -right-3 -top-3 z-10"
          />
        </>
      ) : null}
      <Handle type="source" position={Position.Bottom} style={HANDLE_STYLE} aria-label="Connect to child" />
    </div>
  );
}

// Memoized so dragging one node doesn't re-render all the others.
export const TopicDiamondNode = memo(TopicDiamondInner);
export const DetailLeafNode = memo(DetailLeafInner);

export const FLOW_NODE_TYPES = {
  topic: TopicDiamondNode,
  detail: DetailLeafNode,
};
