import { spawn } from "node:child_process";
import open from "open";

const child = spawn("next dev", {
  stdio: ["inherit", "pipe", "inherit"],
  shell: true,
  env: { ...process.env, FORCE_COLOR: "1" },
});

let opened = false;

child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);

  if (!opened) {
    const match = text.match(/Local:\s+(http:\/\/localhost:\d+)/);
    if (match) {
      opened = true;
      open(match[1]).catch(() => {});
    }
  }
});

child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
