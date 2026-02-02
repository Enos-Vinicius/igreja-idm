import { useState, useRef, useMemo, useEffect } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Upload, User, Check, Home, Loader2, CheckCircle2, Clock, Mail, AlertTriangle, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CHURCH_LOCATIONS } from "@/types/member";
import { memberRequestsService } from "@/services/memberRequests";
import { environment } from "@/config/environment";
import logoWhite from "@/assets/logo-white.png";

// Declare grecaptcha type for TypeScript
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
const cepRegex = /^\d{5}-\d{3}$/;

const createCadastroSchema = (hasNoEmail: boolean) => z.object({
  photo: z.any().optional(),
  church: z.enum(['Uberaba', 'Conceição das Alagoas'], { required_error: "Selecione a igreja" }),
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  email: hasNoEmail
    ? z.string().optional().or(z.literal(""))
    : z.string().min(1, "Email é obrigatório").email("Email inválido").max(255, "Email muito longo"),
  birthDate: z.date({ required_error: "Data de nascimento é obrigatória" }),
  gender: z.string().min(1, "Gênero é obrigatório"),
  maritalStatus: z.string().min(1, "Estado civil é obrigatório"),
  occupation: z.string().min(1, "Profissão é obrigatória").max(100, "Profissão muito longa"),
  primaryPhone: z.string().regex(phoneRegex, "Telefone inválido. Use: (99) 99999-9999"),
  emergencyContact: z.string().refine(val => val === "" || phoneRegex.test(val), {
    message: "Telefone inválido. Use: (99) 99999-9999"
  }).optional().or(z.literal("")),
  zipCode: z.string().refine(val => val === "" || cepRegex.test(val), {
    message: "CEP inválido. Use: 99999-999"
  }).optional().or(z.literal("")),
  street: z.string().max(200, "Endereço muito longo").optional().or(z.literal("")),
  number: z.string().max(20, "Número muito longo").optional().or(z.literal("")),
  complement: z.string().max(100, "Complemento muito longo").optional().or(z.literal("")),
  neighborhood: z.string().max(100, "Bairro muito longo").optional().or(z.literal("")),
  city: z.string().max(100, "Cidade muito longa").optional().or(z.literal("")),
  state: z.string().max(50, "Estado muito longo").optional().or(z.literal("")),
  imageConsentGiven: z.boolean().default(false),
  emailConsentGiven: z.boolean().default(false),
  whatsappConsentGiven: z.boolean().default(false),
});

type CadastroFormData = z.infer<ReturnType<typeof createCadastroSchema>>;

const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : "";
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

const Cadastro = () => {
  const navigate = useNavigate();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [isDuplicateRequest, setIsDuplicateRequest] = useState(false);
  const [hasNoEmail, setHasNoEmail] = useState(false);
  const [isNoEmailDialogOpen, setIsNoEmailDialogOpen] = useState(false);
  const [churchSetByGeolocation, setChurchSetByGeolocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToFirstError = (errors: FieldErrors<CadastroFormData>) => {
    // Get the first error field name
    const firstErrorField = Object.keys(errors)[0] as keyof CadastroFormData;
    if (firstErrorField) {
      // Try multiple selectors to find the element
      const selectors = [
        `[name="${firstErrorField}"]`,
        `#${firstErrorField}`,
        `[data-field="${firstErrorField}"]`,
        // For Select components (shadcn/radix)
        `button[id="${firstErrorField}"]`,
        `[aria-labelledby*="${firstErrorField}"]`,
      ];

      let element: Element | null = null;
      for (const selector of selectors) {
        element = document.querySelector(selector);
        if (element) break;
      }

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus the element after scroll completes
        setTimeout(() => {
          if (element instanceof HTMLElement) {
            element.focus();
          }
          // For Select triggers, click to open
          if (element instanceof HTMLButtonElement && element.getAttribute('role') === 'combobox') {
            element.click();
          }
        }, 500);
      } else {
        // Fallback: find error message and scroll to its parent form item
        const errorMessage = document.querySelector(`[id="${firstErrorField}-form-item-message"]`);
        if (errorMessage) {
          const formItem = errorMessage.closest('[data-slot="form-item"]') || errorMessage.parentElement;
          formItem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const cadastroSchema = useMemo(() => createCadastroSchema(hasNoEmail), [hasNoEmail]);

  const form = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    mode: 'onBlur',
    defaultValues: {
      church: undefined,
      name: "",
      email: "",
      gender: "",
      maritalStatus: "",
      occupation: "",
      primaryPhone: "",
      emergencyContact: "",
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      imageConsentGiven: false,
      emailConsentGiven: false,
      whatsappConsentGiven: false,
    },
  });

  // Clear email field and consent when user confirms they don't have email
  useEffect(() => {
    if (hasNoEmail) {
      form.setValue("email", "");
      form.setValue("emailConsentGiven", false);
      form.clearErrors("email");
    }
  }, [hasNoEmail, form]);

  // Try to get user's location to pre-fill church field
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use Nominatim (OpenStreetMap) for reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'Accept-Language': 'pt-BR' } }
            );
            const data = await response.json();

            // Nominatim can return city in different fields depending on location
            const address = data.address || {};
            const cityName = (
              address.city ||
              address.town ||
              address.municipality ||
              address.village ||
              address.county ||
              ''
            ).toLowerCase();

            // Check if city matches one of our churches (only if not already selected)
            const currentChurch = form.getValues('church');
            if (!currentChurch) {
              if (cityName.includes('uberaba')) {
                form.setValue('church', 'Uberaba', { shouldDirty: true });
                setChurchSetByGeolocation(true);
              } else if (cityName.includes('conceição das alagoas') || cityName.includes('conceicao das alagoas')) {
                form.setValue('church', 'Conceição das Alagoas', { shouldDirty: true });
                setChurchSetByGeolocation(true);
              }
            }
          } catch {
            // Silently fail - user can select manually
          }
        },
        () => {
          // Silently fail if permission denied - user can select manually
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    }
  }, [form]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("photo", file);
    }
  };

  const handleCepChange = async (cep: string) => {
    const formattedCep = formatCEP(cep);
    form.setValue("zipCode", formattedCep);

    // Remove non-numeric characters to check length
    const numericCep = formattedCep.replace(/\D/g, "");

    // Only fetch if we have a complete CEP (8 digits)
    if (numericCep.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${numericCep}/json/`);
        const data = await response.json();

        if (data.erro) {
          toast({
            title: "CEP não encontrado",
            description: "Verifique o CEP digitado e tente novamente.",
            variant: "destructive",
          });
        } else {
          // Fill address fields with ViaCEP data
          form.setValue("street", data.logradouro || "");
          form.setValue("neighborhood", data.bairro || "");
          form.setValue("city", data.localidade || "");
          form.setValue("state", data.uf || "");

          toast({
            title: "CEP encontrado!",
            description: "Endereço preenchido automaticamente.",
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Não foi possível buscar o endereço. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const onSubmit = async (data: CadastroFormData) => {
    setIsSubmitting(true);

    try {
      // Generate reCAPTCHA token
      let recaptchaToken = '';

      try {
        if (typeof window !== 'undefined' && window.grecaptcha) {
          recaptchaToken = await new Promise<string>((resolve, reject) => {
            window.grecaptcha.ready(async () => {
              try {
                const token = await window.grecaptcha.execute(environment.recaptchaSiteKey, {
                  action: 'submit_registration'
                });
                resolve(token);
              } catch (err) {
                reject(err);
              }
            });
          });
        } else {
          throw new Error('reCAPTCHA não carregado');
        }
      } catch {
        toast({
          title: "Erro de verificação reCAPTCHA",
          description: "A chave do reCAPTCHA pode estar inválida ou o domínio não está autorizado. Verifique a configuração no Google reCAPTCHA Console.",
          variant: "destructive",
        });
        return;
      }

      // Format birthDate to ISO format (YYYY-MM-DD)
      const formattedBirthDate = data.birthDate
        ? format(new Date(data.birthDate), 'yyyy-MM-dd')
        : '';

      const submissionData = {
        name: data.name,
        email: data.email,
        birthDate: formattedBirthDate,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation,
        primaryPhone: data.primaryPhone,
        church: data.church,
        emergencyContact: data.emergencyContact,
        zipCode: data.zipCode,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        photo: data.photo,
        imageConsentGiven: data.imageConsentGiven,
        emailConsentGiven: data.emailConsentGiven,
        whatsappConsentGiven: data.whatsappConsentGiven,
        recaptchaToken,
      };

      await memberRequestsService.create(submissionData);

      // Show success feedback and scroll to top
      setIsSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('❌ Erro ao enviar solicitação:', error);

      // Get error message
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.";

      // Check if it's a duplicate email error
      const isDuplicateEmail = errorMessage.toLowerCase().includes("já existe") ||
                              errorMessage.toLowerCase().includes("duplicat") ||
                              errorMessage.toLowerCase().includes("pendente");

      // Check if it's a reCAPTCHA validation error
      const isRecaptchaError = errorMessage.toLowerCase().includes("recaptcha") ||
                              errorMessage.toLowerCase().includes("robot") ||
                              errorMessage.toLowerCase().includes("robo");

      if (isDuplicateEmail) {
        // Show friendly duplicate feedback and scroll to top
        setIsDuplicateRequest(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        if (isRecaptchaError) {
          console.error('⚠️ Erro de validação reCAPTCHA no backend');
          console.error('💡 Verifique a configuração do reCAPTCHA no backend');
        }

        toast({
          title: isRecaptchaError ? "Erro de validação reCAPTCHA" : "Erro ao enviar solicitação",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-secondary text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <img
              src={logoWhite}
              alt="Igreja do Deus de Maravilhas"
              className="w-10 h-10 object-contain cursor-pointer"
              onClick={() => navigate("/")}
            />

            {/* Title - Centered */}
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-center">
              Solicitação de Cadastro
            </h1>

            {/* Back to Home Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/10"
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Página Inicial</span>
              <span className="sm:hidden">Início</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <div className="mx-auto max-w-4xl">
        <Card>
          {!isSubmitSuccess && !isDuplicateRequest ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl font-bold text-primary">
                  Graça e Paz
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Preencha o formulário abaixo para solicitar seu cadastro na igreja
                </p>
              </CardHeader>
              <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, scrollToFirstError)} className="space-y-8">
                {/* Photo Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div 
                    className="relative w-32 h-32 rounded-full bg-muted border-2 border-dashed border-muted-foreground/50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Escolher foto
                  </Button>
                  <p className="text-xs text-muted-foreground">Opcional - Máximo 5MB</p>
                </div>

                {/* Church Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Igreja
                  </h3>

                  <FormField
                    control={form.control}
                    name="church"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selecione a igreja *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Se o usuário alterou manualmente, remove o indicador de geolocalização
                            if (churchSetByGeolocation) {
                              setChurchSetByGeolocation(false);
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a igreja" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CHURCH_LOCATIONS.map((church) => (
                              <SelectItem key={church} value={church}>
                                {church}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {churchSetByGeolocation && field.value && (
                          <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
                            <MapPin className="w-3 h-3" />
                            Preenchido automaticamente pela sua localização
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Informações Pessoais
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nome completo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!hasNoEmail ? (
                      <div className="md:col-span-2 space-y-2">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <FormControl className="flex-1">
                                  <Input type="email" placeholder="seu@email.com" {...field} />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="default"
                                  onClick={() => setIsNoEmailDialogOpen(true)}
                                  className="text-muted-foreground hover:text-foreground whitespace-nowrap"
                                >
                                  <Mail className="w-4 h-4 mr-2" />
                                  Não tenho email
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-amber-700">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium">Cadastro sem email</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setHasNoEmail(false)}
                            className="text-amber-700 border-amber-300 hover:bg-amber-100"
                          >
                            Tenho email
                          </Button>
                        </div>
                        <p className="text-xs text-amber-600 mt-2">
                          Você não receberá notificações por email sobre sua solicitação.
                        </p>
                      </div>
                    )}

                    {/* Birth Date, Gender and Marital Status - Same row on desktop */}
                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem className="col-span-2 md:col-span-1">
                            <FormLabel>Data de nascimento *</FormLabel>
                            <FormControl>
                              <DateInput
                                name={field.name}
                                value={field.value}
                                onChange={field.onChange}
                                maxDate={new Date()}
                                minDate={new Date("1900-01-01")}
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gênero *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="masculino">Masculino</SelectItem>
                                <SelectItem value="feminino">Feminino</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maritalStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado civil *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                                <SelectItem value="casado">Casado(a)</SelectItem>
                                <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                                <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Profissão *</FormLabel>
                          <FormControl>
                            <Input placeholder="Sua profissão" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Contato
                  </h3>

                  {/* Primary Phone and Emergency Contact - Same row */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone principal *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(99) 99999-9999"
                              {...field}
                              onChange={(e) => field.onChange(formatPhone(e.target.value))}
                              maxLength={15}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contato de emergência</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(99) 99999-9999"
                              {...field}
                              onChange={(e) => field.onChange(formatPhone(e.target.value))}
                              maxLength={15}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Endereço (opcional)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="99999-999"
                                {...field}
                                onChange={(e) => handleCepChange(e.target.value)}
                                maxLength={9}
                                disabled={isLoadingCep}
                              />
                              {isLoadingCep && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Rua</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da rua" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Number and Complement - Same row on mobile */}
                    <div className="md:col-span-3 grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input placeholder="Nº" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="complement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complemento</FormLabel>
                            <FormControl>
                              <Input placeholder="Apto, bloco..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Sua cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu estado" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Consents */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Autorizações
                  </h3>

                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="imageConsentGiven"
                      render={({ field }) => (
                        <FormItem
                          className="flex flex-row items-center space-x-4 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => field.onChange(!field.value)}
                        >
                          <FormControl>
                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                field.value
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-muted-foreground/50'
                              }`}
                            >
                              {field.value && <Check className="h-4 w-4" />}
                            </div>
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="cursor-pointer">Autorizo o uso da minha imagem</FormLabel>
                            <FormDescription>
                              Sua imagem poderá ser utilizada em transmissões de cultos, redes sociais da igreja,
                              materiais de divulgação, testemunhos e registros de eventos e celebrações
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {!hasNoEmail && (
                      <FormField
                        control={form.control}
                        name="emailConsentGiven"
                        render={({ field }) => (
                          <FormItem
                            className="flex flex-row items-center space-x-4 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => field.onChange(!field.value)}
                          >
                            <FormControl>
                              <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                  field.value
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : 'border-muted-foreground/50'
                                }`}
                              >
                                {field.value && <Check className="h-4 w-4" />}
                              </div>
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="cursor-pointer">Autorizo comunicação por e-mail</FormLabel>
                              <FormDescription>
                                Receba informações sobre cultos, eventos especiais, estudos bíblicos,
                                avisos importantes e novidades da nossa comunidade
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="whatsappConsentGiven"
                      render={({ field }) => (
                        <FormItem
                          className="flex flex-row items-center space-x-4 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => field.onChange(!field.value)}
                        >
                          <FormControl>
                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                field.value
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-muted-foreground/50'
                              }`}
                            >
                              {field.value && <Check className="h-4 w-4" />}
                            </div>
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="cursor-pointer">Autorizo comunicação por WhatsApp</FormLabel>
                            <FormDescription>
                              Receba informações sobre horários de cultos, mensagens dos Pastores,
                              avisos importantes, convites para eventos e novidades da igreja
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* reCAPTCHA Attribution */}
                <p className="text-xs text-muted-foreground text-center">
                  Este site é protegido pelo reCAPTCHA e se aplicam a{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                    Política de Privacidade
                  </a>{' '}
                  e os{' '}
                  <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                    Termos de Serviço
                  </a>{' '}
                  do Google.
                </p>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Solicitação'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
            </>
          ) : isDuplicateRequest ? (
            // Duplicate Request Feedback
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Warning Icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-amber-500 to-amber-600 rounded-full p-6">
                    <Clock className="w-16 h-16 text-white" />
                  </div>
                </div>

                {/* Warning Message */}
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-amber-600">
                    Solicitação em Análise
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-md">
                    Já existe uma solicitação de cadastro pendente para este e-mail.
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md w-full">
                  <h3 className="font-semibold text-amber-800 mb-2">O que você pode fazer?</h3>
                  <ul className="text-sm text-amber-700 space-y-2 text-left">
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Aguarde a análise da sua solicitação anterior</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Você receberá um e-mail quando sua solicitação for analisada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Verifique sua caixa de SPAM, pois o email de confirmação pode ter caído nela</span>
                    </li>
                  </ul>
                </div>

                {/* Action Button */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <Button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Voltar para Início
                  </Button>
                </div>
              </div>
            </CardContent>
          ) : (
            // Success Feedback
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Success Icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-6">
                    <CheckCircle2 className="w-16 h-16 text-white" />
                  </div>
                </div>

                {/* Success Message */}
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-green-600">
                    Solicitação Enviada!
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-md">
                    Sua solicitação de cadastro foi recebida com sucesso e será analisada em breve.
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-muted/50 border border-border rounded-lg p-6 max-w-md w-full">
                  <h3 className="font-semibold text-foreground mb-2">O que acontece agora?</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Nossa equipe irá analisar sua solicitação</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Você receberá um e-mail com o resultado da análise</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Após aprovação, você terá acesso à área de membros</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <Button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Voltar para Início
                  </Button>
                  <Button
                    onClick={() => {
                      setIsSubmitSuccess(false);
                      form.reset();
                      setPhotoPreview(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Fazer Outro Cadastro
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* No Email Confirmation Dialog */}
      <AlertDialog open={isNoEmailDialogOpen} onOpenChange={setIsNoEmailDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-amber-100 rounded-full p-2">
                <Mail className="w-6 h-6 text-amber-600" />
              </div>
              <AlertDialogTitle>Você realmente não tem email?</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  O email é muito importante para o seu cadastro. Através dele você poderá:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Receber a confirmação da sua solicitação de cadastro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Ser notificado quando sua solicitação for aprovada ou rejeitada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Receber informações importantes sobre cultos e eventos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Recuperar acesso à área de membros caso necessário</span>
                  </li>
                </ul>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                  <p className="text-amber-800 text-sm font-medium">
                    Marque esta opção apenas se você realmente não possui um endereço de email.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>Voltar e informar email</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setHasNoEmail(true);
                setIsNoEmailDialogOpen(false);
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Confirmar: não tenho email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cadastro;
