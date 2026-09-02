import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Baby, CalendarClock, ChevronRight, Gauge, Globe2, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useDashboardResource } from "@/hooks/useDashboardResource";
import { dashboardService } from "@/services/dashboard";
import { DashboardOverview } from "@/types/dashboard";
import { formatCivilDate, formatCivilWeekday } from "@/lib/date";
import { CardShell } from "./CardShell";
import { DataNote, ShareBar, StatTile } from "./primitives";
import { formatNumber } from "./vizTokens";

interface OverviewCardProps {
  church?: string;
  /** Recebe membros.porIgreja para alimentar o seletor de igreja. */
  onLoaded?: (overview: DashboardOverview) => void;
}

/**
 * Panorama geral. É o endpoint mais lento (~5,6 s medidos, mais a abertura de
 * conexão), por isso carrega por conta própria em vez de bloquear a tela.
 */
export function OverviewCard({ church, onLoaded }: OverviewCardProps) {
  const navigate = useNavigate();

  const fetcher = useCallback(async () => {
    const data = await dashboardService.getOverview({ church });
    onLoaded?.(data);
    return data;
  }, [church, onLoaded]);

  const resource = useDashboardResource(fetcher, [church]);

  return (
    <CardShell
      title="Panorama"
      description="Membros, presença dos últimos 30 dias e o que está pendente"
      icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
      resource={resource}
    >
      {(data) => {
        const { membros, cultos, presenca, pendencias } = data;
        const media = presenca.ultimos30Dias.mediaPorCulto;

        const pendingItems = [
          {
            label: "Solicitações de cadastro",
            value: pendencias.solicitacoesDeCadastro,
            path: "/admin/solicitacoes",
          },
          {
            label: "Pedidos de oração não lidos",
            value: pendencias.pedidosDeOracaoNaoLidos,
            path: "/admin/prayer-requests",
            global: pendencias.pedidosDeOracaoEhGlobal,
          },
          {
            label: "Cultos sem presença lançada",
            value: pendencias.cultosSemPresencaLancada,
            path: "/attendance",
          },
        ];

        return (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile
                label="Presença média por culto"
                value={formatNumber(media)}
                delta={{
                  value: presenca.variacao.mediaPorCulto,
                  percent: presenca.variacao.percentual,
                  versus: "vs. 30 dias anteriores",
                }}
              />
              <StatTile
                label="Taxa média sobre ativos"
                value={`${presenca.taxaMediaSobreAtivos}%`}
                hint={`${presenca.ultimos30Dias.cultosComPresencaLancada} de ${presenca.ultimos30Dias.cultosNoPeriodo} cultos com presença lançada`}
              />
              <StatTile
                label="Membros ativos"
                value={membros.ativos}
                hint={`de ${membros.total} cadastrados${membros.inativos ? ` · ${membros.inativos} inativo(s)` : ""}`}
              />
              <StatTile
                label="Cultos no mês corrente"
                value={cultos.noMesCorrente}
                hint={`${presenca.ultimos30Dias.visitantes} visitante(s) em 30 dias`}
              />
            </div>

            {/* Próximo culto */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Próximo culto</p>
              </div>
              {cultos.proximo ? (
                <button
                  type="button"
                  onClick={() => navigate("/service-schedule")}
                  className="group flex w-full items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4 text-left transition-colors hover:bg-muted/60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{cultos.proximo.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {formatCivilWeekday(cultos.proximo.date)},{" "}
                      {formatCivilDate(cultos.proximo.date, "dd 'de' MMMM")} às{" "}
                      {cultos.proximo.time.slice(0, 5)}
                      {cultos.proximo.endTime ? ` – ${cultos.proximo.endTime.slice(0, 5)}` : ""}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{cultos.proximo.city}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {cultos.proximo.hasKidsMinistry && (
                      <Badge variant="secondary" className="gap-1">
                        <Baby className="h-3 w-3" />
                        Infantil
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ) : (
                <p className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
                  Nenhum culto futuro cadastrado — a agenda precisa ser lançada à frente.
                </p>
              )}
            </div>

            <Separator />

            {/* Composição de membros */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <ShareBar title="Membros por igreja" segments={membros.porIgreja.map((item) => ({ label: item.church, value: item.total }))} unit="membros" />
              <ShareBar title="Membros por tipo" segments={membros.porTipo.map((item) => ({ label: item.tipo, value: item.total }))} unit="membros" />
            </div>

            <Separator />

            {/* Pendências */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Pendências</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {pendingItems.map((item) => {
                  const isZero = item.value === 0;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "flex items-start justify-between gap-2 rounded-lg border p-3 text-left transition-colors",
                        isZero
                          ? "border-border bg-muted/20 hover:bg-muted/40"
                          : "border-primary/30 bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-2xl font-semibold",
                            isZero ? "text-muted-foreground" : "text-foreground"
                          )}
                        >
                          {item.value}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
                        {item.global && church && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Globe2 className="h-3 w-3" />
                            número global
                          </span>
                        )}
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>

              {pendencias.pedidosDeOracaoEhGlobal && church && (
                <DataNote>
                  Pedidos de oração chegam pelo site sem vínculo com congregação, então esse contador
                  ignora o filtro de igreja e é o mesmo nos dois recortes.
                </DataNote>
              )}
              <DataNote>
                <span className="inline-flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  Cultos sem presença considera só os já realizados nos últimos 30 dias.
                </span>
              </DataNote>
            </div>
          </div>
        );
      }}
    </CardShell>
  );
}
