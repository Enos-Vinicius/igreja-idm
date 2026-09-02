import { useCallback } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, CalendarRange, TrendingUp, UserMinus, UserCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useDashboardResource } from "@/hooks/useDashboardResource";
import { dashboardService } from "@/services/dashboard";
import { AttendanceRankingMember, DashboardAttendance } from "@/types/dashboard";
import { formatCivilDate, formatMonthKey } from "@/lib/date";
import { CardShell } from "./CardShell";
import { DataNote, ProportionRow, StatTile } from "./primitives";
import {
  AXIS_TICK,
  LABEL_STYLE,
  MAX_BAR_SIZE,
  STACK_GAP,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_STYLE,
  VIZ_GRID,
  VIZ_PRIMARY,
  VIZ_SERIES,
  VIZ_STATUS,
  VIZ_SURFACE,
  formatNumber,
} from "./vizTokens";

interface AttendanceCardProps {
  church?: string;
}

const RANKING_LIMIT = 8;

/** Só o último ponto da série recebe rótulo direto — número em todo ponto não é lido. */
function renderLastPointLabel(total: number) {
  return function LastPointLabel(props: {
    x?: number | string;
    y?: number | string;
    value?: number | string;
    index?: number;
  }) {
    if (props.index !== total - 1) return null;
    const x = Number(props.x ?? 0);
    const y = Number(props.y ?? 0);
    return (
      <text x={x} y={y - 10} textAnchor="end" fontSize={11} fill={LABEL_STYLE.fill}>
        {formatNumber(Number(props.value))}
      </text>
    );
  };
}

/** Marcador só no ponto final, com anel de 2px na cor da superfície. */
function renderLastPointDot(total: number) {
  return function LastPointDot(props: { cx?: number; cy?: number; index?: number }) {
    const key = `dot-${props.index}`;
    if (props.index !== total - 1 || props.cx === undefined || props.cy === undefined) {
      return <g key={key} />;
    }
    return (
      <circle
        key={key}
        cx={props.cx}
        cy={props.cy}
        r={4.5}
        fill={VIZ_PRIMARY}
        stroke={VIZ_SURFACE}
        strokeWidth={2}
      />
    );
  };
}

function rankingSubtitle(member: AttendanceRankingMember, showLastAttendance: boolean): string {
  const parts = [`${member.presencas} de ${member.cultosElegiveis} cultos`];
  if (member.presencasEmOutraIgreja > 0) {
    parts.push(`${member.presencasEmOutraIgreja} na outra igreja`);
  }
  if (showLastAttendance) {
    parts.push(
      member.ultimaPresenca
        ? `última em ${formatCivilDate(member.ultimaPresenca)}`
        : "sem presença registrada"
    );
  }
  return parts.join(" · ");
}

/**
 * Frequência: série mensal, dia da semana e rankings.
 *
 * Sem from/to a API aplica os últimos 6 meses e devolve `padraoAplicado`, que é
 * o que rotula o período aqui — o card não adivinha a janela.
 */
export function AttendanceCard({ church }: AttendanceCardProps) {
  const fetcher = useCallback(
    () => dashboardService.getAttendance({ church, limit: RANKING_LIMIT }),
    [church]
  );
  const resource = useDashboardResource<DashboardAttendance>(fetcher, [church]);

  return (
    <CardShell
      title="Frequência"
      description="Presença ao longo do tempo, por dia da semana e por membro"
      icon={<TrendingUp className="h-5 w-5 text-primary" />}
      resource={resource}
    >
      {(data) => {
        const { periodo, totais, mensal, porIgreja, porDiaDaSemana, maisAssiduos, ausentes } = data;

        const periodLabel =
          periodo.padraoAplicado === "ultimos6Meses"
            ? "Últimos 6 meses"
            : `${formatCivilDate(periodo.de)} a ${formatCivilDate(periodo.ate)}`;

        const monthly = mensal.map((item) => ({
          ...item,
          label: formatMonthKey(item.mes),
        }));

        const weekdays = [...porDiaDaSemana].sort((a, b) => b.mediaPorCulto - a.mediaPorCulto);

        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarRange className="h-3.5 w-3.5" />
              {periodLabel} · {formatCivilDate(periodo.de)} a {formatCivilDate(periodo.ate)}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="Média por culto" value={formatNumber(totais.mediaPorCulto)} />
              <StatTile
                label="Cultos com presença lançada"
                value={`${totais.cultosComPresencaLancada}/${totais.cultosRealizados}`}
                hint={`${totais.cultosSemPresencaLancada} sem lançamento`}
              />
              <StatTile
                label="Presenças no período"
                value={totais.totalPresencas}
                hint={`${totais.membros} de membros · ${totais.visitantes} de visitantes`}
              />
              <StatTile label="Membros ativos" value={totais.membrosAtivos} />
            </div>

            {/* Série mensal — média por culto, não total: o total sobe só porque houve
                mais cultos lançados no mês. */}
            <div>
              <p className="text-sm font-medium text-foreground">Média de presença por mês</p>
              <p className="mb-2 text-xs text-muted-foreground">
                Média por culto lançado; o total do mês depende de quantos cultos foram lançados.
              </p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthly} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vizMediaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={VIZ_PRIMARY} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={VIZ_PRIMARY} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={VIZ_GRID} vertical={false} />
                    <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: VIZ_GRID }} />
                    <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={32} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      formatter={(value: number, name) => [formatNumber(value), name]}
                    />
                    <Area
                      type="monotone"
                      dataKey="mediaPorCulto"
                      name="Média por culto"
                      stroke={VIZ_PRIMARY}
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      fill="url(#vizMediaFill)"
                      isAnimationActive={false}
                      dot={renderLastPointDot(monthly.length)}
                      activeDot={{ r: 5, stroke: VIZ_SURFACE, strokeWidth: 2 }}
                    >
                      <LabelList
                        dataKey="mediaPorCulto"
                        content={renderLastPointLabel(monthly.length)}
                      />
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Membros x visitantes por mês */}
            <div>
              <p className="text-sm font-medium text-foreground">Membros e visitantes por mês</p>
              <p className="mb-2 text-xs text-muted-foreground">
                Visitante é o termômetro de evangelismo e se perde dentro do total.
              </p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={VIZ_GRID} vertical={false} />
                    <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: VIZ_GRID }} />
                    <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="membros"
                      name="Membros"
                      stackId="presencas"
                      fill={VIZ_SERIES[0]}
                      isAnimationActive={false}
                      maxBarSize={MAX_BAR_SIZE}
                      {...STACK_GAP}
                    />
                    <Bar
                      dataKey="visitantes"
                      name="Visitantes"
                      stackId="presencas"
                      fill={VIZ_SERIES[1]}
                      isAnimationActive={false}
                      maxBarSize={MAX_BAR_SIZE}
                      radius={[4, 4, 0, 0]}
                      {...STACK_GAP}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Média por dia da semana */}
            <div>
              <p className="text-sm font-medium text-foreground">Média por dia da semana</p>
              <p className="mb-2 text-xs text-muted-foreground">
                Só aparecem os dias que têm culto no período.
              </p>
              <div style={{ height: Math.max(120, weekdays.length * 34 + 28) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weekdays}
                    layout="vertical"
                    margin={{ top: 0, right: 44, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke={VIZ_GRID} horizontal={false} />
                    <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={AXIS_TICK}
                      tickLine={false}
                      axisLine={false}
                      width={72}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      formatter={(value: number, _name, entry) => [
                        `${formatNumber(value)} · ${entry?.payload?.cultosComPresencaLancada ?? 0} de ${entry?.payload?.cultos ?? 0} cultos lançados`,
                        "Média por culto",
                      ]}
                    />
                    <Bar
                      dataKey="mediaPorCulto"
                      name="Média por culto"
                      fill={VIZ_PRIMARY}
                      isAnimationActive={false}
                      maxBarSize={MAX_BAR_SIZE}
                      radius={[0, 4, 4, 0]}
                    >
                      <LabelList
                        dataKey="mediaPorCulto"
                        position="right"
                        formatter={(value: number) => formatNumber(value)}
                        style={LABEL_STYLE}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <Separator />

            {/* Comparação entre igrejas */}
            {!church && porIgreja.length > 1 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Ainda não compare a frequência das duas igrejas</AlertTitle>
                <AlertDescription>
                  Os denominadores são incomparáveis: o ranking global fica dominado por quem lançou
                  mais presença, não por quem frequenta mais. Selecione uma igreja no filtro acima
                  para ler os rankings.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Por igreja</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="py-2 text-left font-medium">Igreja</th>
                      <th className="py-2 text-right font-medium">Lançados</th>
                      <th className="py-2 text-right font-medium">Média</th>
                      <th className="py-2 text-right font-medium">Taxa s/ ativos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {porIgreja.map((item) => (
                      <tr key={item.church} className="border-b border-border/60 last:border-0">
                        <td className="py-2 text-foreground">{item.church}</td>
                        <td className="py-2 text-right tabular-nums text-muted-foreground">
                          {item.cultosComPresencaLancada}/{item.cultos}
                        </td>
                        <td className="py-2 text-right tabular-nums text-foreground">
                          {formatNumber(item.mediaPorCulto)}
                        </td>
                        <td className="py-2 text-right tabular-nums text-foreground">
                          {item.taxaSobreAtivos}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <DataNote>
                A coluna "lançados" acompanha qualquer taxa de propósito: é sobre quantos cultos ela
                foi calculada.
              </DataNote>
            </div>

            {/* Rankings */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <UserCheck className="h-4 w-4" style={{ color: VIZ_STATUS.good }} />
                  Mais assíduos
                </p>
                {maisAssiduos.length ? (
                  <ul className="space-y-1">
                    {maisAssiduos.map((member) => (
                      <ProportionRow
                        key={`${member.memberId}-assiduo`}
                        name={member.name.trim()}
                        percent={member.taxa}
                        primary={`${member.taxa}%`}
                        secondary={rankingSubtitle(member, false)}
                        color={VIZ_SERIES[0]}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem presença lançada no período.</p>
                )}
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <UserMinus className="h-4 w-4" style={{ color: VIZ_STATUS.warning }} />
                  Ausentes
                </p>
                {ausentes.length ? (
                  <ul className="space-y-1">
                    {ausentes.map((member) => (
                      <ProportionRow
                        key={`${member.memberId}-ausente`}
                        name={member.name.trim()}
                        percent={member.taxa}
                        primary={`${member.taxa}%`}
                        secondary={rankingSubtitle(member, true)}
                        color={VIZ_SERIES[1]}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem ausências no período.</p>
                )}
                <DataNote>
                  Taxa baixa com presenças na outra igreja não é ausência — é frequência em outro
                  lugar.
                </DataNote>
              </div>
            </div>
          </div>
        );
      }}
    </CardShell>
  );
}
