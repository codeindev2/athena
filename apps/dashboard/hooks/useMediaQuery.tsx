import { useState, useEffect } from "react";

// Hook customizado para verificar a largura da tela
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) =>
      setMatches(event.matches);

    // Verifica inicialmente se a mídia query corresponde
    setMatches(mediaQuery.matches);

    // Adiciona o listener para mudanças na query
    mediaQuery.addEventListener("change", handleChange);

    // Remove o listener quando o componente é desmontado
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

// Hook para verificar se é desktop ou mobile
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}

export default useMediaQuery;
