import { create } from "zustand";
import {
  admitToSplit,
  appSpec,
  createScene,
  emptySplit,
  focusForWorkspace,
  pinSplit,
  portraitOutput,
  repairSplit,
  touchStaysOnPhone,
  type AppKind,
  type ClientWindow,
  type LayoutPolicy,
  type PresetId,
  type Scene,
  type ShellMode,
  type SplitState,
} from "@/compositor/model";

interface Actions {
  setPreset: (preset: PresetId) => void;
  setLayout: (layout: LayoutPolicy) => void;
  setGaps: (gaps: number) => void;
  setMasterRatio: (masterRatio: number) => void;
  setFocusFollows: (focusFollows: boolean) => void;
  focusOutput: (outputId: string) => void;
  focusWindow: (id: string, fromPointer?: boolean) => void;
  spawn: (app: AppKind, outputId?: string) => void;
  close: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleFloat: (id: string) => void;
  floatAt: (id: string, geom: Partial<Pick<ClientWindow, "fx" | "fy" | "fw" | "fh">>) => void;
  nestWindow: (id: string) => void;
  toggleMaximized: (id: string) => void;
  toggleFullscreen: (id: string) => void;
  setWorkspace: (outputId: string, workspace: number, focusId?: string) => void;
  moveToWorkspace: (id: string, workspace: number) => void;
  moveToOutput: (id: string, outputId: string) => void;
  reorderBefore: (id: string, beforeId: string) => void;
  setFloatGeom: (id: string, geom: Partial<Pick<ClientWindow, "fx" | "fy" | "fw" | "fh">>) => void;
  focusNeighbor: (step: number) => void;
  addPortrait: () => void;
  removeOutput: (outputId: string) => void;
  setOverview: (overview: boolean) => void;
  toggleSplit: () => void;
  setSplitRatio: (splitRatio: number) => void;
  toggleKeyboard: () => void;
  setShell: (outputId: string, mode: ShellMode) => void;
  setDockOn: (outputIds: string[] | null) => void;
  typeKey: (key: string) => void;
  pointSurface: (
    id: string,
    x: number,
    y: number,
    phase: "down" | "move" | "up",
    kind: "touch" | "mouse",
    hit?: string,
  ) => void;
  reset: () => void;
}

export type CompositorStore = Scene & Actions;

function withEvent(scene: Scene, iface: string, msg: string): Pick<Scene, "events" | "eventSeq"> {
  const eventSeq = scene.eventSeq + 1;
  return {
    eventSeq,
    events: [{ id: eventSeq, iface, msg }, ...scene.events].slice(0, 32),
  };
}

function slotsOf(scene: Scene): SplitState {
  return {
    split: scene.split,
    splitPrimaryId: scene.splitPrimaryId,
    splitSecondaryId: scene.splitSecondaryId,
  };
}

function retitle(windows: ClientWindow[], id: string, app: AppKind): string {
  const spec = appSpec(app);
  const same = windows.filter((win) => win.app === app).length;
  return same > 1 ? `${spec.title} · ${same}` : spec.title;
}

export const useCompositor = create<CompositorStore>((set, get) => ({
  ...createScene("mesa"),

  setPreset: (preset) => {
    const current = get();
    set(
      createScene(preset, {
        layout: current.layout,
        gaps: current.gaps,
        masterRatio: current.masterRatio,
        focusFollows: current.focusFollows,
        dockOn: current.dockOn,
      }),
    );
  },

  setLayout: (layout) => {
    const names: Record<LayoutPolicy, string> = {
      mestre: "master-stack",
      grade: "grade",
      monoculo: "monocle",
      flutuante: "floating",
    };
    set((scene) => ({
      layout,
      ...withEvent(scene, "orbit_arrange", `política ${names[layout]}`),
    }));
  },

  setGaps: (gaps) => set({ gaps }),
  setMasterRatio: (masterRatio) => set({ masterRatio }),
  setFocusFollows: (focusFollows) =>
    set((scene) => ({
      focusFollows,
      ...withEvent(
        scene,
        "wl_pointer",
        focusFollows ? "foco segue o ponteiro" : "foco no clique",
      ),
    })),

  focusOutput: (outputId) => {
    const output = get().outputs.find((item) => item.id === outputId);
    if (!output) return;
    set((scene) => ({
      focusedOutputId: outputId,
      ...withEvent(scene, "wlr_cursor", `enter ${output.connector}`),
    }));
  },

  focusWindow: (id, fromPointer) => {
    const scene = get();
    const win = scene.windows.find((item) => item.id === id);
    if (!win) return;
    if (fromPointer && !scene.focusFollows) return;
    const waking = Boolean(win.minimized);
    const windows = waking
      ? scene.windows.map((item) => (item.id === id ? { ...item, minimized: false } : item))
      : scene.windows;
    const slots = admitToSplit(scene.outputs, slotsOf(scene), scene.focusedId, win);
    if (
      !waking &&
      scene.focusedId === id &&
      scene.focusedOutputId === win.outputId &&
      slots.splitPrimaryId === scene.splitPrimaryId &&
      slots.splitSecondaryId === scene.splitSecondaryId
    ) {
      return;
    }
    const output = scene.outputs.find((item) => item.id === win.outputId);
    set({
      windows,
      focusedId: id,
      focusedOutputId: win.outputId,
      ...slots,
      ...withEvent(
        scene,
        "xdg_toplevel",
        `activated ${win.appId} em ${output?.connector ?? win.outputId}`,
      ),
    });
  },

  spawn: (app, outputId) => {
    const scene = get();
    const targetId = outputId ?? scene.focusedOutputId;
    const output = scene.outputs.find((item) => item.id === targetId) ?? scene.outputs[0];
    if (!output) return;
    const seq = scene.seq + 1;
    const id = `c${seq}`;
    const siblings = scene.windows.filter(
      (win) => win.outputId === output.id && win.workspace === output.workspace,
    );
    const spec = appSpec(app);
    const created: ClientWindow = {
      id,
      app,
      title: spec.title,
      appId: spec.appId,
      outputId: output.id,
      workspace: output.workspace,
      floating: scene.layout === "flutuante",
      fullscreen: false,
      maximized: false,
      minimized: false,
      fx: 0.07 + (siblings.length % 4) * 0.04,
      fy: 0.08 + (siblings.length % 4) * 0.05,
      fw: output.profile === "dsi" ? 0.92 : 0.48,
      fh: output.profile === "dsi" ? 0.7 : 0.56,
      order: siblings.reduce((max, win) => Math.max(max, win.order), -1) + 1,
      draft: "",
      log: "",
      hit: "",
    };
    const windows = [...scene.windows, created];
    created.title = retitle(windows, id, app);
    const slots = admitToSplit(scene.outputs, slotsOf(scene), scene.focusedId, created);
    set({
      windows: windows.map((win) => (win.id === id ? created : win)),
      seq,
      focusedId: id,
      focusedOutputId: output.id,
      overview: false,
      ...slots,
      ...withEvent(scene, "xdg_toplevel", `map ${created.appId} → ${output.connector} espaço ${output.workspace}`),
    });
  },

  close: (id) => {
    const scene = get();
    const win = scene.windows.find((item) => item.id === id);
    if (!win) return;
    const windows = scene.windows.filter((item) => item.id !== id);
    const slots = repairSplit(scene.outputs, scene.windows, windows, slotsOf(scene), id);
    const stayedId =
      id === scene.splitPrimaryId ? scene.splitSecondaryId : id === scene.splitSecondaryId ? scene.splitPrimaryId : null;
    const stayed = stayedId
      ? windows.find((item) => item.id === stayedId && item.outputId === win.outputId && item.workspace === win.workspace)
      : null;
    const next =
      stayed ??
      windows.find((item) => item.outputId === win.outputId && item.workspace === win.workspace && !item.minimized) ??
      null;
    set({
      windows,
      ...slots,
      focusedId: scene.focusedId === id ? (next?.id ?? null) : scene.focusedId,
      ...withEvent(scene, "xdg_toplevel", `close ${win.appId}`),
    });
  },

  minimizeWindow: (id) => {
    const scene = get();
    const win = scene.windows.find((item) => item.id === id);
    if (!win || win.minimized) return;
    const windows = scene.windows.map((item) =>
      item.id === id ? { ...item, minimized: true, fullscreen: false, maximized: false } : item,
    );
    const next = focusForWorkspace(windows, null, win.outputId, win.workspace);
    set({
      windows,
      focusedId: scene.focusedId === id ? next : scene.focusedId,
      ...withEvent(scene, "xdg_toplevel", `set_minimized ${win.appId}`),
    });
  },

  toggleFloat: (id) => {
    set((scene) => {
      const win = scene.windows.find((item) => item.id === id);
      if (!win) return scene;
      const floating = !win.floating;
      return {
        windows: scene.windows.map((item) => (item.id === id ? { ...item, floating, fullscreen: false, maximized: false } : item)),
        focusedId: id,
        ...withEvent(
          scene,
          "xdg_toplevel",
          floating ? `unset tiled ${win.appId}` : `set tiled ${win.appId}`,
        ),
      };
    });
  },

  floatAt: (id, geom) => {
    set((scene) => {
      const win = scene.windows.find((item) => item.id === id);
      if (!win) return scene;
      return {
        windows: scene.windows.map((item) =>
          item.id === id ? { ...item, floating: true, fullscreen: false, maximized: false, ...geom } : item,
        ),
        focusedId: id,
        focusedOutputId: win.outputId,
        ...withEvent(scene, "xdg_toplevel", `unset tiled ${win.appId}`),
      };
    });
  },

  nestWindow: (id) => {
    set((scene) => {
      const win = scene.windows.find((item) => item.id === id);
      if (!win) return scene;
      const nested = scene.layout === "grade" && !win.floating && !win.maximized && !win.fullscreen;
      const windows = scene.windows.map((item) =>
        item.outputId === win.outputId && item.workspace === win.workspace && !item.minimized
          ? { ...item, floating: nested, fullscreen: false, maximized: false }
          : item,
      );
      return {
        windows,
        layout: nested ? scene.layout : "grade",
        focusedId: id,
        focusedOutputId: win.outputId,
        ...withEvent(
          scene,
          "xdg_toplevel",
          nested ? `unset tiled em ${win.outputId}` : `tiled lado a lado em ${win.outputId}`,
        ),
      };
    });
  },

  toggleMaximized: (id) => {
    set((scene) => {
      const win = scene.windows.find((item) => item.id === id);
      if (!win) return scene;
      const maximized = !win.maximized;
      return {
        windows: scene.windows.map((item) => {
          if (item.id === id) return { ...item, maximized, fullscreen: false };
          if (maximized && item.outputId === win.outputId) return { ...item, maximized: false, fullscreen: false };
          return item;
        }),
        focusedId: id,
        focusedOutputId: win.outputId,
        ...withEvent(scene, "xdg_toplevel", maximized ? `maximized ${win.appId}` : `unset maximized ${win.appId}`),
      };
    });
  },

  toggleFullscreen: (id) => {
    set((scene) => {
      const win = scene.windows.find((item) => item.id === id);
      if (!win) return scene;
      const fullscreen = !win.fullscreen;
      return {
        windows: scene.windows.map((item) => {
          if (item.id === id) return { ...item, fullscreen, maximized: false };
          if (fullscreen && item.outputId === win.outputId) return { ...item, fullscreen: false, maximized: false };
          return item;
        }),
        focusedId: id,
        focusedOutputId: win.outputId,
        ...withEvent(
          scene,
          "xdg_toplevel",
          fullscreen ? `fullscreen ${win.appId}` : `unset fullscreen ${win.appId}`,
        ),
      };
    });
  },

  setWorkspace: (outputId, workspace, focusId) => {
    set((scene) => {
      const output = scene.outputs.find((item) => item.id === outputId);
      if (!output || output.workspace === workspace) return scene;
      const outputs = scene.outputs.map((item) => (item.id === outputId ? { ...item, workspace } : item));
      const onSpace = scene.windows.some((win) => win.id === focusId && win.outputId === outputId && win.workspace === workspace);
      const focusedId = onSpace
        ? (focusId ?? null)
        : focusForWorkspace(scene.windows, scene.focusedId, outputId, workspace);
      const previous = scene.windows.find((win) => win.id === scene.focusedId);
      const next = scene.windows.find((win) => win.id === focusedId);
      let eventSeq = scene.eventSeq;
      let events = scene.events;
      const push = (iface: string, msg: string) => {
        eventSeq += 1;
        events = [{ id: eventSeq, iface, msg }, ...events].slice(0, 32);
      };
      if (!focusedId && previous && previous.outputId === outputId) {
        push("wl_keyboard", `leave ${previous.appId}`);
      } else if (next && next.id !== scene.focusedId) {
        push("xdg_toplevel", `activated ${next.appId} em ${output.connector}`);
      }
      push("orbit_arrange", `${output.connector} espaço ${workspace}`);
      const contactWin = scene.contact
        ? scene.windows.find((win) => win.id === scene.contact?.windowId)
        : undefined;
      const contactHost = contactWin ? outputs.find((item) => item.id === contactWin.outputId) : undefined;
      const contact =
        contactWin && contactHost && contactWin.workspace === contactHost.workspace ? scene.contact : null;
      return {
        outputs,
        focusedOutputId: outputId,
        focusedId,
        contact,
        events,
        eventSeq,
      };
    });
  },

  moveToWorkspace: (id, workspace) => {
    set((scene) => {
      const win = scene.windows.find((item) => item.id === id);
      if (!win) return scene;
      const windows = scene.windows.map((item) => (item.id === id ? { ...item, workspace } : item));
      const outputs = scene.outputs.map((item) =>
        item.id === win.outputId ? { ...item, workspace } : item,
      );
      return {
        windows,
        outputs,
        focusedId: id,
        ...repairSplit(outputs, scene.windows, windows, slotsOf(scene), id),
        ...withEvent(scene, "orbit_arrange", `${win.appId} → espaço ${workspace}`),
      };
    });
  },

  moveToOutput: (id, outputId) => {
    set((scene) => {
      const win = scene.windows.find((item) => item.id === id);
      const output = scene.outputs.find((item) => item.id === outputId);
      if (!win || !output || win.outputId === outputId) return scene;
      const order =
        scene.windows
          .filter((item) => item.outputId === outputId && item.workspace === output.workspace)
          .reduce((max, item) => Math.max(max, item.order), -1) + 1;
      const windows = scene.windows.map((item) =>
        item.id === id ? { ...item, outputId, workspace: output.workspace, order, fullscreen: false, maximized: false } : item,
      );
      return {
        windows,
        focusedId: id,
        focusedOutputId: outputId,
        ...repairSplit(scene.outputs, scene.windows, windows, slotsOf(scene), id),
        ...withEvent(scene, "wlr_scene", `reparent ${win.appId} → ${output.connector}`),
      };
    });
  },

  reorderBefore: (id, beforeId) => {
    set((scene) => {
      const win = scene.windows.find((item) => item.id === id);
      if (!win || id === beforeId) return scene;
      const group = scene.windows
        .filter((item) => item.outputId === win.outputId && item.workspace === win.workspace)
        .sort((a, b) => a.order - b.order)
        .map((item) => item.id)
        .filter((item) => item !== id);
      const index = group.indexOf(beforeId);
      if (index < 0) return scene;
      group.splice(index, 0, id);
      const orderOf = new Map(group.map((item, itemIndex) => [item, itemIndex]));
      return {
        windows: scene.windows.map((item) =>
          orderOf.has(item.id) ? { ...item, order: orderOf.get(item.id) ?? item.order } : item,
        ),
        focusedId: id,
        ...withEvent(scene, "orbit_arrange", `troca ordem de ${win.appId}`),
      };
    });
  },

  setFloatGeom: (id, geom) => {
    set((scene) => ({
      windows: scene.windows.map((item) => (item.id === id ? { ...item, ...geom } : item)),
    }));
  },

  focusNeighbor: (step) => {
    const scene = get();
    const phone = scene.outputs.find((item) => item.profile === "dsi");
    const primary = scene.windows.find((win) => win.id === scene.splitPrimaryId);
    const secondary = scene.windows.find((win) => win.id === scene.splitSecondaryId);
    const pairOnPhone =
      scene.split &&
      phone &&
      scene.focusedOutputId === phone.id &&
      primary &&
      secondary &&
      primary.outputId === phone.id &&
      secondary.outputId === phone.id &&
      primary.workspace === phone.workspace &&
      secondary.workspace === phone.workspace;
    if (pairOnPhone) {
      const pair = [primary.id, secondary.id];
      const index = pair.indexOf(scene.focusedId ?? "");
      const next = index < 0 ? pair[step < 0 ? 1 : 0] : pair[(index + step + pair.length) % pair.length];
      if (next) get().focusWindow(next);
      return;
    }
    const output = scene.outputs.find((item) => item.id === scene.focusedOutputId);
    if (!output) return;
    const list = scene.windows
      .filter((win) => win.outputId === output.id && win.workspace === output.workspace && !win.minimized)
      .sort((a, b) => a.order - b.order);
    if (list.length === 0) return;
    const index = Math.max(0, list.findIndex((win) => win.id === scene.focusedId));
    const next = list[(index + step + list.length) % list.length];
    if (!next) return;
    get().focusWindow(next.id);
  },

  addPortrait: () => {
    set((scene) => {
      if (scene.outputs.some((output) => output.id === "hdmi") || scene.preset === "celular") return scene;
      const after = scene.outputs.reduce((max, output) => Math.max(max, output.x + output.width), 0);
      const output = portraitOutput(after);
      return {
        outputs: [...scene.outputs, output],
        ...withEvent(scene, "wlr_output", `${output.connector} 1080×1920 transform normal, layout x=${output.x}`),
      };
    });
  },

  removeOutput: (outputId) => {
    set((scene) => {
      if (scene.outputs.length < 2) return scene;
      const output = scene.outputs.find((item) => item.id === outputId);
      if (!output) return scene;
      const fallback = scene.outputs.find((item) => item.id !== outputId);
      if (!fallback) return scene;
      const span = output.width;
      const right = output.x + span;
      const outputs = scene.outputs
        .filter((item) => item.id !== outputId)
        .map((item) => (item.x >= right ? { ...item, x: item.x - span } : item));
      const base =
        scene.windows
          .filter((win) => win.outputId === fallback.id && win.workspace === fallback.workspace)
          .reduce((max, win) => Math.max(max, win.order), -1) + 1;
      let taken = 0;
      const windows = scene.windows.map((win) => {
        if (win.outputId !== outputId) return win;
        const order = base + taken;
        taken += 1;
        return { ...win, outputId: fallback.id, workspace: fallback.workspace, fullscreen: false, maximized: false, order };
      });
      const parked = scene.dockOn?.filter((item) => item !== outputId) ?? null;
      return {
        outputs,
        windows,
        dockOn: parked && parked.length > 0 ? parked : null,
        focusedOutputId: scene.focusedOutputId === outputId ? fallback.id : scene.focusedOutputId,
        ...(output.profile === "dsi"
          ? emptySplit()
          : repairSplit(outputs, scene.windows, windows, slotsOf(scene), null)),
        ...withEvent(
          scene,
          "wlr_output",
          taken > 0
            ? `destroy ${output.connector}, ${taken} toplevels → ${fallback.connector}`
            : `destroy ${output.connector}`,
        ),
      };
    });
  },

  setOverview: (overview) =>
    set((scene) => ({
      overview,
      ...withEvent(scene, "orbit_gesture", overview ? "overview no DSI-1" : "overview fechado"),
    })),

  toggleSplit: () =>
    set((scene) => {
      if (scene.split) {
        return {
          ...emptySplit(),
          overview: false,
          ...withEvent(scene, "orbit_arrange", "foco único no telemóvel"),
        };
      }
      const pinned = pinSplit(scene.windows, scene.outputs, scene.focusedId);
      if (!pinned.split) {
        return {
          ...withEvent(scene, "orbit_arrange", "sem segundo toplevel para dividir"),
        };
      }
      const phone = scene.outputs.find((output) => output.profile === "dsi");
      const top = scene.windows.find((win) => win.id === pinned.splitPrimaryId);
      const bottom = scene.windows.find((win) => win.id === pinned.splitSecondaryId);
      return {
        ...pinned,
        overview: false,
        focusedOutputId: phone?.id ?? scene.focusedOutputId,
        ...withEvent(scene, "orbit_arrange", `par ${top?.appId ?? "?"} / ${bottom?.appId ?? "?"}`),
      };
    }),

  setSplitRatio: (splitRatio) => set({ splitRatio }),

  toggleKeyboard: () =>
    set((scene) => ({
      keyboard: !scene.keyboard,
      ...withEvent(
        scene,
        "zwp_text_input_v3",
        scene.keyboard ? "disable" : "enable no cliente focado",
      ),
    })),

  setShell: (outputId, mode) =>
    set((scene) => {
      const shell = { ...scene.shell };
      if (mode === "session") delete shell[outputId];
      else shell[outputId] = mode;
      return { shell };
    }),

  setDockOn: (outputIds) =>
    set((scene) => {
      const dockOn = outputIds && outputIds.length > 0 ? outputIds : null;
      const where = dockOn ? dockOn.join(" ") : "todas";
      return { dockOn, ...withEvent(scene, "wlr_output", `doca em ${where}`) };
    }),

  typeKey: (key) => {
    const scene = get();
    if (!scene.focusedId) return;
    const win = scene.windows.find((item) => item.id === scene.focusedId);
    const output = win ? scene.outputs.find((item) => item.id === win.outputId) : undefined;
    if (!win || !output || win.workspace !== output.workspace || win.minimized) return;
    if (scene.shell[output.id] && scene.shell[output.id] !== "session") return;
    if (key === "\n") {
      const cmd = win.draft.trim();
      let reply = "";
      if (win.app === "terminal") {
        if (cmd === "outputs" || cmd === "get_outputs") {
          reply = scene.outputs
            .map(
              (output) =>
                `${output.connector}  ${output.width}×${output.height}  @${output.hz}  scale ${output.scale.toFixed(2)}  espaço ${output.workspace}\n`,
            )
            .join("");
        } else if (cmd === "clientes") {
          reply =
            scene.windows
              .map((item) => `${item.appId}  ${item.outputId}  espaço ${item.workspace}\n`)
              .join("") || "(nenhum toplevel)\n";
        } else if (cmd === "ajuda" || cmd === "help") {
          reply = "outputs · clientes · ajuda\n";
        } else if (cmd.length > 0) {
          reply = `sh: ${cmd.split(/\s+/)[0]}: não encontrado\n`;
        }
      }
      const block =
        win.app === "terminal"
          ? `${win.log}orbit@seat0:~$ ${win.draft}\n${reply}`
          : `${win.log}${win.draft}\n`;
      set({
        windows: scene.windows.map((item) =>
          item.id === win.id ? { ...item, draft: "", log: block.slice(-2400) } : item,
        ),
      });
      return;
    }
    set({
      windows: scene.windows.map((item) => {
        if (item.id !== scene.focusedId) return item;
        if (key === "backspace") return { ...item, draft: item.draft.slice(0, -1) };
        return { ...item, draft: `${item.draft}${key}`.slice(0, 240) };
      }),
    });
  },

  pointSurface: (id, x, y, phase, kind, hit) => {
    const scene = get();
    const win = scene.windows.find((item) => item.id === id);
    if (!win) return;
    if (!touchStaysOnPhone(scene.outputs, win.outputId, kind)) return;
    if (phase === "down") get().focusWindow(id);
    const current = get();
    const output = current.outputs.find((item) => item.id === win.outputId);
    const sx = Math.round(Math.min(1, Math.max(0, x)) * (output?.width ?? 1));
    const sy = Math.round(Math.min(1, Math.max(0, y)) * (output?.height ?? 1));
    const contact = {
      windowId: id,
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
      down: phase !== "up",
      kind,
    };
    const windows =
      phase === "up" && hit
        ? current.windows.map((item) => (item.id === id ? { ...item, hit } : item))
        : current.windows;
    set({
      contact,
      windows,
      ...(phase === "move"
        ? {}
        : withEvent(
            current,
            "wl_pointer",
            `button 272 ${phase === "down" ? "press" : "release"} ${sx},${sy} ${win.appId}`,
          )),
    });
  },

  reset: () => {
    const scene = get();
    set(
      createScene(scene.preset, {
        layout: scene.layout,
        gaps: scene.gaps,
        masterRatio: scene.masterRatio,
        focusFollows: scene.focusFollows,
        dockOn: scene.dockOn,
      }),
    );
  },
}));
