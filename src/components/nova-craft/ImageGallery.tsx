"use client";

import { useState } from "react";
import { Download, Maximize2, Sparkles, Copy, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  createdAt: string;
}

interface ImageGalleryProps {
  images: GeneratedImage[];
  isLoading: boolean;
  onSelectImage?: (img: GeneratedImage) => void;
  onDeleteImage?: (id: string) => void;
  onClearAll?: () => void;
}

export function ImageGallery({
  images,
  isLoading,
  onSelectImage,
  onDeleteImage,
  onClearAll,
}: ImageGalleryProps) {
  const [selectedModalImage, setSelectedModalImage] = useState<GeneratedImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDownload = async (url: string, id: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `novacraft-ai-${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, "_blank");
    }
  };

  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center space-x-2">
            <span>Generated Creations</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
              {images.length}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Click on any image to preview in full resolution or download
          </p>
        </div>

        {images.length > 0 && onClearAll && (
          <Button
            onClick={onClearAll}
            variant="outline"
            size="sm"
            className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30 flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="aspect-square rounded-2xl bg-secondary/30 border border-border/40 animate-pulse flex flex-col items-center justify-center relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-3 animate-spin">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground">Synthesizing image with AI...</p>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !isLoading && (
        <div className="w-full py-16 border border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center text-center px-4 bg-card/20">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No images yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Enter a prompt or select a command above and click "Generate Image" to create your artwork!
          </p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-2xl overflow-hidden border border-border/60 bg-card hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10 flex flex-col"
            >
              <div className="relative aspect-square w-full bg-muted/40 overflow-hidden">
                <img
                  src={img.url}
                  alt={img.prompt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay hover actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-purple-300 backdrop-blur-sm border border-purple-400/30">
                      {img.style}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {onDeleteImage && (
                        <button
                          onClick={() => onDeleteImage(img.id)}
                          className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white backdrop-blur-sm transition"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedModalImage(img)}
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition"
                        title="Fullscreen preview"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(img.url, img.id)}
                      className="flex-1 bg-white hover:bg-white/90 text-black font-semibold text-xs h-8 rounded-lg shadow-md flex items-center justify-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </Button>
                    <button
                      onClick={() => handleCopyPrompt(img.prompt, img.id)}
                      className="p-2 rounded-lg bg-black/60 hover:bg-black text-white backdrop-blur-sm transition border border-white/10"
                      title="Copy Prompt"
                    >
                      {copiedId === img.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Card Prompt Details */}
              <div className="p-3 bg-card border-t border-border/40 flex-1 flex flex-col justify-between">
                <p className="text-xs text-foreground/90 font-medium line-clamp-2 leading-relaxed">
                  {img.prompt}
                </p>
                <div className="mt-2.5 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Ratio: {img.aspectRatio}</span>
                  <span>{new Date(img.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Modal Preview */}
      {selectedModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in"
          onClick={() => setSelectedModalImage(null)}
        >
          <div
            className="max-w-4xl w-full bg-card/95 border border-border/80 rounded-2xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">HD Image Preview</h3>
                <p className="text-xs text-muted-foreground truncate max-w-md">{selectedModalImage.prompt}</p>
              </div>
              <button
                onClick={() => setSelectedModalImage(null)}
                className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex items-center justify-center max-h-[70vh] bg-black/40 overflow-hidden">
              <img
                src={selectedModalImage.url}
                alt={selectedModalImage.prompt}
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="p-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 bg-secondary/20">
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Style:</span> {selectedModalImage.style} |{" "}
                <span className="font-semibold text-foreground">Aspect Ratio:</span> {selectedModalImage.aspectRatio}
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                {onDeleteImage && (
                  <Button
                    onClick={() => {
                      onDeleteImage(selectedModalImage.id);
                      setSelectedModalImage(null);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                )}
                <Button
                  onClick={() => handleCopyPrompt(selectedModalImage.prompt, selectedModalImage.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy Prompt
                </Button>
                <Button
                  onClick={() => handleDownload(selectedModalImage.url, selectedModalImage.id)}
                  size="sm"
                  className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download Image
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
