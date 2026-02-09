import { useState, useMemo } from "react";
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
  Heart,
  CreditCard,
  Church,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoWhite from "@/assets/logo-white.png";
import { UserRole } from "@/types/user";
import { canAccessFeature, Feature } from "@/config/permissions";

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
  feature?: Feature; // Optional feature for permission checking
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
        id: "member-area",
        label: "Área de Membro",
        icon: CreditCard,
        path: "/member-home",
        // Member area for non-admin users
      },
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
        // Dashboard is always visible
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
        feature: "members",
      },
      {
        id: "solicitacoes",
        label: "Solicitações",
        icon: ClipboardList,
        path: "/admin/solicitacoes",
        feature: "registration-requests",
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
        feature: "songs",
      },
      {
        id: "schedules",
        label: "Escalas",
        icon: Calendar,
        path: "/schedules",
        feature: "schedules",
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
        feature: "attendance",
      },
      {
        id: "calendar",
        label: "Calendário",
        icon: CalendarCheck,
        path: "/calendar",
        // Calendar might not have specific permissions yet
      },
    ],
  },
  {
    id: "admin",
    label: "Administração",
    items: [
      {
        id: "prayer-requests",
        label: "Pedidos de Oração",
        icon: Heart,
        path: "/admin/prayer-requests",
        feature: "prayer-requests",
      },
      {
        id: "users",
        label: "Usuários",
        icon: Settings,
        path: "/users",
        feature: "users",
      },
      {
        id: "service-schedule",
        label: "Cultos",
        icon: Church,
        path: "/service-schedule",
        feature: "schedules",
      },
    ],
  },
];

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  admin2: "Administrador 2",
  secretary: "Secretária",
  treasurer: "Tesoureiro",
  receptionist: "Recepcionista",
  leader: "Líder",
  member: "Membro",
};

const DashboardSidebar = ({ user, onLogout }: DashboardSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const displayName = `${user.firstName} ${user.lastName}`;
  const userRole = (user.role as UserRole) || "member";
  const roleLabel = roleLabels[userRole] || "Membro";

  const isActive = (path: string) => location.pathname === path;

  // Filter menu items based on user role permissions
  const filteredMenuGroups = useMemo(() => {
    const isAdmin = userRole === "admin" || userRole === "admin2";

    return menuGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          // Hide "Área de Membro" for admin and admin2
          if (item.id === "member-area" && isAdmin) return false;

          // If item has no feature requirement, show it to everyone
          if (!item.feature) return true;
          // Check if user has permission for this feature
          return canAccessFeature(userRole, item.feature);
        }),
      }))
      .filter((group) => group.items.length > 0); // Remove empty groups
  }, [userRole]);

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
        <img
          src={logoWhite}
          alt="Igreja do Deus de Maravilhas"
          className="w-10 h-10 object-contain flex-shrink-0 cursor-pointer"
          onClick={() => navigate("/")}
        />
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
            {roleLabel}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-4 px-2">
          {filteredMenuGroups.map((group, groupIndex) => (
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
