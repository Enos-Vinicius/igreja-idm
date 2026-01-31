import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  Music,
  Calendar as CalendarIcon,
  ClipboardCheck,
  CalendarDays,
  Settings,
  LogOut,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logoWhite from "@/assets/logo-white.png";

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

const DashboardMobileHome = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardCards: DashboardCard[] = [
    {
      id: "dashboard",
      title: "Visão Geral",
      description: "Estatísticas e gráficos",
      icon: LayoutDashboard,
      path: "/dashboard",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "members",
      title: "Membros",
      description: "Gerenciar membros da igreja",
      icon: Users,
      path: "/members",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "requests",
      title: "Solicitações",
      description: "Pedidos de cadastro",
      icon: ClipboardList,
      path: "/admin/solicitacoes",
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "repertoire",
      title: "Repertório",
      description: "Músicas e louvor",
      icon: Music,
      path: "/repertoire",
      color: "from-pink-500 to-pink-600",
    },
    {
      id: "schedules",
      title: "Escalas",
      description: "Escalas de louvor",
      icon: CalendarDays,
      path: "/schedules",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      id: "attendance",
      title: "Presença",
      description: "Controle de presença",
      icon: ClipboardCheck,
      path: "/attendance",
      color: "from-teal-500 to-teal-600",
    },
    {
      id: "calendar",
      title: "Calendário",
      description: "Eventos e programações",
      icon: CalendarIcon,
      path: "/calendar",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      id: "users",
      title: "Usuários",
      description: "Administração de usuários",
      icon: Settings,
      path: "/users",
      color: "from-red-500 to-red-600",
    },
  ];

  const handleCardClick = (path: string, cardId: string) => {
    if (cardId === "dashboard") {
      // Para o card de Visão Geral, passa um state para forçar a exibição completa
      navigate(path, { state: { showFullDashboard: true } });
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-background md:hidden">
      {/* Header */}
      <header className="bg-secondary text-white px-4 py-4 flex items-center shadow-md">
        <img
          src={logoWhite}
          alt="Igreja do Deus de Maravilhas"
          className="w-10 h-10 object-contain cursor-pointer"
          onClick={() => navigate("/")}
        />
        <h1 className="flex-1 text-xl font-bold text-center">Painel Administrativo</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-white hover:bg-white/10"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      {/* Cards Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
              onClick={() => handleCardClick(card.path, card.id)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[140px]">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-secondary mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-tight">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default DashboardMobileHome;
