import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-[var(--bg-main)] font-arabic transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grid lg:grid-cols-2 w-full max-w-6xl bg-[var(--bg-surface)] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-[var(--border-color)]"
      >
        
        {/* Left Side: Branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-center p-16 bg-blue-600 text-white relative overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -5, 0]
            }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" 
          />
          
          <div className="relative z-10 space-y-10">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 bg-white shadow-2xl shadow-blue-900/20 rounded-3xl flex items-center justify-center text-blue-600"
            >
              <Shield size={40} />
            </motion.div>
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tight leading-[1.1]">المنصة الأمنية<br />المركزية</h1>
              <p className="text-xl text-blue-100 font-medium leading-relaxed opacity-90">
                نظام إدارة العمليات الأمنية المتكامل، مصمم لضمان أعلى معايير الدقة والسرية في تداول البيانات.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
                <Lock size={18} className="text-blue-200" />
                <span className="text-sm font-bold">تشفير AES-256</span>
              </div>
              <div className="px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
                <Shield size={18} className="text-blue-200" />
                <span className="text-sm font-bold">بيئة معزولة</span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto relative z-10 pt-10 border-t border-white/10 flex items-center justify-between text-xs text-blue-100/60 font-black uppercase tracking-widest">
            <span>الإصدار 4.5.0</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>النظام متصل</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 xl:p-16 flex flex-col justify-center bg-[var(--bg-surface)]">
          <div className="max-w-md mx-auto w-full space-y-10">
            <header className="space-y-4">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-200">
                  <Shield size={36} />
                </div>
              </div>
              <h2 className="text-4xl font-black text-[var(--text-main)] text-center lg:text-right tracking-tight">مرحباً بك مجدداً</h2>
              <p className="text-[var(--text-muted)] font-medium text-lg text-center lg:text-right leading-relaxed">يرجى تسجيل الدخول للوصول إلى كافة صلاحيات النظام المركزية.</p>
            </header>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <label className="text-base font-black text-[var(--text-main)] px-1">اسم المستخدم</label>
                <div className="relative group">
                  <User size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    required
                    placeholder="أدخل بريدك الإلكتروني أو اسم المستخدم"
                    className="w-full bg-[var(--bg-main)] border-2 border-[var(--border-color)] rounded-[1.25rem] pr-14 pl-5 py-5 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-lg placeholder:text-slate-400/80"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-base font-black text-[var(--text-main)] px-1">كلمة المرور</label>
                <div className="relative group">
                  <Lock size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-[var(--bg-main)] border-2 border-[var(--border-color)] rounded-[1.25rem] pr-14 pl-14 py-5 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-lg tracking-[0.2em] placeholder:tracking-normal placeholder:text-slate-400/80"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-blue-600 transition-all w-10 h-10 flex items-center justify-center rounded-xl hover:bg-blue-50 p-0"
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-2 border-[var(--border-color)] text-blue-600 focus:ring-blue-500 transition-all cursor-pointer bg-transparent" 
                  />
                  <span className="text-sm font-bold text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">البقاء متصلاً</span>
                </label>
                <button type="button" className="text-sm font-black text-blue-600 hover:text-blue-700 transition-colors border-none p-0 min-w-0 h-auto bg-transparent">نسيت كلمة المرور؟</button>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-4 mt-4"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <ArrowLeft size={22} />
                  </>
                )}
              </motion.button>
            </form>

            <footer className="pt-10 flex flex-col items-center gap-6 text-sm font-black text-[var(--text-muted)]">
              <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 text-red-500 px-5 py-3 rounded-2xl border border-red-100 dark:border-red-900/30">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>الولوج لنظام مراقب للأغراض الأمنية</span>
              </div>
              <p className="opacity-60">© 2024 وحدة البرمجيات الأمنية - النسخة السحابية المعزولة</p>
            </footer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
