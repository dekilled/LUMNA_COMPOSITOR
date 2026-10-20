import {
  Code,
  Folder,
  Globe,
  Mail,
  Play,
  Settings,
  StickyNote,
  Terminal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppKind, ClientWindow, Output } from "@/compositor/model";
import { useCompositor } from "@/compositor/store";

const ICONS: Record<AppKind, LucideIcon> = {
  terminal: Terminal,
  navegador: Globe,
  ficheiros: Folder,
  editor: Code,
  correio: Mail,
  leitor: Play,
  definicoes: Settings,
  notas: StickyNote,
};

export function AppIcon({ app, className }: { app: AppKind; className?: string }) {
  const Icon = ICONS[app];
  return <Icon className={className ?? "size-4"} aria-hidden="true" />;
}

export function WindowBody({ win, outputs }: { win: ClientWindow; outputs: Output[] }) {
  if (win.app === "terminal") return <TerminalBody win={win} outputs={outputs} />;
  if (win.app === "navegador") return <BrowserBody win={win} />;
  if (win.app === "ficheiros") return <FilesBody win={win} />;
  if (win.app === "editor") return <EditorBody win={win} />;
  if (win.app === "correio") return <MailBody win={win} />;
  if (win.app === "leitor") return <PlayerBody win={win} />;
  if (win.app === "definicoes") return <SettingsBody />;
  return <NotesBody win={win} />;
}

function TerminalBody({ win, outputs }: { win: ClientWindow; outputs: Output[] }) {
  return (
    <pre className="h-full overflow-auto p-3 font-mono text-xs leading-relaxed text-fg">
      <span className="text-accent">orbit@seat0</span>
      <span className="text-muted">:~$ </span>
      orbit-msg -t get_outputs{"\n"}
      {outputs.map((output) => (
        <span key={output.id}>
          {`Output ${output.connector}\n  ${output.width}×${output.height} @${output.hz}  scale ${output.scale.toFixed(2)}  espaço ${output.workspace}\n`}
        </span>
      ))}
      <span className="text-faint">escreve ajuda{"\n"}</span>
      {win.log}
      <span className="text-accent">orbit@seat0</span>
      <span className="text-muted">:~$ </span>
      {win.draft}
      <span className="text-accent">▍</span>
    </pre>
  );
}

function BrowserBody({ win }: { win: ClientWindow }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Globe className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
        <p className="truncate font-mono text-xs text-muted">wiki.archlinux.org</p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-3 py-3 text-xs leading-relaxed text-muted">
        <p className="text-lg text-fg">Seu Linux, do seu jeito.</p>
        <p className="mt-1 text-pretty">Organize o ambiente e deixe tudo ao alcance.</p>
        <HitBlock
          id="configure"
          hit={win.hit}
          title="configure"
          body="Cada janela é um xdg_toplevel. O compositor manda configure com tamanho e estados (activated, fullscreen, tiled) e o cliente responde com um buffer."
        />
        <HitBlock
          id="layout"
          hit={win.hit}
          title="output layout"
          body="Várias saídas partilham o mesmo scene graph. A posição é em coordenadas do wlr_output_layout, não do monitor."
        />
      </div>
    </div>
  );
}

function HitBlock({ id, hit, title, body }: { id: string; hit: string; title: string; body: string }) {
  const on = hit === id;
  return (
    <button
      type="button"
      data-hit={id}
      aria-pressed={on}
      className={`mt-2 block w-full rounded-md px-2 py-2 text-left ${on ? "bg-elevated text-fg" : ""}`}
    >
      <span className="text-sm text-fg">{title}</span>
      <span className="mt-1 block text-pretty text-xs text-muted">{body}</span>
    </button>
  );
}

function FilesBody({ win }: { win: ClientWindow }) {
  const rows = [
    ["orbit.h", "compositor"],
    ["notas.txt", "texto"],
    ["wallpaper.jpg", "imagem"],
    ["estrutura.md", "markdown"],
    ["Makefile", "build"],
  ];
  return (
    <ul className="h-full overflow-auto py-1">
      {rows.map(([name, kind]) => {
        const on = win.hit === name;
        return (
          <li key={name}>
            <button
              type="button"
              data-hit={name}
              aria-pressed={on}
              className={`flex min-h-11 w-full items-center gap-2 px-3 text-left text-xs ${on ? "bg-elevated" : ""}`}
            >
              <Folder className="size-3.5 text-accent" aria-hidden="true" />
              <span className="text-fg">{name}</span>
              <span className="ml-auto font-mono text-faint">{kind}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function EditorBody({ win }: { win: ClientWindow }) {
  const lines = [
    "/* mestre à esquerda, stack à direita, por saída */",
    "int master = box.width * server->master_pct / 100;",
    "place(view, box.x + gap, box.y + gap,",
    "    master - gap, box.height - 2 * gap, true);",
    "wlr_xdg_toplevel_set_tiled(view->toplevel,",
    "    WLR_EDGE_LEFT | WLR_EDGE_RIGHT |",
    "    WLR_EDGE_TOP | WLR_EDGE_BOTTOM);",
  ];
  return (
    <div className="h-full overflow-auto font-mono text-xs leading-relaxed">
      {lines.map((line, index) => (
        <div key={line} className="flex gap-3 px-2">
          <span className="w-5 shrink-0 text-right text-faint tabular-nums">{index + 40}</span>
          <span className={line.startsWith("/*") ? "text-faint" : "text-fg"}>{line}</span>
        </div>
      ))}
      {win.log || win.draft ? (
        <div className="flex gap-3 px-2">
          <span className="w-5 shrink-0 text-right text-faint tabular-nums">47</span>
          <span className="whitespace-pre-wrap text-fg">
            {win.log}
            {win.draft}
            <span className="text-accent">▍</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}

function MailBody({ win }: { win: ClientWindow }) {
  const letters = [
    ["doca", "Doca ligada", "DP-1 entrou no layout. O toque continua no DSI-1."],
    ["frame", "frame callback", "Cada saída pede o seu vsync. O scene só pinta o que está danificado."],
  ];
  return (
    <div className="h-full overflow-auto">
      {letters.map(([id, title, body]) => {
        const on = win.hit === id;
        return (
          <button
            key={id}
            type="button"
            data-hit={id}
            aria-pressed={on}
            className={`block w-full border-b border-border px-3 py-2 text-left ${on ? "bg-elevated" : ""}`}
          >
            <p className="text-xs text-fg">{title}</p>
            <p className="text-xs text-pretty text-muted">{body}</p>
          </button>
        );
      })}
    </div>
  );
}

function PlayerBody({ win }: { win: ClientWindow }) {
  const on = win.hit === "sessao";
  return (
    <button
      type="button"
      data-hit="sessao"
      aria-pressed={on}
      className={`flex h-full w-full flex-col justify-end gap-3 p-3 text-left ${on ? "bg-elevated" : "bg-bg"}`}
    >
      <div>
        <p className="text-sm text-fg">{on ? "A reproduzir" : "Sessão ao vivo"}</p>
        <p className="font-mono text-xs text-muted">seat0 · 48 kHz</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-inset">
        <div className={`h-full bg-accent ${on ? "w-full" : "w-2/3"}`} />
      </div>
      <p className="font-mono text-xs text-faint tabular-nums">{on ? "03:40 / 03:40" : "02:14 / 03:40"}</p>
    </button>
  );
}

function SettingsBody() {
  const focusFollows = useCompositor((state) => state.focusFollows);
  const setFocusFollows = useCompositor((state) => state.setFocusFollows);
  const keyboard = useCompositor((state) => state.keyboard);
  const toggleKeyboard = useCompositor((state) => state.toggleKeyboard);
  return (
    <div className="flex h-full flex-col gap-2 overflow-auto p-3">
      <Toggle
        label="Foco segue o ponteiro"
        on={focusFollows}
        onClick={() => setFocusFollows(!focusFollows)}
      />
      <Toggle label="Teclado no ecrã" on={keyboard} onClick={toggleKeyboard} />
    </div>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      data-nodrag
      aria-pressed={on}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 text-left text-xs text-fg"
    >
      <span>{label}</span>
      <span className={on ? "font-mono text-accent" : "font-mono text-faint"}>{on ? "on" : "off"}</span>
    </button>
  );
}

function NotesBody({ win }: { win: ClientWindow }) {
  return (
    <div className="h-full overflow-auto p-3 text-xs leading-relaxed text-muted">
      <p className="text-lg text-fg">Ideias para o LUMNA</p>
      <p className="mt-1 text-faint">Hoje</p>
      <p className="mt-3 text-pretty text-fg">Uma interface simples, bonita e feita para o toque.</p>
      <ul className="mt-3 space-y-2">
        {["Ajustar os gestos", "Testar a divisão de tela", "Organizar os atalhos"].map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="size-3 rounded-full ring-1 ring-muted" />
            {item}
          </li>
        ))}
      </ul>
      {win.log || win.draft ? (
        <p className="mt-3 whitespace-pre-wrap font-mono text-fg">
          {win.log}
          {win.draft}
          <span className="text-accent">▍</span>
        </p>
      ) : null}
    </div>
  );
}
