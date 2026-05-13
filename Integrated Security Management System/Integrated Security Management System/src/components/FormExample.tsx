import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPen, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  ChevronLeft,
  Upload,
  CheckCircle2,
  Eye,
  FileIcon,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

const FormSection = ({ title, description, children, active }: any) => (
  <motion.div 
    initial={false}
    animate={{ opacity: active ? 1 : 0.3, y: active ? 0 : 5 }}
    className={cn(
      "space-y-2 p-3 rounded-2xl border transition-all duration-500",
      active ? "bg-[var(--bg-surface)] border-blue-100 shadow-lg shadow-blue-50/50" : "bg-slate-50 border-transparent blur-[0.5px] pointer-events-none"
    )}
  >
    <div className="space-y-0.5">
      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
        {active && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
        {title}
      </h3>
      <p className="text-[9px] text-slate-400 font-bold leading-relaxed">{description}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2.5 pt-1">
      {children}
    </div>
  </motion.div>
);

const InputField = ({ label, icon: Icon, type = "text", placeholder, options, error, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-500/80 px-1 uppercase tracking-tight flex items-center justify-between">
      <span>{label}</span>
      {props.required && <span className="text-red-500 text-[12px] opacity-70">*</span>}
    </label>
    <div className="relative group">
      <div className={cn(
        "absolute right-3.5 top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none z-10",
        error ? "text-red-500 scale-110" : "text-slate-300 group-focus-within:text-blue-500 group-focus-within:scale-110"
      )}>
        <Icon size={14} strokeWidth={2.5} />
      </div>
      {options ? (
        <select 
          {...props}
          className={cn(
            "w-full bg-slate-50 border-2 rounded-2xl pr-10 pl-4 py-2 outline-none transition-all font-bold appearance-none cursor-pointer text-[12px] min-h-[46px]",
            error ? "border-red-100 bg-red-50 focus:border-red-500" : "border-slate-50 focus:bg-white focus:border-blue-500 focus:shadow-xl focus:shadow-blue-500/5"
          )}
        >
          {options.map((opt: string) => <option key={opt}>{opt}</option>)}
        </select>
      ) : (
        <input 
          {...props}
          type={type} 
          placeholder={placeholder}
          className={cn(
            "w-full bg-slate-50 border-2 rounded-2xl pr-10 pl-4 py-2 outline-none transition-all font-bold text-[12px] min-h-[46px]",
            error ? "border-red-500/20 bg-red-50 focus:border-red-500" : "border-slate-50 focus:bg-white focus:border-blue-500 focus:shadow-xl focus:shadow-blue-500/5 placeholder:text-slate-300"
          )}
        />
      )}
      
      {/* Visual background indicator */}
      <div className="absolute inset-0 rounded-2xl bg-blue-500/0 group-focus-within:bg-blue-500/[0.02] pointer-events-none transition-colors" />

      {options && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
          <ChevronLeft size={14} className="group-focus-within:text-blue-500 transition-colors" />
        </div>
      )}

      {error && !options && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 animate-in zoom-in duration-300">
          <AlertCircle size={16} />
        </div>
      )}
    </div>
    {error && (
      <motion.p 
        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
        className="text-[9px] font-black text-red-500 px-2 flex items-center gap-1"
      >
        <span className="w-1 h-1 rounded-full bg-red-500" />
        {error}
      </motion.p>
    )}
  </div>
);

export default function FormExample() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attachedFile, setAttachedFile] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    birthDate: '',
    nationality: 'سعودي',
    violationType: 'جنائية',
    location: '',
    description: ''
  });
  const [errors, setErrors] = useState<any>({});

  // Mock data for "existing records" to demonstrate editing
  const recentRecords = [
    { id: 1, fullName: 'محمد بن سلمان العتيبي', idNumber: '1092837465', birthDate: '1990-05-15', nationality: 'سعودي', violationType: 'جنائية', location: 'الرياض، حي اليرموك', description: 'ضبط مخالفة في الموقع المذكور' },
    { id: 2, fullName: 'خالد بن فهد القحطاني', idNumber: '1102938475', birthDate: '1985-11-20', nationality: 'سعودي', violationType: 'مرورية', location: 'جدة، طريق الملك', description: 'تجاوز السرعة المحددة' }
  ];

  const handleEdit = (record: any) => {
    setFormData({
      fullName: record.fullName,
      idNumber: record.idNumber,
      birthDate: record.birthDate,
      nationality: record.nationality,
      violationType: record.violationType,
      location: record.location,
      description: record.description
    });
    setEditingId(record.id);
    setStep(1);
    setErrors({});
  };

  const validate = () => {
    const newErrors: any = {};
    if (step === 1) {
      if (!formData.fullName || formData.fullName.length < 5) newErrors.fullName = 'الاسم الكامل مطلوب (على الأقل 5 أحرف)';
      if (!formData.idNumber || !/^\d{10}$/.test(formData.idNumber)) newErrors.idNumber = 'رقم هوية صحيح مكون من 10 أرقام مطلوب';
      if (!formData.birthDate) newErrors.birthDate = 'تاريخ الميلاد مطلوب';
    } else if (step === 2) {
      if (!formData.location) newErrors.location = 'موقع الضبط مطلوب';
      if (!formData.description || formData.description.length < 10) newErrors.description = 'وصف المخالفة مطلوب (على الأقل 10 أحرف)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validate()) {
      setStep(step + 1);
    }
  };

  const handleFileUpload = () => {
    // Simulated file upload
    setAttachedFile({
      name: 'id_document_copy.jpg',
      size: '2.4 MB',
      type: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=1000'
    });
  };

  const handleSubmit = () => {
    if (validate()) {
      setIsSubmitting(true);
      
      // Simulate API call and logging
      setTimeout(() => {
        // Log event to simulated audit log
        const auditLog = JSON.parse(localStorage.getItem('simulated_audit_logs') || '[]');
        auditLog.unshift({
          id: Date.now(),
          action: editingId ? 'تعديل سجل موجود (سجل موقوف)' : 'إنشاء سجل جديد (سجل موقوف)',
          user: 'بدر العتيبي',
          timestamp: new Date().toLocaleString('ar-SA'),
          details: `${editingId ? 'تم تعديل' : 'تم إنشاء'} سجل للمواطن: ${formData.fullName}`
        });
        localStorage.setItem('simulated_audit_logs', JSON.stringify(auditLog));

        setIsSubmitting(false);
        setIsSuccess(true);
      }, 2000);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto py-20 text-center space-y-8"
      >
        <div className="relative inline-block">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-200"
          >
            <CheckCircle2 size={64} />
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl -z-10"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-[var(--text-main)]">تم اعتماد السجل بنجاح</h2>
          <p className="text-xl text-[var(--text-muted)] font-medium max-w-md mx-auto">
            تمت عملية الأرشفة بنجاح، السجل الآن متوفر في قاعدة البيانات المركزية للوحدات المختصة ومسجل في سجل العمليات.
          </p>
        </div>
        <div className="pt-10 flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => {
              setIsSuccess(false);
              setStep(1);
              setEditingId(null);
              setFormData({
                fullName: '',
                idNumber: '',
                birthDate: '',
                nationality: 'سعودي',
                violationType: 'جنائية',
                location: '',
                description: ''
              });
              setAttachedFile(null);
            }}
            className="h-16 px-10 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-color)] rounded-2xl font-black hover:bg-slate-50 transition-all shadow-lg"
          >
            إضافة سجل آخر
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="h-16 px-10 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-blue-600 font-black uppercase tracking-[0.2em] text-[8px]">نماذج الحفظ والأرشفة</span>
          <h1 className="text-xl font-black text-[var(--text-main)]">
            {editingId ? 'تعديل السجل الحالي' : 'إضافة سجل جديد'}
          </h1>
          <p className="text-[var(--text-muted)] font-medium text-[11px]">
            {editingId ? 'قم بتحديث البيانات المطلوبة للسجل المحدد.' : 'استكمال البيانات بدقة لضمان صحة الأرشفة.'}
          </p>
        </div>
        <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black transition-all",
                step === i ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-slate-400"
              )}
            >
              0{i}
            </div>
          ))}
        </div>
      </header>

      {/* Edit Mode Selection - Quick List */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <UserPen size={14} className="text-blue-600" />
            <h3 className="text-xs font-black text-slate-800">سجلات حديثة للتعديل السريع</h3>
          </div>
          {editingId && (
            <button 
              onClick={() => {
                setEditingId(null);
                setFormData({
                  fullName: '',
                  idNumber: '',
                  birthDate: '',
                  nationality: 'سعودي',
                  violationType: 'جنائية',
                  location: '',
                  description: ''
                });
              }}
              className="text-[9px] font-black text-red-500 hover:text-red-700 underline"
            >
              إلغاء التعديل والبدء من جديد
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {recentRecords.map(record => (
            <button 
              key={record.id}
              onClick={() => handleEdit(record)}
              className={cn(
                "flex items-center justify-between p-2 rounded-xl border transition-all text-right",
                editingId === record.id 
                  ? "bg-blue-600 border-blue-700 text-white shadow-lg" 
                  : "bg-white border-slate-100 text-slate-700 hover:border-blue-200 hover:shadow-md"
              )}
            >
              <div className="flex-grow">
                <p className="text-[10px] font-black truncate">{record.fullName}</p>
                <p className={cn("text-[8px] font-bold", editingId === record.id ? "text-blue-200" : "text-slate-400")}>
                  ID: {record.idNumber} | {record.birthDate}
                </p>
              </div>
              <ChevronLeft size={16} className={cn("shrink-0", editingId === record.id ? "text-white" : "text-slate-300")} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <FormSection 
          active={step === 1}
          title="البيانات الأساسية" 
          description="تشمل الاسم الرباعي ورقم الهوية وتاريخ الميلاد."
        >
          <InputField 
            label="الاسم الكامل" 
            icon={UserPen} 
            placeholder="أدخل الاسم الرباعي..." 
            value={formData.fullName}
            onChange={(e: any) => setFormData({...formData, fullName: e.target.value})}
            error={errors.fullName}
          />
          <InputField 
            label="رقم الهوية الوطنية" 
            icon={ShieldCheck} 
            placeholder="مثال: 1029384756" 
            value={formData.idNumber}
            onChange={(e: any) => setFormData({...formData, idNumber: e.target.value})}
            error={errors.idNumber}
          />
          <InputField 
            label="تاريخ الميلاد" 
            icon={Calendar} 
            type="date" 
            value={formData.birthDate}
            onChange={(e: any) => setFormData({...formData, birthDate: e.target.value})}
            error={errors.birthDate}
          />
          <InputField 
            label="الجنسية" 
            icon={MapPin} 
            options={["سعودي", "إماراتي", "كويتي", "بحريني", "عماني", "آخر"]} 
            value={formData.nationality}
            onChange={(e: any) => setFormData({...formData, nationality: e.target.value})}
          />
        </FormSection>

        <FormSection 
          active={step === 2}
          title="تفاصيل البلاغ" 
          description="تحديد نوع المخالفة والموقع للواقعة."
        >
          <InputField 
            label="نوع المخالفة" 
            icon={AlertCircle} 
            options={["جنائية", "مرورية", "إدارية", "أخرى"]} 
            value={formData.violationType}
            onChange={(e: any) => setFormData({...formData, violationType: e.target.value})}
          />
          <InputField 
            label="موقع الضبط" 
            icon={MapPin} 
            placeholder="الحي، الشارع..." 
            value={formData.location}
            onChange={(e: any) => setFormData({...formData, location: e.target.value})}
            error={errors.location}
          />
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-500 px-1">وصف تفصيلي</label>
            <textarea 
              rows={2}
              placeholder="اكتب تفاصيل الواقعة هنا..."
              className={cn(
                "w-full bg-white border border-slate-200 rounded-lg p-3 outline-none transition-all font-bold text-[11px]",
                errors.description ? "border-red-300 focus:ring-4 focus:ring-red-500/5 focus:border-red-500" : "border-slate-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500"
              )}
              value={formData.description}
              onChange={(e: any) => setFormData({...formData, description: e.target.value})}
            ></textarea>
            {errors.description && <p className="text-[8px] font-black text-red-500 px-1">{errors.description}</p>}
          </div>
        </FormSection>

        <FormSection 
          active={step === 3}
          title="المرفقات والتوثيق" 
          description="رفع الوثائق الداعمة للسجل."
        >
          <div className="md:col-span-2">
            {!attachedFile ? (
              <div 
                onClick={handleFileUpload}
                className="border-2 border-dashed border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2 hover:border-blue-300 hover:bg-blue-50/20 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm">
                  <Upload size={20} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[12px] font-black text-slate-700">اضغط لرفع المرفقات</p>
                  <p className="text-[9px] text-slate-400 font-bold">الحد الأقصى المسموح: 25MB • PDF, JPG, PNG</p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <FileIcon size={18} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-xs">{attachedFile.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{attachedFile.size} • JPG</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                   <button 
                     onClick={() => setIsPreviewOpen(true)}
                     className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black transition-all border border-slate-100"
                   >
                     <Eye size={12} />
                     <span>المعاينة</span>
                   </button>
                   <button 
                     onClick={() => setAttachedFile(null)}
                     className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                   >
                     <X size={16} />
                   </button>
                </div>
              </div>
            )}
          </div>
        </FormSection>
      </div>

      <footer className="sticky bottom-4 z-20 flex flex-col md:flex-row items-center justify-between gap-3 p-3 glass-panel rounded-xl border border-[var(--border-color)] shadow-xl">
        <div className="flex items-center gap-3 text-[var(--text-muted)] font-bold text-[10px]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>تم الحفظ تلقائياً</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex-1 md:flex-none h-9 px-5 bg-white text-slate-700 border border-slate-200 rounded-lg font-black flex items-center gap-2 hover:bg-slate-50 transition-all text-xs"
            >
              <ArrowRight size={16} />
              <span>السابق</span>
            </button>
          )}
          
          <button 
            onClick={() => step < 3 ? nextStep() : handleSubmit()}
            disabled={isSubmitting}
            className="flex-1 md:flex-none h-9 px-6 bg-blue-600 text-white rounded-lg font-black flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50 text-xs"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{step === 3 ? 'اعتماد الحفظ' : 'متابعة'}</span>
                <ArrowLeft size={16} />
              </>
            )}
          </button>
        </div>
      </footer>

      {/* File Preview Modal - Enhanced Design */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsPreviewOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-white relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Eye size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">معاينة المستند المرفق</h3>
                    <p className="text-[9px] text-slate-400 font-bold tracking-widest">{attachedFile.name.toUpperCase()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="w-10 h-10 border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl flex items-center justify-center transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto p-2 sm:p-6 bg-slate-50 flex items-start justify-center">
                 <div className="relative group">
                   <img 
                     src={attachedFile.url} 
                     alt="Preview" 
                     className="max-w-full h-auto rounded-xl shadow-2xl border-4 border-white"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                 </div>
              </div>
              
              <div className="p-4 bg-white border-t border-slate-50 flex justify-end gap-3">
                  <button className="px-6 py-2 bg-slate-100 text-slate-600 text-xs font-black rounded-lg hover:bg-slate-200 transition-all">تحميل نسخة</button>
                  <button 
                    onClick={() => setIsPreviewOpen(false)}
                    className="px-6 py-2 bg-blue-600 text-white text-xs font-black rounded-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                  >
                    إغلاق المعاينة
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

