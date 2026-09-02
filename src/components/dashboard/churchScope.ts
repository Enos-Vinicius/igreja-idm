/**
 * Recorte de igreja compartilhado entre o filtro e os cards.
 *
 * Fica fora do arquivo do componente porque é constante e função, não
 * componente — misturar os dois quebra o fast refresh do Vite.
 */

/** Sentinela do seletor: Radix não aceita item com valor vazio. */
export const ALL_CHURCHES = "todas";

/** Converte a seleção do filtro no parâmetro ?church= (undefined = ambas). */
export function toChurchParam(value: string): string | undefined {
  return value === ALL_CHURCHES ? undefined : value;
}
