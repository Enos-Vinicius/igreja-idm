import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, Edit, Trash2, ExternalLink, FileText, Music, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import MobileBackButton from "@/components/MobileBackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { songsService } from "@/services/songs";
import { Song, SongStats } from "@/types/worship";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/config/permissions";

const Repertoire = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [songs, setSongs] = useState<Song[]>([]);
  const [stats, setStats] = useState<SongStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Só recarrega se for a primeira vez OU se vier com flag de refresh
    const shouldRefresh = location.state?.refresh === true;
    const hasData = songs.length > 0;

    // Recarrega apenas se:
    // 1. Vem com flag de refresh (salvou no form)
    // 2. OU não tem dados ainda E nunca carregou antes
    if (shouldRefresh || (!hasData && !hasLoadedRef.current)) {
      loadData();
      hasLoadedRef.current = true;

      // Limpa o state após usar para evitar reloads indesejados
      if (shouldRefresh) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    } else {
      // Se já tem dados, não mostra loading
      setIsLoadingSongs(false);
      setIsLoadingStats(false);
    }
  }, [location.state, songs.length]);

  const loadData = async () => {
    setIsLoadingSongs(true);
    setIsLoadingStats(true);

    try {
      // Carregar músicas
      const songsData = await songsService.getAll();
      setSongs(songsData);
      setIsLoadingSongs(false);

      // Tentar carregar stats da API, se falhar calcular localmente
      try {
        const statsData = await songsService.getStats();
        setStats(statsData);
      } catch {
        // Calcular stats a partir dos dados das músicas
        const uniqueMinisterIds = new Set<string>();
        songsData.forEach((song) => {
          song.ministers.forEach((m) => uniqueMinisterIds.add(m.id));
        });

        setStats({
          totalSongs: songsData.length,
          songsWithSheet: songsData.filter((s) => s.sheetMusicUrl).length,
          activeMinistersCount: uniqueMinisterIds.size,
        });
      }
      setIsLoadingStats(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar repertório";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
      setIsLoadingSongs(false);
      setIsLoadingStats(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      try {
        const results = await songsService.getAll(term);
        setSongs(results);
      } catch {
        // Silently fail - search will be empty
      }
    } else if (term.length === 0) {
      loadData();
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await songsService.delete(id);
      setSongs((prev) => prev.filter((s) => s.id !== id));
      if (stats) {
        setStats({ ...stats, totalSongs: stats.totalSongs - 1 });
      }
      toast({
        title: "Louvor excluído",
        description: "O louvor foi removido do repertório.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir louvor";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const openYoutubeLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <MobileBackButton />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Music className="h-8 w-8 text-primary" />
              Repertório da Banda
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os louvores e músicas do ministério
            </p>
          </div>
          {currentUser && hasPermission(currentUser.role, 'songs', 'create') && (
            <Button onClick={() => navigate("/repertoire/new")} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Louvor
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Louvores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <div className="text-2xl font-bold">{stats?.totalSongs ?? 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Com Cifra/Partitura
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <div className="text-2xl font-bold">{stats?.songsWithSheet ?? 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ministros Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <div className="text-2xl font-bold">{stats?.activeMinistersCount ?? 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, ministro ou tonalidade..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tonalidade</TableHead>
                    <TableHead>Cantor</TableHead>
                    <TableHead>Ministro(s)</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSongs ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <p className="text-muted-foreground">Carregando louvores...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : songs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum louvor encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    songs.map((song) => (
                      <TableRow key={song.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{song.title}</span>
                            {song.youtubeUrl && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => openYoutubeLink(song.youtubeUrl)}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{song.key}</Badge>
                        </TableCell>
                        <TableCell>
                          {song.singer || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {song.ministers.map((minister) => (
                              <Badge key={minister.id} variant="outline" className="text-xs">
                                {minister.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {song.sheetMusicUrl ? (
                            <a
                              href={song.sheetMusicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <FileText className="h-4 w-4" />
                              <span>Ver cifra</span>
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/repertoire/edit/${song.id}`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {currentUser && hasPermission(currentUser.role, 'songs', 'delete') && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={isDeleting === song.id}>
                                    {isDeleting === song.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Excluir louvor?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir "{song.title}"?
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(song.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Repertoire;
