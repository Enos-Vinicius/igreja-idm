import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Search,
  Loader2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import MobileBackButton from "@/components/MobileBackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { MonthPicker } from "@/components/ui/month-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { serviceScheduleService } from "@/services/serviceSchedule";
import { ServiceSchedule, CreateServiceScheduleDto } from "@/types/serviceSchedule";
import { useAuth } from "@/contexts/AuthContext";

const ServiceScheduleManagement = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user can delete
  const canDelete = user?.role && ['admin', 'admin2', 'secretary', 'receptionist'].includes(user.role);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceSchedule | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateServiceScheduleDto>({
    id: "",
    title: "",
    city: "",
    state: "MG",
    address: "",
    date: "",
    time: "19:00",
    endTime: "",
  });

  useEffect(() => {
    loadServices();
  }, [selectedMonth]);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const filters = selectedMonth ? { month: selectedMonth } : undefined;
      const data = await serviceScheduleService.getAll(filters);
      setServices(data);
    } catch (error) {
      console.error("Erro ao carregar cultos:", error);
      toast.error("Erro ao carregar cultos");
    } finally {
      setIsLoading(false);
    }
  };

  const generateId = (date: string, city: string, title: string) => {
    const cityId = city.toLowerCase().replace(/\s+/g, '-');
    const titleId = title.toLowerCase().replace(/\s+/g, '-');
    return `${date}-${cityId}-${titleId}`;
  };

  const getCityDetails = (city: string) => {
    if (city === "Uberaba") {
      return {
        address: "Av. Cel. Joaquim de Oliveira Prata, 1817 - Parque São Geraldo",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+Joaquim+de+Oliveira+Prata,+1817+-+Parque+São+Geraldo,+Uberaba+-+MG"
      };
    } else if (city === "Conceição das Alagoas") {
      return {
        address: "R. Santa Rita, 149 - Centro",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=R.+Santa+Rita,+149+-+Centro,+Concei%C3%A7%C3%A3o+das+Alagoas+-+MG"
      };
    }
    return { address: "", mapsUrl: "" };
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const id = generateId(formData.date, formData.city, formData.title);
      const cityDetails = getCityDetails(formData.city);

      const payload: CreateServiceScheduleDto = {
        ...formData,
        id,
        mapsUrl: cityDetails.mapsUrl
      };

      // Remove endTime if empty
      if (!payload.endTime) {
        delete payload.endTime;
      }

      await serviceScheduleService.create(payload);
      toast.success("Culto criado com sucesso!");
      setShowCreateModal(false);
      resetForm();
      loadServices();
    } catch (error) {
      console.error("Erro ao criar culto:", error);
      toast.error("Erro ao criar culto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmitting(true);
    try {
      const cityDetails = getCityDetails(formData.city);

      const payload: any = {
        title: formData.title,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        date: formData.date,
        time: formData.time,
        endTime: formData.endTime || undefined,
        hasKidsMinistry: formData.hasKidsMinistry,
        mapsUrl: cityDetails.mapsUrl,
      };

      await serviceScheduleService.update(selectedService.id, payload);
      toast.success("Culto atualizado com sucesso!");
      setShowEditModal(false);
      resetForm();
      loadServices();
    } catch (error) {
      console.error("Erro ao atualizar culto:", error);
      toast.error("Erro ao atualizar culto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;

    setIsSubmitting(true);
    try {
      await serviceScheduleService.delete(selectedService.id);
      toast.success("Culto deletado com sucesso!");
      setShowDeleteDialog(false);
      setSelectedService(null);
      loadServices();
    } catch (error) {
      console.error("Erro ao deletar culto:", error);
      toast.error("Erro ao deletar culto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (service: ServiceSchedule) => {
    setSelectedService(service);
    setFormData({
      id: service.id,
      title: service.title,
      city: service.city,
      state: service.state,
      address: service.address,
      date: service.date,
      time: service.time,
      endTime: service.endTime || "",
      hasKidsMinistry: service.hasKidsMinistry || false,
    });
    setShowEditModal(true);
  };

  const openDeleteDialog = (service: ServiceSchedule) => {
    setSelectedService(service);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      city: "",
      state: "MG",
      address: "",
      date: "",
      time: "19:00",
      endTime: "",
    });
    setSelectedService(null);
  };

  const formatServiceDate = (dateStr: string) => {
    try {
      const date = parse(dateStr, 'yyyy-MM-dd', new Date());
      const dayOfWeek = format(date, 'EEEE', { locale: ptBR });
      const restOfDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

      // Capitaliza a primeira letra do dia da semana
      const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

      return { dayOfWeek: capitalizedDay, restOfDate };
    } catch {
      return { dayOfWeek: '', restOfDate: dateStr };
    }
  };

  const filteredServices = (services || []).filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <MobileBackButton />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Gerenciar Cultos
          </h1>
          <p className="text-muted-foreground mt-1">
            Cadastre e gerencie os cultos da igreja
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título, cidade ou endereço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Month Filter */}
              <div className="w-full md:w-48">
                <MonthPicker
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  placeholder="Filtrar por mês"
                />
              </div>

              {/* Create Button */}
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Culto
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Services List */}
        <Card>
          <CardHeader>
            <CardTitle>Cultos Cadastrados</CardTitle>
            <CardDescription>
              {filteredServices.length} {filteredServices.length === 1 ? 'culto encontrado' : 'cultos encontrados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum culto encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{service.title}</h3>
                          {service.hasKidsMinistry && (
                            <Badge variant="secondary" className="gap-1">
                              <Users className="h-3 w-3" />
                              Ministério Infantil
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                              <span className="font-bold">{formatServiceDate(service.date).dayOfWeek}</span>
                              {', '}
                              {formatServiceDate(service.date).restOfDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {service.time}{service.endTime ? ` - ${service.endTime}` : ""}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {service.city}, {service.state}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{service.address}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(service)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {canDelete && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDeleteDialog(service)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <form onSubmit={handleCreateSubmit}>
              <div className="overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
                <DialogHeader>
                  <DialogTitle>Criar Novo Culto</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do culto que será realizado
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
              {/* Linha 1: Título 70% | Igreja 30% */}
              <div className="grid grid-cols-10 gap-4">
                <div className="space-y-2 col-span-7">
                  <Label htmlFor="title">Título do Culto *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Culto de Domingo"
                    required
                  />
                </div>

                <div className="space-y-2 col-span-3">
                  <Label htmlFor="city">Igreja *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => {
                      const cityDetails = getCityDetails(value);
                      setFormData({
                        ...formData,
                        city: value,
                        address: cityDetails.address,
                        state: "MG"
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a igreja" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Uberaba">Uberaba</SelectItem>
                      <SelectItem value="Conceição das Alagoas">Conceição das Alagoas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Linha 2: Data | Início | Término (proporções iguais) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <DateInput
                    id="date"
                    value={formData.date}
                    onChangeString={(value) => setFormData({ ...formData, date: value })}
                    minDate={new Date()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm">Início *</Label>
                  <TimePicker
                    value={formData.time}
                    onChange={(value) => setFormData({ ...formData, time: value })}
                    placeholder="HH:MM"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-sm">Término</Label>
                  <TimePicker
                    value={formData.endTime || ""}
                    onChange={(value) => setFormData({ ...formData, endTime: value })}
                    placeholder="HH:MM"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                  <Switch
                    id="hasKidsMinistry"
                    checked={formData.hasKidsMinistry}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, hasKidsMinistry: checked })
                    }
                  />
                  <Label htmlFor="hasKidsMinistry" className="cursor-pointer">
                    Possui Ministério Infantil
                  </Label>
                </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Culto
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <form onSubmit={handleEditSubmit}>
              <div className="overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
                <DialogHeader>
                  <DialogTitle>Editar Culto</DialogTitle>
                  <DialogDescription>
                    Atualize as informações do culto
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
              {/* Linha 1: Título 70% | Igreja 30% */}
              <div className="grid grid-cols-10 gap-4">
                <div className="space-y-2 col-span-7">
                  <Label htmlFor="edit-title">Título do Culto *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2 col-span-3">
                  <Label htmlFor="edit-city">Igreja *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => {
                      const cityDetails = getCityDetails(value);
                      setFormData({
                        ...formData,
                        city: value,
                        address: cityDetails.address,
                        state: "MG"
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Uberaba">Uberaba</SelectItem>
                      <SelectItem value="Conceição das Alagoas">Conceição das Alagoas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Linha 2: Data | Início | Término (proporções iguais) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Data *</Label>
                  <DateInput
                    id="edit-date"
                    value={formData.date}
                    onChangeString={(value) => setFormData({ ...formData, date: value })}
                    minDate={new Date()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-time" className="text-sm">Início *</Label>
                  <TimePicker
                    value={formData.time}
                    onChange={(value) => setFormData({ ...formData, time: value })}
                    placeholder="HH:MM"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-endTime" className="text-sm">Término</Label>
                  <TimePicker
                    value={formData.endTime || ""}
                    onChange={(value) => setFormData({ ...formData, endTime: value })}
                    placeholder="HH:MM"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-hasKidsMinistry"
                    checked={formData.hasKidsMinistry}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, hasKidsMinistry: checked })
                    }
                  />
                  <Label htmlFor="edit-hasKidsMinistry" className="cursor-pointer">
                    Possui Ministério Infantil
                  </Label>
                </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar o culto "{selectedService?.title}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isSubmitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default ServiceScheduleManagement;
