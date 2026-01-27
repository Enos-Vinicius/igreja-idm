import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, X, Upload, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { mockWorships } from "@/data/mockWorships";
import { MUSICAL_KEYS } from "@/types/worship";

const worshipSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(100, "Título muito longo"),
  youtubeLink: z
    .string()
    .min(1, "Link do YouTube é obrigatório")
    .url("Link inválido")
    .refine(
      (url) => url.includes("youtube.com") || url.includes("youtu.be"),
      "Deve ser um link do YouTube"
    ),
  key: z.string().min(1, "Tonalidade é obrigatória"),
  bpm: z.coerce.number().min(20).max(300).optional().or(z.literal("")),
  notes: z.string().max(500, "Observações muito longas").optional(),
});

type WorshipFormData = z.infer<typeof worshipSchema>;

const WorshipForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [ministers, setMinisters] = useState<string[]>([]);
  const [newMinister, setNewMinister] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState<string | null>(null);

  const form = useForm<WorshipFormData>({
    resolver: zodResolver(worshipSchema),
    defaultValues: {
      title: "",
      youtubeLink: "",
      key: "",
      bpm: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      const worship = mockWorships.find((w) => w.id === id);
      if (worship) {
        form.reset({
          title: worship.title,
          youtubeLink: worship.youtubeLink,
          key: worship.key,
          bpm: worship.bpm || "",
          notes: worship.notes || "",
        });
        setMinisters(worship.ministers);
        if (worship.fileName) {
          setExistingFileName(worship.fileName);
        }
      }
    }
  }, [id, isEditing, form]);

  const addMinister = () => {
    if (newMinister.trim() && !ministers.includes(newMinister.trim())) {
      setMinisters([...ministers, newMinister.trim()]);
      setNewMinister("");
    }
  };

  const removeMinister = (minister: string) => {
    setMinisters(ministers.filter((m) => m !== minister));
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
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setExistingFileName(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setExistingFileName(null);
  };

  const onSubmit = (data: WorshipFormData) => {
    if (ministers.length === 0) {
      toast({
        title: "Ministro obrigatório",
        description: "Adicione pelo menos um ministro.",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement actual save logic with backend
    console.log("Form data:", {
      ...data,
      ministers,
      file: selectedFile,
    });

    toast({
      title: isEditing ? "Louvor atualizado" : "Louvor cadastrado",
      description: isEditing
        ? "As alterações foram salvas com sucesso."
        : "O louvor foi adicionado ao repertório.",
    });

    navigate("/repertoire");
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
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
                {/* Title */}
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

                {/* YouTube Link */}
                <FormField
                  control={form.control}
                  name="youtubeLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link do YouTube *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.youtube.com/watch?v=..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Cole o link do vídeo de referência
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Key and BPM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tonalidade *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a tonalidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MUSICAL_KEYS.map((key) => (
                              <SelectItem key={key} value={key}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bpm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BPM</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 72"
                            min={20}
                            max={300}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Batidas por minuto</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Ministers */}
                <div className="space-y-3">
                  <FormLabel>Ministro(s) *</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome do ministro"
                      value={newMinister}
                      onChange={(e) => setNewMinister(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMinister();
                        }
                      }}
                    />
                    <Button type="button" onClick={addMinister} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {ministers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {ministers.map((minister) => (
                        <Badge
                          key={minister}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {minister}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 hover:bg-transparent"
                            onClick={() => removeMinister(minister)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Adicione os ministros que cantam este louvor
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-3">
                  <FormLabel>Cifra / Partitura</FormLabel>
                  {!selectedFile && !existingFileName ? (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Arraste um arquivo ou clique para selecionar
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
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                      >
                        Selecionar Arquivo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        PDF ou DOC/DOCX até 10MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {selectedFile?.name || existingFileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedFile
                            ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                            : "Arquivo existente"}
                        </p>
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
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Anotações sobre o louvor, versões alternativas, etc."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/repertoire")}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {isEditing ? "Salvar Alterações" : "Cadastrar Louvor"}
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
