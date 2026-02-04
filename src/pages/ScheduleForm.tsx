import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Music,
  BookOpen,
  Search,
  Check,
  Loader2,
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
import { ScheduleType, SCHEDULE_CATEGORIES, CHURCHES } from "@/types/schedule";
import { Song } from "@/types/worship";
import { Member } from "@/types/member";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/config/permissions";

const worshipScheduleSchema = z.object({
  date: z.date({ required_error: "Selecione a data do culto" }),
  ministerId: z.string().min(1, "Selecione o ministro"),
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
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const worshipForm = useForm<z.infer<typeof worshipScheduleSchema>>({
    resolver: zodResolver(worshipScheduleSchema),
    defaultValues: {
      ministerId: "",
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

  // Load members and songs
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingMembers(true);
      setIsLoadingSongs(true);

      try {
        const [membersData, songsData] = await Promise.all([
          membersService.getAll(),
          songsService.getAll(),
        ]);
        setMembers(membersData);
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
  }, []);

  // Load existing schedule if editing
  useEffect(() => {
    if (id) {
      const loadSchedule = async () => {
        try {
          const schedule = await schedulesService.getById(id);
          setScheduleType(schedule.type);

          if (schedule.type === "Louvor") {
            worshipForm.reset({
              date: new Date(schedule.date),
              ministerId: schedule.minister.id.toString(),
              category: schedule.category,
              church: schedule.church,
              notes: schedule.notes || "",
            });
            setSelectedSongs(schedule.songs.map(s => s.id));
          } else {
            preachingForm.reset({
              date: new Date(schedule.date),
              preacherId: schedule.preacher.id.toString(),
              category: schedule.category,
              church: schedule.church,
              notes: schedule.notes || "",
            });
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
        ministerId: parseInt(data.ministerId),
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

  // Get ministers (members with role worship or leader/admin)
  const ministers = members.filter(
    (m) =>
      m.ministry === "worship" ||
      m.ministry === "leadership" ||
      m.isLeader ||
      m.isAdmin
  );

  // Get preachers (members with role preaching or leader/admin)
  const preachers = members.filter(
    (m) =>
      m.ministry === "preaching" ||
      m.ministry === "leadership" ||
      m.isLeader ||
      m.isAdmin
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
                Escolha se a escala é para louvor ou pregação
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
                    Pregação
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
                      name="ministerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ministro</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={isLoadingMembers ? "Carregando..." : "Selecione o ministro"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ministers.map((minister) => (
                                <SelectItem key={minister.id} value={minister.id.toString()}>
                                  {minister.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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

                  {/* Selected Songs */}
                  {selectedSongs.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        Louvores Selecionados ({selectedSongs.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedSongs.map((songId) => {
                          const song = songs.find((s) => s.id === songId);
                          if (!song) return null;
                          return (
                            <Badge
                              key={songId}
                              variant="default"
                              className="gap-2 pr-1 cursor-pointer"
                              onClick={() => toggleSongSelection(songId)}
                            >
                              {song.title}
                              <span className="text-primary-foreground/70">×</span>
                            </Badge>
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
                    Escala de Pregação
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
                              {preachers.map((preacher) => (
                                <SelectItem key={preacher.id} value={preacher.id.toString()}>
                                  {preacher.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
