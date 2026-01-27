import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, ExternalLink, FileText, Music } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { mockWorships } from "@/data/mockWorships";
import { Worship } from "@/types/worship";

const Repertoire = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [worships, setWorships] = useState<Worship[]>(mockWorships);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWorships = worships.filter(
    (worship) =>
      worship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worship.ministers.some((m) =>
        m.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      worship.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setWorships((prev) => prev.filter((w) => w.id !== id));
    toast({
      title: "Louvor excluído",
      description: "O louvor foi removido do repertório.",
    });
  };

  const openYoutubeLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
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
          <Button onClick={() => navigate("/repertoire/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Louvor
          </Button>
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
              <div className="text-2xl font-bold">{worships.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Com Cifra/Partitura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {worships.filter((w) => w.fileName).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ministros Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(worships.flatMap((w) => w.ministers)).size}
              </div>
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
                    <TableHead>Título</TableHead>
                    <TableHead>Tonalidade</TableHead>
                    <TableHead>Cantor</TableHead>
                    <TableHead>Ministro(s)</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorships.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Nenhum louvor encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWorships.map((worship) => (
                      <TableRow key={worship.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{worship.title}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openYoutubeLink(worship.youtubeLink)}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{worship.key}</Badge>
                        </TableCell>
                        <TableCell>
                          {worship.singer || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {worship.ministers.map((minister, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {minister}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {worship.fileName ? (
                            <div className="flex items-center gap-1 text-sm text-primary">
                              <FileText className="h-4 w-4" />
                              <span className="truncate max-w-[100px]">
                                {worship.fileName}
                              </span>
                            </div>
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
                                navigate(`/repertoire/edit/${worship.id}`)
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
                                    Excluir louvor?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir "{worship.title}"?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(worship.id)}
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

export default Repertoire;
