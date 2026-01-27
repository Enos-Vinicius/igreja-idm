import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  Settings,
  LogOut,
  ChevronLeft,
  Home,
  CalendarCheck,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  onLogout: () => void;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "members",
    label: "Membros",
    icon: Users,
    path: "/members",
  },
  {
    id: "cadastro",
    label: "Auto Cadastro",
    icon: UserPlus,
    path: "/cadastro",
  },
  {
    id: "solicitacoes",
    label: "Solicitações",
    icon: ClipboardList,
    path: "/admin/solicitacoes",
  },
  {
    id: "attendance",
    label: "Presença",
    icon: CalendarCheck,
    path: "/attendance",
  },
  {
    id: "repertoire",
    label: "Repertório",
    icon: Music,
    path: "/repertoire",
  },
  {
    id: "users",
    label: "Usuários",
    icon: Settings,
    path: "/users",
  },
];

const DashboardSidebar = ({ user, onLogout }: DashboardSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const displayName = `${user.firstName} ${user.lastName}`;

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "fixed left-0 top-0 h-screen z-50 flex flex-col bg-secondary text-white transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      {/* Logo Area */}
      <div className="flex items-center h-16 px-3 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-golden to-golden-light flex items-center justify-center flex-shrink-0">
          <span className="text-secondary font-bold text-lg">M</span>
        </div>
        <div
          className={cn(
            "ml-3 overflow-hidden transition-all duration-300",
            isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
          )}
        >
          <span className="text-xs text-white/70 whitespace-nowrap">Igreja do Deus de</span>
          <span className="block text-sm font-bold text-gradient-golden whitespace-nowrap">
            Maravilhas
          </span>
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center px-3 py-4 border-b border-white/10">
        <Avatar className="h-10 w-10 border-2 border-golden flex-shrink-0">
          <AvatarImage src={user.avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-br from-golden to-golden-light text-secondary font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "ml-3 overflow-hidden transition-all duration-300",
            isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
          )}
        >
          <p className="text-sm font-medium text-white whitespace-nowrap">{displayName}</p>
          <p className="text-xs text-white/60 whitespace-nowrap">Administrador</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.id}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200",
                        active
                          ? "bg-primary text-white shadow-lg"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span
                        className={cn(
                          "ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                          isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                        )}
                      >
                        {item.label}
                      </span>
                    </button>
                  </TooltipTrigger>
                  {!isExpanded && (
                    <TooltipContent side="right" className="bg-secondary text-white border-white/20">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-white/10 p-2 space-y-1">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center px-3 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                  isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                )}
              >
                Página Inicial
              </span>
            </button>
          </TooltipTrigger>
          {!isExpanded && (
            <TooltipContent side="right" className="bg-secondary text-white border-white/20">
              Página Inicial
            </TooltipContent>
          )}
        </Tooltip>

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={onLogout}
              className="w-full flex items-center px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                  isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                )}
              >
                Sair
              </span>
            </button>
          </TooltipTrigger>
          {!isExpanded && (
            <TooltipContent side="right" className="bg-secondary text-white border-white/20">
              Sair
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
