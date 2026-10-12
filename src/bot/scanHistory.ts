import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import readline from "readline";

dotenv.config();

const API_ID = Number(process.env.TELEGRAM_API_ID);
const API_HASH = process.env.TELEGRAM_API_HASH || "";
const TARGET_CHAT = process.env.TELEGRAM_CHANNEL_ID || "";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string): Promise<string> =>
  new Promise((resolve) => rl.question(query, resolve));

const STYLE_KEYWORDS = [
  "neon", "cyberpunk", "cinematic", "photorealistic", "anime", "vintage",
  "8k", "ultra-detailed", "fantasy", "dark fantasy", "pastel", "vaporwave",
  "hyperdetailed", "unreal engine", "octane render", "studio lighting",
  "minimalist", "watercolor", "cyber", "glow", "hdr", "bokeh", "portrait"
];

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
  const matched = STYLE_KEYWORDS.filter(k => words.includes(k) || text.toLowerCase().includes(k));
  if (matched.length === 0) {
    return words.filter(w => w.length > 3 && !["this", "that", "with", "from", "have"].includes(w)).slice(0, 3);
  }
  return matched;
}

// Session string stored locally so you only log in once
const SESSION_FILE = path.join(process.cwd(), ".telegram_session");
const savedSession = fs.existsSync(SESSION_FILE) ? fs.readFileSync(SESSION_FILE, "utf-8").trim() : "";

async function scanPastHistory() {
  if (!API_ID || !API_HASH) {
    console.log("❌ TELEGRAM_API_ID and TELEGRAM_API_HASH missing in .env");
    return;
  }

  const client = new TelegramClient(new StringSession(savedSession), API_ID, API_HASH, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await askQuestion("📱 Please enter your Telegram phone number (+91...): "),
    password: async () => await askQuestion("🔑 Please enter your 2FA password (if enabled): "),
    phoneCode: async () => await askQuestion("📩 Please enter the code sent to your Telegram app: "),
    onError: (err) => console.log(err),
  });

  // Save session for future runs
  fs.writeFileSync(SESSION_FILE, client.session.save() as unknown as string);
  console.log("✅ Authenticated successfully with Telegram!");
  console.log(`🔍 Scanning past messages & photos from chat: ${TARGET_CHAT}...`);

  try {
    const messages = await client.getMessages(TARGET_CHAT, {
      limit: 100,
    });

    const learnedCues: { caption: string; keywords: string[]; date: string }[] = [];

    for (const message of messages) {
      if (message.media && message.media.className === "MessageMediaPhoto") {
        const caption = message.message || "group photo aesthetic";
        const keywords = extractKeywords(caption);
        learnedCues.push({
          caption: caption.slice(0, 80),
          keywords,
          date: new Date((message.date || 0) * 1000).toISOString(),
        });
      }
    }

    console.log(`🎉 Found & Analyzed ${learnedCues.length} past photos from history!`);
    console.log("💾 Zero-Storage Applied: No raw image files downloaded to your disk.");

    // Save learned style metadata profile (pure text tokens, < 10 KB)
    const profilePath = path.join(process.cwd(), "learned_style_profile.json");
    fs.writeFileSync(profilePath, JSON.stringify(learnedCues.slice(0, 50), null, 2));

    console.log(`✨ Style profile saved to ${profilePath} (Size: ${(fs.statSync(profilePath).size / 1024).toFixed(2)} KB)`);
  } catch (err: any) {
    console.error("Error retrieving messages:", err.message);
  } finally {
    rl.close();
    await client.disconnect();
  }
}

scanPastHistory().catch(console.error);
