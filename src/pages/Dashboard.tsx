import { useMemo } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  Clock,
  TrendingUp,
  Calendar,
  Church,
  Heart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMembers } from "@/data/mockMembers";
import { mockRegistrationRequests } from "@/data/mockRegistrationRequests";

// Mock data for charts
const memberGrowthData = [
  { month: "Jan", membros: 45 },
  { month: "Fev", membros: 52 },
  { month: "Mar", membros: 61 },
  { month: "Abr", membros: 67 },
  { month: "Mai", membros: 75 },
  { month: "Jun", membros: 82 },
  { month: "Jul", membros: 89 },
  { month: "Ago", membros: 95 },
  { month: "Set", membros: 102 },
  { month: "Out", membros: 108 },
  { month: "Nov", membros: 115 },
  { month: "Dez", membros: 120 },
];

const membersByRoleData = [
  { name: "Membros", value: 85, color: "hsl(var(--primary))" },
  { name: "Líderes", value: 12, color: "hsl(var(--golden))" },
  { name: "Pastores", value: 3, color: "hsl(var(--secondary))" },
  { name: "Ministros", value: 8, color: "#22c55e" },
  { name: "Visitantes", value: 15, color: "#8b5cf6" },
];

const weeklyAttendanceData = [
  { dia: "Dom", presentes: 120, esperados: 150 },
  { dia: "Seg", presentes: 45, esperados: 60 },
  { dia: "Ter", presentes: 55, esperados: 70 },
  { dia: "Qua", presentes: 85, esperados: 100 },
  { dia: "Qui", presentes: 40, esperados: 50 },
  { dia: "Sex", presentes: 65, esperados: 80 },
  { dia: "Sáb", presentes: 90, esperados: 110 },
];

const recentActivities = [
  {
    id: 1,
    type: "new_member",
    description: "Lucas Henrique Martins solicitou cadastro",
    time: "Há 2 horas",
    icon: UserPlus,
  },
  {
    id: 2,
    type: "approved",
    description: "Roberto Carlos Ferreira foi aprovado como membro",
    time: "Há 5 horas",
    icon: UserCheck,
  },
  {
    id: 3,
    type: "event",
    description: "Culto de Domingo programado para 09:00",
    time: "Amanhã",
    icon: Calendar,
  },
  {
    id: 4,
    type: "prayer",
    description: "15 novos pedidos de oração recebidos",
    time: "Hoje",
    icon: Heart,
  },
];

const Dashboard = () => {
  const stats = useMemo(() => {
    const totalMembers = mockMembers.length;
    const activeMembers = mockMembers.filter((m) => m.membershipStatus === "active").length;
    const pendingRequests = mockRegistrationRequests.filter((r) => r.status === "pending").length;
    const approvedThisMonth = mockRegistrationRequests.filter((r) => r.status === "approved").length;

    return {
      totalMembers,
      activeMembers,
      pendingRequests,
      approvedThisMonth,
    };
  }, []);

  const summaryCards = [
    {
      title: "Total de Membros",
      value: stats.totalMembers,
      description: "+12% desde o último mês",
      icon: Users,
      trend: "up",
      bgGradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Membros Ativos",
      value: stats.activeMembers,
      description: `${Math.round((stats.activeMembers / stats.totalMembers) * 100)}% do total`,
      icon: UserCheck,
      trend: "up",
      bgGradient: "from-green-500 to-green-600",
    },
    {
      title: "Solicitações Pendentes",
      value: stats.pendingRequests,
      description: "Aguardando aprovação",
      icon: Clock,
      trend: "neutral",
      bgGradient: "from-amber-500 to-amber-600",
    },
    {
      title: "Aprovados este Mês",
      value: stats.approvedThisMonth,
      description: "+3 desde a semana passada",
      icon: TrendingUp,
      trend: "up",
      bgGradient: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo de volta! Aqui está um resumo da sua igreja.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-10`}
                />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{card.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                    </div>
                    <div
                      className={`p-3 rounded-full bg-gradient-to-br ${card.bgGradient} text-white`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Member Growth Chart */}
          <Card className="lg:col-span-2 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Crescimento de Membros
              </CardTitle>
              <CardDescription>Evolução do número de membros ao longo do ano</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={memberGrowthData}>
                    <defs>
                      <linearGradient id="colorMembros" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="membros"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMembros)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Members by Role Pie Chart */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Church className="h-5 w-5 text-primary" />
                Distribuição por Função
              </CardTitle>
              <CardDescription>Membros por tipo de função na igreja</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={membersByRoleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {membersByRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Attendance Chart */}
          <Card className="lg:col-span-2 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Presença Semanal
              </CardTitle>
              <CardDescription>Comparativo de presença esperada vs. realizada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="dia" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="presentes"
                      name="Presentes"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="esperados"
                      name="Esperados"
                      fill="hsl(var(--muted-foreground))"
                      opacity={0.4}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>Últimas atualizações do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-2">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
