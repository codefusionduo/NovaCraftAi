import { spawn } from "child_process";

console.log("🚀 Starting NovaCraft AI Studio (Next.js) & Telegram Bot concurrently...");

// Start Telegram Bot
const botProcess = spawn("npx", ["tsx", "src/bot/telegramBot.ts"], {
  stdio: "inherit",
  shell: true,
});

botProcess.on("exit", (code) => {
  console.log(`Telegram Bot process exited with code ${code}`);
});

// Start Next.js Server (binds to Render PORT or default 3000)
const port = process.env.PORT || "3000";
const nextProcess = spawn("npx", ["next", "start", "-p", port], {
  stdio: "inherit",
  shell: true,
});

nextProcess.on("exit", (code) => {
  console.log(`Next.js server exited with code ${code}`);
});

process.on("SIGINT", () => {
  botProcess.kill();
  nextProcess.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  botProcess.kill();
  nextProcess.kill();
  process.exit(0);
});
