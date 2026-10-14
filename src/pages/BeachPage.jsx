import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar, Info, MessageCircle, Send, Mail, ExternalLink, Check, Camera, Heart, ArrowUp, ArrowDown, Wind, Timer, Sun, Cloud, CloudRain, CloudLightning, Moon, CloudMoon, CloudMoonRain } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import AuthGateModal from "@/components/AuthGateModal";
import { BeachDetailSkeleton, DayCardSkeleton } from "@/components/Skeleton";
import TideChart from "@/components/TideChart";
import TimeSlider from "@/components/TimeSlider";
import SwellPowerBar from "@/components/SwellPowerBar";
import InfoBlock from "@/components/InfoBlock";
import DateFilterModal from "@/components/DateFilterModal";
import DayCard from "@/components/DayCard";
import { ErrorState } from "@/components/StateMessage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SLUG_TO_BEACH, CONDITIONS } from "@/lib/constants";
import { fetchForecast, fetchTide } from "@/lib/api";
import { getToday, getMaxDay, addDays, isValidDate, parseDateLabel, shortDateLabel, fmtHr, shortRangeLabel } from "@/lib/dates";
import { swellSegs } from "@/lib/swell";
import { parseTidePts, interpolateTideLevel } from "@/lib/tides";

function weatherIcon(code, isDay = true) {
  if (code == null)   return undefined;
  if (code <= 2)      return isDay ? <Sun size={20} /> : <Moon size={20} />;
  if (code <= 48)     return isDay ? <Cloud size={20} /> : <CloudMoon size={20} />;
  if (code <= 82)     return isDay ? <CloudRain size={20} /> : <CloudMoonRain size={20} />;
  return                     <CloudLightning size={20} />;
}

export default function BeachPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const beach = SLUG_TO_BEACH[slug];
  const todayIso = getToday();
  const maxIso = getMaxDay();
  const currentHour = new Date().getHours();

  const rawDate = searchParams.get("data");
  const pageDay = isValidDate(rawDate) ? rawDate : todayIso;

  const setPageDay = (day) => {
    if (day === todayIso) {
      setSearchParams({});
    } else {
      setSearchParams({ data: day });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [view, setView] = useState("hoje"); // "hoje" | "proximos"
  const [beachData, setBeachData] = useState(null);
  const [tideData, setTideData] = useState(null);
  const [tideError, setTideError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [nextDaysData, setNextDaysData] = useState(null);
  const [nextDaysLoading, setNextDaysLoading] = useState(false);
  const [nextDaysError, setNextDaysError] = useState(false);
  const [nextDaysRetry, setNextDaysRetry] = useState(0);
  const nextDaysCache = useRef({});
  const maxWeekStart = addDays(maxIso, -6);
  // A semana exibida acompanha o dia selecionado na aba "Dia" — sempre inclui pageDay,
  // recuando o suficiente para caber os 7 dias quando pageDay está perto do fim do range.
  const weekStart = pageDay < maxWeekStart ? pageDay : maxWeekStart;
  const [scrubHour, setScrubHour] = useState(currentHour);
  const { user, openAuthModal } = useAuth();
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGateIntent, setAuthGateIntent] = useState(null);
  const { favorites, loading: favLoading, toggle } = useFavorites({
    onUnauthenticated: () => {
      setAuthGateIntent('favorite');
      setAuthGateOpen(true);
    }
  });
  const [shareOpen, setShareOpen] = useState(false);
  const [copyConfirmed, setCopyConfirmed] = useState(false);
  const [igCopied, setIgCopied] = useState(false);
  const shareScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkShareScroll = () => {
    const el = shareScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    if (!beach) navigate("/", { replace: true });
  }, [beach, navigate]);

  useEffect(() => {
    if (!beach) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setBeachData(null);
    setTideData(null);
    setTideError(false);

    fetchForecast(beach, pageDay, controller.signal)
      .then(forecast => {
        setBeachData(forecast);
        setScrubHour(currentHour);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(true);
        setLoading(false);
      });

    fetchTide(pageDay, beach, controller.signal)
      .then(tide => setTideData(tide))
      .catch(err => { if (err.name !== "AbortError") setTideError(true); });

    return () => controller.abort();
  }, [beach, pageDay, currentHour, retryCount]);

  useEffect(() => {
    if (!beach || view !== "proximos") return;

    const cached = nextDaysCache.current[weekStart];
    if (cached) {
      setNextDaysData(cached);
      setNextDaysError(false);
      setNextDaysLoading(false);
      return;
    }

    const controller = new AbortController();
    setNextDaysLoading(true);
    setNextDaysError(false);
    setNextDaysData(null);

    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    Promise.all(days.map(day => fetchForecast(beach, day, controller.signal)))
      .then(results => {
        const data = days.map((day, i) => ({ date: day, cond: results[i]?.cond }));
        nextDaysCache.current[weekStart] = data;
        setNextDaysData(data);
        setNextDaysLoading(false);
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setNextDaysError(true);
        setNextDaysLoading(false);
      });

    return () => controller.abort();
  }, [beach, view, weekStart, nextDaysRetry]);

  useEffect(() => {
    if (!user || favLoading) return;
    const stored = localStorage.getItem('authIntent');
    if (!stored) return;
    try {
      const intent = JSON.parse(stored);
      if (intent.action === 'favorite' && intent.beachName === beach) {
        localStorage.removeItem('authIntent');
        toggle(intent.beachName);
      }
    } catch {
      localStorage.removeItem('authIntent');
    }
  }, [user, favLoading])

  const handleFavoritesAccess = () => {
    if (user) {
      navigate("/favoritos");
    } else {
      setAuthGateIntent('favoritos');
      setAuthGateOpen(true);
    }
  }

  const handleAuthGateConfirm = () => {
    setAuthGateOpen(false);
    if (authGateIntent === 'favoritos') {
      localStorage.setItem('authFrom', '/favoritos');
    } else {
      localStorage.setItem('authFrom', location.pathname + (location.search || ''));
      localStorage.setItem('authIntent', JSON.stringify({ action: 'favorite', beachName: beach }));
    }
    setAuthGateIntent(null);
    openAuthModal('login');
  }

  const handleAuthGateClose = () => {
    setAuthGateOpen(false);
    setAuthGateIntent(null);
  }

  const tidePts = useMemo(() => parseTidePts(tideData?.tides), [tideData]);
  const tideLevel = useMemo(
    () => tidePts.length > 0 ? interpolateTideLevel(tidePts, scrubHour) : null,
    [tidePts, scrubHour]
  );
  const prevTideLevel = useMemo(
    () => tidePts.length > 0 ? interpolateTideLevel(tidePts, Math.max(0, scrubHour - 0.5)) : null,
    [tidePts, scrubHour]
  );
  const tideTrend = (tideLevel != null && prevTideLevel != null)
    ? (tideLevel > prevTideLevel ? 'up' : 'down')
    : null;

  if (!beach) return null;

  const safeHour = Math.min(Math.floor(scrubHour), 23);
  const hourData = beachData?.hours?.[safeHour];
  const dayCond = beachData?.cond;
  const condColor = dayCond ? CONDITIONS[dayCond]?.color : "var(--text-secondary)";

  const shareUrl = window.location.href;

  const handleInstagramShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ondina', url: shareUrl });
        return;
      } catch { /* usuário cancelou ou share falhou */ }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIgCopied(true);
      setTimeout(() => setIgCopied(false), 2000);
    } catch { /* clipboard indisponível */ }
    window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyConfirmed(true);
      setTimeout(() => setCopyConfirmed(false), 2000);
    } catch {
      // clipboard indisponível
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 680, margin: "0 auto", padding: "0 0 80px" }}>
      <Header
        variant="beach"
        title={beach}
        onBack={() => navigate("/")}
        onFavorites={handleFavoritesAccess}
        onShare={() => setShareOpen(true)}
      />

      <Tabs value={view} onValueChange={setView}>
        <div style={{ padding: "var(--spacing-md) var(--spacing-md) 0" }}>
          <TabsList className="w-full h-[var(--touch-target)] p-1 rounded-[var(--radius-rounded)] bg-[var(--surface-terciary)] gap-1">
            <TabsTrigger
              value="hoje"
              className="flex-1 h-full rounded-[var(--radius-rounded)] text-button font-token-bold text-[var(--text-secondary)] data-[state=active]:bg-[var(--surface-secondary)] data-[state=active]:text-[var(--text-invert)]"
            >
              Dia
            </TabsTrigger>
            <TabsTrigger
              value="proximos"
              className="flex-1 h-full rounded-[var(--radius-rounded)] text-button font-token-bold text-[var(--text-secondary)] data-[state=active]:bg-[var(--surface-secondary)] data-[state=active]:text-[var(--text-invert)]"
            >
              Semana
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="hoje" className="mt-0">
          {/* Em erro, some a barra de condição/data — a tela fica só com o ErrorState */}
          {!error && <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--surface-primary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-md)", padding: "var(--spacing-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: condColor, flexShrink: 0 }} />
                  <span className="text-title-sm font-token-bold text-[var(--text-primary)] leading-none">
                    {CONDITIONS[dayCond]?.label}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-xs)", flexShrink: 0 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPageDay(addDays(pageDay, -1))}
                  disabled={pageDay <= todayIso}
                  className="h-[var(--touch-target)] w-[var(--touch-target)] border-[var(--border-primary)] bg-[var(--surface-primary)]"
                  aria-label="Dia anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <DateFilterModal
                  initialDate={pageDay}
                  onApply={day => setPageDay(day)}
                  trigger={
                    <Button
                      variant="outline"
                      aria-label={`Data: ${parseDateLabel(pageDay)}. Clique para alterar`}
                      className="text-button font-token-bold gap-[var(--spacing-sm)] px-[var(--spacing-md)] border-[1.5px] border-[var(--border-primary)] bg-[var(--surface-primary)] text-[var(--text-primary)] whitespace-nowrap h-[var(--touch-target)]"
                    >
                      <Calendar className="w-[18px] h-[18px] shrink-0 opacity-80" />
                      {shortDateLabel(pageDay)}
                    </Button>
                  }
                />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPageDay(addDays(pageDay, 1))}
                  disabled={pageDay >= maxIso}
                  className="h-[var(--touch-target)] w-[var(--touch-target)] border-[var(--border-primary)] bg-[var(--surface-primary)]"
                  aria-label="Próximo dia"
                >
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </Button>
              </div>
            </div>
          </div>}

          <div style={{ padding: "16px 16px 0" }}>
            {loading ? (
              <BeachDetailSkeleton />
            ) : error ? (
              <ErrorState onRetry={() => setRetryCount(c => c + 1)} />
            ) : beachData && hourData ? (

              <div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
                    <span className="text-headline font-token-bold text-[var(--text-primary)]">
                      Condições às {fmtHr(scrubHour)}
                    </span>
                    <Badge variant={hourData.cond} size="small">
                      {CONDITIONS[hourData.cond]?.label}
                    </Badge>
                  </div>


                </div>

                <div className="grid grid-cols-2 gap-[var(--spacing-sm)] mb-[var(--spacing-md)]">
                  <InfoBlock
                    label="Altura maré"
                    value={tideLevel != null ? `${tideLevel}m` : '—'}
                    icon={tideTrend ? (tideTrend === 'up' ? <ArrowUp size={20} /> : <ArrowDown size={20} />) : undefined}
                  />
                  <InfoBlock
                    label="Vento"
                    value={`${hourData.windSpeed} km/h`}
                    icon={
                      <span className="flex items-center gap-1">
                        <Wind size={18} />
                        <span className="text-token-subtitle-bold">{hourData.windDir}</span>
                      </span>
                    }
                  />
                  <InfoBlock
                    label="Período"
                    value={`${hourData.swellPeriod}s`}
                    icon={<Timer size={20} />}
                  />
                  <InfoBlock
                    label="Clima"
                    value={hourData.temperature != null ? `${hourData.temperature}°C` : '—'}
                    icon={weatherIcon(hourData.weatherCode, hourData.isDay)}
                  />
                </div>

                <SwellPowerBar
                  value={swellSegs(hourData.swellKj)}
                  label={`${hourData.swellKj} Kj`}
                />

                {tideError ? (
                  <div style={{ display: "flex", alignItems: "center", borderRadius: "var(--radius-minimal)", background: "var(--surface-terciary)", marginBottom: "var(--spacing-xs)" }}>
                    <Info className="w-[14px] h-[14px] shrink-0 opacity-40" />
                    <span style={{ fontSize: "var(--font-size-subtitle)", color: "var(--text-secondary)" }}>
                      Dados de maré temporariamente indisponíveis.
                    </span>
                  </div>
                ) : tideData ? (
                  <div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-[var(--radius-minimal)] p-[var(--spacing-md)] mt-4">
                    <span className="text-subtitle font-token-regular text-[var(--text-secondary)] block mb-3">Maré</span>
                    <TideChart tides={tideData?.tides} currentHour={scrubHour} />
                    <div className="mt-1">
                      <TimeSlider value={scrubHour} onChange={setScrubHour} />
                    </div>
                  </div>
                ) : null}

              </div>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="proximos" className="mt-0">
          <div style={{ padding: "16px 16px 0" }}>
            {!nextDaysError && <div className="flex items-center gap-[var(--spacing-xs)] mb-[var(--spacing-md)]">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPageDay(addDays(weekStart, -1))}
                disabled={weekStart <= todayIso}
                className="h-[var(--touch-target)] w-[var(--touch-target)] border-[var(--border-primary)] bg-[var(--surface-primary)] shrink-0"
                aria-label="Semana anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex-1 flex items-center justify-center gap-[var(--spacing-sm)] h-[var(--touch-target)] px-[var(--spacing-md)] border-[1.5px] border-[var(--border-primary)] rounded-[var(--radius-minimal)] bg-[var(--surface-primary)]">
                <Calendar className="w-[18px] h-[18px] shrink-0 opacity-80 text-[var(--text-primary)]" />
                <span className="text-button font-token-bold text-[var(--text-primary)] whitespace-nowrap">
                  {shortRangeLabel(weekStart, addDays(weekStart, 6))}
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setPageDay(addDays(weekStart, 1))}
                disabled={weekStart >= maxWeekStart}
                className="h-[var(--touch-target)] w-[var(--touch-target)] border-[var(--border-primary)] bg-[var(--surface-primary)] shrink-0"
                aria-label="Próxima semana"
              >
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </Button>
            </div>}

            {nextDaysLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                {Array.from({ length: 7 }).map((_, i) => <DayCardSkeleton key={i} />)}
              </div>
            ) : nextDaysError ? (
              <ErrorState onRetry={() => setNextDaysRetry(c => c + 1)} />
            ) : nextDaysData ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                {nextDaysData.map(({ date, cond }) => (
                  <DayCard
                    key={date}
                    dateIso={date}
                    condition={cond}
                    label={CONDITIONS[cond]?.label}
                    onClick={() => { setView("hoje"); setPageDay(date); }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>

      {!(view === "hoje" ? error : nextDaysError) && <div style={{ padding: "24px 16px 0" }}>
        <Button
          className="w-full h-12 rounded-[var(--radius-minimal)] gap-2"
          onClick={() => toggle(beach)}
          aria-label={favorites.has(beach) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            size={18}
            fill={favorites.has(beach) ? 'currentColor' : 'none'}
          />
          {favorites.has(beach) ? 'Praia favoritada' : 'Favoritar praia'}
        </Button>
      </div>}

      <AuthGateModal
        open={authGateOpen}
        onClose={handleAuthGateClose}
        onConfirm={handleAuthGateConfirm}
        title="Entre ou crie sua conta"
        description="É grátis. Guarde suas praias favoritas e acesse de qualquer lugar, quando quiser."
        ctaLabel="Entrar ou cadastrar"
      />

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-[380px] p-6 gap-0 overflow-hidden">
          <DialogHeader className="mb-6">
            <DialogTitle>Compartilhar</DialogTitle>
            <DialogDescription>
              Compartilhe com seus amigos e mostre se vale a pena ir surfar hoje.
            </DialogDescription>
          </DialogHeader>

          <div className="relative flex items-center mb-6 min-w-0">
            {canScrollLeft && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareScrollRef.current?.scrollBy({ left: -140, behavior: 'smooth' })}
                className="shrink-0 rounded-full"
              >
                <ChevronLeft size={16} />
              </Button>
            )}
            <div
              ref={(el) => { shareScrollRef.current = el; if (el) checkShareScroll(); }}
              onScroll={checkShareScroll}
              className="flex gap-2 overflow-x-auto scrollbar-none flex-1 min-w-0"
            >
              {[
                { id: 'whatsapp',   label: 'WhatsApp',                       icon: <MessageCircle size={16} />, href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`, target: '_blank' },
                { id: 'instagram',  label: igCopied ? 'Link copiado!' : 'Instagram', icon: <Camera size={16} />, onClick: handleInstagramShare },
                { id: 'telegram',   label: 'Telegram',                       icon: <Send size={16} />,           href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`, target: '_blank' },
                { id: 'email',      label: 'E-mail',                         icon: <Mail size={16} />,           href: `mailto:?subject=${encodeURIComponent(`Ondina — ${beach}`)}&body=${encodeURIComponent(shareUrl)}`, target: undefined },
                { id: 'facebook',   label: 'Facebook',                       icon: <ExternalLink size={16} />,   href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, target: '_blank' },
                { id: 'x',          label: 'X',                              icon: <ExternalLink size={16} />,   href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareUrl)}`, target: '_blank' },
              ].map(({ id, label, icon, href, target, onClick }) => (
                href
                  ? (
                    <a key={id} href={href} target={target} rel={target ? 'noopener noreferrer' : undefined} className="shrink-0">
                      <Button variant="outline" className="h-[var(--touch-target)] gap-2 whitespace-nowrap">
                        {icon}{label}
                      </Button>
                    </a>
                  ) : (
                    <Button key={id} variant="outline" onClick={onClick} className="shrink-0 h-[var(--touch-target)] gap-2 whitespace-nowrap">
                      {icon}{label}
                    </Button>
                  )
              ))}
            </div>
            {canScrollRight && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareScrollRef.current?.scrollBy({ left: 140, behavior: 'smooth' })}
                className="shrink-0 rounded-full"
              >
                <ChevronRight size={16} />
              </Button>
            )}
          </div>

          <div className="h-px bg-[var(--border-primary)] mb-6" />

          <Input
            readOnly
            value={shareUrl}
            className="mb-3 text-[var(--text-secondary)] bg-[var(--surface-terciary)] border-[var(--border-primary)] cursor-default"
            onClick={(e) => e.target.select()}
          />
          <Button
            onClick={handleCopyLink}
            className="w-full h-12 gap-2"
          >
            {copyConfirmed ? <><Check size={16} /> Copiado!</> : "Copiar link"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
