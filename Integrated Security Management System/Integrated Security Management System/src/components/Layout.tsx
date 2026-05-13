import React, { useState, useEffect } from 'react';
import { 
  Bell, Settings, LogOut, Shield, Search, X, MapPin, ChevronLeft
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { NAV_ITEMS, cn } from '../lib/utils';
import * as Icons from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('admin'); // Mock RBAC
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: 'مخالفة جديدة', 
      observer: 'YASER', 
      location: 'الدهبلي', 
      coords: '12.834, 45.021', 
      time: '14:30',
      unread: true,
      details: { category: 'أمنية', name: 'أحمد علي', plate: '12345/1', by: 'YASER', workSite: 'الدهبلي', status: 'مفتوح' }
    },
    { 
      id: 2, 
      title: 'تنبيه أمني', 
      observer: 'Admin', 
      location: 'Go', 
      coords: '12.800, 45.010', 
      time: '12:15',
      unread: false,
      details: { category: 'مالية', name: 'سعيد محمد', plate: '67890/2', by: 'MO', workSite: 'Go', status: 'قيد المراجعة' }
    }
  ]);

  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickAccessOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsQuickAccessOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isHome = location.pathname === '/';

  const getIcon = (name: string, size = 18) => {
    // @ts-ignore
    const Icon = Icons[name];
    return Icon ? <Icon size={size} /> : null;
  };

  const visibleNavItems = NAV_ITEMS.filter(item => 
    !item.requiredRole || item.requiredRole === userRole
  );

  return (
    <div className={cn(
      "h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-arabic selection:bg-blue-100 flex flex-col transition-colors duration-500 overflow-hidden"
    )}>
      {/* Dynamic Top Header - Hidden on Home to show Brand Banner */}
      {!isHome && (
        <header className="bg-[var(--bg-surface)] border-b border-[var(--border-color)] sticky top-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/90 shrink-0">
          <div className="h-12 px-4 md:px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              <Link to="/" className="flex items-center gap-2 group">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center text-white shadow-lg"
                >
                  <Shield size={18} />
                </motion.div>
                <div className="flex flex-col">
                  <span className="font-black text-sm tracking-tight leading-none">MKCards</span>
                  <span className="text-[8px] text-brand-red font-black uppercase tracking-[0.1em] mt-0.5">المنصة المركزية</span>
                </div>
              </Link>
              
              <div className="h-4 w-[1px] bg-[var(--border-color)] mx-1 hidden lg:block" />

              {/* Desktop Navigation */}
              <nav className="hidden xl:flex items-center gap-0.5">
                {visibleNavItems.filter(item => item.id !== 'settings').map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link 
                      key={item.id}
                      to={item.path}
                      className={cn(
                        "group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-black transition-all duration-300 border border-transparent",
                        isActive 
                          ? "bg-slate-900 text-white shadow-lg" 
                          : "text-[var(--text-muted)] hover:bg-slate-50 hover:text-[var(--text-main)] active:scale-95"
                      )}
                    >
                      <div className={cn(
                        "p-0.5 rounded-md transition-all duration-300",
                        isActive ? "bg-white/20" : "bg-slate-50 group-hover:bg-white"
                      )}>
                        {getIcon(item.icon, 14)}
                      </div>
                      <span className="whitespace-nowrap">{item.title.split(' ')[0] === 'نظام' ? item.title.split(' ')[1] : item.title.split(' ')[0]}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(true)}
                  className="relative w-8 h-8 text-[var(--text-muted)] hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-slate-100 transition-all flex items-center justify-center font-black"
                >
                  <Bell size={16} />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={cn(
        "flex-1 mx-auto w-full mb-16 md:mb-0 overflow-y-auto overflow-x-hidden custom-scrollbar",
        isHome ? "max-w-[1500px]" : "max-w-[1700px] p-4 md:p-6 lg:p-8"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: isHome ? 0 : 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isHome ? 0 : -15 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className={cn("h-full", isHome ? "p-4 md:p-8" : "")}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>


      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-surface)] border-t border-[var(--border-color)] flex items-center justify-around px-2 lg:hidden z-[100] glass-panel rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
         {/* System Items - First 4 including Property & Reports */}
         {visibleNavItems.filter(item => item.id !== 'settings').slice(0, 4).map((item) => {
           const isActive = location.pathname === item.path;
           return (
             <Link 
               key={item.id} 
               to={item.path} 
               className={cn(
                 "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-300 relative", 
                 isActive ? "text-blue-600" : "text-slate-400"
               )}
             >
               <div className={cn(
                 "p-2 rounded-xl transition-all duration-500",
                 isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-100 -translate-y-2" : "bg-transparent"
               )}>
                 {getIcon(item.icon, 22)}
               </div>
               <span className={cn(
                 "text-[8px] font-black uppercase transition-opacity duration-300",
                 isActive ? "opacity-100" : "opacity-70"
               )}>
                 {item.title.split(' ')[0] === 'نظام' ? item.title.split(' ')[1] : item.title.slice(0, 6)}
               </span>
               {isActive && (
                 <motion.div 
                   layoutId="nav-dot"
                   className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full"
                 />
               )}
             </Link>
           );
         })}

         <div className="w-[1px] h-6 bg-slate-100 mx-1" />

         <Link 
            to="/settings" 
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-300", 
              location.pathname === '/settings' ? "text-slate-900" : "text-slate-400"
            )}
         >
            <div className={cn("p-1.5 rounded-lg", location.pathname === '/settings' ? "bg-slate-100 shadow-inner" : "")}>
              <Icons.Settings size={22} />
            </div>
            <span className="text-[8px] font-black uppercase">الإعدادات</span>
         </Link>
      </nav>

      {/* Status Footer - Desktop Only */}
      <footer className="h-12 bg-slate-900 text-slate-400 hidden md:flex items-center justify-between px-12 text-[10px] font-black tracking-[0.1em] uppercase shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-500">الحالة: متصل</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <span>تاريخ اليوم: {new Date().toLocaleDateString('ar-SA')}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 py-1 px-3 bg-slate-800 rounded-lg text-blue-400">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>بيئة أمنية معزولة (Air-Gapped)</span>
        </div>
      </footer>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-100"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <button onClick={() => setShowNotifications(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all">
                  <X size={20} />
                </button>
                <div className="text-right">
                  <h2 className="text-xl font-black text-slate-900 leading-tight">مركز الإشعارات</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">المخالفات والبلاغات الميدانية</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                      <Bell size={40} />
                    </div>
                    <p className="font-black text-slate-400">لا يوجد إشعارات جديدة</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="relative group">
                      <div className="flex justify-between items-start mb-3">
                        {notif.unread && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />}
                        <div className="text-right flex-1 pr-3">
                          <h4 className="text-sm font-black text-slate-900 mb-1">{notif.title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                            {notif.observer} | {notif.location}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-[1.5rem] p-4 space-y-2 mr-6 border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all cursor-pointer">
                        {[
                          { label: 'الاسم', value: notif.details.name },
                          { label: 'اللوحة', value: notif.details.plate },
                          { label: 'الحالة', value: notif.details.status, highlight: true }
                        ].map((row, i) => (
                          <div key={i} className="flex justify-between items-center text-[11px]">
                            <span className={cn("font-black", row.highlight ? "text-blue-600" : "text-slate-700")}>{row.value}</span>
                            <span className="font-bold text-slate-400">{row.label}:</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center mr-6 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                         <div className="flex items-center gap-1 text-blue-600">
                           <MapPin size={10} />
                           <span className="text-[9px] font-black">{notif.coords}</span>
                         </div>
                         <span className="text-[9px] font-black text-slate-400">{notif.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                  className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-black text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                >
                  تحديد الكل كمقروء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Access Modal (Command Palette) */}
      <AnimatePresence>
        {isQuickAccessOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickAccessOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-[var(--bg-surface)] rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.3)] border border-[var(--border-color)] overflow-hidden"
            >
              <div className="p-6 border-b border-[var(--border-color)] flex items-center gap-4">
                <Search className="text-blue-500" size={24} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="ابحث عن أنظمة، سجلات، أو أوامر..."
                  className="flex-1 bg-transparent border-none outline-none text-xl font-black placeholder:text-slate-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  onClick={() => setIsQuickAccessOpen(false)}
                  className="p-2 hover:bg-[var(--bg-main)] rounded-xl transition-colors text-[var(--text-muted)]"
                >
                  <Icons.X size={20} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-6">
                  <div>
                    <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">الأنظمة المتاحة</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {visibleNavItems.map(item => (
                         <Link 
                           key={item.id}
                           to={item.path}
                           onClick={() => setIsQuickAccessOpen(false)}
                           className="flex items-center gap-4 p-4 rounded-[1.25rem] hover:bg-[var(--bg-main)] transition-all group"
                         >
                            <div className={cn("p-3 rounded-xl", item.color, "bg-opacity-10 text-white")}>
                              {getIcon(item.icon, 20)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{item.title}</span>
                              <span className="text-[10px] text-[var(--text-muted)] font-medium">فتح النظام الخاص بـ {item.title}</span>
                            </div>
                            <Icons.ChevronLeft size={16} className="mr-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                         </Link>
                       ))}
                    </div>
                  </div>

                  <div>
                     <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">إجراءات سريعة</h4>
                     <div className="space-y-1">
                        <button className="w-full flex items-center gap-4 p-4 rounded-[1.25rem] hover:bg-[var(--bg-main)] transition-all group text-right">
                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Icons.Plus size={20} />
                          </div>
                          <span className="font-bold text-sm">إضافة سجل موقوف جديد</span>
                        </button>
                     </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-4 bg-[var(--bg-main)] border-t border-[var(--border-color)] flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5"><kbd className="p-1 px-1.5 bg-white border border-slate-200 rounded">Esc</kbd> للإغلاق</span>
                  <span className="flex items-center gap-1.5"><kbd className="p-1 px-1.5 bg-white border border-slate-200 rounded">↵</kbd> للاختيار</span>
                </div>
                <span>نظام البحث الذكي v2.0</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
