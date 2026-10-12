// src/components/nova-craft/ModelGeneratorForm.tsx
"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "./LoadingSpinner";
import { Sparkles } from "lucide-react";

interface ModelGeneratorFormProps {
  onSubmit: (prompt: string, referenceFile?: File | null) => Promise<void>;
  isLoading: boolean;
}

export function ModelGeneratorForm({ onSubmit, isLoading }: ModelGeneratorFormProps) {
  const [prompt, setPrompt] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt, null);
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center">
          <Sparkles className="w-7 h-7 mr-2 text-accent" />
          Generate Your Craft
        </CardTitle>
        <CardDescription>
          Describe the 3D model you want to create.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="model-prompt" className="text-lg">Prompt</Label>
            <Textarea
              id="model-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A futuristic spaceship, cyberpunk style, metallic chrome, docked position"
              rows={4}
              className="text-base"
              disabled={isLoading}
              aria-label="3D Model Generation Prompt"
            />
          </div>

          <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
            {isLoading ? (
              <LoadingSpinner size={24} className="mr-2" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            Generate Models
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
