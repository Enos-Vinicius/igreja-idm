import { useNavigate } from "react-router-dom";
import { LogOut, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import skyClouds from "@/assets/sky-clouds.jpg";
import logoWhite from "@/assets/logo-white.png";

const MemberHome = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const memberName = user?.member?.name?.split(" ")[0] || "Membro";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with background image - full height on mobile, partial on desktop */}
      <div className="relative flex-1 md:flex-none md:min-h-[50vh] flex flex-col">
        {/* Background Image */}
        <img
          src={skyClouds}
          alt="Igreja do Deus de Maravilhas"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/70 to-secondary/40" />

        {/* Header Bar */}
        <header className="relative z-10 flex items-center justify-between p-4">
          <img
            src={logoWhite}
            alt="Igreja do Deus de Maravilhas"
            className="w-10 h-10 object-contain"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </header>

        {/* Content - centered */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
          {/* Logo */}
          <img
            src={logoWhite}
            alt="Igreja do Deus de Maravilhas"
            className="w-24 h-24 md:w-32 md:h-32 object-contain mb-6"
          />

          {/* Welcome Message */}
          <h1 className="text-white font-bold text-3xl md:text-4xl mb-2">
            Graça e Paz!
          </h1>
          <h2 className="text-white/90 text-xl md:text-2xl mb-4">
            Seja bem-vindo(a), {memberName}!
          </h2>
          <p className="text-white/80 text-base md:text-lg max-w-md leading-relaxed">
            Esta é a área exclusiva para membros da Igreja do Deus de Maravilhas.
          </p>
        </div>
      </div>

      {/* Bottom Section - visible on desktop, overlaps on mobile */}
      <div className="relative z-10 bg-white md:bg-muted/30 px-6 py-8 md:py-12 -mt-8 md:mt-0 rounded-t-3xl md:rounded-none">
        <div className="max-w-md mx-auto text-center">
          {/* Coming Soon Card */}
          <div className="bg-gradient-to-r from-primary/10 to-golden/10 border border-primary/20 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-golden" />
              <span className="text-primary font-semibold">Em breve</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Estamos preparando várias informações importantes para você aqui.
              <br />
              <strong className="text-foreground">Aguarde novidades!</strong>
            </p>
          </div>

          {/* Blessing Message */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm">
              Que Deus abençoe sua vida e sua família
            </span>
            <Heart className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberHome;
