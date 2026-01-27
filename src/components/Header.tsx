import { useState } from "react";
import { Menu, X, Cross } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Início", href: "#inicio" },
    { name: "Sobre", href: "#historia" },
    { name: "Versículos", href: "#versiculos" },
    { name: "Pedidos de Oração", href: "#oracao" },
    { name: "Contato", href: "#contato" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container-main">
        <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-8">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Cross className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="font-serif text-lg font-semibold text-foreground">
                Comunidade da Redenção
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-primary font-medium transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a href="#oracao" className="btn-primary text-sm">
              Fazer Pedido de Oração
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border">
          <nav className="container-main px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-foreground hover:text-primary font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#oracao"
              className="btn-primary text-center mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Fazer Pedido de Oração
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
