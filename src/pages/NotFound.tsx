import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoClean from "@/assets/logo-clean.png";

interface BibleVerse {
  text: string;
  reference: string;
}

const promiseVerses: BibleVerse[] = [
  {
    text: "Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.",
    reference: "Jeremias 29:11",
  },
  {
    text: "Mas os que esperam no Senhor renovarão as suas forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.",
    reference: "Isaías 40:31",
  },
  {
    text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.",
    reference: "Isaías 41:10",
  },
  {
    text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.",
    reference: "Romanos 8:28",
  },
  {
    text: "O Senhor é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.",
    reference: "Salmos 23:1-2",
  },
  {
    text: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.",
    reference: "Provérbios 3:5-6",
  },
  {
    text: "Pedi, e dar-se-vos-á; buscai, e encontrareis; batei, e abrir-se-vos-á. Porque aquele que pede, recebe; e o que busca, encontra; e ao que bate, se abre.",
    reference: "Mateus 7:7-8",
  },
  {
    text: "Tudo posso naquele que me fortalece.",
    reference: "Filipenses 4:13",
  },
  {
    text: "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.",
    reference: "1 Pedro 5:7",
  },
  {
    text: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia. Portanto, não temeremos.",
    reference: "Salmos 46:1-2",
  },
];

const NotFound = () => {
  const navigate = useNavigate();

  // Select a random verse - useMemo ensures it stays the same during the component's lifecycle
  const randomVerse = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * promiseVerses.length);
    return promiseVerses[randomIndex];
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src={logoClean}
            alt="Igreja do Deus de Maravilhas"
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* 404 Message */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-secondary">
            Página não encontrada
          </h2>
          <p className="text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        {/* Bible Verse Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-border">
          <div className="flex items-center justify-center gap-2 text-golden">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Aproveite para refletir
            </span>
          </div>

          <blockquote className="space-y-3">
            <p className="text-secondary italic leading-relaxed">
              "{randomVerse.text}"
            </p>
            <footer className="text-primary font-semibold">
              — {randomVerse.reference}
            </footer>
          </blockquote>
        </div>

        {/* Home Button */}
        <Button
          onClick={() => navigate("/")}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
        >
          <Home className="w-5 h-5 mr-2" />
          Voltar para o Início
        </Button>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          Igreja do Deus de Maravilhas
        </p>
      </div>
    </div>
  );
};

export default NotFound;
