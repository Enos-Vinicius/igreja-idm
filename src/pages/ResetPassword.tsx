import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, Home, KeyRound } from "lucide-react";
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

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .max(100, "A senha deve ter no máximo 100 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      setIsError(true);
      setErrorMessage("Token de recuperação não encontrado. Solicite um novo link de recuperação de senha.");
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsLoading(true);
    setIsError(false);

    try {
      await authService.resetPassword(token, data.newPassword);
      setIsSuccess(true);
      toast.success("Senha alterada com sucesso!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao redefinir senha";

      // Check for common token errors
      if (message.toLowerCase().includes("expirado") || message.toLowerCase().includes("expired")) {
        setErrorMessage("O link de recuperação expirou. Solicite um novo link.");
      } else if (message.toLowerCase().includes("inválido") || message.toLowerCase().includes("invalid")) {
        setErrorMessage("O link de recuperação é inválido. Solicite um novo link.");
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
            {/* Logo */}
            <img
              src={logoWhite}
              alt="Igreja do Deus de Maravilhas"
              className="w-10 h-10 object-contain cursor-pointer"
              onClick={() => navigate("/")}
            />

            {/* Title - Centered */}
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold">
              Redefinir Senha
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
                  Criar nova senha
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Digite sua nova senha abaixo.
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
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
                                placeholder="••••••••"
                                {...field}
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
                          Salvando...
                        </>
                      ) : (
                        "Redefinir senha"
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
                    Senha alterada!
                  </h2>
                  <p className="text-muted-foreground max-w-sm">
                    Sua senha foi redefinida com sucesso. Você já pode fazer login com sua nova senha.
                  </p>
                </div>

                <Button
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90 transition-opacity"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir para página inicial
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
                    Link inválido
                  </h2>
                  <p className="text-muted-foreground max-w-sm">
                    {errorMessage}
                  </p>
                </div>

                <Button
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90 transition-opacity"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir para página inicial
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
