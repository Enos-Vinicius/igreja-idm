import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Cadastro from "./pages/Cadastro";
import MembersList from "./pages/MembersList";
import MemberForm from "./pages/MemberForm";
import Users from "./pages/Users";
import AdminRegistrationRequests from "./pages/AdminRegistrationRequests";
import AttendanceControl from "./pages/AttendanceControl";
import Repertoire from "./pages/Repertoire";
import WorshipForm from "./pages/WorshipForm";
import Schedules from "./pages/Schedules";
import ScheduleForm from "./pages/ScheduleForm";
import CalendarPage from "./pages/CalendarPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Protected Routes - Require Authentication */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><MembersList /></ProtectedRoute>} />
          <Route path="/members/new" element={<ProtectedRoute><MemberForm /></ProtectedRoute>} />
          <Route path="/members/edit/:id" element={<ProtectedRoute><MemberForm /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/admin/solicitacoes" element={<ProtectedRoute><AdminRegistrationRequests /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><AttendanceControl /></ProtectedRoute>} />
          <Route path="/repertoire" element={<ProtectedRoute><Repertoire /></ProtectedRoute>} />
          <Route path="/repertoire/new" element={<ProtectedRoute><WorshipForm /></ProtectedRoute>} />
          <Route path="/repertoire/edit/:id" element={<ProtectedRoute><WorshipForm /></ProtectedRoute>} />
          <Route path="/schedules" element={<ProtectedRoute><Schedules /></ProtectedRoute>} />
          <Route path="/schedules/new" element={<ProtectedRoute><ScheduleForm /></ProtectedRoute>} />
          <Route path="/schedules/edit/:id" element={<ProtectedRoute><ScheduleForm /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />

          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
