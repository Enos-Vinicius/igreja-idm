import { useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ExternalLink, Music } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SheetMusicItem {
  title: string;
  url: string;
  key?: string;
}

interface SheetMusicViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Modo simples: um arquivo só */
  url?: string;
  title?: string;
  musicalKey?: string;
  /** Modo playlist: lista de louvores com navegação */
  playlist?: SheetMusicItem[];
  initialIndex?: number;
}

const SheetMusicViewer = ({
  open,
  onOpenChange,
  url,
  title,
  musicalKey,
  playlist,
  initialIndex = 0,
}: SheetMusicViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const isPlaylist = playlist && playlist.length > 0;
  const current = isPlaylist
    ? playlist[currentIndex]
    : { title: title ?? "", url: url ?? "", key: musicalKey };

  const canGoPrev = isPlaylist && currentIndex > 0;
  const canGoNext = isPlaylist && currentIndex < playlist.length - 1;

  const goToPrev = useCallback(() => {
    if (canGoPrev) setCurrentIndex((i) => i - 1);
  }, [canGoPrev]);

  const goToNext = useCallback(() => {
    if (canGoNext) setCurrentIndex((i) => i + 1);
  }, [canGoNext]);

  // Reset index when opening
  const handleOpenChange = (value: boolean) => {
    if (value) {
      setCurrentIndex(initialIndex);
    }
    onOpenChange(value);
  };

  // Swipe navigation for playlist mode on mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isPlaylist) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [isPlaylist]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPlaylist || !touchStartRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    // Only track horizontal movement
    if (deltaY > Math.abs(deltaX)) return;
    setSwipeOffset(deltaX);
  }, [isPlaylist]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;
    if (swipeOffset < -80 && canGoNext) {
      goToNext();
    } else if (swipeOffset > 80 && canGoPrev) {
      goToPrev();
    }
    touchStartRef.current = null;
    setSwipeOffset(0);
  }, [swipeOffset, canGoNext, canGoPrev, goToNext, goToPrev]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrev();
    if (e.key === "ArrowRight") goToNext();
  }, [goToPrev, goToNext]);

  if (!current.url) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-4xl w-full h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 dialog-mobile-fullscreen"
        onKeyDown={handleKeyDown}
      >
        <VisuallyHidden>
          <DialogTitle>{current.title || "Visualizar Cifra"}</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Music className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-sm sm:text-base truncate">
                {current.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {current.key && (
                  <Badge variant="secondary" className="text-xs">
                    Tom: {current.key}
                  </Badge>
                )}
                {isPlaylist && (
                  <span className="text-xs text-muted-foreground">
                    {currentIndex + 1} de {playlist.length}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.open(current.url, "_blank", "noopener,noreferrer")}
              title="Abrir em nova aba"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div
          className="flex-1 relative overflow-hidden bg-muted"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <iframe
            key={current.url}
            src={current.url}
            className="w-full h-full border-0"
            title={current.title || "Cifra"}
          />
        </div>

        {/* Footer navigation - only in playlist mode */}
        {isPlaylist && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-background flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrev}
              disabled={!canGoPrev}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>

            <div className="flex items-center gap-1.5">
              {playlist.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    i === currentIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={!canGoNext}
              className="gap-1"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SheetMusicViewer;
