import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Cadastro from "./pages/Cadastro";
import ResetPassword from "./pages/ResetPassword";
import SetPassword from "./pages/SetPassword";
import ResendActivation from "./pages/ResendActivation";
import ChangePassword from "./pages/ChangePassword";
import MemberHome from "./pages/MemberHome";
import MembersList from "./pages/MembersList";
import MemberForm from "./pages/MemberForm";
import Users from "./pages/Users";
import AdminRegistrationRequests from "./pages/AdminRegistrationRequests";
import AdminPrayerRequests from "./pages/AdminPrayerRequests";
import AttendanceControl from "./pages/AttendanceControl";
import Repertoire from "./pages/Repertoire";
import WorshipForm from "./pages/WorshipForm";
import Schedules from "./pages/Schedules";
import ScheduleForm from "./pages/ScheduleForm";
import ServiceScheduleManagement from "./pages/ServiceScheduleManagement";
import CalendarPage from "./pages/CalendarPage";
import Contributions from "./pages/Contributions";
import ContributionForm from "./pages/ContributionForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Navigate to="/?login=true" replace />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/definir-senha" element={<SetPassword />} />
          <Route path="/reenviar-ativacao" element={<ResendActivation />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Protected Routes - Require Authentication */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/member-home" element={<ProtectedRoute><MemberHome /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><MembersList /></ProtectedRoute>} />
          <Route path="/members/new" element={<ProtectedRoute><MemberForm /></ProtectedRoute>} />
          <Route path="/members/edit/:id" element={<ProtectedRoute><MemberForm /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/admin/solicitacoes" element={<ProtectedRoute><AdminRegistrationRequests /></ProtectedRoute>} />
          <Route path="/admin/prayer-requests" element={<ProtectedRoute><AdminPrayerRequests /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><AttendanceControl /></ProtectedRoute>} />
          <Route path="/repertoire" element={<ProtectedRoute><Repertoire /></ProtectedRoute>} />
          <Route path="/repertoire/new" element={<ProtectedRoute><WorshipForm /></ProtectedRoute>} />
          <Route path="/repertoire/edit/:id" element={<ProtectedRoute><WorshipForm /></ProtectedRoute>} />
          <Route path="/schedules" element={<ProtectedRoute><Schedules /></ProtectedRoute>} />
          <Route path="/schedules/new" element={<ProtectedRoute><ScheduleForm /></ProtectedRoute>} />
          <Route path="/schedules/edit/:id" element={<ProtectedRoute><ScheduleForm /></ProtectedRoute>} />
          <Route path="/service-schedule" element={<ProtectedRoute><ServiceScheduleManagement /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/contributions" element={<ProtectedRoute><Contributions /></ProtectedRoute>} />
          <Route path="/contributions/new" element={<ProtectedRoute><ContributionForm /></ProtectedRoute>} />
          <Route path="/contributions/edit/:id" element={<ProtectedRoute><ContributionForm /></ProtectedRoute>} />

          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
