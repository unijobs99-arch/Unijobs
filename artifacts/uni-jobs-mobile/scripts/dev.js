const { spawn } = require("node:child_process");

const env = { ...process.env };

if (!env.EXPO_PUBLIC_DOMAIN && env.REPLIT_DEV_DOMAIN) {
  env.EXPO_PUBLIC_DOMAIN = env.REPLIT_DEV_DOMAIN;
}

if (!env.REACT_NATIVE_PACKAGER_HOSTNAME && env.REPLIT_DEV_DOMAIN) {
  env.REACT_NATIVE_PACKAGER_HOSTNAME = env.REPLIT_DEV_DOMAIN;
}

if (!env.EXPO_PUBLIC_REPL_ID && env.REPL_ID) {
  env.EXPO_PUBLIC_REPL_ID = env.REPL_ID;
}

if (!env.EXPO_PACKAGER_PROXY_URL && env.REPLIT_EXPO_DEV_DOMAIN) {
  env.EXPO_PACKAGER_PROXY_URL = `https://${env.REPLIT_EXPO_DEV_DOMAIN}`;
}

const port = env.PORT || "8081";
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const child = spawn(
  pnpm,
  ["exec", "expo", "start", "--localhost", "--port", port],
  { stdio: "inherit", env },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
