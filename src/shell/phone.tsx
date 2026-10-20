import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { BatteryFull, Wifi } from "lucide-react";
import { WORKSPACES, type ClientWindow, type Output } from "@/compositor/model";
import { useCompositor } from "@/compositor/store";
import { AppIcon } from "@/compositor/clients";
import { shellOf } from "@/shell/chrome";

export function PhoneStatus({
  overlay = false,
  onDrag,
}: {
  overlay?: boolean;
  onDrag?: (event: ReactPointerEvent) => void;
}) {
  return (
    <div
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-30 flex h-6 items-center gap-2 bg-bg/70 px-3"
          : "flex h-6 shrink-0 items-center gap-2 px-3"
      }
      onPointerDown={onDrag}
    >
      <Clock />
      <span className="ml-auto inline-flex items-center gap-1.5 text-muted" aria-label="Estado">
        <Wifi className="size-3" aria-hidden="true" />
        <BatteryFull className="size-3.5" aria-hidden="true" />
      </span>
    </div>
  );
}

export function PhoneHandle({ outputId }: { outputId: string }) {
  return (
    <button
      type="button"
      aria-label="Início. Arrastar para cima abre os recentes."
      className="absolute bottom-0 left-1/2 z-30 flex h-11 w-28 -translate-x-1/2 items-end justify-center pb-1.5"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const startX = event.clientX;
        const startY = event.clientY;
        let opened = false;
        const move = (pointer: PointerEvent) => {
          if (!opened && startY - pointer.clientY > 28) {
            opened = true;
            useCompositor.getState().setOverview(true);
          }
        };
        const up = (pointer: PointerEvent) => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          const dy = startY - pointer.clientY;
          const dx = Math.abs(pointer.clientX - startX);
          if (dy > 28) {
            useCompositor.getState().setOverview(true);
            return;
          }
          if (dx < 12 && Math.abs(dy) < 12) {
            const store = useCompositor.getState();
            if (store.overview || shellOf(store.shell, outputId) !== "home") {
              store.setOverview(false);
              store.setShell(outputId, "home");
            }
          }
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      }}
    >
      <span className="h-1 w-16 rounded-full bg-fg/80" />
    </button>
  );
}

export function Overview({ output }: { output: Output }) {
  const windows = useCompositor((state) => state.windows);
  const focusWindow = useCompositor((state) => state.focusWindow);
  const close = useCompositor((state) => state.close);
  const setWorkspace = useCompositor((state) => state.setWorkspace);
  const setOverview = useCompositor((state) => state.setOverview);
  const toggleKeyboard = useCompositor((state) => state.toggleKeyboard);
  const split = useCompositor((state) => state.split);
  const toggleSplit = useCompositor((state) => state.toggleSplit);
  const listed = windows
    .filter((win) => win.outputId === output.id)
    .sort((a, b) => a.workspace - b.workspace || a.order - b.order);
  return (
    <div className="flex h-full flex-col pt-7">
      <div className="flex items-center gap-2 px-3">
        <p className="text-xs text-muted">Recentes</p>
        <div className="ml-auto flex items-center gap-1" role="group" aria-label="Espaços">
          {WORKSPACES.map((workspace) => {
            const active = output.workspace === workspace;
            return (
              <button
                key={workspace}
                type="button"
                aria-pressed={active}
                aria-label={`Espaço ${workspace}`}
                onClick={() => setWorkspace(output.id, workspace)}
                className={`h-1.5 w-5 rounded-full ${active ? "bg-accent" : "bg-faint"}`}
              />
            );
          })}
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-auto p-2">
        {listed.map((win) => (
          <OverviewCard
            key={win.id}
            win={win}
            here={win.workspace === output.workspace}
            onOpen={() => {
              if (output.workspace !== win.workspace) setWorkspace(output.id, win.workspace, win.id);
              else focusWindow(win.id);
              useCompositor.getState().setShell(output.id, "session");
              setOverview(false);
            }}
            onClose={() => close(win.id)}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 px-3 pb-12">
        <button type="button" className="h-10 rounded-full bg-elevated px-4 text-xs text-fg" onClick={() => toggleSplit()}>
          {split ? "Uma" : "Dividir"}
        </button>
        <button
          type="button"
          className="h-10 rounded-full bg-elevated px-4 text-xs text-fg"
          onClick={() => {
            toggleKeyboard();
            setOverview(false);
          }}
        >
          Teclado
        </button>
      </div>
    </div>
  );
}

function OverviewCard({
  win,
  here,
  onOpen,
  onClose,
}: {
  win: ClientWindow;
  here: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const skip = useRef(false);
  const [dy, setDy] = useState(0);
  return (
    <button
      type="button"
      onClick={() => {
        if (skip.current) {
          skip.current = false;
          return;
        }
        onOpen();
      }}
      onPointerDown={(event) => {
        const start = event.clientY;
        const move = (pointer: PointerEvent) => setDy(Math.min(0, pointer.clientY - start));
        const up = (pointer: PointerEvent) => {
          const delta = Math.min(0, pointer.clientY - start);
          if (delta < -70) {
            skip.current = true;
            onClose();
          }
          setDy(0);
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      }}
      className="flex min-h-28 flex-col rounded-lg bg-surface p-3 text-left ring-1 ring-border"
      style={{ transform: `translateY(${dy}px)`, opacity: 1 - Math.min(0.7, Math.abs(dy) / 180) }}
    >
      <AppIcon app={win.app} className="size-4 text-accent" />
      <span className="mt-2 text-sm text-fg">{win.title}</span>
      <span className="font-mono text-xs text-faint">{win.appId}</span>
      <span className={`mt-auto pt-2 font-mono text-xs ${here ? "text-accent" : "text-muted"}`}>
        espaço {win.workspace}
      </span>
    </button>
  );
}

export function OnScreenKeyboard() {
  const typeKey = useCompositor((state) => state.typeKey);
  const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  return (
    <div className="shrink-0 border-t border-border bg-surface px-2 pb-2">
      <button
        type="button"
        aria-label="Fechar teclado"
        className="mx-auto mb-1 flex h-5 w-full items-center justify-center"
        onClick={() => useCompositor.getState().toggleKeyboard()}
      >
        <span className="h-1 w-10 rounded-full bg-faint" />
      </button>
      <div className="flex flex-col gap-1">
        {rows.map((row) => (
          <div key={row} className="flex justify-center gap-1">
            {row.split("").map((key) => (
              <button
                key={key}
                type="button"
                className="h-11 min-w-0 flex-1 rounded-md bg-elevated text-xs text-fg"
                onClick={() => typeKey(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
        <div className="flex gap-1">
          <button type="button" className="h-11 flex-1 rounded-md bg-elevated text-xs text-fg" onClick={() => typeKey(" ")}>
            espaço
          </button>
          <button
            type="button"
            className="h-11 rounded-md bg-elevated px-3 text-xs text-fg"
            onClick={() => typeKey("backspace")}
          >
            apagar
          </button>
          <button
            type="button"
            className="h-11 rounded-md bg-accent px-3 text-xs font-medium text-ink"
            onClick={() => typeKey("\n")}
          >
            enter
          </button>
        </div>
      </div>
    </div>
  );
}

function Clock() {
  const [label, setLabel] = useState("--:--");
  useEffect(() => {
    const tick = () =>
      setLabel(new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="font-mono text-xs text-muted tabular-nums">{label}</span>;
}
