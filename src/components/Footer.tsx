import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
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
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-golden hover:text-secondary transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Links Rápidos</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-golden transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
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
                  className="flex items-center gap-3 text-white/60 hover:text-golden transition-colors"
                >
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span>idmigreja@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-white/60">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Uberaba - MG</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2025 Igreja do Deus de Maravilhas. Todos os direitos reservados.
          </p>
          <p className="text-white/40 text-sm">
            Desenvolvido com ❤️ para a glória de Deus
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
