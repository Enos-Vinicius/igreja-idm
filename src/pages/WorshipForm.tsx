import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, X, Upload, FileText, Loader2, Check, ChevronsUpDown, Play, ExternalLink, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { songsService } from "@/services/songs";
import { MUSICAL_KEYS, SongMinister } from "@/types/worship";
import { cn } from "@/lib/utils";
import { environment } from "@/config/environment";

const worshipSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(100, "Título muito longo"),
  youtubeUrl: z
    .string()
    .min(1, "Link do YouTube é obrigatório")
    .url("Link inválido")
    .refine(
      (url) => url.includes("youtube.com") || url.includes("youtu.be"),
      "Deve ser um link do YouTube"
    ),
  key: z.string().min(1, "Tonalidade é obrigatória"),
  singer: z.string().max(100, "Nome do cantor muito longo").optional(),
  notes: z.string().max(500, "Observações muito longas").optional(),
});

type WorshipFormData = z.infer<typeof worshipSchema>;

interface YouTubeVideoInfo {
  title: string;
  author_name: string;
  thumbnail_url: string;
  videoId: string;
}

interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

// Check if string is a YouTube URL
const isYouTubeUrl = (str: string): boolean => {
  return str.includes('youtube.com') || str.includes('youtu.be');
};

// Extrair video ID de várias formas de URL do YouTube
const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Limpar título do YouTube para extrair apenas o nome da música
const cleanYouTubeTitle = (title: string, channelName?: string): string => {
  let cleaned = title;

  // Remove sufixos comuns de vídeos do YouTube
  const suffixPatterns = [
    /\s*[\(\[](official\s*)?(music\s*)?(video|lyric|lyrics|audio|clipe|clip|visualizer)[\)\]]/gi,
    /\s*[\(\[](ao\s*vivo|live|acústico|acoustic|cover)[\)\]]/gi,
    /\s*[\(\[](oficial|official)[\)\]]/gi,
    /\s*[\(\[]\d{4}[\)\]]/gi, // Ano entre parênteses
    /\s*[\(\[]?(clipe\s*)?(oficial|official)[\)\]]?/gi,
    /\s*[\(\[]?(video\s*)?(oficial|official)[\)\]]?/gi,
    /\s*[\(\[]?(áudio\s*)?(oficial|official)[\)\]]?/gi,
    /\s*[\(\[](hd|4k|full\s*hd)[\)\]]/gi,
    /\s*#\w+/g, // Hashtags
    /\s*\|\s*[\w\s]+$/gi, // " | Canal" no final
  ];

  for (const pattern of suffixPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Tenta extrair o nome da música se houver separador
  const separators = [' - ', ' | ', ' — ', ' – ', ' // '];
  for (const sep of separators) {
    if (cleaned.includes(sep)) {
      const parts = cleaned.split(sep).map(p => p.trim());
      if (parts.length >= 2) {
        // Se o nome do canal bate com uma das partes, retorna a outra
        if (channelName) {
          const channelLower = channelName.toLowerCase().trim();

          // Verifica se a primeira parte é o artista (canal)
          if (parts[0].toLowerCase().includes(channelLower) ||
              channelLower.includes(parts[0].toLowerCase())) {
            return parts.slice(1).join(sep).trim();
          }

          // Verifica se a última parte é o artista (canal)
          const lastPart = parts[parts.length - 1];
          if (lastPart.toLowerCase().includes(channelLower) ||
              channelLower.includes(lastPart.toLowerCase())) {
            return parts.slice(0, -1).join(sep).trim();
          }
        }

        // Formato mais comum: "Artista - Música"
        // Retorna a segunda parte como título
        return parts.slice(1).join(sep).trim();
      }
    }
  }

  return cleaned.trim();
};

// Extrair primeiro e último nome
const getShortName = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) {
    return fullName;
  }
  return `${parts[0]} ${parts[parts.length - 1]}`;
};

// Gerar nomes curtos com detecção de colisão
const getMinisterDisplayNames = (ministers: SongMinister[]): Map<string, string> => {
  const displayNames = new Map<string, string>();
  const shortNameCounts = new Map<string, SongMinister[]>();

  // Agrupa ministros pelo mesmo nome curto
  ministers.forEach(minister => {
    const shortName = getShortName(minister.name);
    const existing = shortNameCounts.get(shortName) || [];
    existing.push(minister);
    shortNameCounts.set(shortName, existing);
  });

  // Para cada ministro, determina o nome a ser exibido
  ministers.forEach(minister => {
    const shortName = getShortName(minister.name);
    const ministersWithSameName = shortNameCounts.get(shortName) || [];

    if (ministersWithSameName.length === 1) {
      // Sem colisão, usa o nome curto
      displayNames.set(minister.id, shortName);
    } else {
      // Colisão detectada, adiciona mais do nome
      const parts = minister.name.trim().split(/\s+/);
      if (parts.length > 2) {
        // Adiciona o segundo nome para diferenciar
        displayNames.set(minister.id, `${parts[0]} ${parts[1]} ${parts[parts.length - 1]}`);
      } else {
        // Só tem 2 partes, usa o nome completo
        displayNames.set(minister.id, minister.name);
      }
    }
  });

  return displayNames;
};

const WorshipForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [availableMinisters, setAvailableMinisters] = useState<SongMinister[]>([]);
  const [selectedMinisterIds, setSelectedMinisterIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // YouTube preview state
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  // YouTube search state
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Nomes curtos dos ministros com detecção de colisão
  const ministerDisplayNames = useMemo(() => {
    return getMinisterDisplayNames(availableMinisters);
  }, [availableMinisters]);

  const form = useForm<WorshipFormData>({
    resolver: zodResolver(worshipSchema),
    defaultValues: {
      title: "",
      youtubeUrl: "",
      key: "",
      singer: "",
      notes: "",
    },
  });

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  // Watch YouTube URL and fetch video info with debounce
  const youtubeUrl = form.watch("youtubeUrl");

  const fetchVideoInfo = useCallback(async (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      setVideoInfo(null);
      setShowPlayer(false);
      return;
    }

    setIsLoadingVideo(true);
    try {
      // Use YouTube oEmbed API (no API key required)
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );

      if (!response.ok) {
        throw new Error("Vídeo não encontrado");
      }

      const data = await response.json();
      setVideoInfo({
        title: data.title,
        author_name: data.author_name,
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        videoId,
      });

      // Auto-fill title and singer if empty (only when not editing)
      if (!isEditing) {
        if (!form.getValues('title')) {
          const cleanedTitle = cleanYouTubeTitle(data.title, data.author_name);
          form.setValue('title', cleanedTitle);
        }
        if (!form.getValues('singer')) {
          form.setValue('singer', data.author_name);
        }
      }
    } catch {
      setVideoInfo(null);
    } finally {
      setIsLoadingVideo(false);
    }
  }, [form, isEditing]);

  useEffect(() => {
    if (!youtubeUrl) {
      setVideoInfo(null);
      setShowPlayer(false);
      return;
    }

    // Only fetch video info if it's a URL
    if (isYouTubeUrl(youtubeUrl)) {
      setShowSearchResults(false);
      const timeoutId = setTimeout(() => {
        fetchVideoInfo(youtubeUrl);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [youtubeUrl, fetchVideoInfo]);

  // Search YouTube when query changes
  const searchYouTube = useCallback(async (query: string) => {
    if (!query || query.length < 3 || !environment.youtubeApiKey) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${environment.youtubeApiKey}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar vídeos');
      }

      const data = await response.json();
      const results: YouTubeSearchResult[] = data.items.map((item: { id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails: { default: { url: string } } } }) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.default.url,
      }));

      setSearchResults(results);
      setShowSearchResults(true);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery || isYouTubeUrl(searchQuery)) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchYouTube(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchYouTube]);

  // Handle selecting a search result
  const handleSelectSearchResult = (result: YouTubeSearchResult) => {
    const url = `https://www.youtube.com/watch?v=${result.videoId}`;
    form.setValue('youtubeUrl', url);
    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);

    // Always update title and singer when selecting a new video from search
    // User is explicitly choosing a new song, so we should update the fields
    const cleanedTitle = cleanYouTubeTitle(result.title, result.channelTitle);
    form.setValue('title', cleanedTitle);
    form.setValue('singer', result.channelTitle);
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Carregar ministros disponíveis
      const ministers = await songsService.getMinisters();
      setAvailableMinisters(ministers);

      // Se editando, carregar dados da música
      if (isEditing && id) {
        const song = await songsService.getById(id);
        form.reset({
          title: song.title,
          youtubeUrl: song.youtubeUrl,
          key: song.key,
          singer: song.singer || "",
          notes: song.notes || "",
        });
        setSelectedMinisterIds(song.ministers.map((m) => m.id));
        setTags(song.tags || []);
        if (song.sheetMusicUrl) {
          setExistingFileUrl(song.sheetMusicUrl);
        }
      } else {
        // Se não está editando, pré-seleciona o ministro do usuário logado (se for ministro)
        if (user?.member) {
          const userMinister = ministers.find(
            (m) => m.id === String(user.member!.id) || m.name === user.member!.name
          );
          if (userMinister) {
            setSelectedMinisterIds([userMinister.id]);
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar dados";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMinister = (ministerId: string) => {
    setSelectedMinisterIds((prev) =>
      prev.includes(ministerId)
        ? prev.filter((id) => id !== ministerId)
        : [...prev, ministerId]
    );
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Arquivo inválido",
          description: "Apenas arquivos PDF ou DOC/DOCX são permitidos.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setExistingFileUrl(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setExistingFileUrl(null);
  };

  const onSubmit = async (data: WorshipFormData) => {
    if (selectedMinisterIds.length === 0) {
      toast({
        title: "Ministro obrigatório",
        description: "Selecione pelo menos um ministro.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const songInput = {
        title: data.title,
        youtubeUrl: data.youtubeUrl,
        key: data.key,
        singer: data.singer,
        tags,
        notes: data.notes,
        ministerIds: selectedMinisterIds,
      };

      if (isEditing && id) {
        await songsService.update(id, songInput, selectedFile || undefined);
        toast({
          title: "Louvor atualizado",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        await songsService.create(songInput, selectedFile || undefined);
        toast({
          title: "Louvor cadastrado",
          description: "O louvor foi adicionado ao repertório.",
        });
      }

      // Navega de volta com flag de refresh para recarregar os dados
      navigate("/repertoire", { state: { refresh: true } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar louvor";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/repertoire")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? "Editar Louvor" : "Novo Louvor"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? "Atualize as informações do louvor"
                : "Adicione um novo louvor ao repertório"}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Louvor</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* YouTube Section: Inputs left, Preview right */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Column: YouTube Link, Title, Singer */}
                  <div className="flex-1 space-y-4">
                    {/* YouTube Link Field */}
                    <FormField
                      control={form.control}
                      name="youtubeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link do YouTube *</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  ref={searchInputRef}
                                  placeholder={environment.youtubeApiKey ? "Busque pelo nome da música ou cole um link do YouTube" : "Cole o link do YouTube"}
                                  className="pl-10"
                                  value={searchQuery || field.value}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (isYouTubeUrl(value)) {
                                      field.onChange(value);
                                      setSearchQuery("");
                                    } else {
                                      setSearchQuery(value);
                                      if (!value) {
                                        field.onChange("");
                                      }
                                    }
                                  }}
                                  onFocus={() => {
                                    if (searchResults.length > 0) {
                                      setShowSearchResults(true);
                                    }
                                  }}
                                />
                                {isSearching && (
                                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                              </div>
                            </FormControl>

                            {/* Search Results Dropdown */}
                            {showSearchResults && searchResults.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-[300px] overflow-auto">
                                {searchResults.map((result) => (
                                  <button
                                    key={result.videoId}
                                    type="button"
                                    className="w-full flex items-start gap-3 p-3 hover:bg-muted transition-colors text-left border-b last:border-b-0"
                                    onClick={() => handleSelectSearchResult(result)}
                                  >
                                    <img
                                      src={result.thumbnail}
                                      alt={result.title}
                                      className="w-24 h-16 object-cover rounded flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium line-clamp-2">
                                        {result.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {result.channelTitle}
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* No API key message */}
                            {!environment.youtubeApiKey && searchQuery && !isYouTubeUrl(searchQuery) && (
                              <p className="text-xs text-amber-600 mt-1">
                                Busca não disponível. Cole diretamente o link do YouTube.
                              </p>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Title Field */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do louvor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Singer and Key Fields - Side by side on desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="singer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantor</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Fernandinho" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="key"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tonalidade *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between pr-4",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value || "Selecione a tonalidade"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[200px] p-0">
                                <Command>
                                  <CommandInput placeholder="Buscar tonalidade..." />
                                  <CommandList>
                                    <CommandEmpty>Tonalidade não encontrada.</CommandEmpty>
                                    <CommandGroup>
                                      {MUSICAL_KEYS.map((key) => (
                                        <CommandItem
                                          key={key}
                                          value={key}
                                          onSelect={() => {
                                            field.onChange(key);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === key ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {key}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Right Column: YouTube Video Preview */}
                  <div className="w-full md:w-[320px] md:flex-shrink-0 flex flex-col justify-center">
                    <p className="text-sm font-medium mb-2">Pré-visualização</p>

                    {/* Loading State */}
                    {isLoadingVideo && (
                      <div className="flex items-center justify-center aspect-video bg-muted rounded-lg border-2 border-dashed">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">
                            Carregando vídeo...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Placeholder when no video */}
                    {!videoInfo && !isLoadingVideo && (
                      <div className="flex items-center justify-center aspect-video bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Play className="h-6 w-6 ml-1" />
                          </div>
                          <span className="text-sm text-center px-4">
                            O vídeo aparecerá aqui após inserir o link
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Video Preview */}
                    {videoInfo && !isLoadingVideo && (
                      <div className="border rounded-lg overflow-hidden bg-card">
                        {showPlayer ? (
                          <div className="aspect-video">
                            <iframe
                              width="100%"
                              height="100%"
                              src={`https://www.youtube.com/embed/${videoInfo.videoId}?autoplay=0`}
                              title={videoInfo.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="border-0"
                            />
                          </div>
                        ) : (
                          <div
                            className="relative cursor-pointer group"
                            onClick={() => setShowPlayer(true)}
                          >
                            <img
                              src={videoInfo.thumbnail_url}
                              alt={videoInfo.title}
                              className="w-full aspect-video object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-red-600 rounded-full p-3">
                                <Play className="h-6 w-6 text-white fill-white" />
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <p className="text-white font-medium text-sm line-clamp-1">
                                {videoInfo.title}
                              </p>
                              <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
                                <ExternalLink className="h-3 w-3" />
                                {videoInfo.author_name}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Auto-fill note */}
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Título e cantor são preenchidos automaticamente. Verifique e ajuste se necessário.
                    </p>
                  </div>
                </div>

                {/* Ministers and Tags - Side by side on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ministers Selection */}
                  <div className="space-y-3">
                    <FormLabel>Ministro(s) Principal(s)*</FormLabel>
                    {isLoading ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Carregando ministros...</span>
                      </div>
                    ) : availableMinisters.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum ministro de louvor cadastrado.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {availableMinisters.map((minister) => (
                          <label
                            key={minister.id}
                            htmlFor={`minister-${minister.id}`}
                            className="flex items-center space-x-2 px-3 py-2 border rounded-lg hover:bg-muted/50 cursor-pointer whitespace-nowrap"
                          >
                            <Checkbox
                              id={`minister-${minister.id}`}
                              checked={selectedMinisterIds.includes(minister.id)}
                              onCheckedChange={() => toggleMinister(minister.id)}
                            />
                            <span className="text-sm font-medium leading-none">
                              {ministerDisplayNames.get(minister.id) || minister.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                    {selectedMinisterIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedMinisterIds.map((ministerId) => {
                          const minister = availableMinisters.find((m) => m.id === ministerId);
                          return minister ? (
                            <Badge
                              key={ministerId}
                              variant="secondary"
                              className="gap-1 pr-1"
                            >
                              {ministerDisplayNames.get(minister.id) || minister.name}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 hover:bg-transparent"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMinister(ministerId);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Tags/Themes */}
                  <div className="space-y-3">
                    <FormLabel>Temas / Palavras-chave</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: adoração, fé, gratidão"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={addTag} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="gap-1 pr-1"
                          >
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 hover:bg-transparent"
                              onClick={() => removeTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload and Notes - Side by side on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {/* File Upload */}
                  <div className="flex flex-col gap-2">
                    <FormLabel>Cifra / Partitura</FormLabel>
                    {!selectedFile && !existingFileUrl ? (
                      <div className="border-2 border-dashed rounded-lg p-4 text-center flex-1 flex flex-col items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Clique para selecionar
                        </p>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          id="file-upload"
                          onChange={handleFileChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("file-upload")?.click()
                          }
                        >
                          Selecionar Arquivo
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          PDF ou DOC/DOCX até 5MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg flex-1">
                        <FileText className="h-8 w-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          {selectedFile ? (
                            <>
                              <p className="text-sm font-medium truncate">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium">Cifra anexada</p>
                              <a
                                href={existingFileUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                Visualizar arquivo
                              </a>
                            </>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={removeFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Observações</FormLabel>
                        <FormControl className="flex-1">
                          <Textarea
                            placeholder="Anotações sobre o louvor, versões alternativas, etc."
                            className="min-h-[100px] h-full resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/repertoire")}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : isEditing ? (
                      "Salvar Alterações"
                    ) : (
                      "Cadastrar Louvor"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WorshipForm;
