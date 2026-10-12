// src/components/nova-craft/ModelPreview.tsx
"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

interface ModelPreviewProps {
  modelImage: string | null;
  textureImage: string | null;
}

export function ModelPreview({ modelImage, textureImage }: ModelPreviewProps) {
  return (
    <div className="space-y-4">
      {modelImage && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">Selected Model</CardTitle>
          </CardHeader>
          <CardContent className="aspect-square relative bg-muted rounded-b-lg overflow-hidden">
            <Image
              src={modelImage}
              alt="Selected 3D Model"
              layout="fill"
              objectFit="contain"
              data-ai-hint="3d model"
            />
          </CardContent>
        </Card>
      )}
      {textureImage && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-accent">Generated Texture</CardTitle>
          </CardHeader>
          <CardContent className="aspect-square relative bg-muted rounded-b-lg overflow-hidden">
             <Image
              src={textureImage}
              alt="Generated Texture"
              layout="fill"
              objectFit="cover" // Textures are often tiled/covered
              data-ai-hint="texture pattern"
            />
          </CardContent>
        </Card>
      )}
      {!modelImage && (
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-muted-foreground">Model Preview</CardTitle>
          </CardHeader>
          <CardContent className="aspect-square relative bg-muted rounded-b-lg flex items-center justify-center">
            <ImageIcon className="w-24 h-24 text-muted-foreground/50" />
            <p className="absolute bottom-4 text-sm text-muted-foreground">Select a model to see preview</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
