import { useQuery } from "@tanstack/react-query";
import type { PageMeta } from "@shared/schema";

export function usePageMeta(pageSlug: string) {
  const { data: pages } = useQuery<PageMeta[]>({
    queryKey: ["/api/pages"],
  });

  return pages?.find(page => page.pageSlug === pageSlug) || null;
}
