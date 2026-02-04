import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
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
  Heart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logoWhite from "@/assets/logo-white.png";
import { UserRole } from "@/types/user";
import { canAccessFeature, Feature } from "@/config/permissions";

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  feature?: Feature; // Optional feature for permission checking
}

const DashboardMobileHome = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const userRole = (user?.role as UserRole) || "member";

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
      // Dashboard is always visible
    },
    {
      id: "members",
      title: "Membros",
      description: "Gerenciar membros da igreja",
      icon: Users,
      path: "/members",
      feature: "members",
    },
    {
      id: "requests",
      title: "Solicitações",
      description: "Pedidos de cadastro",
      icon: ClipboardList,
      path: "/admin/solicitacoes",
      feature: "registration-requests",
    },
    {
      id: "repertoire",
      title: "Repertório",
      description: "Músicas e louvor",
      icon: Music,
      path: "/repertoire",
      feature: "songs",
    },
    {
      id: "schedules",
      title: "Escalas",
      description: "Escalas de louvor",
      icon: CalendarDays,
      path: "/schedules",
      feature: "schedules",
    },
    {
      id: "attendance",
      title: "Presença",
      description: "Controle de presença",
      icon: ClipboardCheck,
      path: "/attendance",
      feature: "attendance",
    },
    {
      id: "calendar",
      title: "Calendário",
      description: "Eventos e programações",
      icon: CalendarIcon,
      path: "/calendar",
      // Calendar might not have specific permissions yet
    },
    {
      id: "prayer-requests",
      title: "Pedidos de Oração",
      description: "Gerenciar pedidos de oração",
      icon: Heart,
      path: "/admin/prayer-requests",
      feature: "prayer-requests",
    },
    {
      id: "users",
      title: "Usuários",
      description: "Administração de usuários",
      icon: Settings,
      path: "/users",
      feature: "users",
    },
  ];

  // Filter cards based on user role permissions
  const filteredCards = useMemo(() => {
    return dashboardCards.filter((card) => {
      // If card has no feature requirement, show it to everyone
      if (!card.feature) return true;
      // Check if user has permission for this feature
      return canAccessFeature(userRole, card.feature);
    });
  }, [userRole]);

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
        {filteredCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.97] aspect-square rounded-2xl"
              onClick={() => handleCardClick(card.path, card.id)}
            >
              <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #00d4ff 0%, #0099ff 50%, #0066ff 100%)"
                  }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {card.description}
                  </p>
                </div>
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
