import { useState, useEffect, useMemo } from "react";
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
  RefreshCw,
  Check,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { mockSchedules } from "@/data/mockSchedules";
import { mockWorships } from "@/data/mockWorships";
import { ScheduleType, WORSHIP_CATEGORIES, CHURCHES, WorshipCategory, Church } from "@/types/schedule";
import { Worship } from "@/types/worship";
import { cn } from "@/lib/utils";

const worshipScheduleSchema = z.object({
  date: z.date({ required_error: "Selecione a data do culto" }),
  minister: z.string().min(1, "Selecione o ministro"),
  category: z.string().min(1, "Selecione a categoria do culto"),
  church: z.string().min(1, "Selecione a igreja"),
  notes: z.string().optional(),
});

const preachingScheduleSchema = z.object({
  date: z.date({ required_error: "Selecione a data do culto" }),
  preacher: z.string().min(1, "Informe o pregador"),
  theme: z.string().min(1, "Informe o tema da pregação"),
  keyVerse: z.string().min(1, "Informe o versículo chave"),
  outline: z.string().optional(),
  category: z.string().min(1, "Selecione a categoria do culto"),
  church: z.string().min(1, "Selecione a igreja"),
  notes: z.string().optional(),
});

const ScheduleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [scheduleType, setScheduleType] = useState<ScheduleType>("worship");
  const [selectedWorships, setSelectedWorships] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Worship[]>([]);

  // Get unique ministers from worships
  const ministers = useMemo(() => {
    const allMinisters = mockWorships.flatMap((w) => w.ministers);
    return [...new Set(allMinisters)].sort();
  }, []);

  const worshipForm = useForm<z.infer<typeof worshipScheduleSchema>>({
    resolver: zodResolver(worshipScheduleSchema),
    defaultValues: {
      minister: "",
      category: "",
      church: "",
      notes: "",
    },
  });

  const preachingForm = useForm<z.infer<typeof preachingScheduleSchema>>({
    resolver: zodResolver(preachingScheduleSchema),
    defaultValues: {
      preacher: "",
      theme: "",
      keyVerse: "",
      outline: "",
      category: "",
      church: "",
      notes: "",
    },
  });

  const selectedMinister = worshipForm.watch("minister");

  // Load existing schedule if editing
  useEffect(() => {
    if (id) {
      const schedule = mockSchedules.find((s) => s.id === id);
      if (schedule) {
        setScheduleType(schedule.type);
        if (schedule.type === "worship") {
          worshipForm.reset({
            date: schedule.date,
            minister: schedule.minister,
            category: schedule.category,
            church: schedule.church,
            notes: schedule.notes || "",
          });
          setSelectedWorships(schedule.selectedWorships);
        } else {
          preachingForm.reset({
            date: schedule.date,
            preacher: schedule.preacher,
            theme: schedule.theme,
            keyVerse: schedule.keyVerse,
            outline: schedule.outline,
            category: schedule.category,
            church: schedule.church,
            notes: schedule.notes || "",
          });
        }
      }
    }
  }, [id, worshipForm, preachingForm]);

  // Generate random suggestions based on selected minister
  const generateSuggestions = () => {
    if (!selectedMinister) {
      toast({
        title: "Selecione um ministro",
        description: "Escolha um ministro para ver sugestões de louvores.",
        variant: "destructive",
      });
      return;
    }

    // Filter worships by minister
    const ministerWorships = mockWorships.filter((w) =>
      w.ministers.includes(selectedMinister)
    );

    // If less than 4, add random from all worships
    let available = [...ministerWorships];
    if (available.length < 4) {
      const others = mockWorships.filter(
        (w) => !w.ministers.includes(selectedMinister)
      );
      const shuffled = others.sort(() => Math.random() - 0.5);
      available = [...available, ...shuffled.slice(0, 4 - available.length)];
    }

    // Get random 4
    const shuffled = available.sort(() => Math.random() - 0.5);
    setSuggestions(shuffled.slice(0, 4));
  };

  // Auto-generate suggestions when minister changes
  useEffect(() => {
    if (selectedMinister) {
      generateSuggestions();
    }
  }, [selectedMinister]);

  // Filter worships for search
  const filteredWorships = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return mockWorships.filter(
      (w) =>
        w.title.toLowerCase().includes(term) ||
        w.tags?.some((t) => t.toLowerCase().includes(term)) ||
        w.ministers.some((m) => m.toLowerCase().includes(term)) ||
        w.key.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const toggleWorshipSelection = (worshipId: string) => {
    setSelectedWorships((prev) =>
      prev.includes(worshipId)
        ? prev.filter((id) => id !== worshipId)
        : [...prev, worshipId]
    );
  };

  const onSubmitWorship = (data: z.infer<typeof worshipScheduleSchema>) => {
    if (selectedWorships.length === 0) {
      toast({
        title: "Selecione os louvores",
        description: "Escolha pelo menos um louvor para a escala.",
        variant: "destructive",
      });
      return;
    }

    console.log("Worship schedule:", { ...data, selectedWorships });
    toast({
      title: isEditing ? "Escala atualizada!" : "Escala criada!",
      description: `A escala de louvor foi ${isEditing ? "atualizada" : "salva"} com sucesso.`,
    });
    navigate("/schedules");
  };

  const onSubmitPreaching = (data: z.infer<typeof preachingScheduleSchema>) => {
    console.log("Preaching schedule:", data);
    toast({
      title: isEditing ? "Escala atualizada!" : "Escala criada!",
      description: `A escala de pregação foi ${isEditing ? "atualizada" : "salva"} com sucesso.`,
    });
    navigate("/schedules");
  };

  const WorshipCard = ({ worship, isSelected }: { worship: Worship; isSelected: boolean }) => (
    <div
      className={cn(
        "relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
        isSelected && "border-primary bg-primary/5 ring-2 ring-primary"
      )}
      onClick={() => toggleWorshipSelection(worship.id)}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleWorshipSelection(worship.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{worship.title}</h4>
            <Badge variant="secondary" className="shrink-0">
              {worship.key}
            </Badge>
          </div>
          {worship.singer && (
            <p className="text-sm text-muted-foreground mt-1">
              Cantor: {worship.singer}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {worship.ministers.map((minister, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {minister}
              </Badge>
            ))}
          </div>
          {worship.tags && worship.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {worship.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
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
      <div className="p-6 space-y-6">
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
                  <TabsTrigger value="worship" className="gap-2">
                    <Music className="h-4 w-4" />
                    Louvor
                  </TabsTrigger>
                  <TabsTrigger value="preaching" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Pregação
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Worship Form */}
        {scheduleType === "worship" && (
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
                        <FormItem className="flex flex-col">
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
                      name="minister"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ministro</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o ministro" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ministers.map((minister) => (
                                <SelectItem key={minister} value={minister}>
                                  {minister}
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
                              {WORSHIP_CATEGORIES.map((category) => (
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

                  {/* Suggestions */}
                  {selectedMinister && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">
                          Sugestões de Louvores
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateSuggestions}
                          className="gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Novas Sugestões
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestions.map((worship) => (
                          <WorshipCard
                            key={worship.id}
                            worship={worship}
                            isSelected={selectedWorships.includes(worship.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      Buscar Louvores
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, tema ou palavra-chave..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {filteredWorships.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                        {filteredWorships.map((worship) => (
                          <WorshipCard
                            key={worship.id}
                            worship={worship}
                            isSelected={selectedWorships.includes(worship.id)}
                          />
                        ))}
                      </div>
                    )}
                    {searchTerm && filteredWorships.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum louvor encontrado para "{searchTerm}"
                      </p>
                    )}
                  </div>

                  {/* Selected Worships */}
                  {selectedWorships.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        Louvores Selecionados ({selectedWorships.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedWorships.map((worshipId) => {
                          const worship = mockWorships.find((w) => w.id === worshipId);
                          if (!worship) return null;
                          return (
                            <Badge
                              key={worshipId}
                              variant="default"
                              className="gap-2 pr-1 cursor-pointer"
                              onClick={() => toggleWorshipSelection(worshipId)}
                            >
                              {worship.title}
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
                <Button type="submit">
                  {isEditing ? "Salvar Alterações" : "Criar Escala"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Preaching Form */}
        {scheduleType === "preaching" && (
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
                        <FormItem className="flex flex-col">
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
                      name="preacher"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pregador</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do pregador" {...field} />
                          </FormControl>
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
                              {WORSHIP_CATEGORIES.map((category) => (
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

                  {/* Theme */}
                  <FormField
                    control={preachingForm.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tema da Pregação</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: A Fé que Move Montanhas"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Key Verse */}
                  <FormField
                    control={preachingForm.control}
                    name="keyVerse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Versículo Chave</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: João 3:16 - Porque Deus amou o mundo de tal maneira..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Outline */}
                  <FormField
                    control={preachingForm.control}
                    name="outline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Esboço da Pregação</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Escreva aqui o esboço da sua pregação..."
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Use a barra de ferramentas para formatar seu esboço com títulos, listas e citações
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={preachingForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Adicione observações adicionais..."
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
                <Button type="submit">
                  {isEditing ? "Salvar Alterações" : "Criar Escala"}
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
