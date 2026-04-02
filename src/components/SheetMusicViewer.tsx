import { useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X, ExternalLink, Music, Maximize2, Minimize2, FileX } from "lucide-react";
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
  url?: string;
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

// Notas da escala maior para cada tonalidade
const MAJOR_SCALE_NOTES: Record<string, string[]> = {
  "C":  ["C", "D", "E", "F", "G", "A", "B"],
  "C#": ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
  "Db": ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  "D":  ["D", "E", "F#", "G", "A", "B", "C#"],
  "D#": ["D#", "E#", "F##", "G#", "A#", "B#", "C##"],
  "Eb": ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  "E":  ["E", "F#", "G#", "A", "B", "C#", "D#"],
  "F":  ["F", "G", "A", "Bb", "C", "D", "E"],
  "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
  "Gb": ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
  "G":  ["G", "A", "B", "C", "D", "E", "F#"],
  "G#": ["G#", "A#", "B#", "C#", "D#", "E#", "F##"],
  "Ab": ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  "A":  ["A", "B", "C#", "D", "E", "F#", "G#"],
  "A#": ["A#", "B#", "C##", "D#", "E#", "F##", "G##"],
  "Bb": ["Bb", "C", "D", "Eb", "F", "G", "A"],
  "B":  ["B", "C#", "D#", "E", "F#", "G#", "A#"],
};

// Notas da escala menor natural
const MINOR_SCALE_NOTES: Record<string, string[]> = {
  "Cm":  ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
  "C#m": ["C#", "D#", "E", "F#", "G#", "A", "B"],
  "Dm":  ["D", "E", "F", "G", "A", "Bb", "C"],
  "D#m": ["D#", "E#", "F#", "G#", "A#", "B", "C#"],
  "Ebm": ["Eb", "F", "Gb", "Ab", "Bb", "Cb", "Db"],
  "Em":  ["E", "F#", "G", "A", "B", "C", "D"],
  "Fm":  ["F", "G", "Ab", "Bb", "C", "Db", "Eb"],
  "F#m": ["F#", "G#", "A", "B", "C#", "D", "E"],
  "Gm":  ["G", "A", "Bb", "C", "D", "Eb", "F"],
  "G#m": ["G#", "A#", "B", "C#", "D#", "E", "F#"],
  "Am":  ["A", "B", "C", "D", "E", "F", "G"],
  "A#m": ["A#", "B#", "C#", "D#", "E#", "F#", "G#"],
  "Bbm": ["Bb", "C", "Db", "Eb", "F", "Gb", "Ab"],
  "Bm":  ["B", "C#", "D", "E", "F#", "G", "A"],
};

function getScaleNotes(key: string): string[] | null {
  return MAJOR_SCALE_NOTES[key] || MINOR_SCALE_NOTES[key] || null;
}

function getChordProgression(key: string): { degree: string; chord: string }[] | null {
  const isMinor = key.endsWith("m");
  const notes = getScaleNotes(key);
  if (!notes) return null;

  if (isMinor) {
    // Graus da escala menor: i ii° III iv v VI VII
    const qualities = ["m", "dim", "", "m", "m", "", ""];
    const degrees = ["i", "ii°", "III", "iv", "v", "VI", "VII"];
    return notes.map((note, i) => ({
      degree: degrees[i],
      chord: note + qualities[i],
    }));
  } else {
    // Graus da escala maior: I ii iii IV V vi vii°
    const qualities = ["", "m", "m", "", "", "m", "dim"];
    const degrees = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
    return notes.map((note, i) => ({
      degree: degrees[i],
      chord: note + qualities[i],
    }));
  }
}

// Visualização para música sem cifra
const NoSheetView = ({ title, musicalKey }: { title: string; musicalKey?: string }) => {
  const scaleNotes = musicalKey ? getScaleNotes(musicalKey) : null;
  const chords = musicalKey ? getChordProgression(musicalKey) : null;
  const isMinor = musicalKey?.endsWith("m");

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center overflow-y-auto">
      <div className="max-w-md w-full space-y-8">
        {/* Ícone e mensagem */}
        <div className="space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FileX className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            Cifra não disponível
          </p>
        </div>

        {musicalKey && (
          <>
            {/* Tonalidade em destaque */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Tonalidade
              </p>
              <div className="text-6xl font-bold text-primary">
                {musicalKey}
              </div>
              <p className="text-sm text-muted-foreground">
                {isMinor ? "Escala Menor Natural" : "Escala Maior"}
              </p>
            </div>

            {/* Notas da escala */}
            {scaleNotes && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  Notas da Escala
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {scaleNotes.map((note, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-11 h-11 rounded-lg flex items-center justify-center text-sm font-bold transition-colors",
                        i === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acordes diatônicos */}
            {chords && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  Acordes Diatônicos
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {chords.map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-lg p-2 text-center border transition-colors",
                        i === 0
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card"
                      )}
                    >
                      <div className="text-xs text-muted-foreground font-medium">
                        {item.degree}
                      </div>
                      <div className="text-sm font-bold mt-0.5">
                        {item.chord}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPlaylist = playlist && playlist.length > 0;
  const current = isPlaylist
    ? playlist[currentIndex]
    : { title: title ?? "", url: url, key: musicalKey };

  const hasUrl = !!current.url;
  const canGoPrev = isPlaylist && currentIndex > 0;
  const canGoNext = isPlaylist && currentIndex < playlist.length - 1;

  const goToPrev = useCallback(() => {
    if (canGoPrev) setCurrentIndex((i) => i - 1);
  }, [canGoPrev]);

  const goToNext = useCallback(() => {
    if (canGoNext) setCurrentIndex((i) => i + 1);
  }, [canGoNext]);

  // Reset state when opening
  const handleOpenChange = (value: boolean) => {
    if (value) {
      setCurrentIndex(initialIndex);
      setIsFullscreen(false);
    } else {
      // Exit browser fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
    onOpenChange(value);
  };

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.closest('[role="dialog"]')?.requestFullscreen();
        setIsFullscreen(true);
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported or denied
    }
  }, []);

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
    if (e.key === "f" || e.key === "F") toggleFullscreen();
  }, [goToPrev, goToNext, toggleFullscreen]);

  // Listen for browser fullscreen changes
  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-4xl w-full h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 dialog-mobile-fullscreen [&>button[type=button]:last-of-type]:hidden"
        onKeyDown={handleKeyDown}
        ref={containerRef}
        onFocus={() => {
          document.addEventListener("fullscreenchange", handleFullscreenChange);
        }}
        onBlur={() => {
          document.removeEventListener("fullscreenchange", handleFullscreenChange);
        }}
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
            {hasUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.open(current.url, "_blank", "noopener,noreferrer")}
                title="Abrir em nova aba"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
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

        {/* Content */}
        <div
          className="flex-1 relative overflow-hidden bg-muted"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {hasUrl ? (
            <iframe
              key={current.url}
              src={current.url}
              className="w-full h-full border-0"
              title={current.title || "Cifra"}
            />
          ) : (
            <NoSheetView title={current.title} musicalKey={current.key} />
          )}
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
              {playlist.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    i === currentIndex
                      ? "bg-primary"
                      : item.url
                        ? "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        : "bg-muted-foreground/15 hover:bg-muted-foreground/30"
                  )}
                  title={item.title}
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
