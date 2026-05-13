import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  Hash,
  Loader2,
  Filter,
  X,
  PieChart,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import MobileBackButton from "@/components/MobileBackButton";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { contributionsService } from "@/services/contributions";
import {
  Contribution,
  ContributionSummary,
  ContributionType,
  CONTRIBUTION_TYPES,
} from "@/types/contribution";
import { CHURCH_LOCATIONS, ChurchLocation } from "@/types/member";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/config/permissions";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const Contributions = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [summary, setSummary] = useState<ContributionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contribution | null>(null);

  // Filtros
  const [churchFilter, setChurchFilter] = useState<string>(() => currentUser?.member?.church ?? "all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const loadData = async () => {
    setIsLoading(true);
    setIsLoadingSummary(true);

    const filtersForList = {
      church: churchFilter !== "all" ? (churchFilter as ChurchLocation) : undefined,
      type: typeFilter !== "all" ? (typeFilter as ContributionType) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    const filtersForSummary = {
      church: filtersForList.church,
      startDate: filtersForList.startDate,
      endDate: filtersForList.endDate,
    };

    try {
      const [list, sum] = await Promise.all([
        contributionsService.getAll(filtersForList),
        contributionsService.getSummary(filtersForSummary),
      ]);
      setContributions(list);
      setSummary(sum);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar contribuições";
      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [churchFilter, typeFilter, startDate, endDate]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(deleteTarget.id);
    try {
      await contributionsService.delete(deleteTarget.id);
      setContributions((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success("Contribuição excluída. Esta ação foi registrada como auditoria.");
      // Recarrega summary
      const sum = await contributionsService.getSummary({
        church: churchFilter !== "all" ? (churchFilter as ChurchLocation) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setSummary(sum);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir contribuição";
      toast.error(message);
    } finally {
      setIsDeleting(null);
      setDeleteTarget(null);
    }
  };

  const clearFilters = () => {
    setChurchFilter("all");
    setTypeFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = churchFilter !== "all" || typeFilter !== "all" || startDate || endDate;

  const summaryCards = useMemo(() => {
    const totalAmount = summary?.total ?? 0;
    const totalCount = summary?.count ?? 0;
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    return [
      {
        label: "Total Arrecadado",
        value: formatCurrency(totalAmount),
        icon: DollarSign,
        bgGradient: "from-green-500 to-green-600",
      },
      {
        label: "Lançamentos",
        value: String(totalCount),
        icon: Hash,
        bgGradient: "from-blue-500 to-blue-600",
      },
      {
        label: "Ticket Médio",
        value: formatCurrency(avgAmount),
        icon: TrendingUp,
        bgGradient: "from-purple-500 to-purple-600",
      },
    ];
  }, [summary]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <MobileBackButton />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              Contribuições
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie dízimos, ofertas e demais contribuições da igreja
            </p>
          </div>
          {currentUser && hasPermission(currentUser.role, "contributions", "create") && (
            <Button onClick={() => navigate("/contributions/new")} className="gap-2">
              <Plus className="h-4 w-4" />
              Lançar Contribuições
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="relative overflow-hidden border-0 shadow-lg">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-10`} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                      {isLoadingSummary ? (
                        <Loader2 className="h-6 w-6 animate-spin mt-2 text-muted-foreground" />
                      ) : (
                        <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                          {card.value}
                        </p>
                      )}
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-br ${card.bgGradient} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* By Type breakdown */}
        {summary && summary.byType.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Distribuição por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {summary.byType.map((item) => (
                  <div key={item.type} className="p-3 rounded-lg border bg-card">
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                    <p className="text-lg font-bold mt-1">{formatCurrency(item.total)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.count} {item.count === 1 ? "lançamento" : "lançamentos"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="h-3.5 w-3.5" />
                  Limpar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Igreja
                </label>
                <Select value={churchFilter} onValueChange={setChurchFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Igreja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Igrejas</SelectItem>
                    {CHURCH_LOCATIONS.map((church) => (
                      <SelectItem key={church} value={church}>
                        {church}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Tipo
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {CONTRIBUTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Data Inicial
                </label>
                <DateInput
                  value={startDate}
                  onChangeString={(v) => setStartDate(v || "")}
                  placeholder="DD/MM/AAAA"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Data Final
                </label>
                <DateInput
                  value={endDate}
                  onChangeString={(v) => setEndDate(v || "")}
                  placeholder="DD/MM/AAAA"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div>
          <p className="text-sm text-muted-foreground">
            {contributions.length} {contributions.length === 1 ? "contribuição encontrada" : "contribuições encontradas"}
          </p>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Membro / Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="hidden md:table-cell">Método</TableHead>
                    <TableHead className="hidden lg:table-cell">Registrado por</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Carregando...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : contributions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhuma contribuição encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    contributions.map((c) => {
                      const rowDeleting = isDeleting === c.id;
                      const personName = c.member?.name || c.nonMemberName || "—";
                      const eventDate = c.serviceSchedule?.date
                        ? format(new Date(c.serviceSchedule.date), "dd/MM/yyyy", { locale: ptBR })
                        : "—";
                      return (
                        <TableRow key={c.id} className={rowDeleting ? "opacity-50 pointer-events-none" : ""}>
                          <TableCell className="font-medium">{eventDate}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{personName}</span>
                              {!c.member && c.nonMemberName && (
                                <Badge variant="outline" className="text-xs">
                                  Visitante
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{c.type}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(c.amount)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {c.paymentMethod || "—"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {c.registeredBy?.name || c.registeredBy?.email || "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {currentUser && hasPermission(currentUser.role, "contributions", "edit") && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/contributions/edit/${c.id}`)}
                                  title="Editar"
                                  disabled={rowDeleting}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {currentUser && hasPermission(currentUser.role, "contributions", "delete") && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteTarget(c)}
                                  title="Excluir"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={rowDeleting}
                                >
                                  {rowDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir contribuição</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a contribuição de{" "}
                <strong>{deleteTarget?.member?.name || deleteTarget?.nonMemberName}</strong> no valor de{" "}
                <strong>{deleteTarget ? formatCurrency(deleteTarget.amount) : ""}</strong>?
                <br />
                <span className="text-amber-600 mt-2 block">
                  Essa ação é registrada como auditoria — o lançamento será marcado como excluído, mas permanece no banco para histórico financeiro.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Contributions;
