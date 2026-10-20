import { useEffect, useState } from "react";
import {
  AppWindow,
  BookOpen,
  Columns2,
  Copy,
  Laptop,
  LayoutGrid,
  Monitor,
  Plus,
  Smartphone,
  Square,
  X,
} from "lucide-react";
import { APPS, WORKSPACES, type LayoutPolicy, type PresetId, type ProtoEvent } from "@/compositor/model";
import { SOURCES } from "@/compositor/source";
import { useCompositor } from "@/compositor/store";
import { AppIcon } from "@/compositor/clients";
import { Stage } from "@/compositor/stage";

const PRESETS: Array<{ id: PresetId; label: string }> = [
  { id: "mesa", label: "Mesa" },
  { id: "celular", label: "Celular" },
  { id: "dock", label: "Doca" },
];

const LAYOUTS: Array<{ id: LayoutPolicy; label: string; icon: typeof Columns2 }> = [
  { id: "mestre", label: "Mestre", icon: Columns2 },
  { id: "grade", label: "Grade", icon: LayoutGrid },
  { id: "monoculo", label: "Monóculo", icon: Square },
  { id: "flutuante", label: "Flutuar", icon: AppWindow },
];

type Sheet = "novo" | "politica" | "protocolo" | null;

export function Studio() {
  const [sheet, setSheet] = useState<Sheet>(null);
  const [sourceOpen, setSourceOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (sourceOpen) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const store = useCompositor.getState();
      if (!event.altKey && !event.metaKey && !event.ctrlKey) {
        const win = store.windows.find((item) => item.id === store.focusedId);
        const host = win ? store.outputs.find((item) => item.id === win.outputId) : undefined;
        const shown = Boolean(win && host && win.workspace === host.workspace && (store.shell[host.id] ?? "session") === "session");
        if (shown && win && (win.app === "terminal" || win.app === "notas" || win.app === "editor")) {
          if (event.key === "Backspace") {
            event.preventDefault();
            store.typeKey("backspace");
          } else if (event.key === "Enter") {
            event.preventDefault();
            store.typeKey("\n");
          } else if (event.key.length === 1) {
            event.preventDefault();
            store.typeKey(event.key);
          }
        }
        return;
      }
      const key = event.key;
      if (key === "Enter") {
        event.preventDefault();
        store.spawn("terminal");
      } else if (key === "q" || key === "Q") {
        event.preventDefault();
        const id = store.focusedId;
        const win = id ? store.windows.find((item) => item.id === id) : undefined;
        const host = win ? store.outputs.find((output) => output.id === win.outputId) : undefined;
        if (id && win && host && win.workspace === host.workspace) store.close(id);
      } else if (key === "m" || key === "M") {
        event.preventDefault();
        if (store.focusedId) store.toggleMaximized(store.focusedId);
      } else if (key === "f" || key === "F") {
        event.preventDefault();
        if (store.focusedId) store.toggleFullscreen(store.focusedId);
      } else if (key === " ") {
        event.preventDefault();
        if (store.focusedId) store.toggleFloat(store.focusedId);
      } else if (key === "ArrowDown" || key === "j" || key === "J") {
        event.preventDefault();
        store.focusNeighbor(1);
      } else if (key === "ArrowUp" || key === "k" || key === "K") {
        event.preventDefault();
        store.focusNeighbor(-1);
      } else if (key === "ArrowLeft" || key === "ArrowRight") {
        event.preventDefault();
        const win = store.windows.find((item) => item.id === store.focusedId);
        if (!win) return;
        const ordered = [...store.outputs].sort((a, b) => a.x - b.x);
        const index = ordered.findIndex((output) => output.id === win.outputId);
        const next = ordered[index + (key === "ArrowRight" ? 1 : -1)];
        if (next) store.moveToOutput(win.id, next.id);
      } else if (key === "h" || key === "H") {
        event.preventDefault();
        store.setMasterRatio(Math.max(0.4, Math.round((store.masterRatio - 0.02) * 100) / 100));
      } else if (key === "l" || key === "L") {
        event.preventDefault();
        store.setMasterRatio(Math.min(0.7, Math.round((store.masterRatio + 0.02) * 100) / 100));
      } else if (key === "s" || key === "S") {
        event.preventDefault();
        store.toggleSplit();
      } else if (event.code === "Digit1" || event.code === "Digit2" || event.code === "Digit3" || event.code === "Digit4") {
        event.preventDefault();
        const workspace = Number(event.code.slice(5));
        if (event.shiftKey && store.focusedId) store.moveToWorkspace(store.focusedId, workspace);
        else store.setWorkspace(store.focusedOutputId, workspace);
      } else if (key === "Escape") {
        store.setOverview(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sourceOpen]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-2 md:px-4">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold leading-none tracking-tight">Orbit</h1>
          <p className="mt-1 hidden text-xs text-muted sm:block">Orbit Composer · LUMNA</p>
        </div>
        <PresetSwitch />
        <button
          type="button"
          className="ml-auto hidden h-10 items-center gap-2 rounded-md bg-elevated px-3 text-sm text-fg md:inline-flex"
          onClick={() => setSourceOpen(true)}
        >
          <BookOpen className="size-4 text-accent" aria-hidden="true" />
          Fontes
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-80 shrink-0 flex-col overflow-y-auto border-r border-border md:flex">
          <PolicyPanel />
        </aside>
        <main className="min-w-0 flex-1">
          <Stage />
        </main>
      </div>

      <footer className="flex shrink-0 gap-2 border-t border-border p-2 md:hidden">
        <BarButton label="Novo" onClick={() => setSheet("novo")} />
        <BarButton label="Política" onClick={() => setSheet("politica")} />
        <BarButton label="Protocolo" onClick={() => setSheet("protocolo")} />
        <BarButton label="Fontes" onClick={() => setSourceOpen(true)} />
      </footer>

      {sheet ? (
        <div className="fixed inset-0 z-30 flex flex-col justify-end bg-ink/40 md:hidden">
          <button type="button" aria-label="Fechar painel" className="min-h-12 flex-1" onClick={() => setSheet(null)} />
          <div className="max-h-[75dvh] overflow-y-auto rounded-t-xl border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">
                {sheet === "novo" ? "Novo cliente" : sheet === "politica" ? "Política" : "Protocolo"}
              </h2>
              <button
                type="button"
                aria-label="Fechar"
                className="inline-flex size-11 items-center justify-center rounded-md text-muted"
                onClick={() => setSheet(null)}
              >
                <X className="size-5" />
              </button>
            </div>
            {sheet === "novo" ? <SpawnGrid onSpawn={() => setSheet(null)} /> : null}
            {sheet === "politica" ? <PolicyControls /> : null}
            {sheet === "protocolo" ? <ProtocolBlock /> : null}
          </div>
        </div>
      ) : null}

      {sourceOpen ? <SourceDrawer onClose={() => setSourceOpen(false)} /> : null}
    </div>
  );
}

function BarButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 flex-1 rounded-md bg-elevated text-sm font-medium text-fg"
    >
      {label}
    </button>
  );
}

function PresetSwitch() {
  const preset = useCompositor((state) => state.preset);
  const setPreset = useCompositor((state) => state.setPreset);
  return (
    <div className="flex rounded-md bg-inset p-1" role="tablist" aria-label="Cenário">
      {PRESETS.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={preset === item.id}
          onClick={() => setPreset(item.id)}
          className={`inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm md:px-3 ${
            preset === item.id ? "bg-accent text-ink" : "text-muted hover:text-fg"
          }`}
        >
          {item.id === "mesa" ? (
            <Laptop className="size-4" aria-hidden="true" />
          ) : item.id === "celular" ? (
            <Smartphone className="size-4" aria-hidden="true" />
          ) : (
            <Monitor className="size-4" aria-hidden="true" />
          )}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function PolicyPanel() {
  return (
    <div className="flex flex-col gap-5 p-4">
      <p className="text-sm text-pretty text-muted">
        Arrasta a barra de uma janela para outra saída. Alt+Enter abre um terminal. A doca junta o
        telemóvel a um monitor.
      </p>
      <Arrangement />
      <PolicyControls />
      <div>
        <h2 className="mb-2 text-xs font-medium tracking-wide text-faint">Clientes</h2>
        <SpawnGrid />
      </div>
      <ProtocolBlock />
      <ShortcutList />
    </div>
  );
}

function PolicyControls() {
  const layout = useCompositor((state) => state.layout);
  const setLayout = useCompositor((state) => state.setLayout);
  const gaps = useCompositor((state) => state.gaps);
  const setGaps = useCompositor((state) => state.setGaps);
  const masterRatio = useCompositor((state) => state.masterRatio);
  const setMasterRatio = useCompositor((state) => state.setMasterRatio);
  const focusFollows = useCompositor((state) => state.focusFollows);
  const setFocusFollows = useCompositor((state) => state.setFocusFollows);
  const preset = useCompositor((state) => state.preset);
  const outputs = useCompositor((state) => state.outputs);
  const addPortrait = useCompositor((state) => state.addPortrait);
  const reset = useCompositor((state) => state.reset);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="mb-2 text-xs font-medium tracking-wide text-faint">Mosaico</h2>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUTS.map((item) => {
            const Icon = item.icon;
            const active = layout === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setLayout(item.id)}
                className={`inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm ${
                  active ? "bg-accent text-ink" : "bg-elevated text-fg"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="flex justify-between text-muted">
          Intervalos <span className="font-mono tabular-nums text-fg">{gaps}</span>
        </span>
        <input
          type="range"
          min={0}
          max={20}
          step={2}
          value={gaps}
          onChange={(event) => setGaps(Number(event.target.value))}
          style={{ accentColor: "var(--color-accent)" }}
        />
      </label>
      {layout === "mestre" ? (
        <label className="flex flex-col gap-2 text-sm">
          <span className="flex justify-between text-muted">
            Mestre <span className="font-mono tabular-nums text-fg">{Math.round(masterRatio * 100)}%</span>
          </span>
          <input
            type="range"
            min={40}
            max={70}
            step={1}
            value={Math.round(masterRatio * 100)}
            onChange={(event) => setMasterRatio(Number(event.target.value) / 100)}
            style={{ accentColor: "var(--color-accent)" }}
          />
        </label>
      ) : null}
      <button
        type="button"
        aria-pressed={focusFollows}
        onClick={() => setFocusFollows(!focusFollows)}
        className="flex h-11 items-center justify-between rounded-md bg-elevated px-3 text-sm"
      >
        Foco segue o ponteiro
        <span className={focusFollows ? "font-mono text-accent" : "font-mono text-faint"}>
          {focusFollows ? "on" : "off"}
        </span>
      </button>
      {preset !== "celular" && !outputs.some((output) => output.id === "hdmi") ? (
        <button
          type="button"
          onClick={addPortrait}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-elevated text-sm"
        >
          <Plus className="size-4 text-accent" aria-hidden="true" />
          Ligar HDMI retrato
        </button>
      ) : null}
      <button type="button" onClick={reset} className="h-11 rounded-md text-sm text-muted hover:text-fg">
        Repor cena
      </button>
    </div>
  );
}

function SpawnGrid({ onSpawn }: { onSpawn?: () => void }) {
  const spawn = useCompositor((state) => state.spawn);
  return (
    <div className="grid grid-cols-2 gap-2">
      {APPS.map((app) => (
        <button
          key={app.id}
          type="button"
          onClick={() => {
            spawn(app.id);
            onSpawn?.();
          }}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-elevated px-3 text-left text-sm text-fg"
        >
          <AppIcon app={app.id} className="size-4 text-accent" />
          {app.label}
        </button>
      ))}
    </div>
  );
}

function Arrangement() {
  const outputs = useCompositor((state) => state.outputs);
  const focusedOutputId = useCompositor((state) => state.focusedOutputId);
  const focusOutput = useCompositor((state) => state.focusOutput);
  const minX = Math.min(...outputs.map((output) => output.x));
  const minY = Math.min(...outputs.map((output) => output.y));
  const maxX = Math.max(...outputs.map((output) => output.x + output.width));
  const maxY = Math.max(...outputs.map((output) => output.y + output.height));
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  return (
    <div>
      <h2 className="mb-2 text-xs font-medium tracking-wide text-faint">Layout das saídas</h2>
      <div className="relative h-28 rounded-md bg-inset">
        {outputs.map((output) => (
          <button
            key={output.id}
            type="button"
            onClick={() => focusOutput(output.id)}
            className={`absolute flex items-center justify-center overflow-hidden rounded-sm px-1 font-mono text-xs ${
              output.id === focusedOutputId ? "bg-accent text-ink" : "bg-elevated text-fg"
            }`}
            style={{
              left: `${((output.x - minX) / width) * 100}%`,
              top: `${((output.y - minY) / height) * 100}%`,
              width: `${(output.width / width) * 100}%`,
              height: `${(output.height / height) * 100}%`,
            }}
          >
            {output.connector}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProtocolBlock() {
  const events = useCompositor((state) => state.events);
  const outputs = useCompositor((state) => state.outputs);
  const preset = useCompositor((state) => state.preset);
  const seat =
    preset === "celular" ? "touch keyboard" : preset === "dock" ? "pointer keyboard touch" : "pointer keyboard";
  return (
    <div>
      <h2 className="mb-1 text-xs font-medium tracking-wide text-faint">Protocolo</h2>
      <p className="mb-2 font-mono text-xs text-muted">
        seat0 · {seat} · {outputs.length} {outputs.length === 1 ? "saída" : "saídas"}
      </p>
      <ProtocolLog events={events} />
    </div>
  );
}

function ProtocolLog({ events }: { events: ProtoEvent[] }) {
  return (
    <ol className="flex max-h-44 flex-col gap-1.5 overflow-auto font-mono text-xs">
      {events.map((event) => (
        <li key={event.id} className="leading-snug">
          <span className="text-accent">{event.iface}</span> <span className="text-muted">{event.msg}</span>
        </li>
      ))}
    </ol>
  );
}

function ShortcutList() {
  const rows = [
    ["Alt+Enter", "terminal"],
    ["Alt+Q", "fechar"],
    ["Alt+M", "maximizar"],
    ["Alt+F", "ecrã inteiro"],
    ["Alt+Espaço", "flutuar"],
    ["Alt+1–4", "espaço"],
    ["Alt+Shift+1–4", "mover"],
    ["Alt+J/K", "focar"],
    ["Alt+H/L", "mestre"],
    ["Alt+←/→", "outra saída"],
  ];
  return (
    <div>
      <h2 className="mb-2 text-xs font-medium tracking-wide text-faint">Atalhos</h2>
      <ul className="flex flex-col gap-1 text-xs">
        {rows.map(([key, label]) => (
          <li key={key} className="flex justify-between gap-3 text-muted">
            <span className="font-mono text-fg">{key}</span>
            {label}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-pretty text-faint">
        Espaços {WORKSPACES.join(" ")} são por saída. Um espaço vazio larga o teclado — não
        escreve na janela que ficou no espaço anterior. No telemóvel os números mudam de espaço,
        e a vista geral abre a janela no espaço dela. Dividir fixa o par: o foco anda entre os
        dois sem os trocar, e a costura entre eles é fina. Qualquer saída, menos a última,
        desliga-se: as janelas passam para a que fica, no espaço activo, sem ecrã inteiro. No
        terminal, nas notas e no editor escreve à vontade — Enter no terminal aceita ajuda, outputs
        e clientes.
      </p>
    </div>
  );
}

function SourceDrawer({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(SOURCES[0]?.name ?? "");
  const [copied, setCopied] = useState(false);
  const file = SOURCES.find((item) => item.name === active) ?? SOURCES[0];

  const copy = async () => {
    if (!file) return;
    try {
      await navigator.clipboard.writeText(file.body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    const blob = new Blob(
      [SOURCES.map((item) => `/* === ${item.name} === */\n${item.body}`).join("\n\n")],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orbit-composer.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <h2 className="text-base font-semibold">Fontes</h2>
        <div className="flex gap-1 overflow-auto">
          {SOURCES.map((item) => (
            <button
              key={item.name}
              type="button"
              aria-pressed={item.name === file?.name}
              onClick={() => setActive(item.name)}
              className={`h-10 shrink-0 rounded-md px-3 font-mono text-xs ${
                item.name === file?.name ? "bg-accent text-ink" : "bg-elevated text-fg"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-elevated px-3 text-sm"
          >
            <Copy className="size-4" aria-hidden="true" />
            {copied ? "Copiado" : "Copiar"}
          </button>
          <button type="button" onClick={download} className="hidden h-10 rounded-md bg-elevated px-3 text-sm sm:inline-flex sm:items-center">
            Descarregar
          </button>
          <button
            type="button"
            aria-label="Fechar fontes"
            onClick={onClose}
            className="inline-flex size-10 items-center justify-center rounded-md bg-elevated"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-fg">
        {file?.body}
      </pre>
    </div>
  );
}
