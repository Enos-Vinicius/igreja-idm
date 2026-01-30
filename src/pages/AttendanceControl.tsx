import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarDays, 
  Church, 
  Users, 
  Check, 
  X, 
  Search,
  Save,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  Filter
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { mockMembers } from "@/data/mockMembers";
import { useToast } from "@/hooks/use-toast";

// Tipos
type EventType = "culto_domingo" | "culto_quarta" | "celula" | "ensaio" | "reuniao_lideres";

interface AttendanceRecord {
  memberId: string;
  present: boolean;
  note?: string;
}

// Dados mockados
const churches = [
  { id: "uberaba", name: "Igreja Uberaba", address: "Av. Principal, 1000" },
  { id: "conceicao", name: "Igreja Conceição das Alagoas", address: "Rua Central, 500" },
];

const eventTypes: { value: EventType; label: string }[] = [
  { value: "culto_domingo", label: "Culto de Domingo" },
  { value: "culto_quarta", label: "Culto de Quarta" },
  { value: "celula", label: "Célula" },
  { value: "ensaio", label: "Ensaio" },
  { value: "reuniao_lideres", label: "Reunião de Líderes" },
];

const AttendanceControl = () => {
  const { toast } = useToast();
  const [selectedChurch, setSelectedChurch] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventType>("culto_domingo");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [filterStatus, setFilterStatus] = useState<"all" | "present" | "absent">("all");
  const [isSaving, setIsSaving] = useState(false);

  // Filtrar membros
  const filteredMembers = useMemo(() => {
    let members = mockMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus === "present") {
      members = members.filter((m) => attendance[m.id]?.present);
    } else if (filterStatus === "absent") {
      members = members.filter((m) => !attendance[m.id]?.present);
    }

    return members;
  }, [searchTerm, filterStatus, attendance]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = mockMembers.length;
    const present = Object.values(attendance).filter((a) => a.present).length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, percentage };
  }, [attendance]);

  // Handlers
  const toggleAttendance = (memberId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: {
        memberId,
        present: !prev[memberId]?.present,
      },
    }));
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, AttendanceRecord> = {};
    filteredMembers.forEach((member) => {
      newAttendance[member.id] = { memberId: member.id, present: true };
    });
    setAttendance((prev) => ({ ...prev, ...newAttendance }));
  };

  const markAllAbsent = () => {
    const newAttendance: Record<string, AttendanceRecord> = {};
    filteredMembers.forEach((member) => {
      newAttendance[member.id] = { memberId: member.id, present: false };
    });
    setAttendance((prev) => ({ ...prev, ...newAttendance }));
  };

  const handleSave = async () => {
    if (!selectedChurch) {
      toast({
        title: "Selecione uma igreja",
        description: "É necessário selecionar uma igreja para salvar a presença.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);

    toast({
      title: "Presença salva com sucesso!",
      description: `${stats.present} membros presentes registrados para ${format(selectedDate, "dd/MM/yyyy")}.`,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Presença</h1>
            <p className="text-muted-foreground mt-1">
              Registre a presença dos membros nos cultos e eventos
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !selectedChurch}
            className="gap-2"
            size="lg"
          >
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Presença
              </>
            )}
          </Button>
        </div>

        {/* Filtros Principais */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Configuração do Evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Seleção de Igreja */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Church className="h-4 w-4 text-muted-foreground" />
                  Igreja
                </label>
                <Select value={selectedChurch} onValueChange={setSelectedChurch}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a igreja" />
                  </SelectTrigger>
                  <SelectContent>
                    {churches.map((church) => (
                      <SelectItem key={church.id} value={church.id}>
                        <div className="flex flex-col">
                          <span>{church.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Seleção de Data */}
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
                      {selectedDate ? (
                        format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Tipo de Evento */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Tipo de Evento
                </label>
                <Select value={selectedEvent} onValueChange={(v: EventType) => setSelectedEvent(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Membros</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
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
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
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
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <UserX className="h-8 w-8 text-red-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Presença</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.percentage}%</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

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
                  Marque os membros que estão presentes no evento
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={markAllPresent} className="gap-1">
                  <Check className="h-4 w-4" />
                  Marcar Todos
                </Button>
                <Button variant="outline" size="sm" onClick={markAllAbsent} className="gap-1">
                  <X className="h-4 w-4" />
                  Desmarcar Todos
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Busca e Filtros */}
            <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  Todos ({mockMembers.length})
                </Button>
                <Button
                  variant={filterStatus === "present" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("present")}
                  className="gap-1"
                >
                  <Check className="h-3 w-3" />
                  Presentes ({stats.present})
                </Button>
                <Button
                  variant={filterStatus === "absent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("absent")}
                  className="gap-1"
                >
                  <X className="h-3 w-3" />
                  Ausentes ({stats.absent})
                </Button>
              </div>
            </div>

            {/* Lista */}
            <div className="space-y-2">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum membro encontrado</p>
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const isPresent = attendance[member.id]?.present || false;

                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleAttendance(member.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200",
                        isPresent
                          ? "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-800"
                          : "bg-card hover:bg-muted/50 border-border"
                      )}
                    >
                      <Checkbox
                        checked={isPresent}
                        onCheckedChange={() => toggleAttendance(member.id)}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />

                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.photo} alt={member.name} />
                        <AvatarFallback className={cn(
                          isPresent ? "bg-green-200 text-green-700" : "bg-muted"
                        )}>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{member.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {member.churchRole && (
                          <Badge variant="secondary" className="hidden sm:inline-flex">
                            {member.churchRole === "pastor" && "Pastor"}
                            {member.churchRole === "leader" && "Líder"}
                            {member.churchRole === "deacon" && "Diácono"}
                            {member.churchRole === "elder" && "Presbítero"}
                            {member.churchRole === "worship_minister" && "Min. Louvor"}
                            {member.churchRole === "member" && "Membro"}
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
