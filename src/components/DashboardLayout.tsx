import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

// TODO: Replace with real authentication state
const mockUser = {
  firstName: "João",
  lastName: "Silva",
  avatarUrl: "",
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement real logout logic
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardSidebar user={mockUser} onLogout={handleLogout} />
      <main className="ml-16 min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
