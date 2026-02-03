import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, Home, KeyRound, Check, X, RefreshCw } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import logoWhite from "@/assets/logo-white.png";

const setPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
  newPassword: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .max(100, "A senha deve ter no máximo 100 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type SetPasswordFormData = z.infer<typeof setPasswordSchema>;

// Password strength criteria
interface PasswordCriteria {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const checkPasswordStrength = (password: string): PasswordCriteria => ({
  minLength: password.length >= 6,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
});

const getStrengthLevel = (criteria: PasswordCriteria): { level: number; label: string; color: string } => {
  const met = Object.values(criteria).filter(Boolean).length;
  if (met <= 1) return { level: 1, label: "Muito fraca", color: "bg-red-500" };
  if (met === 2) return { level: 2, label: "Fraca", color: "bg-orange-500" };
  if (met === 3) return { level: 3, label: "Média", color: "bg-yellow-500" };
  if (met === 4) return { level: 4, label: "Forte", color: "bg-lime-500" };
  return { level: 5, label: "Muito forte", color: "bg-green-500" };
};

const SetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const newPassword = form.watch("newPassword");

  const passwordStrength = useMemo(() => {
    const criteria = checkPasswordStrength(newPassword || "");
    const strength = getStrengthLevel(criteria);
    return { criteria, strength };
  }, [newPassword]);

  const handleConfirmPasswordBlur = () => {
    form.trigger("confirmPassword");
  };

  // Check if token is present
  useEffect(() => {
    if (!token) {
      setIsError(true);
      setErrorMessage("Link de ativação não encontrado. Solicite um novo link.");
    }
  }, [token]);

  const onSubmit = async (data: SetPasswordFormData) => {
    if (!token) return;

    setIsLoading(true);
    setIsError(false);

    try {
      await authService.setPassword(token, data.newPassword);

      // Após criar a senha, faz login automático
      try {
        await authService.login({ email: data.email, password: data.newPassword });
        toast.success("Senha criada com sucesso! Redirecionando...");
        navigate("/dashboard");
      } catch (loginError) {
        // Se o login falhar, mostra tela de sucesso e pede login manual
        toast.success("Senha criada com sucesso!");
        setIsSuccess(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar senha";

      if (message.toLowerCase().includes("expirado") || message.toLowerCase().includes("expired")) {
        setErrorMessage("O link de ativação expirou. Solicite um novo link.");
      } else if (message.toLowerCase().includes("inválido") || message.toLowerCase().includes("invalid")) {
        setErrorMessage("O link de ativação é inválido. Solicite um novo link.");
      } else {
        setErrorMessage(message);
      }

      setIsError(true);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-secondary text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <img
              src={logoWhite}
              alt="Igreja do Deus de Maravilhas"
              className="w-10 h-10 object-contain cursor-pointer"
              onClick={() => navigate("/")}
            />

            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold">
              Criar Minha Senha
            </h1>

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

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          {!isSuccess && !isError ? (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 bg-primary/10 rounded-full p-4">
                  <KeyRound className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-primary">
                  Bem-vindo(a)!
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Crie sua senha para acessar a área de membros.
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="seu@email.com"
                              autoComplete="email"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sua senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Crie uma senha segura"
                                autoComplete="new-password"
                                {...field}
                                disabled={isLoading}
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </FormControl>

                          {/* Password Strength Indicator */}
                          {newPassword && (
                            <div className="space-y-3 pt-2">
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-muted-foreground">Força da senha</span>
                                  <span className={`text-xs font-medium ${
                                    passwordStrength.strength.level <= 2 ? "text-red-600" :
                                    passwordStrength.strength.level === 3 ? "text-yellow-600" :
                                    "text-green-600"
                                  }`}>
                                    {passwordStrength.strength.label}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                      key={level}
                                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                                        level <= passwordStrength.strength.level
                                          ? passwordStrength.strength.color
                                          : "bg-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <div className={`flex items-center gap-1.5 ${passwordStrength.criteria.minLength ? "text-green-600" : "text-muted-foreground"}`}>
                                  {passwordStrength.criteria.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                  <span>Mínimo 6 caracteres</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${passwordStrength.criteria.hasUppercase ? "text-green-600" : "text-muted-foreground"}`}>
                                  {passwordStrength.criteria.hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                  <span>Letra maiúscula</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${passwordStrength.criteria.hasLowercase ? "text-green-600" : "text-muted-foreground"}`}>
                                  {passwordStrength.criteria.hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                  <span>Letra minúscula</span>
                                </div>
                                <div className={`flex items-center gap-1.5 ${passwordStrength.criteria.hasNumber ? "text-green-600" : "text-muted-foreground"}`}>
                                  {passwordStrength.criteria.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                  <span>Número</span>
                                </div>
                                <div className={`flex items-center gap-1.5 col-span-2 ${passwordStrength.criteria.hasSpecial ? "text-green-600" : "text-muted-foreground"}`}>
                                  {passwordStrength.criteria.hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                  <span>Caractere especial (!@#$%...)</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Digite a senha novamente"
                                autoComplete="new-password"
                                {...field}
                                onBlur={(e) => {
                                  field.onBlur();
                                  handleConfirmPasswordBlur();
                                }}
                                disabled={isLoading}
                                className="pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90 transition-opacity"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        "Criar minha senha"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </>
          ) : isSuccess ? (
            // Success state
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-6">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-green-600">
                    Senha criada!
                  </h2>
                  <p className="text-muted-foreground max-w-sm">
                    Sua senha foi criada com sucesso. Você já pode fazer login e acessar a área de membros.
                  </p>
                </div>

                <Button
                  onClick={() => navigate("/?login=true")}
                  className="bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90 transition-opacity"
                >
                  Fazer Login
                </Button>
              </div>
            </CardContent>
          ) : (
            // Error state
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-red-500 to-red-600 rounded-full p-6">
                    <XCircle className="w-12 h-12 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-red-600">
                    Link inválido ou expirado
                  </h2>
                  <p className="text-muted-foreground max-w-sm">
                    {errorMessage}
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <Button
                    onClick={() => navigate("/reenviar-ativacao")}
                    className="bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90 transition-opacity"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Solicitar novo link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Ir para página inicial
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

export default SetPassword;
