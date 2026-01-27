import { ChevronDown, Users, UserPlus, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMenuProps {
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  onLogout: () => void;
  isScrolled?: boolean;
}

const UserMenu = ({ user, onLogout, isScrolled = false }: UserMenuProps) => {
  const navigate = useNavigate();
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const displayName = `${user.firstName} ${user.lastName}`;

  const menuItems = [
    {
      label: "Cadastro de Membros",
      icon: UserPlus,
      onClick: () => navigate("/members"),
    },
    {
      label: "Solicitação de Cadastro",
      icon: Users,
      onClick: () => navigate("/cadastro"),
    },
    {
      label: "Gestão de Usuários",
      icon: Settings,
      onClick: () => navigate("/users"),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 hover:bg-white/10 focus:outline-none ${
            isScrolled ? "hover:bg-secondary/10" : ""
          }`}
        >
          <Avatar className="h-8 w-8 border-2 border-golden">
            <AvatarImage src={user.avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-golden to-golden-light text-secondary font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className={`hidden sm:block text-sm font-medium transition-colors duration-300 ${
              isScrolled ? "text-secondary" : "text-white"
            }`}
          >
            {displayName}
          </span>
          <ChevronDown
            size={16}
            className={`transition-colors duration-300 ${
              isScrolled ? "text-secondary/70" : "text-white/70"
            }`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-card border border-border shadow-xl z-[100]"
      >
        {menuItems.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onClick={item.onClick}
            className="flex items-center gap-3 cursor-pointer py-3 px-4 hover:bg-muted focus:bg-muted"
          >
            <item.icon size={18} className="text-primary" />
            <span className="text-foreground">{item.label}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={onLogout}
          className="flex items-center gap-3 cursor-pointer py-3 px-4 text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
