/** Progressive architecture schematic: boxes + wires unlock as graph nodes get linked. */
export interface ArchStep {
  id: string;
  label: string;
  sub: string;
  /** Graph node ids that must all be linked before this box lights up. Empty = always visible. */
  requires: string[];
  col: 0 | 1 | 2;
  row: number;
  span?: boolean;
}

export const ARCH_STEPS: ArchStep[] = [
  { id: 'client', label: 'Client', sub: 'browser', requires: [], col: 1, row: 0, span: true },
  {
    id: 'gateway',
    label: 'API Gateway',
    sub: 'routes POST · GET',
    requires: ['hr-gateway'],
    col: 1,
    row: 1,
    span: true,
  },
  {
    id: 'shorten',
    label: 'Shortening',
    sub: 'mints alias',
    requires: ['hs-service'],
    col: 0,
    row: 2,
  },
  {
    id: 'redir',
    label: 'Redirection',
    sub: '302 redirect',
    requires: ['hr-handler'],
    col: 1,
    row: 2,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    sub: 'click counts',
    requires: ['an-service'],
    col: 2,
    row: 2,
  },
  {
    id: 'store',
    label: 'Mapping Store',
    sub: 'DynamoDB',
    requires: ['hs-db'],
    col: 0,
    row: 3,
  },
  {
    id: 'cache',
    label: 'Cache',
    sub: 'Redis · hot',
    requires: ['hr-cache'],
    col: 1,
    row: 3,
  },
  {
    id: 'counters',
    label: 'Counter Flush',
    sub: 'Redis → DB',
    requires: ['an-flush'],
    col: 2,
    row: 3,
  },
];

/** Wires appear only when both endpoint boxes are unlocked. */
export const ARCH_EDGES: Array<[string, string]> = [
  ['client', 'gateway'],
  ['gateway', 'shorten'],
  ['gateway', 'redir'],
  ['gateway', 'analytics'],
  ['shorten', 'store'],
  ['redir', 'cache'],
  ['analytics', 'counters'],
];

/** Extra chip drawn inside the Shortening box once the ID scheme is chosen. */
export const ID_CHIP = {
  parent: 'shorten',
  text: '★ MachineID+Seq',
  requires: ['id-machine'],
};

/** Extra chip inside the Mapping Store once read-heavy scale is discovered. */
export const REPLICA_CHIP = {
  parent: 'store',
  text: '⧉ replica · 100:1',
  requires: ['a-rw'],
};
