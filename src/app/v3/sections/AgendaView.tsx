/**
 * AgendaView.tsx — Section Agenda V3
 *
 * Calendrier 3 vues (jour/semaine/mois) avec LivingHero animé.
 * Copie exacte du calendrier de MonBureauView.tsx L1548-1855
 * Intégré dans le panel droit via WorkspacePhasesPanel.
 */

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../components/ui/utils";
import { LivingHero } from "./shared/LivingHero";
import { api } from "../../v2/api/client";


interface AgendaViewProps {
  botCode: string;
  showHeader?: boolean;
  onAction?: (phase: string, context?: string) => void;
}

const BOT_GRADIENT: Record<string, string> = {
  CEOB: "bg-blue-500", CTOB: "bg-violet-500", CFOB: "bg-emerald-500", CMOB: "bg-pink-500",
  CSOB: "bg-red-500", COOB: "bg-orange-500", CPOB: "bg-slate-500", CHROB: "bg-teal-500",
  CINOB: "bg-rose-500", CROB: "bg-amber-500", CLOB: "bg-indigo-500", CISOB: "bg-zinc-500",
};

const JOURS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MOIS = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];
const HEURES = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export function AgendaView({ botCode, showHeader, onAction }: AgendaViewProps) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [agendaViewMode, setAgendaViewMode] = useState<"jour" | "semaine" | "mois">("semaine");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper: YYYY-MM-DD
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Compute visible range based on view mode + currentDate
  const getWeekStartFn = (d: Date) => {
    const s = new Date(d); const day = s.getDay();
    s.setDate(s.getDate() + (day === 0 ? -6 : 1 - day));
    s.setHours(0, 0, 0, 0); return s;
  };
  const visibleRange = useMemo(() => {
    if (agendaViewMode === "jour") {
      return { start: fmt(currentDate), end: fmt(currentDate) };
    } else if (agendaViewMode === "semaine") {
      const ws = getWeekStartFn(currentDate);
      const we = new Date(ws.getTime() + 6 * 86400000);
      return { start: fmt(ws), end: fmt(we) };
    } else {
      const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const last = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return { start: fmt(first), end: fmt(last) };
    }
  }, [agendaViewMode, currentDate]);

  // Fetch meetings on mount
  useEffect(() => {
    api.meetingList().then((r) => setMeetings(Array.isArray(r?.meetings) ? r.meetings : []))
      .catch(() => {}).finally(() => setLoadingMeetings(false));
  }, []);

  // Fetch calendar events for visible range
  useEffect(() => {
    setLoadingCalendar(true);
    api.calendarRange(visibleRange.start, visibleRange.end).then((r) => {
      const evts = Array.isArray(r?.events) ? r.events : [];
      setCalendarEvents(evts);
    }).catch(() => {
      setCalendarEvents([]);
    }).finally(() => setLoadingCalendar(false));
  }, [visibleRange.start, visibleRange.end]);

  // Merge all events into unified format
  const allEvents = useMemo(() => {
    const events: { id: string; titre: string; heure: string; hourNum: number; date: Date; bot: string; duree: string; source: string }[] = [];

    meetings.forEach((m: any) => {
      const d = m.created_at ? new Date(m.created_at) : new Date();
      const h = d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
      events.push({ id: m.slug || m.id, titre: m.title || m.slug, heure: h, hourNum: d.getHours(), date: d, bot: m.bot_code || "CEOB", duree: m.meeting_type || "meeting", source: "meeting" });
    });

    calendarEvents.forEach((c: any, idx: number) => {
      if (typeof c === "string") {
        const match = c.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})\s+(.+)$/);
        if (match) {
          const hourStart = parseInt(match[1]);
          const minuteStart = match[2];
          const hourEnd = parseInt(match[3]);
          const minuteEnd = match[4];
          const titre = match[5];
          const dureeMin = (hourEnd * 60 + parseInt(minuteEnd)) - (hourStart * 60 + parseInt(minuteStart));
          const d = new Date(); d.setHours(hourStart, parseInt(minuteStart), 0, 0);
          events.push({ id: `gcal-${idx}`, titre, heure: `${match[1]}:${minuteStart}`, hourNum: hourStart, date: d, bot: "CEOB", duree: dureeMin > 0 ? `${dureeMin} min` : "", source: "google" });
        }
      } else {
        const d = c.start ? new Date(c.start) : (c.date ? new Date(c.date + "T00:00:00") : new Date());
        const h = d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
        const endD = c.end ? new Date(c.end) : null;
        const dureeMin = endD ? Math.round((endD.getTime() - d.getTime()) / 60000) : 0;
        events.push({ id: `gcal-${idx}`, titre: c.summary || "Événement", heure: h, hourNum: d.getHours(), date: d, bot: "CEOB", duree: dureeMin > 0 ? `${dureeMin} min` : "", source: "google" });
      }
    });

    return events;
  }, [meetings, calendarEvents]);

  // Navigation helpers
  const navPrev = () => {
    const d = new Date(currentDate);
    if (agendaViewMode === "jour") d.setDate(d.getDate() - 1);
    else if (agendaViewMode === "semaine") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };
  const navNext = () => {
    const d = new Date(currentDate);
    if (agendaViewMode === "jour") d.setDate(d.getDate() + 1);
    else if (agendaViewMode === "semaine") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };
  const goToday = () => setCurrentDate(new Date());

  const getWeekStart = getWeekStartFn;

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isToday = (d: Date) => isSameDay(d, new Date());

  const eventsForDay = (day: Date) => allEvents.filter(e => isSameDay(e.date, day));

  const viewTitle = agendaViewMode === "jour"
    ? `${JOURS[currentDate.getDay()]} ${currentDate.getDate()} ${MOIS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : agendaViewMode === "semaine"
    ? (() => { const ws = getWeekStart(currentDate); const we = new Date(ws.getTime() + 6 * 86400000); return `${ws.getDate()} - ${we.getDate()} ${MOIS[we.getMonth()]} ${we.getFullYear()}`; })()
    : `${MOIS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const EventBlock = ({ ev, compact = false }: { ev: typeof allEvents[0]; compact?: boolean }) => (
    <div className={cn("rounded-md px-2 py-1.5 text-white text-[9px] font-bold truncate cursor-pointer hover:opacity-80 transition-opacity shadow-sm", BOT_GRADIENT[ev.bot] || "bg-blue-500")}
      title={`${ev.titre} — ${ev.heure} (${ev.duree})`}>
      {compact ? ev.titre : <><span className="opacity-80">{ev.heure}</span> {ev.titre}</>}
      {ev.duree && !compact && <span className="opacity-70 ml-1">({ev.duree})</span>}
    </div>
  );

  const isLoading = loadingMeetings || loadingCalendar;

  return (
    <div className="space-y-3">
      {/* ═══ HERO V20 — Agenda Clock + Timeline ═══ */}
      <LivingHero blur1="bg-rose-100/70" blur2="bg-red-100/40" subtitleColor="text-rose-600" subtitle="Synchronisation Totale" title="La maîtrise absolue de votre temps." description="Synchronisez vos équipes et vos bots sur une frise temporelle parfaite.">
        <div className="relative flex items-center justify-end" style={{ width: 360, height: 140 }}>
          <div className="absolute right-[20px] opacity-[0.15] text-rose-600">
            <svg viewBox="0 0 100 100" className="w-36 h-36">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" className="anim-clock-outer"/>
              <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <line x1="50" y1="50" x2="50" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="anim-clock-inner" style={{ transformOrigin: '50px 50px' }}/>
              <circle cx="50" cy="50" r="3" fill="currentColor"/>
            </svg>
          </div>
          <div className="glass-base absolute right-[80px] top-[20px] w-56 h-24 p-4 border-rose-100 overflow-hidden">
            <div className="absolute top-[35px] left-4 w-12 h-6 bg-rose-100/50 rounded border border-rose-200" />
            <div className="absolute top-[50px] left-[80px] w-16 h-6 bg-red-50/50 rounded border border-red-200" />
            <div className="absolute top-0 bottom-0 w-px bg-rose-500 shadow-[0_0_15px_#f43f5e] anim-ticker flex justify-center z-10">
              <div className="w-2 h-2 rounded-full bg-rose-500 -mt-1" />
            </div>
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" />
            <div className="absolute inset-x-0 bottom-2 flex justify-between px-4 opacity-30 text-[6px] font-mono font-bold text-slate-800">
              <span>08:00</span><span>12:00</span><span>16:00</span>
            </div>
          </div>
        </div>
      </LivingHero>

      {/* TOOLBAR — navigation date + vue toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={navPrev} className="px-2 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">&lt;</button>
        <button onClick={goToday} className="px-2.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer">Aujourd'hui</button>
        <button onClick={navNext} className="px-2 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">&gt;</button>
        <span className="text-xs font-bold text-gray-700 flex-1">{viewTitle}</span>

        {/* View mode toggle — Jour / Semaine / Mois */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
          {(["jour", "semaine", "mois"] as const).map(mode => (
            <button key={mode} onClick={() => setAgendaViewMode(mode)}
              className={cn("px-3 py-1.5 text-[9px] font-bold transition-colors cursor-pointer capitalize",
                agendaViewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:text-gray-700")}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      )}

      {/* Aucun evenement */}
      {!isLoading && allEvents.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-xs">Aucun evenement pour cette periode</div>
      )}

      {/* ══ VUE JOUR — grille horaire verticale ══ */}
      {!isLoading && agendaViewMode === "jour" && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {HEURES.map(h => {
            const dayEvents = eventsForDay(currentDate).filter(e => e.hourNum === h);
            return (
              <div key={h} className="flex border-b border-gray-100 min-h-[40px]">
                <div className="w-14 shrink-0 text-[9px] font-bold text-gray-400 text-right pr-2 py-2 bg-gray-50 border-r border-gray-200">
                  {String(h).padStart(2, "0")}:00
                </div>
                <div className="flex-1 px-2 py-1 space-y-0.5">
                  {dayEvents.map(ev => <EventBlock key={ev.id} ev={ev} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ VUE SEMAINE — 7 colonnes avec heures ══ */}
      {!isLoading && agendaViewMode === "semaine" && (() => {
        const weekStart = getWeekStart(currentDate);
        const weekDays = Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * 86400000));
        return (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header row — jours */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <div className="w-14 shrink-0 border-r border-gray-200" />
              {weekDays.map((d, i) => (
                <div key={i} className={cn("flex-1 text-center py-2 border-r border-gray-100 last:border-r-0",
                  isToday(d) && "bg-blue-50")}>
                  <div className="text-[9px] font-bold text-gray-500">{JOURS[(i + 1) % 7]}</div>
                  <div className={cn("text-xs font-bold", isToday(d) ? "text-blue-600" : "text-gray-700")}>{d.getDate()}</div>
                </div>
              ))}
            </div>
            {/* Hour rows */}
            {HEURES.map(h => (
              <div key={h} className="flex border-b border-gray-100 min-h-[36px]">
                <div className="w-14 shrink-0 text-[9px] font-bold text-gray-400 text-right pr-2 py-1 bg-gray-50 border-r border-gray-200">
                  {String(h).padStart(2, "0")}:00
                </div>
                {weekDays.map((d, i) => {
                  const dayEv = eventsForDay(d).filter(e => e.hourNum === h);
                  return (
                    <div key={i} className={cn("flex-1 px-0.5 py-0.5 border-r border-gray-100 last:border-r-0 space-y-0.5",
                      isToday(d) && "bg-blue-50/30")}>
                      {dayEv.map(ev => <EventBlock key={ev.id} ev={ev} compact />)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })()}

      {/* ══ VUE MOIS — grille calendrier classique ══ */}
      {!isLoading && agendaViewMode === "mois" && (() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const totalDays = lastDay.getDate();
        const weeks: Date[][] = [];
        let week: Date[] = [];
        for (let i = 0; i < startOffset; i++) {
          const d = new Date(year, month, 1 - startOffset + i);
          week.push(d);
        }
        for (let d = 1; d <= totalDays; d++) {
          week.push(new Date(year, month, d));
          if (week.length === 7) { weeks.push(week); week = []; }
        }
        if (week.length > 0) {
          let nextDay = 1;
          while (week.length < 7) { week.push(new Date(year, month + 1, nextDay++)); }
          weeks.push(week);
        }
        return (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(j => (
                <div key={j} className="text-center py-2 text-[9px] font-bold text-gray-500">{j}</div>
              ))}
            </div>
            {weeks.map((w, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0">
                {w.map((d, di) => {
                  const inMonth = d.getMonth() === month;
                  const dayEv = eventsForDay(d);
                  return (
                    <div key={di} className={cn("min-h-[60px] p-1 border-r border-gray-100 last:border-r-0",
                      !inMonth && "bg-gray-50/50", isToday(d) && "bg-blue-50")}>
                      <div className={cn("text-[9px] font-bold mb-0.5",
                        isToday(d) ? "text-blue-600" : inMonth ? "text-gray-700" : "text-gray-300")}>
                        {d.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {dayEv.slice(0, 3).map(ev => <EventBlock key={ev.id} ev={ev} compact />)}
                        {dayEv.length > 3 && <div className="text-[8px] text-gray-400 font-medium">+{dayEv.length - 3} autres</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
