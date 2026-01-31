import { useState, useEffect, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { attendanceService } from "@/services/attendance";
import { membersService } from "@/services/members";
import { Member } from "@/types/member";
import { Attendance, AttendanceStats, SERVICE_TIMES } from "@/types/attendance";
import { SCHEDULE_CATEGORIES, CHURCHES, ScheduleCategory, Church as ChurchType } from "@/types/schedule";

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
  const { isAdmin } = useAuth();

  // Filtros do culto
  const [selectedChurch, setSelectedChurch] = useState<ChurchType | "">("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("19:00");
  const [selectedType, setSelectedType] = useState<ScheduleCategory>(() => getServiceTypeByDay(new Date()));

  // Verificar se configuração está completa
  const isConfigComplete = selectedChurch !== "";

  // Verificar se pode executar ações de presença
  // Não-admin só pode marcar/desmarcar presença na data atual
  const isSelectedDateToday = isToday(selectedDate);
  const canManageAttendance = isAdmin || isSelectedDateToday;

  // Filtro de membros
  const [memberChurchFilter, setMemberChurchFilter] = useState<ChurchType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"pending" | "present">("pending");

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

  // Geolocalização
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  // Atualizar tipo de culto quando a data mudar
  useEffect(() => {
    setSelectedType(getServiceTypeByDay(selectedDate));
  }, [selectedDate]);

  // IDs dos membros que já têm presença
  const presentMemberIds = useMemo(() => {
    const ids = attendances
      .filter((a) => a.memberId !== null || a.member?.id !== undefined)
      .map((a) => {
        const id = a.memberId ?? a.member?.id;
        return typeof id === 'string' ? parseInt(id, 10) : id;
      })
      .filter((id): id is number => id !== null && id !== undefined && !isNaN(id));

    return new Set(ids);
  }, [attendances]);

  // Visitantes na lista de presenças
  const visitors = useMemo(() => {
    return attendances.filter((a) => a.visitorName !== null);
  }, [attendances]);

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
      (error) => {
        console.log("Geolocation error:", error.message);
        setIsDetectingLocation(false);
        // Não mostra erro - apenas não pré-seleciona
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutos de cache
      }
    );
  }, []);

  // Carregar membros
  useEffect(() => {
    const loadMembers = async () => {
      setIsLoadingMembers(true);
      try {
        const data = await membersService.getAll();
        // Filtrar apenas membros ativos
        setMembers(data.filter((m) => m.membershipStatus === "Ativo"));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao carregar membros";
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadMembers();
  }, []);

  // Carregar presenças e estatísticas quando os filtros mudarem
  useEffect(() => {
    if (!selectedChurch) return;

    const loadAttendances = async () => {
      setIsLoadingAttendances(true);
      try {
        const data = await attendanceService.list({
          serviceDate: format(selectedDate, "yyyy-MM-dd"),
          church: selectedChurch,
          serviceType: selectedType,
          serviceTime: selectedTime,
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
          serviceDate: format(selectedDate, "yyyy-MM-dd"),
          serviceTime: selectedTime,
          serviceType: selectedType,
          church: selectedChurch,
        });
        setStats(data);
      } catch (error) {
        // Se não houver estatísticas, calcular localmente
        const totalMembers = members.filter(
          (m) => m.church === selectedChurch && m.membershipStatus === "Ativo"
        ).length;
        setStats({
          totalMembers,
          presentMembers: 0,
          absentMembers: totalMembers,
          attendanceRate: 0,
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadAttendances();
    loadStats();
  }, [selectedChurch, selectedDate, selectedTime, selectedType]);

  // Filtrar membros
  const filteredMembers = useMemo(() => {
    let filtered = members;

    // Filtrar por igreja do membro (para facilitar busca)
    if (memberChurchFilter !== "all") {
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

    // Filtrar por status de presença
    // "pending" mostra membros que ainda NÃO foram marcados como presentes
    // "present" mostra membros que JÁ foram marcados como presentes
    if (filterStatus === "pending") {
      filtered = filtered.filter((m) => !presentMemberIds.has(m.id));
    } else if (filterStatus === "present") {
      filtered = filtered.filter((m) => presentMemberIds.has(m.id));
    }

    return filtered;
  }, [members, memberChurchFilter, searchTerm, filterStatus, presentMemberIds]);

  // Toggle presença de membro
  const toggleMemberAttendance = async (memberId: number) => {
    if (!selectedChurch) {
      toast({
        title: "Selecione uma igreja",
        description: "É necessário selecionar a igreja do culto primeiro.",
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

    setTogglingMemberId(memberId);

    try {
      const result = await attendanceService.toggle({
        memberId,
        serviceDate: format(selectedDate, "yyyy-MM-dd"),
        serviceTime: selectedTime,
        serviceType: selectedType,
        church: selectedChurch,
      });

      // Usar result.action para decidir se estamos removendo ou adicionando
      const wasRemoved = result.action === 'removed';

      if (wasRemoved) {
        // Presença foi removida
        setAttendances((prev) => prev.filter((a) => {
          const attendanceMemberId = typeof a.memberId === 'string'
            ? parseInt(a.memberId, 10)
            : a.memberId;
          return attendanceMemberId !== memberId;
        }));
        toast({
          title: "Presença removida",
          description: "A presença foi desmarcada com sucesso.",
        });
      } else {
        // Presença foi criada (action === 'created')
        setAttendances((prev) => [
          ...prev,
          {
            id: result.id ?? Date.now(),
            memberId: memberId,
            member: result.member ?? null,
            visitorName: null,
            visitorPhone: null,
            serviceDate: result.serviceDate ?? format(selectedDate, "yyyy-MM-dd"),
            serviceTime: result.serviceTime ?? selectedTime,
            serviceType: result.serviceType ?? selectedType,
            church: result.church ?? selectedChurch,
            recordedBy: result.recordedBy ?? 0,
            createdAt: result.createdAt ?? new Date().toISOString(),
          },
        ]);
        toast({
          title: "Presença registrada",
          description: "A presença foi marcada com sucesso.",
        });
      }

      // Atualizar estatísticas
      if (stats) {
        const newPresentCount = wasRemoved
          ? stats.presentMembers - 1
          : stats.presentMembers + 1;
        setStats({
          ...stats,
          presentMembers: newPresentCount,
          absentMembers: stats.totalMembers - newPresentCount,
          attendanceRate: Math.round((newPresentCount / stats.totalMembers) * 100),
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao registrar presença";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setTogglingMemberId(null);
    }
  };

  // Adicionar visitante
  const handleAddVisitor = async () => {
    if (!selectedChurch) {
      toast({
        title: "Selecione uma igreja",
        description: "É necessário selecionar a igreja do culto primeiro.",
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

    setIsAddingVisitor(true);

    try {
      const result = await attendanceService.toggle({
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim() || undefined,
        serviceDate: format(selectedDate, "yyyy-MM-dd"),
        serviceTime: selectedTime,
        serviceType: selectedType,
        church: selectedChurch,
      });

      // Usar result.action para verificar se foi criado (igual ao toggle de membros)
      if (result.action === 'created') {
        const addedVisitorName = visitorName.trim();
        const addedVisitorPhone = visitorPhone.trim() || null;

        setAttendances((prev) => [
          ...prev,
          {
            id: result.id ?? Date.now(),
            memberId: null,
            member: null,
            visitorName: result.visitorName ?? addedVisitorName,
            visitorPhone: result.visitorPhone ?? addedVisitorPhone,
            serviceDate: result.serviceDate ?? format(selectedDate, "yyyy-MM-dd"),
            serviceTime: result.serviceTime ?? selectedTime,
            serviceType: result.serviceType ?? selectedType,
            church: result.church ?? selectedChurch,
            recordedBy: result.recordedBy ?? 0,
            createdAt: result.createdAt ?? new Date().toISOString(),
          },
        ]);

        toast({
          title: "Visitante adicionado",
          description: `${addedVisitorName} foi adicionado como visitante.`,
        });

        setVisitorName("");
        setVisitorPhone("");
        setVisitorDialogOpen(false);
      }
    } catch (error) {
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

  // Remover visitante
  const removeVisitor = async (attendance: Attendance) => {
    // Verificar permissão: não-admin só pode remover visitante na data atual
    if (!canManageAttendance) {
      toast({
        title: "Ação não permitida",
        description: "Você só pode remover visitantes na data de hoje.",
        variant: "destructive",
      });
      return;
    }

    try {
      await attendanceService.toggle({
        visitorName: attendance.visitorName!,
        serviceDate: format(selectedDate, "yyyy-MM-dd"),
        serviceTime: selectedTime,
        serviceType: selectedType,
        church: selectedChurch as ChurchType,
      });

      setAttendances((prev) => prev.filter((a) => a.id !== attendance.id));

      toast({
        title: "Visitante removido",
        description: "O visitante foi removido da lista de presença.",
      });
    } catch (error) {
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
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <MobileBackButton />
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Presenca</h1>
            <p className="text-muted-foreground mt-1">
              Registre a presenca dos membros e visitantes nos cultos
            </p>
          </div>
          <Dialog open={visitorDialogOpen} onOpenChange={setVisitorDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                disabled={!selectedChurch || !canManageAttendance}
                title={!canManageAttendance ? "Você só pode adicionar visitantes na data de hoje" : undefined}
              >
                <UserPlus className="h-4 w-4" />
                Adicionar Visitante
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Visitante</DialogTitle>
                <DialogDescription>
                  Registre a presenca de um visitante no culto
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
                <Button variant="outline" onClick={() => setVisitorDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddVisitor} disabled={isAddingVisitor}>
                  {isAddingVisitor ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

        {/* Filtros do Culto */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Configuracao do Culto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
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

              {/* Horário */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Horário
                </label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TIMES.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Culto */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Tipo de Culto
                </label>
                <Select
                  value={selectedType}
                  onValueChange={(v) => setSelectedType(v as ScheduleCategory)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHEDULE_CATEGORIES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerta de Configuração */}
        {!isConfigComplete && (
          <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-400">
              Configure o culto antes de continuar
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Selecione a <strong>igreja do culto</strong> acima para habilitar o registro de presença.
              A data, horário e tipo de culto foram pré-selecionados automaticamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Estatísticas Rápidas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Membros</p>
                  {isLoadingStats ? (
                    <Loader2 className="h-5 w-5 animate-spin mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.totalMembers ?? 0}</p>
                  )}
                </div>
                <Users className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Presentes</p>
                  {isLoadingAttendances ? (
                    <Loader2 className="h-5 w-5 animate-spin mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-green-600">
                      {membersPresent}
                      {visitorsPresent > 0 && (
                        <span className="text-sm font-normal ml-1">
                          + {visitorsPresent} vis.
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <UserCheck className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ausentes</p>
                  {isLoadingStats ? (
                    <Loader2 className="h-5 w-5 animate-spin mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-red-600">
                      {stats?.absentMembers ?? 0}
                    </p>
                  )}
                </div>
                <UserX className="h-8 w-8 text-red-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Presenca</p>
                  {isLoadingStats ? (
                    <Loader2 className="h-5 w-5 animate-spin mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-purple-600">
                      {stats?.attendanceRate ?? 0}%
                    </p>
                  )}
                </div>
                <CheckCircle2 className="h-8 w-8 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
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
                        ? "cursor-pointer hover:bg-sky-100 hover:text-sky-800 dark:hover:bg-sky-900/30 dark:hover:text-sky-200 [&_svg]:hover:text-sky-700 dark:[&_svg]:hover:text-sky-300"
                        : "cursor-not-allowed opacity-70"
                    )}
                    onClick={() => canManageAttendance && removeVisitor(visitor)}
                    title={!canManageAttendance ? "Você só pode remover visitantes na data de hoje" : undefined}
                  >
                    <UserPlus className="h-3 w-3 transition-colors" />
                    {visitor.visitorName}
                    {visitor.visitorPhone && (
                      <span className="text-sky-600 dark:text-sky-400">
                        ({visitor.visitorPhone})
                      </span>
                    )}
                    {canManageAttendance && <X className="h-3 w-3 ml-1 transition-colors" />}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Membros */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
          <CardContent>
            {/* Busca e Filtros */}
            <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("pending")}
                  className="gap-1"
                >
                  <Users className="h-3 w-3" />
                  Todos ({members.filter(m =>
                    (memberChurchFilter === "all" || m.church === memberChurchFilter) &&
                    !presentMemberIds.has(m.id)
                  ).length})
                </Button>
                <Button
                  variant={filterStatus === "present" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("present")}
                  className="gap-1"
                >
                  <Check className="h-3 w-3" />
                  Presentes ({membersPresent})
                </Button>
              </div>
            </div>

            {/* Lista */}
            <div className="space-y-2">
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
                filteredMembers.map((member) => {
                  const isPresent = presentMemberIds.has(member.id);
                  const isToggling = togglingMemberId === member.id;
                  const canToggle = selectedChurch && canManageAttendance;

                  return (
                    <div
                      key={member.id}
                      onClick={() => !isToggling && canToggle && toggleMemberAttendance(member.id)}
                      title={!canManageAttendance ? "Você só pode registrar presenças na data de hoje" : undefined}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-all duration-200",
                        !canToggle && "opacity-50 cursor-not-allowed",
                        canToggle && "cursor-pointer",
                        isPresent
                          ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                          : "bg-card border-border",
                        canToggle && isPresent && "hover:bg-green-100",
                        canToggle && !isPresent && "hover:bg-muted/50"
                      )}
                    >
                      {isToggling ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <Checkbox
                          checked={isPresent}
                          onCheckedChange={() => canToggle && toggleMemberAttendance(member.id)}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          disabled={!canToggle}
                        />
                      )}

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

                        {isPresent ? (
                          <Badge className="bg-green-600 hover:bg-green-700 gap-1">
                            <Check className="h-3 w-3" />
                            Presente
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground gap-1">
                            <X className="h-3 w-3" />
                            Ausente
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceControl;
