import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, Home, Mail, RefreshCw } from "lucide-react";
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

const resendActivationSchema = z.object({
  email: z
    .string()
    .min(1, "O email é obrigatório")
    .email("Digite um email válido"),
});

type ResendActivationFormData = z.infer<typeof resendActivationSchema>;

const ResendActivation = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResendActivationFormData>({
    resolver: zodResolver(resendActivationSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: ResendActivationFormData) => {
    setIsLoading(true);

    try {
      await authService.resendActivation(data.email);
      toast.success("Link enviado com sucesso!");
      setIsSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar link";
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
              Reenviar Ativação
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
          {!isSuccess ? (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 bg-primary/10 rounded-full p-4">
                  <RefreshCw className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-primary">
                  Solicitar novo link
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Digite seu email para receber um novo link de ativação.
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
                          <FormLabel>Seu email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="seu.email@exemplo.com"
                                autoComplete="email"
                                {...field}
                                disabled={isLoading}
                                className="pl-10"
                              />
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
                          Enviando...
                        </>
                      ) : (
                        "Enviar novo link"
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Lembrou a senha?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/?login=true")}
                      className="text-primary hover:underline font-medium"
                    >
                      Fazer login
                    </button>
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
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
                    Email enviado!
                  </h2>
                  <p className="text-muted-foreground max-w-sm">
                    Verifique sua caixa de entrada e clique no link para criar sua senha.
                    O link é válido por 30 dias.
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90 transition-opacity"
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

export default ResendActivation;
