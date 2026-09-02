import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { parseCivilDate } from "@/lib/date";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Music,
  BookOpen,
  Search,
  Check,
  Loader2,
  ChevronUp,
  ChevronDown,
  X,
  GripVertical,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { schedulesService } from "@/services/schedules";
import { songsService } from "@/services/songs";
import { membersService } from "@/services/members";
import { ScheduleType, SCHEDULE_CATEGORIES, CHURCHES, getScheduleTypeLabel } from "@/types/schedule";
import { Song } from "@/types/worship";
import { Member } from "@/types/member";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/config/permissions";

const worshipScheduleSchema = z.object({
  date: z.date({ required_error: "Selecione a data do culto" }),
  ministerIds: z.array(z.number()).min(1, "Selecione pelo menos um ministro"),
  category: z.string().min(1, "Selecione a categoria do culto"),
  church: z.string().min(1, "Selecione a igreja"),
  notes: z.string().optional(),
});

const preachingScheduleSchema = z.object({
  date: z.date({ required_error: "Selecione a data do culto" }),
  preacherId: z.string().min(1, "Selecione o pregador"),
  category: z.string().min(1, "Selecione a categoria do culto"),
  church: z.string().min(1, "Selecione a igreja"),
  notes: z.string().optional(),
});

const ScheduleForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  // Verificar permissões
  useEffect(() => {
    if (!user) return;

    const requiredAction = isEditing ? 'edit' : 'create';
    if (!hasPermission(user.role, 'schedules', requiredAction)) {
      toast({
        title: 'Sem permissão',
        description: 'Você não tem permissão para ' + (isEditing ? 'editar' : 'criar') + ' escalas',
        variant: 'destructive',
      });
      navigate('/schedules', { replace: true });
    }
  }, [user, isEditing, navigate, toast]);

  const [scheduleType, setScheduleType] = useState<ScheduleType>("Louvor");
  const [selectedSongs, setSelectedSongs] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [ministers, setMinisters] = useState<Member[]>([]);
  const [preachers, setPreachers] = useState<Member[]>([]);
  const [ministersLoaded, setMinistersLoaded] = useState(false);
  const [preachersLoaded, setPreachersLoaded] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMinisters, setSelectedMinisters] = useState<Member[]>([]);
  const [selectedPreacher, setSelectedPreacher] = useState<Member | null>(null);
  const [openSearchPopover, setOpenSearchPopover] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const worshipForm = useForm<z.infer<typeof worshipScheduleSchema>>({
    resolver: zodResolver(worshipScheduleSchema),
    defaultValues: {
      ministerIds: [],
      category: "",
      church: "",
      notes: "",
    },
  });

  const preachingForm = useForm<z.infer<typeof preachingScheduleSchema>>({
    resolver: zodResolver(preachingScheduleSchema),
    defaultValues: {
      preacherId: "",
      category: "",
      church: "",
      notes: "",
    },
  });

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Load ministers and songs initially (Louvor is the default tab)
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingMembers(true);
      setIsLoadingSongs(true);

      try {
        const [ministersData, songsData] = await Promise.all([
          membersService.getAll({ churchRoles: ["Ministro de Louvor", "Músico", "Mídia Digital", "Líder"] }),
          songsService.getAll(),
        ]);
        setMinisters(ministersData);
        setMinistersLoaded(true);
        setSongs(songsData);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao carregar dados";
        toast({
          title: "Erro",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsLoadingMembers(false);
        setIsLoadingSongs(false);
      }
    };

    loadData();
  }, [toast]);

  // Load preachers when switching to Pregação tab (only once)
  useEffect(() => {
    const loadPreachers = async () => {
      if (scheduleType === "Pregação" && !preachersLoaded) {
        setIsLoadingMembers(true);
        try {
          const preachersData = await membersService.getAll({
            churchRoles: ["Líder", "Diácono", "Pastor(a)", "Presbítero"]
          });
          setPreachers(preachersData);
          setPreachersLoaded(true);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erro ao carregar pregadores";
          toast({
            title: "Erro",
            description: message,
            variant: "destructive",
          });
        } finally {
          setIsLoadingMembers(false);
        }
      }
    };

    loadPreachers();
  }, [scheduleType, preachersLoaded, toast]);

  // Load existing schedule if editing
  useEffect(() => {
    if (id) {
      const loadSchedule = async () => {
        try {
          const schedule = await schedulesService.getById(id);
          setScheduleType(schedule.type);

          if (schedule.type === "Louvor") {
            worshipForm.reset({
              date: parseCivilDate(schedule.date) ?? undefined,
              ministerIds: schedule.ministers.map(m => m.id),
              category: schedule.category,
              church: schedule.church,
              notes: schedule.notes || "",
            });
            setSelectedSongs(schedule.songs.map(s => s.id));
            setSelectedMinisters(schedule.ministers as Member[]);
          } else {
            preachingForm.reset({
              date: parseCivilDate(schedule.date) ?? undefined,
              preacherId: schedule.preacher.id.toString(),
              category: schedule.category,
              church: schedule.church,
              notes: schedule.notes || "",
            });
            setSelectedPreacher(schedule.preacher);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erro ao carregar escala";
          toast({
            title: "Erro",
            description: message,
            variant: "destructive",
          });
          navigate("/schedules");
        }
      };

      loadSchedule();
    }
  }, [id]);

  // Combine ministers list with selected ministers to ensure they're always available
  const availableMinisters = useMemo(() => {
    const ministersList = [...ministers];
    selectedMinisters.forEach(sm => {
      if (!ministersList.find(m => m.id === sm.id)) {
        ministersList.unshift(sm);
      }
    });
    return ministersList;
  }, [ministers, selectedMinisters]);

  // Combine preachers list with selected preacher to ensure it's always available
  const availablePreachers = useMemo(() => {
    const preachersList = [...preachers];
    if (selectedPreacher && !preachersList.find(p => p.id === selectedPreacher.id)) {
      preachersList.unshift(selectedPreacher);
    }
    return preachersList;
  }, [preachers, selectedPreacher]);

  const filteredSongs = songs.filter((song) => {
    if (!searchTerm) return false;
    const term = searchTerm.toLowerCase();
    return (
      song.title.toLowerCase().includes(term) ||
      song.singer?.toLowerCase().includes(term) ||
      song.key.toLowerCase().includes(term) ||
      song.ministers.some((m) => m.name.toLowerCase().includes(term))
    );
  });

  const toggleSongSelection = (songId: number) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  const moveSong = (index: number, direction: "up" | "down") => {
    setSelectedSongs((prev) => {
      const newList = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newList.length) return prev;
      [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
      return newList;
    });
  };

  const searchMemberByName = async (searchTerm?: string) => {
    const term = searchTerm || memberSearchTerm;
    if (!term.trim() || term.trim().length < 3) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await membersService.getAll({ search: term.trim() });
      setSearchResults(results);
      setHasSearched(true);
      setOpenSearchPopover(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar membro";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
      setHasSearched(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setMemberSearchTerm(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Search automatically after 800ms if more than 3 characters
    if (value.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchMemberByName(value);
      }, 800);
    } else {
      setSearchResults([]);
      setOpenSearchPopover(false);
      setHasSearched(false);
    }
  };

  const selectMemberFromSearch = (member: Member) => {
    if (scheduleType === "Louvor") {
      const currentIds = worshipForm.getValues("ministerIds");
      if (!currentIds.includes(member.id)) {
        worshipForm.setValue("ministerIds", [...currentIds, member.id], { shouldValidate: true });
        setSelectedMinisters(prev => [...prev, member]);
      }
    } else {
      preachingForm.setValue("preacherId", member.id.toString());
      setSelectedPreacher(member);
    }
    setMemberSearchTerm("");
    setSearchResults([]);
    setOpenSearchPopover(false);
    setHasSearched(false);
  };

  const onSubmitWorship = async (data: z.infer<typeof worshipScheduleSchema>) => {
    if (selectedSongs.length === 0) {
      toast({
        title: "Selecione os louvores",
        description: "Escolha pelo menos um louvor para a escala.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type: "Louvor" as ScheduleType,
        date: data.date.toISOString(),
        church: data.church,
        category: data.category,
        ministerIds: data.ministerIds,
        songIds: selectedSongs,
        notes: data.notes,
      };

      if (isEditing) {
        await schedulesService.update(id!, payload);
        toast({
          title: "Escala atualizada!",
          description: "A escala de louvor foi atualizada com sucesso.",
        });
      } else {
        await schedulesService.create(payload);
        toast({
          title: "Escala criada!",
          description: "A escala de louvor foi salva com sucesso.",
        });
      }

      navigate("/schedules", { state: { refresh: true } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar escala";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPreaching = async (data: z.infer<typeof preachingScheduleSchema>) => {
    setIsSubmitting(true);

    try {
      const payload = {
        type: "Pregação" as ScheduleType,
        date: data.date.toISOString(),
        church: data.church,
        category: data.category,
        preacherId: parseInt(data.preacherId),
        notes: data.notes,
      };

      if (isEditing) {
        await schedulesService.update(id!, payload);
        toast({
          title: "Escala atualizada!",
          description: "A escala de pregação foi atualizada com sucesso.",
        });
      } else {
        await schedulesService.create(payload);
        toast({
          title: "Escala criada!",
          description: "A escala de pregação foi salva com sucesso.",
        });
      }

      navigate("/schedules", { state: { refresh: true } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar escala";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SongCard = ({ song, isSelected }: { song: Song; isSelected: boolean }) => (
    <div
      className={cn(
        "relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
        isSelected && "border-primary bg-primary/5 ring-2 ring-primary"
      )}
      onClick={() => toggleSongSelection(song.id)}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleSongSelection(song.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{song.title}</h4>
            <Badge variant="secondary" className="shrink-0">
              {song.key}
            </Badge>
          </div>
          {song.singer && (
            <p className="text-sm text-muted-foreground mt-1">
              Cantor: {song.singer}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {song.ministers.map((minister) => (
              <Badge key={minister.id} variant="outline" className="text-xs">
                {minister.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2">
          <Check className="h-5 w-5 text-primary" />
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/schedules")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? "Editar Escala" : "Nova Escala"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? "Atualize as informações da escala"
                : "Crie uma nova escala de louvor ou pregação"}
            </p>
          </div>
        </div>

        {/* Type Selection */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Escala</CardTitle>
              <CardDescription>
                Escolha se a escala é para louvor ou palavra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={scheduleType}
                onValueChange={(v) => setScheduleType(v as ScheduleType)}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="Louvor" className="gap-2">
                    <Music className="h-4 w-4" />
                    Louvor
                  </TabsTrigger>
                  <TabsTrigger value="Pregação" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Palavra
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Worship Form */}
        {scheduleType === "Louvor" && (
          <Form {...worshipForm}>
            <form onSubmit={worshipForm.handleSubmit(onSubmitWorship)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Escala de Louvor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date and Minister */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={worshipForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data do Culto</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: ptBR })
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={worshipForm.control}
                      name="ministerIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ministro(s)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between font-normal",
                                    field.value.length === 0 && "text-muted-foreground"
                                  )}
                                >
                                  {field.value.length === 0
                                    ? (isLoadingMembers ? "Carregando..." : "Selecione os ministros")
                                    : `${field.value.length} ministro(s) selecionado(s)`}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Buscar ministro..." />
                                <CommandList className="max-h-[200px]">
                                  <CommandEmpty>Nenhum ministro encontrado.</CommandEmpty>
                                  <CommandGroup>
                                    {availableMinisters.map((minister) => {
                                      const isSelected = field.value.includes(minister.id);
                                      return (
                                        <CommandItem
                                          key={minister.id}
                                          value={minister.name}
                                          onSelect={() => {
                                            const newIds = isSelected
                                              ? field.value.filter((id: number) => id !== minister.id)
                                              : [...field.value, minister.id];
                                            field.onChange(newIds);
                                            if (!isSelected) {
                                              setSelectedMinisters(prev =>
                                                prev.find(m => m.id === minister.id) ? prev : [...prev, minister]
                                              );
                                            }
                                          }}
                                        >
                                          <Checkbox checked={isSelected} className="mr-2" />
                                          {minister.name}
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {field.value.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {field.value.map((id: number) => {
                                const minister = availableMinisters.find(m => m.id === id) || selectedMinisters.find(m => m.id === id);
                                return minister ? (
                                  <Badge key={id} variant="secondary" className="gap-1">
                                    {minister.name}
                                    <button
                                      type="button"
                                      className="ml-1 hover:text-destructive"
                                      onClick={() => field.onChange(field.value.filter((v: number) => v !== id))}
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Search by name */}
                  <div className="relative">
                    <Popover open={openSearchPopover} onOpenChange={setOpenSearchPopover}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Não encontrou? Digite pelo menos 3 letras para buscar..."
                            value={memberSearchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10"
                          />
                          {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[--radix-popover-trigger-width] p-0"
                        align="start"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        <Command>
                          <CommandList className="max-h-[300px]">
                            {hasSearched && searchResults.length === 0 ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                Nenhum membro encontrado.
                              </div>
                            ) : (
                              <CommandGroup className="p-2">
                                {searchResults.map((member) => (
                                  <CommandItem
                                    key={member.id}
                                    value={member.name}
                                    onSelect={() => selectMemberFromSearch(member)}
                                    className="cursor-pointer rounded-md px-3 py-2 mb-1 hover:bg-accent aria-selected:bg-transparent"
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{member.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {member.churchRole || 'Sem função'} • {member.church || 'Sem igreja'}
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
                  </div>

                  {/* Category and Church */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={worshipForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria do Culto</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SCHEDULE_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={worshipForm.control}
                      name="church"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Igreja</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a igreja" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CHURCHES.map((church) => (
                                <SelectItem key={church} value={church}>
                                  {church}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Search Songs */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      Buscar Louvores
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, cantor, tonalidade ou ministro..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        disabled={isLoadingSongs}
                      />
                    </div>
                    {isLoadingSongs ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : filteredSongs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                        {filteredSongs.map((song) => (
                          <SongCard
                            key={song.id}
                            song={song}
                            isSelected={selectedSongs.includes(song.id)}
                          />
                        ))}
                      </div>
                    ) : searchTerm ? (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum louvor encontrado para "{searchTerm}"
                      </p>
                    ) : null}
                  </div>

                  {/* Selected Songs - Ordered List */}
                  {selectedSongs.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium">
                        Ordem dos Louvores ({selectedSongs.length})
                      </Label>
                      <div className="space-y-1">
                        {selectedSongs.map((songId, index) => {
                          const song = songs.find((s) => s.id === songId);
                          if (!song) return null;
                          return (
                            <div
                              key={songId}
                              className="flex items-center gap-2 p-2 rounded-lg border bg-card"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm font-medium text-muted-foreground w-6 text-center flex-shrink-0">
                                {index + 1}.
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium truncate block">{song.title}</span>
                                {song.key && (
                                  <span className="text-xs text-muted-foreground">Tom: {song.key}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-0.5 flex-shrink-0">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  disabled={index === 0}
                                  onClick={() => moveSong(index, "up")}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  disabled={index === selectedSongs.length - 1}
                                  onClick={() => moveSong(index, "down")}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => toggleSongSelection(songId)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <FormField
                    control={worshipForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Adicione observações sobre esta escala..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate("/schedules")}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>{isEditing ? "Salvar Alterações" : "Criar Escala"}</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Preaching Form */}
        {scheduleType === "Pregação" && (
          <Form {...preachingForm}>
            <form onSubmit={preachingForm.handleSubmit(onSubmitPreaching)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Escala de Palavra
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date and Preacher */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={preachingForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data do Culto</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: ptBR })
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preachingForm.control}
                      name="preacherId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pregador</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={isLoadingMembers ? "Carregando..." : "Selecione o pregador"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availablePreachers.map((preacher) => (
                                <SelectItem key={preacher.id} value={preacher.id.toString()}>
                                  {preacher.name}
                                </SelectItem>
                              ))}
                              {searchResults.length > 0 && searchResults.map((member) => (
                                <SelectItem key={`search-${member.id}`} value={member.id.toString()}>
                                  {member.name} (Busca)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Search by name */}
                  <div className="relative">
                    <Popover open={openSearchPopover} onOpenChange={setOpenSearchPopover}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Não encontrou? Digite pelo menos 3 letras para buscar..."
                            value={memberSearchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10"
                          />
                          {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[--radix-popover-trigger-width] p-0"
                        align="start"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        <Command>
                          <CommandList className="max-h-[300px]">
                            {hasSearched && searchResults.length === 0 ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                Nenhum membro encontrado.
                              </div>
                            ) : (
                              <CommandGroup className="p-2">
                                {searchResults.map((member) => (
                                  <CommandItem
                                    key={member.id}
                                    value={member.name}
                                    onSelect={() => selectMemberFromSearch(member)}
                                    className="cursor-pointer rounded-md px-3 py-2 mb-1 hover:bg-accent aria-selected:bg-transparent"
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{member.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {member.churchRole || 'Sem função'} • {member.church || 'Sem igreja'}
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
                  </div>

                  {/* Category and Church */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={preachingForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria do Culto</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SCHEDULE_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preachingForm.control}
                      name="church"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Igreja</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a igreja" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CHURCHES.map((church) => (
                                <SelectItem key={church} value={church}>
                                  {church}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Notes */}
                  <FormField
                    control={preachingForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Adicione observações adicionais (tema, versículo chave, etc)..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate("/schedules")}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>{isEditing ? "Salvar Alterações" : "Criar Escala"}</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ScheduleForm;
