import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ForgotPasswordModal from "./ForgotPasswordModal";
import skyClouds from "@/assets/sky-clouds.jpg";
import logoWhite from "@/assets/logo-white.png";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
  isFirstAccess?: boolean;
}

const LoginModal = ({ open, onOpenChange, onLoginSuccess, isFirstAccess = false }: LoginModalProps) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();

  const handleOpenForgotPassword = () => {
    onOpenChange(false); // Close login modal
    setShowForgotPassword(true); // Open forgot password modal
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false); // Close forgot password modal
    onOpenChange(true); // Open login modal
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); // Limpa erro anterior

    try {
      const result = await login({ email, password });

      // Se precisa trocar senha no primeiro acesso
      if (result.mustChangePassword) {
        setEmail("");
        setPassword("");
        onOpenChange(false);
        navigate("/change-password");
        return;
      }

      toast.success("Login realizado com sucesso!");
      onLoginSuccess?.();
      setEmail("");
      setPassword("");
      setErrorMessage("");
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao fazer login";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <h2 className="text-white font-bold text-xl sm:text-2xl mb-1 sm:mb-2">Graça e Paz!</h2>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed px-4">
                Bem-vindo à área de membros da Igreja do Deus de Maravilhas.
              </p>
            </div>
          </div>

          {/* Bottom Section (Mobile) / Right Side (Desktop) - Form */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center overflow-y-auto">
            <DialogHeader className="mb-4 sm:mb-6">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-secondary text-center sm:text-left">
                Entrar
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" autoComplete={isFirstAccess ? "off" : "on"}>
              <div className="space-y-2">
                <Label htmlFor={isFirstAccess ? "first-access-email" : "email"}>Email</Label>
                <Input
                  id={isFirstAccess ? "first-access-email" : "email"}
                  name={isFirstAccess ? "first-access-email" : "email"}
                  type={isFirstAccess ? "text" : "email"}
                  inputMode={isFirstAccess ? "email" : undefined}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete={isFirstAccess ? "one-time-code" : "email"}
                  data-lpignore={isFirstAccess ? "true" : undefined}
                  data-form-type={isFirstAccess ? "other" : undefined}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={isFirstAccess ? "first-access-password" : "password"}>Senha</Label>
                <div className="relative">
                  <Input
                    id={isFirstAccess ? "first-access-password" : "password"}
                    name={isFirstAccess ? "first-access-password" : "password"}
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite aqui sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                    autoComplete={isFirstAccess ? "one-time-code" : "current-password"}
                    data-lpignore={isFirstAccess ? "true" : undefined}
                    data-form-type={isFirstAccess ? "other" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {isFirstAccess && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 mt-2">
                    Para o primeiro acesso utilize a senha enviada por email.
                  </p>
                )}
              </div>

              {!isFirstAccess && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleOpenForgotPassword}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ENTRANDO...
                  </>
                ) : (
                  "ENTRAR"
                )}
              </Button>

              {errorMessage && (
                <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                  <p className="text-sm text-destructive font-medium">{errorMessage}</p>
                </div>
              )}
            </form>

            {/* Solicitar Acesso Button */}
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  onOpenChange(false);
                  navigate('/cadastro');
                }}
              >
                Solicitar Acesso
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <ForgotPasswordModal
      open={showForgotPassword}
      onOpenChange={setShowForgotPassword}
      onBackToLogin={handleBackToLogin}
    />
    </>
  );
};

export default LoginModal;
