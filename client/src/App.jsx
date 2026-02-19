import { useState } from "react";
import Button from "./app/ui/components/Button";
import GlassCard from "./app/ui/components/GlassCard";
import AppShell from "./app/layouts/AppShell";

/**
 * מסך רשימת מסלולים (Routes) במבנה RTL.
 * המסך מרונדר בתוך AppShell (שמכיל את mv-bg והניווט),
 * וכרגע עובד כ־UI Mock בלבד ללא API או Router.
 * @returns {JSX.Element} מסך מסלולים מלא.
 */
function App() {
  const [selectedChip, setSelectedChip] = useState("הכל");

  /*
   * Placeholder לנתוני מסלולים.
   * נקודת הרחבה עתידית: החלפה בנתונים מהשרת + חיפוש/פילטור אמיתי.
   */
  const routes = [
    {
      id: "route-1",
      title: "רמת השרון → תל אביב",
      meta: "42 ק״מ • 45 דק׳",
      tags: ["כביש", "לילה", "מהיר"],
    },
    {
      id: "route-2",
      title: "כביש החוף → חיפה",
      meta: "96 ק״מ • 70 דק׳",
      tags: ["כביש", "לילה", "מהיר"],
    },
    {
      id: "route-3",
      title: "הרי ירושלים → בית שמש",
      meta: "38 ק״מ • 52 דק׳",
      tags: ["כביש", "לילה", "מהיר"],
    },
  ];

  const filterChips = ["הכל", "קצר", "בינוני", "ארוך", "שטח"];

  return (
    <AppShell>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-10 pt-5 sm:px-6">
        <main className="mt-6 flex-1">
          {/* כותרת מסך + שורת חיפוש */}
          <section>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">מסלולים</h1>
            <p className="mt-2 text-base text-slate-300 sm:text-lg">בחר מסלול וצא לרכיבה</p>

            <div className="mv-card mt-5 p-2">
              <input
                type="search"
                placeholder="חפש מסלול..."
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              />
            </div>

            {/* שבבי פילטר מקומיים בלבד (ללא לוגיקת סינון אמיתית עדיין) */}
            <div className="mt-4 flex flex-wrap gap-2">
              {filterChips.map((chip) => {
                const isSelected = selectedChip === chip;
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setSelectedChip(chip)}
                    className={[
                      "mv-pill px-3 py-1 text-xs font-medium transition",
                      isSelected
                        ? "text-emerald-200 ring-1 ring-emerald-300/40"
                        : "text-slate-300 hover:text-white",
                    ].join(" ")}
                    aria-pressed={isSelected}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </section>

          {/* רשימת כרטיסי מסלולים (Mock עד חיבור API) */}
          <section className="mt-6 space-y-4">
            {routes.map((route) => (
              <GlassCard
                key={route.id}
                right={
                  <button
                    type="button"
                    className="mv-pill inline-flex h-8 w-8 items-center justify-center text-sm text-slate-300 hover:text-white"
                    aria-label="מחק מסלול"
                  >
                    ✕
                  </button>
                }
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,220px)_1fr] md:items-center">
                  <div className="relative h-28 overflow-hidden rounded-xl bg-slate-900/80 ring-1 ring-white/10">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-size-[22px_22px]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(20,184,166,0.24),transparent_58%)]" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-100">{route.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{route.meta}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {route.tags.map((tag) => (
                        <span
                          key={`${route.id}-${tag}`}
                          className="mv-pill px-2.5 py-1 text-xs text-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* פעולות מסלול: Hook עתידי לצפייה/התחלת רכיבה אמיתית */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="primary" size="md">
                        צפה
                      </Button>
                      <Button variant="ghost" size="md">
                        התחל רכיבה
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </section>
        </main>

        {/* FAB ליצירת מסלול (UI בלבד, ללא פעולה כרגע) */}
        <div className="pointer-events-none fixed bottom-24 left-4 z-30 flex items-center gap-2 md:bottom-8 md:left-6">
          <span className="mv-pill px-3 py-1 text-xs text-slate-200">צור מסלול</span>
          <button
            type="button"
            className="pointer-events-auto mv-card inline-flex h-12 w-12 items-center justify-center rounded-full text-2xl text-emerald-200 shadow-[0_0_24px_rgba(20,184,166,0.35)]"
            aria-label="צור מסלול"
          >
            +
          </button>
        </div>
      </div>
    </AppShell>
  );
}

export default App;
