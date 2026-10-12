import fs from "fs";
import path from "path";
import sharp from "sharp";

export interface TrainedModelWeights {
  totalAnalyzed: number;
  contrastProfile: string;
  lightingTone: string;
  paletteMood: string;
  learnedTokens: string[];
  updatedAt: string;
}

const WEIGHTS_PATH = path.join(process.cwd(), "trained_ai_weights.json");

/**
 * Reads existing trained weights or initializes fresh profile
 */
export function getTrainedWeights(): TrainedModelWeights {
  try {
    if (fs.existsSync(WEIGHTS_PATH)) {
      return JSON.parse(fs.readFileSync(WEIGHTS_PATH, "utf-8"));
    }
  } catch (e) {
    console.warn("Could not read trained_ai_weights.json");
  }

  return {
    totalAnalyzed: 0,
    contrastProfile: "balanced",
    lightingTone: "studio lighting",
    paletteMood: "natural",
    learnedTokens: ["high definition", "sharp focus", "masterpiece composition"],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Autonomous Live Image Training:
 * Extracts visual tensors (Color variance, RGB temperature, luminance)
 * directly in RAM without saving any image to disk!
 */
export async function autoTrainFromImageBuffer(imageBuffer: Buffer, caption = ""): Promise<{
  learnedTokens: string[];
  totalTrained: number;
  newInsight: string;
}> {
  const currentWeights = getTrainedWeights();

  // 1. Analyze visual tensors using Sharp in memory
  const stats = await sharp(imageBuffer).stats();
  const ch = stats.channels;
  const meanR = ch[0].mean;
  const meanG = ch[1].mean;
  const meanB = ch[2].mean;
  const avgStdDev = (ch[0].stdev + ch[1].stdev + ch[2].stdev) / 3;

  const newTokens: string[] = [];

  // Color temperature & lighting detection
  if (meanR > meanB + 20) {
    newTokens.push("warm golden cinematic lighting", "sunset amber tones");
  } else if (meanB > meanR + 20) {
    newTokens.push("cool moonlight aesthetic", "neon cyber glow");
  } else if (meanR < 80 && meanG < 80 && meanB < 80) {
    newTokens.push("dark moody atmospheric rim lighting", "film noir shadows");
  } else {
    newTokens.push("studio softbox illumination", "clean neutral lighting");
  }

  // Contrast & detail dynamics
  if (avgStdDev > 55) {
    newTokens.push("high dynamic range HDR", "ultra crisp details");
  } else {
    newTokens.push("soft subtle gradients", "smooth visual tones");
  }

  // Text caption keywords if provided
  if (caption && caption.length > 2) {
    const words = caption.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
    const validWords = words.filter(w => w.length > 3 && !["this", "that", "with", "from", "image", "photo"].includes(w));
    if (validWords.length > 0) {
      newTokens.push(...validWords.slice(0, 3));
    }
  }

  // 2. Merge tokens with rolling buffer (keep top 12 most relevant tokens)
  const mergedTokenSet = new Set([...newTokens, ...currentWeights.learnedTokens]);
  const updatedTokens = Array.from(mergedTokenSet).slice(0, 12);

  currentWeights.totalAnalyzed += 1;
  currentWeights.learnedTokens = updatedTokens;
  currentWeights.updatedAt = new Date().toISOString();

  // 3. Save updated neural profile (size < 1 KB)
  fs.writeFileSync(WEIGHTS_PATH, JSON.stringify(currentWeights, null, 2));

  console.log(`🧠 [Live Auto-Training] Trained on new photo! Total dataset: ${currentWeights.totalAnalyzed}`);
  console.log(`🎨 Active Learned Tokens: [${updatedTokens.join(", ")}]`);

  return {
    learnedTokens: updatedTokens,
    totalTrained: currentWeights.totalAnalyzed,
    newInsight: newTokens.join(", "),
  };
}
