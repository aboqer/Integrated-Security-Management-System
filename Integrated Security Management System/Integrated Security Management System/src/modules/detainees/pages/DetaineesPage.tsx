import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  FileText,
  Plus,
  Save,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../../lib/utils";
import type {
  DetaineeCase,
  DetaineeFormState,
  FileStatus,
  TransferDestination,
} from "../types";

const STORAGE_KEY = "isms_detainees";

const initialFormState: DetaineeFormState = {
  detaineeType: "civilian",
  fullName: "",
  idNumber: "",
  nationality: "",
  phone: "",
  address: "",
  militaryRank: "",
  militaryNumber: "",
  unitName: "",
  lastDutyDate: "",
  accusation: "",
  status: "initial_investigation",
  transferDestination: undefined,
  seizedItems: [],
  photos: {},
};

const statusLabels: Record<FileStatus, string> = {
  initial_investigation: "تحقيق أولي",
  under_procedure: "تحت الإجراء",
  transferred: "محول",
  joint_operation: "عمليات مشتركة",
  closed_released: "مغلق",
};

const statusClasses: Record<FileStatus, string> = {
  initial_investigation: "bg-amber-100 text-amber-700",
  under_procedure: "bg-slate-100 text-slate-700",
  transferred: "bg-violet-100 text-violet-700",
  joint_operation: "bg-orange-100 text-orange-700",
  closed_released: "bg-emerald-100 text-emerald-700",
};

const destinationLabels: Record<TransferDestination, string> = {
  joint_ops: "العمليات المشتركة",
  state_security: "أمن الدولة",
  military_intel: "استخبارات عسكرية",
  military_investigations: "مباحث عسكرية",
  military_security: "أمن عسكري",
  criminal_investigation: "بحث جنائي",
  security_management: "إدارة الأمن",
};

const demoCases: DetaineeCase[] = [
  {
    id: "101",
    caseNumber: "DET-2024-055",
    registrationDate: "2024-05-21",
    detaineeType: "military",
    fullName: "جندي أول محمد سالم",
    idNumber: "988776655",
    nationality: "يمني",
    militaryRank: "جندي أول",
    militaryNumber: "123456",
    unitName: "كتيبة المشاة الثالثة",
    accusation: "تجاوز صلاحيات أثناء duty",
    status: "transferred",
    transferDestination: "military_intel",
    loggedBy: "الرقيب أحمد",
    procedureLogs: [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        action: "تسجيل أولي وتحويل",
        officer: "الرقيب أحمد",
        details: "تم التحويل إلى الاستخبارات العسكرية",
      },
    ],
    seizedItems: [{ id: "1", name: "هاتف جوال", description: "سامسونج", quantity: 1 }],
    createdAt: new Date().toISOString(),
    photos: {},
  },
  {
    id: "102",
    caseNumber: "DET-2024-056",
    registrationDate: "2024-05-22",
    detaineeType: "civilian",
    fullName: "خالد علي عمر",
    idNumber: "1029384756",
    nationality: "يمني",
    phone: "777123456",
    address: "تعز - القاهرة",
    accusation: "محاولة عبور غير نظامي",
    status: "initial_investigation",
    loggedBy: "العريف يوسف",
    procedureLogs: [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        action: "تسجيل أولي",
        officer: "العريف يوسف",
      },
    ],
    seizedItems: [],
    createdAt: new Date().toISOString(),
    photos: {},
  },
];

export function DetaineesPage() {
  const [records, setRecords] = useState<DetaineeCase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FileStatus>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DetaineeCase | null>(null);
  const [formData, setFormData] = useState<DetaineeFormState>(initialFormState);
  const [tempItem, setTempItem] = useState({ name: "", description: "", quantity: 1 });
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showCamField, setShowCamField] = useState<"detaineePhoto" | "idPhoto" | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setRecords(JSON.parse(saved) as DetaineeCase[]);
      return;
    }
    setRecords(demoCases);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoCases));
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => () => stopCamera(), []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.fullName.includes(searchTerm) ||
        record.caseNumber.includes(searchTerm) ||
        record.idNumber.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, statusFilter]);

  const stats = [
    {
      label: "إجمالي القضايا",
      value: records.length,
      color: "bg-slate-900 text-white",
      accent: "bg-white/10",
    },
    {
      label: "تحقيق أولي",
      value: records.filter((record) => record.status === "initial_investigation").length,
      color: "bg-white text-slate-900 border border-slate-100",
      accent: "bg-amber-100",
    },
    {
      label: "قيد الإجراء",
      value:
        records.filter(
          (record) => record.status === "under_procedure" || record.status === "joint_operation",
        ).length,
      color: "bg-white text-slate-900 border border-slate-100",
      accent: "bg-orange-100",
    },
    {
      label: "محول",
      value: records.filter((record) => record.status === "transferred").length,
      color: "bg-white text-slate-900 border border-slate-100",
      accent: "bg-violet-100",
    },
  ];

  function persist(next: DetaineeCase[]) {
    setRecords(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function resetForm() {
    setFormData(initialFormState);
    setTempItem({ name: "", description: "", quantity: 1 });
    setShowCamField(null);
    stopCamera();
  }

  function openCreateModal() {
    resetForm();
    setIsFormOpen(true);
  }

  function addSeizedItem() {
    if (!tempItem.name.trim()) {
      return;
    }

    setFormData((current) => ({
      ...current,
      seizedItems: [
        ...current.seizedItems,
        {
          id: Date.now().toString(),
          name: tempItem.name.trim(),
          description: tempItem.description.trim(),
          quantity: tempItem.quantity,
        },
      ],
    }));
    setTempItem({ name: "", description: "", quantity: 1 });
  }

  function removeSeizedItem(id: string) {
    setFormData((current) => ({
      ...current,
      seizedItems: current.seizedItems.filter((item) => item.id !== id),
    }));
  }

  function saveRecord() {
    if (!formData.fullName.trim() || !formData.accusation.trim() || !formData.idNumber.trim()) {
      setToast({ type: "error", message: "يرجى تعبئة الاسم ورقم الهوية والتهمة" });
      return;
    }

    const nextRecord: DetaineeCase = {
      id: Date.now().toString(),
      caseNumber: `DET-${new Date().getFullYear()}-${String(records.length + 1).padStart(3, "0")}`,
      registrationDate: new Date().toISOString().split("T")[0],
      ...formData,
      loggedBy: "المستخدم الحالي",
      procedureLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: "إنشاء ملف توقيف",
          officer: "المستخدم الحالي",
          details: `تم فتح الملف تحت بند: ${formData.accusation}`,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    persist([nextRecord, ...records]);
    setIsFormOpen(false);
    resetForm();
    setToast({ type: "success", message: "تم توثيق حالة التوقيف بنجاح" });
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setToast({ type: "error", message: `تعذر الوصول إلى الكاميرا: ${String(error)}` });
      setShowCamField(null);
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }

  function captureImage() {
    if (!videoRef.current || !canvasRef.current || !showCamField) {
      return;
    }
    const context = canvasRef.current.getContext("2d");
    if (!context) {
      return;
    }
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const image = canvasRef.current.toDataURL("image/jpeg");
    setFormData((current) => ({
      ...current,
      photos: {
        ...current.photos,
        [showCamField]: image,
      },
    }));
    stopCamera();
    setShowCamField(null);
    setToast({ type: "success", message: "تم التقاط الصورة" });
  }

  return (
    <div className="mx-auto max-w-7xl px-2 py-2 pb-24 font-sans sm:px-3 md:px-4" dir="rtl">
      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: -18, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -18, x: "-50%" }}
            className={cn(
              "fixed top-6 left-1/2 z-[999] flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-2xl backdrop-blur",
              toast.type === "success"
                ? "border-emerald-400 bg-emerald-500/90 text-white"
                : "border-red-400 bg-red-500/90 text-white",
            )}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              {toast.type === "success" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            </div>
            <span className="text-xs font-black">{toast.message}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-right min-w-0">
            <h1 className="text-lg font-black tracking-tight text-slate-900">سجل التوقيف والتحقيق</h1>
            <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              DETENTION RECORDS
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-[11px] font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95 sm:w-auto"
          >
            <Plus size={16} />
            <span>تسجيل حالة جديدة</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "relative overflow-hidden rounded-2xl p-4 shadow-sm sm:p-5",
                stat.color,
              )}
            >
              <div className={cn("absolute -left-3 -top-3 h-16 w-16 rounded-full blur-2xl", stat.accent)} />
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{stat.label}</p>
              <p className="mt-2 text-xl font-black sm:text-2xl">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[1.8rem] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder="بحث بالاسم أو رقم القضية أو الهوية..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pr-11 pl-4 text-[12px] font-bold text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2 px-1 xl:flex-wrap">
              {[
                { value: "all", label: "الكل" },
                { value: "initial_investigation", label: "تحقيق أولي" },
                { value: "under_procedure", label: "تحت الإجراء" },
                { value: "transferred", label: "محول" },
                { value: "joint_operation", label: "مشترك" },
                { value: "closed_released", label: "مغلق" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value as "all" | FileStatus)}
                  className={cn(
                    "whitespace-nowrap rounded-xl px-3 py-2 text-[10px] font-black transition-all",
                    statusFilter === filter.value
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100",
                  )}
                >
                  {filter.label}
                </button>
              ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <motion.article
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:p-5"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-2xl bg-slate-50 p-3 text-slate-500 transition-all group-hover:bg-slate-900 group-hover:text-white">
                    {record.detaineeType === "military" ? <Shield size={16} /> : <Users size={16} />}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="truncate text-[9px] font-black uppercase tracking-widest text-slate-300">
                      {record.caseNumber}
                    </div>
                    <div className="mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black bg-slate-50 text-slate-500">
                      {record.registrationDate}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <h3 className="line-clamp-2 text-sm font-black text-slate-900">{record.fullName}</h3>
                  <div className="truncate text-[11px] font-bold text-slate-400">
                    {record.detaineeType === "military" ? "عسكري" : "مدني"} • {record.idNumber}
                  </div>
                  <p className="line-clamp-3 text-[12px] leading-6 text-slate-600">{record.accusation}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-3 py-1.5 text-[10px] font-black", statusClasses[record.status])}>
                    {statusLabels[record.status]}
                  </span>
                  {record.transferDestination ? (
                    <span className="rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-black text-violet-700">
                      {destinationLabels[record.transferDestination]}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                  <div className="text-[10px] font-black text-slate-300">
                    {record.seizedItems.length} مضبوطات
                  </div>
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all hover:bg-blue-600 hover:text-white"
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </motion.article>
            ))
          ) : (
            <div className="col-span-full rounded-[2rem] border border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-200">
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-lg font-black text-slate-800">لا توجد نتائج مطابقة</h3>
              <p className="mt-2 text-sm font-bold text-slate-400">جرّب تغيير كلمات البحث أو حالة الملف.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isFormOpen ? (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsFormOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden rounded-none border-0 bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-[2.5rem] sm:border sm:border-slate-100"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0 text-right">
                  <h2 className="text-lg font-black text-slate-900 sm:text-xl">تسجيل حالة توقيف جديدة</h2>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    DETAINEE FILE REGISTRATION
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid gap-4 sm:gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                  <div className="space-y-4">
                    <Panel title="نوع الحالة" subtitle="حدد طبيعة الموقوف قبل إدخال بقية المعلومات">
                      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                        {[
                          { value: "civilian", label: "مدني", tone: "blue" },
                          { value: "military", label: "عسكري", tone: "emerald" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setFormData((current) => ({
                                ...current,
                                detaineeType: option.value as DetaineeFormState["detaineeType"],
                              }))
                            }
                            className={cn(
                              "rounded-2xl border px-4 py-4 text-sm font-black transition-all",
                              formData.detaineeType === option.value
                                ? option.tone === "blue"
                                  ? "border-blue-200 bg-blue-50 text-blue-700"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-white",
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </Panel>

                    <Panel title="الحالة والإجراءات" subtitle="تحديد مسار الملف والجهة المرتبطة به">
                      <div className="space-y-4">
                        <Field label="حالة الملف">
                          <select
                            value={formData.status}
                            onChange={(event) =>
                              setFormData((current) => ({
                                ...current,
                                status: event.target.value as FileStatus,
                                transferDestination:
                                  event.target.value === "transferred" ||
                                  event.target.value === "joint_operation"
                                    ? current.transferDestination
                                    : undefined,
                              }))
                            }
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-blue-400 focus:bg-white"
                          >
                            <option value="initial_investigation">تحقيق أولي</option>
                            <option value="under_procedure">تحت الإجراء</option>
                            <option value="transferred">محول لجهة أخرى</option>
                            <option value="joint_operation">عمليات مشتركة</option>
                            <option value="closed_released">مغلق / أفرج عنه</option>
                          </select>
                        </Field>

                        {formData.status === "transferred" || formData.status === "joint_operation" ? (
                          <Field label="الجهة المحول إليها">
                            <select
                              value={formData.transferDestination || ""}
                              onChange={(event) =>
                                setFormData((current) => ({
                                  ...current,
                                  transferDestination: event.target.value as TransferDestination,
                                }))
                              }
                              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-blue-400 focus:bg-white"
                            >
                              <option value="">اختر الجهة...</option>
                              {Object.entries(destinationLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </Field>
                        ) : null}

                        <Field label="التهمة / القرينة">
                          <textarea
                            rows={4}
                            value={formData.accusation}
                            onChange={(event) =>
                              setFormData((current) => ({ ...current, accusation: event.target.value }))
                            }
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-blue-400 focus:bg-white"
                            placeholder="وصف دقيق لسبب التوقيف..."
                          />
                        </Field>
                      </div>
                    </Panel>

                    <Panel title="الصور" subtitle="تصوير الهوية أو صورة الموقوف عند الحاجة">
                      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                        <CameraTile
                          title="صورة الهوية"
                          active={Boolean(formData.photos.idPhoto)}
                          onClick={() => {
                            setShowCamField("idPhoto");
                            setTimeout(() => void startCamera(), 100);
                          }}
                        />
                        <CameraTile
                          title="صورة الموقوف"
                          active={Boolean(formData.photos.detaineePhoto)}
                          onClick={() => {
                            setShowCamField("detaineePhoto");
                            setTimeout(() => void startCamera(), 100);
                          }}
                        />
                      </div>
                    </Panel>
                  </div>

                  <div className="space-y-4">
                    <Panel title="البيانات الأساسية" subtitle="هوية الموقوف وبيانات الاتصال والموقع">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="الاسم الرباعي" className="md:col-span-2">
                          <input
                            value={formData.fullName}
                            onChange={(event) =>
                              setFormData((current) => ({ ...current, fullName: event.target.value }))
                            }
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-blue-400 focus:bg-white"
                            placeholder="الاسم الكامل"
                          />
                        </Field>

                        <Field label="رقم الهوية / الرقم العسكري">
                          <input
                            value={formData.idNumber}
                            onChange={(event) =>
                              setFormData((current) => ({ ...current, idNumber: event.target.value }))
                            }
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-blue-400 focus:bg-white"
                            placeholder="رقم الهوية"
                          />
                        </Field>

                        <Field label="الجنسية">
                          <input
                            value={formData.nationality}
                            onChange={(event) =>
                              setFormData((current) => ({ ...current, nationality: event.target.value }))
                            }
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-blue-400 focus:bg-white"
                            placeholder="الجنسية"
                          />
                        </Field>

                        <Field label="رقم الهاتف">
                          <input
                            value={formData.phone}
                            onChange={(event) =>
                              setFormData((current) => ({ ...current, phone: event.target.value }))
                            }
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-blue-400 focus:bg-white"
                            placeholder="077xxxxxxx"
                          />
                        </Field>

                        <Field label="العنوان / السكن">
                          <input
                            value={formData.address}
                            onChange={(event) =>
                              setFormData((current) => ({ ...current, address: event.target.value }))
                            }
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-blue-400 focus:bg-white"
                            placeholder="المحافظة - المديرية"
                          />
                        </Field>
                      </div>
                    </Panel>

                    {formData.detaineeType === "military" ? (
                      <Panel title="البيانات العسكرية" subtitle="حقول خاصة بالموقوف العسكري">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <Field label="الرتبة">
                            <input
                              value={formData.militaryRank}
                              onChange={(event) =>
                                setFormData((current) => ({ ...current, militaryRank: event.target.value }))
                              }
                              className="w-full rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-emerald-400 focus:bg-white"
                            />
                          </Field>
                          <Field label="الرقم العسكري">
                            <input
                              value={formData.militaryNumber}
                              onChange={(event) =>
                                setFormData((current) => ({ ...current, militaryNumber: event.target.value }))
                              }
                              className="w-full rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-emerald-400 focus:bg-white"
                            />
                          </Field>
                          <Field label="الوحدة التابعة لها" className="md:col-span-2">
                            <input
                              value={formData.unitName}
                              onChange={(event) =>
                                setFormData((current) => ({ ...current, unitName: event.target.value }))
                              }
                              className="w-full rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-emerald-400 focus:bg-white"
                            />
                          </Field>
                          <Field label="تاريخ آخر دوام">
                            <input
                              type="date"
                              value={formData.lastDutyDate}
                              onChange={(event) =>
                                setFormData((current) => ({ ...current, lastDutyDate: event.target.value }))
                              }
                              className="w-full rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-emerald-400 focus:bg-white"
                            />
                          </Field>
                        </div>
                      </Panel>
                    ) : null}

                    <Panel title="المضبوطات" subtitle="تسجيل العناصر المضبوطة ضمن ملف الحالة">
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_120px_auto]">
                          <input
                            placeholder="اسم العنصر"
                            value={tempItem.name}
                            onChange={(event) =>
                              setTempItem((current) => ({ ...current, name: event.target.value }))
                            }
                            className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-blue-400 focus:bg-white"
                          />
                          <input
                            placeholder="الوصف"
                            value={tempItem.description}
                            onChange={(event) =>
                              setTempItem((current) => ({ ...current, description: event.target.value }))
                            }
                            className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-blue-400 focus:bg-white"
                          />
                          <input
                            type="number"
                            placeholder="العدد"
                            value={tempItem.quantity}
                            onChange={(event) =>
                              setTempItem((current) => ({
                                ...current,
                                quantity: Number.parseInt(event.target.value, 10) || 0,
                              }))
                            }
                            className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-bold outline-none transition focus:border-blue-400 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={addSeizedItem}
                            className="rounded-2xl bg-blue-600 px-4 py-3 text-[11px] font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
                          >
                            إضافة
                          </button>
                        </div>

                        {formData.seizedItems.length > 0 ? (
                          <div className="space-y-2">
                            {formData.seizedItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
                              >
                                <div className="text-right">
                                  <div className="text-[12px] font-black text-slate-800">{item.name}</div>
                                  <div className="text-[10px] font-bold text-slate-400">
                                    {item.description || "بدون وصف"} • العدد: {item.quantity}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSeizedItem(item.id)}
                                  className="rounded-xl bg-white p-2 text-red-500 shadow-sm transition hover:bg-red-50"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-[11px] font-bold text-slate-400">
                            لا توجد مضبوطات مضافة حاليًا
                          </div>
                        )}
                      </div>
                    </Panel>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-5">
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="w-full rounded-2xl bg-white px-5 py-3 text-[11px] font-black text-slate-500 shadow-sm transition hover:bg-slate-100 sm:w-auto"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveRecord}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-[11px] font-black text-white shadow-lg transition hover:bg-slate-800 sm:w-auto"
                >
                  <Save size={15} />
                  <span>حفظ وتوثيق القضية</span>
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRecord ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setSelectedRecord(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative h-[100dvh] w-full overflow-y-auto rounded-none border-0 bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-[2.5rem] sm:border sm:border-slate-100"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0 text-right">
                  <h2 className="truncate text-lg font-black text-slate-900 sm:text-xl">ملف القضية {selectedRecord.caseNumber}</h2>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    CASE DETAILS
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DetailBox label="اسم الموقوف" value={selectedRecord.fullName} />
                  <DetailBox
                    label="نوع الحالة"
                    value={selectedRecord.detaineeType === "military" ? "عسكري" : "مدني"}
                  />
                  <DetailBox label="رقم الهوية" value={selectedRecord.idNumber} />
                  <DetailBox label="الحالة" value={statusLabels[selectedRecord.status]} />
                  <DetailBox label="الجنسية" value={selectedRecord.nationality || "-"} />
                  <DetailBox label="الهاتف" value={selectedRecord.phone || "-"} />
                  <DetailBox label="العنوان" value={selectedRecord.address || "-"} />
                  <DetailBox
                    label="الجهة المحول إليها"
                    value={
                      selectedRecord.transferDestination
                        ? destinationLabels[selectedRecord.transferDestination]
                        : "-"
                    }
                  />
                </div>

                <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
                  <div className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    التهمة / القرينة
                  </div>
                  <div className="text-sm font-bold leading-7 text-slate-700">{selectedRecord.accusation}</div>
                </div>

                <div className="rounded-[2rem] border border-slate-100 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-black text-slate-800">
                    <FileText size={16} />
                    <span>المضبوطات</span>
                  </div>
                  {selectedRecord.seizedItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {selectedRecord.seizedItems.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="text-sm font-black text-slate-800">{item.name}</div>
                          <div className="mt-1 text-[11px] font-bold text-slate-400">
                            {item.description || "بدون وصف"} • العدد: {item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-[11px] font-bold text-slate-400">
                      لا توجد مضبوطات مرتبطة بهذه القضية
                    </div>
                  )}
                </div>

                <div className="rounded-[2rem] border border-slate-100 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-black text-slate-800">
                    <Activity size={16} />
                    <span>السجل الزمني للإجراءات</span>
                  </div>
                  <div className="space-y-3 border-r-2 border-blue-100 pr-4">
                    {selectedRecord.procedureLogs.map((log) => (
                      <div key={log.id} className="relative">
                        <div className="absolute -right-[22px] top-2 h-3 w-3 rounded-full border-2 border-white bg-blue-600" />
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                          <div className="text-sm font-black text-blue-900">{log.action}</div>
                          <div className="mt-1 text-[10px] font-bold text-slate-500">
                            {new Date(log.timestamp).toLocaleString("ar-YE")} • بواسطة {log.officer}
                          </div>
                          {log.details ? (
                            <div className="mt-2 text-[12px] font-bold leading-6 text-slate-700">
                              {log.details}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showCamField ? (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl rounded-[1.75rem] bg-white p-4 shadow-2xl sm:rounded-[2rem] sm:p-5"
            >
              <h3 className="mb-4 text-center text-lg font-black text-slate-900">
                تصوير {showCamField === "idPhoto" ? "الهوية" : "الموقوف"}
              </h3>
              <div className="mb-4 overflow-hidden rounded-2xl bg-black">
                <video ref={videoRef} autoPlay playsInline className="h-[260px] w-full object-cover sm:h-[320px]" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={captureImage}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-[11px] font-black text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  <Camera size={16} />
                  <span>التقاط الصورة</span>
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    setShowCamField(null);
                  }}
                  className="w-full rounded-2xl bg-slate-100 px-5 py-3 text-[11px] font-black text-slate-600 transition hover:bg-slate-200 sm:w-auto"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 text-right">
        <h3 className="text-sm font-black text-slate-900">{title}</h3>
        <p className="mt-1 text-[10px] font-bold leading-5 text-slate-400">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[11px] font-black text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function CameraTile({
  title,
  active,
  onClick,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-5 text-right transition-all",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-white",
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
        <Camera size={16} />
      </div>
      <div className="text-[12px] font-black">{title}</div>
      <div className="mt-1 text-[10px] font-bold opacity-70">
        {active ? "تم الالتقاط" : "افتح الكاميرا للتوثيق"}
      </div>
    </button>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-right">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-black text-slate-800">{value}</div>
    </div>
  );
}
