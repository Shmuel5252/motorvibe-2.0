/**
 * SettingsPage — מסך הגדרות + מסך אימות משתמש (Auth).
 * רכיב Stateless: מקבל את כל הנתונים וה-Handlers כ-Props מ-App.jsx.
 * משמש גם כ-Placeholder לטאב Settings בעתיד.
 */

import Button from "../app/ui/components/Button";
import GlassCard from "../app/ui/components/GlassCard";

/**
 * באנר רכיבה פעילה — מוצג בטאבים שאינם מסך הרכיבה.
 */
function ActiveRideBanner({ isRideActive, isRideMinimized, onNavigate }) {
  if (!isRideActive || isRideMinimized) {
    return null;
  }

  return (
    <section className="mv-card mb-5 flex items-center justify-between gap-3 px-4 py-2.5">
      <span className="text-sm text-emerald-200">יש רכיבה פעילה</span>
      <Button variant="ghost" size="md" onClick={() => onNavigate("ride")}>
        חזור לרכיבה
      </Button>
    </section>
  );
}

/**
 * AuthScreen — טופס התחברות/הרשמה מינימלי.
 * מסך אורח: מוצג עד קבלת טוקן תקף מהשרת.
 */
export function AuthScreen({
  isRideActive,
  isRideMinimized,
  onNavigate,
  authMode,
  setAuthMode,
  authName,
  setAuthName,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authError,
  setAuthError,
  isAuthSubmitting,
  submitAuthForm,
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-10 pt-5 sm:px-6">
      <main className="mt-6 flex-1">
        <ActiveRideBanner
          isRideActive={isRideActive}
          isRideMinimized={isRideMinimized}
          onNavigate={onNavigate}
        />

        <section>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            אימות משתמש
          </h1>
          <p className="mt-2 text-base text-slate-300 sm:text-lg">
            התחבר או הירשם כדי לעבוד עם מסלולים שמורים
          </p>
        </section>

        <section className="mt-6">
          <GlassCard
            title="כניסה"
            right={
              <div className="flex items-center gap-2">
                <Button
                  variant={authMode === "login" ? "primary" : "ghost"}
                  size="md"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                  }}
                >
                  התחברות
                </Button>
                <Button
                  variant={authMode === "register" ? "primary" : "ghost"}
                  size="md"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                  }}
                >
                  הרשמה
                </Button>
              </div>
            }
          >
            <div className="space-y-3">
              {authMode === "register" && (
                <input
                  type="text"
                  value={authName}
                  onChange={(event) => setAuthName(event.target.value)}
                  placeholder="שם מלא"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                />
              )}

              <input
                type="email"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                placeholder="אימייל"
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              />

              <input
                type="password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                placeholder="סיסמה"
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              />

              {!!authError && (
                <p className="text-xs text-rose-300">{authError}</p>
              )}

              {/* פעולת שליחה למסלול auth המתאים לפי מצב הטופס. */}
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => submitAuthForm({ onNavigate })}
                >
                  {isAuthSubmitting
                    ? "שולח..."
                    : authMode === "register"
                      ? "צור חשבון"
                      : "התחבר"}
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* ── Google Sign-in ── */}
          <div className="mt-5 flex flex-col items-center gap-4">
            {/* divider */}
            <div className="flex w-full items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-slate-500">או</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={() => alert("Google Sign-In — בקרוב")}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-100 active:scale-[0.98]"
            >
              {/* Colourful Google 'G' */}
              <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0"
                aria-hidden="true"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              התחבר עם Google
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * SettingsPage — Placeholder למסך הגדרות העתידי.
 */
export default function SettingsPage({
  isRideActive,
  isRideMinimized,
  onNavigate,
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-10 pt-5 sm:px-6">
      <main className="mt-6 flex-1">
        <ActiveRideBanner
          isRideActive={isRideActive}
          isRideMinimized={isRideMinimized}
          onNavigate={onNavigate}
        />

        <section>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            הגדרות
          </h1>
          <p className="mt-2 text-base text-slate-300 sm:text-lg">
            הגדרות אפליקציה ועדפות
          </p>
        </section>

        <section className="mt-6">
          <GlassCard
            title="בקרוב"
            right={<span className="mv-pill px-2.5 py-1 text-xs">Preview</span>}
          >
            <p className="text-sm text-slate-300">
              המסך בתהליך חיבור נתונים ולוגיקה. בינתיים זהו Placeholder ויזואלי
              בלבד.
            </p>
          </GlassCard>
        </section>
      </main>
    </div>
  );
}
