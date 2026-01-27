import { Cross, MapPin, Phone, Mail, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contato" className="bg-foreground text-primary-foreground">
      <div className="container-main section-padding">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* Logo & About */}
          <div className="lg:col-span-2">
            <a href="#inicio" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Cross className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-bold">
                Comunidade da Redenção
              </span>
            </a>
            <p className="text-primary-foreground/70 leading-relaxed max-w-md">
              Somos uma igreja que acredita no poder transformador do evangelho de Cristo.
              Venha nos visitar e faça parte desta família!
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-primary" />
                <span className="text-primary-foreground/70">
                  Rua da Igreja, 123
                  <br />
                  Centro - Sua Cidade, UF
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-primary-foreground/70">(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-primary-foreground/70">contato@redencao.com.br</span>
              </li>
            </ul>
          </div>

          {/* Schedule */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-4">Horários</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 mt-0.5 text-primary" />
                <div className="text-primary-foreground/70">
                  <strong className="text-primary-foreground">Domingo</strong>
                  <br />
                  09h e 18h
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 mt-0.5 text-primary" />
                <div className="text-primary-foreground/70">
                  <strong className="text-primary-foreground">Quarta-feira</strong>
                  <br />
                  19h30
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/50 text-sm">
            © {new Date().getFullYear()} Comunidade da Redenção. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
