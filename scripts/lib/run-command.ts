import { execFileSync, spawn } from "node:child_process";

function shouldUseCmdWrapper(command: string) {
  return process.platform === "win32" && /\.(cmd|bat)$/i.test(command);
}

function quoteForCmd(value: string) {
  if (!/[\s"&()^%!<>|]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}

function getWindowsCommandInvocation(command: string, args: string[]) {
  return {
    command: "cmd.exe",
    args: ["/d", "/s", "/c", [quoteForCmd(command), ...args.map(quoteForCmd)].join(" ")],
  };
}

export function runCommand(command: string, args: string[], options?: { stdio?: "inherit" }) {
  if (shouldUseCmdWrapper(command)) {
    const invocation = getWindowsCommandInvocation(command, args);

    execFileSync(invocation.command, invocation.args, {
      cwd: process.cwd(),
      stdio: options?.stdio ?? "inherit",
      env: process.env,
    });

    return;
  }

  execFileSync(command, args, {
    cwd: process.cwd(),
    stdio: options?.stdio ?? "inherit",
    env: process.env,
  });
}

export function spawnLongRunningProcess(command: string, args: string[]) {
  if (shouldUseCmdWrapper(command)) {
    const invocation = getWindowsCommandInvocation(command, args);

    return spawn(invocation.command, invocation.args, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env,
    });
  }

  return spawn(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });
}

export function getNpxCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}
