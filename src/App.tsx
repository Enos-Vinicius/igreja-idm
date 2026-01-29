import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/members" element={<MembersList />} />
          <Route path="/members/new" element={<MemberForm />} />
          <Route path="/members/edit/:id" element={<MemberForm />} />
          <Route path="/users" element={<Users />} />
          <Route path="/admin/solicitacoes" element={<AdminRegistrationRequests />} />
          <Route path="/attendance" element={<AttendanceControl />} />
          <Route path="/repertoire" element={<Repertoire />} />
          <Route path="/repertoire/new" element={<WorshipForm />} />
          <Route path="/repertoire/edit/:id" element={<WorshipForm />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/schedules/new" element={<ScheduleForm />} />
          <Route path="/schedules/edit/:id" element={<ScheduleForm />} />
          <Route path="/calendar" element={<CalendarPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
