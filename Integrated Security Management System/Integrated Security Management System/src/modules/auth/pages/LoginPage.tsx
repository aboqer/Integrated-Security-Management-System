import { FormEvent, useState } from "react";
import { AlertCircle, ArrowLeft, Lock, Shield, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(username, password);
      navigate((location.state as { from?: string } | null)?.from || "/", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "تعذر تسجيل الدخول");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#dbeafe_45%,#fff7ed_100%)] p-3 sm:p-4">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[1.75rem] border border-white/60 bg-white shadow-2xl sm:rounded-[2.5rem] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden bg-[linear-gradient(180deg,#0f172a_0%,#1d4ed8_70%,#f97316_100%)] p-10 text-white lg:flex lg:flex-col xl:p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-white/10">
              <Shield size={34} />
            </div>
            <div className="mt-10 text-right">
              <h1 className="text-4xl font-black leading-tight">منصة الإدارة الأمنية المتكاملة</h1>
              <p className="mt-5 text-sm leading-7 text-blue-100">
                تسجيل دخول موحد للوصول إلى أنظمة المخالفات والموقوفين والأمانات والبلاغات والالتزامات من خلال واجهة تشغيل واحدة.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-8 md:p-10 lg:p-12">
            <div className="mx-auto max-w-md text-right">
              <div className="mb-6 lg:hidden">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-slate-900 text-white">
                  <Shield size={28} />
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">تسجيل الدخول</h2>
              <p className="mt-2 text-sm text-slate-500">استخدم بيانات المستخدم الخاصة بك للوصول إلى النظام.</p>

              <form className="mt-8 space-y-5 sm:mt-10" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">اسم المستخدم</span>
                  <div className="relative">
                    <User size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                      placeholder="أدخل اسم المستخدم"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-700">كلمة المرور</span>
                  <div className="relative">
                    <Lock size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                  </div>
                </label>

                {error ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="inline-flex items-center gap-2">
                    <ArrowLeft size={18} />
                    {submitting ? "جاري تسجيل الدخول..." : "دخول إلى المنصة"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
