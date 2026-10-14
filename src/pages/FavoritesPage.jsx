import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import Header from "@/components/Header";
import BeachCard from "@/components/BeachCard";
import { HomeCardSkeleton } from "@/components/Skeleton";
import StateMessage, { ErrorState } from "@/components/StateMessage";
import { useFavorites } from "@/hooks/useFavorites";
import { BEACHES_META, CONDITIONS } from "@/lib/constants";
import { fetchForecastAll } from "@/lib/api";
import { getCachedList, saveCachedList } from "@/lib/listCache";
import { getToday } from "@/lib/dates";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, loading: favLoading, error: favError, reload: reloadFavorites } = useFavorites();
  const [allBeaches, setAllBeaches] = useState(() => getCachedList(getToday()) ?? []);
  const [beachLoading, setBeachLoading] = useState(true);
  const [beachError, setBeachError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const currentHour = new Date().getHours();
  const todayIso = getToday();

  useEffect(() => {
    const controller = new AbortController();
    const cached = getCachedList(todayIso);
    if (cached) setAllBeaches(cached);
    setBeachLoading(!cached);
    setBeachError(false);

    fetchForecastAll(todayIso, controller.signal)
      .then(({ beaches, total, loaded }) => {
        setAllBeaches(beaches);
        setBeachLoading(false);
        if (loaded === total) saveCachedList(todayIso, beaches);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setBeachLoading(false);
        if (!getCachedList(todayIso)) setBeachError(true);
      });

    return () => controller.abort();
  }, [todayIso, retryCount]);

  const loading = favLoading || beachLoading;
  const favBeaches = allBeaches.filter((b) => favorites.has(b.beach));
  // Favoritos existem mas nenhum veio na resposta da API: trata como falha, não como lista vazia.
  const missingAll = !loading && !beachError && favorites.size > 0 && favBeaches.length === 0;
  const hasError = favError || beachError || missingAll;

  const retry = () => {
    if (favError) reloadFavorites();
    if (beachError || missingAll) setRetryCount((c) => c + 1);
  };

  const goToBeach = (beachName) => {
    const slug = BEACHES_META[beachName]?.slug;
    if (!slug) return;
    navigate(`/praia/${slug}`);
  };

  return (
    <div style={{ width: "100%", maxWidth: 680, margin: "0 auto", padding: "0 0 80px" }}>
      <Header
        variant="beach"
        title="Favoritos"
        onBack={() => navigate(-1)}
      />

      <div style={{ padding: "16px 16px 0" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            {[0, 1, 2].map((i) => <HomeCardSkeleton key={i} />)}
          </div>
        ) : hasError ? (
          <ErrorState onRetry={retry} />
        ) : favorites.size === 0 ? (
          <StateMessage icon={Heart} description="Nenhuma praia favoritada ainda." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            {favBeaches.map((b) => {
              const c = CONDITIONS[b.cond];
              const meta = BEACHES_META[b.beach];
              const h = b.hours?.[currentHour];
              return (
                <BeachCard
                  key={b.beach}
                  name={b.beach}
                  state={meta?.state}
                  country={meta?.country}
                  height={h?.height}
                  condition={b.cond}
                  label={c?.label}
                  onClick={() => goToBeach(b.beach)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
