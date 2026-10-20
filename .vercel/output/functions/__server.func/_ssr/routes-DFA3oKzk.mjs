import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Code, C as House, D as Expand, E as Folder, F as AppWindow, M as Bluetooth, N as BatteryFull, O as Copy, P as AudioLines, S as Laptop, T as Gem, _ as Minus, a as Terminal, b as Lock, c as Smartphone, d as Settings, f as Search, g as Monitor, h as Play, j as BookOpen, k as Columns2, l as SlidersHorizontal, m as Plus, n as Wifi, o as StickyNote, p as Power, r as Volume2, s as Square, t as X, u as ShoppingBag, v as Mic, w as Globe, x as LayoutGrid, y as Mail } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DFA3oKzk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var APPS = [
	{
		id: "terminal",
		label: "Terminal",
		appId: "com.orbit.Terminal",
		title: "Terminal"
	},
	{
		id: "navegador",
		label: "Navegador",
		appId: "com.orbit.Navegador",
		title: "Navegador"
	},
	{
		id: "ficheiros",
		label: "Arquivos",
		appId: "com.orbit.Ficheiros",
		title: "Arquivos"
	},
	{
		id: "editor",
		label: "Editor",
		appId: "com.orbit.Editor",
		title: "Editor"
	},
	{
		id: "correio",
		label: "Correio",
		appId: "com.orbit.Correio",
		title: "Correio"
	},
	{
		id: "leitor",
		label: "Música",
		appId: "com.orbit.Leitor",
		title: "Música"
	},
	{
		id: "definicoes",
		label: "Ajustes",
		appId: "com.orbit.Definicoes",
		title: "Ajustes"
	},
	{
		id: "notas",
		label: "Notas",
		appId: "com.orbit.Notas",
		title: "Notas"
	}
];
var WORKSPACES = [
	1,
	2,
	3,
	4
];
function appSpec(kind) {
	return APPS.find((app) => app.id === kind) ?? APPS[0];
}
function windowsOn(scene, outputId) {
	const output = scene.outputs.find((item) => item.id === outputId);
	if (!output) return [];
	return scene.windows.filter((win) => win.outputId === outputId && win.workspace === output.workspace).sort((a, b) => a.order - b.order);
}
function emptySplit() {
	return {
		split: false,
		splitPrimaryId: null,
		splitSecondaryId: null
	};
}
function touchStaysOnPhone(outputs, outputId, kind) {
	if (kind !== "touch") return true;
	const phone = outputs.find((output) => output.profile === "dsi");
	if (!phone) return true;
	return outputId === phone.id;
}
function phoneOf(outputs) {
	return outputs.find((output) => output.profile === "dsi");
}
function orderedOn(windows, outputId, workspace) {
	return windows.filter((win) => win.outputId === outputId && win.workspace === workspace && !win.minimized).sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : 1));
}
function nextIn(list, afterId, accept) {
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
function focusForWorkspace(windows, focusedId, outputId, workspace) {
	const visible = orderedOn(windows, outputId, workspace);
	if (visible.length > 0) return visible[0].id;
	if (windows.find((win) => win.id === focusedId)?.outputId === outputId) return null;
	return focusedId;
}
function pinSplit(windows, outputs, focusedId) {
	const phone = phoneOf(outputs);
	if (!phone) return emptySplit();
	const list = orderedOn(windows, phone.id, phone.workspace);
	const primary = list.find((win) => win.id === focusedId) ?? list[0];
	if (!primary) return emptySplit();
	const secondary = nextIn(list, primary.id, (win) => win.id !== primary.id);
	if (!secondary) return emptySplit();
	return {
		split: true,
		splitPrimaryId: primary.id,
		splitSecondaryId: secondary.id
	};
}
function pairStillTogether(after, phone, slots) {
	const primary = after.find((win) => win.id === slots.splitPrimaryId);
	const secondary = after.find((win) => win.id === slots.splitSecondaryId);
	if (!primary || !secondary || primary.id === secondary.id) return null;
	if (primary.outputId !== phone.id || secondary.outputId !== phone.id) return null;
	if (primary.workspace !== secondary.workspace) return null;
	return {
		split: true,
		splitPrimaryId: primary.id,
		splitSecondaryId: secondary.id
	};
}
function repairSplit(outputs, before, after, slots, leftId) {
	if (!slots.split) return emptySplit();
	const phone = phoneOf(outputs);
	if (!phone) return emptySplit();
	if (leftId !== slots.splitPrimaryId && leftId !== slots.splitSecondaryId) return pairStillTogether(after, phone, slots) ?? emptySplit();
	const onVisible = (id) => {
		if (!id) return null;
		const win = after.find((item) => item.id === id);
		if (!win || win.outputId !== phone.id || win.workspace !== phone.workspace) return null;
		return win;
	};
	let primary = onVisible(slots.splitPrimaryId);
	let secondary = onVisible(slots.splitSecondaryId);
	const fill = (missingId, taken) => {
		const visible = orderedOn(after, phone.id, phone.workspace);
		const origin = before.find((win) => win.id === missingId);
		const oldList = orderedOn(before, phone.id, origin?.workspace ?? phone.workspace);
		const takenId = taken?.id ?? null;
		return nextIn(oldList, missingId, (win) => {
			if (win.id === missingId || win.id === takenId) return false;
			return visible.some((item) => item.id === win.id);
		}) ?? visible.find((item) => item.id !== takenId) ?? null;
	};
	if (!primary) primary = fill(slots.splitPrimaryId, secondary);
	if (!secondary || primary?.id === secondary.id) secondary = fill(slots.splitSecondaryId, primary);
	if (!primary || !secondary || primary.id === secondary.id) return emptySplit();
	return {
		split: true,
		splitPrimaryId: primary.id,
		splitSecondaryId: secondary.id
	};
}
function admitToSplit(outputs, slots, focusedId, win) {
	if (!slots.split) return slots;
	const phone = phoneOf(outputs);
	if (!phone || win.outputId !== phone.id || win.workspace !== phone.workspace) return slots;
	if (win.id === slots.splitPrimaryId || win.id === slots.splitSecondaryId) return slots;
	if (focusedId === slots.splitPrimaryId) return {
		...slots,
		splitSecondaryId: win.id
	};
	if (focusedId === slots.splitSecondaryId) return {
		...slots,
		splitPrimaryId: win.id
	};
	if (slots.splitPrimaryId) return {
		...slots,
		splitSecondaryId: win.id
	};
	return {
		...slots,
		splitPrimaryId: win.id
	};
}
function win(id, app, outputId, workspace, order, floating = false) {
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
		fx: .08 + order % 3 * .05,
		fy: .1 + order % 3 * .06,
		fw: .46,
		fh: .55,
		order,
		draft: "",
		log: "",
		hit: ""
	};
}
function boot(preset, lines) {
	const events = lines.map(([iface, msg], index) => ({
		id: index + 1,
		iface,
		msg
	}));
	events.reverse();
	return {
		events,
		eventSeq: lines.length
	};
}
function createScene(preset, keep) {
	const layout = keep?.layout ?? "mestre";
	const gaps = keep?.gaps ?? 8;
	const masterRatio = keep?.masterRatio ?? .56;
	const focusFollows = keep?.focusFollows ?? false;
	if (preset === "celular") return {
		preset,
		layout,
		gaps,
		masterRatio,
		focusFollows,
		outputs: [{
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
			workspace: 1
		}],
		windows: [
			win("c1", "navegador", "dsi", 1, 0),
			win("c2", "correio", "dsi", 1, 1),
			win("c3", "notas", "dsi", 1, 2),
			win("c4", "leitor", "dsi", 1, 3)
		],
		focusedId: "c1",
		focusedOutputId: "dsi",
		overview: false,
		split: false,
		splitPrimaryId: null,
		splitSecondaryId: null,
		splitRatio: .5,
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
			["xdg_wm_base", "cliente com.orbit.Navegador mapeado"]
		])
	};
	if (preset === "dock") return {
		preset,
		layout,
		gaps,
		masterRatio,
		focusFollows,
		outputs: [{
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
			workspace: 1
		}, {
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
			workspace: 1
		}],
		windows: [
			win("c1", "notas", "dsi", 1, 0),
			win("c2", "navegador", "dp", 1, 0),
			win("c3", "terminal", "dp", 1, 1),
			win("c4", "editor", "dp", 1, 2)
		],
		focusedId: "c2",
		focusedOutputId: "dp",
		overview: false,
		split: false,
		splitPrimaryId: null,
		splitSecondaryId: null,
		splitRatio: .5,
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
			["wlr_scene", "reparent de toplevels para a saída sob o centro"]
		])
	};
	return {
		preset: "mesa",
		layout,
		gaps,
		masterRatio,
		focusFollows,
		outputs: [{
			id: "edp",
			connector: "eDP-1",
			profile: "edp",
			label: "Portátil",
			x: 0,
			y: 80,
			width: 1600,
			height: 1e3,
			scale: 1.5,
			hz: 60,
			workspace: 1
		}, {
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
			workspace: 1
		}],
		windows: [
			win("c1", "terminal", "edp", 1, 0),
			win("c2", "editor", "edp", 1, 1),
			win("c3", "navegador", "dp", 1, 0),
			win("c4", "ficheiros", "dp", 1, 1)
		],
		focusedId: "c3",
		focusedOutputId: "dp",
		overview: false,
		split: false,
		splitPrimaryId: null,
		splitSecondaryId: null,
		splitRatio: .5,
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
			["xdg_toplevel", "configure tiled nas duas saídas"]
		])
	};
}
function portraitOutput(afterX) {
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
		workspace: 1
	};
}
function layoutCards(outputs, stageW, stageH) {
	const gap = 16;
	const label = 28;
	const availW = Math.max(220, stageW - 32);
	const availH = Math.max(220, stageH - 32);
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
		return {
			height,
			widths
		};
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
			cards: [{
				id: outputs[0].id,
				width: Math.round(width),
				height: Math.round(height)
			}]
		};
	}
	const rowPlan = row();
	if (stageW >= 960 && rowPlan.height >= 420) return {
		scroll: false,
		cards: outputs.map((output, index) => ({
			id: output.id,
			width: Math.round(rowPlan.widths[index] ?? 320),
			height: Math.round(rowPlan.height)
		}))
	};
	const maxH = Math.min(availH * .92, 620);
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
			return {
				id: output.id,
				width: Math.round(width),
				height: Math.round(height)
			};
		})
	};
}
var SOURCES = [
	{
		name: "LEIA-ME",
		body: "Orbit — compositor Wayland com wlroots, várias janelas e várias saídas.\n\nA bancada é a política a correr: mosaico mestre/stack, grade, monóculo,\nflutuantes, espaços por saída, doca do telemóvel e ecrã dividido. Este\ndirectório é o que compilas num Linux. Não corre dentro da página: precisa\nde DRM/KMS (num TTY) ou do backend Wayland/X11 do wlroots, que abre janelas\ne serve de monitores virtuais.\n\nDependências\n  wlroots 0.18, wayland-server, xkbcommon, libinput, pixman, mesa\n  Debian/Ubuntu: libwlroots-dev, libwayland-dev, libxkbcommon-dev\n  O módulo pkg-config em 0.18 chama-se wlroots.\n  Em 0.19 chama-se wlroots-0.19 — passa PKGS no make (ver Makefile).\n  O fonte segue a API 0.18, que a 0.19 mantém nestes pontos: backend com\n  event loop, wlr_output_state, xdg_shell versão 3, new_toplevel/new_popup\n  e o configure manual no initial_commit.\n\nCompilar e arrancar\n  make\n  ./orbit -s 'foot'\n\n  Um terminal depois de estar no ar: Alt+Enter (ou ORBIT_TERMINAL=alacritty).\n\nMódulos\n  orbit.h     tipos partilhados e limites\n  server.c    arranque, backend, cena, variáveis\n  output.c    saídas, escala do telemóvel, toque preso ao DSI\n  view.c      toplevels, foco, popups\n  arrange.c   mosaico e o par dividido do telemóvel\n  input.c     ponteiro, toque e teclado\n  keybinds.c  atalhos com Alt\n\n  Os registos nossos são em português. Os do wlroots continuam em inglês.\n\nLimites\n  ORBIT_MAX_VIEWS é 64 (compilação). Ao chegar a 48 janelas em mosaico\n  numa saída há um aviso; na 65.ª a janela deixa de entrar no mosaico\n  e fica um erro no registo. O foco com Alt+J/K também corta nessa marca.\n  ORBIT_GAP=8          intervalo, 0..64\n  ORBIT_MASTER=56      percentagem do mestre, 40..70\n  ORBIT_PHONE_SCALE=2  escala da saída DSI (ou de ORBIT_PHONE), 1..3\n  Um valor fora da gama é recusado e fica o omissão, com erro no registo.\n\nPopup\n  O unconstrain usa a geometria da janela (origem da superfície do\n  toplevel), não a caixa de todo o layout. Sem tamanho ainda, usa a\n  saída dessa janela traduzida para o mesmo espaço.\n\nSecretária, a partir de um TTY\n  ./orbit\n  O backend DRM torna-se master. Cada conector (eDP-1, DP-1, HDMI-A-1)\n  dispara new_output. wlr_output_layout_add_auto encosta-os da esquerda\n  para a direita. Cada saída tem o seu frame callback e o seu espaço\n  activo. arrange() distribui os toplevels dessa saída.\n  Desligar um conector que não seja o último leva os toplevels para a\n  primeira saída que resta, no espaço activo dela, sem ecrã inteiro.\n  Na bancada o botão está em qualquer saída, não só no HDMI.\n\nVárias saídas sem sair do teu compositor actual\n  WLR_WL_OUTPUTS=2 ./orbit -s foot\n  WLR_X11_OUTPUTS=2 ./orbit -s foot\n  Cada número é uma janela-monitor. Arrasta com Alt+botão, ou Alt+←/→.\n\nTelemóvel (PinePhone, Librem 5, postmarketOS)\n  O mesmo binário. O painel interno aparece como DSI-1. Sem EDID útil,\n  orbit_configure_output aplica scale 2 e o viewporter + fractional-scale\n  avisam os clientes. Nessa saída a política é monóculo: uma janela de\n  cada vez. Alt+S fixa um par: a janela focada em cima e a seguinte\n  em baixo. O foco anda entre as duas sem as trocar de sítio. Fechar\n  uma põe a janela seguinte no lugar que ficou vazio. A bancada arrasta\n  uma costura fina por cima das duas; este binário divide a altura ao meio.\n  O toque é agarrado ao cursor (o dedo comporta-se como ponteiro) e, se\n  existir DSI, mapeado só para esse ecrã — na doca o dedo não salta para\n  o DP-1. Na bancada o dedo vira wl_pointer na superfície do cliente\n  (press/release em coordenadas da saída) e não atravessa para o outro\n  monitor. O teclado do telemóvel encolhe a janela em vez de a tapar.\n  Alt+1–4 muda o espaço desta saída. Se o espaço está vazio, o teclado\n  sai do cliente que ficou no espaço anterior — não continua a escrever\n  numa janela escondida. A vista geral lista janelas de todos os espaços;\n  abrir uma muda o DSI para o espaço dessa janela. O par dividido espera\n  e volta quando as duas estão outra vez nesse espaço.\n  Para ensaiar a política de telemóvel numa saída virtual:\n  WLR_WL_OUTPUTS=2 ORBIT_PHONE=WL-1 ./orbit\n\nAtalhos (Alt premido)\n  Enter        lançar o terminal\n  Esc          terminar\n  Q            fechar o toplevel focado\n  Espaço       flutuante / mosaico\n  F            ecrã inteiro na saída da janela\n  S            dividir o ecrã no telemóvel\n  J / K        focar o seguinte / anterior neste espaço\n  H / L        encolher / alargar o mestre\n  ← / →        mudar a janela de saída\n  1–4          espaço da saída sob o ponteiro\n  Shift+1–4    mover a janela focada para esse espaço\n  Alt+botão    arrastar; ao largar noutra saída, a janela muda de mãe\n\nseat0 anuncia pointer e keyboard. O toque entra pelo cursor de propósito:\nanunciar wl_touch sem entregar frames parte clientes. Todos os teclados\npartilham um contexto e um keymap. XKB_DEFAULT_RULES, XKB_DEFAULT_MODEL,\nXKB_DEFAULT_LAYOUT, XKB_DEFAULT_VARIANT e XKB_DEFAULT_OPTIONS escolhem\no mapa; se faltarem, o xkbcommon usa o mapa por omissão.\n"
	},
	{
		name: "Makefile",
		body: "# Orbit — wlroots 0.18 usa o módulo \"wlroots\".\n# wlroots 0.19 muda o nome: make PKGS=\"wlroots-0.19 wayland-server xkbcommon\"\nPKGS ?= wlroots wayland-server xkbcommon\nSRCS = server.c output.c view.c arrange.c input.c keybinds.c\n\norbit: $(SRCS) orbit.h\n	$(CC) -g -Wall -Wextra -DWLR_USE_UNSTABLE -o $@ $(SRCS) $(shell pkg-config --cflags --libs $(PKGS))\n\nclean:\n	rm -f orbit\n\n.PHONY: clean\n"
	},
	{
		name: "orbit.h",
		body: "#ifndef ORBIT_H\n#define ORBIT_H\n\n#define _POSIX_C_SOURCE 200112L\n\n#include <stdbool.h>\n#include <stdint.h>\n#include <wayland-server-core.h>\n#include <wlr/types/wlr_cursor.h>\n#include <wlr/types/wlr_keyboard.h>\n#include <wlr/types/wlr_output.h>\n#include <wlr/types/wlr_output_layout.h>\n#include <wlr/types/wlr_scene.h>\n#include <wlr/types/wlr_seat.h>\n#include <wlr/types/wlr_xcursor_manager.h>\n#include <wlr/types/wlr_xdg_shell.h>\n#include <xkbcommon/xkbcommon.h>\n\n/* Tecto das listas em stack. O tamanho é de compilação; o aviso é em runtime. */\n#define ORBIT_MAX_VIEWS 64\n#define ORBIT_GAP_DEFAULT 8\n#define ORBIT_GAP_MAX 64\n#define ORBIT_MASTER_DEFAULT 56\n#define ORBIT_MASTER_MIN 40\n#define ORBIT_MASTER_MAX 70\n#define ORBIT_PHONE_SCALE_DEFAULT 2.0f\n\n/*\n * Registos do binário em português. O wlroots continua a escrever os dele\n * em inglês; os nossos wlr_log não misturam os dois.\n */\n\nstruct wlr_backend;\nstruct wlr_renderer;\nstruct wlr_allocator;\nstruct wlr_input_device;\nstruct wlr_surface;\n\nstruct orbit_view;\nstruct orbit_output;\nstruct orbit_server;\n\nenum orbit_cursor_mode {\n	ORBIT_CURSOR_PASSTHROUGH,\n	ORBIT_CURSOR_MOVE,\n};\n\nstruct orbit_server {\n	struct wl_display *display;\n	struct wlr_backend *backend;\n	struct wlr_renderer *renderer;\n	struct wlr_allocator *allocator;\n	struct wlr_scene *scene;\n	struct wlr_output_layout *layout;\n	struct wl_listener new_output;\n	struct wl_list outputs;\n\n	struct wlr_xdg_shell *xdg_shell;\n	struct wl_listener new_xdg_toplevel;\n	struct wl_listener new_xdg_popup;\n	struct wl_list views;\n\n	struct wlr_cursor *cursor;\n	struct wlr_xcursor_manager *cursor_mgr;\n	struct wl_listener cursor_motion;\n	struct wl_listener cursor_motion_absolute;\n	struct wl_listener cursor_button;\n	struct wl_listener cursor_axis;\n	struct wl_listener cursor_frame;\n\n	struct wlr_seat *seat;\n	struct wl_listener new_input;\n	struct wl_listener request_cursor;\n	struct wl_listener request_set_selection;\n	struct wl_list keyboards;\n	struct wl_list touches;\n\n	enum orbit_cursor_mode cursor_mode;\n	struct orbit_view *grabbed;\n	struct orbit_view *focused;\n	struct orbit_view *split_top;\n	struct orbit_view *split_bottom;\n	double grab_x, grab_y;\n	int grab_gx, grab_gy;\n	int master_pct;\n	int gap;\n	float phone_scale;\n	bool phone_split;\n	const char *term;\n};\n\nstruct orbit_output {\n	struct wl_list link;\n	struct orbit_server *server;\n	struct wlr_output *wlr;\n	struct wlr_scene_rect *bg;\n	struct wl_listener frame;\n	struct wl_listener request_state;\n	struct wl_listener destroy;\n	int tag;\n	bool warned_near;\n	bool warned_cap;\n};\n\nstruct orbit_view {\n	struct wl_list link;\n	struct orbit_server *server;\n	struct orbit_output *output;\n	struct wlr_xdg_toplevel *toplevel;\n	struct wlr_scene_tree *scene_tree;\n	struct wl_listener map;\n	struct wl_listener unmap;\n	struct wl_listener commit;\n	struct wl_listener destroy;\n	int x, y, w, h;\n	int tag;\n	bool floating;\n	bool fullscreen;\n	bool mapped;\n};\n\nstruct orbit_keyboard {\n	struct wl_list link;\n	struct orbit_server *server;\n	struct wlr_keyboard *wlr_keyboard;\n	struct wl_listener modifiers;\n	struct wl_listener key;\n	struct wl_listener destroy;\n};\n\nstruct orbit_touch {\n	struct wl_list link;\n	struct wlr_input_device *device;\n	struct wl_listener destroy;\n};\n\nstruct orbit_popup {\n	struct orbit_server *server;\n	struct orbit_view *parent_view;\n	struct wlr_xdg_popup *xdg_popup;\n	struct wl_listener commit;\n	struct wl_listener destroy;\n};\n\nbool output_is_phone(struct wlr_output *output);\nstruct orbit_output *output_from_wlr(struct orbit_server *server, struct wlr_output *wlr);\nstruct orbit_output *output_at(struct orbit_server *server, double lx, double ly);\nstruct orbit_output *cursor_output(struct orbit_server *server);\nstruct orbit_output *adjacent_output(struct orbit_server *server, struct orbit_output *from, int dir);\nvoid orbit_outputs_bind(struct orbit_server *server);\n\nvoid orbit_views_bind(struct orbit_server *server);\nvoid orbit_focus(struct orbit_view *view);\nvoid orbit_unfocus(struct orbit_server *server);\nvoid focus_top(struct orbit_server *server, struct orbit_output *output);\nstruct orbit_view *view_at(struct orbit_server *server, double lx, double ly,\n	struct wlr_surface **surface, double *sx, double *sy);\n\nvoid orbit_arrange(struct orbit_server *server);\nvoid orbit_focus_step(struct orbit_server *server, int dir);\nvoid orbit_split_release(struct orbit_server *server, struct orbit_view *view);\nvoid phone_on_map(struct orbit_server *server, struct orbit_view *view, struct orbit_view *prev);\n\nvoid orbit_input_bind(struct orbit_server *server);\nvoid orbit_xkb_prepare(void);\nvoid orbit_xkb_finish(void);\n\nbool orbit_keybinding(struct orbit_server *server, xkb_keysym_t sym, uint32_t mods);\n\n#endif\n"
	},
	{
		name: "server.c",
		body: "#include \"orbit.h\"\n\n#include <getopt.h>\n#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <wlr/backend.h>\n#include <wlr/render/allocator.h>\n#include <wlr/render/wlr_renderer.h>\n#include <wlr/types/wlr_compositor.h>\n#include <wlr/types/wlr_cursor.h>\n#include <wlr/types/wlr_data_device.h>\n#include <wlr/types/wlr_fractional_scale_v1.h>\n#include <wlr/types/wlr_output_layout.h>\n#include <wlr/types/wlr_scene.h>\n#include <wlr/types/wlr_seat.h>\n#include <wlr/types/wlr_subcompositor.h>\n#include <wlr/types/wlr_viewporter.h>\n#include <wlr/types/wlr_xcursor_manager.h>\n#include <wlr/types/wlr_xdg_shell.h>\n#include <wlr/util/log.h>\n\nstatic int env_int(const char *name, int fallback, int min, int max) {\n	const char *text = getenv(name);\n	if (!text || !text[0]) {\n		return fallback;\n	}\n	char *end = NULL;\n	long value = strtol(text, &end, 10);\n	if (end == text || *end != '\\0' || value < min || value > max) {\n		wlr_log(WLR_ERROR, \"%s=%s inválido (%d..%d); a usar %d\", name, text, min, max, fallback);\n		return fallback;\n	}\n	return (int)value;\n}\n\nstatic float env_float(const char *name, float fallback, float min, float max) {\n	const char *text = getenv(name);\n	if (!text || !text[0]) {\n		return fallback;\n	}\n	char *end = NULL;\n	float value = strtof(text, &end);\n	if (end == text || *end != '\\0' || value < min || value > max) {\n		wlr_log(WLR_ERROR, \"%s=%s inválido (%.1f..%.1f); a usar %.1f\", name, text, min, max, fallback);\n		return fallback;\n	}\n	return value;\n}\n\nstatic int fail(struct orbit_server *server, const char *msg) {\n	wlr_log(WLR_ERROR, \"%s\", msg);\n	if (server->display) {\n		wl_display_destroy(server->display);\n		server->display = NULL;\n	}\n	orbit_xkb_finish();\n	return 1;\n}\n\nint main(int argc, char *argv[]) {\n	char *startup = NULL;\n	int opt;\n	while ((opt = getopt(argc, argv, \"s:h\")) != -1) {\n		if (opt == 's') {\n			startup = optarg;\n		} else {\n			fprintf(stderr, \"uso: %s [-s comando]\\n\", argv[0]);\n			return opt == 'h' ? 0 : 1;\n		}\n	}\n\n	wlr_log_init(WLR_INFO, NULL);\n	struct orbit_server server = { 0 };\n	server.master_pct = env_int(\"ORBIT_MASTER\", ORBIT_MASTER_DEFAULT, ORBIT_MASTER_MIN, ORBIT_MASTER_MAX);\n	server.gap = env_int(\"ORBIT_GAP\", ORBIT_GAP_DEFAULT, 0, ORBIT_GAP_MAX);\n	server.phone_scale = env_float(\"ORBIT_PHONE_SCALE\", ORBIT_PHONE_SCALE_DEFAULT, 1.0f, 3.0f);\n	server.term = getenv(\"ORBIT_TERMINAL\");\n	server.display = wl_display_create();\n	if (!server.display) {\n		wlr_log(WLR_ERROR, \"falha ao criar o display Wayland\");\n		return 1;\n	}\n\n	struct wlr_session *session = NULL;\n	server.backend = wlr_backend_autocreate(wl_display_get_event_loop(server.display), &session);\n	(void)session;\n	if (!server.backend) {\n		return fail(&server, \"falha ao criar o backend\");\n	}\n	server.renderer = wlr_renderer_autocreate(server.backend);\n	if (!server.renderer) {\n		return fail(&server, \"falha ao criar o renderer\");\n	}\n	wlr_renderer_init_wl_display(server.renderer, server.display);\n	server.allocator = wlr_allocator_autocreate(server.backend, server.renderer);\n	if (!server.allocator) {\n		return fail(&server, \"falha ao criar o allocator\");\n	}\n\n	if (!wlr_compositor_create(server.display, 5, server.renderer)) {\n		return fail(&server, \"falha ao criar o compositor\");\n	}\n	wlr_subcompositor_create(server.display);\n	wlr_data_device_manager_create(server.display);\n	wlr_viewporter_create(server.display);\n	wlr_fractional_scale_manager_v1_create(server.display, 1);\n\n	server.layout = wlr_output_layout_create(server.display);\n	if (!server.layout) {\n		return fail(&server, \"falha ao criar o layout de saídas\");\n	}\n	wl_list_init(&server.outputs);\n	orbit_outputs_bind(&server);\n\n	server.scene = wlr_scene_create();\n	if (!server.scene) {\n		return fail(&server, \"falha ao criar a cena\");\n	}\n	wlr_scene_attach_output_layout(server.scene, server.layout);\n\n	wl_list_init(&server.views);\n	server.xdg_shell = wlr_xdg_shell_create(server.display, 3);\n	if (!server.xdg_shell) {\n		return fail(&server, \"falha ao criar o xdg_shell\");\n	}\n	orbit_views_bind(&server);\n\n	server.cursor = wlr_cursor_create();\n	if (!server.cursor) {\n		return fail(&server, \"falha ao criar o cursor\");\n	}\n	wlr_cursor_attach_output_layout(server.cursor, server.layout);\n	server.cursor_mgr = wlr_xcursor_manager_create(NULL, 24);\n	if (!server.cursor_mgr) {\n		return fail(&server, \"falha ao criar o cursor X\");\n	}\n	wlr_xcursor_manager_load(server.cursor_mgr, 1);\n	wlr_xcursor_manager_load(server.cursor_mgr, 2);\n\n	wl_list_init(&server.keyboards);\n	wl_list_init(&server.touches);\n	server.seat = wlr_seat_create(server.display, \"seat0\");\n	if (!server.seat) {\n		return fail(&server, \"falha ao criar o seat0\");\n	}\n	orbit_input_bind(&server);\n	orbit_xkb_prepare();\n\n	const char *socket = wl_display_add_socket_auto(server.display);\n	if (!socket) {\n		return fail(&server, \"falha ao abrir o socket Wayland\");\n	}\n	if (!wlr_backend_start(server.backend)) {\n		return fail(&server, \"falha ao arrancar o backend\");\n	}\n	setenv(\"WAYLAND_DISPLAY\", socket, 1);\n	wlr_log(WLR_INFO, \"WAYLAND_DISPLAY=%s intervalo %d mestre %d%% escala do telemóvel %.2f\",\n		socket, server.gap, server.master_pct, server.phone_scale);\n	if (startup && fork() == 0) {\n		execl(\"/bin/sh\", \"/bin/sh\", \"-c\", startup, (char *)NULL);\n		_exit(1);\n	}\n	wl_display_run(server.display);\n	wl_display_destroy_clients(server.display);\n	wl_display_destroy(server.display);\n	orbit_xkb_finish();\n	return 0;\n}\n"
	},
	{
		name: "output.c",
		body: "#include \"orbit.h\"\n\n#include <stdlib.h>\n#include <string.h>\n#include <time.h>\n#include <wlr/types/wlr_output.h>\n#include <wlr/types/wlr_scene.h>\n#include <wlr/util/log.h>\n\nbool output_is_phone(struct wlr_output *output) {\n	const char *forced = getenv(\"ORBIT_PHONE\");\n	if (forced && output->name && strcmp(forced, output->name) == 0) {\n		return true;\n	}\n	return output->name && strstr(output->name, \"DSI\") != NULL;\n}\n\nstruct orbit_output *output_from_wlr(struct orbit_server *server, struct wlr_output *wlr) {\n	if (!wlr) {\n		return NULL;\n	}\n	struct orbit_output *output;\n	wl_list_for_each(output, &server->outputs, link) {\n		if (output->wlr == wlr) {\n			return output;\n		}\n	}\n	return NULL;\n}\n\nstruct orbit_output *output_at(struct orbit_server *server, double lx, double ly) {\n	return output_from_wlr(server, wlr_output_layout_output_at(server->layout, lx, ly));\n}\n\nstruct orbit_output *cursor_output(struct orbit_server *server) {\n	if (wl_list_empty(&server->outputs)) {\n		return NULL;\n	}\n	struct orbit_output *output = output_at(server, server->cursor->x, server->cursor->y);\n	if (output) {\n		return output;\n	}\n	return wl_container_of(server->outputs.next, output, link);\n}\n\nstruct orbit_output *adjacent_output(struct orbit_server *server, struct orbit_output *from, int dir) {\n	struct wlr_box from_box;\n	wlr_output_layout_get_box(server->layout, from->wlr, &from_box);\n	int from_cx = from_box.x + from_box.width / 2;\n	struct orbit_output *best = NULL;\n	int best_dx = 0;\n	struct orbit_output *output;\n	wl_list_for_each(output, &server->outputs, link) {\n		if (output == from) {\n			continue;\n		}\n		struct wlr_box box;\n		wlr_output_layout_get_box(server->layout, output->wlr, &box);\n		int dx = (box.x + box.width / 2) - from_cx;\n		if ((dir < 0 && dx >= 0) || (dir > 0 && dx <= 0)) {\n			continue;\n		}\n		int adx = dx < 0 ? -dx : dx;\n		int abd = best_dx < 0 ? -best_dx : best_dx;\n		if (!best || adx < abd) {\n			best = output;\n			best_dx = dx;\n		}\n	}\n	return best;\n}\n\nstatic void pin_touch(struct orbit_server *server) {\n	struct orbit_output *phone = NULL;\n	struct orbit_output *output;\n	wl_list_for_each(output, &server->outputs, link) {\n		if (output_is_phone(output->wlr)) {\n			phone = output;\n			break;\n		}\n	}\n	if (!phone) {\n		return;\n	}\n	struct orbit_touch *touch;\n	wl_list_for_each(touch, &server->touches, link) {\n		wlr_cursor_map_input_to_output(server->cursor, touch->device, phone->wlr);\n	}\n}\n\nstatic void output_frame(struct wl_listener *listener, void *data) {\n	struct orbit_output *output = wl_container_of(listener, output, frame);\n	struct wlr_scene_output *scene_output = wlr_scene_get_scene_output(output->server->scene, output->wlr);\n	if (!scene_output) {\n		return;\n	}\n	wlr_scene_output_commit(scene_output, NULL);\n	struct timespec now;\n	clock_gettime(CLOCK_MONOTONIC, &now);\n	wlr_scene_output_send_frame_done(scene_output, &now);\n}\n\nstatic void output_request_state(struct wl_listener *listener, void *data) {\n	struct orbit_output *output = wl_container_of(listener, output, request_state);\n	const struct wlr_output_event_request_state *event = data;\n	wlr_output_commit_state(output->wlr, event->state);\n	orbit_arrange(output->server);\n}\n\nstatic bool configure_output(struct orbit_output *output) {\n	struct wlr_output *wlr = output->wlr;\n	if (!wlr_output_init_render(wlr, output->server->allocator, output->server->renderer)) {\n		wlr_log(WLR_ERROR, \"saída %s: render falhou\", wlr->name);\n		return false;\n	}\n	struct wlr_output_state state;\n	wlr_output_state_init(&state);\n	wlr_output_state_set_enabled(&state, true);\n	struct wlr_output_mode *mode = wlr_output_preferred_mode(wlr);\n	if (mode) {\n		wlr_output_state_set_mode(&state, mode);\n	}\n	if (output_is_phone(wlr)) {\n		wlr_output_state_set_scale(&state, output->server->phone_scale);\n	}\n	bool ok = wlr_output_commit_state(wlr, &state);\n	wlr_output_state_finish(&state);\n	if (!ok) {\n		wlr_log(WLR_ERROR, \"saída %s: commit do modo falhou\", wlr->name);\n	}\n	return ok;\n}\n\nstatic void output_destroy(struct wl_listener *listener, void *data) {\n	struct orbit_output *output = wl_container_of(listener, output, destroy);\n	struct orbit_server *server = output->server;\n	struct orbit_output *fallback = NULL;\n	struct orbit_output *other;\n	wl_list_for_each(other, &server->outputs, link) {\n		if (other != output) {\n			fallback = other;\n			break;\n		}\n	}\n	if (output_is_phone(output->wlr)) {\n		server->phone_split = false;\n		server->split_top = NULL;\n		server->split_bottom = NULL;\n		struct orbit_touch *touch;\n		wl_list_for_each(touch, &server->touches, link) {\n			wlr_cursor_map_input_to_output(server->cursor, touch->device, NULL);\n		}\n	}\n	struct orbit_view *view;\n	wl_list_for_each(view, &server->views, link) {\n		if (view->output == output) {\n			orbit_split_release(server, view);\n			view->output = fallback;\n			view->fullscreen = false;\n			if (fallback) {\n				view->tag = fallback->tag;\n			}\n		}\n	}\n	wl_list_remove(&output->link);\n	wl_list_remove(&output->frame.link);\n	wl_list_remove(&output->request_state.link);\n	wl_list_remove(&output->destroy.link);\n	wlr_log(WLR_INFO, \"saída %s desligada\", output->wlr->name);\n	wlr_output_layout_remove(server->layout, output->wlr);\n	if (output->bg) {\n		wlr_scene_node_destroy(&output->bg->node);\n	}\n	free(output);\n	orbit_arrange(server);\n	pin_touch(server);\n}\n\nstatic void server_new_output(struct wl_listener *listener, void *data) {\n	struct orbit_server *server = wl_container_of(listener, server, new_output);\n	struct wlr_output *wlr = data;\n	struct orbit_output *output = calloc(1, sizeof(*output));\n	if (!output) {\n		wlr_log(WLR_ERROR, \"sem memória para a saída %s\", wlr->name);\n		return;\n	}\n	output->server = server;\n	output->wlr = wlr;\n	if (!configure_output(output)) {\n		free(output);\n		return;\n	}\n	output->frame.notify = output_frame;\n	wl_signal_add(&wlr->events.frame, &output->frame);\n	output->request_state.notify = output_request_state;\n	wl_signal_add(&wlr->events.request_state, &output->request_state);\n	output->destroy.notify = output_destroy;\n	wl_signal_add(&wlr->events.destroy, &output->destroy);\n	wl_list_insert(&server->outputs, &output->link);\n\n	const float bg[4] = { 0.063f, 0.078f, 0.071f, 1.0f };\n	output->bg = wlr_scene_rect_create(&server->scene->tree, 1, 1, bg);\n	if (!output->bg) {\n		wlr_log(WLR_ERROR, \"saída %s: fundo da cena falhou\", wlr->name);\n	}\n	wlr_output_layout_add_auto(server->layout, wlr);\n	wlr_log(WLR_INFO, \"saída %s %dx%d scale %.2f%s\", wlr->name, wlr->width, wlr->height, wlr->scale,\n		output_is_phone(wlr) ? \" telemóvel\" : \"\");\n	pin_touch(server);\n	orbit_arrange(server);\n}\n\nvoid orbit_outputs_bind(struct orbit_server *server) {\n	server->new_output.notify = server_new_output;\n	wl_signal_add(&server->backend->events.new_output, &server->new_output);\n}\n"
	},
	{
		name: "view.c",
		body: "#include \"orbit.h\"\n\n#include <stdlib.h>\n#include <wlr/types/wlr_scene.h>\n#include <wlr/util/log.h>\n\nvoid orbit_focus(struct orbit_view *view) {\n	if (!view || !view->mapped) {\n		return;\n	}\n	struct orbit_server *server = view->server;\n	struct wlr_surface *prev = server->seat->keyboard_state.focused_surface;\n	if (prev && prev != view->toplevel->base->surface) {\n		struct wlr_xdg_surface *previous = wlr_xdg_surface_try_from_wlr_surface(prev);\n		if (previous && previous->role == WLR_XDG_SURFACE_ROLE_TOPLEVEL && previous->toplevel) {\n			wlr_xdg_toplevel_set_activated(previous->toplevel, false);\n		}\n	}\n	server->focused = view;\n	wlr_scene_node_raise_to_top(&view->scene_tree->node);\n	wlr_xdg_toplevel_set_activated(view->toplevel, true);\n	struct wlr_keyboard *keyboard = wlr_seat_get_keyboard(server->seat);\n	if (keyboard) {\n		wlr_seat_keyboard_notify_enter(server->seat, view->toplevel->base->surface,\n			keyboard->keycodes, keyboard->num_keycodes, &keyboard->modifiers);\n	}\n}\n\nvoid orbit_unfocus(struct orbit_server *server) {\n	struct orbit_view *view = server->focused;\n	if (!view) {\n		return;\n	}\n	server->focused = NULL;\n	if (view->mapped && view->toplevel) {\n		wlr_xdg_toplevel_set_activated(view->toplevel, false);\n	}\n	wlr_seat_keyboard_notify_clear_focus(server->seat);\n}\n\nvoid focus_top(struct orbit_server *server, struct orbit_output *output) {\n	struct orbit_view *view;\n	wl_list_for_each(view, &server->views, link) {\n		if (view->mapped && view->output == output && view->tag == output->tag) {\n			orbit_focus(view);\n			if (output_is_phone(output->wlr)) {\n				orbit_arrange(server);\n			}\n			return;\n		}\n	}\n	if (server->focused && server->focused->output == output) {\n		orbit_unfocus(server);\n	}\n}\n\nstruct orbit_view *view_at(struct orbit_server *server, double lx, double ly,\n		struct wlr_surface **surface, double *sx, double *sy) {\n	struct wlr_scene_node *node = wlr_scene_node_at(&server->scene->tree.node, lx, ly, sx, sy);\n	if (node == NULL || node->type != WLR_SCENE_NODE_BUFFER) {\n		return NULL;\n	}\n	struct wlr_scene_buffer *scene_buffer = wlr_scene_buffer_from_node(node);\n	struct wlr_scene_surface *scene_surface = wlr_scene_surface_try_from_buffer(scene_buffer);\n	if (!scene_surface) {\n		return NULL;\n	}\n	*surface = scene_surface->surface;\n	struct wlr_scene_tree *tree = node->parent;\n	while (tree != NULL && tree->node.data == NULL) {\n		tree = tree->node.parent;\n	}\n	return tree ? tree->node.data : NULL;\n}\n\nstatic void xdg_map(struct wl_listener *listener, void *data) {\n	struct orbit_view *view = wl_container_of(listener, view, map);\n	struct orbit_output *output = cursor_output(view->server);\n	view->mapped = true;\n	view->output = output;\n	view->tag = output ? output->tag : 0;\n	struct wlr_box box = { 0, 0, 800, 600 };\n	if (output) {\n		wlr_output_layout_get_box(view->server->layout, output->wlr, &box);\n	}\n	view->x = box.x + view->server->gap + 48;\n	view->y = box.y + view->server->gap + 48;\n	view->w = box.width / 2;\n	view->h = box.height / 2;\n	wl_list_insert(view->server->views.prev, &view->link);\n	struct orbit_server *server = view->server;\n	struct orbit_view *prev = server->focused;\n	orbit_arrange(server);\n	orbit_focus(view);\n	phone_on_map(server, view, prev);\n	if (output && output_is_phone(output->wlr)) {\n		orbit_arrange(server);\n	}\n}\n\nstatic void xdg_unmap(struct wl_listener *listener, void *data) {\n	struct orbit_view *view = wl_container_of(listener, view, unmap);\n	if (!view->mapped) {\n		return;\n	}\n	struct orbit_server *server = view->server;\n	bool was_focused = server->focused == view;\n	struct orbit_view *partner = view == server->split_top ? server->split_bottom\n		: view == server->split_bottom ? server->split_top : NULL;\n	orbit_split_release(server, view);\n	view->mapped = false;\n	if (view->server->grabbed == view) {\n		view->server->grabbed = NULL;\n		view->server->cursor_mode = ORBIT_CURSOR_PASSTHROUGH;\n	}\n	if (was_focused) {\n		server->focused = NULL;\n	}\n	struct orbit_output *output = view->output;\n	wl_list_remove(&view->link);\n	orbit_arrange(server);\n	if (was_focused && partner && partner->mapped && partner->output == output) {\n		orbit_focus(partner);\n	} else if (output) {\n		focus_top(server, output);\n	}\n}\n\nstatic void xdg_destroy(struct wl_listener *listener, void *data) {\n	struct orbit_view *view = wl_container_of(listener, view, destroy);\n	wl_list_remove(&view->map.link);\n	wl_list_remove(&view->unmap.link);\n	wl_list_remove(&view->commit.link);\n	wl_list_remove(&view->destroy.link);\n	if (view->mapped) {\n		orbit_split_release(view->server, view);\n		wl_list_remove(&view->link);\n	}\n	if (view->server->split_top == view) {\n		view->server->split_top = NULL;\n	}\n	if (view->server->split_bottom == view) {\n		view->server->split_bottom = NULL;\n	}\n	if (view->server->focused == view) {\n		view->server->focused = NULL;\n	}\n	if (view->server->grabbed == view) {\n		view->server->grabbed = NULL;\n		view->server->cursor_mode = ORBIT_CURSOR_PASSTHROUGH;\n	}\n	free(view);\n}\n\nstatic void xdg_commit(struct wl_listener *listener, void *data) {\n	struct orbit_view *view = wl_container_of(listener, view, commit);\n	if (view->toplevel->base->initial_commit) {\n		wlr_xdg_toplevel_set_size(view->toplevel, 0, 0);\n	}\n}\n\nstatic void server_new_xdg_toplevel(struct wl_listener *listener, void *data) {\n	struct orbit_server *server = wl_container_of(listener, server, new_xdg_toplevel);\n	struct wlr_xdg_toplevel *toplevel = data;\n	struct orbit_view *view = calloc(1, sizeof(*view));\n	if (!view) {\n		wlr_log(WLR_ERROR, \"sem memória para um toplevel\");\n		return;\n	}\n	view->server = server;\n	view->toplevel = toplevel;\n	view->scene_tree = wlr_scene_xdg_surface_create(&server->scene->tree, toplevel->base);\n	if (!view->scene_tree) {\n		wlr_log(WLR_ERROR, \"cena do toplevel falhou\");\n		free(view);\n		return;\n	}\n	view->scene_tree->node.data = view;\n	toplevel->base->data = view->scene_tree;\n	view->map.notify = xdg_map;\n	wl_signal_add(&toplevel->base->surface->events.map, &view->map);\n	view->unmap.notify = xdg_unmap;\n	wl_signal_add(&toplevel->base->surface->events.unmap, &view->unmap);\n	view->commit.notify = xdg_commit;\n	wl_signal_add(&toplevel->base->surface->events.commit, &view->commit);\n	view->destroy.notify = xdg_destroy;\n	wl_signal_add(&toplevel->events.destroy, &view->destroy);\n}\n\nstatic struct orbit_view *popup_root_view(struct wlr_xdg_popup *popup) {\n	struct wlr_surface *surface = popup->parent;\n	while (surface) {\n		struct wlr_xdg_surface *xdg = wlr_xdg_surface_try_from_wlr_surface(surface);\n		if (!xdg) {\n			return NULL;\n		}\n		if (xdg->role == WLR_XDG_SURFACE_ROLE_TOPLEVEL && xdg->data) {\n			struct wlr_scene_tree *tree = xdg->data;\n			return tree->node.data;\n		}\n		if (xdg->role == WLR_XDG_SURFACE_ROLE_POPUP && xdg->popup) {\n			surface = xdg->popup->parent;\n			continue;\n		}\n		return NULL;\n	}\n	return NULL;\n}\n\n/* A caixa é no espaço da superfície do toplevel, não do layout global. */\nstatic void popup_unconstrain(struct orbit_popup *popup) {\n	struct orbit_view *view = popup->parent_view;\n	struct wlr_box box = { 0, 0, 0, 0 };\n	if (view && view->w > 0 && view->h > 0) {\n		box.width = view->w;\n		box.height = view->h;\n	} else if (view && view->output) {\n		struct wlr_box out;\n		wlr_output_layout_get_box(popup->server->layout, view->output->wlr, &out);\n		box.x = out.x - view->x;\n		box.y = out.y - view->y;\n		box.width = out.width;\n		box.height = out.height;\n	} else {\n		wlr_output_layout_get_box(popup->server->layout, NULL, &box);\n	}\n	if (box.width > 0 && box.height > 0) {\n		wlr_xdg_popup_unconstrain_from_box(popup->xdg_popup, &box);\n	}\n}\n\nstatic void xdg_popup_commit(struct wl_listener *listener, void *data) {\n	struct orbit_popup *popup = wl_container_of(listener, popup, commit);\n	if (!popup->xdg_popup->base->initial_commit) {\n		return;\n	}\n	popup_unconstrain(popup);\n}\n\nstatic void xdg_popup_destroy(struct wl_listener *listener, void *data) {\n	struct orbit_popup *popup = wl_container_of(listener, popup, destroy);\n	wl_list_remove(&popup->commit.link);\n	wl_list_remove(&popup->destroy.link);\n	free(popup);\n}\n\nstatic void server_new_xdg_popup(struct wl_listener *listener, void *data) {\n	struct orbit_server *server = wl_container_of(listener, server, new_xdg_popup);\n	struct wlr_xdg_popup *xdg_popup = data;\n	struct wlr_xdg_surface *parent = wlr_xdg_surface_try_from_wlr_surface(xdg_popup->parent);\n	if (parent == NULL || parent->data == NULL) {\n		return;\n	}\n	struct wlr_scene_tree *parent_tree = parent->data;\n	struct wlr_scene_tree *tree = wlr_scene_xdg_surface_create(parent_tree, xdg_popup->base);\n	if (!tree) {\n		wlr_log(WLR_ERROR, \"cena do popup falhou\");\n		return;\n	}\n	xdg_popup->base->data = tree;\n	struct orbit_popup *popup = calloc(1, sizeof(*popup));\n	if (!popup) {\n		wlr_log(WLR_ERROR, \"sem memória para um popup\");\n		return;\n	}\n	popup->server = server;\n	popup->parent_view = popup_root_view(xdg_popup);\n	popup->xdg_popup = xdg_popup;\n	popup->commit.notify = xdg_popup_commit;\n	wl_signal_add(&xdg_popup->base->surface->events.commit, &popup->commit);\n	popup->destroy.notify = xdg_popup_destroy;\n	wl_signal_add(&xdg_popup->events.destroy, &popup->destroy);\n}\n\nvoid orbit_views_bind(struct orbit_server *server) {\n	server->new_xdg_toplevel.notify = server_new_xdg_toplevel;\n	wl_signal_add(&server->xdg_shell->events.new_toplevel, &server->new_xdg_toplevel);\n	server->new_xdg_popup.notify = server_new_xdg_popup;\n	wl_signal_add(&server->xdg_shell->events.new_popup, &server->new_xdg_popup);\n}\n"
	},
	{
		name: "arrange.c",
		body: "#include \"orbit.h\"\n\n#include <assert.h>\n#include <stdlib.h>\n#include <wlr/types/wlr_scene.h>\n#include <wlr/util/edges.h>\n#include <wlr/util/log.h>\n\n/*\n * Invariantes do par no telemóvel (phone_split):\n *\n * phone_split só fica verdadeiro com split_top e split_bottom distintos,\n * ambos mapeados. Alt+S liga o modo e zera os ponteiros; o arrange seguinte\n * escolhe o par com bind_or_release_split. Se não houver duas candidatas\n * na tag visível, o modo desliga-se.\n *\n * O par pode estacionar (as duas janelas continuam nesta saída, noutra tag).\n * Enquanto estiver estacionado, a tag visível volta ao monóculo e o par\n * não é refeito com outras janelas. Mudar de tag não apaga o par: quando\n * as duas regressam à tag activa, o sítio de cada uma mantém-se.\n *\n * Unmap de um lado promove a próxima candidata da mesma tag. Sem segunda\n * janela, phone_split passa a falso. Fechar a saída DSI limpa o par.\n * Uma janela flutuante ou em ecrã inteiro não entra no par.\n */\n\nstatic void place(struct orbit_view *view, int x, int y, int w, int h, bool tiled) {\n	if (w < 1) {\n		w = 1;\n	}\n	if (h < 1) {\n		h = 1;\n	}\n	view->x = x;\n	view->y = y;\n	view->w = w;\n	view->h = h;\n	wlr_scene_node_set_enabled(&view->scene_tree->node, true);\n	wlr_scene_node_set_position(&view->scene_tree->node, x, y);\n	wlr_xdg_toplevel_set_size(view->toplevel, (uint32_t)w, (uint32_t)h);\n	wlr_xdg_toplevel_set_fullscreen(view->toplevel, view->fullscreen);\n	wlr_xdg_toplevel_set_tiled(view->toplevel,\n		tiled ? WLR_EDGE_LEFT | WLR_EDGE_RIGHT | WLR_EDGE_TOP | WLR_EDGE_BOTTOM : WLR_EDGE_NONE);\n}\n\nstatic void hide_view(struct orbit_view *view) {\n	wlr_scene_node_set_enabled(&view->scene_tree->node, false);\n}\n\nstatic bool split_candidate(struct orbit_view *view, struct orbit_output *output) {\n	return view->mapped && view->output == output && view->tag == output->tag && !view->floating &&\n		!view->fullscreen;\n}\n\nstatic struct orbit_view *next_phone_view(struct orbit_server *server, struct orbit_view *after,\n		struct orbit_view *skip) {\n	if (!after || !after->output) {\n		return NULL;\n	}\n	struct orbit_output *output = after->output;\n	struct orbit_view *view;\n	bool seen = false;\n	wl_list_for_each(view, &server->views, link) {\n		if (!seen) {\n			if (view == after) {\n				seen = true;\n			}\n			continue;\n		}\n		if (view != skip && split_candidate(view, output)) {\n			return view;\n		}\n	}\n	wl_list_for_each(view, &server->views, link) {\n		if (view == after) {\n			break;\n		}\n		if (view != skip && split_candidate(view, output)) {\n			return view;\n		}\n	}\n	return NULL;\n}\n\nvoid orbit_split_release(struct orbit_server *server, struct orbit_view *view) {\n	if (!server->phone_split || !view) {\n		return;\n	}\n	if (view != server->split_top && view != server->split_bottom) {\n		return;\n	}\n	struct orbit_view *other = view == server->split_top ? server->split_bottom : server->split_top;\n	struct orbit_view *next = next_phone_view(server, view, other);\n	if (view == server->split_top) {\n		server->split_top = next;\n	} else {\n		server->split_bottom = next;\n	}\n	if (!server->split_top || !server->split_bottom || server->split_top == server->split_bottom) {\n		server->phone_split = false;\n		server->split_top = NULL;\n		server->split_bottom = NULL;\n	}\n}\n\nstatic int tiled_index(struct orbit_view **tiled, int n, struct orbit_view *view) {\n	for (int i = 0; i < n; i++) {\n		if (tiled[i] == view) {\n			return i;\n		}\n	}\n	return -1;\n}\n\n/* Liga o par à tag visível, ou larga-o se não houver duas candidatas. */\nstatic void bind_or_release_split(struct orbit_server *server, struct orbit_view **tiled, int n) {\n	if (tiled_index(tiled, n, server->split_top) < 0) {\n		server->split_top = NULL;\n	}\n	if (tiled_index(tiled, n, server->split_bottom) < 0 || server->split_bottom == server->split_top) {\n		server->split_bottom = NULL;\n	}\n	if (!server->split_top) {\n		int focused = tiled_index(tiled, n, server->focused);\n		server->split_top = focused >= 0 ? tiled[focused] : (n > 0 ? tiled[0] : NULL);\n	}\n	if (server->split_top && !server->split_bottom) {\n		int top = tiled_index(tiled, n, server->split_top);\n		for (int step = 1; step < n; step++) {\n			struct orbit_view *candidate = tiled[(top + step) % n];\n			if (candidate != server->split_top) {\n				server->split_bottom = candidate;\n				break;\n			}\n		}\n	}\n	if (!server->split_top || !server->split_bottom) {\n		server->phone_split = false;\n		server->split_top = NULL;\n		server->split_bottom = NULL;\n	}\n}\n\nstatic bool view_on_other_tag(struct orbit_view *view, struct orbit_output *output) {\n	return view && view->mapped && view->output == output && view->tag != output->tag;\n}\n\nstatic bool pair_is_parked(struct orbit_server *server, struct orbit_output *output) {\n	return server->phone_split && view_on_other_tag(server->split_top, output) &&\n		view_on_other_tag(server->split_bottom, output);\n}\n\nvoid phone_on_map(struct orbit_server *server, struct orbit_view *view, struct orbit_view *prev) {\n	struct orbit_output *output = view->output;\n	if (!output || !output_is_phone(output->wlr) || !server->phone_split || !prev || prev == view) {\n		return;\n	}\n	if (prev == server->split_top && server->split_bottom != view) {\n		server->split_bottom = view;\n	} else if (prev == server->split_bottom && server->split_top != view) {\n		server->split_top = view;\n	} else if (server->split_top && server->split_top != view) {\n		server->split_bottom = view;\n	}\n}\n\nstatic void raise_focused(struct orbit_server *server, struct orbit_view **tiled, int n) {\n	if (!server->focused) {\n		return;\n	}\n	for (int i = 0; i < n; i++) {\n		if (tiled[i] == server->focused) {\n			struct orbit_view *swap = tiled[0];\n			tiled[0] = tiled[i];\n			tiled[i] = swap;\n			return;\n		}\n	}\n}\n\nstatic void phone_arrange(struct orbit_server *server, const struct wlr_box *box,\n		struct orbit_view **tiled, int n, bool parked) {\n	int gap = server->gap;\n	if (!parked && server->phone_split && server->split_top && server->split_bottom) {\n		int half = (box->height - gap) / 2;\n		for (int i = 0; i < n; i++) {\n			if (tiled[i] == server->split_top) {\n				place(tiled[i], box->x, box->y, box->width, half, true);\n			} else if (tiled[i] == server->split_bottom) {\n				place(tiled[i], box->x, box->y + half + gap, box->width, box->height - half - gap, true);\n			} else {\n				hide_view(tiled[i]);\n			}\n		}\n		return;\n	}\n	if (n > 0) {\n		place(tiled[0], box->x, box->y, box->width, box->height, true);\n		for (int i = 1; i < n; i++) {\n			hide_view(tiled[i]);\n		}\n	}\n}\n\nstatic void desktop_arrange(struct orbit_server *server, const struct wlr_box *box,\n		struct orbit_view **tiled, int n) {\n	int gap = server->gap;\n	if (n == 1) {\n		place(tiled[0], box->x + gap, box->y + gap, box->width - 2 * gap, box->height - 2 * gap, true);\n	} else if (n > 1) {\n		int master = box->width * server->master_pct / 100;\n		int rows = n - 1;\n		int inner = box->height - gap * (rows + 1);\n		int row_h = rows > 0 ? inner / rows : inner;\n		place(tiled[0], box->x + gap, box->y + gap, master - gap, box->height - 2 * gap, true);\n		for (int i = 1; i < n; i++) {\n			int y = box->y + gap + (i - 1) * (row_h + gap);\n			int h = (i == n - 1) ? (box->y + box->height - gap - y) : row_h;\n			place(tiled[i], box->x + master + gap, y, box->width - master - 2 * gap, h, true);\n		}\n	}\n}\n\nstatic void note_tiled_pressure(struct orbit_output *output, int n, bool capped) {\n	int near = (ORBIT_MAX_VIEWS * 3) / 4;\n	if (capped) {\n		if (!output->warned_cap) {\n			wlr_log(WLR_ERROR, \"saída %s cheia: limite de %d janelas em mosaico\",\n				output->wlr->name, ORBIT_MAX_VIEWS);\n			output->warned_cap = true;\n		}\n		return;\n	}\n	output->warned_cap = false;\n	if (n >= near) {\n		if (!output->warned_near) {\n			wlr_log(WLR_INFO, \"saída %s: %d/%d janelas em mosaico\",\n				output->wlr->name, n, ORBIT_MAX_VIEWS);\n			output->warned_near = true;\n		}\n	} else {\n		output->warned_near = false;\n	}\n}\n\nvoid orbit_arrange(struct orbit_server *server) {\n	struct orbit_output *output;\n	wl_list_for_each(output, &server->outputs, link) {\n		struct wlr_box box;\n		wlr_output_layout_get_box(server->layout, output->wlr, &box);\n		if (output->bg) {\n			int bw = box.width > 0 ? box.width : 1;\n			int bh = box.height > 0 ? box.height : 1;\n			wlr_scene_rect_set_size(output->bg, bw, bh);\n			wlr_scene_node_set_position(&output->bg->node, box.x, box.y);\n			wlr_scene_node_lower_to_bottom(&output->bg->node);\n		}\n		if (box.width <= 0 || box.height <= 0) {\n			continue;\n		}\n\n		struct orbit_view *tiled[ORBIT_MAX_VIEWS];\n		struct orbit_view *full = NULL;\n		int n = 0;\n		bool capped = false;\n		struct orbit_view *view;\n		wl_list_for_each(view, &server->views, link) {\n			if (!view->mapped || view->output != output) {\n				continue;\n			}\n			if (view->tag != output->tag) {\n				hide_view(view);\n				continue;\n			}\n			if (view->fullscreen) {\n				full = view;\n			}\n			if (view->floating && !view->fullscreen) {\n				wlr_scene_node_set_enabled(&view->scene_tree->node, true);\n				wlr_scene_node_set_position(&view->scene_tree->node, view->x, view->y);\n				wlr_xdg_toplevel_set_fullscreen(view->toplevel, false);\n				wlr_xdg_toplevel_set_tiled(view->toplevel, WLR_EDGE_NONE);\n				continue;\n			}\n			if (n < ORBIT_MAX_VIEWS) {\n				tiled[n++] = view;\n			} else {\n				hide_view(view);\n				capped = true;\n			}\n		}\n		assert(n <= ORBIT_MAX_VIEWS);\n		note_tiled_pressure(output, n, capped);\n\n		bool phone = output_is_phone(output->wlr);\n		bool parked = phone && pair_is_parked(server, output);\n		if (phone && server->phone_split && !parked) {\n			bind_or_release_split(server, tiled, n);\n		}\n		if (phone && (!server->phone_split || parked)) {\n			raise_focused(server, tiled, n);\n		}\n\n		if (full) {\n			for (int i = 0; i < n; i++) {\n				if (tiled[i] == full) {\n					place(full, box.x, box.y, box.width, box.height, false);\n				} else {\n					hide_view(tiled[i]);\n				}\n			}\n			continue;\n		}\n		if (phone) {\n			phone_arrange(server, &box, tiled, n, parked);\n		} else {\n			desktop_arrange(server, &box, tiled, n);\n		}\n	}\n}\n\nvoid orbit_focus_step(struct orbit_server *server, int dir) {\n	struct orbit_output *output = cursor_output(server);\n	if (!output) {\n		return;\n	}\n	struct orbit_view *list[ORBIT_MAX_VIEWS];\n	int n = 0;\n	bool capped = false;\n	struct orbit_view *view;\n	wl_list_for_each(view, &server->views, link) {\n		if (!view->mapped || view->output != output || view->tag != output->tag) {\n			continue;\n		}\n		if (n < ORBIT_MAX_VIEWS) {\n			list[n++] = view;\n		} else {\n			capped = true;\n		}\n	}\n	assert(n <= ORBIT_MAX_VIEWS);\n	if (capped) {\n		wlr_log(WLR_ERROR, \"foco em %s cortado em %d janelas\", output->wlr->name, ORBIT_MAX_VIEWS);\n	}\n	if (output_is_phone(output->wlr) && server->phone_split && server->split_top && server->split_bottom &&\n		split_candidate(server->split_top, output) && split_candidate(server->split_bottom, output)) {\n		struct orbit_view *pair[2] = { server->split_top, server->split_bottom };\n		int index = server->focused == server->split_bottom ? 1 : 0;\n		struct orbit_view *next = (server->focused == server->split_top || server->focused == server->split_bottom)\n			? pair[(index + dir + 2) % 2]\n			: pair[dir < 0 ? 1 : 0];\n		orbit_focus(next);\n		return;\n	}\n	if (n == 0) {\n		return;\n	}\n	int index = 0;\n	for (int i = 0; i < n; i++) {\n		if (list[i] == server->focused) {\n			index = i;\n		}\n	}\n	orbit_focus(list[(index + dir + n) % n]);\n	if (output_is_phone(output->wlr)) {\n		orbit_arrange(server);\n	}\n}\n"
	},
	{
		name: "input.c",
		body: "#include \"orbit.h\"\n\n#include <stdlib.h>\n#include <wlr/types/wlr_cursor.h>\n#include <wlr/types/wlr_data_device.h>\n#include <wlr/types/wlr_input_device.h>\n#include <wlr/types/wlr_keyboard.h>\n#include <wlr/types/wlr_pointer.h>\n#include <wlr/types/wlr_scene.h>\n#include <wlr/types/wlr_seat.h>\n#include <wlr/util/log.h>\n\nstatic struct xkb_context *shared_context;\nstatic struct xkb_keymap *shared_keymap;\n\nvoid orbit_xkb_prepare(void) {\n	if (shared_keymap) {\n		return;\n	}\n	shared_context = xkb_context_new(XKB_CONTEXT_NO_FLAGS);\n	if (!shared_context) {\n		wlr_log(WLR_ERROR, \"contexto XKB falhou\");\n		return;\n	}\n	struct xkb_rule_names names = {\n		.rules = getenv(\"XKB_DEFAULT_RULES\"),\n		.model = getenv(\"XKB_DEFAULT_MODEL\"),\n		.layout = getenv(\"XKB_DEFAULT_LAYOUT\"),\n		.variant = getenv(\"XKB_DEFAULT_VARIANT\"),\n		.options = getenv(\"XKB_DEFAULT_OPTIONS\"),\n	};\n	shared_keymap = xkb_keymap_new_from_names(shared_context, &names, XKB_KEYMAP_COMPILE_NO_FLAGS);\n	if (!shared_keymap) {\n		wlr_log(WLR_ERROR, \"keymap XKB falhou\");\n	}\n}\n\nvoid orbit_xkb_finish(void) {\n	if (shared_keymap) {\n		xkb_keymap_unref(shared_keymap);\n		shared_keymap = NULL;\n	}\n	if (shared_context) {\n		xkb_context_unref(shared_context);\n		shared_context = NULL;\n	}\n}\n\nstatic void process_cursor_motion(struct orbit_server *server, uint32_t time) {\n	if (server->cursor_mode == ORBIT_CURSOR_MOVE && server->grabbed && server->grabbed->mapped) {\n		struct orbit_view *view = server->grabbed;\n		if (view->floating) {\n			view->x = server->grab_gx + (int)(server->cursor->x - server->grab_x);\n			view->y = server->grab_gy + (int)(server->cursor->y - server->grab_y);\n			wlr_scene_node_set_position(&view->scene_tree->node, view->x, view->y);\n		}\n		return;\n	}\n	double sx, sy;\n	struct wlr_surface *surface = NULL;\n	struct orbit_view *view = view_at(server, server->cursor->x, server->cursor->y, &surface, &sx, &sy);\n	if (!view) {\n		wlr_xcursor_manager_set_cursor_image(server->cursor_mgr, \"left_ptr\", server->cursor);\n		wlr_seat_pointer_clear_focus(server->seat);\n		return;\n	}\n	wlr_seat_pointer_notify_enter(server->seat, surface, sx, sy);\n	wlr_seat_pointer_notify_motion(server->seat, time, sx, sy);\n}\n\nstatic void on_cursor_motion(struct wl_listener *listener, void *data) {\n	struct orbit_server *server = wl_container_of(listener, server, cursor_motion);\n	struct wlr_pointer_motion_event *event = data;\n	wlr_cursor_move(server->cursor, &event->pointer->base, event->delta_x, event->delta_y);\n	process_cursor_motion(server, event->time_msec);\n}\n\nstatic void on_cursor_motion_absolute(struct wl_listener *listener, void *data) {\n	struct orbit_server *server = wl_container_of(listener, server, cursor_motion_absolute);\n	struct wlr_pointer_motion_absolute_event *event = data;\n	wlr_cursor_warp_absolute(server->cursor, &event->pointer->base, event->x, event->y);\n	process_cursor_motion(server, event->time_msec);\n}\n\nstatic void on_cursor_button(struct wl_listener *listener, void *data) {\n	struct orbit_server *server = wl_container_of(listener, server, cursor_button);\n	struct wlr_pointer_button_event *event = data;\n\n	if (server->cursor_mode == ORBIT_CURSOR_MOVE && event->state == WL_POINTER_BUTTON_STATE_RELEASED) {\n		struct orbit_view *view = server->grabbed;\n		server->cursor_mode = ORBIT_CURSOR_PASSTHROUGH;\n		server->grabbed = NULL;\n		if (view && view->mapped) {\n			struct orbit_output *dest = output_at(server, server->cursor->x, server->cursor->y);\n			if (dest && dest != view->output) {\n				orbit_split_release(server, view);\n				view->output = dest;\n				view->tag = dest->tag;\n				view->fullscreen = false;\n			}\n			orbit_arrange(server);\n			orbit_focus(view);\n		}\n		wlr_xcursor_manager_set_cursor_image(server->cursor_mgr, \"left_ptr\", server->cursor);\n		return;\n	}\n\n	if (event->state == WL_POINTER_BUTTON_STATE_PRESSED) {\n		double sx, sy;\n		struct wlr_surface *surface = NULL;\n		struct orbit_view *view = view_at(server, server->cursor->x, server->cursor->y, &surface, &sx, &sy);\n		struct wlr_keyboard *keyboard = wlr_seat_get_keyboard(server->seat);\n		uint32_t mods = keyboard ? wlr_keyboard_get_modifiers(keyboard) : 0;\n		if (view && (mods & WLR_MODIFIER_ALT)) {\n			server->cursor_mode = ORBIT_CURSOR_MOVE;\n			server->grabbed = view;\n			server->grab_x = server->cursor->x;\n			server->grab_y = server->cursor->y;\n			server->grab_gx = view->x;\n			server->grab_gy = view->y;\n			wlr_xcursor_manager_set_cursor_image(server->cursor_mgr, \"fleur\", server->cursor);\n			orbit_focus(view);\n			return;\n		}\n		if (view) {\n			orbit_focus(view);\n		}\n	}\n	wlr_seat_pointer_notify_button(server->seat, event->time_msec, event->button, event->state);\n}\n\nstatic void on_cursor_axis(struct wl_listener *listener, void *data) {\n	struct orbit_server *server = wl_container_of(listener, server, cursor_axis);\n	struct wlr_pointer_axis_event *event = data;\n	wlr_seat_pointer_notify_axis(server->seat, event->time_msec, event->orientation,\n		event->delta, event->delta_discrete, event->source, event->relative_direction);\n}\n\nstatic void on_cursor_frame(struct wl_listener *listener, void *data) {\n	struct orbit_server *server = wl_container_of(listener, server, cursor_frame);\n	wlr_seat_pointer_notify_frame(server->seat);\n}\n\nstatic void keyboard_key(struct wl_listener *listener, void *data) {\n	struct orbit_keyboard *keyboard = wl_container_of(listener, keyboard, key);\n	struct orbit_server *server = keyboard->server;\n	struct wlr_keyboard_key_event *event = data;\n	uint32_t keycode = event->keycode + 8;\n	const xkb_keysym_t *syms = NULL;\n	int count = 0;\n	if (keyboard->wlr_keyboard->keymap) {\n		count = xkb_keymap_key_get_syms_by_level(keyboard->wlr_keyboard->keymap, keycode, 0, 0, &syms);\n	}\n	bool handled = false;\n	uint32_t mods = wlr_keyboard_get_modifiers(keyboard->wlr_keyboard);\n	if ((mods & WLR_MODIFIER_ALT) && event->state == WL_KEYBOARD_KEY_STATE_PRESSED && count > 0) {\n		for (int i = 0; i < count; i++) {\n			handled = orbit_keybinding(server, syms[i], mods) || handled;\n		}\n	}\n	if (!handled) {\n		struct orbit_view *focused = server->focused;\n		if (focused && focused->mapped && focused->output && focused->tag != focused->output->tag) {\n			orbit_unfocus(server);\n			return;\n		}\n		wlr_seat_set_keyboard(server->seat, keyboard->wlr_keyboard);\n		wlr_seat_keyboard_notify_key(server->seat, event->time_msec, event->keycode, event->state);\n	}\n}\n\nstatic void keyboard_modifiers(struct wl_listener *listener, void *data) {\n	struct orbit_keyboard *keyboard = wl_container_of(listener, keyboard, modifiers);\n	wlr_seat_set_keyboard(keyboard->server->seat, keyboard->wlr_keyboard);\n	wlr_seat_keyboard_notify_modifiers(keyboard->server->seat, &keyboard->wlr_keyboard->modifiers);\n}\n\nstatic void keyboard_destroy(struct wl_listener *listener, void *data) {\n	struct orbit_keyboard *keyboard = wl_container_of(listener, keyboard, destroy);\n	wl_list_remove(&keyboard->modifiers.link);\n	wl_list_remove(&keyboard->key.link);\n	wl_list_remove(&keyboard->destroy.link);\n	wl_list_remove(&keyboard->link);\n	free(keyboard);\n}\n\nstatic void touch_destroy(struct wl_listener *listener, void *data) {\n	struct orbit_touch *touch = wl_container_of(listener, touch, destroy);\n	wl_list_remove(&touch->destroy.link);\n	wl_list_remove(&touch->link);\n	free(touch);\n}\n\nstatic void seat_capabilities(struct orbit_server *server) {\n	wlr_seat_set_capabilities(server->seat, WL_SEAT_CAPABILITY_POINTER | WL_SEAT_CAPABILITY_KEYBOARD);\n}\n\nstatic void server_new_input(struct wl_listener *listener, void *data) {\n	struct orbit_server *server = wl_container_of(listener, server, new_input);\n	struct wlr_input_device *device = data;\n	if (device->type == WLR_INPUT_DEVICE_KEYBOARD) {\n		struct wlr_keyboard *wlr_keyboard = wlr_keyboard_from_input_device(device);\n		struct orbit_keyboard *keyboard = calloc(1, sizeof(*keyboard));\n		if (!keyboard) {\n			wlr_log(WLR_ERROR, \"sem memória para o teclado\");\n			return;\n		}\n		keyboard->server = server;\n		keyboard->wlr_keyboard = wlr_keyboard;\n		orbit_xkb_prepare();\n		if (shared_keymap) {\n			wlr_keyboard_set_keymap(wlr_keyboard, shared_keymap);\n		}\n		wlr_keyboard_set_repeat_info(wlr_keyboard, 25, 600);\n		keyboard->modifiers.notify = keyboard_modifiers;\n		wl_signal_add(&wlr_keyboard->events.modifiers, &keyboard->modifiers);\n		keyboard->key.notify = keyboard_key;\n		wl_signal_add(&wlr_keyboard->events.key, &keyboard->key);\n		keyboard->destroy.notify = keyboard_destroy;\n		wl_signal_add(&device->events.destroy, &keyboard->destroy);\n		wlr_seat_set_keyboard(server->seat, wlr_keyboard);\n		wl_list_insert(&server->keyboards, &keyboard->link);\n	} else if (device->type == WLR_INPUT_DEVICE_POINTER || device->type == WLR_INPUT_DEVICE_TOUCH) {\n		wlr_cursor_attach_input_device(server->cursor, device);\n		if (device->type == WLR_INPUT_DEVICE_TOUCH) {\n			struct orbit_touch *touch = calloc(1, sizeof(*touch));\n			if (!touch) {\n				wlr_log(WLR_ERROR, \"sem memória para o toque\");\n			} else {\n				touch->device = device;\n				touch->destroy.notify = touch_destroy;\n				wl_signal_add(&device->events.destroy, &touch->destroy);\n				wl_list_insert(&server->touches, &touch->link);\n				struct orbit_output *output;\n				wl_list_for_each(output, &server->outputs, link) {\n					if (output_is_phone(output->wlr)) {\n						wlr_cursor_map_input_to_output(server->cursor, device, output->wlr);\n						break;\n					}\n				}\n			}\n		}\n	}\n	seat_capabilities(server);\n}\n\nstatic void seat_request_cursor(struct wl_listener *listener, void *data) {\n	struct orbit_server *server = wl_container_of(listener, server, request_cursor);\n	struct wlr_seat_pointer_request_set_cursor_event *event = data;\n	if (server->seat->pointer_state.focused_client == event->seat_client) {\n		wlr_cursor_set_surface(server->cursor, event->surface, event->hotspot_x, event->hotspot_y);\n	}\n}\n\nstatic void seat_request_set_selection(struct wl_listener *listener, void *data) {\n	struct orbit_server *server = wl_container_of(listener, server, request_set_selection);\n	struct wlr_seat_request_set_selection_event *event = data;\n	wlr_seat_set_selection(server->seat, event->source, event->serial);\n}\n\nvoid orbit_input_bind(struct orbit_server *server) {\n	server->cursor_motion.notify = on_cursor_motion;\n	wl_signal_add(&server->cursor->events.motion, &server->cursor_motion);\n	server->cursor_motion_absolute.notify = on_cursor_motion_absolute;\n	wl_signal_add(&server->cursor->events.motion_absolute, &server->cursor_motion_absolute);\n	server->cursor_button.notify = on_cursor_button;\n	wl_signal_add(&server->cursor->events.button, &server->cursor_button);\n	server->cursor_axis.notify = on_cursor_axis;\n	wl_signal_add(&server->cursor->events.axis, &server->cursor_axis);\n	server->cursor_frame.notify = on_cursor_frame;\n	wl_signal_add(&server->cursor->events.frame, &server->cursor_frame);\n\n	server->new_input.notify = server_new_input;\n	wl_signal_add(&server->backend->events.new_input, &server->new_input);\n	server->request_cursor.notify = seat_request_cursor;\n	wl_signal_add(&server->seat->events.request_set_cursor, &server->request_cursor);\n	server->request_set_selection.notify = seat_request_set_selection;\n	wl_signal_add(&server->seat->events.request_set_selection, &server->request_set_selection);\n}\n"
	},
	{
		name: "keybinds.c",
		body: "#include \"orbit.h\"\n\n#include <unistd.h>\n#include <wlr/types/wlr_keyboard.h>\n\nbool orbit_keybinding(struct orbit_server *server, xkb_keysym_t sym, uint32_t mods) {\n	bool shift = mods & WLR_MODIFIER_SHIFT;\n	struct orbit_view *focused = server->focused;\n	if (focused && !focused->mapped) {\n		focused = NULL;\n	}\n	struct orbit_output *output = cursor_output(server);\n	switch (sym) {\n	case XKB_KEY_Escape:\n		wl_display_terminate(server->display);\n		return true;\n	case XKB_KEY_Return:\n		if (fork() == 0) {\n			const char *term = server->term ? server->term : \"foot\";\n			execl(\"/bin/sh\", \"/bin/sh\", \"-c\", term, (char *)NULL);\n			_exit(1);\n		}\n		return true;\n	case XKB_KEY_q:\n		if (focused) {\n			wlr_xdg_toplevel_send_close(focused->toplevel);\n		}\n		return true;\n	case XKB_KEY_space:\n		if (focused) {\n			orbit_split_release(server, focused);\n			focused->floating = !focused->floating;\n			focused->fullscreen = false;\n			orbit_arrange(server);\n		}\n		return true;\n	case XKB_KEY_f:\n		if (focused) {\n			focused->fullscreen = !focused->fullscreen;\n			if (focused->fullscreen) {\n				focused->floating = false;\n			}\n			orbit_arrange(server);\n		}\n		return true;\n	case XKB_KEY_s:\n		server->phone_split = !server->phone_split;\n		server->split_top = NULL;\n		server->split_bottom = NULL;\n		orbit_arrange(server);\n		return true;\n	case XKB_KEY_j:\n	case XKB_KEY_k:\n		orbit_focus_step(server, sym == XKB_KEY_j ? 1 : -1);\n		return true;\n	case XKB_KEY_h:\n		if (server->master_pct > ORBIT_MASTER_MIN) {\n			server->master_pct -= 2;\n		}\n		orbit_arrange(server);\n		return true;\n	case XKB_KEY_l:\n		if (server->master_pct < ORBIT_MASTER_MAX) {\n			server->master_pct += 2;\n		}\n		orbit_arrange(server);\n		return true;\n	case XKB_KEY_Left:\n	case XKB_KEY_Right:\n		if (focused && focused->output) {\n			struct orbit_output *dest = adjacent_output(server, focused->output, sym == XKB_KEY_Left ? -1 : 1);\n			if (dest) {\n				orbit_split_release(server, focused);\n				focused->output = dest;\n				focused->tag = dest->tag;\n				focused->fullscreen = false;\n				orbit_arrange(server);\n				orbit_focus(focused);\n			}\n		}\n		return true;\n	case XKB_KEY_1:\n	case XKB_KEY_2:\n	case XKB_KEY_3:\n	case XKB_KEY_4: {\n		int tag = sym - XKB_KEY_1;\n		if (!output) {\n			return true;\n		}\n		if (shift && focused) {\n			focused->tag = tag;\n			focused->fullscreen = false;\n		}\n		output->tag = tag;\n		orbit_arrange(server);\n		focus_top(server, output);\n		return true;\n	}\n	default:\n		return false;\n	}\n}\n"
	}
];
function withEvent(scene, iface, msg) {
	const eventSeq = scene.eventSeq + 1;
	return {
		eventSeq,
		events: [{
			id: eventSeq,
			iface,
			msg
		}, ...scene.events].slice(0, 32)
	};
}
function slotsOf(scene) {
	return {
		split: scene.split,
		splitPrimaryId: scene.splitPrimaryId,
		splitSecondaryId: scene.splitSecondaryId
	};
}
function retitle(windows, id, app) {
	const spec = appSpec(app);
	const same = windows.filter((win) => win.app === app).length;
	return same > 1 ? `${spec.title} · ${same}` : spec.title;
}
var useCompositor = create((set, get) => ({
	...createScene("mesa"),
	setPreset: (preset) => {
		const current = get();
		set(createScene(preset, {
			layout: current.layout,
			gaps: current.gaps,
			masterRatio: current.masterRatio,
			focusFollows: current.focusFollows,
			dockOn: current.dockOn
		}));
	},
	setLayout: (layout) => {
		const names = {
			mestre: "master-stack",
			grade: "grade",
			monoculo: "monocle",
			flutuante: "floating"
		};
		set((scene) => ({
			layout,
			...withEvent(scene, "orbit_arrange", `política ${names[layout]}`)
		}));
	},
	setGaps: (gaps) => set({ gaps }),
	setMasterRatio: (masterRatio) => set({ masterRatio }),
	setFocusFollows: (focusFollows) => set((scene) => ({
		focusFollows,
		...withEvent(scene, "wl_pointer", focusFollows ? "foco segue o ponteiro" : "foco no clique")
	})),
	focusOutput: (outputId) => {
		const output = get().outputs.find((item) => item.id === outputId);
		if (!output) return;
		set((scene) => ({
			focusedOutputId: outputId,
			...withEvent(scene, "wlr_cursor", `enter ${output.connector}`)
		}));
	},
	focusWindow: (id, fromPointer) => {
		const scene = get();
		const win = scene.windows.find((item) => item.id === id);
		if (!win) return;
		if (fromPointer && !scene.focusFollows) return;
		const waking = Boolean(win.minimized);
		const windows = waking ? scene.windows.map((item) => item.id === id ? {
			...item,
			minimized: false
		} : item) : scene.windows;
		const slots = admitToSplit(scene.outputs, slotsOf(scene), scene.focusedId, win);
		if (!waking && scene.focusedId === id && scene.focusedOutputId === win.outputId && slots.splitPrimaryId === scene.splitPrimaryId && slots.splitSecondaryId === scene.splitSecondaryId) return;
		const output = scene.outputs.find((item) => item.id === win.outputId);
		set({
			windows,
			focusedId: id,
			focusedOutputId: win.outputId,
			...slots,
			...withEvent(scene, "xdg_toplevel", `activated ${win.appId} em ${output?.connector ?? win.outputId}`)
		});
	},
	spawn: (app, outputId) => {
		const scene = get();
		const targetId = outputId ?? scene.focusedOutputId;
		const output = scene.outputs.find((item) => item.id === targetId) ?? scene.outputs[0];
		if (!output) return;
		const seq = scene.seq + 1;
		const id = `c${seq}`;
		const siblings = scene.windows.filter((win) => win.outputId === output.id && win.workspace === output.workspace);
		const spec = appSpec(app);
		const created = {
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
			fx: .07 + siblings.length % 4 * .04,
			fy: .08 + siblings.length % 4 * .05,
			fw: output.profile === "dsi" ? .92 : .48,
			fh: output.profile === "dsi" ? .7 : .56,
			order: siblings.reduce((max, win) => Math.max(max, win.order), -1) + 1,
			draft: "",
			log: "",
			hit: ""
		};
		const windows = [...scene.windows, created];
		created.title = retitle(windows, id, app);
		const slots = admitToSplit(scene.outputs, slotsOf(scene), scene.focusedId, created);
		set({
			windows: windows.map((win) => win.id === id ? created : win),
			seq,
			focusedId: id,
			focusedOutputId: output.id,
			overview: false,
			...slots,
			...withEvent(scene, "xdg_toplevel", `map ${created.appId} → ${output.connector} espaço ${output.workspace}`)
		});
	},
	close: (id) => {
		const scene = get();
		const win = scene.windows.find((item) => item.id === id);
		if (!win) return;
		const windows = scene.windows.filter((item) => item.id !== id);
		const slots = repairSplit(scene.outputs, scene.windows, windows, slotsOf(scene), id);
		const stayedId = id === scene.splitPrimaryId ? scene.splitSecondaryId : id === scene.splitSecondaryId ? scene.splitPrimaryId : null;
		const next = (stayedId ? windows.find((item) => item.id === stayedId && item.outputId === win.outputId && item.workspace === win.workspace) : null) ?? windows.find((item) => item.outputId === win.outputId && item.workspace === win.workspace && !item.minimized) ?? null;
		set({
			windows,
			...slots,
			focusedId: scene.focusedId === id ? next?.id ?? null : scene.focusedId,
			...withEvent(scene, "xdg_toplevel", `close ${win.appId}`)
		});
	},
	minimizeWindow: (id) => {
		const scene = get();
		const win = scene.windows.find((item) => item.id === id);
		if (!win || win.minimized) return;
		const windows = scene.windows.map((item) => item.id === id ? {
			...item,
			minimized: true,
			fullscreen: false,
			maximized: false
		} : item);
		const next = focusForWorkspace(windows, null, win.outputId, win.workspace);
		set({
			windows,
			focusedId: scene.focusedId === id ? next : scene.focusedId,
			...withEvent(scene, "xdg_toplevel", `set_minimized ${win.appId}`)
		});
	},
	toggleFloat: (id) => {
		set((scene) => {
			const win = scene.windows.find((item) => item.id === id);
			if (!win) return scene;
			const floating = !win.floating;
			return {
				windows: scene.windows.map((item) => item.id === id ? {
					...item,
					floating,
					fullscreen: false,
					maximized: false
				} : item),
				focusedId: id,
				...withEvent(scene, "xdg_toplevel", floating ? `unset tiled ${win.appId}` : `set tiled ${win.appId}`)
			};
		});
	},
	floatAt: (id, geom) => {
		set((scene) => {
			const win = scene.windows.find((item) => item.id === id);
			if (!win) return scene;
			return {
				windows: scene.windows.map((item) => item.id === id ? {
					...item,
					floating: true,
					fullscreen: false,
					maximized: false,
					...geom
				} : item),
				focusedId: id,
				focusedOutputId: win.outputId,
				...withEvent(scene, "xdg_toplevel", `unset tiled ${win.appId}`)
			};
		});
	},
	nestWindow: (id) => {
		set((scene) => {
			const win = scene.windows.find((item) => item.id === id);
			if (!win) return scene;
			const nested = scene.layout === "grade" && !win.floating && !win.maximized && !win.fullscreen;
			return {
				windows: scene.windows.map((item) => item.outputId === win.outputId && item.workspace === win.workspace && !item.minimized ? {
					...item,
					floating: nested,
					fullscreen: false,
					maximized: false
				} : item),
				layout: nested ? scene.layout : "grade",
				focusedId: id,
				focusedOutputId: win.outputId,
				...withEvent(scene, "xdg_toplevel", nested ? `unset tiled em ${win.outputId}` : `tiled lado a lado em ${win.outputId}`)
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
					if (item.id === id) return {
						...item,
						maximized,
						fullscreen: false
					};
					if (maximized && item.outputId === win.outputId) return {
						...item,
						maximized: false,
						fullscreen: false
					};
					return item;
				}),
				focusedId: id,
				focusedOutputId: win.outputId,
				...withEvent(scene, "xdg_toplevel", maximized ? `maximized ${win.appId}` : `unset maximized ${win.appId}`)
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
					if (item.id === id) return {
						...item,
						fullscreen,
						maximized: false
					};
					if (fullscreen && item.outputId === win.outputId) return {
						...item,
						fullscreen: false,
						maximized: false
					};
					return item;
				}),
				focusedId: id,
				focusedOutputId: win.outputId,
				...withEvent(scene, "xdg_toplevel", fullscreen ? `fullscreen ${win.appId}` : `unset fullscreen ${win.appId}`)
			};
		});
	},
	setWorkspace: (outputId, workspace, focusId) => {
		set((scene) => {
			const output = scene.outputs.find((item) => item.id === outputId);
			if (!output || output.workspace === workspace) return scene;
			const outputs = scene.outputs.map((item) => item.id === outputId ? {
				...item,
				workspace
			} : item);
			const focusedId = scene.windows.some((win) => win.id === focusId && win.outputId === outputId && win.workspace === workspace) ? focusId ?? null : focusForWorkspace(scene.windows, scene.focusedId, outputId, workspace);
			const previous = scene.windows.find((win) => win.id === scene.focusedId);
			const next = scene.windows.find((win) => win.id === focusedId);
			let eventSeq = scene.eventSeq;
			let events = scene.events;
			const push = (iface, msg) => {
				eventSeq += 1;
				events = [{
					id: eventSeq,
					iface,
					msg
				}, ...events].slice(0, 32);
			};
			if (!focusedId && previous && previous.outputId === outputId) push("wl_keyboard", `leave ${previous.appId}`);
			else if (next && next.id !== scene.focusedId) push("xdg_toplevel", `activated ${next.appId} em ${output.connector}`);
			push("orbit_arrange", `${output.connector} espaço ${workspace}`);
			const contactWin = scene.contact ? scene.windows.find((win) => win.id === scene.contact?.windowId) : void 0;
			const contactHost = contactWin ? outputs.find((item) => item.id === contactWin.outputId) : void 0;
			return {
				outputs,
				focusedOutputId: outputId,
				focusedId,
				contact: contactWin && contactHost && contactWin.workspace === contactHost.workspace ? scene.contact : null,
				events,
				eventSeq
			};
		});
	},
	moveToWorkspace: (id, workspace) => {
		set((scene) => {
			const win = scene.windows.find((item) => item.id === id);
			if (!win) return scene;
			const windows = scene.windows.map((item) => item.id === id ? {
				...item,
				workspace
			} : item);
			const outputs = scene.outputs.map((item) => item.id === win.outputId ? {
				...item,
				workspace
			} : item);
			return {
				windows,
				outputs,
				focusedId: id,
				...repairSplit(outputs, scene.windows, windows, slotsOf(scene), id),
				...withEvent(scene, "orbit_arrange", `${win.appId} → espaço ${workspace}`)
			};
		});
	},
	moveToOutput: (id, outputId) => {
		set((scene) => {
			const win = scene.windows.find((item) => item.id === id);
			const output = scene.outputs.find((item) => item.id === outputId);
			if (!win || !output || win.outputId === outputId) return scene;
			const order = scene.windows.filter((item) => item.outputId === outputId && item.workspace === output.workspace).reduce((max, item) => Math.max(max, item.order), -1) + 1;
			const windows = scene.windows.map((item) => item.id === id ? {
				...item,
				outputId,
				workspace: output.workspace,
				order,
				fullscreen: false,
				maximized: false
			} : item);
			return {
				windows,
				focusedId: id,
				focusedOutputId: outputId,
				...repairSplit(scene.outputs, scene.windows, windows, slotsOf(scene), id),
				...withEvent(scene, "wlr_scene", `reparent ${win.appId} → ${output.connector}`)
			};
		});
	},
	reorderBefore: (id, beforeId) => {
		set((scene) => {
			const win = scene.windows.find((item) => item.id === id);
			if (!win || id === beforeId) return scene;
			const group = scene.windows.filter((item) => item.outputId === win.outputId && item.workspace === win.workspace).sort((a, b) => a.order - b.order).map((item) => item.id).filter((item) => item !== id);
			const index = group.indexOf(beforeId);
			if (index < 0) return scene;
			group.splice(index, 0, id);
			const orderOf = new Map(group.map((item, itemIndex) => [item, itemIndex]));
			return {
				windows: scene.windows.map((item) => orderOf.has(item.id) ? {
					...item,
					order: orderOf.get(item.id) ?? item.order
				} : item),
				focusedId: id,
				...withEvent(scene, "orbit_arrange", `troca ordem de ${win.appId}`)
			};
		});
	},
	setFloatGeom: (id, geom) => {
		set((scene) => ({ windows: scene.windows.map((item) => item.id === id ? {
			...item,
			...geom
		} : item) }));
	},
	focusNeighbor: (step) => {
		const scene = get();
		const phone = scene.outputs.find((item) => item.profile === "dsi");
		const primary = scene.windows.find((win) => win.id === scene.splitPrimaryId);
		const secondary = scene.windows.find((win) => win.id === scene.splitSecondaryId);
		if (scene.split && phone && scene.focusedOutputId === phone.id && primary && secondary && primary.outputId === phone.id && secondary.outputId === phone.id && primary.workspace === phone.workspace && secondary.workspace === phone.workspace) {
			const pair = [primary.id, secondary.id];
			const index = pair.indexOf(scene.focusedId ?? "");
			const next = index < 0 ? pair[step < 0 ? 1 : 0] : pair[(index + step + pair.length) % pair.length];
			if (next) get().focusWindow(next);
			return;
		}
		const output = scene.outputs.find((item) => item.id === scene.focusedOutputId);
		if (!output) return;
		const list = scene.windows.filter((win) => win.outputId === output.id && win.workspace === output.workspace && !win.minimized).sort((a, b) => a.order - b.order);
		if (list.length === 0) return;
		const next = list[(Math.max(0, list.findIndex((win) => win.id === scene.focusedId)) + step + list.length) % list.length];
		if (!next) return;
		get().focusWindow(next.id);
	},
	addPortrait: () => {
		set((scene) => {
			if (scene.outputs.some((output) => output.id === "hdmi") || scene.preset === "celular") return scene;
			const output = portraitOutput(scene.outputs.reduce((max, output) => Math.max(max, output.x + output.width), 0));
			return {
				outputs: [...scene.outputs, output],
				...withEvent(scene, "wlr_output", `${output.connector} 1080×1920 transform normal, layout x=${output.x}`)
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
			const outputs = scene.outputs.filter((item) => item.id !== outputId).map((item) => item.x >= right ? {
				...item,
				x: item.x - span
			} : item);
			const base = scene.windows.filter((win) => win.outputId === fallback.id && win.workspace === fallback.workspace).reduce((max, win) => Math.max(max, win.order), -1) + 1;
			let taken = 0;
			const windows = scene.windows.map((win) => {
				if (win.outputId !== outputId) return win;
				const order = base + taken;
				taken += 1;
				return {
					...win,
					outputId: fallback.id,
					workspace: fallback.workspace,
					fullscreen: false,
					maximized: false,
					order
				};
			});
			const parked = scene.dockOn?.filter((item) => item !== outputId) ?? null;
			return {
				outputs,
				windows,
				dockOn: parked && parked.length > 0 ? parked : null,
				focusedOutputId: scene.focusedOutputId === outputId ? fallback.id : scene.focusedOutputId,
				...output.profile === "dsi" ? emptySplit() : repairSplit(outputs, scene.windows, windows, slotsOf(scene), null),
				...withEvent(scene, "wlr_output", taken > 0 ? `destroy ${output.connector}, ${taken} toplevels → ${fallback.connector}` : `destroy ${output.connector}`)
			};
		});
	},
	setOverview: (overview) => set((scene) => ({
		overview,
		...withEvent(scene, "orbit_gesture", overview ? "overview no DSI-1" : "overview fechado")
	})),
	toggleSplit: () => set((scene) => {
		if (scene.split) return {
			...emptySplit(),
			overview: false,
			...withEvent(scene, "orbit_arrange", "foco único no telemóvel")
		};
		const pinned = pinSplit(scene.windows, scene.outputs, scene.focusedId);
		if (!pinned.split) return { ...withEvent(scene, "orbit_arrange", "sem segundo toplevel para dividir") };
		const phone = scene.outputs.find((output) => output.profile === "dsi");
		const top = scene.windows.find((win) => win.id === pinned.splitPrimaryId);
		const bottom = scene.windows.find((win) => win.id === pinned.splitSecondaryId);
		return {
			...pinned,
			overview: false,
			focusedOutputId: phone?.id ?? scene.focusedOutputId,
			...withEvent(scene, "orbit_arrange", `par ${top?.appId ?? "?"} / ${bottom?.appId ?? "?"}`)
		};
	}),
	setSplitRatio: (splitRatio) => set({ splitRatio }),
	toggleKeyboard: () => set((scene) => ({
		keyboard: !scene.keyboard,
		...withEvent(scene, "zwp_text_input_v3", scene.keyboard ? "disable" : "enable no cliente focado")
	})),
	setShell: (outputId, mode) => set((scene) => {
		const shell = { ...scene.shell };
		if (mode === "session") delete shell[outputId];
		else shell[outputId] = mode;
		return { shell };
	}),
	setDockOn: (outputIds) => set((scene) => {
		const dockOn = outputIds && outputIds.length > 0 ? outputIds : null;
		return {
			dockOn,
			...withEvent(scene, "wlr_output", `doca em ${dockOn ? dockOn.join(" ") : "todas"}`)
		};
	}),
	typeKey: (key) => {
		const scene = get();
		if (!scene.focusedId) return;
		const win = scene.windows.find((item) => item.id === scene.focusedId);
		const output = win ? scene.outputs.find((item) => item.id === win.outputId) : void 0;
		if (!win || !output || win.workspace !== output.workspace || win.minimized) return;
		if (scene.shell[output.id] && scene.shell[output.id] !== "session") return;
		if (key === "\n") {
			const cmd = win.draft.trim();
			let reply = "";
			if (win.app === "terminal") {
				if (cmd === "outputs" || cmd === "get_outputs") reply = scene.outputs.map((output) => `${output.connector}  ${output.width}×${output.height}  @${output.hz}  scale ${output.scale.toFixed(2)}  espaço ${output.workspace}\n`).join("");
				else if (cmd === "clientes") reply = scene.windows.map((item) => `${item.appId}  ${item.outputId}  espaço ${item.workspace}\n`).join("") || "(nenhum toplevel)\n";
				else if (cmd === "ajuda" || cmd === "help") reply = "outputs · clientes · ajuda\n";
				else if (cmd.length > 0) reply = `sh: ${cmd.split(/\s+/)[0]}: não encontrado\n`;
			}
			const block = win.app === "terminal" ? `${win.log}orbit@seat0:~$ ${win.draft}\n${reply}` : `${win.log}${win.draft}\n`;
			set({ windows: scene.windows.map((item) => item.id === win.id ? {
				...item,
				draft: "",
				log: block.slice(-2400)
			} : item) });
			return;
		}
		set({ windows: scene.windows.map((item) => {
			if (item.id !== scene.focusedId) return item;
			if (key === "backspace") return {
				...item,
				draft: item.draft.slice(0, -1)
			};
			return {
				...item,
				draft: `${item.draft}${key}`.slice(0, 240)
			};
		}) });
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
		set({
			contact: {
				windowId: id,
				x: Math.min(1, Math.max(0, x)),
				y: Math.min(1, Math.max(0, y)),
				down: phase !== "up",
				kind
			},
			windows: phase === "up" && hit ? current.windows.map((item) => item.id === id ? {
				...item,
				hit
			} : item) : current.windows,
			...phase === "move" ? {} : withEvent(current, "wl_pointer", `button 272 ${phase === "down" ? "press" : "release"} ${sx},${sy} ${win.appId}`)
		});
	},
	reset: () => {
		const scene = get();
		set(createScene(scene.preset, {
			layout: scene.layout,
			gaps: scene.gaps,
			masterRatio: scene.masterRatio,
			focusFollows: scene.focusFollows,
			dockOn: scene.dockOn
		}));
	}
}));
var ICONS = {
	terminal: Terminal,
	navegador: Globe,
	ficheiros: Folder,
	editor: Code,
	correio: Mail,
	leitor: Play,
	definicoes: Settings,
	notas: StickyNote
};
function AppIcon({ app, className }) {
	const Icon = ICONS[app];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
		className: className ?? "size-4",
		"aria-hidden": "true"
	});
}
function WindowBody({ win, outputs }) {
	if (win.app === "terminal") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalBody, {
		win,
		outputs
	});
	if (win.app === "navegador") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrowserBody, { win });
	if (win.app === "ficheiros") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilesBody, { win });
	if (win.app === "editor") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorBody, { win });
	if (win.app === "correio") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailBody, { win });
	if (win.app === "leitor") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerBody, { win });
	if (win.app === "definicoes") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsBody, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesBody, { win });
}
function TerminalBody({ win, outputs }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("pre", {
		className: "h-full overflow-auto p-3 font-mono text-xs leading-relaxed text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: "orbit@seat0"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted",
				children: ":~$ "
			}),
			"orbit-msg -t get_outputs",
			"\n",
			outputs.map((output) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: `Output ${output.connector}\n  ${output.width}×${output.height} @${output.hz}  scale ${output.scale.toFixed(2)}  espaço ${output.workspace}\n` }, output.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-faint",
				children: ["escreve ajuda", "\n"]
			}),
			win.log,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: "orbit@seat0"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted",
				children: ":~$ "
			}),
			win.draft,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: "▍"
			})
		]
	});
}
function BrowserBody({ win }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 border-b border-border px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, {
				className: "size-3.5 shrink-0 text-accent",
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate font-mono text-xs text-muted",
				children: "wiki.archlinux.org"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-auto px-3 py-3 text-xs leading-relaxed text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-lg text-fg",
					children: "Seu Linux, do seu jeito."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-pretty",
					children: "Organize o ambiente e deixe tudo ao alcance."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HitBlock, {
					id: "configure",
					hit: win.hit,
					title: "configure",
					body: "Cada janela é um xdg_toplevel. O compositor manda configure com tamanho e estados (activated, fullscreen, tiled) e o cliente responde com um buffer."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HitBlock, {
					id: "layout",
					hit: win.hit,
					title: "output layout",
					body: "Várias saídas partilham o mesmo scene graph. A posição é em coordenadas do wlr_output_layout, não do monitor."
				})
			]
		})]
	});
}
function HitBlock({ id, hit, title, body }) {
	const on = hit === id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-hit": id,
		"aria-pressed": on,
		className: `mt-2 block w-full rounded-md px-2 py-2 text-left ${on ? "bg-elevated text-fg" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm text-fg",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-1 block text-pretty text-xs text-muted",
			children: body
		})]
	});
}
function FilesBody({ win }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "h-full overflow-auto py-1",
		children: [
			["orbit.h", "compositor"],
			["notas.txt", "texto"],
			["wallpaper.jpg", "imagem"],
			["estrutura.md", "markdown"],
			["Makefile", "build"]
		].map(([name, kind]) => {
			const on = win.hit === name;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"data-hit": name,
				"aria-pressed": on,
				className: `flex min-h-11 w-full items-center gap-2 px-3 text-left text-xs ${on ? "bg-elevated" : ""}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, {
						className: "size-3.5 text-accent",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto font-mono text-faint",
						children: kind
					})
				]
			}) }, name);
		})
	});
}
function EditorBody({ win }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-full overflow-auto font-mono text-xs leading-relaxed",
		children: [[
			"/* mestre à esquerda, stack à direita, por saída */",
			"int master = box.width * server->master_pct / 100;",
			"place(view, box.x + gap, box.y + gap,",
			"    master - gap, box.height - 2 * gap, true);",
			"wlr_xdg_toplevel_set_tiled(view->toplevel,",
			"    WLR_EDGE_LEFT | WLR_EDGE_RIGHT |",
			"    WLR_EDGE_TOP | WLR_EDGE_BOTTOM);"
		].map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-3 px-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-5 shrink-0 text-right text-faint tabular-nums",
				children: index + 40
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: line.startsWith("/*") ? "text-faint" : "text-fg",
				children: line
			})]
		}, line)), win.log || win.draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-3 px-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-5 shrink-0 text-right text-faint tabular-nums",
				children: "47"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "whitespace-pre-wrap text-fg",
				children: [
					win.log,
					win.draft,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-accent",
						children: "▍"
					})
				]
			})]
		}) : null]
	});
}
function MailBody({ win }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-full overflow-auto",
		children: [[
			"doca",
			"Doca ligada",
			"DP-1 entrou no layout. O toque continua no DSI-1."
		], [
			"frame",
			"frame callback",
			"Cada saída pede o seu vsync. O scene só pinta o que está danificado."
		]].map(([id, title, body]) => {
			const on = win.hit === id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"data-hit": id,
				"aria-pressed": on,
				className: `block w-full border-b border-border px-3 py-2 text-left ${on ? "bg-elevated" : ""}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-fg",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-pretty text-muted",
					children: body
				})]
			}, id);
		})
	});
}
function PlayerBody({ win }) {
	const on = win.hit === "sessao";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-hit": "sessao",
		"aria-pressed": on,
		className: `flex h-full w-full flex-col justify-end gap-3 p-3 text-left ${on ? "bg-elevated" : "bg-bg"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg",
				children: on ? "A reproduzir" : "Sessão ao vivo"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs text-muted",
				children: "seat0 · 48 kHz"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1.5 overflow-hidden rounded-full bg-inset",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-full bg-accent ${on ? "w-full" : "w-2/3"}` })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs text-faint tabular-nums",
				children: on ? "03:40 / 03:40" : "02:14 / 03:40"
			})
		]
	});
}
function SettingsBody() {
	const focusFollows = useCompositor((state) => state.focusFollows);
	const setFocusFollows = useCompositor((state) => state.setFocusFollows);
	const keyboard = useCompositor((state) => state.keyboard);
	const toggleKeyboard = useCompositor((state) => state.toggleKeyboard);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col gap-2 overflow-auto p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
			label: "Foco segue o ponteiro",
			on: focusFollows,
			onClick: () => setFocusFollows(!focusFollows)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
			label: "Teclado no ecrã",
			on: keyboard,
			onClick: toggleKeyboard
		})]
	});
}
function Toggle({ label, on, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-nodrag": true,
		"aria-pressed": on,
		onClick: (event) => {
			event.stopPropagation();
			onClick();
		},
		className: "flex min-h-11 items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 text-left text-xs text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: on ? "font-mono text-accent" : "font-mono text-faint",
			children: on ? "on" : "off"
		})]
	});
}
function NotesBody({ win }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-full overflow-auto p-3 text-xs leading-relaxed text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-lg text-fg",
				children: "Ideias para o LUMNA"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-faint",
				children: "Hoje"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-pretty text-fg",
				children: "Uma interface simples, bonita e feita para o toque."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: [
					"Ajustar os gestos",
					"Testar a divisão de tela",
					"Organizar os atalhos"
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-3 rounded-full ring-1 ring-muted" }), item]
				}, item))
			}),
			win.log || win.draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 whitespace-pre-wrap font-mono text-fg",
				children: [
					win.log,
					win.draft,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-accent",
						children: "▍"
					})
				]
			}) : null
		]
	});
}
var FAVORITES = [
	"ficheiros",
	"navegador",
	"editor",
	"definicoes",
	"notas",
	"terminal"
];
var GROUPS = [
	{
		id: "favoritos",
		label: "Favoritos",
		apps: FAVORITES
	},
	{
		id: "trabalho",
		label: "Trabalho",
		apps: [
			"editor",
			"notas",
			"correio",
			"ficheiros"
		]
	},
	{
		id: "internet",
		label: "Internet",
		apps: ["navegador", "correio"]
	},
	{
		id: "midia",
		label: "Mídia",
		apps: ["leitor"]
	},
	{
		id: "sistema",
		label: "Sistema",
		apps: ["definicoes", "terminal"]
	}
];
var PHONE_GROUPS = [
	{
		id: "todos",
		label: "Todos",
		apps: APPS.map((app) => app.id)
	},
	{
		id: "trabalho",
		label: "Trabalho",
		apps: [
			"editor",
			"notas",
			"correio",
			"ficheiros"
		]
	},
	{
		id: "midia",
		label: "Mídia",
		apps: ["leitor", "navegador"]
	},
	{
		id: "sistema",
		label: "Sistema",
		apps: ["definicoes", "terminal"]
	}
];
function shellOf(shell, outputId) {
	return shell[outputId] ?? "session";
}
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 16 16",
		className,
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M8 1.2 14.4 8 8 14.8 1.6 8Z",
			fill: "currentColor"
		})
	});
}
function useClock() {
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 15e3);
		return () => window.clearInterval(id);
	}, []);
	return now;
}
function openApp(outputId, app) {
	const scene = useCompositor.getState();
	const output = scene.outputs.find((item) => item.id === outputId);
	const existing = scene.windows.find((win) => win.app === app && win.outputId === outputId && win.workspace === output?.workspace);
	if (existing) scene.focusWindow(existing.id);
	else scene.spawn(app, outputId);
	scene.setShell(outputId, "session");
	scene.setOverview(false);
}
function DesktopBar({ output }) {
	const now = useClock();
	const setWorkspace = useCompositor((state) => state.setWorkspace);
	const workspace = output.workspace;
	const [audio, setAudio] = (0, import_react.useState)(false);
	const [level, setLevel] = (0, import_react.useState)(65);
	const [mic, setMic] = (0, import_react.useState)(50);
	const [speaker, setSpeaker] = (0, import_react.useState)(true);
	const time = now.toLocaleTimeString("pt-PT", {
		hour: "2-digit",
		minute: "2-digit"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-10 shrink-0 items-center gap-2 overflow-hidden border-b border-border bg-inset/80 px-3 text-xs",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-3.5 shrink-0 text-accent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 font-medium tracking-widest",
				children: "LUMNA"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex min-w-0 flex-1 items-center justify-center gap-1.5",
				role: "group",
				"aria-label": "Espaços",
				children: WORKSPACES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Espaço ${item}`,
					"aria-pressed": workspace === item,
					onClick: () => setWorkspace(output.id, item),
					className: `h-1 w-5 shrink-0 rounded-full ${workspace === item ? "bg-accent" : "bg-faint"}`
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-1.5 text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, {
						className: "size-3.5",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Áudio",
						"aria-expanded": audio,
						className: "inline-flex size-8 items-center justify-center rounded-md hover:bg-elevated hover:text-fg",
						onClick: () => setAudio((open) => !open),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bluetooth, {
						className: "size-3.5",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular-nums text-fg",
						children: time
					})
				]
			}),
			audio ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-3 top-11 z-30 w-64 rounded-xl border border-border bg-surface p-3 text-fg shadow-lg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
								className: "size-4 text-accent",
								"aria-hidden": "true"
							}), "Áudio"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Fechar áudio",
							className: "inline-flex size-8 items-center justify-center text-muted",
							onClick: () => setAudio(false),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Saída"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": speaker,
						onClick: () => setSpeaker(true),
						className: "mt-1 flex min-h-10 w-full items-center justify-between rounded-lg bg-inset px-3 text-xs",
						children: ["Alto-falantes", speaker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-accent" }) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": !speaker,
						onClick: () => setSpeaker(false),
						className: "mt-1 flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-xs text-muted",
						children: ["Fone de ouvido", !speaker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-accent" }) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 block text-xs text-muted",
						children: [
							"Volume ",
							level,
							"%",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 100,
								value: level,
								onChange: (event) => setLevel(Number(event.target.value)),
								className: "mt-1 w-full accent-accent"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-2 block text-xs text-muted",
						children: [
							"Microfone ",
							mic,
							"%",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 100,
								value: mic,
								onChange: (event) => setMic(Number(event.target.value)),
								className: "mt-1 w-full accent-accent"
							})
						]
					})
				]
			}) : null
		]
	});
}
function DesktopDock({ outputId, peek = false }) {
	const mode = useCompositor((state) => shellOf(state.shell, outputId));
	const setShell = useCompositor((state) => state.setShell);
	const windows = useCompositor((state) => state.windows);
	const outputs = useCompositor((state) => state.outputs);
	const dockOn = useCompositor((state) => state.dockOn);
	const setDockOn = useCompositor((state) => state.setDockOn);
	const workspace = outputs.find((item) => item.id === outputId)?.workspace;
	const focusedId = useCompositor((state) => state.focusedId);
	const focused = windows.find((win) => win.id === focusedId);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [place, setPlace] = (0, import_react.useState)(false);
	const parked = windows.filter((win) => win.minimized && win.outputId === outputId && win.workspace === workspace);
	const pinned = /* @__PURE__ */ new Set([
		"ficheiros",
		"navegador",
		"definicoes"
	]);
	const desks = outputs.filter((item) => item.profile !== "dsi");
	const allowed = dockOn === null || dockOn.includes(outputId);
	const items = [
		{
			id: "home",
			label: "Início",
			icon: Gem,
			on: mode === "home",
			dot: false,
			run: () => setShell(outputId, mode === "home" ? "session" : "home")
		},
		{
			id: "files",
			label: "Arquivos",
			icon: Folder,
			on: mode === "session" && focused?.app === "ficheiros" && focused.outputId === outputId && !focused.minimized,
			dot: parked.some((win) => win.app === "ficheiros"),
			run: () => openApp(outputId, "ficheiros")
		},
		{
			id: "web",
			label: "Navegador",
			icon: Globe,
			on: mode === "session" && focused?.app === "navegador" && focused.outputId === outputId && !focused.minimized,
			dot: parked.some((win) => win.app === "navegador"),
			run: () => openApp(outputId, "navegador")
		},
		{
			id: "store",
			label: "Loja",
			icon: ShoppingBag,
			on: mode === "loja",
			dot: false,
			run: () => setShell(outputId, mode === "loja" ? "session" : "loja")
		},
		{
			id: "settings",
			label: "Ajustes",
			icon: SlidersHorizontal,
			on: mode === "session" && focused?.app === "definicoes" && focused.outputId === outputId && !focused.minimized,
			dot: parked.some((win) => win.app === "definicoes"),
			run: () => openApp(outputId, "definicoes")
		},
		{
			id: "emma",
			label: "Emma",
			icon: Mic,
			on: false,
			dot: false,
			run: () => setShell(outputId, "home")
		}
	];
	if (!allowed) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-x-0 bottom-0 z-40",
		onPointerLeave: () => {
			if (!peek) return;
			setOpen(false);
			setPlace(false);
		},
		children: [peek ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-auto absolute bottom-0 left-1/2 z-10 h-3 w-28 -translate-x-1/2",
			onPointerEnter: () => setOpen(true),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": "true",
				className: "mx-auto mt-1 block h-1 w-16 rounded-full bg-fg/80"
			})
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `pointer-events-auto flex flex-col items-center pb-3 transition-transform duration-200 ease-out ${peek && !open ? "translate-y-full" : "translate-y-0"}`,
				onPointerEnter: () => {
					if (peek) setOpen(true);
				},
				children: [peek ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [place ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute bottom-full left-1/2 z-10 mb-2 w-52 -translate-x-1/2 rounded-xl border border-border bg-surface p-2 text-fg shadow-lg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-2 py-1 text-xs text-muted",
								children: "Doca"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": dockOn === null,
								className: "flex min-h-10 w-full items-center justify-between rounded-lg px-2 text-left text-xs hover:bg-elevated",
								onClick: () => setDockOn(null),
								children: ["Todas as telas", dockOn === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-accent" }) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": dockOn?.length === 1 && dockOn[0] === outputId,
								className: "flex min-h-10 w-full items-center justify-between rounded-lg px-2 text-left text-xs hover:bg-elevated",
								onClick: () => setDockOn([outputId]),
								children: ["Só esta tela", dockOn?.length === 1 && dockOn[0] === outputId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-accent" }) : null]
							}),
							desks.map((item) => {
								const on = dockOn === null || dockOn.includes(item.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									"aria-pressed": on,
									className: "flex min-h-10 w-full items-center justify-between rounded-lg px-2 text-left text-xs hover:bg-elevated",
									onClick: () => {
										const current = dockOn ?? desks.map((desk) => desk.id);
										const next = current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id];
										setDockOn(next.length === 0 || next.length === desks.length ? null : next);
									},
									children: [item.connector, on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-accent" }) : null]
								}, item.id);
							})
						]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 rounded-2xl border border-border bg-surface/95 px-2 py-1.5",
						children: [
							items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"data-nodrag": true,
								"aria-label": item.label,
								"aria-pressed": item.on,
								onClick: item.run,
								className: `relative inline-flex size-11 items-center justify-center rounded-xl ${item.on ? "bg-elevated text-accent" : "text-fg hover:bg-elevated"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
									className: "size-5",
									"aria-hidden": "true"
								}), item.dot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute bottom-1 size-1 rounded-full bg-accent" }) : null]
							}, item.id)),
							parked.some((win) => !pinned.has(win.app)) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }) : null,
							parked.filter((win) => !pinned.has(win.app)).map((win) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"data-nodrag": true,
								"aria-label": `Restaurar ${win.title}`,
								onClick: () => {
									useCompositor.getState().focusWindow(win.id);
									useCompositor.getState().setShell(outputId, "session");
								},
								className: "relative inline-flex size-11 items-center justify-center rounded-xl text-fg hover:bg-elevated",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppIcon, {
									app: win.app,
									className: "size-5"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute bottom-1 size-1 rounded-full bg-accent" })]
							}, win.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-6 w-px bg-border" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-nodrag": true,
								"aria-label": "Telas da doca",
								"aria-expanded": place,
								onClick: () => setPlace((value) => !value),
								className: "inline-flex size-11 items-center justify-center rounded-xl text-muted hover:bg-elevated hover:text-fg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, {
									className: "size-4",
									"aria-hidden": "true"
								})
							})
						]
					})]
				})]
			})
		})]
	});
}
function DesktopHome({ outputId }) {
	const [group, setGroup] = (0, import_react.useState)(GROUPS[0].id);
	const [query, setQuery] = (0, import_react.useState)("");
	const setShell = useCompositor((state) => state.setShell);
	const visible = (GROUPS.find((item) => item.id === group)?.apps ?? FAVORITES).filter((id) => {
		const spec = APPS.find((app) => app.id === id);
		return spec ? spec.label.toLowerCase().includes(query.trim().toLowerCase()) : false;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-full overflow-auto px-6 pb-20 pt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-3xl font-medium tracking-tight",
					children: "Início"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex h-11 min-w-56 flex-1 items-center gap-2 rounded-xl border border-border bg-surface/80 px-3 text-sm text-muted sm:max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						className: "size-4 shrink-0",
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Buscar aplicativos e arquivos",
						className: "w-full bg-transparent text-fg outline-none placeholder:text-faint"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex gap-4 overflow-auto text-sm",
				role: "tablist",
				children: GROUPS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "tab",
					"aria-selected": group === item.id,
					onClick: () => setGroup(item.id),
					className: `shrink-0 border-b-2 pb-2 ${group === item.id ? "border-accent text-fg" : "border-transparent text-muted"}`,
					children: item.label
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5",
				children: visible.map((id) => {
					const spec = APPS.find((app) => app.id === id);
					if (!spec) return null;
					const lead = id === "ficheiros" && query.trim() === "";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => openApp(outputId, id),
						className: `flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border text-sm ${lead ? "border-accent bg-accent/15 text-fg" : "border-border bg-surface/80 text-fg hover:bg-elevated"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppIcon, {
							app: id,
							className: `size-8 ${lead ? "text-accent" : "text-fg"}`
						}), spec.label]
					}, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-sm text-muted",
				children: "Recentes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid gap-3 sm:grid-cols-3",
				children: [
					[
						"Projeto LUMNA",
						"Documentos · há 2 horas",
						"notas"
					],
					[
						"Notas.txt",
						"Documentos · ontem",
						"notas"
					],
					[
						"Downloads",
						"Pasta · há 3 dias",
						"ficheiros"
					]
				].map(([title, meta, app]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => openApp(outputId, app),
					className: "flex min-h-16 items-center gap-3 rounded-xl border border-border bg-surface/70 px-3 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, {
						className: "size-4 text-muted",
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm text-fg",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-xs text-muted",
						children: meta
					})] })]
				}, title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex items-center gap-4 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex min-h-11 items-center gap-2",
					onClick: () => setShell(outputId, "lock"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
						className: "size-4",
						"aria-hidden": "true"
					}), "Bloquear"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex min-h-11 items-center gap-2",
					onClick: () => setShell(outputId, "lock"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, {
						className: "size-4",
						"aria-hidden": "true"
					}), "Desligar"]
				})]
			})
		]
	});
}
function DesktopStore({ outputId }) {
	const setShell = useCompositor((state) => state.setShell);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-start justify-center overflow-auto p-6 pb-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-3xl rounded-2xl border border-border bg-surface/95 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, {
						className: "size-4 text-accent",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm",
						children: "Loja de aplicativos"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Fechar loja",
						className: "ml-auto inline-flex size-8 items-center justify-center text-muted",
						onClick: () => setShell(outputId, "session"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					[
						"Navegador",
						"Páginas no telemóvel e na secretária.",
						"navegador"
					],
					[
						"Arquivos",
						"Pastas, recentes e pré-visualização.",
						"ficheiros"
					],
					[
						"Notas",
						"Listas curtas, feitas para o toque.",
						"notas"
					],
					[
						"Terminal",
						"O seat, as saídas e os clientes.",
						"terminal"
					],
					[
						"Música",
						"A sessão que está a tocar.",
						"leitor"
					],
					[
						"Ajustes",
						"Foco, teclado e o ecrã.",
						"definicoes"
					]
				].map(([title, body, app]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-inset p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppIcon, {
								app,
								className: "size-5 text-accent"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-fg",
								children: title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ml-auto h-8 rounded-lg bg-accent px-3 text-xs font-medium text-ink",
								onClick: () => openApp(outputId, app),
								children: "Abrir"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-pretty text-muted",
						children: body
					})]
				}, title))
			})]
		})
	});
}
function LockScreen({ outputId }) {
	const now = useClock();
	const setShell = useCompositor((state) => state.setShell);
	const time = now.toLocaleTimeString("pt-PT", {
		hour: "2-digit",
		minute: "2-digit"
	});
	const date = now.toLocaleDateString("pt-PT", {
		weekday: "long",
		day: "numeric",
		month: "long"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "flex h-full w-full flex-col items-center justify-center gap-2 text-center",
		onClick: () => setShell(outputId, "home"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-6xl font-medium tracking-tight text-fg",
				children: time
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: date
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-xs text-faint",
				children: "Bloqueado · toca para voltar ao início"
			})
		]
	});
}
function PhoneHome({ outputId }) {
	const now = useClock();
	const time = now.toLocaleTimeString("pt-PT", {
		hour: "2-digit",
		minute: "2-digit"
	});
	const date = now.toLocaleDateString("pt-PT", {
		weekday: "long",
		day: "numeric",
		month: "long"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col px-4 pb-32 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-2 text-xs tracking-widest text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-3.5 text-accent" }), "LUMNA"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted",
					children: "Desktop"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-6xl font-medium tracking-tight",
					children: time
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: date
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-auto flex h-12 items-center gap-2 rounded-full border border-border bg-surface/80 px-4 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, {
					className: "size-4 text-accent",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					placeholder: "Pergunte à Emma",
					className: "w-full bg-transparent text-fg outline-none placeholder:text-faint"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: outputId
			})
		]
	});
}
function PhoneApps({ outputId }) {
	const [group, setGroup] = (0, import_react.useState)(PHONE_GROUPS[0].id);
	const [query, setQuery] = (0, import_react.useState)("");
	const visible = (PHONE_GROUPS.find((item) => item.id === group)?.apps ?? []).filter((id) => {
		const spec = APPS.find((app) => app.id === id);
		return spec ? spec.label.toLowerCase().includes(query.trim().toLowerCase()) : false;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-full overflow-auto px-4 pb-32 pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-3.5 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs tracking-widest",
					children: "LUMNA"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-3xl font-medium tracking-tight",
					children: "Aplicativos"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex items-center gap-1 text-xs text-muted",
					onClick: () => useCompositor.getState().setShell(outputId, "loja"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, {
						className: "size-4",
						"aria-hidden": "true"
					}), "Loja"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-4 flex h-11 items-center gap-2 rounded-full border border-border bg-surface/80 px-3 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
					className: "size-4",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Buscar aplicativos",
					className: "w-full bg-transparent text-fg outline-none placeholder:text-faint"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex gap-4 text-sm",
				role: "tablist",
				children: PHONE_GROUPS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "tab",
					"aria-selected": group === item.id,
					onClick: () => setGroup(item.id),
					className: `border-b-2 pb-2 ${group === item.id ? "border-accent text-fg" : "border-transparent text-muted"}`,
					children: item.label
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-3 gap-3",
				children: visible.map((id) => {
					const spec = APPS.find((app) => app.id === id);
					if (!spec) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => openApp(outputId, id),
						className: "flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface/80 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppIcon, {
							app: id,
							className: "size-6 text-accent"
						}), spec.label]
					}, id);
				})
			})
		]
	});
}
function PhoneNav({ outputId }) {
	const mode = useCompositor((state) => shellOf(state.shell, outputId));
	const setShell = useCompositor((state) => state.setShell);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center px-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-2xl border border-border bg-surface/95 px-2 py-1",
			children: [
				{
					id: "home",
					label: "Início",
					icon: House,
					on: mode === "home",
					run: () => setShell(outputId, "home")
				},
				{
					id: "files",
					label: "Arquivos",
					icon: Folder,
					on: false,
					run: () => openApp(outputId, "ficheiros")
				},
				{
					id: "apps",
					label: "Apps",
					icon: LayoutGrid,
					on: mode === "apps",
					run: () => setShell(outputId, "apps")
				},
				{
					id: "settings",
					label: "Ajustes",
					icon: Settings,
					on: false,
					run: () => openApp(outputId, "definicoes")
				},
				{
					id: "home",
					label: "Emma",
					icon: AudioLines,
					on: false,
					run: () => setShell(outputId, "home")
				}
			].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-label": item.label,
				"aria-pressed": item.on,
				onClick: item.run,
				className: `inline-flex h-12 min-w-12 flex-col items-center justify-center rounded-xl ${item.on ? "text-accent" : "text-muted"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
					className: "size-5",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-0.5 text-xs",
					children: item.label
				})]
			}, item.label))
		})
	});
}
function PhoneStatus({ overlay = false, onDrag }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: overlay ? "absolute inset-x-0 top-0 z-30 flex h-6 items-center gap-2 bg-bg/70 px-3" : "flex h-6 shrink-0 items-center gap-2 px-3",
		onPointerDown: onDrag,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "ml-auto inline-flex items-center gap-1.5 text-muted",
			"aria-label": "Estado",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, {
				className: "size-3",
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BatteryFull, {
				className: "size-3.5",
				"aria-hidden": "true"
			})]
		})]
	});
}
function PhoneHandle({ outputId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": "Início. Arrastar para cima abre os recentes.",
		className: "absolute bottom-0 left-1/2 z-30 flex h-11 w-28 -translate-x-1/2 items-end justify-center pb-1.5",
		onPointerDown: (event) => {
			if (event.button !== 0) return;
			event.preventDefault();
			event.stopPropagation();
			const startX = event.clientX;
			const startY = event.clientY;
			let opened = false;
			const move = (pointer) => {
				if (!opened && startY - pointer.clientY > 28) {
					opened = true;
					useCompositor.getState().setOverview(true);
				}
			};
			const up = (pointer) => {
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
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1 w-16 rounded-full bg-fg/80" })
	});
}
function Overview({ output }) {
	const windows = useCompositor((state) => state.windows);
	const focusWindow = useCompositor((state) => state.focusWindow);
	const close = useCompositor((state) => state.close);
	const setWorkspace = useCompositor((state) => state.setWorkspace);
	const setOverview = useCompositor((state) => state.setOverview);
	const toggleKeyboard = useCompositor((state) => state.toggleKeyboard);
	const split = useCompositor((state) => state.split);
	const toggleSplit = useCompositor((state) => state.toggleSplit);
	const listed = windows.filter((win) => win.outputId === output.id).sort((a, b) => a.workspace - b.workspace || a.order - b.order);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col pt-7",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 px-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Recentes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "ml-auto flex items-center gap-1",
					role: "group",
					"aria-label": "Espaços",
					children: WORKSPACES.map((workspace) => {
						const active = output.workspace === workspace;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": active,
							"aria-label": `Espaço ${workspace}`,
							onClick: () => setWorkspace(output.id, workspace),
							className: `h-1.5 w-5 rounded-full ${active ? "bg-accent" : "bg-faint"}`
						}, workspace);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-auto p-2",
				children: listed.map((win) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverviewCard, {
					win,
					here: win.workspace === output.workspace,
					onOpen: () => {
						if (output.workspace !== win.workspace) setWorkspace(output.id, win.workspace, win.id);
						else focusWindow(win.id);
						useCompositor.getState().setShell(output.id, "session");
						setOverview(false);
					},
					onClose: () => close(win.id)
				}, win.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-center gap-2 px-3 pb-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-10 rounded-full bg-elevated px-4 text-xs text-fg",
					onClick: () => toggleSplit(),
					children: split ? "Uma" : "Dividir"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-10 rounded-full bg-elevated px-4 text-xs text-fg",
					onClick: () => {
						toggleKeyboard();
						setOverview(false);
					},
					children: "Teclado"
				})]
			})
		]
	});
}
function OverviewCard({ win, here, onOpen, onClose }) {
	const skip = (0, import_react.useRef)(false);
	const [dy, setDy] = (0, import_react.useState)(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => {
			if (skip.current) {
				skip.current = false;
				return;
			}
			onOpen();
		},
		onPointerDown: (event) => {
			const start = event.clientY;
			const move = (pointer) => setDy(Math.min(0, pointer.clientY - start));
			const up = (pointer) => {
				if (Math.min(0, pointer.clientY - start) < -70) {
					skip.current = true;
					onClose();
				}
				setDy(0);
				window.removeEventListener("pointermove", move);
				window.removeEventListener("pointerup", up);
			};
			window.addEventListener("pointermove", move);
			window.addEventListener("pointerup", up);
		},
		className: "flex min-h-28 flex-col rounded-lg bg-surface p-3 text-left ring-1 ring-border",
		style: {
			transform: `translateY(${dy}px)`,
			opacity: 1 - Math.min(.7, Math.abs(dy) / 180)
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppIcon, {
				app: win.app,
				className: "size-4 text-accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-2 text-sm text-fg",
				children: win.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs text-faint",
				children: win.appId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: `mt-auto pt-2 font-mono text-xs ${here ? "text-accent" : "text-muted"}`,
				children: ["espaço ", win.workspace]
			})
		]
	});
}
function OnScreenKeyboard() {
	const typeKey = useCompositor((state) => state.typeKey);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "shrink-0 border-t border-border bg-surface px-2 pb-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Fechar teclado",
			className: "mx-auto mb-1 flex h-5 w-full items-center justify-center",
			onClick: () => useCompositor.getState().toggleKeyboard(),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1 w-10 rounded-full bg-faint" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-1",
			children: [[
				"qwertyuiop",
				"asdfghjkl",
				"zxcvbnm"
			].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center gap-1",
				children: row.split("").map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-11 min-w-0 flex-1 rounded-md bg-elevated text-xs text-fg",
					onClick: () => typeKey(key),
					children: key
				}, key))
			}, row)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-11 flex-1 rounded-md bg-elevated text-xs text-fg",
						onClick: () => typeKey(" "),
						children: "espaço"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-11 rounded-md bg-elevated px-3 text-xs text-fg",
						onClick: () => typeKey("backspace"),
						children: "apagar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-11 rounded-md bg-accent px-3 text-xs font-medium text-ink",
						onClick: () => typeKey("\n"),
						children: "enter"
					})
				]
			})]
		})]
	});
}
function Clock() {
	const [label, setLabel] = (0, import_react.useState)("--:--");
	(0, import_react.useEffect)(() => {
		const tick = () => setLabel((/* @__PURE__ */ new Date()).toLocaleTimeString("pt-PT", {
			hour: "2-digit",
			minute: "2-digit"
		}));
		tick();
		const id = window.setInterval(tick, 15e3);
		return () => window.clearInterval(id);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "font-mono text-xs text-muted tabular-nums",
		children: label
	});
}
function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
function useBox(ref) {
	const [box, setBox] = (0, import_react.useState)({
		w: 0,
		h: 0
	});
	(0, import_react.useEffect)(() => {
		const element = ref.current;
		if (!element) return;
		const update = () => setBox({
			w: element.clientWidth,
			h: element.clientHeight
		});
		update();
		const observer = new ResizeObserver(update);
		observer.observe(element);
		return () => observer.disconnect();
	}, [ref]);
	return box;
}
function hitTest(x, y, ignore) {
	let windowId = null;
	let outputId = null;
	for (const node of document.elementsFromPoint(x, y)) {
		if (!(node instanceof HTMLElement)) continue;
		if (!windowId && node.dataset.window && node.dataset.window !== ignore) windowId = node.dataset.window;
		if (!outputId && node.dataset.output) outputId = node.dataset.output;
	}
	return {
		windowId,
		outputId
	};
}
function Stage() {
	const outputs = useCompositor((state) => state.outputs);
	const frame = (0, import_react.useRef)(null);
	const box = useBox(frame);
	const plan = layoutCards(outputs, box.w || 360, box.h || 480);
	const [ghost, setGhost] = (0, import_react.useState)(null);
	const [live, setLive] = (0, import_react.useState)({});
	const [dropOutput, setDropOutput] = (0, import_react.useState)(null);
	const [fly, setFly] = (0, import_react.useState)(null);
	const liveRef = (0, import_react.useRef)(live);
	liveRef.current = live;
	const dragRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const onMove = (event) => {
			const drag = dragRef.current;
			if (!drag) return;
			if (drag.mode === "resize") {
				const fw = clamp(drag.fw + (event.clientX - drag.startX) / drag.rectW, .24, .96);
				const fh = clamp(drag.fh + (event.clientY - drag.startY) / drag.rectH, .2, .94);
				setLive((current) => ({
					...current,
					[drag.id]: {
						fx: drag.fx,
						fy: drag.fy,
						fw,
						fh
					}
				}));
				return;
			}
			if (Math.abs(event.clientX - drag.px) + Math.abs(event.clientY - drag.py) > 5) drag.moved = true;
			if (!drag.moved) return;
			if (!drag.float) drag.float = true;
			setFly({
				id: drag.id,
				left: event.clientX - drag.dx,
				top: event.clientY - drag.dy,
				width: drag.screenW,
				height: drag.screenH
			});
			setDropOutput(hitTest(event.clientX, event.clientY, drag.id).outputId);
		};
		const finish = (event, commit) => {
			const drag = dragRef.current;
			dragRef.current = null;
			setGhost(null);
			setDropOutput(null);
			setFly(null);
			if (!drag || !commit || drag.mode === "move" && !drag.moved) {
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
				const rect = document.querySelector(`[data-content][data-output="${targetId}"]`)?.getBoundingClientRect();
				const geom = rect && rect.width > 8 && rect.height > 8 ? {
					fw: clamp(drag.screenW / rect.width, .24, .96),
					fh: clamp(drag.screenH / rect.height, .2, .94),
					fx: clamp((event.clientX - drag.dx - rect.left) / rect.width, 0, 1 - clamp(drag.screenW / rect.width, .24, .96)),
					fy: clamp((event.clientY - drag.dy - rect.top) / rect.height, 0, 1 - clamp(drag.screenH / rect.height, .2, .94))
				} : {};
				store.floatAt(drag.id, geom);
				if (targetId !== drag.outputId) store.moveToOutput(drag.id, targetId);
				setLive({});
				return;
			}
			if (hit.outputId && hit.outputId !== drag.outputId) store.moveToOutput(drag.id, hit.outputId);
			else if (hit.windowId) store.reorderBefore(drag.id, hit.windowId);
			setLive({});
		};
		const onUp = (event) => finish(event, true);
		const onCancel = (event) => finish(event, false);
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp, true);
		window.addEventListener("pointercancel", onCancel, true);
		return () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp, true);
			window.removeEventListener("pointercancel", onCancel, true);
		};
	}, []);
	const beginMove = (event, win) => {
		if (event.button !== 0) return;
		if (event.target.closest("[data-nodrag]")) return;
		event.preventDefault();
		try {
			event.currentTarget.setPointerCapture(event.pointerId);
		} catch {}
		const store = useCompositor.getState();
		store.focusWindow(win.id);
		const rect = event.currentTarget.closest("[data-content]")?.getBoundingClientRect();
		const frameRect = event.currentTarget.closest("[data-window]")?.getBoundingClientRect();
		const geom = live[win.id] ?? {
			fx: win.fx,
			fy: win.fy,
			fw: win.fw,
			fh: win.fh
		};
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
			moved: false
		};
	};
	const beginResize = (event, win) => {
		event.preventDefault();
		event.stopPropagation();
		try {
			event.currentTarget.setPointerCapture(event.pointerId);
		} catch {}
		const rect = event.currentTarget.closest("[data-content]")?.getBoundingClientRect();
		const geom = live[win.id] ?? {
			fx: win.fx,
			fy: win.fy,
			fw: win.fw,
			fh: win.fh
		};
		dragRef.current = {
			mode: "resize",
			id: win.id,
			...geom,
			startX: event.clientX,
			startY: event.clientY,
			rectW: rect?.width || 1,
			rectH: rect?.height || 1
		};
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: frame,
		className: "relative h-full min-h-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: plan.scroll ? "flex h-full flex-col items-center gap-4 overflow-auto p-3" : "flex h-full items-center justify-center gap-4 p-3",
				children: outputs.map((output) => {
					const card = plan.cards.find((item) => item.id === output.id);
					if (!card) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutputView, {
						output,
						width: card.width,
						height: card.height,
						live,
						drop: dropOutput === output.id,
						flyId: fly?.id ?? null,
						onMove: beginMove,
						onResize: beginResize
					}, output.id);
				})
			}),
			ghost ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed z-50 rounded-md bg-accent px-3 py-2 text-xs font-medium text-ink",
				style: {
					left: ghost.px + 12,
					top: ghost.py + 12
				},
				children: ghost.title
			}) : null,
			fly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlyWindow, { fly }) : null
		]
	});
}
function FlyWindow({ fly }) {
	const windows = useCompositor((state) => state.windows);
	const outputs = useCompositor((state) => state.outputs);
	const win = windows.find((item) => item.id === fly.id);
	if (!win) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed z-50",
		style: {
			left: fly.left,
			top: fly.top,
			width: fly.width,
			height: fly.height
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowFrame, {
			win,
			focused: true,
			outputs,
			onMove: () => void 0,
			onResize: () => void 0,
			floating: false
		})
	});
}
function OutputView({ output, width, height, live, drop, flyId, onMove, onResize }) {
	const focusedOutputId = useCompositor((state) => state.focusedOutputId);
	const removeOutput = useCompositor((state) => state.removeOutput);
	const outputCount = useCompositor((state) => state.outputs.length);
	const focused = focusedOutputId === output.id;
	const scale = Number.isInteger(output.scale) ? `${output.scale}×` : `${output.scale.toFixed(1)}×`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "shrink-0",
		style: { width },
		"aria-label": output.connector,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex items-center gap-2 px-1 text-xs text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `orbit-vsync size-1.5 rounded-full ${focused ? "bg-accent" : "bg-faint"}` }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-fg",
					children: output.connector
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "truncate font-mono tabular-nums",
					children: [
						output.width,
						"×",
						output.height,
						" · ",
						scale,
						" · ",
						output.hz,
						" Hz"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-auto font-mono text-faint",
					children: ["x ", output.x]
				}),
				outputCount > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-elevated hover:text-fg",
					"aria-label": `Desligar ${output.connector}`,
					onClick: () => removeOutput(output.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-output": output.id,
			className: `overflow-hidden rounded-lg bg-inset ${drop || focused ? "ring-2 ring-accent" : "ring-1 ring-border"}`,
			style: { height },
			children: output.profile === "dsi" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneScreen, {
				output,
				onMove
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopScreen, {
				output,
				live,
				flyId,
				onMove,
				onResize
			})
		})]
	});
}
function DesktopScreen({ output, live, flyId, onMove, onResize }) {
	const scene = useCompositor();
	const group = windowsOn(scene, output.id);
	const shown = group.filter((win) => !win.minimized);
	const exclusive = shown.find((win) => win.fullscreen);
	const maximized = shown.find((win) => win.maximized);
	const solo = exclusive ?? maximized;
	const floatMode = scene.layout === "flutuante";
	const tiledAll = shown.filter((win) => !win.floating && !floatMode);
	const focusedTiled = tiledAll.find((win) => win.id === scene.focusedId) ?? tiledAll[0];
	const tiled = scene.layout === "monoculo" ? focusedTiled ? [focusedTiled] : [] : tiledAll;
	const floats = shown.filter((win) => win.floating || floatMode);
	const mode = shellOf(scene.shell, output.id);
	const covering = mode === "home" || mode === "loja" || mode === "lock";
	const desk = shown.length === 0 && group.some((win) => win.minimized);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [exclusive ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopBar, { output }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-content": true,
			"data-output": output.id,
			className: "orbit-wallpaper relative min-h-0 flex-1",
			onPointerDown: () => scene.focusOutput(output.id),
			children: [covering ? mode === "loja" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopStore, { outputId: output.id }) : mode === "lock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockScreen, { outputId: output.id }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopHome, { outputId: output.id }) : solo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: flyId === solo.id ? "pointer-events-none h-full opacity-0" : "h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowFrame, {
					win: solo,
					focused: true,
					outputs: scene.outputs,
					onMove,
					onResize,
					floating: false,
					flush: true,
					overlayChrome: Boolean(exclusive)
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-full min-h-0 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-h-0 flex-1",
					children: [tiled.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TiledGrid, {
						windows: tiled,
						layout: scene.layout,
						gaps: 0,
						ratio: scene.masterRatio,
						focusedId: scene.focusedId,
						outputs: scene.outputs,
						flyId,
						onMove
					}) : floats.length === 0 ? desk ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyOutput, { output }) : null, floats.map((win) => {
						const geom = live[win.id] ?? win;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `absolute ${flyId === win.id ? "pointer-events-none opacity-0" : ""}`,
							style: {
								left: `${geom.fx * 100}%`,
								top: `${geom.fy * 100}%`,
								width: `${geom.fw * 100}%`,
								height: `${geom.fh * 100}%`,
								zIndex: win.id === scene.focusedId ? 20 : 10
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowFrame, {
								win,
								focused: win.id === scene.focusedId,
								outputs: scene.outputs,
								onMove,
								onResize,
								floating: true
							})
						}, win.id);
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20 shrink-0" })]
			}), mode === "lock" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopDock, {
				outputId: output.id,
				peek: Boolean(solo)
			})]
		})]
	});
}
function TiledGrid({ windows, layout, gaps, ratio, focusedId, outputs, flyId, onMove }) {
	const count = windows.length;
	const grade = layout === "grade";
	const cols = grade ? Math.ceil(Math.sqrt(count)) : count === 1 ? 1 : 2;
	const rows = grade ? Math.ceil(count / cols) : count <= 1 ? 1 : count - 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid h-full",
		style: {
			padding: gaps,
			gap: gaps,
			gridTemplateColumns: grade ? `repeat(${cols}, minmax(0, 1fr))` : count === 1 ? "1fr" : `${ratio}fr ${1 - ratio}fr`,
			gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
		},
		children: windows.map((win, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `min-h-0 min-w-0 ${flyId === win.id ? "pointer-events-none opacity-0" : ""}`,
			style: !grade && count > 1 && index === 0 ? {
				gridColumn: 1,
				gridRow: `1 / span ${rows}`
			} : !grade && count > 1 ? { gridColumn: 2 } : void 0,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowFrame, {
				win,
				focused: win.id === focusedId,
				outputs,
				onMove,
				onResize: () => void 0,
				floating: false,
				flush: true
			})
		}, win.id))
	});
}
function PhoneScreen({ output, onMove }) {
	const scene = useCompositor();
	const group = windowsOn(scene, output.id);
	const primary = group.find((win) => win.id === scene.splitPrimaryId);
	const secondary = group.find((win) => win.id === scene.splitSecondaryId);
	const showSplit = Boolean(scene.split && primary && secondary);
	const focused = group.find((win) => win.id === scene.focusedId) ?? primary ?? group[0];
	const mode = shellOf(scene.shell, output.id);
	const covering = mode !== "session";
	const statusInFlow = (mode === "home" || mode === "lock" || mode === "apps" || mode === "loja") && !scene.overview;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-full flex-col bg-bg",
		"data-workspace": output.workspace,
		children: [
			statusInFlow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneStatus, {}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-content": true,
				"data-output": output.id,
				className: "orbit-wallpaper relative min-h-0 flex-1",
				children: [
					scene.overview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, { output }) : covering ? mode === "apps" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneApps, { outputId: output.id }) : mode === "loja" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopStore, { outputId: output.id }) : mode === "lock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockScreen, { outputId: output.id }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneHome, { outputId: output.id }) : showSplit && primary && secondary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex h-full min-h-0 flex-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-h-0",
								style: { flex: scene.splitRatio },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowFrame, {
									win: primary,
									focused: primary.id === scene.focusedId,
									outputs: scene.outputs,
									onMove,
									onResize: () => void 0,
									floating: false,
									bare: true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-h-0",
								style: { flex: 1 - scene.splitRatio },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowFrame, {
									win: secondary,
									focused: secondary.id === scene.focusedId,
									outputs: scene.outputs,
									onMove,
									onResize: () => void 0,
									floating: false,
									bare: true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitDivider, { ratio: scene.splitRatio })
						]
					}) : focused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowFrame, {
						win: focused,
						focused: true,
						outputs: scene.outputs,
						onMove,
						onResize: () => void 0,
						floating: false,
						bare: true
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyOutput, { output }),
					statusInFlow ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneStatus, {
						overlay: true,
						onDrag: !covering && !scene.overview && focused ? (event) => {
							if (event.pointerType === "touch") return;
							onMove(event, focused);
						} : void 0
					}),
					mode === "lock" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneHandle, { outputId: output.id }),
					covering && !scene.overview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneNav, { outputId: output.id }) : null
				]
			}),
			scene.keyboard && !scene.overview && !covering ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnScreenKeyboard, {}) : null
		]
	});
}
function SplitDivider({ ratio }) {
	const [dragging, setDragging] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "separator",
		"aria-orientation": "horizontal",
		"aria-label": "Ajustar divisão",
		"aria-valuemin": 28,
		"aria-valuemax": 72,
		"aria-valuenow": Math.round(ratio * 100),
		className: "absolute inset-x-0 z-20 flex h-11 -translate-y-1/2 cursor-row-resize touch-none items-center justify-center",
		style: { top: `${ratio * 100}%` },
		onPointerDown: (event) => {
			if (event.button !== 0) return;
			event.preventDefault();
			event.stopPropagation();
			const parent = event.currentTarget.parentElement;
			if (!parent) return;
			const rect = parent.getBoundingClientRect();
			setDragging(true);
			try {
				event.currentTarget.setPointerCapture(event.pointerId);
			} catch {}
			const move = (pointer) => {
				const next = clamp((pointer.clientY - rect.top) / Math.max(1, rect.height), .28, .72);
				useCompositor.getState().setSplitRatio(next);
			};
			const up = () => {
				setDragging(false);
				window.removeEventListener("pointermove", move);
				window.removeEventListener("pointerup", up);
			};
			window.addEventListener("pointermove", move);
			window.addEventListener("pointerup", up);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-px w-full ${dragging ? "bg-accent" : "bg-border"}` })
	});
}
function WindowButtons({ title, nested, maximized, fullscreen, onNest, onMaximize, onFull, onClose, onMinimize }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "ml-auto flex items-center text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"data-nodrag": true,
				"aria-label": `Minimizar ${title}`,
				className: "inline-flex size-8 items-center justify-center hover:text-fg",
				onClick: onMinimize,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"data-nodrag": true,
				"aria-label": `Aninhar ${title}`,
				"aria-pressed": nested,
				className: `inline-flex size-8 items-center justify-center hover:text-fg ${nested ? "text-accent" : ""}`,
				onClick: onNest,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Columns2, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"data-nodrag": true,
				"aria-label": maximized ? `Restaurar ${title}` : `Maximizar ${title}`,
				"aria-pressed": maximized,
				className: `inline-flex size-8 items-center justify-center hover:text-fg ${maximized ? "text-accent" : ""}`,
				onClick: onMaximize,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"data-nodrag": true,
				"aria-label": fullscreen ? `Sair do ecrã inteiro` : `Ecrã inteiro`,
				"aria-pressed": fullscreen,
				className: `inline-flex size-8 items-center justify-center hover:text-fg ${fullscreen ? "text-accent" : ""}`,
				onClick: onFull,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Expand, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"data-nodrag": true,
				"aria-label": `Fechar ${title}`,
				className: "inline-flex size-8 items-center justify-center hover:text-fg",
				onClick: onClose,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
			})
		]
	});
}
function WindowFrame({ win, focused, outputs, onMove, onResize, floating, flush = false, overlayChrome = false, bare = false }) {
	const focusWindow = useCompositor((state) => state.focusWindow);
	const pointSurface = useCompositor((state) => state.pointSurface);
	const close = useCompositor((state) => state.close);
	const toggleMaximized = useCompositor((state) => state.toggleMaximized);
	const toggleFullscreen = useCompositor((state) => state.toggleFullscreen);
	const layout = useCompositor((state) => state.layout);
	const phonePinned = useCompositor((state) => state.outputs.some((output) => output.profile === "dsi"));
	const nested = !win.floating && !win.fullscreen && !win.maximized && layout !== "flutuante" && layout !== "monoculo";
	const [chromeOn, setChromeOn] = (0, import_react.useState)(false);
	const kindOf = (event) => event.pointerType === "touch" ? "touch" : "mouse";
	const deliver = (event, phase) => {
		const surface = event.currentTarget;
		const rect = surface.getBoundingClientRect();
		if (rect.width < 1 || rect.height < 1) return;
		const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
		const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
		let hit = "";
		if (phase === "up") {
			const node = document.elementFromPoint(event.clientX, event.clientY);
			const marked = node instanceof Element ? node.closest("[data-hit]") : null;
			if (marked instanceof HTMLElement && surface.contains(marked) && marked.dataset.hit) hit = marked.dataset.hit;
		}
		pointSurface(win.id, x, y, phase, kindOf(event), hit || void 0);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		"data-window": win.id,
		onPointerDown: (event) => {
			if (!touchStaysOnPhone(useCompositor.getState().outputs, win.outputId, kindOf(event))) {
				event.stopPropagation();
				return;
			}
			focusWindow(win.id);
		},
		onPointerEnter: (event) => {
			if (!touchStaysOnPhone(useCompositor.getState().outputs, win.outputId, kindOf(event))) return;
			focusWindow(win.id, true);
		},
		className: `relative flex h-full min-h-0 flex-col overflow-hidden bg-elevated ${flush ? `rounded-none ${focused ? "shadow-[inset_0_0_0_1px_var(--color-accent)]" : "shadow-[inset_0_0_0_1px_var(--color-faint)]"}` : `rounded-xl ring-1 ${focused ? "ring-accent" : "ring-faint"}`}`,
		children: [
			bare ? null : overlayChrome ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 top-0 z-40",
				onPointerEnter: () => setChromeOn(true),
				onPointerLeave: () => setChromeOn(false),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: `absolute inset-x-0 top-0 flex h-10 items-center gap-2 border-b border-border bg-surface/95 px-3 transition-transform duration-200 ${chromeOn ? "translate-y-0" : "-translate-y-full"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppIcon, {
							app: win.app,
							className: "size-3.5 text-accent"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-xs text-fg",
							children: win.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowButtons, {
							title: win.title,
							nested: false,
							maximized: false,
							fullscreen: true,
							onMinimize: () => useCompositor.getState().minimizeWindow(win.id),
							onNest: () => useCompositor.getState().nestWindow(win.id),
							onMaximize: () => toggleMaximized(win.id),
							onFull: () => toggleFullscreen(win.id),
							onClose: () => close(win.id)
						})
					]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-10 shrink-0 cursor-grab select-none items-center gap-2 border-b border-border bg-surface px-3 active:cursor-grabbing",
				onPointerDown: (event) => {
					const kind = kindOf(event);
					if (!touchStaysOnPhone(useCompositor.getState().outputs, win.outputId, kind)) {
						event.stopPropagation();
						return;
					}
					if (kind === "touch" && phonePinned) return;
					onMove(event, win);
				},
				onDoubleClick: (event) => {
					if (event.target.closest("[data-nodrag]")) return;
					if (win.fullscreen) toggleFullscreen(win.id);
					else toggleMaximized(win.id);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppIcon, {
						app: win.app,
						className: "size-3.5 text-accent"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate text-xs text-fg",
						children: win.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowButtons, {
						title: win.title,
						nested,
						maximized: win.maximized,
						fullscreen: win.fullscreen,
						onMinimize: () => useCompositor.getState().minimizeWindow(win.id),
						onNest: () => useCompositor.getState().nestWindow(win.id),
						onMaximize: () => toggleMaximized(win.id),
						onFull: () => toggleFullscreen(win.id),
						onClose: () => close(win.id)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-surface": win.id,
				className: "relative min-h-0 flex-1",
				onPointerDown: (event) => {
					if (event.button !== 0) return;
					const kind = kindOf(event);
					if (!touchStaysOnPhone(useCompositor.getState().outputs, win.outputId, kind)) {
						event.stopPropagation();
						return;
					}
					const interactive = event.target.closest("button, a, input, textarea");
					deliver(event, "down");
					if (!interactive) try {
						event.currentTarget.setPointerCapture(event.pointerId);
					} catch {}
				},
				onPointerMove: (event) => {
					if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
					deliver(event, "move");
				},
				onPointerUp: (event) => {
					if (!touchStaysOnPhone(useCompositor.getState().outputs, win.outputId, kindOf(event))) return;
					const captured = event.currentTarget.hasPointerCapture(event.pointerId);
					deliver(event, "up");
					if (captured) try {
						event.currentTarget.releasePointerCapture(event.pointerId);
					} catch {}
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowBody, {
					win,
					outputs
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactMark, { windowId: win.id })]
			}),
			floating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"data-nodrag": true,
				"aria-label": "Redimensionar",
				className: "absolute bottom-1 right-1 size-4 cursor-nwse-resize rounded-sm bg-accent",
				onPointerDown: (event) => onResize(event, win)
			}) : null
		]
	});
}
function ContactMark({ windowId }) {
	const contact = useCompositor((state) => state.contact?.windowId === windowId ? state.contact : null);
	if (!contact) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `pointer-events-none absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-ink ${contact.down ? "bg-accent" : "bg-accent/50"}`,
		style: {
			left: `${contact.x * 100}%`,
			top: `${contact.y * 100}%`
		}
	});
}
function EmptyOutput({ output }) {
	const spawn = useCompositor((state) => state.spawn);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col items-center justify-center gap-3 px-4 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-fg",
				children: [
					"Espaço ",
					output.workspace,
					" vazio"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "max-w-xs text-xs text-pretty text-muted",
				children: [output.connector, " está à espera de um toplevel. O layout não inventa janelas."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "inline-flex h-10 items-center rounded-md bg-accent px-3 text-sm font-medium text-ink",
				onClick: () => spawn("terminal", output.id),
				children: "Abrir terminal"
			})
		]
	});
}
var PRESETS = [
	{
		id: "mesa",
		label: "Mesa"
	},
	{
		id: "celular",
		label: "Celular"
	},
	{
		id: "dock",
		label: "Doca"
	}
];
var LAYOUTS = [
	{
		id: "mestre",
		label: "Mestre",
		icon: Columns2
	},
	{
		id: "grade",
		label: "Grade",
		icon: LayoutGrid
	},
	{
		id: "monoculo",
		label: "Monóculo",
		icon: Square
	},
	{
		id: "flutuante",
		label: "Flutuar",
		icon: AppWindow
	}
];
function Studio() {
	const [sheet, setSheet] = (0, import_react.useState)(null);
	const [sourceOpen, setSourceOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (sourceOpen) return;
			const target = event.target;
			if (target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
			const store = useCompositor.getState();
			if (!event.altKey && !event.metaKey && !event.ctrlKey) {
				const win = store.windows.find((item) => item.id === store.focusedId);
				const host = win ? store.outputs.find((item) => item.id === win.outputId) : void 0;
				if (Boolean(win && host && win.workspace === host.workspace && (store.shell[host.id] ?? "session") === "session") && win && (win.app === "terminal" || win.app === "notas" || win.app === "editor")) {
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
				const win = id ? store.windows.find((item) => item.id === id) : void 0;
				const host = win ? store.outputs.find((output) => output.id === win.outputId) : void 0;
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
				const next = ordered[ordered.findIndex((output) => output.id === win.outputId) + (key === "ArrowRight" ? 1 : -1)];
				if (next) store.moveToOutput(win.id, next.id);
			} else if (key === "h" || key === "H") {
				event.preventDefault();
				store.setMasterRatio(Math.max(.4, Math.round((store.masterRatio - .02) * 100) / 100));
			} else if (key === "l" || key === "L") {
				event.preventDefault();
				store.setMasterRatio(Math.min(.7, Math.round((store.masterRatio + .02) * 100) / 100));
			} else if (key === "s" || key === "S") {
				event.preventDefault();
				store.toggleSplit();
			} else if (event.code === "Digit1" || event.code === "Digit2" || event.code === "Digit3" || event.code === "Digit4") {
				event.preventDefault();
				const workspace = Number(event.code.slice(5));
				if (event.shiftKey && store.focusedId) store.moveToWorkspace(store.focusedId, workspace);
				else store.setWorkspace(store.focusedOutputId, workspace);
			} else if (key === "Escape") store.setOverview(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [sourceOpen]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex shrink-0 items-center gap-3 border-b border-border px-3 py-2 md:px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-lg font-semibold leading-none tracking-tight",
							children: "Orbit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 hidden text-xs text-muted sm:block",
							children: "Orbit Composer · LUMNA"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresetSwitch, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "ml-auto hidden h-10 items-center gap-2 rounded-md bg-elevated px-3 text-sm text-fg md:inline-flex",
						onClick: () => setSourceOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
							className: "size-4 text-accent",
							"aria-hidden": "true"
						}), "Fontes"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden w-80 shrink-0 flex-col overflow-y-auto border-r border-border md:flex",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolicyPanel, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "min-w-0 flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "flex shrink-0 gap-2 border-t border-border p-2 md:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarButton, {
						label: "Novo",
						onClick: () => setSheet("novo")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarButton, {
						label: "Política",
						onClick: () => setSheet("politica")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarButton, {
						label: "Protocolo",
						onClick: () => setSheet("protocolo")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarButton, {
						label: "Fontes",
						onClick: () => setSourceOpen(true)
					})
				]
			}),
			sheet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-30 flex flex-col justify-end bg-ink/40 md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Fechar painel",
					className: "min-h-12 flex-1",
					onClick: () => setSheet(null)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[75dvh] overflow-y-auto rounded-t-xl border border-border bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-base font-semibold",
								children: sheet === "novo" ? "Novo cliente" : sheet === "politica" ? "Política" : "Protocolo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Fechar",
								className: "inline-flex size-11 items-center justify-center rounded-md text-muted",
								onClick: () => setSheet(null),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}),
						sheet === "novo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpawnGrid, { onSpawn: () => setSheet(null) }) : null,
						sheet === "politica" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolicyControls, {}) : null,
						sheet === "protocolo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtocolBlock, {}) : null
					]
				})]
			}) : null,
			sourceOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceDrawer, { onClose: () => setSourceOpen(false) }) : null
		]
	});
}
function BarButton({ label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "h-12 flex-1 rounded-md bg-elevated text-sm font-medium text-fg",
		children: label
	});
}
function PresetSwitch() {
	const preset = useCompositor((state) => state.preset);
	const setPreset = useCompositor((state) => state.setPreset);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex rounded-md bg-inset p-1",
		role: "tablist",
		"aria-label": "Cenário",
		children: PRESETS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			role: "tab",
			"aria-selected": preset === item.id,
			onClick: () => setPreset(item.id),
			className: `inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm md:px-3 ${preset === item.id ? "bg-accent text-ink" : "text-muted hover:text-fg"}`,
			children: [item.id === "mesa" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Laptop, {
				className: "size-4",
				"aria-hidden": "true"
			}) : item.id === "celular" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
				className: "size-4",
				"aria-hidden": "true"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, {
				className: "size-4",
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label })]
		}, item.id))
	});
}
function PolicyPanel() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-pretty text-muted",
				children: "Arrasta a barra de uma janela para outra saída. Alt+Enter abre um terminal. A doca junta o telemóvel a um monitor."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arrangement, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolicyControls, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-xs font-medium tracking-wide text-faint",
				children: "Clientes"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpawnGrid, {})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtocolBlock, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShortcutList, {})
		]
	});
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-xs font-medium tracking-wide text-faint",
				children: "Mosaico"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2",
				children: LAYOUTS.map((item) => {
					const Icon = item.icon;
					const active = layout === item.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": active,
						onClick: () => setLayout(item.id),
						className: `inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm ${active ? "bg-accent text-ink" : "bg-elevated text-fg"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-4",
							"aria-hidden": "true"
						}), item.label]
					}, item.id);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex justify-between text-muted",
					children: ["Intervalos ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular-nums text-fg",
						children: gaps
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 0,
					max: 20,
					step: 2,
					value: gaps,
					onChange: (event) => setGaps(Number(event.target.value)),
					style: { accentColor: "var(--color-accent)" }
				})]
			}),
			layout === "mestre" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex justify-between text-muted",
					children: ["Mestre ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono tabular-nums text-fg",
						children: [Math.round(masterRatio * 100), "%"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 40,
					max: 70,
					step: 1,
					value: Math.round(masterRatio * 100),
					onChange: (event) => setMasterRatio(Number(event.target.value) / 100),
					style: { accentColor: "var(--color-accent)" }
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-pressed": focusFollows,
				onClick: () => setFocusFollows(!focusFollows),
				className: "flex h-11 items-center justify-between rounded-md bg-elevated px-3 text-sm",
				children: ["Foco segue o ponteiro", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: focusFollows ? "font-mono text-accent" : "font-mono text-faint",
					children: focusFollows ? "on" : "off"
				})]
			}),
			preset !== "celular" && !outputs.some((output) => output.id === "hdmi") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: addPortrait,
				className: "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-elevated text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
					className: "size-4 text-accent",
					"aria-hidden": "true"
				}), "Ligar HDMI retrato"]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: reset,
				className: "h-11 rounded-md text-sm text-muted hover:text-fg",
				children: "Repor cena"
			})
		]
	});
}
function SpawnGrid({ onSpawn }) {
	const spawn = useCompositor((state) => state.spawn);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2",
		children: APPS.map((app) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => {
				spawn(app.id);
				onSpawn?.();
			},
			className: "inline-flex h-11 items-center gap-2 rounded-md bg-elevated px-3 text-left text-sm text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppIcon, {
				app: app.id,
				className: "size-4 text-accent"
			}), app.label]
		}, app.id))
	});
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "mb-2 text-xs font-medium tracking-wide text-faint",
		children: "Layout das saídas"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative h-28 rounded-md bg-inset",
		children: outputs.map((output) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => focusOutput(output.id),
			className: `absolute flex items-center justify-center overflow-hidden rounded-sm px-1 font-mono text-xs ${output.id === focusedOutputId ? "bg-accent text-ink" : "bg-elevated text-fg"}`,
			style: {
				left: `${(output.x - minX) / width * 100}%`,
				top: `${(output.y - minY) / height * 100}%`,
				width: `${output.width / width * 100}%`,
				height: `${output.height / height * 100}%`
			},
			children: output.connector
		}, output.id))
	})] });
}
function ProtocolBlock() {
	const events = useCompositor((state) => state.events);
	const outputs = useCompositor((state) => state.outputs);
	const preset = useCompositor((state) => state.preset);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-1 text-xs font-medium tracking-wide text-faint",
			children: "Protocolo"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-2 font-mono text-xs text-muted",
			children: [
				"seat0 · ",
				preset === "celular" ? "touch keyboard" : preset === "dock" ? "pointer keyboard touch" : "pointer keyboard",
				" · ",
				outputs.length,
				" ",
				outputs.length === 1 ? "saída" : "saídas"
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtocolLog, { events })
	] });
}
function ProtocolLog({ events }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "flex max-h-44 flex-col gap-1.5 overflow-auto font-mono text-xs",
		children: events.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "leading-snug",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-accent",
					children: event.iface
				}),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: event.msg
				})
			]
		}, event.id))
	});
}
function ShortcutList() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-2 text-xs font-medium tracking-wide text-faint",
			children: "Atalhos"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-1 text-xs",
			children: [
				["Alt+Enter", "terminal"],
				["Alt+Q", "fechar"],
				["Alt+M", "maximizar"],
				["Alt+F", "ecrã inteiro"],
				["Alt+Espaço", "flutuar"],
				["Alt+1–4", "espaço"],
				["Alt+Shift+1–4", "mover"],
				["Alt+J/K", "focar"],
				["Alt+H/L", "mestre"],
				["Alt+←/→", "outra saída"]
			].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex justify-between gap-3 text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-fg",
					children: key
				}), label]
			}, key))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-xs text-pretty text-faint",
			children: [
				"Espaços ",
				WORKSPACES.join(" "),
				" são por saída. Um espaço vazio larga o teclado — não escreve na janela que ficou no espaço anterior. No telemóvel os números mudam de espaço, e a vista geral abre a janela no espaço dela. Dividir fixa o par: o foco anda entre os dois sem os trocar, e a costura entre eles é fina. Qualquer saída, menos a última, desliga-se: as janelas passam para a que fica, no espaço activo, sem ecrã inteiro. No terminal, nas notas e no editor escreve à vontade — Enter no terminal aceita ajuda, outputs e clientes."
			]
		})
	] });
}
function SourceDrawer({ onClose }) {
	const [active, setActive] = (0, import_react.useState)(SOURCES[0]?.name ?? "");
	const [copied, setCopied] = (0, import_react.useState)(false);
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
		const blob = new Blob([SOURCES.map((item) => `/* === ${item.name} === */\n${item.body}`).join("\n\n")], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "orbit-composer.txt";
		link.click();
		URL.revokeObjectURL(url);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-40 flex flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 border-b border-border px-3 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold",
					children: "Fontes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1 overflow-auto",
					children: SOURCES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": item.name === file?.name,
						onClick: () => setActive(item.name),
						className: `h-10 shrink-0 rounded-md px-3 font-mono text-xs ${item.name === file?.name ? "bg-accent text-ink" : "bg-elevated text-fg"}`,
						children: item.name
					}, item.name))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: copy,
							className: "inline-flex h-10 items-center gap-2 rounded-md bg-elevated px-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
								className: "size-4",
								"aria-hidden": "true"
							}), copied ? "Copiado" : "Copiar"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: download,
							className: "hidden h-10 rounded-md bg-elevated px-3 text-sm sm:inline-flex sm:items-center",
							children: "Descarregar"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Fechar fontes",
							onClick: onClose,
							className: "inline-flex size-10 items-center justify-center rounded-md bg-elevated",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-fg",
			children: file?.body
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Studio, {});
}
//#endregion
export { Home as component };
