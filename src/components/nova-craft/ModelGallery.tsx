// src/components/nova-craft/ModelGallery.tsx
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelGalleryProps {
  modelImages: string[];
  selectedModel: string | null;
  onSelectModel: (imageUrl: string, index: number) => void;
  prompt?: string; // Optional: for data-ai-hint if more specific hint is needed
}

export function ModelGallery({ modelImages, selectedModel, onSelectModel, prompt }: ModelGalleryProps) {
  if (modelImages.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-headline text-center text-primary">Choose Your Draft Model</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {modelImages.map((imageUrl, index) => (
          <Card
            key={index}
            className={cn(
              "overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:shadow-accent/50 hover:shadow-lg",
              selectedModel === imageUrl ? "ring-2 ring-accent shadow-accent/30 shadow-lg" : "hover:ring-1 hover:ring-primary/50"
            )}
            onClick={() => onSelectModel(imageUrl, index)}
            aria-pressed={selectedModel === imageUrl}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectModel(imageUrl, index);}}
          >
            <CardContent className="p-0 relative aspect-square">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`Generated 3D Model Draft ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="3d model"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              {selectedModel === imageUrl && (
                <div className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full p-1.5 shadow-md">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
            </CardContent>
            <div className="p-3 bg-card/80 backdrop-blur-sm">
              <Button 
                variant={selectedModel === imageUrl ? "default" : "outline"}
                className="w-full"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent card click event
                    onSelectModel(imageUrl, index);
                }}
              >
                {selectedModel === imageUrl ? "Selected" : `Select Draft ${index + 1}`}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
