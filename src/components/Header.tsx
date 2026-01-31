import { useState, useEffect, useMemo } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const { user, isAuthenticated, isLoading, logout } = useAuth();

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
    { name: "Início", href: "#inicio" },
    { name: "Sobre", href: "#sobre" },
    { name: "Horários", href: "#horarios" },
    { name: "Projetos", href: "#projetos" },
    { name: "Pedido de Oração", href: "#pedido-oracao" },
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

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden py-4 px-4 border-t border-border animate-fade-up flex flex-col items-end bg-white absolute right-0 top-full shadow-lg">
            <div className="w-full">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block py-3 font-medium transition-colors text-right text-secondary/80 hover:text-secondary"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            {isLoading ? (
              <div className="mt-3 w-full h-12" />
            ) : isAuthenticated ? (
              <button
                onClick={() => {
                  handleUserClick();
                  setIsOpen(false);
                }}
                className="mt-3 w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 bg-muted hover:bg-muted/80"
              >
                <Avatar className="h-8 w-8 border-2 border-golden">
                  <AvatarImage src={userData.avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-golden to-golden-light text-secondary font-semibold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-secondary">
                  {displayName}
                </span>
              </button>
            ) : (
              <Button
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsOpen(false);
                }}
                variant="outline"
                className="mt-3 w-full rounded-full border-2 font-semibold transition-all border-primary text-primary hover:bg-primary hover:text-white"
              >
                Acessar
              </Button>
            )}
            </div>
          </nav>
        )}
      </div>

      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} onLoginSuccess={handleLoginSuccess} />
    </header>
  );
};

export default Header;
