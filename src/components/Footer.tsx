import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/Igrejadeusdemaravilhas", label: "Facebook" },
    { icon: Youtube, href: "https://www.youtube.com/@igrejadodeusdemaravilhas8554", label: "YouTube" },
  ];

  const quickLinks = [
    { name: "Início", href: "#inicio" },
    { name: "Sobre", href: "#sobre" },
    { name: "Horários", href: "#horarios" },
    { name: "Projetos", href: "#projetos" },
  ];

  return (
    <footer id="contato" className="bg-secondary text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Brand - Full width and centered on mobile */}
        <div className="flex flex-col items-center md:items-start mb-12">
          <div className="mb-6">
            <img
              src={logoWhite}
              alt="Igreja do Deus de Maravilhas"
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-golden hover:text-secondary transition-all duration-300"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links and Contact - Side by side on mobile, responsive on larger screens */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold mb-6">Links Rápidos</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-golden transition-colors text-sm md:text-base"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold mb-6">Contato</h4>
            <ul className="space-y-4">
              {/* <li>
                <a
                  href="tel:+5534999999999"
                  className="flex items-center gap-3 text-white/60 hover:text-golden transition-colors"
                >
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span>(34) 99999-9999</span>
                </a>
              </li> */}
              <li>
                <a
                  href="mailto:idmigreja@gmail.com"
                  className="flex items-center justify-center md:justify-start gap-2 md:gap-3 text-white/60 hover:text-golden transition-colors text-sm md:text-base"
                >
                  <Mail className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="text-xs md:text-sm break-all">idmigreja@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start justify-center md:justify-start gap-2 md:gap-3 text-white/60 text-sm md:text-base">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />
                  <span>Uberaba - MG</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm text-center md:text-left">
            © 2026 Igreja do Deus de Maravilhas. Todos os direitos reservados.
          </p>
          <p className="text-white/40 text-sm text-center md:text-left">
            Desenvolvido com ❤️ para a glória de Deus
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
