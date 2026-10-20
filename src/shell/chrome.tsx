import { useEffect, useState } from "react";
import {
  AudioLines,
  Bluetooth,
  Folder,
  Gem,
  Globe,
  Home,
  LayoutGrid,
  Lock,
  Mic,
  Monitor,
  Power,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Volume2,
  Wifi,
  X,
} from "lucide-react";
import { APPS, WORKSPACES, type AppKind, type Output, type ShellMode } from "@/compositor/model";
import { useCompositor } from "@/compositor/store";
import { AppIcon } from "@/compositor/clients";

const FAVORITES: AppKind[] = ["ficheiros", "navegador", "editor", "definicoes", "notas", "terminal"];

const GROUPS: Array<{ id: string; label: string; apps: AppKind[] }> = [
  { id: "favoritos", label: "Favoritos", apps: FAVORITES },
  { id: "trabalho", label: "Trabalho", apps: ["editor", "notas", "correio", "ficheiros"] },
  { id: "internet", label: "Internet", apps: ["navegador", "correio"] },
  { id: "midia", label: "Mídia", apps: ["leitor"] },
  { id: "sistema", label: "Sistema", apps: ["definicoes", "terminal"] },
];

const PHONE_GROUPS: Array<{ id: string; label: string; apps: AppKind[] }> = [
  { id: "todos", label: "Todos", apps: APPS.map((app) => app.id) },
  { id: "trabalho", label: "Trabalho", apps: ["editor", "notas", "correio", "ficheiros"] },
  { id: "midia", label: "Mídia", apps: ["leitor", "navegador"] },
  { id: "sistema", label: "Sistema", apps: ["definicoes", "terminal"] },
];

export function shellOf(shell: Record<string, ShellMode>, outputId: string): ShellMode {
  return shell[outputId] ?? "session";
}

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M8 1.2 14.4 8 8 14.8 1.6 8Z" fill="currentColor" />
    </svg>
  );
}

export function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function openApp(outputId: string, app: AppKind) {
  const scene = useCompositor.getState();
  const output = scene.outputs.find((item) => item.id === outputId);
  const existing = scene.windows.find(
    (win) => win.app === app && win.outputId === outputId && win.workspace === output?.workspace,
  );
  if (existing) scene.focusWindow(existing.id);
  else scene.spawn(app, outputId);
  scene.setShell(outputId, "session");
  scene.setOverview(false);
}

export function DesktopBar({ output }: { output: Output }) {
  const now = useClock();
  const setWorkspace = useCompositor((state) => state.setWorkspace);
  const workspace = output.workspace;
  const [audio, setAudio] = useState(false);
  const [level, setLevel] = useState(65);
  const [mic, setMic] = useState(50);
  const [speaker, setSpeaker] = useState(true);
  const time = now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="relative flex h-10 shrink-0 items-center gap-2 overflow-hidden border-b border-border bg-inset/80 px-3 text-xs">
      <Mark className="size-3.5 shrink-0 text-accent" />
      <span className="shrink-0 font-medium tracking-widest">LUMNA</span>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5" role="group" aria-label="Espaços">
        {WORKSPACES.map((item) => (
          <button
            key={item}
            type="button"
            aria-label={`Espaço ${item}`}
            aria-pressed={workspace === item}
            onClick={() => setWorkspace(output.id, item)}
            className={`h-1 w-5 shrink-0 rounded-full ${workspace === item ? "bg-accent" : "bg-faint"}`}
          />
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-muted">
        <Wifi className="size-3.5" aria-hidden="true" />
        <button
          type="button"
          aria-label="Áudio"
          aria-expanded={audio}
          className="inline-flex size-8 items-center justify-center rounded-md hover:bg-elevated hover:text-fg"
          onClick={() => setAudio((open) => !open)}
        >
          <Volume2 className="size-3.5" />
        </button>
        <Bluetooth className="size-3.5" aria-hidden="true" />
        <span className="font-mono tabular-nums text-fg">{time}</span>
      </div>
      {audio ? (
        <div className="absolute right-3 top-11 z-30 w-64 rounded-xl border border-border bg-surface p-3 text-fg shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm">
              <Volume2 className="size-4 text-accent" aria-hidden="true" />
              Áudio
            </p>
            <button type="button" aria-label="Fechar áudio" className="inline-flex size-8 items-center justify-center text-muted" onClick={() => setAudio(false)}>
              <X className="size-4" />
            </button>
          </div>
          <p className="text-xs text-muted">Saída</p>
          <button
            type="button"
            aria-pressed={speaker}
            onClick={() => setSpeaker(true)}
            className="mt-1 flex min-h-10 w-full items-center justify-between rounded-lg bg-inset px-3 text-xs"
          >
            Alto-falantes
            {speaker ? <span className="size-2 rounded-full bg-accent" /> : null}
          </button>
          <button
            type="button"
            aria-pressed={!speaker}
            onClick={() => setSpeaker(false)}
            className="mt-1 flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-xs text-muted"
          >
            Fone de ouvido
            {!speaker ? <span className="size-2 rounded-full bg-accent" /> : null}
          </button>
          <label className="mt-3 block text-xs text-muted">
            Volume {level}%
            <input
              type="range"
              min={0}
              max={100}
              value={level}
              onChange={(event) => setLevel(Number(event.target.value))}
              className="mt-1 w-full accent-accent"
            />
          </label>
          <label className="mt-2 block text-xs text-muted">
            Microfone {mic}%
            <input
              type="range"
              min={0}
              max={100}
              value={mic}
              onChange={(event) => setMic(Number(event.target.value))}
              className="mt-1 w-full accent-accent"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

export function DesktopDock({ outputId, peek = false }: { outputId: string; peek?: boolean }) {
  const mode = useCompositor((state) => shellOf(state.shell, outputId));
  const setShell = useCompositor((state) => state.setShell);
  const windows = useCompositor((state) => state.windows);
  const outputs = useCompositor((state) => state.outputs);
  const dockOn = useCompositor((state) => state.dockOn);
  const setDockOn = useCompositor((state) => state.setDockOn);
  const workspace = outputs.find((item) => item.id === outputId)?.workspace;
  const focusedId = useCompositor((state) => state.focusedId);
  const focused = windows.find((win) => win.id === focusedId);
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState(false);
  const parked = windows.filter(
    (win) => win.minimized && win.outputId === outputId && win.workspace === workspace,
  );
  const pinned = new Set<AppKind>(["ficheiros", "navegador", "definicoes"]);
  const desks = outputs.filter((item) => item.profile !== "dsi");
  const allowed = dockOn === null || dockOn.includes(outputId);
  const items: Array<{ id: string; label: string; icon: typeof Folder; run: () => void; on: boolean; dot: boolean }> = [
    {
      id: "home",
      label: "Início",
      icon: Gem,
      on: mode === "home",
      dot: false,
      run: () => setShell(outputId, mode === "home" ? "session" : "home"),
    },
    {
      id: "files",
      label: "Arquivos",
      icon: Folder,
      on: mode === "session" && focused?.app === "ficheiros" && focused.outputId === outputId && !focused.minimized,
      dot: parked.some((win) => win.app === "ficheiros"),
      run: () => openApp(outputId, "ficheiros"),
    },
    {
      id: "web",
      label: "Navegador",
      icon: Globe,
      on: mode === "session" && focused?.app === "navegador" && focused.outputId === outputId && !focused.minimized,
      dot: parked.some((win) => win.app === "navegador"),
      run: () => openApp(outputId, "navegador"),
    },
    {
      id: "store",
      label: "Loja",
      icon: ShoppingBag,
      on: mode === "loja",
      dot: false,
      run: () => setShell(outputId, mode === "loja" ? "session" : "loja"),
    },
    {
      id: "settings",
      label: "Ajustes",
      icon: SlidersHorizontal,
      on: mode === "session" && focused?.app === "definicoes" && focused.outputId === outputId && !focused.minimized,
      dot: parked.some((win) => win.app === "definicoes"),
      run: () => openApp(outputId, "definicoes"),
    },
    {
      id: "emma",
      label: "Emma",
      icon: Mic,
      on: false,
      dot: false,
      run: () => setShell(outputId, "home"),
    },
  ];

  if (!allowed) return null;
  const tucked = peek && !open;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-40"
      onPointerLeave={() => {
        if (!peek) return;
        setOpen(false);
        setPlace(false);
      }}
    >
      {peek ? (
        <div
          className="pointer-events-auto absolute bottom-0 left-1/2 z-10 h-3 w-28 -translate-x-1/2"
          onPointerEnter={() => setOpen(true)}
        >
          <span aria-hidden="true" className="mx-auto mt-1 block h-1 w-16 rounded-full bg-fg/80" />
        </div>
      ) : null}
      <div className="flex justify-center">
        <div
          className={`pointer-events-auto flex flex-col items-center pb-3 transition-transform duration-200 ease-out ${
            tucked ? "translate-y-full" : "translate-y-0"
          }`}
          onPointerEnter={() => {
            if (peek) setOpen(true);
          }}
        >
          {peek ? null : <span className="h-3" />}
          <div className="relative">
          {place ? (
            <div className="absolute bottom-full left-1/2 z-10 mb-2 w-52 -translate-x-1/2 rounded-xl border border-border bg-surface p-2 text-fg shadow-lg">
              <p className="px-2 py-1 text-xs text-muted">Doca</p>
              <button
                type="button"
                aria-pressed={dockOn === null}
                className="flex min-h-10 w-full items-center justify-between rounded-lg px-2 text-left text-xs hover:bg-elevated"
                onClick={() => setDockOn(null)}
              >
                Todas as telas
                {dockOn === null ? <span className="size-2 rounded-full bg-accent" /> : null}
              </button>
              <button
                type="button"
                aria-pressed={dockOn?.length === 1 && dockOn[0] === outputId}
                className="flex min-h-10 w-full items-center justify-between rounded-lg px-2 text-left text-xs hover:bg-elevated"
                onClick={() => setDockOn([outputId])}
              >
                Só esta tela
                {dockOn?.length === 1 && dockOn[0] === outputId ? <span className="size-2 rounded-full bg-accent" /> : null}
              </button>
              {desks.map((item) => {
                const on = dockOn === null || dockOn.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={on}
                    className="flex min-h-10 w-full items-center justify-between rounded-lg px-2 text-left text-xs hover:bg-elevated"
                    onClick={() => {
                      const current = dockOn ?? desks.map((desk) => desk.id);
                      const next = current.includes(item.id)
                        ? current.filter((id) => id !== item.id)
                        : [...current, item.id];
                      setDockOn(next.length === 0 || next.length === desks.length ? null : next);
                    }}
                  >
                    {item.connector}
                    {on ? <span className="size-2 rounded-full bg-accent" /> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
          <div className="flex items-center gap-1 rounded-2xl border border-border bg-surface/95 px-2 py-1.5">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                data-nodrag
                aria-label={item.label}
                aria-pressed={item.on}
                onClick={item.run}
                className={`relative inline-flex size-11 items-center justify-center rounded-xl ${
                  item.on ? "bg-elevated text-accent" : "text-fg hover:bg-elevated"
                }`}
              >
                <item.icon className="size-5" aria-hidden="true" />
                {item.dot ? <span className="absolute bottom-1 size-1 rounded-full bg-accent" /> : null}
              </button>
            ))}
            {parked.some((win) => !pinned.has(win.app)) ? <span className="mx-1 h-6 w-px bg-border" /> : null}
            {parked
              .filter((win) => !pinned.has(win.app))
              .map((win) => (
                <button
                  key={win.id}
                  type="button"
                  data-nodrag
                  aria-label={`Restaurar ${win.title}`}
                  onClick={() => {
                    useCompositor.getState().focusWindow(win.id);
                    useCompositor.getState().setShell(outputId, "session");
                  }}
                  className="relative inline-flex size-11 items-center justify-center rounded-xl text-fg hover:bg-elevated"
                >
                  <AppIcon app={win.app} className="size-5" />
                  <span className="absolute bottom-1 size-1 rounded-full bg-accent" />
                </button>
              ))}
            <span className="mx-1 h-6 w-px bg-border" />
            <button
              type="button"
              data-nodrag
              aria-label="Telas da doca"
              aria-expanded={place}
              onClick={() => setPlace((value) => !value)}
              className="inline-flex size-11 items-center justify-center rounded-xl text-muted hover:bg-elevated hover:text-fg"
            >
              <Monitor className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export function DesktopHome({ outputId }: { outputId: string }) {
  const [group, setGroup] = useState(GROUPS[0].id);
  const [query, setQuery] = useState("");
  const setShell = useCompositor((state) => state.setShell);
  const apps = GROUPS.find((item) => item.id === group)?.apps ?? FAVORITES;
  const visible = apps.filter((id) => {
    const spec = APPS.find((app) => app.id === id);
    return spec ? spec.label.toLowerCase().includes(query.trim().toLowerCase()) : false;
  });

  return (
    <div className="h-full overflow-auto px-6 pb-20 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-3xl font-medium tracking-tight">Início</h2>
        <label className="flex h-11 min-w-56 flex-1 items-center gap-2 rounded-xl border border-border bg-surface/80 px-3 text-sm text-muted sm:max-w-sm">
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar aplicativos e arquivos"
            className="w-full bg-transparent text-fg outline-none placeholder:text-faint"
          />
        </label>
      </div>
      <div className="mt-6 flex gap-4 overflow-auto text-sm" role="tablist">
        {GROUPS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={group === item.id}
            onClick={() => setGroup(item.id)}
            className={`shrink-0 border-b-2 pb-2 ${group === item.id ? "border-accent text-fg" : "border-transparent text-muted"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {visible.map((id) => {
          const spec = APPS.find((app) => app.id === id);
          if (!spec) return null;
          const lead = id === "ficheiros" && query.trim() === "";
          return (
            <button
              key={id}
              type="button"
              onClick={() => openApp(outputId, id)}
              className={`flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border text-sm ${
                lead ? "border-accent bg-accent/15 text-fg" : "border-border bg-surface/80 text-fg hover:bg-elevated"
              }`}
            >
              <AppIcon app={id} className={`size-8 ${lead ? "text-accent" : "text-fg"}`} />
              {spec.label}
            </button>
          );
        })}
      </div>
      <p className="mt-8 text-sm text-muted">Recentes</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        {[
          ["Projeto LUMNA", "Documentos · há 2 horas", "notas"],
          ["Notas.txt", "Documentos · ontem", "notas"],
          ["Downloads", "Pasta · há 3 dias", "ficheiros"],
        ].map(([title, meta, app]) => (
          <button
            key={title}
            type="button"
            onClick={() => openApp(outputId, app as AppKind)}
            className="flex min-h-16 items-center gap-3 rounded-xl border border-border bg-surface/70 px-3 text-left"
          >
            <Folder className="size-4 text-muted" aria-hidden="true" />
            <span>
              <span className="block text-sm text-fg">{title}</span>
              <span className="block text-xs text-muted">{meta}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-4 text-sm text-muted">
        <button type="button" className="inline-flex min-h-11 items-center gap-2" onClick={() => setShell(outputId, "lock")}>
          <Lock className="size-4" aria-hidden="true" />
          Bloquear
        </button>
        <button type="button" className="inline-flex min-h-11 items-center gap-2" onClick={() => setShell(outputId, "lock")}>
          <Power className="size-4" aria-hidden="true" />
          Desligar
        </button>
      </div>
    </div>
  );
}

export function DesktopStore({ outputId }: { outputId: string }) {
  const setShell = useCompositor((state) => state.setShell);
  const cards = [
    ["Navegador", "Páginas no telemóvel e na secretária.", "navegador"],
    ["Arquivos", "Pastas, recentes e pré-visualização.", "ficheiros"],
    ["Notas", "Listas curtas, feitas para o toque.", "notas"],
    ["Terminal", "O seat, as saídas e os clientes.", "terminal"],
    ["Música", "A sessão que está a tocar.", "leitor"],
    ["Ajustes", "Foco, teclado e o ecrã.", "definicoes"],
  ] as const;
  return (
    <div className="flex h-full items-start justify-center overflow-auto p-6 pb-24">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-surface/95 p-4">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingBag className="size-4 text-accent" aria-hidden="true" />
          <h2 className="text-sm">Loja de aplicativos</h2>
          <button type="button" aria-label="Fechar loja" className="ml-auto inline-flex size-8 items-center justify-center text-muted" onClick={() => setShell(outputId, "session")}>
            <X className="size-4" />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map(([title, body, app]) => (
            <div key={title} className="rounded-xl border border-border bg-inset p-3">
              <div className="flex items-center gap-2">
                <AppIcon app={app} className="size-5 text-accent" />
                <p className="text-sm text-fg">{title}</p>
                <button
                  type="button"
                  className="ml-auto h-8 rounded-lg bg-accent px-3 text-xs font-medium text-ink"
                  onClick={() => openApp(outputId, app)}
                >
                  Abrir
                </button>
              </div>
              <p className="mt-2 text-xs text-pretty text-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LockScreen({ outputId }: { outputId: string }) {
  const now = useClock();
  const setShell = useCompositor((state) => state.setShell);
  const time = now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" });
  return (
    <button type="button" className="flex h-full w-full flex-col items-center justify-center gap-2 text-center" onClick={() => setShell(outputId, "home")}>
      <p className="text-6xl font-medium tracking-tight text-fg">{time}</p>
      <p className="text-sm text-muted">{date}</p>
      <p className="mt-6 text-xs text-faint">Bloqueado · toca para voltar ao início</p>
    </button>
  );
}

export function PhoneHome({ outputId }: { outputId: string }) {
  const now = useClock();
  const time = now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="flex h-full flex-col px-4 pb-32 pt-6">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-xs tracking-widest text-fg">
          <Mark className="size-3.5 text-accent" />
          LUMNA
        </span>
        <span className="text-xs text-muted">Desktop</span>
      </div>
      <div className="mt-10">
        <p className="text-6xl font-medium tracking-tight">{time}</p>
        <p className="mt-1 text-sm text-muted">{date}</p>
      </div>
      <label className="mt-auto flex h-12 items-center gap-2 rounded-full border border-border bg-surface/80 px-4 text-sm text-muted">
        <Mic className="size-4 text-accent" aria-hidden="true" />
        <input placeholder="Pergunte à Emma" className="w-full bg-transparent text-fg outline-none placeholder:text-faint" />
      </label>
      <span className="sr-only">{outputId}</span>
    </div>
  );
}

export function PhoneApps({ outputId }: { outputId: string }) {
  const [group, setGroup] = useState(PHONE_GROUPS[0].id);
  const [query, setQuery] = useState("");
  const apps = PHONE_GROUPS.find((item) => item.id === group)?.apps ?? [];
  const visible = apps.filter((id) => {
    const spec = APPS.find((app) => app.id === id);
    return spec ? spec.label.toLowerCase().includes(query.trim().toLowerCase()) : false;
  });
  return (
    <div className="h-full overflow-auto px-4 pb-32 pt-4">
      <div className="flex items-center gap-2">
        <Mark className="size-3.5 text-accent" />
        <span className="text-xs tracking-widest">LUMNA</span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <h2 className="text-3xl font-medium tracking-tight">Aplicativos</h2>
        <button type="button" className="inline-flex items-center gap-1 text-xs text-muted" onClick={() => useCompositor.getState().setShell(outputId, "loja")}>
          <ShoppingBag className="size-4" aria-hidden="true" />
          Loja
        </button>
      </div>
      <label className="mt-4 flex h-11 items-center gap-2 rounded-full border border-border bg-surface/80 px-3 text-sm text-muted">
        <Search className="size-4" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar aplicativos"
          className="w-full bg-transparent text-fg outline-none placeholder:text-faint"
        />
      </label>
      <div className="mt-4 flex gap-4 text-sm" role="tablist">
        {PHONE_GROUPS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={group === item.id}
            onClick={() => setGroup(item.id)}
            className={`border-b-2 pb-2 ${group === item.id ? "border-accent text-fg" : "border-transparent text-muted"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {visible.map((id) => {
          const spec = APPS.find((app) => app.id === id);
          if (!spec) return null;
          return (
            <button
              key={id}
              type="button"
              onClick={() => openApp(outputId, id)}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface/80 text-xs"
            >
              <AppIcon app={id} className="size-6 text-accent" />
              {spec.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PhoneNav({ outputId }: { outputId: string }) {
  const mode = useCompositor((state) => shellOf(state.shell, outputId));
  const setShell = useCompositor((state) => state.setShell);
  const items: Array<{ id: ShellMode | "files" | "settings"; label: string; icon: typeof Home; run: () => void; on: boolean }> = [
    { id: "home", label: "Início", icon: Home, on: mode === "home", run: () => setShell(outputId, "home") },
    { id: "files", label: "Arquivos", icon: Folder, on: false, run: () => openApp(outputId, "ficheiros") },
    { id: "apps", label: "Apps", icon: LayoutGrid, on: mode === "apps", run: () => setShell(outputId, "apps") },
    { id: "settings", label: "Ajustes", icon: Settings, on: false, run: () => openApp(outputId, "definicoes") },
    { id: "home", label: "Emma", icon: AudioLines, on: false, run: () => setShell(outputId, "home") },
  ];
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center px-3">
      <div className="pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-2xl border border-border bg-surface/95 px-2 py-1">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            aria-pressed={item.on}
            onClick={item.run}
            className={`inline-flex h-12 min-w-12 flex-col items-center justify-center rounded-xl ${item.on ? "text-accent" : "text-muted"}`}
          >
            <item.icon className="size-5" aria-hidden="true" />
            <span className="mt-0.5 text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
