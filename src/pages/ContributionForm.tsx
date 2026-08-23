import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  Search,
  User,
  UserX,
  DollarSign,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { contributionsService } from "@/services/contributions";
import { serviceScheduleService } from "@/services/serviceSchedule";
import { membersService } from "@/services/members";
import {
  ContributionType,
  PaymentMethod,
  CONTRIBUTION_TYPES,
  PAYMENT_METHODS,
  ContributionItemInput,
} from "@/types/contribution";
import { Member } from "@/types/member";
import { ServiceSchedule } from "@/types/serviceSchedule";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/config/permissions";

interface ContributionItemForm {
  isMember: boolean;
  memberId?: number;
  memberName?: string;
  nonMemberName: string;
  type: ContributionType | "";
  amount: number;
  paymentMethod: PaymentMethod | "";
  notes: string;
}

const emptyItem = (): ContributionItemForm => ({
  isMember: true,
  memberId: undefined,
  memberName: undefined,
  nonMemberName: "",
  type: "",
  amount: 0,
  paymentMethod: "",
  notes: "",
});

// Filtro do seletor de culto
const RECENT_FILTER = "recent"; // mês atual + mês anterior (padrão)
const ALL_MONTHS = "all";
const YEARS_BACK = 5; // quantos anos anteriores ficam disponíveis no filtro

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const label = new Date(2000, i, 1).toLocaleDateString("pt-BR", { month: "long" });
  return {
    value: String(i + 1).padStart(2, "0"),
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

// Formata "YYYY-MM-DD" como "DD/MM/YYYY" sem aplicar timezone
function formatIsoDateBR(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

function formatAmountInput(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function parseAmountFromInput(rawInput: string): number {
  const digits = rawInput.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

interface MemberPickerProps {
  selectedMemberId?: number;
  selectedMemberName?: string;
  onSelect: (member: Member) => void;
  disabled?: boolean;
}

const MemberPicker = ({ selectedMemberId, selectedMemberName, onSelect, disabled }: MemberPickerProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Member[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (value.trim().length < 3) {
      setResults([]);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await membersService.getAll({ search: value.trim() });
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between font-normal",
            !selectedMemberId && "text-muted-foreground"
          )}
          disabled={disabled}
          type="button"
        >
          {selectedMemberName || "Buscar membro..."}
          <Search className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Digite ao menos 3 letras..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            autoFocus
          />
        </div>
        <Command>
          <CommandList className="max-h-[200px]">
            {isSearching ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                Buscando...
              </div>
            ) : results.length === 0 && searchTerm.length >= 3 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Nenhum membro encontrado
              </div>
            ) : results.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Digite para buscar
              </div>
            ) : (
              <CommandGroup>
                {results.map((m) => (
                  <CommandItem
                    key={m.id}
                    value={m.name}
                    onSelect={() => {
                      onSelect(m);
                      setOpen(false);
                      setSearchTerm("");
                      setResults([]);
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{m.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {m.churchRole || "Membro"} • {m.church || "Sem igreja"}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const ContributionForm = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Permissão
  useEffect(() => {
    if (!currentUser) return;
    const requiredAction = isEditing ? "edit" : "create";
    if (!hasPermission(currentUser.role, "contributions", requiredAction)) {
      toast.error(`Você não tem permissão para ${isEditing ? "editar" : "lançar"} contribuições`);
      navigate("/contributions", { replace: true });
    }
  }, [currentUser, isEditing, navigate]);

  // Estado comum
  const [services, setServices] = useState<ServiceSchedule[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const [errorIndexes, setErrorIndexes] = useState<Set<number>>(new Set());

  // Modo batch (criar) - guardamos o ID como string (slug do culto)
  const [serviceScheduleId, setServiceScheduleId] = useState<string>("");
  const [cultoPickerOpen, setCultoPickerOpen] = useState(false);
  const [items, setItems] = useState<ContributionItemForm[]>([emptyItem()]);

  // Filtro do seletor de culto: RECENT_FILTER = comportamento padrão (mês atual + anterior)
  const [filterYear, setFilterYear] = useState<string>(RECENT_FILTER);
  const [filterMonth, setFilterMonth] = useState<string>(ALL_MONTHS);

  // Guardamos o culto escolhido para o rótulo não se perder ao trocar o filtro
  const [selectedService, setSelectedService] = useState<ServiceSchedule | null>(null);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: YEARS_BACK + 1 }, (_, i) => String(currentYear - i));
  }, []);

  // Modo edição: usamos um único item
  // (carrega no useEffect abaixo e reaproveita a UI do item)

  // Carrega cultos (apenas para o seletor no modo batch)
  useEffect(() => {
    if (isEditing) return;
    const loadServices = async () => {
      setIsLoadingServices(true);
      try {
        // Monta a lista de meses (YYYY-MM) a buscar conforme o filtro escolhido
        const today = new Date();
        let months: string[];

        if (filterYear === RECENT_FILTER) {
          // Padrão: mês atual + mês anterior
          const prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          months = [
            `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`,
            `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
          ];
        } else if (filterMonth === ALL_MONTHS) {
          // Ano inteiro: no ano corrente não buscamos meses futuros
          const lastMonth =
            filterYear === String(today.getFullYear()) ? today.getMonth() + 1 : 12;
          months = Array.from(
            { length: lastMonth },
            (_, i) => `${filterYear}-${String(i + 1).padStart(2, "0")}`
          );
        } else {
          months = [`${filterYear}-${filterMonth}`];
        }

        const results = await Promise.all(
          months.map((month) => serviceScheduleService.getAll({ month }))
        );
        const merged = results.flat().sort(
          (a, b) => new Date(`${b.date}T${b.time || "00:00"}`).getTime() - new Date(`${a.date}T${a.time || "00:00"}`).getTime()
        );
        setServices(merged);
      } catch {
        toast.error("Erro ao carregar cultos");
      } finally {
        setIsLoadingServices(false);
      }
    };
    loadServices();
  }, [isEditing, filterYear, filterMonth]);

  // Carrega contribuição para edição
  useEffect(() => {
    if (!isEditing || !id) return;
    const loadContribution = async () => {
      setIsLoadingData(true);
      try {
        const c = await contributionsService.getById(id);
        setItems([
          {
            isMember: !!c.member,
            memberId: c.member?.id,
            memberName: c.member?.name,
            nonMemberName: c.nonMemberName || "",
            type: c.type,
            amount: c.amount,
            paymentMethod: (c.paymentMethod as PaymentMethod) || "",
            notes: c.notes || "",
          },
        ]);
        setServiceScheduleId(c.serviceScheduleId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao carregar contribuição";
        toast.error(message);
        navigate("/contributions");
      } finally {
        setIsLoadingData(false);
      }
    };
    loadContribution();
  }, [isEditing, id, navigate]);

  const updateItem = (index: number, updates: Partial<ContributionItemForm>) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
    // Limpa marca de erro ao editar
    setErrorIndexes((prev) => {
      if (!prev.has(index)) return prev;
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index: number) => {
    if (items.length === 1) {
      // Reset em vez de deixar vazio
      setItems([emptyItem()]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);

  const validateItem = (item: ContributionItemForm): string | null => {
    if (item.isMember) {
      if (!item.memberId) return "Selecione um membro";
    } else {
      if (!item.nonMemberName.trim()) return "Informe o nome do não-membro";
    }
    if (!item.type) return "Selecione o tipo";
    if (!item.amount || item.amount <= 0) return "Valor deve ser maior que zero";
    return null;
  };

  const handleSubmit = async () => {
    // Validações
    if (!isEditing && !serviceScheduleId) {
      toast.error("Selecione o culto");
      return;
    }

    const newErrorIndexes = new Set<number>();
    let firstError: string | null = null;
    items.forEach((item, index) => {
      const err = validateItem(item);
      if (err) {
        newErrorIndexes.add(index);
        if (!firstError) firstError = `Linha ${index + 1}: ${err}`;
      }
    });

    if (newErrorIndexes.size > 0) {
      setErrorIndexes(newErrorIndexes);
      toast.error(firstError || "Há linhas com problemas");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && id) {
        const item = items[0];
        await contributionsService.update(id, {
          type: item.type as ContributionType,
          amount: item.amount,
          paymentMethod: item.paymentMethod ? (item.paymentMethod as PaymentMethod) : null,
          notes: item.notes || null,
          memberId: item.isMember ? item.memberId : null,
          nonMemberName: item.isMember ? null : item.nonMemberName.trim(),
        });
        toast.success("Contribuição atualizada com sucesso!");
      } else {
        const payload = {
          serviceScheduleId,
          contributions: items.map<ContributionItemInput>((item) => ({
            type: item.type as ContributionType,
            amount: item.amount,
            ...(item.isMember
              ? { memberId: item.memberId }
              : { nonMemberName: item.nonMemberName.trim() }),
            ...(item.paymentMethod ? { paymentMethod: item.paymentMethod as PaymentMethod } : {}),
            ...(item.notes.trim() ? { notes: item.notes.trim() } : {}),
          })),
        };
        const response = await contributionsService.createBatch(payload);
        toast.success(response.message || "Contribuições registradas com sucesso!");
      }
      navigate("/contributions");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar contribuições";
      toast.error(message);
      // Se a API retornar "Item N: ...", marcar a linha
      const match = message.match(/item\s+(\d+)/i);
      if (match) {
        const idx = parseInt(match[1], 10) - 1;
        if (idx >= 0 && idx < items.length) {
          setErrorIndexes(new Set([idx]));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/contributions")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              {isEditing ? "Editar Contribuição" : "Lançar Contribuições"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isEditing
                ? "Atualize os dados da contribuição"
                : "Registre todas as contribuições do culto em um único lançamento"}
            </p>
          </div>
        </div>

        {/* Culto picker - só no modo batch (create) */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Culto</CardTitle>
              <CardDescription>Selecione o culto referente a essas contribuições</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Filtro de período - por padrão traz os 2 últimos meses */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select
                  value={filterYear}
                  onValueChange={(value) => {
                    setFilterYear(value);
                    setFilterMonth(ALL_MONTHS);
                  }}
                >
                  <SelectTrigger className="sm:w-[220px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RECENT_FILTER}>Últimos 2 meses</SelectItem>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        Ano {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filterMonth}
                  onValueChange={setFilterMonth}
                  disabled={filterYear === RECENT_FILTER}
                >
                  <SelectTrigger className="sm:w-[220px]">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_MONTHS}>Todos os meses</SelectItem>
                    {MONTH_OPTIONS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Popover open={cultoPickerOpen} onOpenChange={setCultoPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    type="button"
                    className={cn(
                      "w-full justify-between font-normal",
                      !serviceScheduleId && "text-muted-foreground"
                    )}
                    disabled={isLoadingServices}
                  >
                    {selectedService
                      ? `${formatIsoDateBR(selectedService.date)} — ${selectedService.title} (${selectedService.city})`
                      : isLoadingServices
                        ? "Carregando..."
                        : "Selecione o culto"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar por data, título ou cidade..." />
                    <CommandList className="max-h-[300px]">
                      {services.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          {filterYear === RECENT_FILTER
                            ? "Nenhum culto cadastrado nos últimos meses"
                            : "Nenhum culto cadastrado no período selecionado"}
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>Nenhum culto encontrado</CommandEmpty>
                          <CommandGroup>
                            {services.map((s) => (
                              <CommandItem
                                key={s.id}
                                value={`${formatIsoDateBR(s.date)} ${s.title} ${s.city}`}
                                onSelect={() => {
                                  setServiceScheduleId(s.id);
                                  setSelectedService(s);
                                  setCultoPickerOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    serviceScheduleId === s.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {formatIsoDateBR(s.date)} — {s.title}
                                  </span>
                                  <span className="text-xs text-muted-foreground">{s.city}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        )}

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Dados da Contribuição" : "Contribuições"}</CardTitle>
            {!isEditing && (
              <CardDescription>
                Adicione uma linha para cada contribuição (dízimo ou oferta) do culto
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => {
              const hasError = errorIndexes.has(index);
              return (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg border p-4 space-y-4 relative",
                    hasError && "border-destructive bg-destructive/5"
                  )}
                >
                  {!isEditing && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">
                        Linha {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Toggle membro/não-membro */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={item.isMember ? "default" : "outline"}
                      onClick={() =>
                        updateItem(index, {
                          isMember: true,
                          nonMemberName: "",
                        })
                      }
                      className="gap-2"
                      disabled={isSubmitting}
                    >
                      <User className="h-4 w-4" />
                      Membro
                    </Button>
                    <Button
                      type="button"
                      variant={!item.isMember ? "default" : "outline"}
                      onClick={() =>
                        updateItem(index, {
                          isMember: false,
                          memberId: undefined,
                          memberName: undefined,
                        })
                      }
                      className="gap-2"
                      disabled={isSubmitting}
                    >
                      <UserX className="h-4 w-4" />
                      Não-membro
                    </Button>
                  </div>

                  {/* Pessoa */}
                  <div>
                    <Label className="text-xs mb-1.5 block">
                      {item.isMember ? "Membro *" : "Nome do não-membro *"}
                    </Label>
                    {item.isMember ? (
                      <MemberPicker
                        selectedMemberId={item.memberId}
                        selectedMemberName={item.memberName}
                        onSelect={(m) =>
                          updateItem(index, { memberId: m.id, memberName: m.name })
                        }
                        disabled={isSubmitting}
                      />
                    ) : (
                      <Input
                        value={item.nonMemberName}
                        onChange={(e) => updateItem(index, { nonMemberName: e.target.value })}
                        placeholder="Ex: Visitante João"
                        disabled={isSubmitting}
                      />
                    )}
                  </div>

                  {/* Tipo + Valor + Método */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs mb-1.5 block">Tipo *</Label>
                      <Select
                        value={item.type || undefined}
                        onValueChange={(v) => updateItem(index, { type: v as ContributionType })}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTRIBUTION_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs mb-1.5 block">Valor *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          R$
                        </span>
                        <Input
                          inputMode="numeric"
                          value={formatAmountInput(item.amount)}
                          onChange={(e) =>
                            updateItem(index, { amount: parseAmountFromInput(e.target.value) })
                          }
                          placeholder="0,00"
                          className="pl-9 text-right"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs mb-1.5 block">Método de Pagamento</Label>
                      <Select
                        value={item.paymentMethod || undefined}
                        onValueChange={(v) =>
                          updateItem(index, { paymentMethod: v as PaymentMethod })
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label className="text-xs mb-1.5 block">Observações</Label>
                    <Textarea
                      value={item.notes}
                      onChange={(e) => updateItem(index, { notes: e.target.value })}
                      placeholder="Observações sobre essa contribuição (opcional)"
                      rows={2}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              );
            })}

            {!isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                Adicionar contribuição
              </Button>
            )}

            {/* Total */}
            {!isEditing && (
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="font-semibold text-base">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/contributions")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditing ? "Salvar Alterações" : "Salvar Contribuições"}
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContributionForm;
