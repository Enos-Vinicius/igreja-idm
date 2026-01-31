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
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoWhite from "@/assets/logo-white.png";

interface DashboardSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role?: string;
  };
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
}

interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    id: "main",
    label: "Principal",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
      },
    ],
  },
  {
    id: "people",
    label: "Pessoas",
    items: [
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
    ],
  },
  {
    id: "worship",
    label: "Louvor",
    items: [
      {
        id: "repertoire",
        label: "Repertório",
        icon: Music,
        path: "/repertoire",
      },
      {
        id: "schedules",
        label: "Escalas",
        icon: Calendar,
        path: "/schedules",
      },
    ],
  },
  {
    id: "events",
    label: "Eventos",
    items: [
      {
        id: "attendance",
        label: "Presença",
        icon: CalendarCheck,
        path: "/attendance",
      },
      {
        id: "calendar",
        label: "Calendário",
        icon: CalendarCheck,
        path: "/calendar",
      },
    ],
  },
  {
    id: "admin",
    label: "Administração",
    items: [
      {
        id: "users",
        label: "Usuários",
        icon: Settings,
        path: "/users",
      },
    ],
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
        "hidden md:flex fixed left-0 top-0 h-screen z-50 flex-col bg-secondary text-white transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      {/* Logo Area */}
      <div className="flex items-center h-16 px-3 border-b border-white/10">
        <img src={logoWhite} alt="Igreja do Deus de Maravilhas" className="w-10 h-10 object-contain flex-shrink-0" />
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
          <p className="text-xs text-white/60 whitespace-nowrap">
            {user.role === 'admin' ? 'Administrador' : 'Membro'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-4 px-2">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.id}>
              {/* Group separator - not shown for first group */}
              {groupIndex > 0 && (
                <div className="my-3 border-t border-white/10" />
              )}
              
              {/* Group label */}
              <div
                className={cn(
                  "px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/40 transition-all duration-300",
                  isExpanded ? "opacity-100" : "opacity-0 h-0 py-0 overflow-hidden"
                )}
              >
                {group.label}
              </div>

              {/* Group items */}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <li key={item.id}>
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
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-white/10 p-2 space-y-1">
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
      </div>
    </aside>
  );
};

export default DashboardSidebar;
