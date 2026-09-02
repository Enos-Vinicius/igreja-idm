import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/services/api";

/**
 * Carregamento independente por card do dashboard.
 *
 * Duas particularidades da nossa API que este hook trata:
 *
 * 1. O plano free do Render hiberna após ~15 min sem tráfego, e a primeira
 *    requisição do dia leva ~40 s. Isso não é erro: dentro da janela de carga
 *    fria uma falha é repetida em vez de virar mensagem de erro na tela, e
 *    `isSlow` sinaliza para o card avisar que o servidor está acordando.
 * 2. Trocar o filtro não deve piscar skeleton. Enquanto a nova resposta não
 *    chega, `isRefreshing` mantém o render anterior em tela, com opacidade
 *    reduzida e sem salto de layout.
 */

const SLOW_HINT_MS = 8_000;
const COLD_START_MS = 60_000;
const RETRY_DELAY_MS = 3_000;

export interface DashboardResource<T> {
  data: T | null;
  error: string | null;
  /** Primeira carga: ainda não há nada para mostrar. */
  isLoading: boolean;
  /** Recarga com dado anterior em tela. */
  isRefreshing: boolean;
  /** Passou do limiar em que vale explicar a demora ao usuário. */
  isSlow: boolean;
  reload: () => void;
}

/** 4xx é resposta definitiva (papel sem permissão, parâmetro inválido): não repita. */
function isRetryable(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status >= 500;
  }
  // Falha de rede (fetch rejeitado) — típico de instância hibernando
  return true;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useDashboardResource<T>(
  fetcher: () => Promise<T>,
  deps: unknown[]
): DashboardResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // O fetcher é recriado a cada render; o efeito reage às deps declaradas.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const hasData = data !== null;

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    setIsFetching(true);
    setIsSlow(false);
    const slowTimer = setTimeout(() => {
      if (!cancelled) setIsSlow(true);
    }, SLOW_HINT_MS);

    const run = async () => {
      while (!cancelled) {
        try {
          const result = await fetcherRef.current();
          if (cancelled) return;
          setData(result);
          setError(null);
          return;
        } catch (err) {
          if (cancelled) return;

          const withinColdStart = Date.now() - startedAt < COLD_START_MS;
          if (withinColdStart && isRetryable(err)) {
            await sleep(RETRY_DELAY_MS);
            continue;
          }

          setError(err instanceof Error ? err.message : "Não foi possível carregar os dados");
          return;
        }
      }
    };

    run().finally(() => {
      clearTimeout(slowTimer);
      if (!cancelled) {
        setIsFetching(false);
        setIsSlow(false);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, ...deps]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return {
    data,
    error,
    isLoading: isFetching && !hasData,
    isRefreshing: isFetching && hasData,
    isSlow,
    reload,
  };
}
