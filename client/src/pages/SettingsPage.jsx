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
