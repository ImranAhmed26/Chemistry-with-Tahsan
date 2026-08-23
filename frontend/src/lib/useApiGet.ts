"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

type Status = "loading" | "idle" | "error";

export function useApiGet<T>(
  path: string | null,
  query?: Record<string, string | number | boolean | undefined | null>
) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const queryKey = JSON.stringify(query ?? {});

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    if (!path) {
      return;
    }
    let cancelled = false;
    // Kicking off a fetch needs to synchronously flip to the loading state;
    // this is the standard data-fetching effect pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("loading");
    setError(null);
    api
      .get<T>(path, query)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setStatus("idle");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, queryKey, reloadToken]);

  return { data, loading: path !== null && status === "loading", error, refetch };
}
