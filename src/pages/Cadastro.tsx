import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Upload, User, Check, Home, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const cadastroSchema = z.object({
  photo: z.any().optional(),
  church: z.enum(['Uberaba', 'Conceição das Alagoas'], { required_error: "Selecione a igreja" }),
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  birthDate: z.date({ required_error: "Data de nascimento é obrigatória" }),
  gender: z.string().min(1, "Gênero é obrigatório"),
  maritalStatus: z.string().min(1, "Estado civil é obrigatório"),
  occupation: z.string().min(1, "Profissão é obrigatória").max(100, "Profissão muito longa"),
  primaryPhone: z.string().regex(phoneRegex, "Telefone inválido. Use: (99) 99999-9999"),
  secondaryPhone: z.string().refine(val => val === "" || phoneRegex.test(val), {
    message: "Telefone inválido. Use: (99) 99999-9999"
  }).optional().or(z.literal("")),
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

type CadastroFormData = z.infer<typeof cadastroSchema>;

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      secondaryPhone: "",
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
        console.log('🔍 Verificando reCAPTCHA...');
        console.log('📍 window.grecaptcha existe?', typeof window !== 'undefined' && !!window.grecaptcha);
        console.log('🔑 Site Key:', environment.recaptchaSiteKey);

        if (typeof window !== 'undefined' && window.grecaptcha) {
          recaptchaToken = await new Promise<string>((resolve, reject) => {
            window.grecaptcha.ready(async () => {
              try {
                console.log('⏳ Executando grecaptcha.execute...');
                const token = await window.grecaptcha.execute(environment.recaptchaSiteKey, {
                  action: 'submit_registration'
                });
                console.log('✅ reCAPTCHA token gerado com sucesso');
                console.log('📝 Token (primeiros 50 caracteres):', token.substring(0, 50) + '...');
                resolve(token);
              } catch (err) {
                console.error('❌ Erro no grecaptcha.execute:', err);
                reject(err);
              }
            });
          });
        } else {
          console.error('❌ window.grecaptcha não está disponível');
          throw new Error('reCAPTCHA não carregado');
        }
      } catch (recaptchaError) {
        console.error('❌ Erro ao gerar token reCAPTCHA:', recaptchaError);
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
        secondaryPhone: data.secondaryPhone,
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

      console.log('📤 Enviando solicitação para o backend...');
      console.log('🔑 reCAPTCHA token será enviado com a requisição');

      await memberRequestsService.create(submissionData);

      console.log('✅ Solicitação enviada com sucesso!');

      // Show success feedback
      setIsSubmitSuccess(true);

    } catch (error) {
      console.error('❌ Erro ao enviar solicitação:', error);

      // Get error message
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.";

      // Check if it's a duplicate email error
      const isDuplicateEmail = errorMessage.includes("Já existe uma solicitação pendente com este email");

      // Check if it's a reCAPTCHA validation error
      const isRecaptchaError = errorMessage.toLowerCase().includes("recaptcha") ||
                              errorMessage.toLowerCase().includes("robot") ||
                              errorMessage.toLowerCase().includes("robo");

      if (isRecaptchaError) {
        console.error('⚠️ Erro de validação reCAPTCHA no backend');
        console.error('💡 Verifique a configuração do reCAPTCHA no backend');
      }

      toast({
        title: isDuplicateEmail ? "Solicitação já existe" :
               isRecaptchaError ? "Erro de validação reCAPTCHA" : "Erro ao enviar solicitação",
        description: errorMessage,
        variant: "destructive",
      });
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
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold">
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
          {!isSubmitSuccess ? (
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Data de nascimento *</FormLabel>
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
                                    format(field.value, "dd/MM/yyyy", { locale: ptBR })
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
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                locale={ptBR}
                                className="pointer-events-auto"
                                captionLayout="dropdown-buttons"
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Gender and Marital Status - Same row on mobile */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryPhone"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
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

                    {/* Secondary Phone and Emergency Contact - Same row on mobile */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="secondaryPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone secundário</FormLabel>
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
    </div>
  );
};

export default Cadastro;
