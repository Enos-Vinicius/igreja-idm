import { useState } from "react";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import skyClouds from "@/assets/sky-clouds.jpg";
import logoWhite from "@/assets/logo-white.png";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToLogin: () => void;
}

const ForgotPasswordModal = ({ open, onOpenChange, onBackToLogin }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar email de recuperação";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when closing
      setEmail("");
      setIsSuccess(false);
    }
    onOpenChange(isOpen);
  };

  const handleBackToLogin = () => {
    setEmail("");
    setIsSuccess(false);
    onBackToLogin();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[800px] max-w-full w-full p-0 overflow-hidden max-h-[90vh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl border-0 sm:border data-[state=open]:!bottom-0 data-[state=open]:!top-auto data-[state=open]:sm:!top-[50%] data-[state=open]:sm:!bottom-auto data-[state=open]:!translate-x-[-50%] data-[state=open]:!translate-y-0 data-[state=open]:sm:!translate-y-[-50%]"
      >
        <div className="flex flex-col sm:flex-row sm:min-h-[480px]">
          {/* Top Section (Mobile) / Left Side (Desktop) - Church Image */}
          <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 text-center overflow-hidden sm:w-[45%] min-h-[200px] sm:min-h-0">
            {/* Background Image */}
            <img
              src={skyClouds}
              alt="Igreja do Deus de Maravilhas"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/60 to-transparent" />

            {/* Content centered */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <img
                src={logoWhite}
                alt="Igreja do Deus de Maravilhas"
                className="w-20 h-20 sm:w-32 sm:h-32 object-contain mb-3 sm:mb-6"
              />
              <h2 className="text-white font-bold text-xl sm:text-2xl mb-1 sm:mb-2">Recuperar Senha</h2>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed px-4">
                Não se preocupe, vamos ajudá-lo a recuperar o acesso.
              </p>
            </div>
          </div>

          {/* Bottom Section (Mobile) / Right Side (Desktop) - Form */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center overflow-y-auto">
            {!isSuccess ? (
              <>
                <DialogHeader className="mb-4 sm:mb-6">
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-secondary text-center sm:text-left">
                    Esqueceu sua senha?
                  </DialogTitle>
                  <DialogDescription className="text-center sm:text-left">
                    Digite seu email e enviaremos um link para redefinir sua senha.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90 transition-opacity"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar link de recuperação"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBackToLogin}
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o login
                  </Button>
                </form>
              </>
            ) : (
              // Success state
              <div className="flex flex-col items-center text-center space-y-6 py-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-4">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-green-600">
                    Email enviado!
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Se existe uma conta com o email <strong>{email}</strong>, você receberá um link para redefinir sua senha.
                  </p>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-4 w-full max-w-sm">
                  <p className="text-sm text-muted-foreground">
                    Não recebeu o email? Verifique sua caixa de spam ou tente novamente.
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-sm">
                  <Button
                    onClick={handleBackToLogin}
                    className="w-full bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90 transition-opacity"
                  >
                    Voltar para o login
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsSuccess(false)}
                    className="w-full"
                  >
                    Tentar outro email
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
