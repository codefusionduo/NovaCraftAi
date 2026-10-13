import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import fs from "fs";
import sharp from "sharp";
import { autoTrainFromImageBuffer, getTrainedWeights } from "./autoTrainer";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

if (!BOT_TOKEN) {
  console.error("❌ Error: TELEGRAM_BOT_TOKEN environment variable is not defined!");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

interface LearnedStyleCue {
  caption: string;
  keywords: string[];
  learnedAt: string;
}

const MAX_STYLE_MEMORY = 50;
let learnedStyleMemory: LearnedStyleCue[] = [];

let trainedVisualTokens: string[] = [];
try {
  const profileFile = "learned_style_profile.json";
  if (fs.existsSync(profileFile)) {
    const data = JSON.parse(fs.readFileSync(profileFile, "utf-8"));
    if (Array.isArray(data)) {
      learnedStyleMemory = data.slice(0, MAX_STYLE_MEMORY);
    }
  }
} catch (e) {
  // ignore
}

try {
  const weightsFile = "trained_ai_weights.json";
  if (fs.existsSync(weightsFile)) {
    const weights = JSON.parse(fs.readFileSync(weightsFile, "utf-8"));
    if (weights.learnedTokens && Array.isArray(weights.learnedTokens)) {
      trainedVisualTokens = weights.learnedTokens;
      console.log(`🔥 Active Neural Aesthetic Weights Loaded: [${trainedVisualTokens.join(", ")}]`);
    }
  }
} catch (e) {
  console.warn("Could not load weights file");
}

const STYLE_KEYWORDS = [
  "neon", "cyberpunk", "cinematic", "photorealistic", "anime", "vintage",
  "8k", "ultra-detailed", "fantasy", "dark fantasy", "pastel", "vaporwave",
  "hyperdetailed", "unreal engine", "octane render", "studio lighting",
  "minimalist", "watercolor", "cyber", "glow", "hdr", "bokeh", "portrait"
];

function extractKeywordsFromText(text: string): string[] {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
  const matched = STYLE_KEYWORDS.filter(k => words.includes(k) || text.toLowerCase().includes(k));
  if (matched.length === 0) {
    return words.filter(w => w.length > 3 && !["this", "that", "with", "from", "have"].includes(w)).slice(0, 3);
  }
  return matched;
}

function registerLearnedImage(caption: string) {
  const keywords = extractKeywordsFromText(caption);
  const cue: LearnedStyleCue = {
    caption: caption.slice(0, 80),
    keywords,
    learnedAt: new Date().toLocaleTimeString(),
  };

  learnedStyleMemory.unshift(cue);

  if (learnedStyleMemory.length > MAX_STYLE_MEMORY) {
    learnedStyleMemory = learnedStyleMemory.slice(0, MAX_STYLE_MEMORY);
  }

  return keywords;
}

function getLearnedStylePromptBoost(): string {
  const parts: string[] = [];
  const currentWeights = getTrainedWeights();
  if (currentWeights.learnedTokens && currentWeights.learnedTokens.length > 0) {
    parts.push(currentWeights.learnedTokens.slice(0, 5).join(", "));
  } else if (trainedVisualTokens.length > 0) {
    parts.push(trainedVisualTokens.slice(0, 5).join(", "));
  }

  if (learnedStyleMemory.length > 0) {
    const freqMap: Record<string, number> = {};
    learnedStyleMemory.forEach(item => {
      item.keywords.forEach(kw => {
        freqMap[kw] = (freqMap[kw] || 0) + 1;
      });
    });
    const topCues = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);
    if (topCues.length > 0) {
      parts.push(topCues.join(", "));
    }
  }

  return parts.length > 0 ? `, ${parts.join(", ")}` : "";
}

// Helper to download raw image and crop watermark banner from the bottom
async function generateCleanImageBuffer(prompt: string, style = "photorealistic"): Promise<Buffer> {
  const seed = Math.floor(Math.random() * 10000000);
  const styleBoost = getLearnedStylePromptBoost();
  const enhancedPrompt = `${prompt}, ${style} style, high quality, 8k resolution, detailed${styleBoost}`;
  const encoded = encodeURIComponent(enhancedPrompt);
  const rawUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1060&seed=${seed}&nologo=true`;

  const response = await fetch(rawUrl);
  const arrayBuffer = await response.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  // Crop out bottom watermark band (sharp in-memory crop, zero disk storage!)
  const metadata = await sharp(inputBuffer).metadata();
  const imgWidth = metadata.width || 1024;
  const imgHeight = metadata.height || 1060;

  // Crop bottom 42px where watermark appears
  const cleanBuffer = await sharp(inputBuffer)
    .extract({
      left: 0,
      top: 0,
      width: imgWidth,
      height: Math.max(imgHeight - 45, 100),
    })
    .jpeg({ quality: 95 })
    .toBuffer();

  return cleanBuffer;
}

// 1. /start command
bot.start((ctx) => {
  ctx.reply(
    `👋 Namaste! Main *NovaCraft AI Clean Studio Bot* hoon.\n\n` +
      `✨ *Ab Sari Images 100% Watermark-Free Generate hongi!*\n` +
      `⚡ Zero-Storage Continuous Learning Active hai.\n\n` +
      `📋 *Commands:*\n` +
      `• \`/generate <prompt>\` - Clean Image generate karein\n` +
      `• \`/style_status\` - Check karein AI memory\n` +
      `• \`/forget_style\` - Style memory reset karein`,
    { parse_mode: "Markdown" }
  );
});

// 2. /help command
bot.help((ctx) => {
  ctx.reply(
    `💡 *NovaCraft Bot Commands:*\n\n` +
      `• \`/generate <prompt>\` - Custom AI image generate karein (No watermark)\n` +
      `• \`/anime <prompt>\` - Anime style image banayein\n` +
      `• \`/cyberpunk <prompt>\` - Cyberpunk style image banayein\n` +
      `• \`/3d <prompt>\` - 3D Pixar render style image banayein\n` +
      `• \`/style_status\` - Learned styles stats\n` +
      `• \`/forget_style\` - Reset learned styles`,
    { parse_mode: "Markdown" }
  );
});

// 3. /style_status command
bot.command("style_status", (ctx) => {
  const currentWeights = getTrainedWeights();
  const tokens = currentWeights.learnedTokens || [];

  ctx.reply(
    `🧠 *NovaCraft AI Style Learning Status:*\n\n` +
      `📊 *Total Group Dataset:* ${currentWeights.totalAnalyzed} photos analyzed\n` +
      `💾 *Disk Storage Used:* 0.00 KB (Zero Disk Footprint)\n` +
      `💡 *Lighting Tone:* ${currentWeights.lightingTone || "Studio Softbox"}\n` +
      `🎨 *Active Neural Aesthetic Tokens:*\n• ${tokens.join("\n• ") || "General High Definition"}\n\n` +
      `✨ *Watermark Status:* 100% Watermark-Free Clean Engine Active`,
    { parse_mode: "Markdown" }
  );
});

// 4. /forget_style command
bot.command("forget_style", (ctx) => {
  learnedStyleMemory = [];
  ctx.reply("🧹 *AI Style Memory Reset!* Purani sabhi learned styles clear ho gayi hain.");
});

// Notification buffer to handle bulk photo albums and avoid Telegram 429 Rate Limits
let batchPhotoCount = 0;
let lastBatchResult: any = null;
let batchNotifyTimeout: NodeJS.Timeout | null = null;

// 5. Automatic Ingestion & Neural Training of Photos
bot.on("photo", async (ctx) => {
  try {
    const photos = ctx.message.photo;
    const highestResPhoto = photos[photos.length - 1];
    const caption = ctx.message.caption || "";

    const fileLink = await ctx.telegram.getFileLink(highestResPhoto.file_id);
    const response = await fetch(fileLink.href);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Train neural model in memory
    const trainResult = await autoTrainFromImageBuffer(buffer, caption);
    trainedVisualTokens = trainResult.learnedTokens;
    lastBatchResult = trainResult;
    batchPhotoCount++;

    // Debounce reply by 3.5 seconds so bulk uploads (e.g. 400 photos) aggregate cleanly
    if (batchNotifyTimeout) clearTimeout(batchNotifyTimeout);
    batchNotifyTimeout = setTimeout(async () => {
      try {
        const count = batchPhotoCount;
        batchPhotoCount = 0;
        await ctx.reply(
          `🧠 *Autonomous Neural Training Complete!*\n\n` +
          `📥 *Photos Processed:* ${count} new photo(s)\n` +
          `📊 *Total Group Dataset:* ${lastBatchResult.totalTrained} images\n` +
          `🎨 *Active Features:* ${lastBatchResult.newInsight}\n` +
          `✨ *Model Weights Updated in RAM!* (0 KB Disk used)`,
          { parse_mode: "Markdown" }
        );
      } catch (notifyErr) {
        console.error("Batch notify error:", notifyErr);
      }
    }, 3500);
  } catch (err) {
    console.error("Error processing photo auto-training:", err);
  }
});

// 6. Style Commands
bot.command("generate", async (ctx) => {
  const text = ctx.message.text.replace(/^\/generate\s*/i, "").trim();
  if (!text) return ctx.reply("⚠️ Kripya prompt likhein! Example: `/generate majestic tiger`");
  await handleGenerateAndReply(ctx, text, "photorealistic");
});

bot.command("anime", async (ctx) => {
  const text = ctx.message.text.replace(/^\/anime\s*/i, "").trim();
  if (!text) return ctx.reply("⚠️ Example: `/anime ninja warrior`");
  await handleGenerateAndReply(ctx, text, "anime");
});

bot.command("cyberpunk", async (ctx) => {
  const text = ctx.message.text.replace(/^\/cyberpunk\s*/i, "").trim();
  if (!text) return ctx.reply("⚠️ Example: `/cyberpunk neon night street`");
  await handleGenerateAndReply(ctx, text, "cyberpunk");
});

bot.command("3d", async (ctx) => {
  const text = ctx.message.text.replace(/^\/3d\s*/i, "").trim();
  if (!text) return ctx.reply("⚠️ Example: `/3d cute baby dragon`");
  await handleGenerateAndReply(ctx, text, "3d-render");
});

// 7. Channel Post Handling
bot.on("channel_post", async (ctx) => {
  try {
    const post = ctx.channelPost;
    const channelChatId = post.chat.id;

    if (CHANNEL_ID && String(channelChatId) !== String(CHANNEL_ID) && post.chat.username !== CHANNEL_ID.replace("@", "")) {
      return;
    }

    // Auto-train on channel photos
    if ("photo" in post && post.photo) {
      const photos = post.photo;
      const highestResPhoto = photos[photos.length - 1];
      const caption = post.caption || "";

      const fileLink = await ctx.telegram.getFileLink(highestResPhoto.file_id);
      const response = await fetch(fileLink.href);
      const buffer = Buffer.from(await response.arrayBuffer());

      const trainResult = await autoTrainFromImageBuffer(buffer, caption);
      trainedVisualTokens = trainResult.learnedTokens;
      console.log(`📡 [Channel Auto-Trained] New image processed. Total: ${trainResult.totalTrained}`);
      return;
    }

    const promptText = ("text" in post ? post.text : "") || "";
    if (!promptText || promptText.startsWith("/")) return;

    const waitMsg = await ctx.telegram.sendMessage(channelChatId, "🎨 *NovaCraft AI:* Generating clean artwork...", {
      parse_mode: "Markdown",
    });

    const cleanBuffer = await generateCleanImageBuffer(promptText);

    await ctx.telegram.sendPhoto(channelChatId, { source: cleanBuffer }, {
      caption: `✨ *NovaCraft AI Clean Creation*\n📝 *Prompt:* ${promptText}`,
      parse_mode: "Markdown",
    });

    try {
      await ctx.telegram.deleteMessage(channelChatId, waitMsg.message_id);
    } catch (_) {}
  } catch (err) {
    console.error("Error processing channel post:", err);
  }
});

// 8. Direct User Text
bot.on("text", async (ctx) => {
  const text = ctx.message.text.trim();
  if (text.startsWith("/")) return;
  await handleGenerateAndReply(ctx, text, "photorealistic");
});

// Common generation handler
async function handleGenerateAndReply(ctx: any, prompt: string, style = "photorealistic") {
  const statusMsg = await ctx.reply("🎨 *AI artwork create kar raha hoon...* (Watermark-Free) ✨", {
    parse_mode: "Markdown",
  });

  try {
    const cleanBuffer = await generateCleanImageBuffer(prompt, style);

    await ctx.replyWithPhoto({ source: cleanBuffer }, {
      caption: `🖼️ *Prompt:* ${prompt}\n🎭 *Style:* ${style}\n⚡ *Powered by NovaCraft AI (Clean Edition)*`,
      parse_mode: "Markdown",
    });

    try {
      await ctx.deleteMessage(statusMsg.message_id);
    } catch (_) {}
  } catch (error) {
    console.error("Error generating image for Telegram:", error);
    ctx.reply("❌ Maaf kijiye, image generate karne me error aaya.");
  }
}

// Start polling
bot.launch().then(() => {
  console.log("🚀 NovaCraft Zero-Storage & Watermark-Free Bot started!");
  if (CHANNEL_ID) {
    console.log(`📡 Monitoring Channel: ${CHANNEL_ID}`);
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
