import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Save, Loader2, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DateInput } from '@/components/ui/date-input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { membersService } from '@/services/members';
import { viaCepService } from '@/services/viaCep';
import {
  GENDERS,
  MARITAL_STATUSES,
  CHURCH_ROLES,
  MEMBERSHIP_STATUSES,
  CHURCH_LOCATIONS,
} from '@/types/member';
import DashboardLayout from '@/components/DashboardLayout';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: z.enum(['Masculino', 'Feminino'], { required_error: 'Gênero é obrigatório' }),
  maritalStatus: z.enum(['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'Outro'], {
    required_error: 'Estado civil é obrigatório',
  }),
  occupation: z.string().min(1, 'Profissão é obrigatória').max(100, 'Profissão deve ter no máximo 100 caracteres'),
  primaryPhone: z.string().min(1, 'Telefone principal é obrigatório'),
  secondaryPhone: z.string().optional(),
  emergencyContact: z.string().optional(),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  church: z.enum(['Uberaba', 'Conceição das Alagoas']).optional().nullable(),
  churchRole: z.enum(['Membro', 'Ministro de Louvor', 'Líder', 'Diácono', 'Presbítero', 'Pastor(a)', 'Secretária', 'Tesoureiro', 'Recepcionista']).optional(),
  membershipStatus: z.enum(['Ativo', 'Inativo', 'Visitante', 'Congregado', 'Transferido']).optional(),
  baptismDate: z.string().optional(),
  joinDate: z.string().optional(),
  imageConsentGiven: z.boolean().optional(),
  emailConsentGiven: z.boolean().optional(),
  whatsappConsentGiven: z.boolean().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

// Converter data ISO para formato de input date (YYYY-MM-DD)
function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

// Máscara de telefone: (99) 99999-9999 ou (99) 9999-9999
function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : '';
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

// Máscara de CEP: 99999-999
function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
}

const MemberForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMember, setIsLoadingMember] = useState(isEditing);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      birthDate: '',
      gender: undefined,
      maritalStatus: undefined,
      occupation: '',
      primaryPhone: '',
      secondaryPhone: '',
      emergencyContact: '',
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      church: undefined,
      churchRole: undefined,
      membershipStatus: undefined,
      baptismDate: '',
      joinDate: '',
      imageConsentGiven: false,
      emailConsentGiven: false,
      whatsappConsentGiven: false,
      notes: '',
    },
  });

  // Load member data when editing
  useEffect(() => {
    if (isEditing && id) {
      loadMember(id);
    }
  }, [isEditing, id]);

  const loadMember = async (memberId: string) => {
    setIsLoadingMember(true);
    try {
      const member = await membersService.getById(memberId);
      form.reset({
        name: member.name || '',
        email: member.email || '',
        birthDate: formatDateForInput(member.birthDate),
        gender: member.gender,
        maritalStatus: member.maritalStatus,
        occupation: member.occupation || '',
        primaryPhone: member.primaryPhone || '',
        secondaryPhone: member.secondaryPhone || '',
        emergencyContact: member.emergencyContact || '',
        zipCode: member.zipCode || '',
        street: member.street || '',
        number: member.number || '',
        complement: member.complement || '',
        neighborhood: member.neighborhood || '',
        city: member.city || '',
        state: member.state || '',
        church: member.church || undefined,
        churchRole: member.churchRole,
        membershipStatus: member.membershipStatus,
        baptismDate: formatDateForInput(member.baptismDate),
        joinDate: formatDateForInput(member.joinDate),
        imageConsentGiven: member.imageConsentGiven || false,
        emailConsentGiven: member.emailConsentGiven || false,
        whatsappConsentGiven: member.whatsappConsentGiven || false,
        notes: member.notes || '',
      });
      if (member.photoUrl) {
        setPhotoPreview(member.photoUrl);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar membro';
      toast.error(message);
      navigate('/members');
    } finally {
      setIsLoadingMember(false);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A foto deve ter no máximo 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const address = await viaCepService.buscarCep(cep);
      if (address) {
        form.setValue('street', address.street);
        form.setValue('neighborhood', address.neighborhood);
        form.setValue('city', address.city);
        form.setValue('state', address.state);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (isEditing && id) {
        await membersService.update(id, data);

        // Upload photo if changed
        if (photoFile) {
          await membersService.uploadPhoto(id, photoFile);
        }

        toast.success('Membro atualizado com sucesso!');
      } else {
        const newMember = await membersService.create(data as any);

        // Upload photo if provided
        if (photoFile && newMember.id) {
          await membersService.uploadPhoto(String(newMember.id), photoFile);
        }

        toast.success('Membro cadastrado com sucesso!');
      }
      // Navega de volta com flag de refresh para recarregar os dados
      navigate('/members', { state: { refresh: true } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar membro';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingMember) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
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
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/members')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? 'Editar Membro' : 'Novo Membro'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isEditing
                ? 'Atualize as informações do membro'
                : 'Adicione um novo membro à igreja'}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Foto */}
            <Card>
              <CardHeader>
                <CardTitle>Foto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-border"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-dashed border-border">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="max-w-xs"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      JPEG, PNG ou WebP. Máximo 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-6">
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-6">
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel>Data de Nascimento *</FormLabel>
                      <FormControl>
                        <DateInput
                          value={field.value}
                          onChangeString={field.onChange}
                          maxDate={new Date()}
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
                    <FormItem className="md:col-span-4">
                      <FormLabel>Gênero *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GENDERS.map((gender) => (
                            <SelectItem key={gender} value={gender}>
                              {gender}
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
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel>Estado Civil *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MARITAL_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
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
                  name="occupation"
                  render={({ field }) => (
                    <FormItem className="md:col-span-12">
                      <FormLabel>Profissão *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite a profissão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="primaryPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone Principal *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 99999-9999"
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
                  name="secondaryPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone Secundário</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 99999-9999"
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
                      <FormLabel>Contato de Emergência</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 99999-9999"
                          {...field}
                          onChange={(e) => field.onChange(formatPhone(e.target.value))}
                          maxLength={15}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="00000-000"
                            {...field}
                            onChange={(e) => field.onChange(formatCEP(e.target.value))}
                            onBlur={(e) => {
                              field.onBlur();
                              fetchAddressByCep(e.target.value);
                            }}
                            maxLength={9}
                          />
                          {isLoadingCep && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>Digite o CEP para buscar o endereço</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel>Rua/Avenida</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da rua" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Apto, Bloco, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>UF</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brazilianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Informações Eclesiásticas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Eclesiásticas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <FormField
                  control={form.control}
                  name="church"
                  render={({ field }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel>Igreja</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
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

                <FormField
                  control={form.control}
                  name="churchRole"
                  render={({ field }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel>Função na Igreja</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a função" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CHURCH_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
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
                  name="membershipStatus"
                  render={({ field }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel>Status de Membro</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MEMBERSHIP_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
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
                  name="baptismDate"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Data de Batismo</FormLabel>
                      <FormControl>
                        <DateInput
                          value={field.value}
                          onChangeString={field.onChange}
                          maxDate={new Date()}
                          className="w-[180px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="joinDate"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Data que Aceitou Jesus</FormLabel>
                      <FormControl>
                        <DateInput
                          value={field.value}
                          onChangeString={field.onChange}
                          maxDate={new Date()}
                          className="w-[180px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Consentimentos */}
            <Card>
              <CardHeader>
                <CardTitle>Consentimentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas/Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informações adicionais sobre o membro..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/members')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Salvar Alterações' : 'Cadastrar Membro'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default MemberForm;
