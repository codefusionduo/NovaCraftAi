"use client";

import { useState } from "react";
import {
  Wand2,
  Sparkles,
  Dice5,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Flame,
  Camera,
  Layers,
  Palette,
  EyeOff,
  Terminal,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface GenerateConfig {
  prompt: string;
  style: string;
  aspectRatio: string;
  negativePrompt: string;
  numImages: number;
  quality: string;
  postToTelegram?: boolean;
}

interface GeneratorProps {
  onGenerate: (config: GenerateConfig) => void;
  isLoading: boolean;
}

const STYLES = [
  { id: "photorealistic", label: "Photorealistic", icon: Camera, color: "from-blue-500 to-cyan-400" },
  { id: "anime", label: "Anime / Manga", icon: Sparkles, color: "from-pink-500 to-rose-400" },
  { id: "cyberpunk", label: "Cyberpunk", icon: Flame, color: "from-purple-500 to-pink-500" },
  { id: "digital-art", label: "Digital Art", icon: Palette, color: "from-amber-500 to-orange-400" },
  { id: "fantasy", label: "Fantasy RPG", icon: Wand2, color: "from-emerald-500 to-teal-400" },
  { id: "3d-render", label: "3D Pixar Style", icon: Layers, color: "from-indigo-500 to-blue-400" },
];

const ASPECT_RATIOS = [
  { id: "1:1", label: "Square (1:1)", desc: "1024 x 1024" },
  { id: "16:9", label: "Landscape (16:9)", desc: "1280 x 720" },
  { id: "9:16", label: "Portrait (9:16)", desc: "720 x 1280" },
  { id: "4:3", label: "Standard (4:3)", desc: "1024 x 768" },
];

const BOT_COMMANDS = [
  { cmd: "/generate", desc: "Default photorealistic AI generation", style: "photorealistic" },
  { cmd: "/anime", desc: "Anime & Manga artistic style", style: "anime" },
  { cmd: "/cyberpunk", desc: "Futuristic neon cyberpunk vibes", style: "cyberpunk" },
  { cmd: "/3d", desc: "3D Pixar character & animation render", style: "3d-render" },
];

const PROMPT_SUGGESTIONS = [
  "/cyberpunk neon street at rainy night, reflections, high detail, 8k",
  "/anime samurai warrior in cherry blossom storm",
  "/3d cute friendly baby panda wearing astronaut suit",
  "/generate majestic lion with crown of galaxy stars",
];

export function ImagePromptInput({ onGenerate, isLoading }: GeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("photorealistic");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [numImages, setNumImages] = useState(1);
  const [quality, setQuality] = useState("hd");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [postToTelegram, setPostToTelegram] = useState(true);

  const handleRandomPrompt = () => {
    const random = PROMPT_SUGGESTIONS[Math.floor(Math.random() * PROMPT_SUGGESTIONS.length)];
    setPrompt(random);
  };

  const handleApplyCommand = (cmd: string, styleId: string) => {
    let cleanText = prompt.trim();
    // remove existing slash command if present
    cleanText = cleanText.replace(/^\/(generate|anime|cyberpunk|3d)\s*/i, "").trim();
    setPrompt(`${cmd} ${cleanText}`);
    setSelectedStyle(styleId);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    let finalPrompt = prompt.trim();
    let effectiveStyle = selectedStyle;

    // Detect Telegram slash commands in input
    if (finalPrompt.toLowerCase().startsWith("/anime")) {
      effectiveStyle = "anime";
      finalPrompt = finalPrompt.replace(/^\/anime\s*/i, "").trim();
    } else if (finalPrompt.toLowerCase().startsWith("/cyberpunk")) {
      effectiveStyle = "cyberpunk";
      finalPrompt = finalPrompt.replace(/^\/cyberpunk\s*/i, "").trim();
    } else if (finalPrompt.toLowerCase().startsWith("/3d")) {
      effectiveStyle = "3d-render";
      finalPrompt = finalPrompt.replace(/^\/3d\s*/i, "").trim();
    } else if (finalPrompt.toLowerCase().startsWith("/generate")) {
      finalPrompt = finalPrompt.replace(/^\/generate\s*/i, "").trim();
    }

    if (!finalPrompt) return;

    onGenerate({
      prompt: finalPrompt,
      style: effectiveStyle,
      aspectRatio: selectedRatio,
      negativePrompt: negativePrompt.trim(),
      numImages,
      quality,
      postToTelegram,
    });
  };

  return (
    <div className="w-full bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-44 h-44 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Telegram Slash Command Shortcut Bar */}
      <div className="mb-4 pb-3 border-b border-border/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold flex items-center space-x-1.5 text-purple-400">
            <Terminal className="w-3.5 h-3.5" />
            <span>Bot Slash Commands (Direct Quick Actions)</span>
          </span>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Click any command or type in prompt
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BOT_COMMANDS.map((item) => {
            const isActive = prompt.startsWith(item.cmd);
            return (
              <button
                key={item.cmd}
                type="button"
                onClick={() => handleApplyCommand(item.cmd, item.style)}
                className={`flex flex-col text-left px-3 py-2 rounded-xl border transition-all text-xs ${
                  isActive
                    ? "border-purple-500 bg-purple-500/15 text-foreground shadow-sm"
                    : "border-border/60 bg-background/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="font-mono font-bold text-purple-400">{item.cmd}</span>
                <span className="text-[10px] text-muted-foreground truncate">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Prompt Bar */}
      <div className="relative">
        <label className="block text-xs uppercase font-bold tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
          <span>Prompt Description / Command</span>
          <button
            type="button"
            onClick={handleRandomPrompt}
            className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 normal-case font-medium text-xs transition"
          >
            <Dice5 className="w-3.5 h-3.5" />
            <span>Surprise Me</span>
          </button>
        </label>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Type /generate, /anime, /cyberpunk, /3d or normal prompt... e.g. /cyberpunk rainy tokyo street neon"
            rows={3}
            className="w-full bg-background/80 border border-border/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none outline-none transition font-mono"
          />
        </div>
      </div>

      {/* Quick Prompt Pill Suggestions */}
      <div className="mt-2.5 flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-[11px] text-muted-foreground whitespace-nowrap">Examples:</span>
        {PROMPT_SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setPrompt(s)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground text-[11px] border border-border/40 transition truncate max-w-[240px]"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Style Presets */}
      <div className="mt-5">
        <label className="block text-xs uppercase font-bold tracking-wider text-muted-foreground mb-2.5">
          Artistic Style Preset
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STYLES.map((st) => {
            const Icon = st.icon;
            const isSelected = selectedStyle === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStyle(st.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "border-purple-500 bg-purple-500/10 shadow-md shadow-purple-500/10 text-foreground"
                    : "border-border/60 bg-background/50 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 bg-gradient-to-tr ${st.color} text-white shadow-sm`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">{st.label}</span>
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="mt-5">
        <label className="block text-xs uppercase font-bold tracking-wider text-muted-foreground mb-2.5">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ASPECT_RATIOS.map((ratio) => {
            const isSelected = selectedRatio === ratio.id;
            return (
              <button
                key={ratio.id}
                type="button"
                onClick={() => setSelectedRatio(ratio.id)}
                className={`flex items-center space-x-2.5 p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? "border-purple-500 bg-purple-500/10 text-foreground"
                    : "border-border/60 bg-background/50 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="w-5 h-5 rounded border border-current flex items-center justify-center text-[9px] font-bold">
                  {ratio.id.split(":")[0]}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold leading-none">{ratio.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{ratio.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Telegram Channel Auto-Sync Toggle */}
      <div className="mt-5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Send className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-xs font-bold text-foreground">Sync with Telegram Channel</div>
            <div className="text-[11px] text-muted-foreground">
              Automatically post generated image to channel (-1004461650802) via @Codefusionduo_bot
            </div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={postToTelegram}
            onChange={(e) => setPostToTelegram(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {/* Collapsible Advanced Settings */}
      <div className="mt-4 border-t border-border/40 pt-3">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Advanced Options (Negative prompt, Quality, Count)</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="mt-3.5 space-y-3.5 p-3.5 rounded-xl bg-background/40 border border-border/40">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 flex items-center space-x-1">
                <EyeOff className="w-3 h-3 text-red-400" />
                <span>Negative Prompt (What to avoid)</span>
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="e.g. blurry, low quality, distorted, extra limbs"
                className="w-full bg-background border border-border/80 rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Variations Count
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNumImages(num)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition ${
                        numImages === num
                          ? "bg-purple-600 text-white border-purple-600"
                          : "border-border/60 hover:bg-secondary text-muted-foreground"
                      }`}
                    >
                      {num} {num === 1 ? "Image" : "Images"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Quality Preset
                </label>
                <div className="flex space-x-2">
                  {[
                    { id: "standard", label: "Standard" },
                    { id: "hd", label: "Ultra HD (8K)" },
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setQuality(q.id)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition ${
                        quality === q.id
                          ? "bg-purple-600 text-white border-purple-600"
                          : "border-border/60 hover:bg-secondary text-muted-foreground"
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action CTA Button */}
      <div className="mt-5">
        <Button
          onClick={() => handleSubmit()}
          disabled={!prompt.trim() || isLoading}
          className="w-full py-6 rounded-xl font-bold text-base text-white bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 shadow-lg shadow-purple-600/25 transition-all hover:shadow-purple-600/40 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>Generating Masterpiece...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Wand2 className="w-5 h-5" />
              <span>Generate Image{numImages > 1 ? "s" : ""}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
