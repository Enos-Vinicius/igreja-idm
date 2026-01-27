import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import skyClouds from "@/assets/sky-clouds.jpg";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginModal = ({ open, onOpenChange }: LoginModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", { email, password });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <div className="flex min-h-[400px]">
          {/* Left Side - Branding with Sky Image */}
          <div className="hidden sm:flex w-[30%] relative flex-col items-center justify-center p-6 text-center overflow-hidden">
            {/* Background Image */}
            <img 
              src={skyClouds} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Primary Overlay with Transparency */}
            <div className="absolute inset-0 bg-primary/70" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/30">
                <span className="text-white font-bold text-2xl">M</span>
              </div>
              <h2 className="text-white font-bold text-xl mb-2">Graça e Paz!</h2>
              <p className="text-white/90 text-sm">
                Acesse sua conta para continuar.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 p-8 flex flex-col justify-center">
            <DialogHeader className="mb-6 sm:hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-golden to-golden-light flex items-center justify-center">
                  <span className="text-secondary font-bold text-lg">M</span>
                </div>
                <div>
                  <DialogTitle className="text-lg">Graça e Paz!</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Acesse sua conta para continuar.
                  </p>
                </div>
              </div>
            </DialogHeader>

            <DialogHeader className="hidden sm:block mb-6">
              <DialogTitle className="text-2xl font-bold text-secondary">
                Entrar
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90 transition-opacity"
              >
                ENTRAR
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
