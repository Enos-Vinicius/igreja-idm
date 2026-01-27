import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroRoad from "@/assets/hero-road.jpg";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/LoginModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// TODO: Replace with real authentication state
const mockUser = {
  firstName: "João",
  lastName: "Silva",
  avatarUrl: "",
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const initials = `${mockUser.firstName.charAt(0)}${mockUser.lastName.charAt(0)}`.toUpperCase();
  const displayName = `${mockUser.firstName} ${mockUser.lastName}`;

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginOpen(false);
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
    { name: "Contato", href: "#contato" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 overflow-hidden ${
        isScrolled 
          ? "bg-white shadow-lg" 
          : ""
      }`}
    >
      {/* Background Image with Gradient Overlay */}
      {!isScrolled && (
        <div className="absolute inset-0 -z-10">
          <img 
            src={heroRoad} 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-primary/60" />
        </div>
      )}
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? "h-16" : "h-20"
        }`}>
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-golden to-golden-light flex items-center justify-center">
              <span className="text-secondary font-bold text-lg">M</span>
            </div>
            <div className="hidden sm:block">
              <span className={`text-sm font-semibold transition-colors duration-300 ${
                isScrolled ? "text-secondary" : "text-white"
              }`}>Igreja do Deus de</span>
              <span className="block text-lg font-bold text-gradient-golden">Maravilhas</span>
            </div>
          </a>

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
            {isLoggedIn ? (
              <button
                onClick={handleUserClick}
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 hover:bg-white/10 focus:outline-none ${
                  isScrolled ? "hover:bg-secondary/10" : ""
                }`}
              >
                <Avatar className="h-8 w-8 border-2 border-golden">
                  <AvatarImage src={mockUser.avatarUrl} alt={displayName} />
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
          <nav className={`md:hidden py-4 border-t animate-fade-up ${
            isScrolled ? "border-border" : "border-white/20"
          }`}>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`block py-3 font-medium transition-colors ${
                  isScrolled 
                    ? "text-secondary/80 hover:text-secondary" 
                    : "text-white/90 hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleUserClick();
                  setIsOpen(false);
                }}
                className={`mt-3 w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isScrolled ? "bg-muted hover:bg-muted/80" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                <Avatar className="h-8 w-8 border-2 border-golden">
                  <AvatarImage src={mockUser.avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-golden to-golden-light text-secondary font-semibold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`text-sm font-medium ${
                    isScrolled ? "text-secondary" : "text-white"
                  }`}
                >
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
                className={`mt-3 w-full rounded-full border-2 font-semibold transition-all ${
                  isScrolled 
                    ? "border-primary text-primary hover:bg-primary hover:text-white" 
                    : "border-white text-white bg-transparent hover:bg-white hover:text-secondary"
                }`}
              >
                Acessar
              </Button>
            )}
          </nav>
        )}
      </div>

      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} onLoginSuccess={handleLoginSuccess} />
    </header>
  );
};

export default Header;
