/**
 * SettingsPage — מסך הגדרות + מסך אימות משתמש (Auth).
 * רכיב Stateless: מקבל את כל הנתונים וה-Handlers כ-Props מ-App.jsx.
 * משמש גם כ-Placeholder לטאב Settings בעתיד.
 */

import { useState } from "react";
import { Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Strength Rules
  const pwdRules = {
    length: authPassword.length >= 8,
    uppercase: /[A-Z]/.test(authPassword),
    lowercase: /[a-z]/.test(authPassword),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(authPassword),
  };
  const isPasswordValid = Object.values(pwdRules).every(Boolean);

  const handleSubmit = () => {
    if (!authEmail.trim() || !authPassword.trim() || (authMode === "register" && (!authName.trim() || !confirmPassword.trim()))) {
      setAuthError("נא למלא את כל השדות");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authEmail.trim())) {
      setAuthError("כתובת אימייל לא תקינה");
      return;
    }

    if (authMode === "register") {
      if (!isPasswordValid) {
        setAuthError("הסיסמה אינה עומדת בכל הדרישות");
        return;
      }
      if (authPassword !== confirmPassword) {
        setAuthError("הסיסמאות אינן תואמות");
        return;
      }
    }
    submitAuthForm({ onNavigate });
  };

  return (
    <div dir="rtl" className="mv-bg flex min-h-screen w-full flex-col font-sans text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-10 pt-5 sm:px-6 flex-1">
        <main className="mt-6 flex-1 w-full flex flex-col items-center">
          <ActiveRideBanner
            isRideActive={isRideActive}
            isRideMinimized={isRideMinimized}
            onNavigate={onNavigate}
          />

          <section className="text-center w-full max-w-md">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
              {authMode === "register" ? "יצירת חשבון" : "ברוכים השבים"}
            </h1>
            <p className="mt-2 text-base text-gray-400 sm:text-lg">
              {authMode === "register" ? "הצטרפו לחוויית רכיבה מתקדמת" : "התחברו כדי לנהל מסלולים שמורים"}
            </p>
          </section>

          <section className="mt-8 w-full max-w-md">
            <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              {/* Subtle inner top highlight */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              <div className="mb-6 flex flex-col items-center gap-5">
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 w-full relative z-10">
                  <button
                    type="button"
                    className={`flex-1 py-1.5 text-sm font-medium rounded-xl transition-all duration-300 ${authMode === "login" ? "bg-white/10 text-white shadow-md border border-white/5" : "text-gray-400 hover:text-white"}`}
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                  >
                    התחברות
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-1.5 text-sm font-medium rounded-xl transition-all duration-300 ${authMode === "register" ? "bg-white/10 text-white shadow-md border border-white/5" : "text-gray-400 hover:text-white"}`}
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError("");
                    }}
                  >
                    הרשמה
                  </button>
                </div>
              </div>

              <div className="space-y-3 relative z-10 w-full">
                {authMode === "register" && (
                  <input
                    type="text"
                    value={authName}
                    onChange={(event) => setAuthName(event.target.value)}
                    placeholder="שם מלא"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 focus:bg-white/10 focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/70 outline-none transition-all duration-300"
                  />
                )}

                <input
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="אימייל"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 focus:bg-white/10 focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/70 outline-none transition-all duration-300"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    placeholder="סיסמה"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 pl-12 focus:bg-white/10 focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/70 outline-none transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {authMode === "register" && (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-2 mb-1 text-[11px] sm:text-xs">
                    <div className={`flex items-center gap-1.5 transition-colors duration-300 ${pwdRules.length ? "text-emerald-400" : "text-gray-400"}`}>
                      {pwdRules.length ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                      <span>לפחות 8 תווים</span>
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors duration-300 ${pwdRules.uppercase ? "text-emerald-400" : "text-gray-400"}`}>
                      {pwdRules.uppercase ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                      <span>אות גדולה (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors duration-300 ${pwdRules.lowercase ? "text-emerald-400" : "text-gray-400"}`}>
                      {pwdRules.lowercase ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                      <span>אות קטנה (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors duration-300 ${pwdRules.symbol ? "text-emerald-400" : "text-gray-400"}`}>
                      {pwdRules.symbol ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                      <span>תוות מיוחד (!@#$)</span>
                    </div>
                  </div>
                )}

                {authMode === "register" && (
                  <div className="relative mt-2">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="אימות סיסמה"
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 pl-12 focus:bg-white/10 focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/70 outline-none transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                )}

                {!!authError && (
                  <p className="text-red-400 text-xs mt-2 text-center font-medium">{authError}</p>
                )}

                {/* פעולת שליחה למסלול auth המתאים לפי מצב הטופס. */}
                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isAuthSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl px-4 py-3 font-semibold text-white shadow-[0_8px_20px_-6px_rgba(52,211,153,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(52,211,153,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_20px_-6px_rgba(52,211,153,0.4)] cursor-pointer"
                  >
                    {isAuthSubmitting
                      ? "שולח..."
                      : authMode === "register"
                        ? "צור חשבון"
                        : "התחבר"}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Google Sign-in ── */}
            <div className="mt-6 flex flex-col items-center gap-4 pb-4 border-b border-transparent">
              {/* divider */}
              <div className="flex w-full items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-medium">או מתחברים עם</span>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              {/* Google button */}
              <button
                type="button"
                onClick={() => alert("Google Sign-In — בקרוב")}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 px-4 py-3 text-sm font-semibold active:translate-y-0 active:scale-[0.98]"
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
