"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/nova-craft/Header";
import { ImagePromptInput, type GenerateConfig } from "@/components/nova-craft/ImagePromptInput";
import { ImageGallery, type GeneratedImage } from "@/components/nova-craft/ImageGallery";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Trash2, Clock, Image as ImageIcon } from "lucide-react";

export default function NovaCraftStudio() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const { toast } = useToast();

  // Load saved creations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("novacraft_images");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setImages(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load stored images");
    }
  }, []);

  const saveToLocalStorage = (updated: GeneratedImage[]) => {
    try {
      localStorage.setItem("novacraft_images", JSON.stringify(updated.slice(0, 30)));
    } catch (e) {
      console.warn("Could not persist images");
    }
  };

  const handleGenerate = async (config: GenerateConfig) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Generation failed");
      }

      const newImages: GeneratedImage[] = data.images;
      setImages((prev) => {
        const updated = [...newImages, ...prev];
        saveToLocalStorage(updated);
        return updated;
      });

      toast({
        title: "Artwork Created!",
        description: `Successfully generated ${newImages.length} image(s).`,
      });
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to communicate with image generation engine.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      saveToLocalStorage(updated);
      return updated;
    });
    toast({
      title: "Image Deleted",
      description: "Selected image removed from gallery.",
    });
  };

  const handleClearHistory = () => {
    setImages([]);
    localStorage.removeItem("novacraft_images");
    toast({
      title: "Gallery Cleared",
      description: "All generated images have been removed.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        onShowHistory={() => setShowHistoryDrawer(!showHistoryDrawer)}
        historyCount={images.length}
      />

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 pb-2 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Generative AI Engine</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Turn Your Imagination Into{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            Visual Reality
          </span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto mt-2">
          Create photorealistic photos, anime art, 3D renders, and illustrations with AI prompts.
        </p>
      </div>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-10">
        {/* Generator Controls */}
        <section>
          <ImagePromptInput onGenerate={handleGenerate} isLoading={isLoading} />
        </section>

        {/* Gallery / Results Section */}
        <section>
          <ImageGallery
            images={images}
            isLoading={isLoading}
            onDeleteImage={handleDeleteImage}
            onClearAll={handleClearHistory}
          />
        </section>
      </main>

      {/* History Slide-over Drawer */}
      {showHistoryDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
          onClick={() => setShowHistoryDrawer(false)}
        >
          <div
            className="w-full max-w-md h-full bg-card border-l border-border p-6 overflow-y-auto flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-base text-foreground">Generation History</h3>
                </div>
                <button
                  onClick={() => setShowHistoryDrawer(false)}
                  className="w-7 h-7 rounded-lg bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {images.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-10">No history found.</p>
                ) : (
                  images.map((img) => (
                    <div
                      key={img.id}
                      className="flex space-x-3 p-2.5 rounded-xl bg-secondary/40 border border-border/50 items-center"
                    >
                      <img
                        src={img.url}
                        alt="thumb"
                        className="w-14 h-14 object-cover rounded-lg bg-muted flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground font-medium truncate">{img.prompt}</p>
                        <span className="text-[10px] text-purple-400 uppercase font-semibold">
                          {img.style} • {img.aspectRatio}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {images.length > 0 && (
              <div className="pt-4 border-t border-border/60 mt-6">
                <button
                  onClick={handleClearHistory}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 text-xs font-semibold transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All History</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 mt-12 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-muted-foreground">
          NovaCraft AI Studio • Powered by Generative AI • All rights reserved
        </div>
      </footer>
    </div>
  );
}
