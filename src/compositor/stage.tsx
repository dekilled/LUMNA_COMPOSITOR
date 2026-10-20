import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { Columns2, Expand, Minus, Square, X } from "lucide-react";
import {
  layoutCards,
  touchStaysOnPhone,
  windowsOn,
  type ClientWindow,
  type Output,
} from "@/compositor/model";
import { useCompositor } from "@/compositor/store";
import { AppIcon, WindowBody } from "@/compositor/clients";
import {
  DesktopBar,
  DesktopDock,
  DesktopHome,
  DesktopStore,
  LockScreen,
  PhoneApps,
  PhoneHome,
  PhoneNav,
  shellOf,
} from "@/shell/chrome";
import { OnScreenKeyboard, Overview, PhoneHandle, PhoneStatus } from "@/shell/phone";

type MoveDrag = {
  mode: "move";
  id: string;
  title: string;
  float: boolean;
  outputId: string;
  dx: number;
  dy: number;
  fw: number;
  fh: number;
  screenW: number;
  screenH: number;
  px: number;
  py: number;
  moved: boolean;
};

type ResizeDrag = {
  mode: "resize";
  id: string;
  fx: number;
  fy: number;
  fw: number;
  fh: number;
  startX: number;
  startY: number;
  rectW: number;
  rectH: number;
};

type Geom = { fx: number; fy: number; fw: number; fh: number };

type Fly = { id: string; left: number; top: number; width: number; height: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function useBox(ref: RefObject<HTMLDivElement | null>) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setBox({ w: element.clientWidth, h: element.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return box;
}

function hitTest(x: number, y: number, ignore: string) {
  let windowId: string | null = null;
  let outputId: string | null = null;
  for (const node of document.elementsFromPoint(x, y)) {
    if (!(node instanceof HTMLElement)) continue;
    if (!windowId && node.dataset.window && node.dataset.window !== ignore) {
      windowId = node.dataset.window;
    }
    if (!outputId && node.dataset.output) outputId = node.dataset.output;
  }
  return { windowId, outputId };
}

export function Stage() {
  const outputs = useCompositor((state) => state.outputs);
  const frame = useRef<HTMLDivElement>(null);
  const box = useBox(frame);
  const plan = layoutCards(outputs, box.w || 360, box.h || 480);
  const [ghost, setGhost] = useState<{ title: string; px: number; py: number } | null>(null);
  const [live, setLive] = useState<Record<string, Geom>>({});
  const [dropOutput, setDropOutput] = useState<string | null>(null);
  const [fly, setFly] = useState<Fly | null>(null);
  const liveRef = useRef(live);
  liveRef.current = live;
  const dragRef = useRef<MoveDrag | ResizeDrag | null>(null);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (drag.mode === "resize") {
        const fw = clamp(drag.fw + (event.clientX - drag.startX) / drag.rectW, 0.24, 0.96);
        const fh = clamp(drag.fh + (event.clientY - drag.startY) / drag.rectH, 0.2, 0.94);
        setLive((current) => ({ ...current, [drag.id]: { fx: drag.fx, fy: drag.fy, fw, fh } }));
        return;
      }
      if (Math.abs(event.clientX - drag.px) + Math.abs(event.clientY - drag.py) > 5) {
        drag.moved = true;
      }
      if (!drag.moved) return;
      if (!drag.float) drag.float = true;
      setFly({
        id: drag.id,
        left: event.clientX - drag.dx,
        top: event.clientY - drag.dy,
        width: drag.screenW,
        height: drag.screenH,
      });
      setDropOutput(hitTest(event.clientX, event.clientY, drag.id).outputId);
    };

    const finish = (event: PointerEvent, commit: boolean) => {
      const drag = dragRef.current;
      dragRef.current = null;
      setGhost(null);
      setDropOutput(null);
      setFly(null);
      if (!drag || !commit || (drag.mode === "move" && !drag.moved)) {
        setLive({});
        return;
      }
      const store = useCompositor.getState();
      if (drag.mode === "resize") {
        const geom = liveRef.current[drag.id];
        if (geom) store.setFloatGeom(drag.id, geom);
        setLive({});
        return;
      }
      const hit = hitTest(event.clientX, event.clientY, drag.id);
      if (drag.float) {
        const targetId = hit.outputId ?? drag.outputId;
        const content = document.querySelector<HTMLElement>(`[data-content][data-output="${targetId}"]`);
        const rect = content?.getBoundingClientRect();
        const geom =
          rect && rect.width > 8 && rect.height > 8
            ? {
                fw: clamp(drag.screenW / rect.width, 0.24, 0.96),
                fh: clamp(drag.screenH / rect.height, 0.2, 0.94),
                fx: clamp((event.clientX - drag.dx - rect.left) / rect.width, 0, 1 - clamp(drag.screenW / rect.width, 0.24, 0.96)),
                fy: clamp((event.clientY - drag.dy - rect.top) / rect.height, 0, 1 - clamp(drag.screenH / rect.height, 0.2, 0.94)),
              }
            : {};
        store.floatAt(drag.id, geom);
        if (targetId !== drag.outputId) store.moveToOutput(drag.id, targetId);
        setLive({});
        return;
      }
      if (hit.outputId && hit.outputId !== drag.outputId) {
        store.moveToOutput(drag.id, hit.outputId);
      } else if (hit.windowId) {
        store.reorderBefore(drag.id, hit.windowId);
      }
      setLive({});
    };

    const onUp = (event: PointerEvent) => finish(event, true);
    const onCancel = (event: PointerEvent) => finish(event, false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("pointercancel", onCancel, true);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onCancel, true);
    };
  }, []);

  const beginMove = (event: ReactPointerEvent, win: ClientWindow) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("[data-nodrag]")) return;
    event.preventDefault();
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      /* a synthesized pointer can already be gone */
    }
    const store = useCompositor.getState();
    store.focusWindow(win.id);
    const content = (event.currentTarget as HTMLElement).closest("[data-content]") as HTMLElement | null;
    const rect = content?.getBoundingClientRect();
    const frame = (event.currentTarget as HTMLElement).closest("[data-window]") as HTMLElement | null;
    const frameRect = frame?.getBoundingClientRect();
    const geom = live[win.id] ?? { fx: win.fx, fy: win.fy, fw: win.fw, fh: win.fh };
    const float = win.floating || store.layout === "flutuante";
    dragRef.current = {
      mode: "move",
      id: win.id,
      title: win.title,
      float,
      outputId: win.outputId,
      dx: frameRect ? event.clientX - frameRect.left : 0,
      dy: frameRect ? event.clientY - frameRect.top : 0,
      fw: geom.fw,
      fh: geom.fh,
      screenW: frameRect?.width || (rect ? geom.fw * rect.width : 240),
      screenH: frameRect?.height || (rect ? geom.fh * rect.height : 160),
      px: event.clientX,
      py: event.clientY,
      moved: false,
    };
  };

  const beginResize = (event: ReactPointerEvent, win: ClientWindow) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      /* a synthesized pointer can already be gone */
    }
    const content = (event.currentTarget as HTMLElement).closest("[data-content]") as HTMLElement | null;
    const rect = content?.getBoundingClientRect();
    const geom = live[win.id] ?? { fx: win.fx, fy: win.fy, fw: win.fw, fh: win.fh };
    dragRef.current = {
      mode: "resize",
      id: win.id,
      ...geom,
      startX: event.clientX,
      startY: event.clientY,
      rectW: rect?.width || 1,
      rectH: rect?.height || 1,
    };
  };

  return (
    <div ref={frame} className="relative h-full min-h-0">
      <div
        className={
          plan.scroll
            ? "flex h-full flex-col items-center gap-4 overflow-auto p-3"
            : "flex h-full items-center justify-center gap-4 p-3"
        }
      >
        {outputs.map((output) => {
          const card = plan.cards.find((item) => item.id === output.id);
          if (!card) return null;
          return (
            <OutputView
              key={output.id}
              output={output}
              width={card.width}
              height={card.height}
              live={live}
              drop={dropOutput === output.id}
              flyId={fly?.id ?? null}
              onMove={beginMove}
              onResize={beginResize}
            />
          );
        })}
      </div>
      {ghost ? (
        <div
          className="pointer-events-none fixed z-50 rounded-md bg-accent px-3 py-2 text-xs font-medium text-ink"
          style={{ left: ghost.px + 12, top: ghost.py + 12 }}
        >
          {ghost.title}
        </div>
      ) : null}
      {fly ? <FlyWindow fly={fly} /> : null}
    </div>
  );
}

function FlyWindow({ fly }: { fly: Fly }) {
  const windows = useCompositor((state) => state.windows);
  const outputs = useCompositor((state) => state.outputs);
  const win = windows.find((item) => item.id === fly.id);
  if (!win) return null;
  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{ left: fly.left, top: fly.top, width: fly.width, height: fly.height }}
    >
      <WindowFrame
        win={win}
        focused
        outputs={outputs}
        onMove={() => undefined}
        onResize={() => undefined}
        floating={false}
      />
    </div>
  );
}

function OutputView({
  output,
  width,
  height,
  live,
  drop,
  flyId,
  onMove,
  onResize,
}: {
  output: Output;
  width: number;
  height: number;
  live: Record<string, Geom>;
  drop: boolean;
  flyId: string | null;
  onMove: (event: ReactPointerEvent, win: ClientWindow) => void;
  onResize: (event: ReactPointerEvent, win: ClientWindow) => void;
}) {
  const focusedOutputId = useCompositor((state) => state.focusedOutputId);
  const removeOutput = useCompositor((state) => state.removeOutput);
  const outputCount = useCompositor((state) => state.outputs.length);
  const focused = focusedOutputId === output.id;
  const scale = Number.isInteger(output.scale) ? `${output.scale}×` : `${output.scale.toFixed(1)}×`;

  return (
    <section className="shrink-0" style={{ width }} aria-label={output.connector}>
      <div className="mb-1 flex items-center gap-2 px-1 text-xs text-muted">
        <span className={`orbit-vsync size-1.5 rounded-full ${focused ? "bg-accent" : "bg-faint"}`} />
        <span className="font-mono text-fg">{output.connector}</span>
        <span className="truncate font-mono tabular-nums">
          {output.width}×{output.height} · {scale} · {output.hz} Hz
        </span>
        <span className="ml-auto font-mono text-faint">x {output.x}</span>
        {outputCount > 1 ? (
          <button
            type="button"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-elevated hover:text-fg"
            aria-label={`Desligar ${output.connector}`}
            onClick={() => removeOutput(output.id)}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
      <div
        data-output={output.id}
        className={`overflow-hidden rounded-lg bg-inset ${
          drop || focused ? "ring-2 ring-accent" : "ring-1 ring-border"
        }`}
        style={{ height }}
      >
        {output.profile === "dsi" ? (
          <PhoneScreen output={output} onMove={onMove} />
        ) : (
          <DesktopScreen output={output} live={live} flyId={flyId} onMove={onMove} onResize={onResize} />
        )}
      </div>
    </section>
  );
}

function DesktopScreen({
  output,
  live,
  flyId,
  onMove,
  onResize,
}: {
  output: Output;
  live: Record<string, Geom>;
  flyId: string | null;
  onMove: (event: ReactPointerEvent, win: ClientWindow) => void;
  onResize: (event: ReactPointerEvent, win: ClientWindow) => void;
}) {
  const scene = useCompositor();
  const group = windowsOn(scene, output.id);
  const shown = group.filter((win) => !win.minimized);
  const exclusive = shown.find((win) => win.fullscreen);
  const maximized = shown.find((win) => win.maximized);
  const solo = exclusive ?? maximized;
  const floatMode = scene.layout === "flutuante";
  const tiledAll = shown.filter((win) => !win.floating && !floatMode);
  const focusedTiled = tiledAll.find((win) => win.id === scene.focusedId) ?? tiledAll[0];
  const tiled = scene.layout === "monoculo" ? (focusedTiled ? [focusedTiled] : []) : tiledAll;
  const floats = shown.filter((win) => win.floating || floatMode);
  const mode = shellOf(scene.shell, output.id);
  const covering = mode === "home" || mode === "loja" || mode === "lock";
  const desk = shown.length === 0 && group.some((win) => win.minimized);

  return (
    <div className="flex h-full flex-col">
      {exclusive ? null : <DesktopBar output={output} />}
      <div
        data-content
        data-output={output.id}
        className="orbit-wallpaper relative min-h-0 flex-1"
        onPointerDown={() => scene.focusOutput(output.id)}
      >
        {covering ? (
          mode === "loja" ? (
            <DesktopStore outputId={output.id} />
          ) : mode === "lock" ? (
            <LockScreen outputId={output.id} />
          ) : (
            <DesktopHome outputId={output.id} />
          )
        ) : solo ? (
          <div className={flyId === solo.id ? "pointer-events-none h-full opacity-0" : "h-full"}>
            <WindowFrame
              win={solo}
              focused
              outputs={scene.outputs}
              onMove={onMove}
              onResize={onResize}
              floating={false}
              flush
              overlayChrome={Boolean(exclusive)}
            />
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            <div className="relative min-h-0 flex-1">
            {tiled.length > 0 ? (
              <TiledGrid
                windows={tiled}
                layout={scene.layout}
                gaps={0}
                ratio={scene.masterRatio}
                focusedId={scene.focusedId}
                outputs={scene.outputs}
                flyId={flyId}
                onMove={onMove}
              />
            ) : floats.length === 0 ? (
              desk ? null : <EmptyOutput output={output} />
            ) : null}
            {floats.map((win) => {
              const geom = live[win.id] ?? win;
              return (
                <div
                  key={win.id}
                  className={`absolute ${flyId === win.id ? "pointer-events-none opacity-0" : ""}`}
                  style={{
                    left: `${geom.fx * 100}%`,
                    top: `${geom.fy * 100}%`,
                    width: `${geom.fw * 100}%`,
                    height: `${geom.fh * 100}%`,
                    zIndex: win.id === scene.focusedId ? 20 : 10,
                  }}
                >
                  <WindowFrame
                    win={win}
                    focused={win.id === scene.focusedId}
                    outputs={scene.outputs}
                    onMove={onMove}
                    onResize={onResize}
                    floating
                  />
                </div>
              );
            })}
            </div>
            <div className="h-20 shrink-0" />
          </div>
        )}
        {mode === "lock" ? null : <DesktopDock outputId={output.id} peek={Boolean(solo)} />}
      </div>
    </div>
  );
}

function TiledGrid({
  windows,
  layout,
  gaps,
  ratio,
  focusedId,
  outputs,
  flyId,
  onMove,
}: {
  windows: ClientWindow[];
  layout: string;
  gaps: number;
  ratio: number;
  focusedId: string | null;
  outputs: Output[];
  flyId: string | null;
  onMove: (event: ReactPointerEvent, win: ClientWindow) => void;
}) {
  const count = windows.length;
  const grade = layout === "grade";
  const cols = grade ? Math.ceil(Math.sqrt(count)) : count === 1 ? 1 : 2;
  const rows = grade ? Math.ceil(count / cols) : count <= 1 ? 1 : count - 1;
  return (
    <div
      className="grid h-full"
      style={{
        padding: gaps,
        gap: gaps,
        gridTemplateColumns: grade
          ? `repeat(${cols}, minmax(0, 1fr))`
          : count === 1
            ? "1fr"
            : `${ratio}fr ${1 - ratio}fr`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {windows.map((win, index) => (
        <div
          key={win.id}
          className={`min-h-0 min-w-0 ${flyId === win.id ? "pointer-events-none opacity-0" : ""}`}
          style={
            !grade && count > 1 && index === 0
              ? { gridColumn: 1, gridRow: `1 / span ${rows}` }
              : !grade && count > 1
                ? { gridColumn: 2 }
                : undefined
          }
        >
          <WindowFrame
            win={win}
            focused={win.id === focusedId}
            outputs={outputs}
            onMove={onMove}
            onResize={() => undefined}
            floating={false}
            flush
          />
        </div>
      ))}
    </div>
  );
}

function PhoneScreen({
  output,
  onMove,
}: {
  output: Output;
  onMove: (event: ReactPointerEvent, win: ClientWindow) => void;
}) {
  const scene = useCompositor();
  const group = windowsOn(scene, output.id);
  const primary = group.find((win) => win.id === scene.splitPrimaryId);
  const secondary = group.find((win) => win.id === scene.splitSecondaryId);
  const showSplit = Boolean(scene.split && primary && secondary);
  const focused = group.find((win) => win.id === scene.focusedId) ?? primary ?? group[0];
  const mode = shellOf(scene.shell, output.id);
  const covering = mode !== "session";
  const exclusiveStatus = mode === "home" || mode === "lock" || mode === "apps" || mode === "loja";
  const statusInFlow = exclusiveStatus && !scene.overview;

  return (
    <div className="relative flex h-full flex-col bg-bg" data-workspace={output.workspace}>
      {statusInFlow ? <PhoneStatus /> : null}
      <div data-content data-output={output.id} className="orbit-wallpaper relative min-h-0 flex-1">
        {scene.overview ? (
          <Overview output={output} />
        ) : covering ? (
          mode === "apps" ? (
            <PhoneApps outputId={output.id} />
          ) : mode === "loja" ? (
            <DesktopStore outputId={output.id} />
          ) : mode === "lock" ? (
            <LockScreen outputId={output.id} />
          ) : (
            <PhoneHome outputId={output.id} />
          )
        ) : showSplit && primary && secondary ? (
          <div className="relative flex h-full min-h-0 flex-col">
            <div className="min-h-0" style={{ flex: scene.splitRatio }}>
              <WindowFrame
                win={primary}
                focused={primary.id === scene.focusedId}
                outputs={scene.outputs}
                onMove={onMove}
                onResize={() => undefined}
                floating={false}
                bare
              />
            </div>
            <div className="min-h-0" style={{ flex: 1 - scene.splitRatio }}>
              <WindowFrame
                win={secondary}
                focused={secondary.id === scene.focusedId}
                outputs={scene.outputs}
                onMove={onMove}
                onResize={() => undefined}
                floating={false}
                bare
              />
            </div>
            <SplitDivider ratio={scene.splitRatio} />
          </div>
        ) : focused ? (
          <WindowFrame win={focused} focused outputs={scene.outputs} onMove={onMove} onResize={() => undefined} floating={false} bare />
        ) : (
          <EmptyOutput output={output} />
        )}
        {statusInFlow ? null : (
          <PhoneStatus
            overlay
            onDrag={
              !covering && !scene.overview && focused
                ? (event) => {
                    if (event.pointerType === "touch") return;
                    onMove(event, focused);
                  }
                : undefined
            }
          />
        )}
        {mode === "lock" ? null : <PhoneHandle outputId={output.id} />}
        {covering && !scene.overview ? <PhoneNav outputId={output.id} /> : null}
      </div>
      {scene.keyboard && !scene.overview && !covering ? <OnScreenKeyboard /> : null}
    </div>
  );
}

function SplitDivider({ ratio }: { ratio: number }) {
  const [dragging, setDragging] = useState(false);
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label="Ajustar divisão"
      aria-valuemin={28}
      aria-valuemax={72}
      aria-valuenow={Math.round(ratio * 100)}
      className="absolute inset-x-0 z-20 flex h-11 -translate-y-1/2 cursor-row-resize touch-none items-center justify-center"
      style={{ top: `${ratio * 100}%` }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const parent = event.currentTarget.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        setDragging(true);
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          /* synthesized */
        }
        const move = (pointer: PointerEvent) => {
          const next = clamp((pointer.clientY - rect.top) / Math.max(1, rect.height), 0.28, 0.72);
          useCompositor.getState().setSplitRatio(next);
        };
        const up = () => {
          setDragging(false);
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      }}
    >
      <span className={`h-px w-full ${dragging ? "bg-accent" : "bg-border"}`} />
    </div>
  );
}


function WindowButtons({
  title,
  nested,
  maximized,
  fullscreen,
  onNest,
  onMaximize,
  onFull,
  onClose,
  onMinimize,
}: {
  title: string;
  nested: boolean;
  maximized: boolean;
  fullscreen: boolean;
  onNest: () => void;
  onMaximize: () => void;
  onFull: () => void;
  onClose: () => void;
  onMinimize: () => void;
}) {
  return (
    <span className="ml-auto flex items-center text-muted">
      <button type="button" data-nodrag aria-label={`Minimizar ${title}`} className="inline-flex size-8 items-center justify-center hover:text-fg" onClick={onMinimize}>
        <Minus className="size-3.5" />
      </button>
      <button
        type="button"
        data-nodrag
        aria-label={`Aninhar ${title}`}
        aria-pressed={nested}
        className={`inline-flex size-8 items-center justify-center hover:text-fg ${nested ? "text-accent" : ""}`}
        onClick={onNest}
      >
        <Columns2 className="size-3.5" />
      </button>
      <button
        type="button"
        data-nodrag
        aria-label={maximized ? `Restaurar ${title}` : `Maximizar ${title}`}
        aria-pressed={maximized}
        className={`inline-flex size-8 items-center justify-center hover:text-fg ${maximized ? "text-accent" : ""}`}
        onClick={onMaximize}
      >
        <Square className="size-3" />
      </button>
      <button
        type="button"
        data-nodrag
        aria-label={fullscreen ? `Sair do ecrã inteiro` : `Ecrã inteiro`}
        aria-pressed={fullscreen}
        className={`inline-flex size-8 items-center justify-center hover:text-fg ${fullscreen ? "text-accent" : ""}`}
        onClick={onFull}
      >
        <Expand className="size-3.5" />
      </button>
      <button type="button" data-nodrag aria-label={`Fechar ${title}`} className="inline-flex size-8 items-center justify-center hover:text-fg" onClick={onClose}>
        <X className="size-3.5" />
      </button>
    </span>
  );
}

function WindowFrame({
  win,
  focused,
  outputs,
  onMove,
  onResize,
  floating,
  flush = false,
  overlayChrome = false,
  bare = false,
}: {
  win: ClientWindow;
  focused: boolean;
  outputs: Output[];
  onMove: (event: ReactPointerEvent, win: ClientWindow) => void;
  onResize: (event: ReactPointerEvent, win: ClientWindow) => void;
  floating: boolean;
  flush?: boolean;
  overlayChrome?: boolean;
  bare?: boolean;
}) {
  const focusWindow = useCompositor((state) => state.focusWindow);
  const pointSurface = useCompositor((state) => state.pointSurface);
  const close = useCompositor((state) => state.close);
  const toggleMaximized = useCompositor((state) => state.toggleMaximized);
  const toggleFullscreen = useCompositor((state) => state.toggleFullscreen);
  const layout = useCompositor((state) => state.layout);
  const phonePinned = useCompositor((state) => state.outputs.some((output) => output.profile === "dsi"));
  const nested = !win.floating && !win.fullscreen && !win.maximized && layout !== "flutuante" && layout !== "monoculo";
  const [chromeOn, setChromeOn] = useState(false);

  const kindOf = (event: ReactPointerEvent) => (event.pointerType === "touch" ? "touch" : "mouse");

  const deliver = (event: ReactPointerEvent, phase: "down" | "move" | "up") => {
    const surface = event.currentTarget as HTMLElement;
    const rect = surface.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    let hit = "";
    if (phase === "up") {
      const node = document.elementFromPoint(event.clientX, event.clientY);
      const marked = node instanceof Element ? node.closest("[data-hit]") : null;
      if (marked instanceof HTMLElement && surface.contains(marked) && marked.dataset.hit) {
        hit = marked.dataset.hit;
      }
    }
    pointSurface(win.id, x, y, phase, kindOf(event), hit || undefined);
  };

  return (
    <article
      data-window={win.id}
      onPointerDown={(event) => {
        if (!touchStaysOnPhone(useCompositor.getState().outputs, win.outputId, kindOf(event))) {
          event.stopPropagation();
          return;
        }
        focusWindow(win.id);
      }}
      onPointerEnter={(event) => {
        if (!touchStaysOnPhone(useCompositor.getState().outputs, win.outputId, kindOf(event))) return;
        focusWindow(win.id, true);
      }}
      className={`relative flex h-full min-h-0 flex-col overflow-hidden bg-elevated ${
        flush
          ? `rounded-none ${focused ? "shadow-[inset_0_0_0_1px_var(--color-accent)]" : "shadow-[inset_0_0_0_1px_var(--color-faint)]"}`
          : `rounded-xl ring-1 ${focused ? "ring-accent" : "ring-faint"}`
      }`}
    >
      {bare ? null : overlayChrome ? (
        <div
          className="absolute inset-x-0 top-0 z-40"
          onPointerEnter={() => setChromeOn(true)}
          onPointerLeave={() => setChromeOn(false)}
        >
          <div className="h-2" />
          <header
            className={`absolute inset-x-0 top-0 flex h-10 items-center gap-2 border-b border-border bg-surface/95 px-3 transition-transform duration-200 ${
              chromeOn ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <AppIcon app={win.app} className="size-3.5 text-accent" />
            <span className="truncate text-xs text-fg">{win.title}</span>
            <WindowButtons
              title={win.title}
              nested={false}
              maximized={false}
              fullscreen
              onMinimize={() => useCompositor.getState().minimizeWindow(win.id)}
              onNest={() => useCompositor.getState().nestWindow(win.id)}
              onMaximize={() => toggleMaximized(win.id)}
              onFull={() => toggleFullscreen(win.id)}
              onClose={() => close(win.id)}
            />
          </header>
        </div>
      ) : (
        <header
          className="flex h-10 shrink-0 cursor-grab select-none items-center gap-2 border-b border-border bg-surface px-3 active:cursor-grabbing"
          onPointerDown={(event) => {
            const kind = kindOf(event);
            if (!touchStaysOnPhone(useCompositor.getState().outputs, win.outputId, kind)) {
              event.stopPropagation();
              return;
            }
            if (kind === "touch" && phonePinned) return;
            onMove(event, win);
          }}
          onDoubleClick={(event) => {
            if ((event.target as HTMLElement).closest("[data-nodrag]")) return;
            if (win.fullscreen) toggleFullscreen(win.id);
            else toggleMaximized(win.id);
          }}
        >
          <AppIcon app={win.app} className="size-3.5 text-accent" />
          <span className="truncate text-xs text-fg">{win.title}</span>
          <WindowButtons
            title={win.title}
            nested={nested}
            maximized={win.maximized}
            fullscreen={win.fullscreen}
            onMinimize={() => useCompositor.getState().minimizeWindow(win.id)}
            onNest={() => useCompositor.getState().nestWindow(win.id)}
            onMaximize={() => toggleMaximized(win.id)}
            onFull={() => toggleFullscreen(win.id)}
            onClose={() => close(win.id)}
          />
        </header>
      )}
      <div
        data-surface={win.id}
        className="relative min-h-0 flex-1"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const kind = kindOf(event);
          if (!touchStaysOnPhone(useCompositor.getState().outputs, win.outputId, kind)) {
            event.stopPropagation();
            return;
          }
          const interactive = (event.target as HTMLElement).closest("button, a, input, textarea");
          deliver(event, "down");
          if (!interactive) {
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              /* the pointer can already be gone in a synthesized event */
            }
          }
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          deliver(event, "move");
        }}
        onPointerUp={(event) => {
          if (!touchStaysOnPhone(useCompositor.getState().outputs, win.outputId, kindOf(event))) return;
          const captured = event.currentTarget.hasPointerCapture(event.pointerId);
          deliver(event, "up");
          if (captured) {
            try {
              event.currentTarget.releasePointerCapture(event.pointerId);
            } catch {
              /* already released */
            }
          }
        }}
      >
        <WindowBody win={win} outputs={outputs} />
        <ContactMark windowId={win.id} />
      </div>
      {floating ? (
        <button
          type="button"
          data-nodrag
          aria-label="Redimensionar"
          className="absolute bottom-1 right-1 size-4 cursor-nwse-resize rounded-sm bg-accent"
          onPointerDown={(event) => onResize(event, win)}
        />
      ) : null}
    </article>
  );
}

function ContactMark({ windowId }: { windowId: string }) {
  const contact = useCompositor((state) => (state.contact?.windowId === windowId ? state.contact : null));
  if (!contact) return null;
  return (
    <span
      className={`pointer-events-none absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-ink ${
        contact.down ? "bg-accent" : "bg-accent/50"
      }`}
      style={{ left: `${contact.x * 100}%`, top: `${contact.y * 100}%` }}
    />
  );
}

function EmptyOutput({ output }: { output: Output }) {
  const spawn = useCompositor((state) => state.spawn);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm text-fg">Espaço {output.workspace} vazio</p>
      <p className="max-w-xs text-xs text-pretty text-muted">
        {output.connector} está à espera de um toplevel. O layout não inventa janelas.
      </p>
      <button
        type="button"
        className="inline-flex h-10 items-center rounded-md bg-accent px-3 text-sm font-medium text-ink"
        onClick={() => spawn("terminal", output.id)}
      >
        Abrir terminal
      </button>
    </div>
  );
}

