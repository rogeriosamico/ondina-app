import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFavorites, addFavorite, removeFavorite } from "@/lib/favorites";

export function useFavorites({ onUnauthenticated } = {}) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setFavorites(new Set());
      setError(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    getFavorites(user.id)
      .then((names) => { if (!cancelled) setFavorites(new Set(names)); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id, reloadCount]);

  const reload = useCallback(() => setReloadCount((c) => c + 1), []);

  const toggle = async (beachName) => {
    if (!user) { onUnauthenticated?.(); return; }
    const isFav = favorites.has(beachName);

    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(beachName);
      else next.add(beachName);
      return next;
    });

    try {
      if (isFav) await removeFavorite(user.id, beachName);
      else await addFavorite(user.id, beachName);
    } catch {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(beachName);
        else next.delete(beachName);
        return next;
      });
    }
  };

  return { favorites, loading, error, reload, toggle };
}
