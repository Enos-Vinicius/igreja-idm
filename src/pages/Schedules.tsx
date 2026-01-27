import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Calendar, Music, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import DashboardLayout from "@/components/DashboardLayout";
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
import { mockSchedules } from "@/data/mockSchedules";
import { mockWorships } from "@/data/mockWorships";
import { Schedule } from "@/types/schedule";

const Schedules = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "worship" | "preaching">("all");

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      format(schedule.date, "dd/MM/yyyy").includes(searchTerm) ||
      (schedule.type === "worship" && schedule.minister.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (schedule.type === "preaching" && schedule.preacher.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (schedule.type === "preaching" && schedule.theme.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTab = activeTab === "all" || schedule.type === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    toast({
      title: "Escala excluída",
      description: "A escala foi removida com sucesso.",
    });
  };

  const getWorshipTitles = (worshipIds: string[]) => {
    return worshipIds
      .map((id) => mockWorships.find((w) => w.id === id)?.title)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
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
          <Button onClick={() => navigate("/schedules/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Escala
          </Button>
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
              <div className="text-2xl font-bold">{schedules.length}</div>
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
              <div className="text-2xl font-bold">
                {schedules.filter((s) => s.type === "worship").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Escalas de Pregação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {schedules.filter((s) => s.type === "preaching").length}
              </div>
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
                  <TabsTrigger value="worship" className="gap-2">
                    <Music className="h-4 w-4" />
                    Louvor
                  </TabsTrigger>
                  <TabsTrigger value="preaching" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Pregação
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por data, ministro, pregador ou tema..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  {filteredSchedules.length === 0 ? (
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
                            variant={schedule.type === "worship" ? "default" : "secondary"}
                            className="gap-1"
                          >
                            {schedule.type === "worship" ? (
                              <>
                                <Music className="h-3 w-3" />
                                Louvor
                              </>
                            ) : (
                              <>
                                <BookOpen className="h-3 w-3" />
                                Pregação
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {format(schedule.date, "dd 'de' MMMM", { locale: ptBR })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(schedule.date, "EEEE", { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{schedule.church}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{schedule.category}</span>
                        </TableCell>
                        <TableCell>
                          {schedule.type === "worship" ? schedule.minister : schedule.preacher}
                        </TableCell>
                        <TableCell>
                          {schedule.type === "worship" ? (
                            <div className="text-sm text-muted-foreground max-w-[200px] truncate">
                              {getWorshipTitles(schedule.selectedWorships) || "Nenhum louvor selecionado"}
                            </div>
                          ) : (
                            <div className="text-sm">
                              <span className="font-medium">{schedule.theme}</span>
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
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Excluir escala?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir esta escala de{" "}
                                    {format(schedule.date, "dd/MM/yyyy")}? Esta ação não
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
