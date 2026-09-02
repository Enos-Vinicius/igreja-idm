import { useCallback, useState } from "react";
import { Crown, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDashboardResource } from "@/hooks/useDashboardResource";
import { dashboardService } from "@/services/dashboard";
import { DashboardFamilies } from "@/types/dashboard";
import { CardShell } from "./CardShell";
import { DataNote, Meter, ShareBar, StatTile } from "./primitives";
import { formatNumber } from "./vizTokens";

interface FamiliesCardProps {
  church?: string;
}

const INITIAL_VISIBLE = 6;

/**
 * Famílias. O card abre pela lacuna de cobertura, não pelo total de famílias:
 * hoje o número que pede ação é quantos membros ainda não estão organizados.
 *
 * `maiores` é subconjunto de `familias` — renderizar as duas como seções irmãs
 * duplicaria as mesmas famílias na tela, então aqui ela só marca um destaque
 * dentro da lista completa.
 */
export function FamiliesCard({ church }: FamiliesCardProps) {
  const [showAll, setShowAll] = useState(false);
  const fetcher = useCallback(() => dashboardService.getFamilies({ church }), [church]);
  const resource = useDashboardResource<DashboardFamilies>(fetcher, [church]);

  return (
    <CardShell
      title="Famílias"
      description="Cobertura do cadastro familiar e vínculos já registrados"
      icon={<Home className="h-5 w-5 text-primary" />}
      resource={resource}
    >
      {(data) => {
        const { totais, porPapel, maiores, familias } = data;
        const highlightId = maiores[0]?.id;
        const ordered = [...familias].sort((a, b) => b.totalMembros - a.totalMembros);
        const visible = showAll ? ordered : ordered.slice(0, INITIAL_VISIBLE);

        return (
          <div className="space-y-6">
            <Meter
              label="Cobertura do cadastro familiar"
              value={totais.coberturaPercentual}
              detail={`${totais.membrosVinculados} de ${totais.totalMembros} membros vinculados · ${totais.membrosSemFamilia} ainda sem família cadastrada`}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatTile label="Famílias cadastradas" value={totais.familias} />
              <StatTile
                label="Vínculos"
                value={totais.vinculos}
                hint="Maior que o número de membros vinculados porque um membro pode estar em mais de uma família"
              />
              <StatTile
                label="Média de membros por família"
                value={formatNumber(totais.mediaMembrosPorFamilia)}
              />
            </div>

            {porPapel.length > 0 && (
              <ShareBar
                title="Vínculos por papel"
                segments={porPapel.map((item) => ({ label: item.role, value: item.total }))}
                unit="vínculos"
              />
            )}

            <Separator />

            <div>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  Famílias {ordered.length > 0 && <span className="text-muted-foreground">({ordered.length})</span>}
                </p>
                {ordered.length > INITIAL_VISIBLE && (
                  <Button variant="ghost" size="sm" onClick={() => setShowAll((value) => !value)}>
                    {showAll ? "Ver menos" : `Ver todas (${ordered.length})`}
                  </Button>
                )}
              </div>

              {ordered.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma família cadastrada neste recorte.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {visible.map((family) => (
                    <div key={family.id} className="rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{family.name.trim()}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {family.church} · {family.totalMembros} membro(s)
                            {family.criancas > 0 ? ` · ${family.criancas} criança(s)` : ""}
                          </p>
                        </div>
                        {family.id === highlightId && (
                          <Badge variant="secondary" className="shrink-0 gap-1">
                            <Crown className="h-3 w-3" />
                            Maior
                          </Badge>
                        )}
                      </div>

                      <ul className="mt-2 space-y-1">
                        {family.membros.map((member) => (
                          <li
                            key={`${family.id}-${member.memberId}-${member.role}`}
                            className="flex items-baseline justify-between gap-2 text-xs"
                          >
                            <span className="truncate text-foreground">{member.name.trim()}</span>
                            <span className="shrink-0 text-muted-foreground">{member.role}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <DataNote>
                Um mesmo membro pode aparecer em mais de uma família (como filho em uma e cônjuge em
                outra) — nomes repetidos aqui não são duplicidade de cadastro.
              </DataNote>
            </div>
          </div>
        );
      }}
    </CardShell>
  );
}
