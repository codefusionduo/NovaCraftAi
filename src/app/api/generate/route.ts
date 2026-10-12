import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      style = "photorealistic",
      aspectRatio = "1:1",
      negativePrompt = "",
      numImages = 1,
      quality = "hd",
      postToTelegram = false,
    } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Determine dimensions based on aspect ratio
    let width = 1024;
    let height = 1024;
    if (aspectRatio === "16:9") {
      width = 1280;
      height = 720;
    } else if (aspectRatio === "9:16") {
      width = 720;
      height = 1280;
    } else if (aspectRatio === "4:3") {
      width = 1024;
      height = 768;
    } else if (aspectRatio === "3:4") {
      width = 768;
      height = 1024;
    }

    const enhancedPrompt = `${prompt}, ${style} style, high resolution, detailed, ${
      quality === "hd" ? "ultra-detailed, 8k" : "standard quality"
    }${negativePrompt ? `, avoid: ${negativePrompt}` : ""}`;

    const seed = Math.floor(Math.random() * 10000000);
    const images: { id: string; url: string; prompt: string; style: string; aspectRatio: string; createdAt: string }[] = [];

    // Generate image URLs
    const count = Math.min(Math.max(Number(numImages) || 1, 1), 4);
    for (let i = 0; i < count; i++) {
      const currentSeed = seed + i * 42;
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${currentSeed}&nologo=true&enhance=true`;

      images.push({
        id: `img-${Date.now()}-${i}`,
        url: imageUrl,
        prompt,
        style,
        aspectRatio,
        createdAt: new Date().toISOString(),
      });
    }

    // Auto-post to Telegram Channel if enabled
    if (postToTelegram && process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID && images.length > 0) {
      try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const channelId = process.env.TELEGRAM_CHANNEL_ID;
        const firstImg = images[0];

        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
        await fetch(telegramApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: channelId,
            photo: firstImg.url,
            caption: `✨ *NovaCraft Web Studio Creation*\n📝 *Prompt:* ${prompt}\n🎭 *Style:* ${style}\n📐 *Ratio:* ${aspectRatio}`,
            parse_mode: "Markdown",
          }),
        });
      } catch (tgError) {
        console.error("Failed to sync to Telegram channel:", tgError);
      }
    }

    return NextResponse.json({ success: true, images });
  } catch (error: any) {
    console.error("API generate error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 });
  }
}
