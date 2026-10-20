import readme from "./orbit/leiame.txt?raw";
import makefile from "./orbit/makefile.txt?raw";
import sample from "./orbit/orbit.ini?raw";
import header from "./orbit/orbit.h?raw";
import server from "./orbit/server.c?raw";
import output from "./orbit/output.c?raw";
import view from "./orbit/view.c?raw";
import arrange from "./orbit/arrange.c?raw";
import layer from "./orbit/layer.c?raw";
import config from "./orbit/config.c?raw";
import foreign from "./orbit/foreign.c?raw";
import lock from "./orbit/lock.c?raw";
import manage from "./orbit/manage.c?raw";
import anim from "./orbit/anim.c?raw";
import input from "./orbit/input.c?raw";
import touch from "./orbit/touch.c?raw";
import im from "./orbit/im.c?raw";
import ipc from "./orbit/ipc.c?raw";
import orbitMsg from "./orbit/orbit-msg.c?raw";
import keybinds from "./orbit/keybinds.c?raw";

export interface SourceFile {
  name: string;
  body: string;
}

export const SOURCES: SourceFile[] = [
  { name: "LEIA-ME", body: readme },
  { name: "Makefile", body: makefile },
  { name: "orbit.ini", body: sample },
  { name: "orbit.h", body: header },
  { name: "server.c", body: server },
  { name: "output.c", body: output },
  { name: "view.c", body: view },
  { name: "arrange.c", body: arrange },
  { name: "layer.c", body: layer },
  { name: "config.c", body: config },
  { name: "foreign.c", body: foreign },
  { name: "lock.c", body: lock },
  { name: "manage.c", body: manage },
  { name: "anim.c", body: anim },
  { name: "input.c", body: input },
  { name: "touch.c", body: touch },
  { name: "im.c", body: im },
  { name: "ipc.c", body: ipc },
  { name: "orbit-msg.c", body: orbitMsg },
  { name: "keybinds.c", body: keybinds },
];
