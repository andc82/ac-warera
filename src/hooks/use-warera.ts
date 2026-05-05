import { useQuery } from "@tanstack/react-query";
import { callWarEra } from "@/lib/warera-api";
import { useAuth } from "@/lib/auth-context";

export function useWarEra<T = unknown>(
  endpoint: string | null,
  body: Record<string, unknown> = {},
  opts: { enabled?: boolean; staleTime?: number } = {},
) {
  const { profile } = useAuth();
  const apiKey = profile?.api_key ?? null;
  return useQuery<T>({
    queryKey: ["warera", endpoint, body, apiKey],
    queryFn: () => callWarEra<T>(endpoint!, body, apiKey),
    enabled: !!endpoint && (opts.enabled ?? true),
    staleTime: opts.staleTime ?? 30_000,
  });
}
