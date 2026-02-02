import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2, CheckCircle2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { prayerRequestsService } from "@/services/prayerRequests";
import { environment } from "@/config/environment";

// Declare grecaptcha type for TypeScript
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

const prayerRequestSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  phone: z
    .string()
    .refine((val) => val === "" || phoneRegex.test(val), {
      message: "Telefone inválido. Use: (99) 99999-9999",
    })
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .min(10, "O pedido deve ter pelo menos 10 caracteres")
    .max(2000, "O pedido deve ter no máximo 2000 caracteres"),
});

type PrayerRequestFormData = z.infer<typeof prayerRequestSchema>;

const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : "";
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const PrayerSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<PrayerRequestFormData>({
    resolver: zodResolver(prayerRequestSchema),
    defaultValues: {
      name: "",
      phone: "",
      content: "",
    },
  });

  const onSubmit = async (data: PrayerRequestFormData) => {
    setIsSubmitting(true);

    try {
      // Generate reCAPTCHA token
      let recaptchaToken = "";

      try {
        if (typeof window !== "undefined" && window.grecaptcha) {
          recaptchaToken = await new Promise<string>((resolve, reject) => {
            window.grecaptcha.ready(async () => {
              try {
                const token = await window.grecaptcha.execute(
                  environment.recaptchaSiteKey,
                  { action: "submit_prayer_request" }
                );
                resolve(token);
              } catch (err) {
                reject(err);
              }
            });
          });
        } else {
          throw new Error("reCAPTCHA não carregado");
        }
      } catch {
        toast.error(
          "Erro de verificação. Por favor, recarregue a página e tente novamente."
        );
        return;
      }

      await prayerRequestsService.create({
        name: data.name,
        phone: data.phone || undefined,
        content: data.content,
        recaptchaToken,
      });

      setIsSuccess(true);
      form.reset();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao enviar pedido. Por favor, tente novamente.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRequest = () => {
    setIsSuccess(false);
    form.reset();
  };

  return (
    <section id="pedido-oracao" className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="text-golden font-semibold text-sm uppercase tracking-widest">
              Estamos Aqui por Você
            </span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-secondary">
              Pedido de Oração
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Compartilhe seu pedido de oração conosco. Nossa equipe está pronta
              para interceder por você.
            </p>
          </div>

          {/* Prayer Form or Success State */}
          <div className="bg-background rounded-2xl shadow-xl p-8">
            {isSuccess ? (
              // Success State
              <div className="flex flex-col items-center text-center space-y-6 py-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-5">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-green-600">
                    Pedido Enviado!
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Seu pedido de oração foi recebido. Nossa equipe estará
                    orando por você.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    "E tudo o que pedirdes em oração, crendo, o recebereis." -
                    Mateus 21:22
                  </span>
                  <Heart className="w-4 h-4 text-primary" />
                </div>

                <Button
                  onClick={handleNewRequest}
                  variant="outline"
                  className="mt-4"
                >
                  Enviar outro pedido
                </Button>
              </div>
            ) : (
              // Form
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seu Nome *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite seu nome"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone (opcional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(00) 00000-0000"
                              disabled={isSubmitting}
                              {...field}
                              onChange={(e) =>
                                field.onChange(formatPhone(e.target.value))
                              }
                              maxLength={15}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu Pedido de Oração *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Compartilhe seu pedido de oração..."
                            rows={5}
                            disabled={isSubmitting}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* reCAPTCHA Attribution */}
                  <p className="text-xs text-muted-foreground text-center">
                    Este site é protegido pelo reCAPTCHA e se aplicam a{" "}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    >
                      Política de Privacidade
                    </a>{" "}
                    e os{" "}
                    <a
                      href="https://policies.google.com/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    >
                      Termos de Serviço
                    </a>{" "}
                    do Google.
                  </p>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-golden to-golden-light hover:from-golden-light hover:to-golden text-secondary font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar Pedido de Oração
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrayerSection;
