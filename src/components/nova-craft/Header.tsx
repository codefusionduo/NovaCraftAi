"use client";

import { Sparkles, Wand2, Moon, Sun, History, Image as ImageIcon } from "lucide-react";

interface HeaderProps {
  onShowHistory?: () => void;
  historyCount?: number;
}

export function Header({ onShowHistory, historyCount = 0 }: HeaderProps) {
  return (
    <header className="w-full border-b border-border/40 backdrop-blur-md bg-background/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[2px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                NovaCraft AI
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Studio
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Generate ultra-realistic & artistic AI images in seconds
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {onShowHistory && (
            <button
              onClick={onShowHistory}
              className="flex items-center space-x-2 text-xs font-medium px-3.5 py-2 rounded-lg bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-border/60 transition-all hover:scale-105 active:scale-95"
            >
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-600 text-[10px] font-bold text-white">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>AI Models Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}
