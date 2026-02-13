import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, KeyRound, ShieldCheck, PartyPopper, Check, X } from "lucide-react";
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
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import logoWhite from "@/assets/logo-white.png";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z
    .string()
    .min(6, "A nova senha deve ter no mínimo 6 caracteres")
    .max(100, "A nova senha deve ter no máximo 100 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "A nova senha deve ser diferente da senha atual",
  path: ["newPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

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

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, completePasswordChange, logout } = useAuth();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur", // Validate on blur
  });

  const newPassword = form.watch("newPassword");

  const passwordStrength = useMemo(() => {
    const criteria = checkPasswordStrength(newPassword || "");
    const strength = getStrengthLevel(criteria);
    return { criteria, strength };
  }, [newPassword]);

  // Trigger confirmPassword validation when it loses focus
  const handleConfirmPasswordBlur = () => {
    form.trigger("confirmPassword");
  };

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);

    try {
      await authService.changePassword(data.currentPassword, data.newPassword);

      // Completa o fluxo de troca de senha e carrega dados do usuário
      await completePasswordChange();

      toast.success("Senha alterada com sucesso!");

      // Aguarda um momento para garantir que o estado foi atualizado
      setTimeout(() => {
        navigate("/member-home", { replace: true });
      }, 100);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao alterar senha";
      toast.error(message);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
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
              className="w-10 h-10 object-contain"
            />

            {/* Title - Centered */}
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold">
              Primeiro Acesso
            </h1>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/10"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-golden/10 border border-primary/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-golden/20 rounded-full p-2 flex-shrink-0">
              <PartyPopper className="w-5 h-5 text-golden" />
            </div>
            <div>
              <h2 className="font-semibold text-primary">Bem-vindo(a) à Igreja do Deus de Maravilhas!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Este é o seu primeiro acesso ao sistema. Para sua segurança, é necessário criar uma senha pessoal.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-amber-100 rounded-full p-4">
              <ShieldCheck className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              Criar Nova Senha
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              A senha temporária que você recebeu por email será substituída pela sua nova senha pessoal.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Hidden email field for browser password manager */}
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={user?.email || ""}
                  readOnly
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                />

                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha atual (temporária)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Digite a senha recebida"
                            {...field}
                            disabled={isLoading}
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Esta é a senha que você recebeu por email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Crie uma senha segura"
                            autoComplete="new-password"
                            {...field}
                            disabled={isLoading}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>

                      {/* Password Strength Indicator */}
                      {newPassword && (
                        <div className="space-y-3 pt-2">
                          {/* Strength Bar */}
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

                          {/* Criteria Checklist */}
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
                      <FormLabel>Confirmar nova senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirme a nova senha"
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
                      Alterando...
                    </>
                  ) : (
                    "Alterar senha e continuar"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
