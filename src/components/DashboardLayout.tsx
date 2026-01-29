import { ReactNode, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userData = useMemo(() => {
    if (!user?.member?.name) {
      return {
        firstName: user?.email?.split('@')[0] || 'Usuário',
        lastName: '',
        avatarUrl: '',
        role: user?.role,
      };
    }

    const nameParts = user.member.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    return {
      firstName,
      lastName,
      avatarUrl: user.member.photoUrl || '',
      role: user.role,
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardSidebar user={userData} onLogout={handleLogout} />
      <main className="ml-16 min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
