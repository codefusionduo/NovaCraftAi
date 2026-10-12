// src/components/nova-craft/TextureGeneratorForm.tsx
"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "./LoadingSpinner";
import { Wand2 } from "lucide-react";

interface TextureGeneratorFormProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export function TextureGeneratorForm({ onSubmit, isLoading }: TextureGeneratorFormProps) {
  const [prompt, setPrompt] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div className="space-y-2">
        <Label htmlFor="texture-prompt" className="text-md">Texture Prompt</Label>
        <Textarea
          id="texture-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Rough bark, mossy green, high detail"
          rows={3}
          disabled={isLoading}
          className="text-sm"
          aria-label="Texture Generation Prompt"
        />
      </div>
      <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        {isLoading ? (
          <LoadingSpinner size={20} className="mr-2" />
        ) : (
          <Wand2 className="w-4 h-4 mr-2" />
        )}
        Generate Texture
      </Button>
    </form>
  );
}
