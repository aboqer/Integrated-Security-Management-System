import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Search,
  Shield,
  FileText,
  Package,
  Users,
  MessageSquare,
  History,
  Bell,
  LogOut,
  X,
  Calendar,
  Tag,
  ChevronDown,
  Check,
  Clock,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Lock,
  UserPlus,
  ShieldCheck,
  Mail,
  MessageSquareText,
  Eye,
  Activity,
  Camera,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  User,
  CreditCard,
  Hash,
  Phone,
  Truck,
  Grid,
  BadgeAlert,
  Gavel,
  Type,
  MapPin,
  Minus,
  Video,
  Navigation,
  Fingerprint,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";

const ModuleView = ({
  title,
  description,
  icon: Icon,
  color,
  dataLabel,
}: any) => {
  const [searchTerm, setSearchTerm] = useState(
    () => localStorage.getItem(`search_${title}`) || "",
  );
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(() => {
    const saved = localStorage.getItem(`filters_${title}`);
    return saved
      ? JSON.parse(saved)
      : {
          status: "الكل",
          dateRange: "الكل",
          priority: "الكل",
        };
  });

  const [data, setData] = useState(() => {
    if (title === "سجل العمليات (Audit Logs)") {
      const logs = JSON.parse(
        localStorage.getItem("simulated_audit_logs") || "[]",
      );
      if (logs.length > 0) {
        return logs.map((l: any) => ({
          id: l.id,
          label: l.action,
          user: l.user,
          fullTimestamp: l.timestamp,
          date: l.timestamp.split(",")[0],
          status: "مكتمل",
        }));
      }
    }
    return [
      {
        id: 2001,
        label: `بيانات تجريبية #1`,
        date: "2024/05/12",
        status: "نشط",
      },
      {
        id: 2002,
        label: `بيانات تجريبية #2`,
        date: "2024/05/11",
        status: "نشط",
      },
      {
        id: 2003,
        label: `بيانات تجريبية #3`,
        date: "2024/05/10",
        status: "قيد المعالجة",
      },
      {
        id: 2004,
        label: `بيانات تجريبية #4`,
        date: "2024/05/09",
        status: "نشط",
      },
      {
        id: 2005,
        label: `بيانات تجريبية #5`,
        date: "2024/05/08",
        status: "نشط",
      },
      {
        id: 2006,
        label: `بيانات تجريبية #6`,
        date: "2024/05/07",
        status: "قيد المعالجة",
      },
    ];
  });

  const suggestions = [
    "سجل موقوف جديد",
    "مخالفة مرورية",
    "أمانة نقدية",
    "بلاغ عاجل",
    "تعديل صلاحيات",
    "عرض التقرير السنوي",
  ].filter((s) => s.includes(searchTerm));

  // Debouncing effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      localStorage.setItem(`search_${title}`, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, title]);

  // Persist filters
  useEffect(() => {
    localStorage.setItem(`filters_${title}`, JSON.stringify(activeFilters));
  }, [activeFilters, title]);

  const clearFilters = () => {
    const defaultFilters = {
      status: "الكل",
      dateRange: "الكل",
      priority: "الكل",
    };
    setActiveFilters(defaultFilters);
    setSearchTerm("");
  };

  const deleteRecord = (id: number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    setShowDeleteConfirm(null);
  };

  const updateStatus = (id: number, newStatus: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item,
      ),
    );
  };

  const FilterBadge = ({ label, value, onClear }: any) => (
    <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
      <span className="opacity-60">{label}:</span>
      <span>{value}</span>
      <button
        onClick={onClear}
        className="hover:bg-blue-100 rounded-full p-0.5"
      >
        <X size={12} />
      </button>
    </div>
  );

  return (
    <div className="space-y-4 pb-12 relative animate-in fade-in duration-500">
      {/* Return to Dashboard Navigation */}
      <div className="flex justify-between items-center mb-2 px-1">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-slate-100/50 hover:bg-slate-200/80 text-slate-600 rounded-2xl text-[13px] font-black transition-all group"
        >
          <ChevronRight
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>العودة للرئيسية</span>
        </Link>
        <div className="text-blue-500 text-[13px] font-black">{title}</div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-slate-900 mb-0.5">{title}</h1>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          {description.includes("(")
            ? description.split("(")[0]
            : "CMS CENTRAL PLATFORM"}
        </p>
      </div>

      {/* Modern Toolbar - Integrated Search & Actions */}
      <div className="flex flex-col md:flex-row gap-3 mt-2">
        <div className="relative flex-grow group">
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-[1.25rem] border border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all group-hover:border-slate-300">
            <Search
              size={16}
              className="text-slate-400 group-focus-within:text-blue-500 transition-colors"
            />
            <input
              type="text"
              placeholder="ابحث في السجلات والبيانات..."
              className="bg-transparent border-none text-[12px] outline-none w-full font-bold text-slate-800 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-1 bg-slate-50/50 rounded-xl border border-slate-100">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white hover:shadow-sm rounded-lg text-[10px] font-black text-slate-600 transition-all">
              <Filter size={12} className="text-slate-400" />
              <span>تصفية</span>
            </button>
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            <div className="relative group/export">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white hover:shadow-sm rounded-lg text-[10px] font-black text-slate-600 transition-all">
                <Download size={12} className="text-emerald-500" />
                <span>تصدير</span>
              </button>
            </div>
          </div>

          <button className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all shadow-md shadow-blue-50">
            <Plus size={14} />
            <span>إضافة جديدة</span>
          </button>
        </div>
      </div>

      {/* Data Cards - Modern & Simplified Aesthetic - Improved Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-6">
        {data.length > 0 ? (
          data.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[1.5rem] border border-slate-100 p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 group relative overflow-hidden flex flex-col h-full ring-1 ring-slate-100/50"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                  <Package size={12} />
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                  ID: {item.id % 1000}
                </span>
              </div>

              <div className="flex-grow">
                <h4 className="text-[12px] font-black text-slate-800 leading-tight mb-0.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {item.label}
                </h4>
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      item.status === "نشط" ? "bg-emerald-500" : "bg-amber-500",
                    )}
                  />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
                <div className="flex items-center gap-1 text-slate-300 text-[8px] font-bold">
                  <Clock size={8} />
                  <span>{item.date}</span>
                </div>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-6 h-6 rounded-md bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  <ArrowUpRight size={10} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-slate-200" />
            </div>
            <h3 className="text-lg font-black text-slate-900">لا توجد نتائج</h3>
            <p className="text-slate-400 font-bold">
              حاول تغيير معايير البحث الخاصة بك
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden"
            >
              {/* Decoration */}
              <div
                className={cn(
                  "absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10",
                  color,
                )}
              />

              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                      color,
                    )}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-none mb-1">
                      {selectedItem.label}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                      المعرف الموحد: {selectedItem.id * 7}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-10 h-10 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-full flex items-center justify-center transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      الحالة الحالية
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          selectedItem.status === "نشط"
                            ? "bg-red-500"
                            : "bg-emerald-500",
                        )}
                      />
                      <span className="text-sm font-black text-slate-900">
                        {selectedItem.status === "نشط"
                          ? "مفتوح (قيد الإجراء)"
                          : "مكتمل (مؤرشف)"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      تاريخ التسجيل
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-sm font-black text-slate-900">
                        {selectedItem.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 border border-slate-100 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-2">
                    تفاصيل العملية
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-bold">
                        المستخدم المسؤول
                      </span>
                      <span className="text-slate-900 font-black">
                        {selectedItem.user || "أدمن النظام الرئيسي"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-bold">
                        التوقيت الدقيق
                      </span>
                      <span className="text-slate-900 font-black">
                        {selectedItem.fullTimestamp || selectedItem.date}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-bold">
                        المرفقات والبيانات
                      </span>
                      <span className="text-blue-500 font-black">
                        سجل رقم {selectedItem.id}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {selectedItem.description ||
                    `هذا السجل يمثل جزءاً من منظومة ${title}، حيث يتم توثيق كافة التحركات والإجراءات القانونية المتبعة وفقاً للمعايير الأمنية المعتمدة.`}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-6">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                      <Check size={12} />
                      <span>اعتماد</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black hover:bg-red-600 hover:text-white transition-all shadow-sm">
                      <Trash2 size={12} />
                      <span>حذف</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-all">
                      <History size={16} />
                    </button>
                    <button className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black hover:bg-black transition-all shadow-md">
                      تعديل
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
          إجمالي النتائج: {data.length}
        </span>
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-100 shadow-sm">
          <button className="px-3 py-1.5 hover:bg-slate-50 rounded text-[10px] font-black text-slate-500 transition-all">
            السابق
          </button>
          <div className="h-4 w-[1px] bg-slate-100 mx-1" />
          <button className="w-7 h-7 bg-blue-600 text-white text-[10px] font-black rounded shadow-md shadow-blue-100">
            1
          </button>
          <button className="w-7 h-7 hover:bg-slate-50 text-[10px] font-black rounded text-slate-400 transition-all">
            2
          </button>
          <div className="h-4 w-[1px] bg-slate-100 mx-1" />
          <button className="px-3 py-1.5 hover:bg-slate-50 rounded text-[10px] font-black text-slate-500 transition-all">
            التالي
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <button
                  onClick={() => deleteRecord(showDeleteConfirm)}
                  className="h-14 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                >
                  نعم، حذف
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="h-14 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DetaineesView = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    idNumber: "",
    birthDate: "",
    nationality: "سعودي",
    violationType: "جنائية",
    location: "",
    description: "",
  });

  const recentRecords = [
    { id: "1102938475", name: "محمد بن سلمان العتيبي", dob: "1990-05-15" },
    { id: "1102938476", name: "خالد بن فهد القحطاني", dob: "1985-11-20" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 px-4" dir="rtl">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-2">
          {["01", "02", "03"].map((num, i) => (
            <div
              key={num}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-black tracking-widest transition-all",
                step === i + 1
                  ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                  : "bg-slate-50 text-slate-300 border border-slate-100",
              )}
            >
              {num}
            </div>
          ))}
        </div>
        <div className="text-right">
          <p className="text-blue-600 text-[10px] font-black mb-1 opacity-90 uppercase">
            أرشفة سجلات الضبط
          </p>
          <h1 className="text-xl font-black text-slate-900 mb-1 tracking-tight">
            إضافة سجل جديد
          </h1>
          <p className="text-slate-400 text-[11px] font-bold">
            تعبئة البيانات الأساسية وتوثيق المحضر.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Recent Records Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 px-1 border-b border-slate-50 pb-2">
                <Activity size={16} />
                <h3 className="text-sm font-black tracking-tight text-slate-800">
                  سجلات حديثة للوصول السريع
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:border-blue-100 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="text-right">
                      <h4 className="text-sm font-black text-slate-900 mb-0.5">
                        {record.name}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400">
                        رقم الهوية: {record.id} • {record.dob}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronLeft size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Basic Data Section */}
            <section className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-none mb-1">
                    البيانات الأساسية
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400">
                    ادخل بيانات الهوية والمعلومات الشخصية بدقة.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-600 px-1">
                    الاسم الرباعي
                  </label>
                  <div className="relative group">
                    <User
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="الاسم الكامل كما في الهوية..."
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pr-12 pl-4 py-3 text-xs font-bold outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-300"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-600 px-1">
                    رقم الهوية الوطنية
                  </label>
                  <div className="relative group">
                    <ShieldCheck
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="0000000000"
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pr-12 pl-4 py-3 text-xs font-bold outline-none focus:bg-white focus:border-blue-500 transition-all font-mono placeholder:text-slate-300"
                      value={form.idNumber}
                      onChange={(e) =>
                        setForm({ ...form, idNumber: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-600 px-1">
                    تاريخ الميلاد
                  </label>
                  <div className="relative group">
                    <Calendar
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-blue-500"
                    />
                    <input
                      type="date"
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:bg-white focus:border-blue-500 transition-all text-right font-mono"
                      value={form.birthDate}
                      onChange={(e) =>
                        setForm({ ...form, birthDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-600 px-1">
                    الجنسية
                  </label>
                  <div className="relative group">
                    <MapPin
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
                    />
                    <select
                      className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pr-12 pl-10 py-3 text-xs font-black outline-none appearance-none focus:bg-white focus:border-blue-500 transition-all"
                      value={form.nationality}
                      onChange={(e) =>
                        setForm({ ...form, nationality: e.target.value })
                      }
                    >
                      <option value="سعودي">سعودي</option>
                      <option value="يمني">يمني</option>
                      <option value="آخر">آخر</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-6 px-1 border-t border-slate-50">
              <div className="flex items-center gap-2 text-emerald-600 font-bold opacity-90">
                <CheckCircle2 size={18} />
                <span className="text-[11px] font-black">حفظ مسودة تلقائي</span>
              </div>
              <button
                onClick={() => setStep(2)}
                className="group px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black shadow-md hover:bg-black active:scale-95 transition-all flex items-center gap-4"
              >
                <span>الخطوة التالية</span>
                <ArrowLeft
                  size={16}
                  className="group-hover:-translate-x-1 transition-transform"
                />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-sm"
          >
            <div className="w-20 h-20 bg-slate-50 text-blue-600 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
              <Shield size={40} className="stroke-[2]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                قسم الأرشفة قيد التطوير
              </h3>
              <p className="text-slate-400 font-bold max-w-sm mx-auto text-sm leading-relaxed">
                سيحتوي هذا القسم قريباً على تفاصيل الواقعة والشهود وتوثيق الأدلة
                الرقمية بالكامل.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="px-8 py-3 bg-slate-100 text-slate-800 rounded-xl text-xs font-black flex items-center gap-3 hover:bg-slate-200 transition-all border border-slate-200 group"
            >
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
              <span>البيانات الأساسية</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ViolationsView = () => {
  const [currentUser] = useState<{
    username: string;
    role: "admin" | "user";
    name: string;
  } | null>({ username: "admin", role: "admin", name: "مدير النظام" });
  const [view, setView] = useState<"menu" | "form" | "all">("menu");
  const [step, setStep] = useState(1);
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, boolean>>(
    {},
  );
  const [activeSubTab, setActiveSubTab] = useState<"identity" | "vehicle">(
    "identity",
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("الكل");
  const [filterStatus, setFilterStatus] = useState("الكل");

  // Multi-step form auto-save simulation
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem("violations_data");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 106,
        title: "مخالفة الجديدة",
        observer: "MO",
        location: "الدهبلي",
        coords: "0.0000 , 0.0000",
        time: "2026/04/29",
        details: {
          category: "أمنية",
          name: "صلاح صادق محمد سعيد",
          idNumber: "04384668",
          plate: "565553",
          by: "MO",
          workSite: "الدهبلي",
          status: "مفتوح",
          description:
            "تحميل ركاب من داخل المربع الامني بدون تفتيش ومحاولة التجاوز الخطرة",
        },
        unread: true,
      },
      {
        id: 105,
        title: "مخالفة مرورية",
        observer: "Ahmed",
        location: "المنطقة الوسطى",
        coords: "12.3456 , 45.6789",
        time: "2026/04/26",
        details: {
          category: "أمنية",
          name: "محمد جمال مهيوب غالب",
          idNumber: "175837",
          plate: "123456",
          by: "Admin",
          workSite: "المربع الأمني",
          status: "مفتوح",
          description: "تحميل ركاب من داخل المربع الامني بدون تفتيش",
        },
        unread: false,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("violations_data", JSON.stringify(notifications));
  }, [notifications]);

  const deleteRecord = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setToast({ message: "تم حذف السجل بنجاح", type: "success" });
  };

  const startEditing = (record: any) => {
    setEditingId(record.id);
    setForm({
      fullName: record.details.name,
      idType: "بطاقة إلكترونية", // Standardized for simplicity in mock
      idNumber: record.details.idNumber,
      phones: ["770000000"], // Mock phone for edit
      vehicleType: "صالون",
      plateNumber: record.details.plate,
      provinceCode: "1",
      plateCategory: "خصوصي",
      violationCategory: record.details.category,
      violationId: record.title || "",
      description: record.details.description,
      actionTaken: record.details.action || "عمل التزام",
      finalNotes: "",
    });
    setStep(1);
    setView("form");
  };

  const [form, setForm] = useState({
    fullName: "",
    idType: "بطاقة إلكترونية",
    customIdType: "",
    idNumber: "",
    phones: [""],
    vehicleType: "",
    plateNumber: "",
    provinceCode: "1",
    plateCategory: "خصوصي",
    violationCategory: "أمنية",
    violationId: "",
    description: "",
    actionTaken: "عمل التزام",
    finalNotes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtering Logic
  const filteredRecords = notifications.filter((record) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      record.details.name.toLowerCase().includes(query) ||
      record.details.idNumber.toLowerCase().includes(query) ||
      (record.details.plate &&
        record.details.plate.toLowerCase().includes(query)) ||
      record.id.toString().includes(query);

    const matchesCategory =
      filterCategory === "الكل" ||
      record.details.category.includes(filterCategory);
    const matchesStatus =
      filterStatus === "الكل" || record.details.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      "المعرف",
      "الاسم",
      "الرقم الوطني",
      "الفئة",
      "الحالة",
      "التاريخ",
      "الوصف",
    ];
    const rows = filteredRecords.map((r) => [
      r.id,
      r.details.name,
      r.details.idNumber,
      r.details.category,
      r.details.status,
      r.time,
      r.details.description,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "violations_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const securityViolations = [
    {
      title: "التخابر والتنسيق المشبوه",
      description:
        "وجود رسائل في الهاتف تثبت التواصل مع العدو، أو التنسيق مع أشخاص لتسهيل التجاوزات.",
    },
    {
      title: "حيازة سلاح",
      description: "حمل أسلحة نارية (مسدسات) دون الحصول على تصريح.",
    },
    {
      title: "الترويج المعادي",
      description: "حمل أو إظهار شعارات معادية (مثل شعار الصرخة).",
    },
    {
      title: "تجاوز النقطة والتمرد",
      description:
        "الهروب دون تسليم السندات، وعدم الالتزام بالتعليمات الأمنية.",
    },
    {
      title: "الرشوة والإساءة",
      description:
        "عرض أو دفع أموال لأفراد النقطة، أو التلفظ عليهم بألفاظ مسيئة.",
    },
    {
      title: "مخالفات نقل الركاب",
      description:
        "التحميل من داخل مربع المنفذ بدون تصريح، تجاوز الحمولة المسموحة، أو نقل أشخاص لا تتطابق أسماؤهم مع السند.",
    },
  ];

  const financialViolations = [
    {
      title: "تدوير السندات",
      description:
        "إعادة استخدام السند لأكثر من رحلة (مثل استخدام سند صباحي في المساء) للتهرب من الرسوم.",
    },
    {
      title: "التلاعب بالكميات",
      description:
        "تحميل بضائع أو كراتين تفوق العدد المدفوع رسومه (الكوشن)، واستخدام عبوات غير رسمية للتمويه.",
    },
    {
      title: "تزوير بيانات البضاعة",
      description:
        "عدم تطابق نوع أو كمية البضاعة الفعلية مع البيانات المقيدة في السند.",
    },
    {
      title: "إخفاء البضائع",
      description:
        "تعمد إخفاء البضائع أثناء التفتيش للتهرب من الرسوم الجمركية.",
    },
    {
      title: "استخدام شبكات التهريب",
      description:
        "إرسال البضائع للتهرب المالي عبر وسطاء (مهربين، نساء، أو أطفال).",
    },
  ];

  const violationsList =
    form.violationCategory === "أمنية"
      ? securityViolations
      : form.violationCategory === "مالية"
        ? financialViolations
        : [...securityViolations, ...financialViolations];

  const handleViolationChange = (title: string) => {
    const selected = violationsList.find((v) => v.title === title);
    setForm({
      ...form,
      violationId: title,
      description: selected ? selected.description : "",
    });
  };

  const addPhone = () => setForm({ ...form, phones: [...form.phones, ""] });
  const removePhone = (index: number) => {
    const newPhones = form.phones.filter((_, i) => i !== index);
    setForm({ ...form, phones: newPhones.length ? newPhones : [""] });
  };
  const updatePhone = (index: number, val: string) => {
    // Only digits and max 9 characters
    const cleanVal = val.replace(/\D/g, "").slice(0, 9);
    const newPhones = [...form.phones];
    newPhones[index] = cleanVal;
    setForm({ ...form, phones: newPhones });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!form.fullName) newErrors.fullName = "الاسم مطلوب";
      if (!form.idNumber) {
        newErrors.idNumber = "رقم الهوية مطلوب";
      } else {
        if (
          form.idType === "بطاقة إلكترونية" &&
          !/^[0-9]{12}$/.test(form.idNumber)
        ) {
          newErrors.idNumber = "البطاقة الإلكترونية يجب أن تكون 12 رقماً";
        } else if (
          form.idType === "بطاقة عادية" &&
          !/^[0-9]{11}$/.test(form.idNumber)
        ) {
          newErrors.idNumber = "البطاقة الشخصية العادية يجب أن تكون 11 رقماً";
        } else if (
          form.idType === "جواز سفر" &&
          !/^[0-9]{8}$/.test(form.idNumber)
        ) {
          newErrors.idNumber = "جواز السفر يجب أن يكون 8 أرقام";
        }
      }

      form.phones.forEach((p, i) => {
        if (!p) {
          newErrors[`phone_${i}`] = "رقم الهاتف مطلوب";
        } else if (!/^7[0-9]{8}$/.test(p)) {
          newErrors[`phone_${i}`] =
            "رقم الهاتف يجب أن يبدأ بـ 7 ومكون من 9 أرقام";
        }
      });

      if (!form.vehicleType) newErrors.vehicleType = "نوع المركبة مطلوب";
      if (!form.plateNumber) newErrors.plateNumber = "رقم اللوحة مطلوب";
    }
    if (step === 2) {
      if (!form.violationId) newErrors.violationId = "يرجى اختيار المخالفة";
      if (!form.description) newErrors.description = "الوصف مطلوب";
    }
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setToast({ message: "يرجى تصحيح الأخطاء في الحقول المطلوبة", type: "error" });
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const togglePhoto = (key: string) =>
    setCapturedPhotos((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    setIsSaving(true);
    const newRecord = {
      id: editingId || Math.floor(Math.random() * 1000) + 200,
      title: form.violationId,
      observer: currentUser?.name || "مدير النظام",
      location: "المربع الأمني",
      coords: "0.0000, 0.0000",
      time: new Date().toLocaleDateString("ja-JP").replace(/\//g, "/"),
      details: {
        category: form.violationCategory,
        name: form.fullName,
        idNumber: form.idNumber,
        plate: form.plateNumber,
        by: currentUser?.name || "مدير النظام",
        workSite: "المربع الأمني",
        status: "مفتوح",
        description: form.description,
        action: form.actionTaken,
      },
      unread: true,
    };

    if (editingId) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === editingId ? newRecord : n)),
      );
      setToast({ message: "تم تحديث السجل بنجاح", type: "success" });
    } else {
      setNotifications((prev) => [newRecord, ...prev]);
      setToast({ message: "تم حفظ الضبط بنجاح", type: "success" });
    }

    setTimeout(() => {
      setIsSaving(false);
      setView("all");
      setEditingId(null);
      setStep(1);
      // Reset form
      setForm({
        fullName: "",
        idType: "بطاقة إلكترونية",
        customIdType: "",
        idNumber: "",
        phones: [""],
        vehicleType: "",
        plateNumber: "",
        provinceCode: "1",
        plateCategory: "خصوصي",
        violationCategory: "أمنية",
        violationId: "",
        description: "",
        actionTaken: "عمل التزام",
        finalNotes: "",
      });
    }, 1000);
  };

  const handleLogout = () => {
    alert("تم تعطيل تسجيل الخروج مؤقتاً بناءً على الإعدادات الحالية");
  };

  if (view === "all") {
    return (
      <div className="max-w-xl mx-auto py-6 mb-24 font-sans relative" dir="rtl">
        {/* Custom Toast Notification - Also here for all view */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className={cn(
                "fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md",
                toast.type === "success"
                  ? "bg-emerald-500/90 text-white border-emerald-400"
                  : "bg-red-500/90 text-white border-red-400",
              )}
            >
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                {toast.type === "success" ? (
                  <Check size={14} />
                ) : (
                  <AlertTriangle size={14} />
                )}
              </div>
              <span className="text-xs font-black">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                سجل الضبط والرقابة
              </h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                MONITORING RECORDS
              </p>
            </div>
            <button
              onClick={() => setView("menu")}
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 hover:bg-slate-50 transition-all active:scale-95"
            >
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Compact Insights */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="bg-slate-900 p-5 rounded-2xl text-white shadow-xl shadow-slate-100 relative overflow-hidden"
            >
              <p className="text-[9px] font-black opacity-50 uppercase mb-1">
                إجمالي الحالات
              </p>
              <p className="text-2xl font-black">
                {filteredRecords.length + 68}
              </p>
              <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/5 rounded-full blur-xl" />
            </motion.div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-center shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                تحت المراجعة
              </p>
              <p className="text-xl font-black text-slate-800">14</p>
            </div>
          </div>

          {/* Compact Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث بالاسم، المحضر، أو اللوحة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-xl px-5 h-10 pr-12 text-right text-xs font-bold outline-none shadow-sm focus:border-blue-500 transition-all"
            />
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
              size={18}
            />
          </div>

          {/* Modern Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-50">
            {["الكل", "أمنية", "مرورية", "مالية"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  "px-5 h-10 rounded-lg text-[10px] font-black whitespace-nowrap transition-all border",
                  filterCategory === cat
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-white border-slate-50 text-slate-400 hover:border-slate-200",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between px-5 mt-4 mb-2">
          <p className="text-[10px] font-bold text-slate-400">
            إجمالي السجلات:{" "}
            <span className="text-slate-900">
              {filteredRecords.length + 68}
            </span>
          </p>
          {currentUser?.role === "admin" && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-[10px] hover:text-emerald-700 transition-colors"
            >
              <Download size={14} />
              <span>تحميل التقارير</span>
            </button>
          )}
        </div>

        {/* List Section */}
        <div className="space-y-4 px-4 pb-12">
          {filteredRecords.map((record) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm relative group hover:border-blue-200 transition-all font-sans"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all shadow-sm",
                      record.details.status === "مفتوح"
                        ? "bg-orange-50 text-orange-500 border-orange-100"
                        : "bg-emerald-50 text-emerald-500 border-emerald-100",
                    )}
                  >
                    <User size={22} strokeWidth={2.5} />
                  </div>
                  <div className="text-right">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-black text-slate-800 leading-tight">
                        {record.details.name}
                      </h3>
                      <div className="flex gap-1">
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                          {record.details.category}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                            record.details.status === "مفتوح"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-emerald-50 text-emerald-600",
                          )}
                        >
                          {record.details.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] font-bold text-slate-400 font-mono">
                        #{record.id}
                      </p>
                      <div className="w-1 h-1 bg-slate-200 rounded-full" />
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock size={10} />
                        {record.time}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-none border-slate-100 sm:border-transparent">
                  <button
                    onClick={() => startEditing(record)}
                    className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-90"
                    title="تعديل السجل"
                  >
                    <FileText size={16} />
                  </button>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm active:scale-90"
                    title="حذف السجل"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => alert(`وثائق المحضر رقم ${record.id}`)}
                    className="w-12 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
                  >
                    <Camera size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100/50 group-hover:bg-white group-hover:border-blue-50 transition-colors">
                <p className="text-[10px] font-medium text-slate-500 text-right line-clamp-2 italic leading-relaxed">
                  {record.details.description}
                </p>
                {record.details.plate && (
                  <div className="mt-2 flex items-center justify-end gap-2 text-right">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      رقم اللوحة:
                    </span>
                    <span className="text-[10px] font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-100">
                      {record.details.plate}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {filteredRecords.length === 0 && (
            <div className="py-12 text-center space-y-2 opacity-50">
              <Search size={32} className="mx-auto text-slate-200" />
              <p className="text-slate-400 font-bold text-[11px]">
                لا توجد نتائج مطابقة
              </p>
            </div>
          )}

          <div className="pt-6 text-center">
            <button
              onClick={() => alert("تحميل المزيد...")}
              className="text-slate-300 font-black text-[11px] flex items-center gap-2 mx-auto hover:text-blue-500 transition-colors"
            >
              <span>مشاهدة المزيد</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "menu") {
    return (
      <div
        className="max-w-xl mx-auto py-4 px-4 font-sans h-full flex flex-col relative"
        dir="rtl"
      >
        {/* Custom Toast Notification - Moved here to be visible across views */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className={cn(
                "fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md",
                toast.type === "success"
                  ? "bg-emerald-500/90 text-white border-emerald-400"
                  : "bg-red-500/90 text-white border-red-400",
              )}
            >
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                {toast.type === "success" ? (
                  <Check size={14} />
                ) : (
                  <AlertTriangle size={14} />
                )}
              </div>
              <span className="text-xs font-black">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <Shield size={20} />
            </div>
            <div className="text-right">
              <h1 className="text-sm font-black text-slate-800 leading-none">
                {currentUser?.name}
              </h1>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {currentUser?.role === "admin" ? "SYSTEM ADM" : "OPERATOR"}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Link
              to="/"
              className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 hover:bg-white transition-all active:scale-90"
            >
              <ChevronRight size={18} className="rotate-180" />
            </Link>
            <button
              onClick={() => setShowNotifications(true)}
              className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center relative border border-slate-100 hover:bg-white transition-all active:scale-90"
            >
              <Bell size={18} />
              {notifications.filter((n) => n.unread).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {notifications.filter((n) => n.unread).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
          <div className="bg-slate-900 p-4 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <Activity size={14} className="text-emerald-400" />
              <span className="text-[8px] font-black text-slate-500">
                اليوم
              </span>
            </div>
            <p className="text-xl font-black leading-none mb-1">24</p>
            <p className="text-[8px] font-bold text-slate-500">البلاغات</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-[8px] font-black text-slate-500">
                النظام
              </span>
            </div>
            <p className="text-xl font-black text-slate-800 leading-none mb-1">
              متصل
            </p>
            <p className="text-[8px] font-bold text-slate-500">حالة الربط</p>
          </div>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pb-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 mt-2">
            الوظائف الرئيسية
          </p>
          {[
            {
              id: "add",
              title: "إضافة مخالفة",
              desc: "ضبط ميداني فوري",
              icon: <Plus size={20} />,
              color: "blue",
            },
            {
              id: "all",
              title: "سجل السجلات",
              desc: "استعراض البيانات",
              icon: <Activity size={18} />,
              color: "slate",
            },
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (item.id === "add") setView("form");
                if (item.id === "all") setView("all");
                if (item.id === "users") setView("users");
              }}
              className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-right hover:border-blue-100 transition-all group"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                  item.color === "blue"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white",
                )}
              >
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-slate-800">
                  {item.title}
                </h3>
                <p className="text-[9px] font-bold text-slate-400">
                  {item.desc}
                </p>
              </div>
              <ChevronLeft
                size={16}
                className="text-slate-200 group-hover:text-blue-500"
              />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (view === "form") {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setView("menu")}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
        >
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
            {/* Custom Toast Notification - Also here for form view */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: -20, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: -20, x: "-50%" }}
                  className={cn(
                    "fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md",
                    toast.type === "success"
                      ? "bg-emerald-500/90 text-white border-emerald-400"
                      : "bg-red-500/90 text-white border-red-400",
                  )}
                >
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    {toast.type === "success" ? (
                      <Check size={14} />
                    ) : (
                      <AlertTriangle size={14} />
                    )}
                  </div>
                  <span className="text-xs font-black">{toast.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-right">
              <h2 className="text-lg font-black text-slate-900">
                {editingId ? "تعديل البيانات" : "إضافة ضبط جديد"}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  خطوة {step} من 4
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setView("menu");
                setEditingId(null);
                setStep(1);
              }}
              className="w-9 h-9 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all active:scale-95"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-50 flex overflow-hidden">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-full transition-all duration-500 ease-out",
                  s <= step ? "bg-blue-600" : "bg-slate-100",
                  s === 1 ? "flex-1" : "flex-1 border-r border-white/20",
                )}
              />
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 no-scrollbar bg-slate-50/20">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Identity Data */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                    <User size={13} className="text-blue-600" />
                    <h3 className="text-[11px] font-black text-slate-900 uppercase">
                      بيانات الهوية
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 mr-2 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-blue-600" />
                        الاسم الكامل
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1 group">
                          <input
                            type="text"
                            value={form.fullName}
                            onChange={(e) =>
                              setForm({ ...form, fullName: e.target.value })
                            }
                            className={cn(
                              "w-full bg-white border border-slate-200 rounded-xl px-4 h-10 text-right text-[11px] font-black outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5",
                              errors.fullName ? "border-red-500 bg-red-50" : "",
                            )}
                            placeholder="الاسم اليدوي..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => alert("بدء التقاط صورة الهوية...")}
                          className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm shrink-0 active:scale-95 group"
                        >
                          <Camera size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 mr-2">
                          نوع الهوية
                        </label>
                        <select
                          value={form.idType}
                          onChange={(e) =>
                            setForm({ ...form, idType: e.target.value })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 h-10 text-[10px] font-black text-right outline-none appearance-none"
                        >
                          <option>بطاقة إلكترونية</option>
                          <option>بطاقة عادية</option>
                          <option>جواز سفر</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 mr-2">
                          رقم الهوية
                        </label>
                        <input
                          type="text"
                          value={form.idNumber}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              idNumber: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          className={cn(
                            "w-full bg-white border border-slate-200 rounded-xl px-3 h-10 text-[12px] font-black text-center outline-none tracking-widest transition-all",
                            errors.idNumber ? "border-red-500 bg-red-50 shadow-sm shadow-red-100" : "focus:border-blue-500"
                          )}
                          placeholder="000000000"
                        />
                        {errors.idNumber && (
                           <p className="text-[8px] text-red-500 font-bold mr-2 mt-0.5">{errors.idNumber}</p>
                        )}
                      </div>
                    </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 mr-2 flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-blue-600" />
                          أرقام الهاتف
                        </label>
                        <div className="space-y-2">
                          {form.phones.map((phone, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex gap-2">
                                <div className="relative flex-1 group">
                                  <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) =>
                                      updatePhone(index, e.target.value)
                                    }
                                    className={cn(
                                      "w-full bg-white border border-slate-200 rounded-xl pr-4 pl-10 h-10 text-right text-[11px] font-black outline-none transition-all focus:border-blue-500",
                                      errors[`phone_${index}`]
                                        ? "border-red-500 bg-red-50"
                                        : "",
                                    )}
                                    placeholder="7xxxxxxxx"
                                  />
                                  <Phone
                                    size={12}
                                    className={cn(
                                      "absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-colors",
                                      errors[`phone_${index}`]
                                        ? "text-red-400"
                                        : "group-focus-within:text-blue-500",
                                    )}
                                  />
                                </div>
                                {index === 0 ? (
                                  <button
                                    type="button"
                                    onClick={addPhone}
                                    className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm shrink-0 active:scale-95"
                                  >
                                    <Plus size={18} strokeWidth={2.5} />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => removePhone(index)}
                                    className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm shrink-0 active:scale-95"
                                  >
                                    <Minus size={18} strokeWidth={2.5} />
                                  </button>
                                )}
                              </div>
                              {errors[`phone_${index}`] && (
                                <p className="text-[8px] text-red-500 font-bold mr-2">
                                  {errors[`phone_${index}`]}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                </section>

                {/* Vehicle Data */}
                <section className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                    <Truck size={13} className="text-emerald-600" />
                    <h3 className="text-[11px] font-black text-slate-900 uppercase">
                      بيانات المركبة
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 mr-2">
                        نوع وجمال المركبة
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.vehicleType}
                          onChange={(e) =>
                            setForm({ ...form, vehicleType: e.target.value })
                          }
                          placeholder="صالون تيوتا..."
                          className={cn(
                             "flex-1 bg-white border border-slate-200 rounded-xl px-3 h-10 text-right text-[10px] font-black outline-none transition-all",
                             errors.vehicleType ? "border-red-500 bg-red-50" : "focus:border-blue-500"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => alert("Camera")}
                          className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm shrink-0 active:scale-95"
                        >
                          <Camera size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                      {errors.vehicleType && (
                         <p className="text-[8px] text-red-500 font-bold mr-2 mt-0.5">{errors.vehicleType}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 text-center block">
                        لوحة المركبة
                      </label>
                      <div className="flex gap-1 items-center">
                        <select
                          value={form.provinceCode}
                          onChange={(e) =>
                            setForm({ ...form, provinceCode: e.target.value })
                          }
                          className="w-10 h-10 bg-blue-600 text-white rounded-xl text-center font-black text-[10px] outline-none shrink-0 shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
                        >
                          {Array.from({ length: 22 }, (_, i) =>
                            String(i + 1),
                          ).map((n) => (
                            <option key={n}>{n}</option>
                          ))}
                        </select>

                        <input
                          value={form.plateNumber}
                          onChange={(e) =>
                            setForm({ ...form, plateNumber: e.target.value })
                          }
                          className={cn(
                            "flex-1 h-10 bg-white border border-slate-200 rounded-xl text-center font-black text-[18px] outline-none tracking-tight shadow-sm transition-all",
                            errors.plateNumber ? "border-red-500 bg-red-50" : "focus:border-blue-500"
                          )}
                          placeholder="00000"
                        />

                        <select
                          value={form.plateCategory}
                          onChange={(e) =>
                            setForm({ ...form, plateCategory: e.target.value })
                          }
                          className="w-14 h-10 bg-emerald-500 text-white rounded-xl text-center font-black text-[8px] outline-none shrink-0 px-1 shadow-sm hover:bg-emerald-600 transition-all cursor-pointer"
                        >
                          {["خصوصي", "نقل", "أجرة", "مؤقت", "جيش", "شرطة"].map(
                            (c) => (
                              <option key={c}>{c}</option>
                            ),
                          )}
                        </select>
                      </div>
                      {errors.plateNumber && (
                         <p className="text-[8px] text-red-500 font-bold mr-2 mt-0.5">{errors.plateNumber}</p>
                      )}
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <section className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-1.5">
                    <ShieldAlert size={14} className="text-orange-600" />
                    <h3 className="text-[12px] font-black text-slate-900">
                      تفاصيل الضبط
                    </h3>
                  </div>

                  <div className="flex gap-2">
                    {["أمنية", "مالية", "أخرى"].map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          setForm({
                            ...form,
                            violationCategory: c as any,
                            violationId: "",
                            description: "",
                          })
                        }
                        className={cn(
                          "flex-1 h-10 rounded-xl text-[11px] font-black transition-all border",
                          form.violationCategory === c
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white border-slate-200 text-slate-400 hover:border-blue-200 hover:text-blue-600",
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 mr-2 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-orange-500" />
                      نوع المخالفة
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 group">
                        <select
                          value={form.violationId}
                          onChange={(e) =>
                            handleViolationChange(e.target.value)
                          }
                          className={cn(
                            "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-10 text-right text-[11px] font-black outline-none appearance-none transition-all focus:bg-white focus:border-blue-500",
                            errors.violationId
                              ? "border-red-500 bg-red-50"
                              : "",
                          )}
                        >
                          <option value="">اختر النوع...</option>
                          {violationsList.map((v, i) => (
                            <option key={i} value={v.title}>
                              {v.title}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => alert("Camera")}
                        className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 active:scale-95 group"
                      >
                        <Camera size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 mr-2 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-orange-500" />
                      ملاحظات إضافية
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={3}
                      className={cn(
                        "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-right text-[11px] font-black outline-none transition-all resize-none focus:bg-white focus:border-blue-500",
                        errors.description ? "border-red-500 bg-red-50" : "",
                      )}
                      placeholder="أدخل الوصف التفصيلي هنا..."
                    />
                  </div>
                </section>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <section className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <h3 className="text-[12px] font-black text-slate-900">
                      الإجراء المنفذ
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 mr-2 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-500" />
                      نوع الإجراء
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 group">
                        <select
                          value={form.actionTaken}
                          onChange={(e) =>
                            setForm({ ...form, actionTaken: e.target.value })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-10 text-[11px] font-black text-right outline-none appearance-none transition-all focus:bg-white focus:border-blue-500"
                        >
                          <option>عمل التزام</option>
                          <option>عمل محضر ضبط</option>
                          <option>فرض غرامة مالية</option>
                          <option>توقيف مؤقت</option>
                          <option>تحويل للجهة المختصة</option>
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePhoto("commitment")}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-95",
                          capturedPhotos["commitment"]
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-emerald-50 text-emerald-600 border-emerald-100",
                        )}
                      >
                        <Camera size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 mr-2 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-500" />
                      ملاحظات ووثائق أخرى
                    </label>
                    <textarea
                      value={form.finalNotes}
                      onChange={(e) =>
                        setForm({ ...form, finalNotes: e.target.value })
                      }
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-black text-right outline-none transition-all resize-none focus:bg-white focus:border-blue-500"
                      placeholder="أي ملاحظات إضافية أو توثيق ملحق..."
                    />
                  </div>
                </section>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <section className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-50 pb-1.5">
                    <Eye size={14} className="text-blue-600" />
                    <h3 className="text-[12px] font-black text-slate-900">
                      المعاينة النهائية
                    </h3>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-right">
                      {[
                        { label: "الاسم", value: form.fullName },
                        {
                          label: "الهوية",
                          value: `${form.idType} - ${form.idNumber}`,
                        },
                        { label: "الهاتف", value: form.phones.join("، ") },
                        { label: "المركبة", value: form.vehicleType },
                        {
                          label: "اللوحة",
                          value: `${form.plateNumber} (${form.provinceCode} - ${form.plateCategory})`,
                        },
                        { label: "الفئة", value: form.violationCategory },
                        { label: "المخالفة", value: form.violationId },
                        { label: "الإجراء", value: form.actionTaken },
                      ].map((item, i) => (
                        <div key={i} className="space-y-0.5">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            {item.label}
                          </p>
                          <p className="text-[10px] font-bold text-slate-800 truncate">
                            {item.value || "لا يوجد"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      {
                        label: "الهوية",
                        type: "id_photo",
                        icon: <User size={14} />,
                      },
                      {
                        label: "المركبة",
                        type: "vehicle_photo",
                        icon: <Truck size={14} />,
                      },
                      {
                        label: "المخالفة",
                        type: "violation_photo",
                        icon: <ShieldAlert size={14} />,
                      },
                      {
                        label: "الالتزام",
                        type: "commitment",
                        icon: <CheckCircle2 size={14} />,
                      },
                    ].map((img, i) => (
                      <div
                        key={i}
                        className={cn(
                          "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all",
                          capturedPhotos[img.type]
                            ? "bg-white border-blue-500 text-blue-600"
                            : "bg-slate-50 border-slate-100 text-slate-300 opacity-60",
                        )}
                      >
                        {img.icon}
                        <span className="text-[8px] font-black">
                          {img.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="px-6 pt-4 pb-20 lg:pb-4 border-t border-slate-50 bg-white grid grid-cols-2 gap-3 shrink-0 sticky bottom-0 z-10">
            <button
              onClick={() => {
                if (step > 1) {
                  setStep((s) => s - 1);
                } else {
                  setView("menu");
                }
              }}
              className="h-11 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2 active:scale-95 border border-slate-100"
            >
              <ChevronRight size={14} className="rotate-180" />
              <span>{step === 1 ? "إلغاء" : "السابق"}</span>
            </button>
            <button
              onClick={() => {
                if (validate()) {
                  if (step < 4) {
                    setStep((s) => s + 1);
                  } else {
                    handleSave();
                  }
                }
              }}
              className={cn(
                "h-11 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg",
                step < 4
                  ? "bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700"
                  : "bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700",
              )}
            >
              <span>{step < 4 ? "متابعة" : "اعتماد وحفظ"}</span>
              {step < 4 ? <ArrowLeft size={14} /> : <Check size={14} />}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};

export const PropertyView = () => {
  const [currentUser] = useState<{
    username: string;
    role: "admin" | "user";
    name: string;
  } | null>({ username: "admin", role: "admin", name: "مدير النظام" });

  const [view, setView] = useState<"menu" | "all" | "form" | "delivery">("menu");
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("الكل");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, boolean>>(
    {},
  );

  // Data Persistence
  const [records, setRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem("property_records");
    return saved ? JSON.parse(saved) : [
      {
        id: "TR-001",
        ownerName: "خالد سعيد",
        idType: "بطاقة إلكترونية",
        idNumber: "1023948576",
        phones: ["777123456"],
        itemName: "مبلغ مالي",
        itemCategory: "نقدية",
        quantity: "500",
        description: "ريال سعودي ورقي",
        location: "الخزنة المركزية",
        status: "محرزة",
        receivedDate: "2024-05-12",
        notes: "تم الفرز",
        auditTrail: [{ action: "إيداع", time: "12/05/2024 10:30", by: "مدير النظام" }]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("property_records", JSON.stringify(records));
  }, [records]);

  const [form, setForm] = useState({
    ownerName: "",
    idType: "بطاقة إلكترونية",
    idNumber: "",
    phones: [""],
    itemName: "",
    itemCategory: "حقائب",
    quantity: "1",
    description: "",
    location: "مستودع الأمانات",
    receivedDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [deliveryForm, setDeliveryForm] = useState({
    actualReceiver: "",
    idType: "بطاقة إلكترونية",
    idNumber: "",
    authorizedBy: "",
    status: "مستلمة بالكامل",
    notes: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generateTicketId = () => {
    if (records.length === 0) return "TR-001";
    const ids = records.map(r => parseInt(r.id.split("-")[1])).filter(id => !isNaN(id));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return `TR-${String(maxId + 1).padStart(3, "0")}`;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!form.ownerName) newErrors.ownerName = "اسم المالك إجباري";
      if (!form.idNumber) newErrors.idNumber = "رقم الهوية إجباري";
    }
    if (step === 2) {
      if (!form.itemName) newErrors.itemName = "اسم المادة إجباري";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    const newRecord = {
      ...form,
      id: generateTicketId(),
      status: "محرزة",
      auditTrail: [{
        action: "إيداع جديد",
        time: new Date().toLocaleString(),
        by: currentUser?.name || "مستخدم"
      }]
    };
    setRecords([newRecord, ...records]);
    showToast("تم إيداع الأمانة بنجاح", "success");
    setView("all");
    setStep(1);
    setForm({
      ownerName: "",
      idType: "بطاقة إلكترونية",
      idNumber: "",
      phones: [""],
      itemName: "",
      itemCategory: "حقائب",
      quantity: "1",
      description: "",
      location: "مستودع الأمانات",
      receivedDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setCapturedPhotos({});
  };

  const handleDelivery = () => {
    if (!deliveryForm.actualReceiver || !deliveryForm.authorizedBy) {
      showToast("يرجى ملء الحقول الإجبارية", "error");
      return;
    }

    const updatedRecords = records.map(r => {
      if (r.id === selectedRecord.id) {
        return {
          ...r,
          status: "تم التسليم",
          deliveryDetails: { ...deliveryForm, date: new Date().toLocaleString() },
          auditTrail: [
            ...r.auditTrail,
            {
              action: `تسليم (${deliveryForm.status})`,
              time: new Date().toLocaleString(),
              by: currentUser?.name || "مستخدم"
            }
          ]
        };
      }
      return r;
    });

    setRecords(updatedRecords);
    showToast("تمت عملية التسليم بنجاح", "success");
    setView("all");
    setSelectedRecord(null);
    setDeliveryForm({
      actualReceiver: "",
      idType: "بطاقة إلكترونية",
      idNumber: "",
      authorizedBy: "",
      status: "مستلمة بالكامل",
      notes: ""
    });
  };

  const filteredRecords = records.filter(r => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = r.id.toLowerCase().includes(query) || 
                         r.ownerName.toLowerCase().includes(query) || 
                         r.itemName.toLowerCase().includes(query);
    const matchesCategory = filterCategory === "الكل" || r.itemCategory === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (view === "delivery" && selectedRecord) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setView("all")} />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col font-sans" dir="rtl">
          <div className="px-6 py-6 border-b border-slate-50 flex items-center justify-between">
            <button onClick={() => setView("all")} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center"><X size={18} /></button>
            <div className="text-right">
              <h3 className="text-lg font-black text-slate-800">إجراء عملية تسليم رسمية</h3>
              <p className="text-[10px] font-bold text-slate-400">OFFICIAL PROPERTY RELEASE</p>
            </div>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
              <div className="text-right">
                <p className="text-[10px] font-black text-emerald-700">الأمانة رقم: {selectedRecord.id}</p>
                <p className="text-xs font-bold text-emerald-800">{selectedRecord.description}</p>
              </div>
              <Package size={24} className="text-emerald-500" />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 mr-2">اسم المستلم الفعلي *</label>
              <input type="text" value={deliveryForm.actualReceiver} onChange={e => setDeliveryForm({...deliveryForm, actualReceiver: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-right text-xs font-black outline-none" placeholder="الاسم الرباعي من واقع الهوية" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 mr-2">نوع الهوية</label>
                <select value={deliveryForm.idType} onChange={e => setDeliveryForm({...deliveryForm, idType: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-right text-[11px] font-black outline-none appearance-none">
                  <option value="بطاقة إلكترونية">بطاقة شخصية</option>
                  <option value="جواز سفر">جواز سفر</option>
                  <option value="إقامة">إقامة</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 mr-2">رقم الهوية</label>
                <input type="text" value={deliveryForm.idNumber} onChange={e => setDeliveryForm({...deliveryForm, idNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-center text-xs font-black outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 mr-2">أطلقها بأمر من (المسؤول) *</label>
              <input type="text" value={deliveryForm.authorizedBy} onChange={e => setDeliveryForm({...deliveryForm, authorizedBy: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-right text-xs font-black outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 mr-2">حالة التسليم</label>
              <select value={deliveryForm.status} onChange={e => setDeliveryForm({...deliveryForm, status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-right text-[11px] font-black outline-none appearance-none">
                <option value="مستلمة بالكامل">مستلمة بالكامل</option>
                <option value="استلام جزئي">استلام جزئي</option>
                <option value="تالفة">تالفة / بها ملاحظات</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={() => showToast("يرجى التوقيع على الشاشة", "success")} className="flex-1 h-20 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-blue-200 hover:text-blue-500 transition-all">
                <Fingerprint size={24} />
                <span className="text-[9px] font-black">توقيع المستلم</span>
              </button>
            </div>
          </div>
          <div className="p-6 bg-slate-100/50 flex gap-3 sticky bottom-0">
            <button onClick={() => setView("all")} className="flex-1 h-12 bg-white rounded-2xl text-[11px] font-black text-slate-500 border border-slate-200">إلغاء</button>
            <button onClick={handleDelivery} className="flex-[1.5] h-12 bg-emerald-600 shadow-lg shadow-emerald-100 rounded-2xl text-[11px] font-black text-white">تأكيد التسليم الرسمي</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === "form") {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setView("menu")}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans"
          dir="rtl"
        >
          <div className="px-6 pt-8 pb-4 bg-white shrink-0 border-b border-slate-50">
             <div className="flex items-center justify-between mb-6">
                <button onClick={() => setView("menu")} className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all"><X size={20} /></button>
                <div className="text-right">
                  <h2 className="text-xl font-black text-slate-800">إيداع أمانة (TR)</h2>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">NEW PROPERTY DEPOSIT</p>
                </div>
             </div>
             <div className="flex items-center justify-between px-2">
                {[
                  { s: 1, l: "المالك" },
                  { s: 2, l: "المادة" },
                  { s: 3, l: "التوثيق" },
                  { s: 4, l: "المراجعة" },
                ].map((item) => (
                  <div key={item.s} className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all",
                      step === item.s ? "bg-emerald-600 text-white shadow-lg" : step > item.s ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                    )}>
                      {step > item.s ? <Check size={14} /> : item.s}
                    </div>
                    <span className={cn("text-[8px] font-black", step === item.s ? "text-emerald-600" : "text-slate-400")}>{item.l}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.section key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 mr-2">اسم صاحب الأمانة *</label>
                    <input
                      type="text"
                      value={form.ownerName}
                      onChange={e => setForm({ ...form, ownerName: e.target.value })}
                      className={cn("w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-right text-xs font-black outline-none transition-all focus:bg-white focus:border-emerald-500", errors.ownerName && "border-red-500 bg-red-50")}
                      placeholder="الاسم الكامل"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 mr-2">نوع الهوية</label>
                      <select
                        value={form.idType}
                        onChange={e => setForm({ ...form, idType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-right text-[11px] font-black outline-none appearance-none"
                      >
                        <option value="بطاقة إلكترونية">بطاقة شخصية</option>
                        <option value="جواز سفر">جواز سفر</option>
                        <option value="إقامة">إقامة</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 mr-2">رقم الهوية *</label>
                      <input
                        type="text"
                        value={form.idNumber}
                        onChange={e => setForm({ ...form, idNumber: e.target.value })}
                        className={cn("w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-center text-xs font-black outline-none transition-all focus:bg-white focus:border-emerald-500", errors.idNumber && "border-red-500 bg-red-50")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 mr-2">أرقام التواصل</label>
                    {form.phones.map((phone, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => {
                            const newPhones = [...form.phones];
                            newPhones[idx] = e.target.value;
                            setForm({ ...form, phones: newPhones });
                          }}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-right text-xs font-black outline-none focus:bg-white focus:border-emerald-500"
                          placeholder="رقم الجوال..."
                        />
                        {idx === 0 ? (
                          <button onClick={() => setForm({...form, phones: [...form.phones, ""]})} className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all"><Plus size={18} /></button>
                        ) : (
                          <button onClick={() => setForm({...form, phones: form.phones.filter((_, i) => i !== idx)})} className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"><Minus size={18} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {step === 2 && (
                <motion.section key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 mr-2">اسم المادة / الأمانة *</label>
                    <input
                      type="text"
                      value={form.itemName}
                      onChange={e => setForm({ ...form, itemName: e.target.value })}
                      className={cn("w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-right text-xs font-black outline-none transition-all focus:bg-white focus:border-emerald-500", errors.itemName && "border-red-500 bg-red-50")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 mr-2">الفئة</label>
                      <select
                        value={form.itemCategory}
                        onChange={e => setForm({ ...form, itemCategory: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-right text-[11px] font-black outline-none appearance-none"
                      >
                        <option value="نقدية">أمانات نقدية</option>
                        <option value="حقائب">حقائب وأمتعة</option>
                        <option value="إلكترونيات">أجهزة إلكترونية</option>
                        <option value="وثائق">وثائق رسمية</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 mr-2">الكمية / العدد</label>
                      <input
                        type="text"
                        value={form.quantity}
                        onChange={e => setForm({ ...form, quantity: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-center text-xs font-black outline-none focus:bg-white focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 mr-2">موقع التخزين الحالي</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-center text-xs font-black outline-none"
                    />
                  </div>
                </motion.section>
              )}

              {step === 3 && (
                <motion.section key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 mr-2">وصف تفصيلي للمادة</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-right text-xs font-black outline-none focus:bg-white focus:border-emerald-500 resize-none"
                      placeholder="صف حالة الأمانة بدقة..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 mr-2">ملاحظات إضافية</label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-right text-xs font-black outline-none focus:bg-white focus:border-emerald-500 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => setCapturedPhotos(p => ({...p, content: !p.content}))} className={cn("h-20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1 transition-all", capturedPhotos.content ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "border-slate-100 text-slate-400 hover:border-slate-200 hover:text-emerald-500")}>
                        <Camera size={20} />
                        <span className="text-[8px] font-black tracking-widest uppercase">صورة الأمانة</span>
                     </button>
                     <button onClick={() => setCapturedPhotos(p => ({...p, id_card: !p.id_card}))} className={cn("h-20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1 transition-all", capturedPhotos.id_card ? "bg-blue-50 border-blue-500 text-blue-600" : "border-slate-100 text-slate-400 hover:border-slate-200 hover:text-blue-500")}>
                        <CreditCard size={20} />
                        <span className="text-[8px] font-black tracking-widest uppercase">صورة الهوية</span>
                     </button>
                  </div>
                </motion.section>
              )}

              {step === 4 && (
                <motion.section key="s4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-3">
                  <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white text-right relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Package size={80} /></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-lg"><Info size={20} /></div>
                        <div>
                          <p className="text-[8px] opacity-50 uppercase font-black tracking-widest">مراجعة بيانات الإيداع</p>
                          <h3 className="text-sm font-black">{generateTicketId()}</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                        <div>
                          <p className="text-[7px] font-black opacity-40 uppercase">اسم صاحب الأمانة</p>
                          <p className="text-[10px] font-bold truncate">{form.ownerName}</p>
                        </div>
                        <div>
                          <p className="text-[7px] font-black opacity-40 uppercase">المادة</p>
                          <p className="text-[10px] font-bold truncate">{form.itemName}</p>
                        </div>
                        <div>
                          <p className="text-[7px] font-black opacity-40 uppercase">الفئة</p>
                          <p className="text-[10px] font-bold">{form.itemCategory}</p>
                        </div>
                        <div>
                          <p className="text-[7px] font-black opacity-40 uppercase">الكمية</p>
                          <p className="text-[10px] font-bold">{form.quantity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl flex items-start gap-3 border border-amber-100">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-800 leading-relaxed text-right">يرجى مراجعة كافة البيانات قبل الحفظ، حيث لا يمكن تعديل بعض الحقول بعد إصدار السند النهائي المطبوع.</p>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          <div className="px-6 pb-20 pt-4 bg-white border-t border-slate-50 flex gap-3 shrink-0 sticky bottom-0">
             <button onClick={() => step === 1 ? setView("menu") : setStep(step - 1)} className="flex-1 h-12 rounded-2xl bg-slate-50 text-slate-500 font-black text-[11px] flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-95">
                <ArrowRight size={14} />
                <span>{step === 1 ? "إلغاء الأمر" : "السابق"}</span>
             </button>
             <button 
                onClick={() => { if(validate()) { if(step < 4) setStep(step+1); else handleSave(); } }} 
                className={cn(
                  "flex-[1.5] h-12 rounded-2xl text-white font-black text-[11px] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95",
                  step === 4 ? "bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700" : "bg-blue-600 shadow-blue-100 hover:bg-blue-700"
                )}
             >
                <span>{step === 4 ? "تأكيد الإيداع النهائي" : "متابعة الطلب"}</span>
                <ArrowLeft size={14} />
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === "all") {
    return (
      <div className="max-w-2xl mx-auto py-6 mb-24 font-sans h-full overflow-y-auto no-scrollbar" dir="rtl">
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }} className={cn("fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md", toast.type === "success" ? "bg-emerald-500/90 text-white border-emerald-400" : "bg-red-500/90 text-white border-red-400")}>
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                {toast.type === "success" ? <Check size={14} /> : <AlertTriangle size={14} />}
              </div>
              <span className="text-xs font-black">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">سجل الأمانات</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">PROPERTY RECORDS REGISTRY</p>
            </div>
            <button onClick={() => setView("menu")} className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 hover:bg-slate-50 transition-all active:scale-95"><ChevronRight className="rotate-180" size={20} /></button>
          </div>

          <div className="relative">
            <input type="text" placeholder="البحث برقم الإيداع أو اسم المودع..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl px-5 h-12 pr-12 text-right text-xs font-bold outline-none shadow-sm focus:border-emerald-500 transition-all" />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-50">
            {["الكل", "حقيبة", "طرد", "مستندات", "مبلغ مالي"].map(cat => (
              <button key={cat} onClick={() => setFilterCategory(cat)} className={cn("px-6 h-10 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border", filterCategory === cat ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100" : "bg-white border-slate-100 text-slate-400 hover:border-emerald-600 active:scale-95")}>{cat}</button>
            ))}
          </div>
        </div>

        <div className="space-y-4 px-5 mt-6 pb-12">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[3.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
               <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                  <Package size={40} />
               </div>
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">لا توجد سجلات مطابقة حالياً</p>
            </div>
          ) : filteredRecords.map(record => (
            <motion.div key={record.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] p-7 border border-slate-50 shadow-sm relative group hover:border-emerald-100 transition-all">
               <div className="flex items-center gap-5">
                  <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center border shadow-sm transition-all", record.status === "محرزة" ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100")}>
                    <Package size={32} />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-2 mb-1 justify-end">
                       <span className={cn("px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest", record.status === "محرزة" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>{record.status}</span>
                       <h3 className="text-[14px] font-black text-slate-800 leading-tight truncate max-w-[180px]">{record.itemName || "بدون اسم"}</h3>
                    </div>
                    <div className="flex items-center gap-3 justify-end">
                       <p className="text-[10px] font-bold text-slate-400 font-mono">#{record.id}</p>
                       <div className="w-1 h-1 bg-slate-200 rounded-full" />
                       <p className="text-[10px] font-bold text-slate-500">{record.ownerName}</p>
                       <div className="w-1 h-1 bg-slate-200 rounded-full" />
                       <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 font-mono">{record.receivedDate}</p>
                    </div>
                  </div>
               </div>
               
               <div className="mt-6 grid grid-cols-3 gap-3 pt-5 border-t border-slate-50">
                  <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">موقع التخزين</p>
                    <p className="text-[11px] font-black text-slate-700 truncate">{record.location || "غير محدد"}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">التصنيف</p>
                    <p className="text-[11px] font-black text-slate-700">{record.itemCategory}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">الكمية</p>
                    <p className="text-[11px] font-black text-slate-700">{record.quantity}</p>
                  </div>
               </div>

               {record.status === "محرزة" && (
                 <div className="mt-5 flex gap-2">
                    <button onClick={() => { setSelectedRecord(record); setView("delivery"); }} className="flex-1 h-11 bg-emerald-600 text-white rounded-2xl text-[11px] font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                       <Navigation size={16} />
                       <span>تنفيذ عملية تسليم رسمية</span>
                    </button>
                 </div>
               )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "menu") {
    const stats = {
      total: records.length,
      pending: records.filter(r => r.status === "محرزة").length,
      delivered: records.filter(r => r.status === "تم التسليم").length
    };

    return (
      <div className="max-w-2xl mx-auto py-6 px-5 font-sans h-full flex flex-col no-scrollbar" dir="rtl">
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-[2rem] shadow-sm border border-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <Package size={24} strokeWidth={2.5} />
            </div>
            <div className="text-right">
              <h1 className="text-lg font-black text-slate-800 leading-none">نظام الأمانات والعهد</h1>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">PROPERTY CONTROL & REGISTRY</p>
            </div>
          </div>
          <Link to="/" className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 hover:bg-white transition-all active:scale-90">
            <ChevronRight size={20} className="rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.button 
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.96 }} 
            onClick={() => setView("form")} 
            className="bg-emerald-600 h-40 rounded-[2.5rem] p-7 text-white text-right relative overflow-hidden group shadow-xl shadow-emerald-100"
          >
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <Plus size={36} strokeWidth={3} className="mb-auto opacity-40" />
              <div>
                <h3 className="text-lg font-black leading-none mb-1.5">إيداع جديد</h3>
                <p className="text-[10px] font-bold opacity-70">تسجيل أمانة واردة جديدة</p>
              </div>
            </div>
          </motion.button>
          
          <motion.button 
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.96 }} 
            onClick={() => setView("all")} 
            className="bg-white h-40 rounded-[2.5rem] p-7 border border-slate-50 text-right relative overflow-hidden group shadow-sm hover:border-emerald-200 transition-all"
          >
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-50 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <Search size={36} strokeWidth={2.5} className="mb-auto text-emerald-500 opacity-20" />
              <div>
                <h3 className="text-lg font-black text-slate-800 leading-none mb-1.5">السجل العام</h3>
                <p className="text-[10px] font-bold text-slate-400">متابعة وتسليم الأمانات</p>
              </div>
            </div>
          </motion.button>
        </div>

        <div className="space-y-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 opacity-60">مركز الإحصائيات الفوري</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'إجمالي السجلات', value: stats.total, color: 'emerald' },
              { label: 'محرزة حالياً', value: stats.pending, color: 'blue' },
              { label: 'تم تسليمها', value: stats.delivered, color: 'slate' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 py-5 rounded-[2rem] border border-slate-50 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className={cn("text-xl font-black mb-0.5", stat.color === 'emerald' ? 'text-emerald-600' : stat.color === 'blue' ? 'text-blue-600' : 'text-slate-600')}>{stat.value}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-10 pb-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Active & Secure</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};


export const ReportsView = () => (
  <ModuleView
    title="نظام البلاغات والشكاوي"
    description="استقبال ومعالجة البلاغات والشكاوي الفورية وتوثيقها بدقة."
    icon={Activity}
    color="bg-indigo-500"
    dataLabel="الجهة المبلغة / نوع البلاغ"
  />
);

export const UsersView = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "admin",
      role: "مدير نظام",
      status: "معطل",
      location: "لم يتم تعيين موقع",
      date: "2026/04/03",
    },
    {
      id: 2,
      name: "YASER",
      role: "مستخدم ميداني",
      status: "نشط",
      location: "الدهبلي",
      date: "2026/04/03",
    },
    {
      id: 3,
      name: "MO",
      role: "مستخدم ميداني",
      status: "نشط",
      location: "الدهبلي",
      date: "2026/04/04",
    },
  ]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "مستخدم ميداني",
    location: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header Image 1 Styled */}
      <div className="flex justify-between items-center px-2">
        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-[13px] font-black transition-all border border-slate-100 shadow-sm"
        >
          <span>العودة للرئيسية</span>
          <ChevronLeft size={18} />
        </Link>
        <div className="text-right">
          <h1 className="text-[28px] font-black text-[#001c3d] leading-none mb-1">
            إدارة المستخدمين
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">
            SYSTEM ACCESS CONTROL
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="w-full py-5 bg-[#004af0] text-white rounded-3xl text-[16px] font-black shadow-xl shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-blue-700"
      >
        <UserPlus size={22} />
        <span>إضافة مستخدم جديد</span>
      </button>

      {/* User Cards Image 1 Styled */}
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-[40px] p-8 border border-slate-50 shadow-sm hover:shadow-md transition-all relative group"
          >
            <div className="flex justify-between items-start">
              <span
                className={cn(
                  "px-4 py-1.5 rounded-full text-[12px] font-black",
                  user.status === "نشط"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600",
                )}
              >
                {user.status}
              </span>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <h3 className="text-[22px] font-black text-[#001c3d] leading-none mb-1">
                    {user.name}
                  </h3>
                  <p className="text-[12px] font-bold text-slate-400">
                    {user.role}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-16 h-16 rounded-[24px] flex items-center justify-center border-2",
                    user.status === "نشط"
                      ? "bg-blue-50/50 border-blue-100 text-blue-600"
                      : "bg-purple-50/50 border-purple-100 text-purple-600",
                  )}
                >
                  <Shield size={32} />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-end gap-3 text-slate-400 font-bold text-[12px]">
              <div className="flex items-center gap-2">
                <span>{user.location}</span>
                <span className="material-symbols-outlined !text-[18px]">
                  location_on
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>{user.date}</span>
                <span className="material-symbols-outlined !text-[18px]">
                  schedule
                </span>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">
                <Trash2 size={22} />
              </button>
              <button
                className={cn(
                  "flex-1 rounded-2xl flex items-center justify-center gap-2 text-[14px] font-black transition-all border",
                  user.status === "نشط"
                    ? "bg-red-50 text-red-500 border-red-100 hover:bg-red-100"
                    : "bg-emerald-50 text-emerald-500 border-emerald-100 hover:bg-emerald-100",
                )}
              >
                <span className="material-symbols-outlined">
                  {user.status === "نشط" ? "cancel" : "check_circle"}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Modal Image 5 Styled */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 p-2 hover:bg-slate-50 rounded-lg"
                >
                  <X size={20} />
                </button>
                <div className="text-right">
                  <h3 className="text-lg font-black text-slate-800">
                    إنشاء مستخدم جديد
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400">
                    تحديد الصلاحيات وموقع العمل للموظف.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black text-slate-500 mb-1.5 block px-1">
                    اسم المستخدم الكامل
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-right outline-none focus:bg-white focus:border-blue-500"
                    placeholder="اسم المستخدم للدخول"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-500 mb-1.5 block px-1">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                    >
                      <Eye size={16} />
                    </button>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-center tracking-widest outline-none focus:bg-white focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 px-1">
                      موقع العمل
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-black text-right outline-none focus:bg-white focus:border-blue-500"
                      placeholder="القطاع..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 px-1">
                      الدور الوظيفي
                    </label>
                    <div className="relative">
                      <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-black text-right outline-none appearance-none focus:bg-white focus:border-blue-500">
                        <option>مستخدم ميداني</option>
                        <option>مدير نظام</option>
                        <option>مشرف عام</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition-all"
                  >
                    إلغاء الأمر
                  </button>
                  <button className="flex-[1.5] py-3 bg-blue-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-blue-700 transition-all">
                    تأكيد الإنشاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AuditLogsView = () => {
  const [filter, setFilter] = useState("");
  const [isFrozen, setIsFrozen] = useState(false);

  const initialLogs = [
    {
      time: "apr/28/2026 16:50:02",
      topics: "system,info",
      message: "user admin logged in from 192.168.88.10 via winbox",
    },
    {
      time: "apr/28/2026 16:50:15",
      topics: "interface,info",
      message: "ether1 link up (speed 1Gbps, full duplex)",
    },
    {
      time: "apr/28/2026 16:51:00",
      topics: "firewall,info",
      message:
        "input: in:ether1 out:(unknown 0), src-mac 00:11:22:33:44:55, proto TCP (SYN), 1.2.3.4:443->192.168.88.1, len 60",
    },
    {
      time: "apr/28/2026 16:52:10",
      topics: "system,info",
      message: "device configuration changed by admin",
    },
    {
      time: "apr/28/2026 16:53:05",
      topics: "dhcp,debug,packet",
      message: "dhcp1 sending ACK to 192.168.88.15",
    },
    {
      time: "apr/28/2026 16:54:12",
      topics: "wireless,info",
      message: "00:AA:BB:CC:DD:EE@wlan1: connected, signal strength -52dBm",
    },
    {
      time: "apr/28/2026 16:55:00",
      topics: "script,info",
      message: "backup-script: backup created locally",
    },
    {
      time: "apr/28/2026 16:56:45",
      topics: "system,error,critical",
      message: "disk failure detected on secondary storage",
    },
    {
      time: "apr/28/2026 16:57:30",
      topics: "system,info,account",
      message: 'user "manager" added with full permissions',
    },
    {
      time: "apr/28/2026 16:58:12",
      topics: "firewall,info",
      message:
        "forward: in:bridge-local out:ether1, src-mac AA:BB:CC:DD:EE:FF, proto UDP, 192.168.88.15:53->8.8.8.8:53, len 72",
    },
  ];

  const [logs, setLogs] = useState(initialLogs);

  const filteredLogs = logs.filter(
    (log) =>
      log.message.toLowerCase().includes(filter.toLowerCase()) ||
      log.topics.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-[#f0f0f0] border-2 border-[#d4d4d4] rounded-sm font-mono shadow-inner overflow-hidden select-none">
      {/* MikroTik Window Header */}
      <div className="flex items-center justify-between bg-gradient-to-b from-[#fdfdfd] to-[#e6e6e6] px-2 py-1 border-b border-[#a0a0a0]">
        <div className="flex items-center gap-2">
          <div className="bg-[#4a6ba5] p-0.5 rounded-sm">
            <History size={12} className="text-white" />
          </div>
          <span className="text-[11px] font-bold text-[#333]">Log</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="px-1 hover:bg-red-500 hover:text-white transition-colors">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* WinBox Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#f5f5f5] border-b border-[#ccc] text-[11px]">
        <div className="flex items-center gap-2 mr-2 group">
          <span className="text-[#666] font-bold">Filter:</span>
          <div className="relative flex items-center">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-[#ccc] border-inset bg-white px-2 h-6 outline-none focus:border-[#4a6ba5] focus:ring-1 focus:ring-[#4a6ba5]/20 min-w-[200px] font-mono transition-all"
              placeholder="Search logs..."
            />
            <Search
              size={10}
              className="absolute right-2 text-[#ccc] group-focus-within:text-[#4a6ba5]"
            />
          </div>
        </div>
        <button
          onClick={() => setIsFrozen(!isFrozen)}
          className={cn(
            "px-3 h-5 border flex items-center justify-center transition-all shadow-sm active:shadow-inner",
            isFrozen
              ? "bg-[#4a6ba5] text-white border-[#3a5b95]"
              : "bg-[#f5f5f5] text-[#333] border-[#ccc] hover:bg-white",
          )}
        >
          {isFrozen ? "Unfreeze" : "Freeze"}
        </button>
        <button className="px-3 h-5 border border-[#ccc] bg-[#f5f5f5] text-[#333] hover:bg-white flex items-center justify-center transition-all shadow-sm active:shadow-inner">
          Setup
        </button>
        <button
          onClick={() => setLogs([])}
          className="px-3 h-5 border border-[#ccc] bg-[#f5f5f5] text-[#333] hover:bg-white flex items-center justify-center transition-all shadow-sm active:shadow-inner"
        >
          Clear Log
        </button>
        <div className="flex-grow" />
        <div className="flex items-center gap-1 px-2 border-l border-[#ccc]">
          <span className="text-[#666]">Count:</span>
          <span className="font-bold">{filteredLogs.length}</span>
        </div>
      </div>

      {/* Table Header */}
      <div className="flex bg-[#f5f5f5] border-b border-[#ccc] text-[11px] font-bold select-none cursor-default">
        <div className="w-[180px] border-r border-[#ccc] px-2 py-0.5 hover:bg-[#e0e0e0] flex items-center gap-1 group">
          <span>Time</span>
          <ChevronDown
            size={10}
            className="text-transparent group-hover:text-slate-400"
          />
        </div>
        <div className="w-[150px] border-r border-[#ccc] px-2 py-0.5 hover:bg-[#e0e0e0] flex items-center gap-1 group">
          <span>Topics</span>
          <ChevronDown
            size={10}
            className="text-transparent group-hover:text-slate-400"
          />
        </div>
        <div className="flex-grow px-2 py-0.5 hover:bg-[#e0e0e0] flex items-center gap-1 group">
          <span>Message</span>
          <ChevronDown
            size={10}
            className="text-transparent group-hover:text-slate-400"
          />
        </div>
      </div>

      {/* Log Body */}
      <div className="flex-grow bg-white overflow-y-auto overflow-x-hidden text-[11px] leading-tight">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, i) => (
            <div
              key={i}
              className={cn(
                "flex border-b border-[#f0f0f0] group hover:bg-[#f0f7ff] cursor-default",
                log.topics.includes("error")
                  ? "text-red-600"
                  : log.topics.includes("critical")
                    ? "text-red-700 bg-red-50"
                    : log.topics.includes("warning")
                      ? "text-amber-600"
                      : "text-[#333]",
              )}
            >
              <div className="w-[180px] min-w-[180px] px-2 border-r border-[#f0f0f0] py-0.5 whitespace-nowrap">
                {log.time}
              </div>
              <div className="w-[150px] min-w-[150px] px-2 border-r border-[#f0f0f0] py-0.5 font-bold italic truncate">
                {log.topics}
              </div>
              <div className="flex-grow px-2 py-0.5 break-all">
                {log.message}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-slate-400 italic">
            No entries to display
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-[#f0f0f0] border-t border-[#ccc] px-2 py-0.5 text-[9px] text-[#666] flex justify-between">
        <span>MikroTik RouterOS Log Viewer v7.x</span>
        <span>Connected to CMS_SECURE_NODE</span>
      </div>
    </div>
  );
};

export const PermissionsView = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-50 pb-4">
        <div className="text-right">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            صلاحيات وأدوار النظام
          </h2>
          <p className="text-[11px] font-bold text-slate-400">
            توزيع الصلاحيات على حسب المسمى الوظيفي للموظف.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-black hover:bg-blue-700 transition-all shadow-md">
          <Plus size={16} />
          <span>إضافة دور جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-right">
        {[
          {
            icon: Shield,
            title: "مدير نظام (Super Admin)",
            users: 2,
            access: "تحكم كامل",
            color: "text-red-600 bg-red-50",
          },
          {
            icon: Eye,
            title: "مشغل (Operator)",
            users: 12,
            access: "إدخال وعرض محدود",
            color: "text-blue-600 bg-blue-50",
          },
          {
            icon: ShieldCheck,
            title: "مشرف (Moderator)",
            users: 3,
            access: "اعتماد ومراجعة",
            color: "text-emerald-600 bg-emerald-50",
          },
        ].map((role, i) => (
          <div
            key={i}
            className="p-4 border border-slate-50 rounded-2xl hover:border-slate-200 hover:bg-slate-50/30 transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div
                className={cn(
                  "p-2.5 rounded-xl transition-transform group-hover:scale-105",
                  role.color,
                )}
              >
                <role.icon size={18} />
              </div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                {role.users} نشط
              </span>
            </div>
            <h3 className="text-xs font-black text-slate-800 mb-0.5">
              {role.title}
            </h3>
            <p className="text-[10px] font-bold text-slate-400">
              {role.access}
            </p>
            <div className="mt-3 flex gap-1 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-1/2 bg-blue-600" />
              <div className="w-1/4 bg-blue-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SettingsView = () => {
  const [activeTab, setActiveTab] = useState("logs");

  return (
    <div className="space-y-6 md:px-0">
      {/* Return Navigation */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-slate-100/50 hover:bg-slate-200/80 text-slate-600 rounded-2xl text-[13px] font-black transition-all group"
        >
          <ChevronRight
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>الرئيسية</span>
        </Link>
        <span className="text-blue-500 text-[13px] font-black">
          إعدادات النظام
        </span>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-slate-900 mb-0.5">
          مركز التحكم والإدارة
        </h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          CONTROL PANEL & LOGS
        </p>
      </div>

      <div className="flex gap-1.5 p-1.5 bg-slate-100/50 rounded-2xl w-fit mx-auto mb-6 border border-slate-100">
        <button
          onClick={() => setActiveTab("logs")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300",
            activeTab === "logs"
              ? "bg-white text-slate-900 shadow-sm border border-slate-100"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          <History
            size={14}
            className={activeTab === "logs" ? "text-blue-600" : ""}
          />
          <span>سجل تتبع العمليات</span>
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300",
            activeTab === "permissions"
              ? "bg-white text-slate-900 shadow-sm border border-slate-100"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          <Lock
            size={14}
            className={activeTab === "permissions" ? "text-blue-600" : ""}
          />
          <span>إدارة الصلاحيات</span>
        </button>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "logs" ? <AuditLogsView /> : <PermissionsView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
