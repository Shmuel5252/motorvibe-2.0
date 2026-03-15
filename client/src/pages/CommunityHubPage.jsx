/**
 * CommunityHubPage — מרכז פעילות הקהילה של MotoVibe.
 *
 * שני טאבים:
 *   1. מסלולי הקהילה  — GET /api/routes/public  (סינון לפי type/difficulty/isTwisty)
 *   2. רכיבות קבוצתיות — GET /api/events         (הצטרפות עם POST /api/events/:id/join)
 *
 * ניהול state מקומי בלבד — לא מזהם את useAppState הגלובלי.
 */

import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Users,
  Calendar,
  Navigation,
  Zap,
  RefreshCw,
  CalendarPlus,
  X,
  Map,
  Bike,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";
import Button from "../app/ui/components/Button";
import GlassCard from "../app/ui/components/GlassCard";

/* ─── קבועים ─── */

const ROUTE_TYPES = ["הכל", "עירוני", "בין־עירוני", "שטח", "נוף"];
const DIFFICULTIES = ["הכל", "קל", "בינוני", "קשה"];

const DIFFICULTY_STYLE = {
  קל: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  בינוני: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  קשה: "text-red-400 bg-red-400/10 border-red-400/30",
};

/* ─── רכיבי עזר ─── */

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1 text-xs font-medium transition",
        active
          ? "bg-teal-500/20 border-teal-400/60 text-teal-300"
          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 rounded-lg py-2 text-sm font-semibold transition",
        active
          ? "bg-linear-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20"
          : "text-slate-400 hover:text-slate-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
    </div>
  );
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-sm text-red-400">{message}</p>
      {onRetry && (
        <Button variant="ghost" size="md" onClick={onRetry}>
          <RefreshCw size={14} className="ml-1.5" />
          נסה שוב
        </Button>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-500">
      <Bike size={36} className="text-slate-600" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

/* ─── כרטיסיית מסלול ─── */

function RouteCard({ route, onViewRoute }) {
  const diffStyle =
    DIFFICULTY_STYLE[route.difficulty] ??
    "text-slate-400 bg-white/5 border-white/10";

  return (
    <GlassCard className="flex flex-col gap-3">
      {/* כותרת + תג קושי */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug text-slate-100">
          {route.title}
        </h3>
        {route.difficulty && (
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${diffStyle}`}
          >
            {route.difficulty}
          </span>
        )}
      </div>

      {/* מטא-דאטה */}
      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        {route.distanceKm != null && (
          <span className="flex items-center gap-1">
            <Navigation size={12} />
            {route.distanceKm.toFixed(1)} ק&quot;מ
          </span>
        )}
        {route.etaMinutes != null && (
          <span className="flex items-center gap-1">
            <span>⏱</span>~{route.etaMinutes} דק'
          </span>
        )}
        {route.routeType && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
            {route.routeType}
          </span>
        )}
        {route.isTwisty && (
          <span className="flex items-center gap-1 text-teal-300">
            <Zap size={12} />
            מפותל
          </span>
        )}
      </div>

      <Button
        variant="ghost"
        size="md"
        className="mt-auto w-full"
        onClick={() => onViewRoute(route)}
      >
        צפייה במסלול
      </Button>
    </GlassCard>
  );
}

/* ─── כרטיסיית אירוע רכיבה ─── */

function EventCard({
  event,
  authToken,
  apiClient,
  onJoined,
  onDeleted,
  currentUserId,
}) {
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [participantCount, setParticipantCount] = useState(
    event.participants?.length ?? 0,
  );

  /* ── edit state ── */
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTitle, setEditTitle] = useState(event.title);
  const [editDate, setEditDate] = useState(() => {
    const d = new Date(event.scheduledAt);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [editDesc, setEditDesc] = useState(event.description ?? "");
  const [editMax, setEditMax] = useState(event.maxParticipants ?? "");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);

  /* ── delete state ── */
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const organizerId = String(event.organizer?._id ?? event.organizer ?? "");
  const isOrganizer = !!currentUserId && organizerId === String(currentUserId);

  const isFull =
    event.maxParticipants !== null &&
    event.maxParticipants !== undefined &&
    participantCount >= event.maxParticipants;
  const isOpen = event.status === "open";

  const remaining =
    event.maxParticipants != null
      ? Math.max(0, event.maxParticipants - participantCount)
      : null;

  const remainingColor =
    remaining === null
      ? ""
      : remaining === 0
        ? "text-red-400 border-red-400/30 bg-red-400/10"
        : remaining <= 3
          ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
          : "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";

  const scheduledDate = new Date(event.scheduledAt);
  const dateStr = scheduledDate.toLocaleDateString("he-IL", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
  const timeStr = scheduledDate.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusLabel =
    event.status === "open"
      ? "פתוח"
      : event.status === "cancelled"
        ? "בוטל"
        : "הסתיים";
  const statusStyle =
    event.status === "open"
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
      : "text-slate-400 bg-white/5 border-white/10";

  const handleJoin = async () => {
    if (!authToken) {
      setJoinError("עליך להתחבר כדי להצטרף לרכיבה");
      return;
    }
    setIsJoining(true);
    setJoinError(null);
    try {
      const { data } = await apiClient.post(
        `/events/${event._id}/join`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } },
      );
      setParticipantCount(data.participantCount ?? participantCount + 1);
      setJoinSuccess(true);
      onJoined?.();
    } catch (err) {
      const code = err?.response?.data?.error?.code;
      if (code === "ALREADY_JOINED") setJoinError("כבר הצטרפת לרכיבה זו");
      else if (code === "EVENT_FULL") setJoinError("האירוע מלא");
      else if (code === "EVENT_NOT_OPEN")
        setJoinError("האירוע לא פתוח להצטרפות");
      else if (code === "EVENT_PAST") setJoinError("האירוע כבר עבר");
      else setJoinError("שגיאה בהצטרפות, נסה שוב");
    } finally {
      setIsJoining(false);
    }
  };

  const handleEdit = async () => {
    if (!editTitle.trim()) {
      setEditError("כתוב שם לרכיבה");
      return;
    }
    if (!editDate) {
      setEditError("בחר תאריך ושעה");
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      await apiClient.patch(
        `/events/${event._id}`,
        {
          title: editTitle.trim(),
          scheduledAt: new Date(editDate).toISOString(),
          description: editDesc.trim() || "",
          maxParticipants: editMax !== "" ? Number(editMax) : null,
        },
        { headers: { Authorization: `Bearer ${authToken}` } },
      );
      setEditSuccess(true);
      setTimeout(() => {
        setShowEditForm(false);
        setEditSuccess(false);
        onJoined?.();
      }, 1000);
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ??
        err?.response?.data?.error?.details?.[0]?.msg;
      setEditError(msg || "שגיאה בעדכון");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await apiClient.delete(`/events/${event._id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      onDeleted?.();
    } catch (err) {
      setDeleteError(err?.response?.data?.error?.message || "שגיאה במחיקה");
      setDeleteLoading(false);
      setDeleteConfirm(false);
    }
  };

  return (
    <GlassCard className="flex flex-col gap-3">
      {/* כותרת + כפתורי מארגן + סטטוס */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug text-slate-100">
          {event.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {isOrganizer && !showEditForm && (
            <>
              <button
                type="button"
                title="ערוך"
                onClick={() => {
                  setShowEditForm(true);
                  setDeleteConfirm(false);
                }}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 hover:text-teal-300 hover:border-teal-400/30 transition"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                title="מחק"
                onClick={() => {
                  setDeleteConfirm(true);
                  setDeleteError(null);
                }}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 hover:text-red-400 hover:border-red-400/30 transition"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* תצוגת פרטים רגילה */}
      {!showEditForm && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Calendar size={14} className="shrink-0" />
              {dateStr} · {timeStr}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-2">
                <Users size={14} className="shrink-0" />
                {participantCount} משתתפים
                {event.maxParticipants ? ` / ${event.maxParticipants}` : ""}
              </span>
              {remaining !== null && (
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${remainingColor}`}
                >
                  {remaining === 0 ? "מלא" : `נותרו ${remaining} מקומות`}
                </span>
              )}
            </div>
            {event.organizer?.name && (
              <span className="text-xs text-slate-500">
                מארגן: {event.organizer.name}
              </span>
            )}
            {event.route?.title && (
              <span className="flex items-center gap-2 text-xs">
                <MapPin size={12} className="shrink-0 text-teal-400" />
                מסלול: {event.route.title}
                {event.route.distanceKm != null && (
                  <span className="text-slate-500">
                    ({event.route.distanceKm.toFixed(1)} ק&quot;מ)
                  </span>
                )}
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-xs leading-relaxed text-slate-500">
              {event.description}
            </p>
          )}

          {/* אישור מחיקה */}
          {deleteConfirm && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 space-y-2">
              <p className="text-xs font-medium text-red-300">
                למחוק את הרכיבה לצמיתות?
              </p>
              {deleteError && (
                <p className="text-xs text-red-400">{deleteError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 rounded-lg bg-red-600/80 py-1.5 text-xs font-bold text-white hover:bg-red-600 active:scale-95 transition disabled:opacity-50"
                >
                  {deleteLoading ? "מוחק..." : "כן, מחק"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirm(false);
                    setDeleteError(null);
                  }}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}

          {joinSuccess && (
            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              נתראה ברכיבה!
            </p>
          )}

          {joinError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400">
              {joinError}
            </p>
          )}

          {!isOrganizer && (
            <Button
              variant={!isOpen || isFull ? "ghost" : "primary"}
              size="md"
              className="mt-auto w-full"
              disabled={isJoining || isFull || !isOpen}
              onClick={handleJoin}
            >
              {isJoining
                ? "מצטרף..."
                : isFull
                  ? "האירוע מלא"
                  : !isOpen
                    ? "סגור להצטרפות"
                    : "הצטרף לרכיבה"}
            </Button>
          )}
        </div>
      )}

      {/* טופס עריכה */}
      {showEditForm && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              שם הרכיבה *
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              maxLength={100}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              תאריך ושעה *
            </label>
            <input
              type="datetime-local"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 scheme-dark"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              תיאור / נקודת מפגש
            </label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              maxLength={400}
              rows={2}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              מקסימום משתתפים{" "}
              <span className="text-slate-600 normal-case font-normal">
                (ריק = ללא הגבלה)
              </span>
            </label>
            <input
              type="number"
              value={editMax}
              onChange={(e) => setEditMax(e.target.value)}
              placeholder="ללא הגבלה"
              min={2}
              max={200}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
            />
          </div>
          {editError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400">
              {editError}
            </p>
          )}
          {editSuccess && (
            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
              עודכן בהצלחה!
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleEdit}
              disabled={editLoading}
              className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-500 active:scale-95 transition disabled:opacity-50"
            >
              {editLoading ? "שומר..." : "שמור שינויים"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEditForm(false);
                setEditError(null);
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-400 hover:text-slate-200 transition"
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

/* ─── CommunityHubPage ─── */

export default function CommunityHubPage({
  apiClient,
  authToken,
  onViewRoute,
  currentUserId = "",
  pendingTab = null,
  onPendingTabConsumed,
}) {
  const [activeTab, setActiveTab] = useState("routes");

  /* jump to requested tab (e.g. after creating a group ride) */
  useEffect(() => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      onPendingTabConsumed?.();
    }
  }, [pendingTab]);

  /* ── Routes state ── */
  const [routes, setRoutes] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [routesError, setRoutesError] = useState(null);

  /* ── פילטרים למסלולים ── */
  const [filterType, setFilterType] = useState("הכל");
  const [filterDifficulty, setFilterDifficulty] = useState("הכל");
  const [filterTwisty, setFilterTwisty] = useState(false);

  /* ── Events state ── */
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);

  /* ── Create event form state ── */
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventMeeting, setNewEventMeeting] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventMax, setNewEventMax] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const resetCreateForm = () => {
    setNewEventTitle("");
    setNewEventDate("");
    setNewEventMeeting("");
    setNewEventDesc("");
    setNewEventMax("");
    setCreateError(null);
    setCreateSuccess(false);
  };

  const handleCreateEvent = async () => {
    if (!authToken) {
      setCreateError("עליך להתחבר כדי ליצור רכיבה קבוצתית");
      return;
    }
    if (!newEventTitle.trim()) {
      setCreateError("כתוב שם לרכיבה");
      return;
    }
    if (!newEventDate) {
      setCreateError("בחר תאריך ושעה");
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    const descParts = [];
    if (newEventMeeting.trim())
      descParts.push(`נקודת מפגש: ${newEventMeeting.trim()}`);
    if (newEventDesc.trim()) descParts.push(newEventDesc.trim());
    try {
      await apiClient.post(
        "/events",
        {
          title: newEventTitle.trim(),
          scheduledAt: new Date(newEventDate).toISOString(),
          description: descParts.join("\n") || undefined,
          maxParticipants: newEventMax ? Number(newEventMax) : undefined,
        },
        { headers: { Authorization: `Bearer ${authToken}` } },
      );
      setCreateSuccess(true);
      resetCreateForm();
      await fetchEvents();
      setTimeout(() => {
        setShowCreateForm(false);
        setCreateSuccess(false);
      }, 1500);
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ??
        err?.response?.data?.error?.details?.[0]?.msg;
      setCreateError(msg || "שגיאה ביצירת הרכיבה");
    } finally {
      setCreateLoading(false);
    }
  };

  /* ── fetch מסלולים ציבוריים ── */
  const fetchRoutes = useCallback(async () => {
    setRoutesLoading(true);
    setRoutesError(null);
    try {
      const params = {};
      if (filterType !== "הכל") params.routeType = filterType;
      if (filterDifficulty !== "הכל") params.difficulty = filterDifficulty;
      if (filterTwisty) params.isTwisty = "true";

      const { data } = await apiClient.get("/routes/public", { params });
      setRoutes(data.routes ?? []);
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.error?.message;
      console.error("[fetchRoutes]", err);
      setRoutesError(
        serverMsg
          ? `שגיאה ${status}: ${serverMsg}`
          : status
            ? `שגיאת שרת (HTTP ${status})`
            : "לא ניתן להתחבר לשרת — בדוק שהשרת רץ",
      );
    } finally {
      setRoutesLoading(false);
    }
  }, [apiClient, filterType, filterDifficulty, filterTwisty]);

  /* ── fetch אירועים ── */
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const { data } = await apiClient.get("/events");
      setEvents(data.events ?? []);
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.error?.message;
      console.error("[fetchEvents]", err);
      setEventsError(
        serverMsg
          ? `שגיאה ${status}: ${serverMsg}`
          : status
            ? `שגיאת שרת (HTTP ${status})`
            : "לא ניתן להתחבר לשרת — בדוק שהשרת רץ",
      );
    } finally {
      setEventsLoading(false);
    }
  }, [apiClient]);

  /* טעינה בעת כניסה לטאב */
  useEffect(() => {
    if (activeTab === "routes") fetchRoutes();
  }, [activeTab, fetchRoutes]);

  useEffect(() => {
    if (activeTab === "events") fetchEvents();
  }, [activeTab, fetchEvents]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6" dir="rtl">
      {/* כותרת */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          קהילת MotoVibe
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          מסלולים ורכיבות קבוצתיות משותפות
        </p>
      </header>

      {/* מתג טאבים */}
      <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
        <TabButton
          active={activeTab === "routes"}
          onClick={() => setActiveTab("routes")}
        >
          מסלולי הקהילה
        </TabButton>
        <TabButton
          active={activeTab === "events"}
          onClick={() => setActiveTab("events")}
        >
          רכיבות קבוצתיות
        </TabButton>
      </div>

      {/* ─── טאב מסלולים ─── */}
      {activeTab === "routes" && (
        <>
          {/* שורת סינון */}
          <section className="mb-5 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">סוג:</span>
              {ROUTE_TYPES.map((t) => (
                <FilterChip
                  key={t}
                  label={t}
                  active={filterType === t}
                  onClick={() => setFilterType(t)}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">קושי:</span>
              {DIFFICULTIES.map((d) => (
                <FilterChip
                  key={d}
                  label={d}
                  active={filterDifficulty === d}
                  onClick={() => setFilterDifficulty(d)}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">כביש מפותל:</span>
              <FilterChip
                label={filterTwisty ? "⚡ כן" : "⚡ הכל"}
                active={filterTwisty}
                onClick={() => setFilterTwisty((v) => !v)}
              />
            </div>
          </section>

          {/* תוצאות */}
          {routesLoading && <LoadingSpinner />}
          {routesError && (
            <ErrorMessage message={routesError} onRetry={fetchRoutes} />
          )}
          {!routesLoading && !routesError && routes.length === 0 && (
            <EmptyState message="לא נמצאו מסלולים ציבוריים עם הסינון הזה" />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {routes.map((route) => (
              <RouteCard
                key={route._id}
                route={route}
                onViewRoute={onViewRoute}
              />
            ))}
          </div>
        </>
      )}

      {/* ─── טאב רכיבות קבוצתיות ─── */}
      {activeTab === "events" && (
        <>
          {/* כפתור יצירת רכיבה — מוצג תמיד בטאב events */}
          <button
            type="button"
            onClick={() => {
              setShowCreateForm((v) => !v);
              setCreateError(null);
            }}
            className="w-full mb-4 flex items-center justify-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 py-3 text-sm font-bold text-violet-300 hover:bg-violet-500/20 transition active:scale-95"
          >
            <CalendarPlus size={16} />
            {showCreateForm ? "סגור טופס" : "צור רכיבה קבוצתית"}
          </button>

          {/* טופס יצירה */}
          {showCreateForm && (
            <div className="mb-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3 backdrop-blur-sm">
              <p className="text-sm font-bold text-violet-300 flex items-center gap-2">
                <CalendarPlus size={15} /> פרטי הרכיבה
              </p>

              {/* שם */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  שם הרכיבה *
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="לדוגמה: רכיבת שבת לצפון"
                  maxLength={100}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
                />
              </div>

              {/* תאריך */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  תאריך ושעה *
                </label>
                <input
                  type="datetime-local"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 scheme-dark"
                />
              </div>

              {/* נקודת מפגש */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  נקודת מפגש
                </label>
                <input
                  type="text"
                  value={newEventMeeting}
                  onChange={(e) => setNewEventMeeting(e.target.value)}
                  placeholder="לדוגמה: חניון כיכר רבין"
                  maxLength={120}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
                />
              </div>

              {/* תיאור */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  תיאור קצר
                </label>
                <textarea
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="לדוגמה: רכיבה רגועה, עוצרים לקפה בסוף"
                  maxLength={300}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
                />
              </div>

              {/* מקסימום משתתפים */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  מקסימום משתתפים{" "}
                  <span className="text-slate-600 normal-case font-normal">
                    (אופציונלי)
                  </span>
                </label>
                <input
                  type="number"
                  value={newEventMax}
                  onChange={(e) => setNewEventMax(e.target.value)}
                  placeholder="ללא הגבלה"
                  min={2}
                  max={200}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
                />
              </div>

              {createError && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400">
                  {createError}
                </p>
              )}
              {createSuccess && (
                <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
                  הרכיבה נוצרה בהצלחה!
                </p>
              )}

              <button
                type="button"
                onClick={handleCreateEvent}
                disabled={createLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-500 active:scale-95 transition disabled:opacity-50"
              >
                {createLoading ? (
                  "שולח..."
                ) : (
                  <>
                    <CalendarPlus size={15} /> שלח הזמנה לקהילה
                  </>
                )}
              </button>
            </div>
          )}
          {eventsLoading && <LoadingSpinner />}
          {eventsError && (
            <ErrorMessage message={eventsError} onRetry={fetchEvents} />
          )}
          {!eventsLoading && !eventsError && events.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-5">
                <Bike size={36} className="text-slate-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-300">
                  עדיין אין רכיבות מתוכננות
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  היה הראשון ליזום רכיבה!
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-4">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                authToken={authToken}
                apiClient={apiClient}
                currentUserId={currentUserId}
                onJoined={fetchEvents}
                onDeleted={fetchEvents}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
