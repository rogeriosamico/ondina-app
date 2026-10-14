import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar } from "lucide-react";
import Header from "@/components/Header";
import AuthGateModal from "@/components/AuthGateModal";
import { useAuth } from "@/context/AuthContext";
import { HomeCardSkeleton } from "@/components/Skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BeachCard from "@/components/BeachCard";
import StateMessage, { ErrorState } from "@/components/StateMessage";
import DateFilterModal from "@/components/DateFilterModal";
import { BEACHES, BEACHES_META, CONDITIONS, COND_DESCS, COND_ORDER } from "@/lib/constants";
import { fetchForecastAll } from "@/lib/api";
import { getToday, parseDateLabel } from "@/lib/dates";
import { getCachedList, saveCachedList } from "@/lib/listCache";
import { useGeolocation } from "@/hooks/useGeolocation";
import { haversineKm } from "@/lib/geo";

export default function HomeScreen() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const currentHour = new Date().getHours();
  const todayIso = getToday();
  const { status: geoStatus, coords, cityLabel } = useGeolocation();

  const [query, setQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState(() => {
    const saved = sessionStorage.getItem("selected_day");
    return saved && saved >= todayIso ? saved : todayIso;
  });
  const [rawBeaches, setRawBeaches] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    sessionStorage.setItem("selected_day", selectedDay);
  }, [selectedDay]);

  useEffect(() => {
    const controller = new AbortController();

    const cached = getCachedList(selectedDay);
    if (cached) {
      setRawBeaches(cached);
      setListLoading(false);
    } else {
      setListLoading(true);
      setRawBeaches([]);
    }
    setError(false);

    fetchForecastAll(selectedDay, controller.signal)
      .then(({ beaches, total, loaded }) => {
        setRawBeaches(beaches);
        setListLoading(false);
        if (loaded === total) saveCachedList(selectedDay, beaches);
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setListLoading(false);
        if (!getCachedList(selectedDay)) setError(true);
      });

    return () => controller.abort();
  }, [selectedDay, retryCount]);

  const sortedBeaches = [...rawBeaches].sort((a, b) => {
    if (coords) {
      const ma = BEACHES_META[a.beach], mb = BEACHES_META[b.beach];
      const distDiff =
        haversineKm(coords.lat, coords.lng, ma.lat, ma.lng) -
        haversineKm(coords.lat, coords.lng, mb.lat, mb.lng);
      if (distDiff !== 0) return distDiff;
    }
    return (COND_ORDER[a.cond] ?? 99) - (COND_ORDER[b.cond] ?? 99);
  });

  const filtered = query.trim()
    ? sortedBeaches.filter(b => b.beach.toLowerCase().includes(query.trim().toLowerCase()))
    : sortedBeaches;

  const goToBeach = (beachName) => {
    const slug = BEACHES_META[beachName]?.slug;
    if (!slug) return;
    const params = selectedDay !== todayIso ? `?data=${selectedDay}` : "";
    navigate(`/praia/${slug}${params}`);
  };

  return (
    <div style={{ width: "100%", maxWidth: 680, margin: "0 auto", padding: "40px 16px 80px" }}>
      <Header
        variant={geoStatus === "granted" ? "location" : "default"}
        locationLabel={cityLabel}
        onFavorites={() => {
          if (user) {
            navigate("/favoritos");
          } else {
            setAuthGateOpen(true);
          }
        }}
      />

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <div style={{ display: "flex", gap: "var(--spacing-sm)", marginBottom: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", zIndex: 1 }} />
            <Input
              type="text"
              placeholder="Buscar praia..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Buscar praia"
              className="pl-11 h-12"
              style={{ borderRadius: "var(--radius-minimal)" }}
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)" }}
              >
                ×
              </Button>
            )}
          </div>

          <DateFilterModal
            initialDate={selectedDay}
            onApply={day => setSelectedDay(day)}
            trigger={
              <Button aria-label="Filtrar por data" size="xl" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data
              </Button>
            }
          />
        </div>
        <div style={{ fontSize: "var(--font-size-body)", color: "var(--text-secondary)" }}>
          Exibindo resultados para:{" "}
          <span style={{ color: "var(--text-primary)", fontWeight: "var(--font-weight-bold)" }}>
            {parseDateLabel(selectedDay)}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
        {listLoading && rawBeaches.length === 0
          ? BEACHES.map((_, i) => <HomeCardSkeleton key={i} />)
          : error && rawBeaches.length === 0
            ? (
              <ErrorState onRetry={() => setRetryCount(c => c + 1)} />
            )
            : filtered.length === 0
              ? <StateMessage icon={Search} description="Nenhuma praia encontrada." compact />
              : filtered.map(b => {
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
              })
        }
      </div>

      <div style={{ marginTop: 48 }}>
        <div style={{ height: 1, background: "var(--border-primary)", marginBottom: "var(--spacing-md)" }} />
        <div style={{ display: "flex", gap: "var(--spacing-sm)", flexWrap: "wrap" }}>
          {Object.entries(CONDITIONS).map(([key, c]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: "var(--font-size-subtitle)", color: "var(--text-secondary)" }}>
                {c.label} — {COND_DESCS[key]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AuthGateModal
        open={authGateOpen}
        onClose={() => setAuthGateOpen(false)}
        onConfirm={() => {
          setAuthGateOpen(false);
          localStorage.setItem('authFrom', '/favoritos');
          openAuthModal('login');
        }}
        title="Entre ou crie sua conta"
        description="É grátis. Guarde suas praias favoritas e acesse de qualquer lugar, quando quiser."
        ctaLabel="Entrar ou cadastrar"
      />
    </div>
  );
}
