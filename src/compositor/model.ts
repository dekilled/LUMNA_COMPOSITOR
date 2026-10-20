export type PresetId = "mesa" | "celular" | "dock";

export type LayoutPolicy = "mestre" | "grade" | "monoculo" | "flutuante";

export type ShellMode = "session" | "home" | "apps" | "loja" | "lock";

export type AppKind =
  | "terminal"
  | "navegador"
  | "ficheiros"
  | "editor"
  | "correio"
  | "leitor"
  | "definicoes"
  | "notas";

export type OutputProfile = "edp" | "dp" | "hdmi" | "dsi";

export interface Output {
  id: string;
  connector: string;
  profile: OutputProfile;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  hz: number;
  workspace: number;
}

export interface ClientWindow {
  id: string;
  app: AppKind;
  title: string;
  appId: string;
  outputId: string;
  workspace: number;
  floating: boolean;
  fullscreen: boolean;
  maximized: boolean;
  minimized: boolean;
  fx: number;
  fy: number;
  fw: number;
  fh: number;
  order: number;
  draft: string;
  log: string;
  hit: string;
}

export interface ProtoEvent {
  id: number;
  iface: string;
  msg: string;
}

export interface SurfaceContact {
  windowId: string;
  x: number;
  y: number;
  down: boolean;
  kind: "touch" | "mouse";
}

export interface Scene {
  preset: PresetId;
  layout: LayoutPolicy;
  gaps: number;
  masterRatio: number;
  focusFollows: boolean;
  outputs: Output[];
  windows: ClientWindow[];
  focusedId: string | null;
  focusedOutputId: string;
  overview: boolean;
  split: boolean;
  splitPrimaryId: string | null;
  splitSecondaryId: string | null;
  splitRatio: number;
  keyboard: boolean;
  contact: SurfaceContact | null;
  shell: Record<string, ShellMode>;
  /** null = doca em todas as telas de secretária. */
  dockOn: string[] | null;
  events: ProtoEvent[];
  seq: number;
  eventSeq: number;
}

export interface AppSpec {
  id: AppKind;
  label: string;
  appId: string;
  title: string;
}

export const APPS: AppSpec[] = [
  { id: "terminal", label: "Terminal", appId: "com.orbit.Terminal", title: "Terminal" },
  { id: "navegador", label: "Navegador", appId: "com.orbit.Navegador", title: "Navegador" },
  { id: "ficheiros", label: "Arquivos", appId: "com.orbit.Ficheiros", title: "Arquivos" },
  { id: "editor", label: "Editor", appId: "com.orbit.Editor", title: "Editor" },
  { id: "correio", label: "Correio", appId: "com.orbit.Correio", title: "Correio" },
  { id: "leitor", label: "Música", appId: "com.orbit.Leitor", title: "Música" },
  { id: "definicoes", label: "Ajustes", appId: "com.orbit.Definicoes", title: "Ajustes" },
  { id: "notas", label: "Notas", appId: "com.orbit.Notas", title: "Notas" },
];

export const WORKSPACES = [1, 2, 3, 4] as const;

export function appSpec(kind: AppKind): AppSpec {
  return APPS.find((app) => app.id === kind) ?? APPS[0];
}

export function windowsOn(scene: Scene, outputId: string): ClientWindow[] {
  const output = scene.outputs.find((item) => item.id === outputId);
  if (!output) return [];
  return scene.windows
    .filter((win) => win.outputId === outputId && win.workspace === output.workspace)
    .sort((a, b) => a.order - b.order);
}

export interface SplitState {
  split: boolean;
  splitPrimaryId: string | null;
  splitSecondaryId: string | null;
}

export function emptySplit(): SplitState {
  return { split: false, splitPrimaryId: null, splitSecondaryId: null };
}

export function touchStaysOnPhone(outputs: Output[], outputId: string, kind: "touch" | "mouse"): boolean {
  if (kind !== "touch") return true;
  const phone = outputs.find((output) => output.profile === "dsi");
  if (!phone) return true;
  return outputId === phone.id;
}

function phoneOf(outputs: Output[]): Output | undefined {
  return outputs.find((output) => output.profile === "dsi");
}

function orderedOn(windows: ClientWindow[], outputId: string, workspace: number): ClientWindow[] {
  return windows
    .filter((win) => win.outputId === outputId && win.workspace === workspace && !win.minimized)
    .sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : 1));
}

function nextIn(
  list: ClientWindow[],
  afterId: string | null,
  accept: (win: ClientWindow) => boolean,
): ClientWindow | null {
  if (list.length === 0) return null;
  const start = afterId ? list.findIndex((win) => win.id === afterId) : -1;
  const from = start < 0 ? 0 : start + 1;
  for (let offset = 0; offset < list.length; offset++) {
    const candidate = list[(from + offset) % list.length];
    if (candidate && accept(candidate)) return candidate;
  }
  return null;
}

/** Window that should own the keyboard after an output changes workspace. */
export function focusForWorkspace(
  windows: ClientWindow[],
  focusedId: string | null,
  outputId: string,
  workspace: number,
): string | null {
  const visible = orderedOn(windows, outputId, workspace);
  if (visible.length > 0) return visible[0].id;
  const previous = windows.find((win) => win.id === focusedId);
  if (previous?.outputId === outputId) return null;
  return focusedId;
}

export function pinSplit(windows: ClientWindow[], outputs: Output[], focusedId: string | null): SplitState {
  const phone = phoneOf(outputs);
  if (!phone) return emptySplit();
  const list = orderedOn(windows, phone.id, phone.workspace);
  const primary = list.find((win) => win.id === focusedId) ?? list[0];
  if (!primary) return emptySplit();
  const secondary = nextIn(list, primary.id, (win) => win.id !== primary.id);
  if (!secondary) return emptySplit();
  return { split: true, splitPrimaryId: primary.id, splitSecondaryId: secondary.id };
}

function pairStillTogether(after: ClientWindow[], phone: Output, slots: SplitState): SplitState | null {
  const primary = after.find((win) => win.id === slots.splitPrimaryId);
  const secondary = after.find((win) => win.id === slots.splitSecondaryId);
  if (!primary || !secondary || primary.id === secondary.id) return null;
  if (primary.outputId !== phone.id || secondary.outputId !== phone.id) return null;
  if (primary.workspace !== secondary.workspace) return null;
  return { split: true, splitPrimaryId: primary.id, splitSecondaryId: secondary.id };
}

export function repairSplit(
  outputs: Output[],
  before: ClientWindow[],
  after: ClientWindow[],
  slots: SplitState,
  leftId: string | null,
): SplitState {
  if (!slots.split) return emptySplit();
  const phone = phoneOf(outputs);
  if (!phone) return emptySplit();
  if (leftId !== slots.splitPrimaryId && leftId !== slots.splitSecondaryId) {
    return pairStillTogether(after, phone, slots) ?? emptySplit();
  }

  const onVisible = (id: string | null) => {
    if (!id) return null;
    const win = after.find((item) => item.id === id);
    if (!win || win.outputId !== phone.id || win.workspace !== phone.workspace) return null;
    return win;
  };

  let primary = onVisible(slots.splitPrimaryId);
  let secondary = onVisible(slots.splitSecondaryId);

  const fill = (missingId: string | null, taken: ClientWindow | null) => {
    const visible = orderedOn(after, phone.id, phone.workspace);
    const origin = before.find((win) => win.id === missingId);
    const oldList = orderedOn(before, phone.id, origin?.workspace ?? phone.workspace);
    const takenId = taken?.id ?? null;
    const picked = nextIn(oldList, missingId, (win) => {
      if (win.id === missingId || win.id === takenId) return false;
      return visible.some((item) => item.id === win.id);
    });
    return picked ?? visible.find((item) => item.id !== takenId) ?? null;
  };

  if (!primary) primary = fill(slots.splitPrimaryId, secondary);
  if (!secondary || primary?.id === secondary.id) secondary = fill(slots.splitSecondaryId, primary);
  if (!primary || !secondary || primary.id === secondary.id) return emptySplit();
  return { split: true, splitPrimaryId: primary.id, splitSecondaryId: secondary.id };
}

export function admitToSplit(
  outputs: Output[],
  slots: SplitState,
  focusedId: string | null,
  win: ClientWindow,
): SplitState {
  if (!slots.split) return slots;
  const phone = phoneOf(outputs);
  if (!phone || win.outputId !== phone.id || win.workspace !== phone.workspace) return slots;
  if (win.id === slots.splitPrimaryId || win.id === slots.splitSecondaryId) return slots;
  if (focusedId === slots.splitPrimaryId) return { ...slots, splitSecondaryId: win.id };
  if (focusedId === slots.splitSecondaryId) return { ...slots, splitPrimaryId: win.id };
  if (slots.splitPrimaryId) return { ...slots, splitSecondaryId: win.id };
  return { ...slots, splitPrimaryId: win.id };
}

function win(
  id: string,
  app: AppKind,
  outputId: string,
  workspace: number,
  order: number,
  floating = false,
): ClientWindow {
  const spec = appSpec(app);
  return {
    id,
    app,
    title: spec.title,
    appId: spec.appId,
    outputId,
    workspace,
    floating,
    fullscreen: false,
    maximized: false,
    minimized: false,
    fx: 0.08 + (order % 3) * 0.05,
    fy: 0.1 + (order % 3) * 0.06,
    fw: 0.46,
    fh: 0.55,
    order,
    draft: "",
    log: "",
    hit: "",
  };
}

function boot(preset: PresetId, lines: Array<[string, string]>): Pick<Scene, "events" | "eventSeq"> {
  const events = lines.map(([iface, msg], index) => ({
    id: index + 1,
    iface,
    msg,
  }));
  events.reverse();
  return { events, eventSeq: lines.length };
}

export function createScene(preset: PresetId, keep?: Pick<Scene, "layout" | "gaps" | "masterRatio" | "focusFollows" | "dockOn">): Scene {
  const layout = keep?.layout ?? "mestre";
  const gaps = keep?.gaps ?? 8;
  const masterRatio = keep?.masterRatio ?? 0.56;
  const focusFollows = keep?.focusFollows ?? false;

  if (preset === "celular") {
    const outputs: Output[] = [
      {
        id: "dsi",
        connector: "DSI-1",
        profile: "dsi",
        label: "Telemóvel",
        x: 0,
        y: 0,
        width: 390,
        height: 844,
        scale: 3,
        hz: 120,
        workspace: 1,
      },
    ];
    const windows = [
      win("c1", "navegador", "dsi", 1, 0),
      win("c2", "correio", "dsi", 1, 1),
      win("c3", "notas", "dsi", 1, 2),
      win("c4", "leitor", "dsi", 1, 3),
    ];
    return {
      preset,
      layout,
      gaps,
      masterRatio,
      focusFollows,
      outputs,
      windows,
      focusedId: "c1",
      focusedOutputId: "dsi",
      overview: false,
      split: false,
      splitPrimaryId: null,
      splitSecondaryId: null,
      splitRatio: 0.5,
      keyboard: false,
      contact: null,
      shell: { dsi: "home" },
      dockOn: keep?.dockOn ?? null,
      seq: 4,
      ...boot(preset, [
        ["wlr_backend", "DRM master no painel DSI-1"],
        ["wlr_output", "DSI-1 modo 1170×2532 scale 3.00 @120"],
        ["wlr_seat", "seat0 capacidades touch keyboard"],
        ["wlr_cursor", "toque mapeado só para DSI-1"],
        ["xdg_wm_base", "cliente com.orbit.Navegador mapeado"],
      ]),
    };
  }

  if (preset === "dock") {
    const outputs: Output[] = [
      {
        id: "dsi",
        connector: "DSI-1",
        profile: "dsi",
        label: "Telemóvel",
        x: 0,
        y: 200,
        width: 390,
        height: 844,
        scale: 3,
        hz: 120,
        workspace: 1,
      },
      {
        id: "dp",
        connector: "DP-1",
        profile: "dp",
        label: "Doca",
        x: 390,
        y: 0,
        width: 1920,
        height: 1080,
        scale: 1,
        hz: 144,
        workspace: 1,
      },
    ];
    const windows = [
      win("c1", "notas", "dsi", 1, 0),
      win("c2", "navegador", "dp", 1, 0),
      win("c3", "terminal", "dp", 1, 1),
      win("c4", "editor", "dp", 1, 2),
    ];
    return {
      preset,
      layout,
      gaps,
      masterRatio,
      focusFollows,
      outputs,
      windows,
      focusedId: "c2",
      focusedOutputId: "dp",
      overview: false,
      split: false,
      splitPrimaryId: null,
      splitSecondaryId: null,
      splitRatio: 0.5,
      keyboard: false,
      contact: null,
      shell: { dsi: "home" },
      dockOn: keep?.dockOn ?? null,
      seq: 4,
      ...boot(preset, [
        ["wlr_backend", "nova saída quente DP-1 na doca"],
        ["wlr_output_layout", "DSI-1 em (0,200) · DP-1 em (390,0)"],
        ["wlr_cursor", "toque preso ao DSI-1 · rato no layout"],
        ["wlr_seat", "seat0 pointer keyboard touch"],
        ["wlr_scene", "reparent de toplevels para a saída sob o centro"],
      ]),
    };
  }

  const outputs: Output[] = [
    {
      id: "edp",
      connector: "eDP-1",
      profile: "edp",
      label: "Portátil",
      x: 0,
      y: 80,
      width: 1600,
      height: 1000,
      scale: 1.5,
      hz: 60,
      workspace: 1,
    },
    {
      id: "dp",
      connector: "DP-1",
      profile: "dp",
      label: "Externo",
      x: 1600,
      y: 0,
      width: 1920,
      height: 1080,
      scale: 1,
      hz: 144,
      workspace: 1,
    },
  ];
  const windows = [
    win("c1", "terminal", "edp", 1, 0),
    win("c2", "editor", "edp", 1, 1),
    win("c3", "navegador", "dp", 1, 0),
    win("c4", "ficheiros", "dp", 1, 1),
  ];
  return {
    preset: "mesa",
    layout,
    gaps,
    masterRatio,
    focusFollows,
    outputs,
    windows,
    focusedId: "c3",
    focusedOutputId: "dp",
    overview: false,
    split: false,
    splitPrimaryId: null,
    splitSecondaryId: null,
    splitRatio: 0.5,
    keyboard: false,
    contact: null,
    shell: {},
    dockOn: keep?.dockOn ?? null,
    seq: 4,
    ...boot("mesa", [
      ["wlr_backend", "autocreate: drm da sessão, não X11"],
      ["wlr_output", "eDP-1 1600×1000 @60 scale 1.50"],
      ["wlr_output", "DP-1 1920×1080 @144 scale 1.00"],
      ["wlr_output_layout", "add_auto da esquerda para a direita"],
      ["wlr_scene", "output layout ligado ao scene graph"],
      ["wlr_seat", "seat0 pointer keyboard"],
      ["xdg_toplevel", "configure tiled nas duas saídas"],
    ]),
  };
}

export function portraitOutput(afterX: number): Output {
  return {
    id: "hdmi",
    connector: "HDMI-A-1",
    profile: "hdmi",
    label: "Retrato",
    x: afterX,
    y: 0,
    width: 1080,
    height: 1920,
    scale: 1,
    hz: 60,
    workspace: 1,
  };
}

export interface CardGeom {
  id: string;
  width: number;
  height: number;
}

export function layoutCards(
  outputs: Output[],
  stageW: number,
  stageH: number,
): { cards: CardGeom[]; scroll: boolean } {
  const pad = 16;
  const gap = 16;
  const label = 28;
  const availW = Math.max(220, stageW - pad * 2);
  const availH = Math.max(220, stageH - pad * 2);
  const aspects = outputs.map((output) => output.width / output.height);

  const row = () => {
    let height = availH - label;
    let widths = aspects.map((aspect) => height * aspect);
    const sum = widths.reduce((total, width) => total + width, 0) + gap * Math.max(0, outputs.length - 1);
    if (sum > availW) {
      const scale = availW / sum;
      height *= scale;
      widths = widths.map((width) => width * scale);
    }
    return { height, widths };
  };

  if (outputs.length === 1) {
    const aspect = aspects[0] ?? 1;
    let height = availH - label;
    let width = height * aspect;
    if (width > availW) {
      width = availW;
      height = width / aspect;
    }
    return {
      scroll: false,
      cards: [{ id: outputs[0].id, width: Math.round(width), height: Math.round(height) }],
    };
  }

  const rowPlan = row();
  const useRow = stageW >= 960 && rowPlan.height >= 420;
  if (useRow) {
    return {
      scroll: false,
      cards: outputs.map((output, index) => ({
        id: output.id,
        width: Math.round(rowPlan.widths[index] ?? 320),
        height: Math.round(rowPlan.height),
      })),
    };
  }

  const maxH = Math.min(availH * 0.92, 620);
  return {
    scroll: true,
    cards: outputs.map((output, index) => {
      const aspect = aspects[index] ?? 1;
      let height = Math.min(maxH, availW / aspect);
      let width = height * aspect;
      if (output.profile === "dsi") {
        height = Math.min(maxH, 720);
        width = height * aspect;
        if (width > availW) {
          width = Math.min(availW, 420);
          height = width / aspect;
        }
      }
      return { id: output.id, width: Math.round(width), height: Math.round(height) };
    }),
  };
}
