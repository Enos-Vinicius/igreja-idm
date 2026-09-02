import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import {
  CalendarDays,
  Church,
  Users,
  Check,
  X,
  Search,
  UserCheck,
  UserX,
  CheckCircle2,
  Filter,
  Clock,
  UserPlus,
  Loader2,
  MapPin,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  BarChart3,
  Download,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import MobileBackButton from "@/components/MobileBackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { attendanceService } from "@/services/attendance";
import { membersService } from "@/services/members";
import { serviceScheduleService } from "@/services/serviceSchedule";
import { Member } from "@/types/member";
import { Attendance, AttendanceStats, SERVICE_TIMES } from "@/types/attendance";
import { SCHEDULE_CATEGORIES, CHURCHES, ScheduleCategory, Church as ChurchType } from "@/types/schedule";
import { ServiceSchedule } from "@/types/serviceSchedule";
import { downloadCsv, getTimestampSuffix, formatIsoDateBR } from "@/lib/csvExport";

// Coordenadas das igrejas
const CHURCH_COORDINATES: Record<ChurchType, { lat: number; lng: number }> = {
  "Uberaba": { lat: -19.7472, lng: -47.9318 },
  "Conceição das Alagoas": { lat: -19.9178, lng: -48.3856 },
};

// Calcular distância entre dois pontos usando fórmula de Haversine
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Encontrar igreja mais próxima
function findNearestChurch(lat: number, lng: number): ChurchType {
  let nearestChurch: ChurchType = "Uberaba";
  let minDistance = Infinity;

  for (const [church, coords] of Object.entries(CHURCH_COORDINATES)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestChurch = church as ChurchType;
    }
  }

  return nearestChurch;
}

// Obter tipo de culto baseado no dia da semana
function getServiceTypeByDay(date: Date): ScheduleCategory {
  const dayOfWeek = date.getDay();
  switch (dayOfWeek) {
    case 0: // Domingo
      return "Culto de Domingo";
    case 3: // Quarta
      return "Culto de Quarta";
    case 4: // Quinta
      return "Culto de Quinta";
    default:
      return "Culto de Domingo";
  }
}

// Máscara de telefone: (99) 99999-9999 ou (99) 9999-9999
function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : '';
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

const AttendanceControl = () => {
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();

  // Filtros do culto
  const [selectedChurch, setSelectedChurch] = useState<ChurchType | "">("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("19:00");
  const [selectedType, setSelectedType] = useState<ScheduleCategory>(() => getServiceTypeByDay(new Date()));

  // Cultos disponíveis e culto selecionado
  const [availableServices, setAvailableServices] = useState<ServiceSchedule[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceSchedule | null>(null);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Verificar se configuração está completa
  const isConfigComplete = selectedService !== null;

  // Verificar se pode executar ações de presença
  // Não-admin só pode marcar/desmarcar presença na data atual
  const isSelectedDateToday = isToday(selectedDate);
  const canManageAttendance = isAdmin || isSelectedDateToday;

  // Filtro de membros
  const [memberChurchFilter, setMemberChurchFilter] = useState<ChurchType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "present">(
    isSelectedDateToday ? "all" : "pending"
  );

  // Dados
  const [members, setMembers] = useState<Member[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);

  // Loading states
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingAttendances, setIsLoadingAttendances] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [togglingMemberId, setTogglingMemberId] = useState<number | null>(null);

  // Visitante
  const [visitorDialogOpen, setVisitorDialogOpen] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [isAddingVisitor, setIsAddingVisitor] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<Attendance | null>(null);

  // Geolocalização
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  // Mobile: controle de etapas (filtros vs listagem)
  const [mobileStep, setMobileStep] = useState<"filters" | "list">("filters");
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);

  const isStrictAdmin = user?.role === "admin";

  const handleBackup = async () => {
    setIsExportingBackup(true);
    try {
      const all = await attendanceService.getAllForBackup();
      downloadCsv(
        `presencas-backup-${getTimestampSuffix()}.csv`,
        all,
        [
          { label: "ID", value: (a) => a.id },
          { label: "Data do Culto", value: (a) => formatIsoDateBR(a.serviceDate) },
          { label: "Hora", value: (a) => a.serviceTime },
          { label: "Tipo de Culto", value: (a) => a.serviceType },
          { label: "Igreja", value: (a) => a.church },
          { label: "ID do Culto", value: (a) => a.serviceScheduleId || "" },
          { label: "Membro", value: (a) => a.member?.name || "" },
          { label: "ID do Membro", value: (a) => a.memberId ?? "" },
          { label: "Visitante", value: (a) => a.visitorName || "" },
          { label: "Telefone do Visitante", value: (a) => a.visitorPhone || "" },
          { label: "Registrado por", value: (a) => a.recordedByUser?.name || a.recordedByUser?.email || "" },
          { label: "Registrado em", value: (a) => formatIsoDateBR(a.createdAt) },
        ]
      );
      toast({
        title: "Backup concluído",
        description: `${all.length} registro(s) de presença baixado(s).`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao gerar backup";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setIsExportingBackup(false);
    }
  };

  // Swipe: estados para o gesto de arrastar
  const [swipingMemberId, setSwipingMemberId] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [pendingSwipes, setPendingSwipes] = useState<Set<number>>(new Set());
  const touchStartRef = useRef<{ x: number; y: number; memberId: number } | null>(null);
  const swipeThreshold = 100; // pixels para confirmar swipe

  // Dialog de confirmação para ações em datas históricas (admin)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: () => void;
    memberName?: string;
    isRemoving?: boolean;
    isVisitor?: boolean;
  }>({
    open: false,
    action: () => {},
  });

  // Membros presentes (extraídos das presenças, sem visitantes)
  const presentMembers = useMemo(() => {
    return attendances
      .filter((a) => a.memberId !== null && a.member)
      .map((a) => {
        const member = a.member!;
        return {
          ...member,
          // Garantir que id seja number
          id: typeof member.id === 'string' ? parseInt(member.id, 10) : member.id,
        } as Member;
      });
  }, [attendances]);

  // IDs dos membros presentes (para verificação rápida no modo "all")
  const presentMemberIds = useMemo(() => {
    return new Set(attendances
      .filter((a) => a.memberId !== null)
      .map((a) => a.memberId!)
    );
  }, [attendances]);

  // Visitantes na lista de presenças
  const visitors = useMemo(() => {
    return attendances.filter((a) => a.visitorName !== null);
  }, [attendances]);

  // Contadores para os botões (considera filtro de igreja)
  const absentMembersCount = useMemo(() => {
    return members.filter(m =>
      !presentMemberIds.has(m.id) &&
      (memberChurchFilter === "all" || m.church === memberChurchFilter)
    ).length;
  }, [members, presentMemberIds, memberChurchFilter]);

  /**
   * Aplica uma presença de MEMBRO nas estatísticas locais usando a mesma conta
   * da API: só entra na taxa quem é Ativo E pertence à igreja do culto. Membro
   * da outra igreja, congregado e inativo aparecem na lista mas ficam fora do
   * numerador — foi o que fazia a taxa passar de 100%.
   *
   * Quando o membro não é conhecido localmente (não está na lista de ativos),
   * a taxa fica parada até o próximo refresh em vez de ser adivinhada.
   */
  const applyMemberPresenceDelta = useCallback(
    (prev: AttendanceStats | null, delta: 1 | -1, member?: Member): AttendanceStats | null => {
      if (!prev) return null;

      const presentMembers = Math.max(0, prev.presentMembers + delta);
      const isKnown = !!member;
      const isActive = member?.membershipStatus === "Ativo";
      const isSameChurch = !!member?.church && member.church === selectedService?.city;
      const countsForRate = isKnown && isActive && isSameChurch;

      const bump = (current: number | undefined, applies: boolean) =>
        current === undefined ? undefined : Math.max(0, current + (applies ? delta : 0));

      const activeMembersPresent = bump(prev.activeMembersPresent, countsForRate);
      const numerator = activeMembersPresent ?? prev.activeMembersPresent ?? presentMembers;

      return {
        ...prev,
        presentMembers,
        activeMembersPresent,
        otherChurchMembers: bump(prev.otherChurchMembers, isKnown && isActive && !isSameChurch),
        nonActiveMembers: bump(prev.nonActiveMembers, isKnown && !isActive),
        absentMembers: Math.max(0, prev.totalMembers - numerator),
        attendanceRate:
          prev.totalMembers > 0
            ? Math.min(100, Math.round((numerator / prev.totalMembers) * 100))
            : 0,
      };
    },
    [selectedService]
  );

  /** Visitante não entra na taxa nem em presentMembers — só no próprio contador. */
  const applyVisitorPresenceDelta = useCallback(
    (prev: AttendanceStats | null, delta: 1 | -1): AttendanceStats | null =>
      prev ? { ...prev, visitors: Math.max(0, (prev.visitors ?? 0) + delta) } : null,
    []
  );

  // Função para recarregar dados após mudanças
  const reloadData = useCallback(async () => {
    if (!selectedService) return;

    // Recarregar presenças
    try {
      const data = await attendanceService.list({
        serviceScheduleId: selectedService.id,
      });

      let attendanceList: Attendance[] = [];
      const responseData = data as unknown;
      if (Array.isArray(responseData)) {
        attendanceList = responseData as Attendance[];
      } else if (data && typeof data === 'object' && 'attendances' in data && Array.isArray(data.attendances)) {
        attendanceList = data.attendances;
      }

      setAttendances(attendanceList);
    } catch {
      setAttendances([]);
    }

    // Recarregar todos os membros ativos
    // NÃO depende do filterStatus - sempre carrega todos
    try {
      const data = await membersService.getAll(true); // Usa cache
      setMembers(data.filter((m) => m.membershipStatus === "Ativo"));
    } catch {
      setMembers([]);
    }

    // Recarregar estatísticas
    try {
      const data = await attendanceService.getStats({
        serviceScheduleId: selectedService.id,
      });
      setStats(data);
    } catch (error) {
      // Erro ao buscar stats - usar valores padrão
      setStats({
        totalMembers: 0,
        presentMembers: 0,
        absentMembers: 0,
        attendanceRate: 0,
      });
    }
  }, [selectedService]);

  // Detectar geolocalização ao carregar
  useEffect(() => {
    if (!navigator.geolocation) return;

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearestChurch = findNearestChurch(latitude, longitude);

        setSelectedChurch(nearestChurch);
        setMemberChurchFilter(nearestChurch);
        setLocationDetected(true);
        setIsDetectingLocation(false);

        toast({
          title: "Localização detectada",
          description: `Igreja mais próxima: ${nearestChurch}`,
        });
      },
      () => {
        setIsDetectingLocation(false);
        // Silently fail - user can select manually
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutos de cache
      }
    );
  }, []);

  // Resetar filtro quando mudar entre hoje e outros dias
  useEffect(() => {
    if (isSelectedDateToday) {
      // Modo registro: mostrar "Todos" por padrão
      setFilterStatus("all");
    } else {
      // Modo visualização: mostrar "Ausentes" por padrão
      setFilterStatus("pending");
    }
  }, [isSelectedDateToday]);

  // Carregar cultos disponíveis baseado nos filtros
  useEffect(() => {
    const loadServices = async () => {
      if (!selectedChurch) {
        setAvailableServices([]);
        setSelectedService(null);
        return;
      }

      setIsLoadingServices(true);
      try {
        // Buscar cultos filtrados por mês e igreja
        const dateStr = format(selectedDate, "yyyy-MM");
        const allServices = await serviceScheduleService.getAll({
          month: dateStr,
          church: selectedChurch
        });

        // Filtrar cultos pela data selecionada
        const filtered = allServices.filter(service => {
          const matchDate = service.date === format(selectedDate, "yyyy-MM-dd");
          return matchDate;
        });

        setAvailableServices(filtered);

        // Auto-selecionar o primeiro culto se existir
        if (filtered.length > 0) {
          setSelectedService(filtered[0]);
        } else {
          setSelectedService(null);
        }
      } catch (error) {
        console.error("Erro ao carregar cultos:", error);
        setAvailableServices([]);
        setSelectedService(null);
      } finally {
        setIsLoadingServices(false);
      }
    };

    loadServices();
  }, [selectedChurch, selectedDate]);

  // Carregar membros quando o culto selecionado mudar
  // NÃO recarrega ao trocar de aba (filterStatus)
  useEffect(() => {
    const loadMembers = async () => {
      // Se não tem culto selecionado, não carrega membros
      if (!selectedService) {
        setMembers([]);
        return;
      }

      setIsLoadingMembers(true);
      try {
        // Sempre busca TODOS os membros ativos
        // O filtro por presença será feito client-side no filteredMembers
        const data = await membersService.getAll(true); // Usa cache
        setMembers(data.filter((m) => m.membershipStatus === "Ativo"));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao carregar membros";
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
        setMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadMembers();
  }, [selectedService, toast]);

  // Carregar presenças e estatísticas quando o culto selecionado mudar
  useEffect(() => {
    if (!selectedService) {
      setAttendances([]);
      setStats(null);
      return;
    }

    const loadAttendances = async () => {
      setIsLoadingAttendances(true);
      try {
        const data = await attendanceService.list({
          serviceScheduleId: selectedService.id,
        });

        // Handle case where API might return array directly or in different structure
        let attendanceList: Attendance[] = [];
        const responseData = data as unknown;
        if (Array.isArray(responseData)) {
          attendanceList = responseData as Attendance[];
        } else if (data && typeof data === 'object' && 'attendances' in data && Array.isArray(data.attendances)) {
          attendanceList = data.attendances;
        }

        setAttendances(attendanceList);
      } catch {
        setAttendances([]);
      } finally {
        setIsLoadingAttendances(false);
      }
    };

    const loadStats = async () => {
      setIsLoadingStats(true);
      try {
        const data = await attendanceService.getStats({
          serviceScheduleId: selectedService.id,
        });
        setStats(data);
      } catch (error) {
        // Se não houver estatísticas, usar valores padrão
        setStats({
          totalMembers: 0,
          presentMembers: 0,
          absentMembers: 0,
          attendanceRate: 0,
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadAttendances();
    loadStats();
  }, [selectedService]);

  // Filtrar membros
  const filteredMembers = useMemo(() => {
    // Escolher a lista baseada no filtro de status
    let filtered: Member[];

    if (filterStatus === "present") {
      // Apenas membros presentes
      filtered = presentMembers;
    } else if (filterStatus === "all" || filterStatus === "pending") {
      // "all" = Todos sem presença (modo registro no dia do culto)
      // "pending" = Ausentes (modo visualização em outros dias)
      // Ambos mostram apenas quem NÃO tem presença marcada
      filtered = members.filter(m => !presentMemberIds.has(m.id));
    } else {
      // Fallback (não deveria chegar aqui)
      filtered = members;
    }

    // Filtrar por igreja do membro APENAS quando não está na aba "present"
    // Na aba "present", os membros já estão filtrados pelo culto específico
    if (filterStatus !== "present" && memberChurchFilter !== "all") {
      filtered = filtered.filter((m) => m.church === memberChurchFilter);
    }

    // Filtrar por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.email?.toLowerCase().includes(term) ||
          m.primaryPhone?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [members, presentMembers, presentMemberIds, memberChurchFilter, searchTerm, filterStatus]);

  // Helper para confirmar ações em datas históricas (admin)
  const confirmHistoricalAction = useCallback((
    action: () => void,
    memberName?: string,
    isRemoving?: boolean,
    isVisitor?: boolean
  ) => {
    // Se não é hoje e é admin, pedir confirmação
    if (!isSelectedDateToday && isAdmin) {
      setConfirmDialog({
        open: true,
        action,
        memberName,
        isRemoving,
        isVisitor,
      });
    } else {
      // Caso contrário, executar ação diretamente
      action();
    }
  }, [isSelectedDateToday, isAdmin]);

  // Toggle presença de membro
  const toggleMemberAttendance = async (memberId: number) => {
    if (!selectedService) {
      toast({
        title: "Selecione um culto",
        description: "É necessário selecionar um culto cadastrado primeiro.",
        variant: "destructive",
      });
      return;
    }

    // Verificar permissão: não-admin só pode marcar presença na data atual
    if (!canManageAttendance) {
      toast({
        title: "Ação não permitida",
        description: "Você só pode registrar presenças na data de hoje.",
        variant: "destructive",
      });
      return;
    }

    // Determinar se está marcando ou desmarcando (baseado se já está presente)
    const isCurrentlyPresent = presentMemberIds.has(memberId);
    const member = members.find(m => m.id === memberId);

    // Usar confirmação se for admin em data histórica
    confirmHistoricalAction(
      () => executeToggleMemberAttendance(memberId, isCurrentlyPresent, member),
      member?.name,
      isCurrentlyPresent,
      false
    );
  };

  // Executar toggle de presença (após confirmação se necessário)
  const executeToggleMemberAttendance = async (
    memberId: number,
    isCurrentlyPresent: boolean,
    member?: Member
  ) => {
    if (!selectedService) return;

    // UI OTIMISTA: Atualizar IMEDIATAMENTE antes da API responder
    if (isCurrentlyPresent) {
      // Está presente → vai remover
      // Snapshot para reverter se der erro
      const previousAttendances = attendances;
      const previousStats = stats;

      // Remove IMEDIATAMENTE da lista
      setAttendances(prev => prev.filter(a => a.memberId !== memberId));

      // Atualiza stats IMEDIATAMENTE
      setStats(prev => applyMemberPresenceDelta(prev, -1, member));

      // Chama API em background
      try {
        const result = await attendanceService.toggle({
          memberId,
          serviceScheduleId: selectedService.id,
        });

        console.log('[toggleMemberAttendance REMOVE] API response:', result);

        // Se chegou aqui sem erro, consideramos sucesso - não reverter!
        toast({
          title: "Presença removida",
          description: "A presença foi desmarcada com sucesso.",
        });
      } catch (error) {
        // Erro: reverter mudanças otimistas
        setAttendances(previousAttendances);
        setStats(previousStats);
        const message = error instanceof Error ? error.message : "Erro ao remover presença";
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
      }
    } else {
      // Não está presente → vai adicionar
      // Snapshot para reverter se der erro
      const previousAttendances = attendances;
      const previousStats = stats;

      // Cria attendance temporário com ID negativo (temporário)
      const tempId = -Date.now(); // ID temporário único negativo
      const tempAttendance: Attendance = {
        id: tempId,
        memberId: memberId,
        member: member ? {
          id: member.id,
          name: member.name,
          church: member.church || 'Uberaba',
          photoUrl: member.photoUrl,
        } : null,
        visitorName: null,
        visitorPhone: null,
        serviceScheduleId: selectedService.id,
        serviceDate: selectedService.date,
        serviceTime: selectedService.time,
        serviceType: 'Culto de Domingo',
        church: (member?.church as any) || 'Uberaba',
        recordedBy: 0,
        createdAt: new Date().toISOString(),
      };

      // Adiciona IMEDIATAMENTE à lista
      setAttendances(prev => [...prev, tempAttendance]);

      // Atualiza stats IMEDIATAMENTE
      setStats(prev => applyMemberPresenceDelta(prev, 1, member));

      // Chama API em background
      try {
        const result = await attendanceService.toggle({
          memberId,
          serviceScheduleId: selectedService.id,
        });

        console.log('[toggleMemberAttendance ADD] API response:', result);

        // Se chegou aqui sem erro, consideramos sucesso
        // Substituir attendance temporário pelo real (se tiver ID válido)
        if (result.id !== undefined && result.id !== null) {
          setAttendances(prev => prev.map(a =>
            a.id === tempId ? {
              ...tempAttendance,
              id: result.id!,
              serviceDate: result.serviceDate || tempAttendance.serviceDate,
              serviceTime: result.serviceTime || tempAttendance.serviceTime,
              serviceType: result.serviceType || tempAttendance.serviceType,
              church: result.church || tempAttendance.church,
              recordedBy: result.recordedBy || tempAttendance.recordedBy,
              createdAt: result.createdAt || tempAttendance.createdAt,
            } : a
          ));
        }
        // Se chegou aqui, é sucesso - não reverter!
        toast({
          title: "Presença registrada",
          description: "A presença foi marcada com sucesso.",
        });
      } catch (error) {
        // Erro: reverter mudanças otimistas
        setAttendances(previousAttendances);
        setStats(previousStats);
        const message = error instanceof Error ? error.message : "Erro ao registrar presença";
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
      }
    }
  };

  // Swipe: marcar presença via swipe direita (mobile)
  const handleSwipeMarkPresent = useCallback(async (memberId: number, memberName: string) => {
    if (!selectedService || !canManageAttendance) return;
    if (pendingSwipes.has(memberId)) return;

    const member = members.find(m => m.id === memberId);

    // Usar confirmação se for admin em data histórica
    confirmHistoricalAction(
      () => executeSwipeMarkPresent(memberId, memberName, member),
      memberName,
      false,
      false
    );
  }, [selectedService, canManageAttendance, pendingSwipes, members, confirmHistoricalAction]);

  // Executar marcar presença via swipe (após confirmação se necessário)
  const executeSwipeMarkPresent = useCallback(async (memberId: number, memberName: string, member?: Member) => {
    if (!selectedService) return;

    // Adiciona à lista de pendentes (otimista)
    setPendingSwipes(prev => new Set([...prev, memberId]));

    // UI OTIMISTA: Snapshot para reverter se der erro
    const previousAttendances = attendances;
    const previousStats = stats;

    // Cria attendance temporário com ID negativo (temporário)
    const tempId = -Date.now();
    const tempAttendance: Attendance = {
      id: tempId,
      memberId: memberId,
      member: member ? {
        id: member.id,
        name: member.name,
        church: member.church || 'Uberaba',
        photoUrl: member.photoUrl,
      } : null,
      visitorName: null,
      visitorPhone: null,
      serviceScheduleId: selectedService.id,
      serviceDate: selectedService.date,
      serviceTime: selectedService.time,
      serviceType: 'Culto de Domingo',
      church: (member?.church as any) || 'Uberaba',
      recordedBy: 0,
      createdAt: new Date().toISOString(),
    };

    // Adiciona IMEDIATAMENTE à lista
    setAttendances(prev => [...prev, tempAttendance]);

    // Atualiza stats IMEDIATAMENTE
    setStats(prev => applyMemberPresenceDelta(prev, 1, member));

    // Chama API em background
    try {
      const result = await attendanceService.toggle({
        memberId,
        serviceScheduleId: selectedService.id,
      });

      console.log('[handleSwipeMarkPresent] API response:', result);

      // Se chegou aqui sem erro, consideramos sucesso
      // Substituir attendance temporário pelo real (se tiver ID válido)
      if (result.id !== undefined && result.id !== null) {
        setAttendances(prev => prev.map(a =>
          a.id === tempId ? {
            ...tempAttendance,
            id: result.id!,
            serviceDate: result.serviceDate || tempAttendance.serviceDate,
            serviceTime: result.serviceTime || tempAttendance.serviceTime,
            serviceType: result.serviceType || tempAttendance.serviceType,
            church: result.church || tempAttendance.church,
            recordedBy: result.recordedBy || tempAttendance.recordedBy,
            createdAt: result.createdAt || tempAttendance.createdAt,
          } : a
        ));
      }
      // Se chegou aqui, é sucesso - não reverter!
    } catch (error) {
      // Erro: reverter mudanças otimistas
      setAttendances(previousAttendances);
      setStats(previousStats);
      const message = error instanceof Error ? error.message : "Erro ao registrar presença";
      toast({
        title: `Erro: ${memberName}`,
        description: message,
        variant: "destructive",
      });
    } finally {
      // Remove da lista de pendentes
      setPendingSwipes(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  }, [selectedService, toast, attendances, stats, setPendingSwipes, applyMemberPresenceDelta]);

  // Swipe: remover presença via swipe esquerda (mobile)
  const handleSwipeRemovePresent = useCallback(async (memberId: number, memberName: string) => {
    if (!selectedService || !canManageAttendance) return;
    if (pendingSwipes.has(memberId)) return;

    // Usar confirmação se for admin em data histórica
    confirmHistoricalAction(
      () => executeSwipeRemovePresent(memberId, memberName),
      memberName,
      true,
      false
    );
  }, [selectedService, canManageAttendance, pendingSwipes, confirmHistoricalAction]);

  // Executar remover presença via swipe (após confirmação se necessário)
  const executeSwipeRemovePresent = useCallback(async (memberId: number, memberName: string) => {
    if (!selectedService) return;

    // Adiciona à lista de pendentes (otimista)
    setPendingSwipes(prev => new Set([...prev, memberId]));

    // UI OTIMISTA: Snapshot para reverter se der erro
    const previousAttendances = attendances;
    const previousStats = stats;

    // Remove IMEDIATAMENTE da lista
    setAttendances(prev => prev.filter(a => a.memberId !== memberId));

    // Atualiza stats IMEDIATAMENTE
    const removedMember = members.find(m => m.id === memberId);
    setStats(prev => applyMemberPresenceDelta(prev, -1, removedMember));

    // Chama API em background
    try {
      const result = await attendanceService.toggle({
        memberId,
        serviceScheduleId: selectedService.id,
      });

      console.log('[handleSwipeRemovePresent] API response:', result);

      // Se chegou aqui sem erro, consideramos sucesso - não reverter!
    } catch (error) {
      // Erro: reverter mudanças otimistas
      setAttendances(previousAttendances);
      setStats(previousStats);
      const message = error instanceof Error ? error.message : "Erro ao remover presença";
      toast({
        title: `Erro: ${memberName}`,
        description: message,
        variant: "destructive",
      });
    } finally {
      // Remove da lista de pendentes
      setPendingSwipes(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  }, [selectedService, toast, attendances, stats, setPendingSwipes, applyMemberPresenceDelta, members]);

  // Touch handlers para swipe
  const handleTouchStart = useCallback((e: React.TouchEvent, memberId: number) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, memberId };
    setSwipingMemberId(memberId);
    setSwipeOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent, memberId: number, isPresent: boolean) => {
    if (!touchStartRef.current || touchStartRef.current.memberId !== memberId) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    // Se movimento vertical for maior que horizontal, cancelar swipe (scroll)
    if (deltaY > Math.abs(deltaX) && Math.abs(deltaX) < 30) {
      return;
    }

    // Presente: só permite swipe para esquerda (negativo)
    // Ausente: só permite swipe para direita (positivo)
    if (isPresent && deltaX < 0) {
      setSwipeOffset(Math.max(deltaX, -150)); // negativo
    } else if (!isPresent && deltaX > 0) {
      setSwipeOffset(Math.min(deltaX, 150)); // positivo
    }
  }, []);

  const handleTouchEnd = useCallback((memberId: number, memberName: string, isPresent: boolean) => {
    if (!touchStartRef.current || touchStartRef.current.memberId !== memberId) return;

    // Direita (positivo) = marcar presença | Esquerda (negativo) = remover presença
    if (!isPresent && swipeOffset >= swipeThreshold) {
      handleSwipeMarkPresent(memberId, memberName);
    } else if (isPresent && swipeOffset <= -swipeThreshold) {
      handleSwipeRemovePresent(memberId, memberName);
    }

    // Reset
    touchStartRef.current = null;
    setSwipingMemberId(null);
    setSwipeOffset(0);
  }, [swipeOffset, swipeThreshold, handleSwipeMarkPresent, handleSwipeRemovePresent]);

  // Listener global não-passivo para bloquear scroll nativo do iOS Safari
  // durante swipe horizontal. Resolve o problema de itens abaixo da dobra
  // não respondendo ao swipe porque o browser captura o gesto para scroll.
  useEffect(() => {
    const preventScrollOnSwipe = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

      // Se movimento horizontal é dominante e significativo, impede scroll
      if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventScrollOnSwipe, { passive: false });
    return () => document.removeEventListener('touchmove', preventScrollOnSwipe);
  }, []);

  // Abrir modal para editar visitante
  const openVisitorEditModal = (visitor: Attendance) => {
    setEditingVisitor(visitor);
    setVisitorName(visitor.visitorName || "");
    setVisitorPhone(visitor.visitorPhone || "");
    setVisitorDialogOpen(true);
  };

  // Fechar modal e limpar estado de edição
  const closeVisitorDialog = () => {
    setVisitorDialogOpen(false);
    setEditingVisitor(null);
    setVisitorName("");
    setVisitorPhone("");
  };

  // Adicionar ou editar visitante
  const handleAddVisitor = async () => {
    if (!selectedService) {
      toast({
        title: "Selecione um culto",
        description: "É necessário selecionar um culto cadastrado primeiro.",
        variant: "destructive",
      });
      return;
    }

    // Verificar permissão: não-admin só pode adicionar visitante na data atual
    if (!canManageAttendance) {
      toast({
        title: "Ação não permitida",
        description: "Você só pode adicionar visitantes na data de hoje.",
        variant: "destructive",
      });
      return;
    }

    if (!visitorName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome do visitante.",
        variant: "destructive",
      });
      return;
    }

    // Se está editando, chama a função de edição
    if (editingVisitor) {
      confirmHistoricalAction(
        () => executeEditVisitor(),
        visitorName.trim(),
        false,
        true
      );
    } else {
      // Senão, adiciona novo visitante
      confirmHistoricalAction(
        () => executeAddVisitor(),
        visitorName.trim(),
        false,
        true
      );
    }
  };

  // Executar adicionar visitante (após confirmação se necessário)
  const executeAddVisitor = async () => {
    if (!selectedService) return;

    setIsAddingVisitor(true);

    // UI OTIMISTA: Snapshot para reverter se der erro
    const previousAttendances = attendances;
    const previousStats = stats;

    // Cria attendance temporário com ID negativo (temporário)
    const tempId = -Date.now();
    const tempAttendance: Attendance = {
      id: tempId,
      memberId: null,
      member: null,
      visitorName: visitorName.trim(),
      visitorPhone: visitorPhone.trim() || null,
      serviceScheduleId: selectedService.id,
      serviceDate: selectedService.date,
      serviceTime: selectedService.time,
      serviceType: 'Culto de Domingo',
      church: 'Uberaba',
      recordedBy: 0,
      createdAt: new Date().toISOString(),
    };

    // Adiciona IMEDIATAMENTE à lista
    setAttendances(prev => [...prev, tempAttendance]);

    // Atualiza stats IMEDIATAMENTE (visitante conta em visitors, não em presentMembers nem na taxa)
    setStats(prev => applyVisitorPresenceDelta(prev, 1));

    // Limpa campos e fecha dialog IMEDIATAMENTE
    const savedVisitorName = visitorName.trim();
    setVisitorName("");
    setVisitorPhone("");
    setVisitorDialogOpen(false);

    // Chama API em background
    try {
      const result = await attendanceService.toggle({
        visitorName: savedVisitorName,
        visitorPhone: visitorPhone.trim() || undefined,
        serviceScheduleId: selectedService.id,
      });

      console.log('[handleAddVisitor] API response:', result);

      // Se chegou aqui sem erro, consideramos sucesso
      // Substituir attendance temporário pelo real (se tiver ID válido)
      if (result.id !== undefined && result.id !== null) {
        setAttendances(prev => prev.map(a =>
          a.id === tempId ? {
            ...tempAttendance,
            id: result.id!,
            serviceDate: result.serviceDate || tempAttendance.serviceDate,
            serviceTime: result.serviceTime || tempAttendance.serviceTime,
            serviceType: result.serviceType || tempAttendance.serviceType,
            church: result.church || tempAttendance.church,
            recordedBy: result.recordedBy || tempAttendance.recordedBy,
            createdAt: result.createdAt || tempAttendance.createdAt,
          } : a
        ));
      }
      // Se chegou aqui, é sucesso - não reverter!
      toast({
        title: "Visitante adicionado",
        description: `${savedVisitorName} foi adicionado como visitante.`,
      });
    } catch (error) {
      // Erro: reverter mudanças otimistas
      setAttendances(previousAttendances);
      setStats(previousStats);
      const message = error instanceof Error ? error.message : "Erro ao adicionar visitante";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsAddingVisitor(false);
    }
  };

  // Executar editar visitante (após confirmação se necessário)
  const executeEditVisitor = async () => {
    if (!selectedService || !editingVisitor) return;

    setIsAddingVisitor(true);

    // UI OTIMISTA: Snapshot para reverter se der erro
    const previousAttendances = attendances;
    const previousStats = stats;

    // Atualiza IMEDIATAMENTE os dados do visitante na lista
    setAttendances(prev => prev.map(a =>
      a.id === editingVisitor.id ? {
        ...a,
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim() || null,
      } : a
    ));

    // Limpa campos e fecha dialog IMEDIATAMENTE
    const savedVisitorName = visitorName.trim();
    const savedVisitorPhone = visitorPhone.trim() || null;
    const oldVisitorName = editingVisitor.visitorName!;
    closeVisitorDialog();

    // Chama API em background (remover antigo + adicionar novo)
    try {
      // Se o nome mudou, precisamos remover o antigo e adicionar o novo
      if (oldVisitorName !== savedVisitorName) {
        // Remove o visitante antigo
        await attendanceService.toggle({
          visitorName: oldVisitorName,
          serviceScheduleId: selectedService.id,
        });

        // Adiciona o visitante com os novos dados
        const result = await attendanceService.toggle({
          visitorName: savedVisitorName,
          visitorPhone: savedVisitorPhone || undefined,
          serviceScheduleId: selectedService.id,
        });

        // Atualiza com o ID real retornado pela API
        if (result.id !== undefined && result.id !== null) {
          setAttendances(prev => prev.map(a =>
            a.id === editingVisitor.id ? {
              ...a,
              id: result.id!,
              visitorName: savedVisitorName,
              visitorPhone: savedVisitorPhone,
              serviceDate: result.serviceDate || a.serviceDate,
              serviceTime: result.serviceTime || a.serviceTime,
              serviceType: result.serviceType || a.serviceType,
              church: result.church || a.church,
              recordedBy: result.recordedBy || a.recordedBy,
              createdAt: result.createdAt || a.createdAt,
            } : a
          ));
        }
      } else {
        // Se apenas o telefone mudou, remove e adiciona novamente
        await attendanceService.toggle({
          visitorName: oldVisitorName,
          serviceScheduleId: selectedService.id,
        });

        const result = await attendanceService.toggle({
          visitorName: savedVisitorName,
          visitorPhone: savedVisitorPhone || undefined,
          serviceScheduleId: selectedService.id,
        });

        // Atualiza com o ID real
        if (result.id !== undefined && result.id !== null) {
          setAttendances(prev => prev.map(a =>
            a.id === editingVisitor.id ? {
              ...a,
              id: result.id!,
              visitorPhone: savedVisitorPhone,
              serviceDate: result.serviceDate || a.serviceDate,
              serviceTime: result.serviceTime || a.serviceTime,
              serviceType: result.serviceType || a.serviceType,
              church: result.church || a.church,
              recordedBy: result.recordedBy || a.recordedBy,
              createdAt: result.createdAt || a.createdAt,
            } : a
          ));
        }
      }

      toast({
        title: "Visitante atualizado",
        description: `${savedVisitorName} foi atualizado com sucesso.`,
      });
    } catch (error) {
      // Erro: reverter mudanças otimistas
      setAttendances(previousAttendances);
      setStats(previousStats);
      const message = error instanceof Error ? error.message : "Erro ao editar visitante";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsAddingVisitor(false);
    }
  };

  // Remover visitante
  const removeVisitor = async (attendance: Attendance) => {
    if (!selectedService) return;

    // Verificar permissão: não-admin só pode remover visitante na data atual
    if (!canManageAttendance) {
      toast({
        title: "Ação não permitida",
        description: "Você só pode remover visitantes na data de hoje.",
        variant: "destructive",
      });
      return;
    }

    // SEMPRE pedir confirmação para remover visitante (mesmo no dia atual)
    setConfirmDialog({
      open: true,
      action: () => executeRemoveVisitor(attendance),
      memberName: attendance.visitorName || undefined,
      isRemoving: true,
      isVisitor: true,
    });
  };

  // Executar remover visitante (após confirmação se necessário)
  const executeRemoveVisitor = async (attendance: Attendance) => {
    if (!selectedService) return;

    // UI OTIMISTA: Snapshot para reverter se der erro
    const previousAttendances = attendances;
    const previousStats = stats;

    // Remove IMEDIATAMENTE da lista
    setAttendances(prev => prev.filter(a => a.id !== attendance.id));

    // Atualiza stats IMEDIATAMENTE
    setStats(prev => applyVisitorPresenceDelta(prev, -1));

    // Chama API em background
    try {
      const result = await attendanceService.toggle({
        visitorName: attendance.visitorName!,
        serviceScheduleId: selectedService.id,
      });

      console.log('[removeVisitor] API response:', result);

      // Se chegou aqui sem erro, consideramos sucesso - não reverter!
      toast({
        title: "Visitante removido",
        description: "O visitante foi removido da lista de presença.",
      });
    } catch (error) {
      // Erro: reverter mudanças otimistas
      setAttendances(previousAttendances);
      setStats(previousStats);
      const message = error instanceof Error ? error.message : "Erro ao remover visitante";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const totalPresent = attendances.length;
  const membersPresent = attendances.filter((a) => a.memberId !== null).length;
  const visitorsPresent = visitors.length;

  return (
    <DashboardLayout>
      <div className={cn(
        "p-6 max-w-6xl mx-auto",
        // No mobile na etapa list, usa flex column para preencher altura sem espaçamento extra
        mobileStep === "list"
          ? "md:space-y-6 flex flex-col h-[100dvh] pb-0 pt-4 md:pt-6"
          : "space-y-6"
      )}>
        {/* MobileBackButton - esconde no mobile quando está na listagem */}
        <div className={cn(
          "md:block",
          mobileStep === "list" ? "hidden" : "block"
        )}>
          <MobileBackButton />
        </div>

        {/* Header - esconde no mobile quando está na listagem */}
        <div className={cn(
          "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
          mobileStep === "list" ? "hidden md:flex" : "flex"
        )}>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Presenca</h1>
            <p className="text-muted-foreground mt-1">
              Registre a presenca dos membros e visitantes nos cultos
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isStrictAdmin && (
              <Button
                variant="outline"
                onClick={handleBackup}
                disabled={isExportingBackup}
                className="gap-2"
              >
                {isExportingBackup ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Backup de Dados
              </Button>
            )}
          <Dialog open={visitorDialogOpen} onOpenChange={(open) => !open && closeVisitorDialog()}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 hidden md:flex"
                disabled={!selectedService || !canManageAttendance}
                title={!canManageAttendance ? "Você só pode adicionar visitantes na data de hoje" : !selectedService ? "Selecione um culto primeiro" : undefined}
              >
                <UserPlus className="h-4 w-4" />
                Adicionar Visitante
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingVisitor ? "Editar Visitante" : "Adicionar Visitante"}</DialogTitle>
                <DialogDescription>
                  {editingVisitor ? "Atualize os dados do visitante" : "Registre a presenca de um visitante no culto"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="visitorName">Nome *</Label>
                  <Input
                    id="visitorName"
                    placeholder="Nome do visitante"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visitorPhone">Telefone (opcional)</Label>
                  <Input
                    id="visitorPhone"
                    placeholder="(00) 00000-0000"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(formatPhone(e.target.value))}
                    maxLength={15}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeVisitorDialog}>
                  Cancelar
                </Button>
                <Button onClick={handleAddVisitor} disabled={isAddingVisitor}>
                  {isAddingVisitor ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingVisitor ? "Salvando..." : "Adicionando..."}
                    </>
                  ) : (
                    editingVisitor ? "Salvar" : "Adicionar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Alerta quando não pode gerenciar presenças */}
        {!canManageAttendance && (
          <Alert variant="default" className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">Modo somente leitura</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Você está visualizando uma data diferente de hoje. Apenas administradores podem registrar presenças em datas passadas ou futuras.
            </AlertDescription>
          </Alert>
        )}

        {/* Filtros do Culto - Visível sempre no desktop, apenas na etapa "filters" no mobile */}
        <div className={cn(
          "md:block",
          mobileStep === "filters" ? "block" : "hidden"
        )}>
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Configuracao do Culto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {/* Igreja do Culto */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Church className="h-4 w-4 text-muted-foreground" />
                    Igreja do Culto *
                    {isDetectingLocation && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Detectando...
                      </span>
                    )}
                    {locationDetected && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Via GPS
                      </span>
                    )}
                  </label>
                  <Select
                    value={selectedChurch}
                    onValueChange={(v) => {
                      setSelectedChurch(v as ChurchType);
                      setLocationDetected(false); // Remove indicador se usuário mudar manualmente
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isDetectingLocation ? "Detectando localização..." : "Selecione a igreja"} />
                    </SelectTrigger>
                    <SelectContent>
                      {CHURCHES.map((church) => (
                        <SelectItem key={church} value={church}>
                          {church}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    Data
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Culto */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Culto
                    {isLoadingServices && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Carregando...
                      </span>
                    )}
                  </label>
                  <Select
                    value={selectedService?.id ?? ""}
                    onValueChange={(serviceId) => {
                      const service = availableServices.find(s => s.id === serviceId);
                      setSelectedService(service || null);
                    }}
                    disabled={!selectedChurch || isLoadingServices || availableServices.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={
                        isLoadingServices
                          ? "Carregando cultos..."
                          : availableServices.length === 0
                            ? "Nenhum culto encontrado"
                            : "Selecione o culto"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableServices.map((service) => {
                        const formattedDate = format(new Date(service.date + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR });
                        return (
                          <SelectItem key={service.id} value={service.id}>
                            {service.title} - {formattedDate} às {service.time}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botão Filtrar - apenas mobile */}
              <div className="mt-6 md:hidden">
                <Button
                  onClick={() => setMobileStep("list")}
                  disabled={!isConfigComplete}
                  className="w-full gap-2"
                  size="lg"
                >
                  Filtrar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alerta de Configuração */}
          {!isConfigComplete && (
            <Alert variant="destructive" className="mt-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-400">
                Configure o culto antes de continuar
              </AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Selecione a <strong>igreja e data</strong> acima para carregar os cultos disponíveis.
                {availableServices.length === 0 && !isLoadingServices && selectedChurch && (
                  <span className="block mt-2">Nenhum culto cadastrado foi encontrado com os filtros selecionados.</span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Conteúdo da Listagem - Visível sempre no desktop, apenas na etapa "list" no mobile */}
        <div className={cn(
          "space-y-4 md:space-y-6 md:block",
          mobileStep === "list" ? "block flex-1 flex flex-col" : "hidden"
        )}>
          {/* Barra de ações mobile - Voltar, Stats e Visitante */}
          <div className="flex items-center justify-between gap-2 md:hidden">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileStep("filters")}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Filtros
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileStats(!showMobileStats)}
                className={cn(
                  "gap-1",
                  showMobileStats && "bg-primary/10 border-primary"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                <ChevronDown className={cn(
                  "h-3 w-3 transition-transform",
                  showMobileStats && "rotate-180"
                )} />
              </Button>
            </div>
            <Button
              size="sm"
              className="gap-1"
              disabled={!selectedService || !canManageAttendance}
              onClick={() => setVisitorDialogOpen(true)}
              title={!selectedService ? "Selecione um culto primeiro" : !canManageAttendance ? "Você só pode adicionar visitantes na data de hoje" : undefined}
            >
              <UserPlus className="h-4 w-4" />
              Visitante
            </Button>
          </div>

          {/* Resumo e Estatísticas - colapsável no mobile */}
          <div className={cn(
            "space-y-4 md:block",
            showMobileStats ? "block" : "hidden md:block"
          )}>
            {/* Resumo dos Filtros - apenas mobile */}
            <div className="md:hidden p-3 bg-muted/50 rounded-lg">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline" className="gap-1 text-xs">
                  <Church className="h-3 w-3" />
                  {selectedChurch || "Não selecionada"}
                </Badge>
                <Badge variant="outline" className="gap-1 text-xs">
                  <CalendarDays className="h-3 w-3" />
                  {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                </Badge>
                {selectedService && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Users className="h-3 w-3" />
                    {selectedService.title}
                  </Badge>
                )}
              </div>
            </div>

            {/* Estatísticas Rápidas - 2 colunas no mobile, 4 no desktop */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Membros</p>
                    {isLoadingStats ? (
                      <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin mt-1" />
                    ) : (
                      <p className="text-xl md:text-2xl font-bold">{stats?.totalMembers ?? 0}</p>
                    )}
                  </div>
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-500 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Presentes</p>
                    {isLoadingAttendances ? (
                      <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin mt-1" />
                    ) : (
                      <p className="text-xl md:text-2xl font-bold text-green-600">
                        {membersPresent}
                        {visitorsPresent > 0 && (
                          <span className="text-xs md:text-sm font-normal ml-1">
                            +{visitorsPresent}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <UserCheck className="h-6 w-6 md:h-8 md:w-8 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-200/50">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Ausentes</p>
                    {isLoadingStats ? (
                      <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin mt-1" />
                    ) : (
                      <p className="text-xl md:text-2xl font-bold text-red-600">
                        {stats?.absentMembers ?? 0}
                      </p>
                    )}
                  </div>
                  <UserX className="h-6 w-6 md:h-8 md:w-8 text-red-500 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Taxa Presença</p>
                    {isLoadingStats ? (
                      <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin mt-1" />
                    ) : (
                      <p className="text-xl md:text-2xl font-bold text-purple-600">
                        {stats?.attendanceRate ?? 0}%
                      </p>
                    )}
                  </div>
                  <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-purple-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Composição dos presentes.
                "Presentes" conta todo mundo com cadastro que entrou na sala; a taxa
                conta só membros Ativo da igreja do culto. Sem esta linha, algo como
                "71 presentes, 81%" parece erro de soma. A garantia aritmética da API é
                ativos + outra igreja + não-ativos = presentes. */}
            {stats && stats.activeMembersPresent !== undefined && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  {stats.presentMembers} membro(s) na sala
                </span>
                {": "}
                {stats.activeMembersPresent} ativo(s)
                {selectedService?.city ? ` de ${selectedService.city}` : ""}
                {stats.otherChurchMembers ? ` · ${stats.otherChurchMembers} de outra igreja` : ""}
                {stats.nonActiveMembers ? ` · ${stats.nonActiveMembers} não-ativo(s)` : ""}
                {(stats.visitors ?? visitorsPresent)
                  ? ` · ${stats.visitors ?? visitorsPresent} visitante(s)`
                  : ""}
                {". "}
                A taxa de {stats.attendanceRate}% considera apenas membros ativos da igreja onde o
                culto aconteceu.
              </p>
            )}
          </div>

        {/* Visitantes */}
        {visitors.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Visitantes ({visitors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {visitors.map((visitor) => (
                  <Badge
                    key={visitor.id}
                    variant="secondary"
                    className={cn(
                      "gap-2 py-2 px-3 transition-colors",
                      canManageAttendance
                        ? "cursor-pointer hover:bg-sky-100 hover:text-sky-800 dark:hover:bg-sky-900/30 dark:hover:text-sky-200"
                        : "cursor-not-allowed opacity-70"
                    )}
                    onClick={() => canManageAttendance && openVisitorEditModal(visitor)}
                    title={canManageAttendance ? "Clique para editar visitante" : "Você só pode editar visitantes na data de hoje"}
                  >
                    <UserPlus className="h-3 w-3 transition-colors" />
                    {visitor.visitorName}
                    {visitor.visitorPhone && (
                      <span className="text-sky-600 dark:text-sky-400">
                        ({visitor.visitorPhone})
                      </span>
                    )}
                    {canManageAttendance && (
                      <X
                        className="h-3 w-3 ml-1 transition-colors hover:text-red-600 dark:hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeVisitor(visitor);
                        }}
                        title="Remover visitante"
                      />
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Membros */}
        <Card className="shadow-lg border-0 -mx-6 rounded-none md:mx-0 md:rounded-lg flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 md:pb-6">
            {/* Mobile Header - simplificado */}
            <div className="flex items-center justify-between md:hidden">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Lista de Membros
              </CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
                    <Church className="h-4 w-4" />
                    <span className="text-xs max-w-[80px] truncate">
                      {memberChurchFilter === "all" ? "Todas" : memberChurchFilter}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <div className="space-y-1">
                    <Button
                      variant={memberChurchFilter === "all" ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setMemberChurchFilter("all")}
                    >
                      Todas as Igrejas
                    </Button>
                    {CHURCHES.map((church) => (
                      <Button
                        key={church}
                        variant={memberChurchFilter === church ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setMemberChurchFilter(church)}
                      >
                        {church}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Desktop Header - completo */}
            <div className="hidden md:flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Lista de Membros
                </CardTitle>
                <CardDescription>
                  Clique no nome do membro para marcar/desmarcar presenca
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select
                  value={memberChurchFilter}
                  onValueChange={(v) => setMemberChurchFilter(v as ChurchType | "all")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por igreja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Igrejas</SelectItem>
                    {CHURCHES.map((church) => (
                      <SelectItem key={church} value={church}>
                        {church}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            {/* Filtros */}
            <div className="flex gap-2 mb-3 flex-shrink-0">
              {/* Modo Registro (hoje): mostra "Todos" | "Presentes" */}
              {/* Modo Visualização (outros dias): mostra "Ausentes" | "Presentes" */}
              {isSelectedDateToday ? (
                <>
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                    className="flex-1 gap-1.5 md:flex-none"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Todos ({absentMembersCount})
                  </Button>
                  <Button
                    variant={filterStatus === "present" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("present")}
                    className="flex-1 gap-1.5 md:flex-none"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Presentes ({membersPresent})
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant={filterStatus === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("pending")}
                    className="flex-1 gap-1.5 md:flex-none"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Ausentes ({absentMembersCount})
                  </Button>
                  <Button
                    variant={filterStatus === "present" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("present")}
                    className="flex-1 gap-1.5 md:flex-none"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Presentes ({membersPresent})
                  </Button>
                </>
              )}
            </div>

            {/* Busca - maior no mobile */}
            <div className="relative flex-shrink-0 mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 md:h-4 md:w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 md:pl-10 pr-10 h-12 md:h-10 text-base md:text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5 md:h-4 md:w-4" />
                </button>
              )}
            </div>

            {/* Lista */}
            <div className="space-y-2 flex-1 overflow-y-auto -mx-6 px-6 md:mx-0 md:px-0">
              {isLoadingMembers ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground mt-2">Carregando membros...</p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum membro encontrado</p>
                </div>
              ) : (
                filteredMembers
                  .filter((member) => !pendingSwipes.has(member.id)) // Esconde membros sendo salvos
                  .map((member) => {
                  // Determinar se o membro está presente
                  // No modo "all" e "pending", todos são ausentes
                  // No modo "present", todos são presentes
                  const isPresent = filterStatus === "present";
                  const isToggling = togglingMemberId === member.id;
                  const canToggle = selectedService && canManageAttendance;
                  const isSwiping = swipingMemberId === member.id;

                  return (
                    <div
                      key={member.id}
                      className="relative overflow-hidden"
                    >
                      {/* Fundo verde que aparece ao arrastar para direita - marcar presença (mobile) */}
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 bg-green-500 flex items-center justify-start pl-4 md:hidden",
                          isSwiping && swipeOffset > 20 ? "opacity-100" : "opacity-0"
                        )}
                        style={{ width: Math.max(0, swipeOffset) }}
                      >
                        <Check className="h-6 w-6 text-white" />
                      </div>

                      {/* Fundo vermelho que aparece ao arrastar para esquerda - remover presença (mobile) */}
                      <div
                        className={cn(
                          "absolute inset-y-0 right-0 bg-red-500 flex items-center justify-end pr-4 md:hidden",
                          isSwiping && swipeOffset < -20 ? "opacity-100" : "opacity-0"
                        )}
                        style={{ width: Math.abs(Math.min(0, swipeOffset)) }}
                      >
                        <X className="h-6 w-6 text-white" />
                      </div>

                      <div
                        // Desktop: click para toggle | Mobile: swipe
                        onClick={() => {
                          // Apenas desktop usa click
                          if (window.innerWidth >= 768) {
                            !isToggling && canToggle && toggleMemberAttendance(member.id);
                          }
                        }}
                        onTouchStart={(e) => canToggle && handleTouchStart(e, member.id)}
                        onTouchMove={(e) => canToggle && handleTouchMove(e, member.id, isPresent)}
                        onTouchEnd={() => canToggle && handleTouchEnd(member.id, member.name, isPresent)}
                        title={!canManageAttendance ? "Você só pode registrar presenças na data de hoje" : undefined}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border transition-all",
                          !canToggle && "opacity-50 cursor-not-allowed",
                          canToggle && "md:cursor-pointer",
                          isPresent
                            ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                            : "bg-card border-border",
                          canToggle && isPresent && "md:hover:bg-green-100",
                          canToggle && !isPresent && "md:hover:bg-muted/50",
                          // Feedback visual durante swipe
                          isSwiping && "transition-none"
                        )}
                        style={{
                          transform: isSwiping ? `translateX(${swipeOffset}px)` : undefined,
                          touchAction: 'pan-y',
                        }}
                      >
                        {/* Checkbox: esconde no mobile quando não está presente */}
                        <div className={cn("hidden md:block", isPresent && "block")}>
                          {isToggling ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : (
                            <Checkbox
                              checked={isPresent}
                              onCheckedChange={() => {
                                if (window.innerWidth >= 768) {
                                  canToggle && toggleMemberAttendance(member.id);
                                }
                              }}
                              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                              disabled={!canToggle}
                            />
                          )}
                        </div>

                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.photoUrl} alt={member.name} />
                          <AvatarFallback
                            className={cn(
                              isPresent ? "bg-green-200 text-green-700" : "bg-muted"
                            )}
                          >
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{member.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {member.church}
                            {member.primaryPhone && ` - ${member.primaryPhone}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {member.ministry && (
                            <Badge variant="secondary" className="hidden sm:inline-flex">
                              {member.ministry}
                            </Badge>
                          )}

                          {/* Badge: mostra apenas Presente, Ausente só no desktop */}
                          {isPresent ? (
                            <Badge className="bg-green-600 hover:bg-green-700 gap-1">
                              <Check className="h-3 w-3" />
                              Presente
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground gap-1 hidden md:inline-flex">
                              <X className="h-3 w-3" />
                              Ausente
                            </Badge>
                          )}

                          {/* Indicador de swipe no mobile */}
                          {!isPresent && canToggle && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground/50 md:hidden" />
                          )}
                          {isPresent && canToggle && (
                            <ArrowLeft className="h-4 w-4 text-muted-foreground/50 md:hidden" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Dialog de confirmação para ações em datas históricas (admin) */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Confirmar {confirmDialog.isRemoving ? "remoção" : "registro"} de presença
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Você está prestes a{" "}
                <strong>
                  {confirmDialog.isRemoving ? "remover" : "registrar"}{" "}
                  {confirmDialog.isVisitor ? "visitante" : "presença"}
                </strong>{" "}
                em uma data diferente de hoje.
              </p>
              {confirmDialog.memberName && (
                <p className="text-foreground font-medium">
                  {confirmDialog.isVisitor ? "Visitante" : "Membro"}: {confirmDialog.memberName}
                </p>
              )}
              <p className="text-foreground font-medium">
                Data do culto: {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Esta ação irá modificar dados históricos. Deseja continuar?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmDialog.action();
                setConfirmDialog({ open: false, action: () => {} });
              }}
              className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-600"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AttendanceControl;
