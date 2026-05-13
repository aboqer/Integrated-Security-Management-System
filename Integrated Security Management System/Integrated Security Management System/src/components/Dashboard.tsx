import React from 'react';
import { 
  ShieldAlert, 
  Settings as SettingsIcon, 
  Activity,
  Users,
  Package,
  MessageSquareText,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const SystemModuleCard = ({ title, subtitle, icon: Icon, color, path }: any) => (
  <Link to={path} className="block group">
    <motion.div 
      whileHover={{ y: -1, x: -1 }}
      className="bg-white rounded-xl border border-slate-100 p-3 flex items-center justify-between shadow-[0_4px_15px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_-6px_rgba(0,0,0,0.06)] transition-all relative overflow-hidden h-full"
    >
      <div className="flex items-center gap-2.5 relative z-10">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-[0_4px_10px_-2px_rgba(0,0,0,0.15)] shrink-0 transition-transform group-hover:rotate-2", color)}>
          <Icon size={18} />
        </div>
        <div className="text-right">
          <h3 className="text-[13px] font-black text-slate-800 leading-tight mb-0.5">{title}</h3>
          <p className="text-[9px] font-bold text-slate-400 max-w-[150px] leading-tight opacity-80">{subtitle}</p>
        </div>
      </div>
      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner shrink-0 leading-none z-10">
        <ArrowUpRight size={12} />
      </div>
      
      {/* Decorative background accent - even more subtle */}
      <div className={cn("absolute -right-6 -bottom-6 w-20 h-20 blur-3xl opacity-0 group-hover:opacity-[0.05] transition-opacity duration-700", color)} />
    </motion.div>
  </Link>
);

export default function Dashboard() {
  const modules = [
    { title: 'نظام المخالفات', subtitle: 'طرق رصد وتوثيق المخالفات والجزاءات الفورية', icon: ShieldAlert, color: 'bg-red-500', path: '/violations' },
    { title: 'نظام الموقوفين', subtitle: 'متابعة بيانات وحالات الموقوفين والتحقيقات', icon: Users, color: 'bg-blue-600', path: '/detainees' },
    { title: 'نظام الأمانات', subtitle: 'إدارة العهد والممتلكات الشخصية المحروزة', icon: Package, color: 'bg-emerald-500', path: '/property' },
    { title: 'نظام البلاغات والشكاوي', subtitle: 'توثيق البلاغات والشكاوي الميدانية الطارئة', icon: Activity, color: 'bg-indigo-500', path: '/reports' }
  ];

  const stats = [
    { label: 'إجمالي القضايا', value: '1,284', delta: '+12%', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'قضايا تم حلها', value: '892', delta: '+5%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'قيد المعالجة', value: '392', delta: '-2%', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' }
  ];

  return (
    <div className="space-y-2.5 px-2 lg:px-0 py-1 h-full flex flex-col">
      {/* Hero Stats Section - Ultra Compact */}
      <div className="bg-white rounded-[20px] p-4 border border-slate-50 shadow-sm relative overflow-hidden shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 space-y-2 w-full">
            <div className="text-right">
              <h2 className="text-[20px] font-black text-[#001c3d] leading-tight">إحصائيات النظام اليومية</h2>
              <p className="text-slate-400 font-bold text-[10px]">متابعة الأنشطة الميدانية الموثقة</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {stats.map((stat, i) => (
                <div key={i} className="space-y-0 text-right">
                  <div className="flex items-center gap-1 mb-0.5 justify-end">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{stat.label}</span>
                    <div className={cn("w-1 h-1 rounded-full", stat.color.replace('text', 'bg'))} />
                  </div>
                  <div className="text-[16px] font-black text-[#001c3d]">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
              <motion.circle 
                cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" 
                strokeDasharray={251}
                initial={{ strokeDashoffset: 251 }}
                animate={{ strokeDashoffset: 251 - (251 * 0.7) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-blue-600" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[18px] font-black text-[#001c3d]">70%</span>
              <span className="text-[7px] font-black text-slate-400">الإنجاز</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 pb-1">
         {modules.map((module, i) => (
           <SystemModuleCard key={i} {...module} />
         ))}
      </div>
    </div>
  );
}


