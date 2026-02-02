import { useState, useEffect, useMemo } from "react";
import { Menu, X, Home, Info, Clock, Briefcase, Heart } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logoClean from "@/assets/logo-clean.png";
import logoWhite from "@/assets/logo-white.png";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/LoginModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

// Converte nome para CamelCase (primeira letra de cada palavra maiúscula)
const toCamelCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Open login modal if ?login=true is in URL
  useEffect(() => {
    if (searchParams.get('login') === 'true' && !isAuthenticated && !isLoading) {
      setIsLoginOpen(true);
      // Remove the param from URL without navigation
      searchParams.delete('login');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, isAuthenticated, isLoading]);

  const userData = useMemo(() => {
    if (!user?.member?.name) {
      return {
        firstName: user?.email?.split('@')[0] || 'Usuário',
        lastName: '',
        avatarUrl: '',
      };
    }

    const nameParts = user.member.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    return {
      firstName,
      lastName,
      avatarUrl: user.member.photoUrl || '',
    };
  }, [user]);

  const initials = `${userData.firstName.charAt(0)}${userData.lastName.charAt(0) || ''}`.toUpperCase();
  const displayName = toCamelCase(
    userData.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData.firstName
  );

  const handleLogout = () => {
    logout(); // Fire and forget - não espera terminar
    navigate("/");
  };

  const handleLoginSuccess = () => {
    setIsLoginOpen(false);
    navigate("/dashboard");
  };

  const handleUserClick = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Início", href: "#inicio", icon: Home },
    { name: "Sobre", href: "#sobre", icon: Info },
    { name: "Horários", href: "#horarios", icon: Clock },
    { name: "Projetos", href: "#projetos", icon: Briefcase },
    { name: "Pedido de Oração", href: "#pedido-oracao", icon: Heart },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? "h-16" : "h-20"
        }`}>
          {/* Logo */}
          <a href="#" className="flex items-center">
            <img
              src={isScrolled ? logoClean : logoWhite}
              alt="Igreja do Deus de Maravilhas"
              className={`object-contain transition-all duration-300 ${
                isScrolled ? "h-10" : "h-24 -mb-14"
              }`}
            />
          </a>

          {/* Church Name - Only visible on mobile when scrolled */}
          {isScrolled && (
            <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
              <h1 className="text-secondary font-semibold text-sm whitespace-nowrap">
                Igreja do Deus de Maravilhas
              </h1>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`font-medium transition-colors duration-300 text-sm tracking-wide ${
                  isScrolled
                    ? "text-secondary/80 hover:text-secondary"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {link.name}
              </a>
            ))}
            {isLoading ? (
              <div className="w-24 h-8" />
            ) : isAuthenticated ? (
              <button
                onClick={handleUserClick}
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 hover:bg-white/10 focus:outline-none ${
                  isScrolled ? "hover:bg-secondary/10" : ""
                }`}
              >
                <Avatar className="h-8 w-8 border-2 border-golden">
                  <AvatarImage src={userData.avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-golden to-golden-light text-secondary font-semibold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`hidden sm:block text-sm font-medium transition-colors duration-300 ${
                    isScrolled ? "text-secondary" : "text-white"
                  }`}
                >
                  {displayName}
                </span>
              </button>
            ) : (
              <Button
                onClick={() => setIsLoginOpen(true)}
                variant="outline"
                className={`rounded-full border-2 font-semibold transition-all ${
                  isScrolled
                    ? "border-primary text-primary hover:bg-primary hover:text-white"
                    : "border-white text-white bg-transparent hover:bg-white hover:text-secondary"
                }`}
              >
                Acessar
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 transition-colors duration-300 ${
              isScrolled ? "text-secondary" : "text-white"
            }`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Overlay */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <nav className="fixed right-0 top-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right md:hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-secondary to-secondary/90 p-6 flex flex-col items-center">
                <img
                  src={logoWhite}
                  alt="Igreja do Deus de Maravilhas"
                  className="w-20 h-20 object-contain mb-3"
                />
                <h2 className="text-white font-bold text-center text-sm leading-tight">
                  Igreja do Deus de<br />Maravilhas
                </h2>
              </div>

              {/* User Section */}
              <div className="px-4 py-4 border-b border-border">
                {isLoading ? (
                  <div className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ) : isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleUserClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 bg-gradient-to-r from-golden/10 to-golden-light/10 hover:from-golden/20 hover:to-golden-light/20 border border-golden/20"
                  >
                    <Avatar className="h-10 w-10 border-2 border-golden">
                      <AvatarImage src={userData.avatarUrl} alt={displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-golden to-golden-light text-secondary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-secondary">{displayName}</p>
                      <p className="text-xs text-muted-foreground">Ver dashboard</p>
                    </div>
                  </button>
                ) : (
                  <Button
                    onClick={() => {
                      setIsLoginOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90 transition-opacity shadow-md"
                  >
                    Acessar
                  </Button>
                )}
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      className="flex items-center gap-4 px-6 py-4 transition-all duration-200 hover:bg-muted/50 group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-royal-700/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-royal-700/20 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-secondary/80 group-hover:text-secondary transition-colors">
                        {link.name}
                      </span>
                    </a>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <p className="text-xs text-center text-muted-foreground">
                  © 2026 Igreja do Deus de Maravilhas
                </p>
              </div>
            </nav>
          </>
        )}
      </div>

      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} onLoginSuccess={handleLoginSuccess} />
    </header>
  );
};

export default Header;
