import readme from "./orbit/leiame.txt?raw";
import makefile from "./orbit/makefile.txt?raw";
import header from "./orbit/orbit.h?raw";
import server from "./orbit/server.c?raw";
import output from "./orbit/output.c?raw";
import view from "./orbit/view.c?raw";
import arrange from "./orbit/arrange.c?raw";
import input from "./orbit/input.c?raw";
import keybinds from "./orbit/keybinds.c?raw";

export interface SourceFile {
  name: string;
  body: string;
}

export const SOURCES: SourceFile[] = [
  { name: "LEIA-ME", body: readme },
  { name: "Makefile", body: makefile },
  { name: "orbit.h", body: header },
  { name: "server.c", body: server },
  { name: "output.c", body: output },
  { name: "view.c", body: view },
  { name: "arrange.c", body: arrange },
  { name: "input.c", body: input },
  { name: "keybinds.c", body: keybinds },
];
