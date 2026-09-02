import { ReactNode } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DashboardResource } from "@/hooks/useDashboardResource";

interface CardShellProps<T> {
  title: string;
  description?: string;
  icon?: ReactNode;
  resource: DashboardResource<T>;
  /** Ação opcional no cabeçalho (seletor de período, por exemplo). */
  action?: ReactNode;
  className?: string;
  children: (data: T) => ReactNode;
}

/**
 * Moldura de um card do dashboard: cabeçalho, carregamento próprio, erro com
 * "tentar de novo" e recarga sem piscar skeleton (o render anterior fica em
 * tela com opacidade reduzida, sem salto de layout).
 */
export function CardShell<T>({
  title,
  description,
  icon,
  resource,
  action,
  className,
  children,
}: CardShellProps<T>) {
  const { data, error, isLoading, isRefreshing, isSlow, reload } = resource;

  return (
    <Card className={cn("shadow-lg border-0", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              {icon}
              {title}
              {isRefreshing && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </CardTitle>
            {description && <CardDescription className="mt-1.5">{description}</CardDescription>}
          </div>
          {action}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-40 w-full" />
            {isSlow && (
              <p className="text-xs text-muted-foreground">
                O servidor hiberna quando fica sem uso; a primeira consulta do dia pode levar até um
                minuto.
              </p>
            )}
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-start gap-3 rounded-lg bg-muted/50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">Não foi possível carregar</p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={reload}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Tentar de novo
            </Button>
          </div>
        )}

        {data !== null && !error && (
          <div className={cn("transition-opacity", isRefreshing && "opacity-60")}>{children(data)}</div>
        )}
      </CardContent>
    </Card>
  );
}
