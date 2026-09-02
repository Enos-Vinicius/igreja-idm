import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardMobileHome from "@/components/DashboardMobileHome";
import MobileBackButton from "@/components/MobileBackButton";
import { ChurchFilter } from "@/components/dashboard/ChurchFilter";
import { ALL_CHURCHES, toChurchParam } from "@/components/dashboard/churchScope";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { AttendanceCard } from "@/components/dashboard/AttendanceCard";
import { DemographicsCard } from "@/components/dashboard/DemographicsCard";
import { FamiliesCard } from "@/components/dashboard/FamiliesCard";
import { DashboardOverview } from "@/types/dashboard";

/**
 * Dashboard administrativo.
 *
 * Um filtro de igreja acima de tudo, quatro cards independentes abaixo. Cada
 * card busca o seu próprio recorte na API: sem filtro a média geral é 26,9,
 * mas Uberaba é 32,9 e Conceição 25,3 — média de médias não é a média do todo,
 * então nada aqui é somado no front.
 */
const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { canAccessDashboard, isLoading, isAuthenticated } = useAuth();

  const [selectedChurch, setSelectedChurch] = useState<string>(ALL_CHURCHES);
  const [churchOptions, setChurchOptions] = useState<Array<{ church: string; total: number }>>([]);
  const [isMobile, setIsMobile] = useState(false);

  const church = toChurchParam(selectedChurch);

  // O seletor é alimentado pelo overview SEM filtro, que já traz a lista com os
  // totais. Uma resposta filtrada só conteria a igreja selecionada.
  const handleOverviewLoaded = useCallback((overview: DashboardOverview) => {
    if (overview.referencia.church === null) {
      setChurchOptions(overview.membros.porIgreja);
    }
  }, []);

  // Redireciona membros comuns (sem acesso ao painel) para a área do membro
  useEffect(() => {
    if (!isLoading && isAuthenticated && !canAccessDashboard) {
      navigate("/member-home", { replace: true });
    }
  }, [canAccessDashboard, isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Verifica se deve forçar a exibição do dashboard completo (via location state)
  const showFullDashboard = location.state?.showFullDashboard === true;

  if (isMobile && !showFullDashboard) {
    return <DashboardMobileHome />;
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {isMobile && showFullDashboard && <MobileBackButton />}

        {/* Cabeçalho + filtro: uma única linha de filtro acima de tudo o que ela recorta */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <ChurchFilter
              value={selectedChurch}
              onChange={setSelectedChurch}
              options={churchOptions}
            />
          </div>
          <p className="mt-1 text-muted-foreground">
            {church
              ? `Todos os números abaixo são de ${church}.`
              : "Todos os números abaixo somam as duas igrejas."}
          </p>
        </div>

        <div className="space-y-6">
          <OverviewCard church={church} onLoaded={handleOverviewLoaded} />
          <AttendanceCard church={church} />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <DemographicsCard church={church} />
            <FamiliesCard church={church} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
