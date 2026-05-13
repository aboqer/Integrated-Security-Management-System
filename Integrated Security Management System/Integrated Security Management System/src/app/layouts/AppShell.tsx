import React, { useState } from "react";
import { Bell, ChevronLeft, LogOut, Menu, Settings, Shield, X } from "lucide-react";
import * as Icons from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { moduleRegistry } from "../../modules/moduleRegistry";
import { cn } from "../../lib/utils";

function ModuleIcon({ name }: { name: string }) {
  const Icon = (Icons as Record<string, React.ComponentType<{ size?: number }>>)[name];
  return Icon ? <Icon size={18} /> : <Shield size={18} />;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentModule =
    moduleRegistry.find((item) => (item.path === "/" ? pathname === "/" : pathname.startsWith(item.path))) ||
    null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-80 shrink-0 border-l border-[var(--border-color)] bg-[linear-gradient(180deg,#0f172a_0%,#16213d_100%)] p-6 text-white lg:flex lg:flex-col">
          <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 shadow-lg shadow-rose-950/30">
                <Shield size={24} />
              </div>
              <div className="text-right">
                <div className="text-lg font-black">منصة الإدارة الأمنية</div>
                <div className="text-xs text-slate-300">خمس وحدات تشغيلية موحدة</div>
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 text-right">
              <div className="text-xs text-slate-300">المستخدم الحالي</div>
              <div className="mt-1 font-black">{user?.fullName || user?.username}</div>
              <div className="mt-1 text-xs text-slate-400">{user?.roleCode || "operator"}</div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2">
            {moduleRegistry.map((module) => (
              <NavLink
                key={module.id}
                to={module.path}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-right transition-all",
                    isActive
                      ? "border-white/20 bg-white/12 text-white shadow-lg"
                      : "border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/6 hover:text-white",
                  )
                }
              >
                <ChevronLeft size={16} className="text-slate-500 transition-colors group-hover:text-white" />
                <div className="mr-auto text-right">
                  <div className="font-black">{module.title}</div>
                  <div className="text-xs text-slate-400">{module.shortDescription}</div>
                </div>
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg", module.color)}>
                  <ModuleIcon name={module.icon} />
                </div>
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-slate-200 transition hover:bg-white/10"
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--border-color)] bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 md:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white lg:hidden"
                >
                  <Menu size={20} />
                </button>
                <div className="text-right">
                  <div className="text-base font-black sm:text-lg">{currentModule?.title || "لوحة التحكم"}</div>
                  <div className="text-[11px] text-slate-500 sm:text-xs">{user?.fullName || user?.username}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/settings"
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:px-4"
                >
                  <Settings size={16} />
                  <span className="mr-2 hidden sm:inline">الإعدادات</span>
                </Link>
                <button
                  type="button"
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50"
                >
                  <Bell size={18} />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 pb-24 sm:px-5 md:px-8 md:py-8 md:pb-8">{children}</main>
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="close navigation"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />
          <aside className="absolute right-0 top-0 flex h-full w-[88vw] max-w-sm flex-col border-l border-white/10 bg-[linear-gradient(180deg,#0f172a_0%,#16213d_100%)] p-5 text-white shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"
              >
                <X size={18} />
              </button>
              <div className="text-right">
                <div className="text-base font-black">منصة الإدارة الأمنية</div>
                <div className="text-xs text-slate-300">{user?.fullName || user?.username}</div>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
              {moduleRegistry.map((module) => (
                <NavLink
                  key={module.id}
                  to={module.path}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-right transition-all",
                      isActive
                        ? "border-white/20 bg-white/12 text-white shadow-lg"
                        : "border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/6 hover:text-white",
                    )
                  }
                >
                  <ChevronLeft size={16} className="text-slate-500 transition-colors group-hover:text-white" />
                  <div className="mr-auto text-right">
                    <div className="font-black">{module.title}</div>
                    <div className="text-xs text-slate-400">{module.shortDescription}</div>
                  </div>
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg", module.color)}>
                    <ModuleIcon name={module.icon} />
                  </div>
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={logout}
              className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-slate-200 transition hover:bg-white/10"
            >
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
            </button>
          </aside>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-color)] bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-2">
          {moduleRegistry.slice(0, 4).map((module) => (
            <NavLink
              key={module.id}
              to={module.path}
              className={({ isActive }) =>
                cn(
                  "flex min-h-[56px] flex-col items-center justify-center rounded-2xl px-2 text-center text-[11px] font-black transition",
                  isActive ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600",
                )
              }
            >
              <ModuleIcon name={module.icon} />
              <span className="mt-1 line-clamp-1">{module.title}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
