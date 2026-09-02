import { useCallback } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { UsersRound } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useDashboardResource } from "@/hooks/useDashboardResource";
import { dashboardService } from "@/services/dashboard";
import { DashboardDemographics } from "@/types/dashboard";
import { CardShell } from "./CardShell";
import { DataNote, ShareBar, StatTile } from "./primitives";
import {
  AXIS_TICK,
  LABEL_STYLE,
  MAX_BAR_SIZE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_STYLE,
  VIZ_GRID,
  VIZ_PRIMARY,
  formatNumber,
} from "./vizTokens";

interface DemographicsCardProps {
  church?: string;
}

/** Abaixo disso o gráfico incompleto parece defeito do sistema; então explique. */
const QUALITY_THRESHOLD = 85;
const TOP_NEIGHBORHOODS = 8;

const FIELD_LABELS: Record<string, string> = {
  birthDate: "data de nascimento",
  maritalStatus: "estado civil",
  neighborhood: "bairro",
  gender: "gênero",
  churchRole: "cargo",
  photoUrl: "foto",
};

/** Ordena faixas pela idade inicial: a leitura é a forma da distribuição, não o ranking. */
function ageBandOrder(faixa: string): number {
  const match = /\d+/.exec(faixa);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

export function DemographicsCard({ church }: DemographicsCardProps) {
  const fetcher = useCallback(() => dashboardService.getDemographics({ church }), [church]);
  const resource = useDashboardResource<DashboardDemographics>(fetcher, [church]);

  return (
    <CardShell
      title="Perfil da comunidade"
      description="Idade, estado civil, gênero, bairro e cargo"
      icon={<UsersRound className="h-5 w-5 text-primary" />}
      resource={resource}
    >
      {(data) => {
        // Mais velhos no topo: com o eixo de categoria na vertical, a faixa
        // decrescente faz a idade crescer para cima, como uma pirâmide.
        const ageBands = [...data.porFaixaDeIdade].sort(
          (a, b) => ageBandOrder(b.faixa) - ageBandOrder(a.faixa)
        );

        const rankedNeighborhoods = [...data.porBairro].sort((a, b) => b.total - a.total);
        const topNeighborhoods = rankedNeighborhoods.slice(0, TOP_NEIGHBORHOODS);
        const tail = rankedNeighborhoods.slice(TOP_NEIGHBORHOODS);
        const neighborhoodData = [
          ...topNeighborhoods.map((item) => ({
            label: item.neighborhood,
            city: item.city,
            total: item.total,
          })),
          ...(tail.length
            ? [
                {
                  label: `Outros (${tail.length} bairros)`,
                  city: "",
                  total: tail.reduce((sum, item) => sum + item.total, 0),
                },
              ]
            : []),
        ];

        const lowQuality = Object.entries(data.qualidadeDosDados)
          .filter(([, quality]) => quality.percentual < QUALITY_THRESHOLD)
          .map(([field, quality]) => ({
            field: FIELD_LABELS[field] ?? field,
            percentual: quality.percentual,
          }));

        const neighborhoodQuality = data.qualidadeDosDados.neighborhood;

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatTile label="Membros no recorte" value={data.total} />
              <StatTile label="Idade média" value={`${formatNumber(data.idade.media)} anos`} />
              <StatTile
                label="Faixa de idade"
                value={`${data.idade.minima} a ${data.idade.maxima}`}
                hint="Idade do mais novo ao mais velho"
              />
            </div>

            {/* Faixas de idade */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Distribuição por faixa de idade</p>
              <div style={{ height: Math.max(140, ageBands.length * 32 + 24) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ageBands}
                    layout="vertical"
                    margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke={VIZ_GRID} horizontal={false} />
                    <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="faixa"
                      tick={AXIS_TICK}
                      tickLine={false}
                      axisLine={false}
                      width={64}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
                    <Bar
                      dataKey="total"
                      name="Membros"
                      fill={VIZ_PRIMARY}
                      isAnimationActive={false}
                      maxBarSize={MAX_BAR_SIZE}
                      radius={[0, 4, 4, 0]}
                    >
                      <LabelList dataKey="total" position="right" style={LABEL_STYLE} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {data.qualidadeDosDados.birthDate &&
                data.qualidadeDosDados.birthDate.percentual < QUALITY_THRESHOLD && (
                  <DataNote>
                    {data.qualidadeDosDados.birthDate.percentual}% dos cadastros têm data de
                    nascimento informada.
                  </DataNote>
                )}
            </div>

            <Separator />

            {/* Estado civil e gênero */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <ShareBar
                  title="Estado civil"
                  segments={data.porEstadoCivil.map((item) => ({
                    label: item.estadoCivil,
                    value: item.total,
                  }))}
                  unit="membros"
                />
                {data.qualidadeDosDados.maritalStatus &&
                  data.qualidadeDosDados.maritalStatus.percentual < QUALITY_THRESHOLD && (
                    <DataNote>
                      {data.qualidadeDosDados.maritalStatus.percentual}% dos cadastros têm estado
                      civil informado.
                    </DataNote>
                  )}
              </div>
              <div>
                <ShareBar
                  title="Gênero"
                  segments={data.porGenero.map((item) => ({ label: item.genero, value: item.total }))}
                  unit="membros"
                />
                {data.qualidadeDosDados.gender &&
                  data.qualidadeDosDados.gender.percentual < QUALITY_THRESHOLD && (
                    <DataNote>
                      {data.qualidadeDosDados.gender.percentual}% dos cadastros têm gênero informado.
                    </DataNote>
                  )}
              </div>
            </div>

            <Separator />

            {/* Bairros */}
            <div>
              <p className="text-sm font-medium text-foreground">Bairros</p>
              <p className="mb-2 text-xs text-muted-foreground">
                Top {TOP_NEIGHBORHOODS} por número de membros — útil para visitação e células.
              </p>
              <div style={{ height: Math.max(140, neighborhoodData.length * 30 + 24) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={neighborhoodData}
                    layout="vertical"
                    margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke={VIZ_GRID} horizontal={false} />
                    <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={AXIS_TICK}
                      tickLine={false}
                      axisLine={false}
                      width={132}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      formatter={(value: number, _name, entry) => [
                        value,
                        entry?.payload?.city ? `Membros · ${entry.payload.city}` : "Membros",
                      ]}
                    />
                    <Bar
                      dataKey="total"
                      name="Membros"
                      fill={VIZ_PRIMARY}
                      isAnimationActive={false}
                      maxBarSize={MAX_BAR_SIZE}
                      radius={[0, 4, 4, 0]}
                    >
                      <LabelList dataKey="total" position="right" style={LABEL_STYLE} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {neighborhoodQuality && neighborhoodQuality.percentual < 100 && (
                <DataNote>
                  {neighborhoodQuality.percentual}% dos cadastros têm bairro informado (
                  {neighborhoodQuality.preenchidos} de {neighborhoodQuality.total}) — o que falta no
                  gráfico é cadastro em aberto, não erro.
                </DataNote>
              )}
            </div>

            <Separator />

            {/* Cargos — lista, não gráfico: uma fatia de 83% não diz nada */}
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Cargos na igreja</p>
              <ul className="divide-y divide-border/60">
                {data.porCargo.map((item) => (
                  <li key={item.cargo} className="flex items-baseline justify-between gap-3 py-1.5">
                    <span className="truncate text-sm text-foreground">{item.cargo}</span>
                    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                      {item.total}
                      {data.total > 0 && (
                        <span className="ml-1 text-xs">
                          ({Math.round((item.total / data.total) * 100)}%)
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {lowQuality.length > 0 && (
              <DataNote>
                Campos com preenchimento abaixo de {QUALITY_THRESHOLD}%:{" "}
                {lowQuality.map((item) => `${item.field} (${item.percentual}%)`).join(", ")}.
              </DataNote>
            )}
          </div>
        );
      }}
    </CardShell>
  );
}
