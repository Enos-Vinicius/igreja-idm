import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Calendar, Music, BookOpen, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { schedulesService } from "@/services/schedules";
import { Schedule, ScheduleStats, getScheduleTypeLabel } from "@/types/schedule";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/config/permissions";

const Schedules = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stats, setStats] = useState<ScheduleStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "Louvor" | "Pregação">("all");
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const shouldRefresh = location.state?.refresh === true;
    const hasData = schedules.length > 0;

    if (shouldRefresh || (!hasData && !hasLoadedRef.current)) {
      loadData();
      hasLoadedRef.current = true;

      if (shouldRefresh) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    } else {
      setIsLoadingSchedules(false);
      setIsLoadingStats(false);
    }
  }, [location.state, schedules.length]);

  const loadData = async () => {
    setIsLoadingSchedules(true);
    setIsLoadingStats(true);

    try {
      const schedulesData = await schedulesService.getAll();
      setSchedules(schedulesData);
      setIsLoadingSchedules(false);

      try {
        const statsData = await schedulesService.getStats();
        setStats(statsData);
      } catch {
        // Calcular stats localmente se a API falhar
        setStats({
          totalEscalas: schedulesData.length,
          escalasLouvor: schedulesData.filter((s) => s.type === "Louvor").length,
          escalasPregacao: schedulesData.filter((s) => s.type === "Pregação").length,
        });
      }
      setIsLoadingStats(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar escalas";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
      setIsLoadingSchedules(false);
      setIsLoadingStats(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      try {
        const results = await schedulesService.getAll(undefined, undefined, term);
        setSchedules(results);
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
      await schedulesService.delete(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      if (stats) {
        setStats({ ...stats, totalEscalas: stats.totalEscalas - 1 });
      }
      toast({
        title: "Escala excluída",
        description: "A escala foi removida com sucesso.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir escala";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesTab = activeTab === "all" || schedule.type === activeTab;
    return matchesTab;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <MobileBackButton />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary" />
              Escalas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as escalas de louvor e pregação
            </p>
          </div>
          {currentUser && hasPermission(currentUser.role, 'schedules', 'create') && (
            <Button onClick={() => navigate("/schedules/new")} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Escala
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Escalas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <div className="text-2xl font-bold">{stats?.totalEscalas ?? 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Music className="h-4 w-4" />
                Escalas de Louvor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <div className="text-2xl font-bold">{stats?.escalasLouvor ?? 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Escalas de Palavra
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <div className="text-2xl font-bold">{stats?.escalasPregacao ?? 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="Louvor" className="gap-2">
                    <Music className="h-4 w-4" />
                    Louvor
                  </TabsTrigger>
                  <TabsTrigger value="Pregação" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Palavra
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ministro, pregador ou categoria..."
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
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Igreja</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSchedules ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <p className="text-muted-foreground">Carregando escalas...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredSchedules.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhuma escala encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <Badge
                            variant={schedule.type === "Louvor" ? "default" : "secondary"}
                            className="gap-1"
                          >
                            {schedule.type === "Louvor" ? (
                              <>
                                <Music className="h-3 w-3" />
                                Louvor
                              </>
                            ) : (
                              <>
                                <BookOpen className="h-3 w-3" />
                                Palavra
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {format(new Date(schedule.date), "dd 'de' MMMM", { locale: ptBR })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(schedule.date), "EEEE", { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{schedule.church}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{schedule.category}</span>
                        </TableCell>
                        <TableCell>
                          {schedule.type === "Louvor"
                            ? (schedule.minister?.name || "-")
                            : (schedule.preacher?.name || "-")}
                        </TableCell>
                        <TableCell>
                          {schedule.type === "Louvor" ? (
                            <div className="text-sm text-muted-foreground max-w-[200px] truncate">
                              {schedule.songs.map(s => s.title).join(", ") || "Nenhum louvor selecionado"}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              {schedule.notes || "-"}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/schedules/edit/${schedule.id}`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {currentUser && hasPermission(currentUser.role, 'schedules', 'delete') && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={isDeleting === schedule.id}>
                                    {isDeleting === schedule.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Excluir escala?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir esta escala de{" "}
                                      {format(new Date(schedule.date), "dd/MM/yyyy")}? Esta ação não
                                      pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(schedule.id)}
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

export default Schedules;
