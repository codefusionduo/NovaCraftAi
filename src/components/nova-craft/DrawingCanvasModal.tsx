
// src/components/nova-craft/DrawingCanvasModal.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Trash2, Save, Pencil, Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawingCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  backgroundImageUri?: string | null;
}

export function DrawingCanvasModal({ isOpen, onClose, onSave, backgroundImageUri }: DrawingCanvasModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen');

  const canvasWidth = 512;
  const canvasHeight = 512;

  const drawBackgroundImage = useCallback((context: CanvasRenderingContext2D, imageUri: string) => {
    const image = new window.Image();
    image.onload = () => {
      context.clearRect(0, 0, canvasWidth, canvasHeight); 
      context.fillStyle = '#FFFFFF'; 
      context.fillRect(0, 0, canvasWidth, canvasHeight);
      
      const canvasAspect = canvasWidth / canvasHeight;
      const imageAspect = image.width / image.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (imageAspect > canvasAspect) { 
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imageAspect;
      } else { 
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imageAspect;
      }
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = (canvasHeight - drawHeight) / 2;
      
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    };
    image.onerror = (err) => { 
        console.error("Failed to load background image:", err);
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    image.src = imageUri;
  }, []);


  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        if (backgroundImageUri) {
          drawBackgroundImage(context, backgroundImageUri);
        } else {
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        setCtx(context);
        isDrawingRef.current = false; 
      }
    }
  }, [isOpen, backgroundImageUri, drawBackgroundImage]);


  useEffect(() => {
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = lineWidth;
      if (currentTool === 'pen') {
        ctx.strokeStyle = selectedColor;
        ctx.globalCompositeOperation = 'source-over'; 
      } else if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = backgroundImageUri ? 'destination-out' : 'source-over';
         if (backgroundImageUri) {
            // destination-out makes pixels transparent. If canvas CSS is white, it erases to white.
            // strokeStyle is not used by destination-out
        } else {
            ctx.strokeStyle = '#FFFFFF'; // Erase to white if no background
        }
      }
    }
  }, [ctx, currentTool, selectedColor, lineWidth, backgroundImageUri]);

  const getEventCoordinates = useCallback((event: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (event instanceof TouchEvent) {
      if (event.touches.length === 0) return null;
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else { 
      clientX = event.clientX;
      clientY = event.clientY;
    }
    return { offsetX: clientX - rect.left, offsetY: clientY - rect.top };
  }, []);

  const handleDrawMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDrawingRef.current || !ctx || !canvasRef.current) return;
    
    if (event.cancelable && (event instanceof TouchEvent || (event instanceof MouseEvent && event.buttons === 1))) {
        event.preventDefault();
    }
    
    const coords = getEventCoordinates(event, canvasRef.current);
    if (!coords) return;

    ctx.lineTo(coords.offsetX, coords.offsetY);
    ctx.stroke();
  }, [ctx, getEventCoordinates]);

  const handleDrawEnd = useCallback(() => {
    if (!isDrawingRef.current || !ctx) return;
    
    ctx.closePath();
    isDrawingRef.current = false;

    window.removeEventListener('mousemove', handleDrawMove);
    window.removeEventListener('mouseup', handleDrawEnd);
    window.removeEventListener('touchmove', handleDrawMove);
    window.removeEventListener('touchend', handleDrawEnd);
    window.removeEventListener('touchcancel', handleDrawEnd);
  }, [ctx, handleDrawMove]); 

  const handleDrawStart = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx || !canvasRef.current || (event.nativeEvent instanceof MouseEvent && event.nativeEvent.button !== 0)) return;
    
    if (event.cancelable) event.preventDefault();

    const coords = getEventCoordinates(event.nativeEvent, canvasRef.current);
    if (!coords) return;

    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(coords.offsetX, coords.offsetY);

    if (event.nativeEvent instanceof MouseEvent) {
      window.addEventListener('mousemove', handleDrawMove);
      window.addEventListener('mouseup', handleDrawEnd);
    } else { 
      window.addEventListener('touchmove', handleDrawMove, { passive: false });
      window.addEventListener('touchend', handleDrawEnd);
      window.addEventListener('touchcancel', handleDrawEnd);
    }
  }, [ctx, getEventCoordinates, handleDrawMove, handleDrawEnd]);

  useEffect(() => {
    return () => {
        window.removeEventListener('mousemove', handleDrawMove);
        window.removeEventListener('mouseup', handleDrawEnd);
        window.removeEventListener('touchmove', handleDrawMove);
        window.removeEventListener('touchend', handleDrawEnd);
        window.removeEventListener('touchcancel', handleDrawEnd);
    };
  }, [handleDrawMove, handleDrawEnd]);


  const handleClearCanvas = () => {
    if (ctx && canvasRef.current) {
      const originalCompositeOp = ctx.globalCompositeOperation;
      const originalStrokeStyle = ctx.strokeStyle;
      const originalLineWidth = ctx.lineWidth;

      ctx.globalCompositeOperation = 'source-over'; 
      
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      if (backgroundImageUri) {
        drawBackgroundImage(ctx, backgroundImageUri);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      
      // Restore tool settings based on currentTool, color, lineWidth, and backgroundImageUri
      // This is better handled by the dedicated useEffect for tool settings,
      // but we ensure the context is ready.
      // The useEffect for tool settings will apply them correctly after this clear.
      // Forcing it here:
      ctx.lineWidth = originalLineWidth; // Keep current line width
      if (currentTool === 'pen') {
        ctx.strokeStyle = selectedColor;
        ctx.globalCompositeOperation = 'source-over';
      } else if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = backgroundImageUri ? 'destination-out' : 'source-over';
        if (!backgroundImageUri) {
            ctx.strokeStyle = '#FFFFFF';
        }
        // If backgroundImageUri is present and tool is eraser, strokeStyle isn't used by destination-out
      } else {
         ctx.globalCompositeOperation = originalCompositeOp;
         ctx.strokeStyle = originalStrokeStyle;
      }
    }
  };

  const handleSaveDrawing = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[560px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-headline text-primary">Draw Your Design</DialogTitle>
        </DialogHeader>

        <div className="p-4 border-b border-border">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 items-end">
            <div>
              <Label className="text-xs font-medium mb-1 block text-muted-foreground">Tool</Label>
              <div className="flex gap-1">
                <Button 
                  variant={currentTool === 'pen' ? 'secondary' : 'outline'} 
                  onClick={() => setCurrentTool('pen')}
                  className="flex-1 h-9"
                  size="sm"
                >
                  <Pencil className="h-4 w-4 mr-1.5" /> Pen
                </Button>
                <Button 
                  variant={currentTool === 'eraser' ? 'secondary' : 'outline'} 
                  onClick={() => setCurrentTool('eraser')}
                  className="flex-1 h-9"
                  size="sm"
                >
                  <Eraser className="h-4 w-4 mr-1.5" /> Eraser
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="color-picker" className="text-xs font-medium mb-1 block text-muted-foreground">Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="color-picker"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className={cn(
                    "w-9 h-9 p-0 border rounded-md cursor-pointer",
                    currentTool === 'eraser' ? "opacity-50 cursor-not-allowed" : ""
                  )}
                  disabled={currentTool === 'eraser'}
                />
                <span className="text-sm font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground">{selectedColor.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <Label htmlFor="line-width-slider" className="text-xs font-medium mb-1 block text-muted-foreground">Line Width: {lineWidth}px</Label>
            <Slider
              id="line-width-slider"
              min={1}
              max={50}
              step={1}
              value={[lineWidth]}
              onValueChange={(value) => setLineWidth(value[0])}
              className="w-full h-auto py-1"
            />
          </div>
        </div>

        <div className="p-6 pt-4 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={handleDrawStart}
            onTouchStart={handleDrawStart}
            className="border border-muted-foreground rounded-md cursor-crosshair bg-white shadow-inner"
            aria-label="Drawing Canvas"
            style={{ touchAction: 'none' }} 
          />
        </div>
        <DialogFooter className="p-6 pt-2 sm:justify-between">
          <Button variant="outline" onClick={handleClearCanvas} className="mb-2 sm:mb-0">
            <Trash2 className="mr-2 h-4 w-4" /> Clear Canvas
          </Button>
          <div className="flex gap-2">
            <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveDrawing} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Save className="mr-2 h-4 w-4" /> Save Drawing
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    