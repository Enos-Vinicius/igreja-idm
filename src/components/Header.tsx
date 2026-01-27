import { useState } from "react";
import { Menu, X, Play } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Início", href: "#inicio" },
    { name: "Sobre", href: "#sobre" },
    { name: "Horários", href: "#horarios" },
    { name: "Projetos", href: "#projetos" },
    { name: "Contato", href: "#contato" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-golden to-golden-light flex items-center justify-center">
              <span className="text-secondary font-bold text-lg">M</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-semibold text-secondary">Igreja do Deus de</span>
              <span className="block text-lg font-bold text-gradient-golden">Maravilhas</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-secondary/80 hover:text-secondary font-medium transition-colors duration-200 text-sm tracking-wide"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-golden/30 hover:scale-105"
            >
              <Play size={16} fill="currentColor" />
              <span>Ao Vivo</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-secondary"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-up">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block py-3 text-secondary/80 hover:text-secondary font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#"
              className="mt-4 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold rounded-full"
            >
              <Play size={16} fill="currentColor" />
              <span>Assista Ao Vivo</span>
            </a>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
