import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { recognize } from "tesseract.js";
import { cn } from "../../../lib/utils";

type ViolationRecord = {
  id: number;
  title: string;
  observer: string;
  location: string;
  coords: string;
  time: string;
  details: {
    category: string;
    name: string;
    idNumber: string;
    plate: string;
    by: string;
    workSite: string;
    status: string;
    description: string;
    action?: string;
  };
  unread: boolean;
};

type ViolationForm = {
  fullName: string;
  idType: string;
  customIdType: string;
  idNumber: string;
  phones: string[];
  vehicleType: string;
  plateNumber: string;
  provinceCode: string;
  plateCategory: string;
  violationCategory: string;
  violationId: string;
  description: string;
  actionTaken: string;
  finalNotes: string;
};

type PhotoAsset = {
  id: string;
  url: string;
  name: string;
  sizeLabel: string;
  capturedAt: string;
  type: PhotoType;
};

type PhotoType = "id_photo" | "vehicle_photo" | "violation_photo" | "commitment";
type PhotoCollection = Record<string, PhotoAsset[]>;
type OcrRegionKey = "full" | "name_band" | "id_band" | "lower_band";
type OcrRegionImage = { key: OcrRegionKey; dataUrl: string };
type OcrRegionResult = { key: OcrRegionKey; text: string };
type GuideTarget = "name_band" | "id_band";
type RegionRect = { x: number; y: number; width: number; height: number };

const VIOLATIONS_STORAGE_KEY = "violations_data";
const VIOLATIONS_PHOTO_KEY = "violations_photo_store";
const yemeniIdentityPatterns = [
  { label: "الرقم الوطني اليمني", regex: /\b\d{12}\b/g, idType: "بطاقة إلكترونية", priority: 5, length: 12 },
  { label: "رقم البطاقة الشخصية اليمنية", regex: /\b\d{11}\b/g, idType: "بطاقة عادية", priority: 4, length: 11 },
  { label: "رقم جواز السفر اليمني", regex: /\b\d{8}\b/g, idType: "جواز سفر", priority: 3, length: 8 },
];
const yemeniIdentityKeywords = [
  "الجمهورية اليمنية",
  "البطاقة الشخصية",
  "رقم وطني",
  "الاسم",
  "اسم",
  "بطاقة",
  "هوية",
  "اليمنية",
];

const defaultForm: ViolationForm = {
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
};

const photoMeta: Record<
  PhotoType,
  { label: string; hint: string; accent: string; icon: React.ReactNode }
> = {
  id_photo: {
    label: "الهوية",
    hint: "توثيق الهوية أو الإثبات الشخصي",
    accent: "blue",
    icon: <User size={15} />,
  },
  vehicle_photo: {
    label: "المركبة",
    hint: "التقاط المركبة أو بياناتها المرئية",
    accent: "emerald",
    icon: <Truck size={15} />,
  },
  violation_photo: {
    label: "المخالفة",
    hint: "إثبات المشهد أو موقع المخالفة",
    accent: "orange",
    icon: <ShieldAlert size={15} />,
  },
  commitment: {
    label: "الإجراء",
    hint: "إرفاق ما يدعم الإجراء المنفذ",
    accent: "violet",
    icon: <CheckCircle2 size={15} />,
  },
};

const securityViolations = [
  {
    title: "التخابر والتنسيق المشبوه",
    description:
      "وجود رسائل أو شواهد تثبت التواصل أو التنسيق المشبوه لتسهيل التجاوزات.",
  },
  {
    title: "حيازة سلاح",
    description: "حمل أسلحة أو أدوات خطرة دون تصريح أو مبرر نظامي.",
  },
  {
    title: "الترويج المعادي",
    description: "إظهار أو نشر شعارات أو رسائل مخالفة للأنظمة والتعليمات.",
  },
  {
    title: "تجاوز النقطة والتمرد",
    description: "رفض التعليمات أو محاولة تجاوز نقطة الضبط دون تصريح.",
  },
  {
    title: "الرشوة والإساءة",
    description: "عرض مبالغ أو إساءات لفظية لأفراد النقطة أو العاملين.",
  },
  {
    title: "مخالفات نقل الركاب",
    description: "تحميل أو نقل ركاب أو أشخاص بصورة مخالفة للتعليمات المعتمدة.",
  },
];

const financialViolations = [
  {
    title: "تدوير السندات",
    description: "إعادة استخدام السند أو الوثيقة لأكثر من رحلة أو واقعة.",
  },
  {
    title: "التلاعب بالكميات",
    description: "وجود كميات أو حمولة لا تتطابق مع المصرح به أو المدفوع.",
  },
  {
    title: "تزوير بيانات البضاعة",
    description: "اختلاف نوع أو كمية البضاعة الفعلية عن البيانات المسجلة.",
  },
  {
    title: "إخفاء البضائع",
    description: "تعمد إخفاء بضائع أثناء التفتيش بغرض التهرب أو التحايل.",
  },
  {
    title: "استخدام شبكات التهريب",
    description: "الاستعانة بوسطاء أو أساليب التفافية لنقل بضائع أو أموال.",
  },
];

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getInitialRecords(): ViolationRecord[] {
  return [
    {
      id: 106,
      title: "مخالفة أمنية",
      observer: "MO",
      location: "الدهبلي",
      coords: "0.0000 , 0.0000",
      time: "2026/04/29",
      details: {
        category: "أمنية",
        name: "صالح صادق محمد سعيد",
        idNumber: "04384668",
        plate: "565553",
        by: "MO",
        workSite: "الدهبلي",
        status: "مفتوح",
        description:
          "تحميل ركاب من داخل المربع الأمني بدون تفتيش ومحاولة تجاوز التعليمات.",
        action: "عمل التزام",
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
        status: "مراجعة",
        description: "تحميل ركاب من داخل المربع الأمني بدون تفتيش.",
        action: "عمل محضر ضبط",
      },
      unread: false,
    },
  ];
}

export function ViolationsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [records, setRecords] = useState<ViolationRecord[]>(() =>
    readJson<ViolationRecord[]>(VIOLATIONS_STORAGE_KEY, getInitialRecords()),
  );
  const [photoStore, setPhotoStore] = useState<Record<string, PhotoCollection>>(() =>
    readJson<Record<string, PhotoCollection>>(VIOLATIONS_PHOTO_KEY, {}),
  );
  const [form, setForm] = useState<ViolationForm>(defaultForm);
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("الكل");
  const [filterStatus, setFilterStatus] = useState("الكل");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [showCustomIdType, setShowCustomIdType] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<PhotoCollection>({});
  const [activePhotoType, setActivePhotoType] = useState<PhotoType>("id_photo");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExtractingId, setIsExtractingId] = useState(false);
  const [guideTarget, setGuideTarget] = useState<GuideTarget | null>(null);
  const [idGuideRegions, setIdGuideRegions] = useState<Partial<Record<GuideTarget, RegionRect>>>({});
  const [guideDraft, setGuideDraft] = useState<{ target: GuideTarget; rect: RegionRect } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [previewGallery, setPreviewGallery] = useState<{
    title: string;
    photos: PhotoAsset[];
    activeIndex: number;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem(VIOLATIONS_STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(VIOLATIONS_PHOTO_KEY, JSON.stringify(photoStore));
  }, [photoStore]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const violationsList = useMemo(
    () =>
      form.violationCategory === "أمنية"
        ? securityViolations
        : form.violationCategory === "مالية"
          ? financialViolations
          : [...securityViolations, ...financialViolations],
    [form.violationCategory],
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        record.details.name.toLowerCase().includes(query) ||
        record.details.idNumber.toLowerCase().includes(query) ||
        record.details.plate.toLowerCase().includes(query) ||
        record.title.toLowerCase().includes(query) ||
        record.id.toString().includes(query);

      const matchesCategory =
        filterCategory === "الكل" || record.details.category === filterCategory;
      const matchesStatus =
        filterStatus === "الكل" || record.details.status === filterStatus;
      
      const matchesDate =
        (!dateRange.from && !dateRange.to) ||
        (dateRange.from && new Date(record.time) >= new Date(dateRange.from)) ||
        (dateRange.to && new Date(record.time) <= new Date(dateRange.to));

      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });
  }, [filterCategory, filterStatus, records, searchQuery, dateRange]);

  const openCount = filteredRecords.filter((item) => item.details.status === "مفتوح").length;
  const reviewCount = filteredRecords.filter((item) => item.details.status === "مراجعة").length;
  const withPhotosCount = filteredRecords.filter((item) => getRecordPhotos(photoStore, item.id).length > 0).length;
  const latestIdPhoto = (capturedPhotos.id_photo || [])[capturedPhotos.id_photo?.length ? capturedPhotos.id_photo.length - 1 : 0] || null;

  function resetComposer() {
    setForm(defaultForm);
    setStep(1);
    setErrors({});
    setCapturedPhotos({});
    setEditingId(null);
    setShowCustomIdType(false);
    setGuideTarget(null);
    setIdGuideRegions({});
    setGuideDraft(null);
  }

  function openCreateModal() {
    resetComposer();
    setShowForm(true);
  }

  function openEditModal(record: ViolationRecord) {
    setEditingId(record.id);
    setForm({
      fullName: record.details.name,
      idType: "بطاقة إلكترونية",
      customIdType: "",
      idNumber: record.details.idNumber,
      phones: ["770000000"],
      vehicleType: "صالون",
      plateNumber: record.details.plate,
      provinceCode: "1",
      plateCategory: "خصوصي",
      violationCategory: record.details.category,
      violationId: record.title,
      description: record.details.description,
      actionTaken: record.details.action || "عمل التزام",
      finalNotes: "",
    });
    setCapturedPhotos(photoStore[String(record.id)] || {});
    setErrors({});
    setStep(1);
    setShowForm(true);
  }

  function deleteRecord(id: number) {
    setRecords((current) => current.filter((item) => item.id !== id));
    setPhotoStore((current) => {
      const next = { ...current };
      delete next[String(id)];
      return next;
    });
    setToast({ message: "تم حذف السجل بنجاح", type: "success" });
  }

  function exportToCSV() {
    const headers = ["المعرف", "الاسم", "رقم الهوية", "الفئة", "الحالة", "التاريخ", "الوصف"];
    const rows = filteredRecords.map((item) => [
      item.id,
      item.details.name,
      item.details.idNumber,
      item.details.category,
      item.details.status,
      item.time,
      item.details.description,
    ]);

    const csv = "data:text/csv;charset=utf-8," + [headers, ...rows].map((row) => row.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    
    // تحديد اسم الملف بناءً على الفلاتر المحددة
    let fileName = "violations_report.csv";
    if (dateRange.from || dateRange.to) {
      const from = dateRange.from || "all";
      const to = dateRange.to || "all";
      fileName = `violations_report_${from}_to_${to}.csv`;
    }
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleViolationChange(title: string) {
    const selected = violationsList.find((item) => item.title === title);
    setForm((current) => ({
      ...current,
      violationId: title,
      description: selected ? selected.description : current.description,
    }));
  }

  function addPhone() {
    setForm((current) => ({ ...current, phones: [...current.phones, ""] }));
  }

  function updatePhone(index: number, value: string) {
    const sanitized = value.replace(/\D/g, "").slice(0, 9);
    setForm((current) => {
      const next = [...current.phones];
      next[index] = sanitized;
      return { ...current, phones: next };
    });
  }

  function removePhone(index: number) {
    setForm((current) => {
      const next = current.phones.filter((_, phoneIndex) => phoneIndex !== index);
      return { ...current, phones: next.length ? next : [""] };
    });
  }

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.fullName) nextErrors.fullName = "الاسم مطلوب";
      if (!form.idNumber) {
        nextErrors.idNumber = "رقم الهوية مطلوب";
      } else {
        if (form.idType === "بطاقة إلكترونية" && !/^[0-9]{12}$/.test(form.idNumber)) {
          nextErrors.idNumber = "البطاقة الإلكترونية يجب أن تكون 12 رقمًا";
        } else if (form.idType === "بطاقة عادية" && !/^[0-9]{11}$/.test(form.idNumber)) {
          nextErrors.idNumber = "البطاقة العادية يجب أن تكون 11 رقمًا";
        } else if (form.idType === "جواز سفر" && !/^[0-9]{8}$/.test(form.idNumber)) {
          nextErrors.idNumber = "جواز السفر يجب أن يكون 8 أرقام";
        }
      }

      form.phones.forEach((phone, index) => {
        if (!phone) {
          nextErrors[`phone_${index}`] = "رقم الهاتف مطلوب";
        } else if (!/^7[0-9]{8}$/.test(phone)) {
          nextErrors[`phone_${index}`] = "رقم الهاتف يجب أن يبدأ بـ 7 ويتكون من 9 أرقام";
        }
      });

      if (!form.vehicleType) nextErrors.vehicleType = "نوع المركبة مطلوب";
      if (!form.plateNumber) nextErrors.plateNumber = "رقم اللوحة مطلوب";
    }

    if (step === 2) {
      if (!form.violationId) nextErrors.violationId = "يرجى اختيار المخالفة";
      if (!form.description) nextErrors.description = "الوصف مطلوب";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setToast({ message: "يرجى تصحيح الحقول المطلوبة قبل المتابعة", type: "error" });
      return false;
    }

    return true;
  }

  async function fileToDataUrl(file: File) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("file_read_failed"));
      reader.readAsDataURL(file);
    });
  }

  function openPhotoPicker(type: PhotoType) {
    setActivePhotoType(type);
    fileInputRef.current?.click();
  }

  async function handlePhotoInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []) as File[];
    if (!files.length) return;

    try {
      const assets = await Promise.all(
        files.map(async (file, index) => ({
          id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
          url: await fileToDataUrl(file),
          name: file.name || `${photoMeta[activePhotoType].label}.jpg`,
          sizeLabel:
            file.size > 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
              : `${Math.max(1, Math.round(file.size / 1024))} KB`,
          capturedAt: new Date().toLocaleString("ar-SA"),
          type: activePhotoType,
        })),
      );

      setCapturedPhotos((current) => ({
        ...current,
        [activePhotoType]: [...(current[activePhotoType] || []), ...assets],
      }));

      // تم إلغاء ميزة المسح الذكي للبطاقة
      setToast({ message: "تمت إضافة الصورة بنجاح", type: "success" });
    } catch {
      setToast({ message: "تعذر قراءة الصورة الملتقطة", type: "error" });
    } finally {
      event.target.value = "";
    }
  }

  async function runIdentityExtraction(imageUrl: string) {
    setIsExtractingId(true);
    try {
      const extractedData = await extractIdFromImage(imageUrl, idGuideRegions);
      if (extractedData?.id || extractedData?.name) {
        applyExtractedIdentityData(extractedData);
      } else {
        setToast({ message: "لم نتمكن من قراءة بيانات واضحة من الصورة، جرب تحديد المناطق يدوياً", type: "error" });
      }
    } catch {
      setToast({ message: "تعذر استخراج بيانات الهوية من الصورة", type: "error" });
    } finally {
      setIsExtractingId(false);
    }
  }

  function applyExtractedIdentityData(extractedData: { id: string; name: string }) {
    setForm((current) => ({
      ...current,
      idNumber: extractedData.id || current.idNumber,
      fullName: extractedData.name || current.fullName,
    }));

    if (extractedData.id) {
      const resolvedType = resolveYemeniIdentityType(extractedData.id);
      if (resolvedType) {
        setForm((current) => ({ ...current, idType: resolvedType }));
        setShowCustomIdType(false);
      } else {
        setForm((current) => ({ ...current, idType: "أخرى" }));
        setShowCustomIdType(true);
      }
    }

    setToast({
      message:
        extractedData.id && extractedData.name
          ? "تم استخراج بيانات الهوية بنجاح"
          : "تم استخراج جزء من البيانات، يرجى مراجعتها قبل الحفظ",
      type: "success",
    });
  }

  function handleGuidePointerDown(event: React.MouseEvent<HTMLDivElement>) {
    if (!guideTarget) return;
    const container = event.currentTarget.getBoundingClientRect();
    const x = clamp01((event.clientX - container.left) / container.width);
    const y = clamp01((event.clientY - container.top) / container.height);
    setGuideDraft({
      target: guideTarget,
      rect: { x, y, width: 0.001, height: 0.001 },
    });
  }

  function handleGuidePointerMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!guideDraft) return;
    const container = event.currentTarget.getBoundingClientRect();
    const currentX = clamp01((event.clientX - container.left) / container.width);
    const currentY = clamp01((event.clientY - container.top) / container.height);

    setGuideDraft((current) => {
      if (!current) return null;
      return {
        ...current,
        rect: normalizeGuideRect({
          x: current.rect.x,
          y: current.rect.y,
          width: currentX - current.rect.x,
          height: currentY - current.rect.y,
        }),
      };
    });
  }

  function handleGuidePointerUp() {
    if (!guideDraft) return;
    if (guideDraft.rect.width < 0.02 || guideDraft.rect.height < 0.02) {
      setGuideDraft(null);
      return;
    }

    setIdGuideRegions((current) => ({
      ...current,
      [guideDraft.target]: guideDraft.rect,
    }));
    setGuideDraft(null);
  }

  async function extractIdFromImage(
    imageUrl: string,
    guideRegions?: Partial<Record<GuideTarget, RegionRect>>,
  ): Promise<{ id: string; name: string } | null> {
    const ocrTargets = await buildIdentityOcrTargets(imageUrl, guideRegions);
    const regionResults: OcrRegionResult[] = [];

    for (const target of ocrTargets) {
      const { data } = await recognize(target.dataUrl, "ara+eng", {
        logger: () => undefined,
      });
      regionResults.push({ key: target.key, text: data.text });
    }

    const parsed = parseIdentityTextFromRegions(regionResults);
    return parsed.id || parsed.name ? parsed : null;
  }

  function removeDraftPhoto(type: PhotoType, photoId: string) {
    setCapturedPhotos((current) => ({
      ...current,
      [type]: (current[type] || []).filter((photo) => photo.id !== photoId),
    }));
  }

  function openPreviewGallery(title: string, photos: PhotoAsset[], activeIndex = 0) {
    if (!photos.length) {
      setToast({ message: "لا توجد صور متاحة للمعاينة", type: "error" });
      return;
    }

    setPreviewGallery({ title, photos, activeIndex });
  }

  function saveRecord() {
    setIsSaving(true);
    const recordId = editingId || Math.floor(Math.random() * 1000) + 200;
    const payload: ViolationRecord = {
      id: recordId,
      title: form.violationId,
      observer: "مدير النظام",
      location: "المربع الأمني",
      coords: "0.0000, 0.0000",
      time: new Date().toLocaleDateString("ja-JP").replace(/\//g, "/"),
      details: {
        category: form.violationCategory,
        name: form.fullName,
        idNumber: form.idNumber,
        plate: form.plateNumber,
        by: "مدير النظام",
        workSite: "المربع الأمني",
        status: "مفتوح",
        description: form.description,
        action: form.actionTaken,
      },
      unread: true,
    };

    setPhotoStore((current) => ({
      ...current,
      [String(recordId)]: capturedPhotos,
    }));

    if (editingId) {
      setRecords((current) => current.map((item) => (item.id === editingId ? payload : item)));
      setToast({ message: "تم تحديث السجل بنجاح", type: "success" });
    } else {
      setRecords((current) => [payload, ...current]);
      setToast({ message: "تم حفظ الضبط بنجاح", type: "success" });
    }

    window.setTimeout(() => {
      setIsSaving(false);
      setShowForm(false);
      resetComposer();
    }, 700);
  }

  const activePreviewPhoto =
    previewGallery?.photos[previewGallery.activeIndex] || null;

  const previewOrderedPhotos = useMemo(() => {
    const ordered: PhotoAsset[] = [];
    const pushType = (type: PhotoType) => {
      const items = capturedPhotos[type] || [];
      for (const p of items) ordered.push(p);
    };

    // ensure identity first, then vehicle, then remaining types
    pushType("id_photo");
    pushType("vehicle_photo");
    pushType("violation_photo");
    pushType("commitment");

    return ordered;
  }, [capturedPhotos]);

  const step4Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (step === 4) {
      // ensure the preview area and its carousel are visible immediately
      step4Ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      // also attempt to focus the first image for keyboard users
      const firstImg = step4Ref.current?.querySelector<HTMLButtonElement>("button img");
      firstImg?.parentElement?.focus?.();
    }
  }, [step]);

  return (
    <div className="space-y-6 pb-10" dir="rtl">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={cn(
              "fixed top-6 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-3 rounded-2xl border px-6 py-3 shadow-2xl backdrop-blur-md",
              toast.type === "success"
                ? "border-emerald-400 bg-emerald-500/90 text-white"
                : "border-red-400 bg-red-500/90 text-white",
            )}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              {toast.type === "success" ? <Check size={14} /> : <AlertTriangle size={14} />}
            </div>
            <span className="text-xs font-black">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewGallery && activePreviewPhoto && (
          <div className="fixed inset-0 z-[190] flex items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setPreviewGallery(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              className="relative z-10 h-[100dvh] w-full overflow-hidden rounded-none border-0 bg-slate-950 text-white shadow-2xl sm:h-auto sm:max-w-6xl sm:rounded-[2rem] sm:border sm:border-white/10"
            >
              <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
                <div className="relative min-h-[340px] bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#020617_60%)]">
                  <img
                    src={activePreviewPhoto.url}
                    alt={activePreviewPhoto.name}
                    className="h-full max-h-[78vh] w-full object-contain"
                  />
                  <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black backdrop-blur">
                    Smart Preview
                  </div>
                </div>

                <div className="space-y-5 p-4 text-right sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                        {previewGallery.title}
                      </p>
                      <h3 className="mt-2 text-lg font-black">
                        {photoMeta[activePreviewPhoto.type].label}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {photoMeta[activePreviewPhoto.type].hint}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewGallery(null)}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <PreviewMetaCard label="اسم الملف" value={activePreviewPhoto.name} />
                    <PreviewMetaCard label="الحجم" value={activePreviewPhoto.sizeLabel} />
                    <PreviewMetaCard label="وقت الالتقاط" value={activePreviewPhoto.capturedAt} />
                    <PreviewMetaCard
                      label="عدد اللقطات"
                      value={`${previewGallery.activeIndex + 1}/${previewGallery.photos.length}`}
                    />
                  </div>

                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <Eye size={16} />
                      <span className="text-sm font-black">معاينة ذكية حديثة</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-emerald-50">
                      عرض فوري عالي الوضوح، تنقل سريع بين اللقطات، وقراءة مباشرة لبيانات
                      الصورة داخل نفس شاشة المخالفة.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-300">اللقطات المرتبطة</p>
                      <p className="text-[10px] font-black text-slate-500">
                        {previewGallery.photos.length} صورة
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {previewGallery.photos.map((photo, index) => (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() =>
                            setPreviewGallery((current) =>
                              current ? { ...current, activeIndex: index } : current,
                            )
                          }
                          className={cn(
                            "overflow-hidden rounded-2xl border transition-all",
                            index === previewGallery.activeIndex
                              ? "border-blue-400 ring-2 ring-blue-400/40"
                              : "border-white/10 opacity-70 hover:opacity-100",
                          )}
                        >
                          <img src={photo.url} alt={photo.name} className="h-20 w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full lg:w-auto order-1 lg:order-2">
            <div className="flex flex-wrap items-center gap-3 order-2 lg:order-1">
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-12 w-full lg:w-auto items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800"
              >
                <Plus size={16} />
                <span>إضافة مخالفة</span>
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 order-2 lg:order-1 w-full">
            <div className="relative w-full">
              <Search size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="ابحث بالاسم أو رقم الهوية أو اللوحة أو رقم السجل"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 h-12">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-xs text-slate-500">من</span>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="h-full rounded-xl border-none bg-transparent text-sm outline-none focus:ring-0"
              />
              <span className="text-slate-400">-</span>
              <span className="text-xs text-slate-500">إلى</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="h-full rounded-xl border-none bg-transparent text-sm outline-none focus:ring-0"
              />
            </div>

            <button
              type="button"
              onClick={exportToCSV}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              <Download size={16} />
              <span>تصدير CSV</span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {filteredRecords.map((record) => {
            const recordPhotos = getRecordPhotos(photoStore, record.id);
            return (
              <article
                key={record.id}
                className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black text-white">
                        #{record.id}
                      </span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">
                        {record.details.category}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-[10px] font-black",
                          record.details.status === "مفتوح"
                            ? "bg-orange-50 text-orange-700"
                            : record.details.status === "مراجعة"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700",
                        )}
                      >
                        {record.details.status}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-black text-slate-900">{record.details.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{record.details.description}</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-slate-900 text-white shadow-lg shadow-slate-200">
                    <User size={22} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <InfoCard label="نوع المخالفة" value={record.title} />
                  <InfoCard label="رقم الهوية" value={record.details.idNumber} />
                  <InfoCard label="رقم اللوحة" value={record.details.plate} />
                  <InfoCard label="التاريخ" value={record.time} />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400">المرفقات</p>
                    <p className="text-sm font-black text-slate-800">
                      {recordPhotos.length > 0 ? `${recordPhotos.length} صورة مرتبطة` : "بدون صور محفوظة"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openPreviewGallery(`مرفقات السجل #${record.id}`, recordPhotos, 0)}
                      className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[11px] font-black text-slate-700 transition hover:bg-slate-100"
                    >
                      <Camera size={15} />
                      <span>المرفقات</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(record)}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                    >
                      <FileText size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRecord(record.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
            لا توجد سجلات مطابقة للبحث الحالي.
          </div>
        ) : null}
      </section>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={() => {
                setShowForm(false);
                setPreviewGallery(null);
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative z-10 flex h-[100dvh] w-full flex-col overflow-hidden rounded-none border-0 bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:max-w-6xl sm:rounded-[2.5rem] sm:border sm:border-white/60"
            >
              <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#eff6ff_100%)] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setPreviewGallery(null);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                  >
                    <X size={18} />
                  </button>

                  <div className="text-right">
                    <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">
                      الخطوة {step} من 4
                    </div>
                    <h2 className="mt-3 text-xl font-black text-slate-900 sm:text-2xl">
                      {editingId ? "تحديث المخالفة" : "تسجيل مخالفة جديدة"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      تصميم حديث يحافظ على نفس الحقول الحالية بدون تغيير جوهري.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2 sm:mt-5">
                  {[1, 2, 3, 4].map((currentStep) => (
                    <div
                      key={currentStep}
                      className={cn(
                        "h-2 rounded-full transition-all",
                        currentStep <= step ? "bg-blue-600" : "bg-slate-100",
                      )}
                    />
                  ))}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={handlePhotoInputChange}
              />

              <div className="grid flex-1 gap-0 overflow-hidden xl:grid-cols-[0.74fr_0.26fr]">
                <div className="bg-slate-50/40 p-4 sm:p-6 overflow-y-auto">
                  {step === 1 ? (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                              <User size={18} />
                            </div>
                            <span className="text-lg font-black text-slate-900">بيانات الهوية</span>
                          </div>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          <FieldShell label="الاسم الكامل" error={errors.fullName}>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={form.fullName}
                                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                                placeholder="الاسم اليدوي..."
                                className={cn(inputClass(errors.fullName), "flex-1")}
                              />
                              <button
                                type="button"
                                onClick={() => openPhotoPicker("id_photo")}
                                className="h-12 w-12 flex items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 flex-shrink-0"
                              >
                                <Camera size={20} />
                              </button>
                            </div>
                          </FieldShell>

                          <FieldShell label="رقم الهوية" error={errors.idNumber}>
                            <input
                              type="text"
                              value={form.idNumber}
                              onChange={(event) =>
                                setForm((current) => ({
                                  ...current,
                                  idNumber: event.target.value.replace(/\D/g, ""),
                                }))
                              }
                              placeholder="000000000000"
                              className={inputClass(errors.idNumber, "text-center tracking-widest")}
                            />
                          </FieldShell>

                          <FieldShell label="نوع الهوية">
                            <select
                              value={form.idType}
                              onChange={(event) => {
                                const selectedType = event.target.value;
                                setForm((current) => ({ ...current, idType: selectedType }));
                                setShowCustomIdType(selectedType === "أخرى");
                              }}
                              className={inputClass()}
                            >
                              <option>بطاقة إلكترونية</option>
                              <option>بطاقة عادية</option>
                              <option>جواز سفر</option>
                              <option>أخرى</option>
                            </select>
                          </FieldShell>

                          {showCustomIdType && (
                            <FieldShell label="نوع الهوية المخصص">
                              <input
                                type="text"
                                value={form.customIdType}
                                onChange={(event) => setForm((current) => ({ ...current, customIdType: event.target.value }))}
                                placeholder="أدخل نوع الهوية..."
                                className={inputClass()}
                              />
                            </FieldShell>
                          )}
                        </div>



                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-black text-slate-700">أرقام الهاتف</p>
                          {form.phones.map((phone, index) => (
                            <div key={index} className="flex gap-2">
                              <div className="flex-1">
                                <div className="relative">
                                  <input
                                    type="tel"
                                    value={phone}
                                    onChange={(event) => updatePhone(index, event.target.value)}
                                    placeholder="7xxxxxxxx"
                                    className={inputClass(errors[`phone_${index}`], "pr-4 pl-10")}
                                  />
                                  <Phone size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                                {errors[`phone_${index}`] ? (
                                  <p className="mt-1 text-[11px] font-bold text-red-500">{errors[`phone_${index}`]}</p>
                                ) : null}
                              </div>

                              {index === 0 ? (
                                <button
                                  type="button"
                                  onClick={addPhone}
                                  className="h-12 w-12 flex items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700"
                                >
                                  <Plus size={20} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => removePhone(index)}
                                  className="h-12 w-12 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                                >
                                  <Trash2 size={20} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                              <Truck size={18} />
                            </div>
                            <span className="text-lg font-black text-slate-900">بيانات المركبة</span>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <FieldShell label="نوع وجمال المركبة" error={errors.vehicleType}>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={form.vehicleType}
                                onChange={(event) => setForm((current) => ({ ...current, vehicleType: event.target.value }))}
                                placeholder="صالون تويوتا..."
                                className={cn(inputClass(errors.vehicleType), "flex-1")}
                              />
                              <button
                                type="button"
                                onClick={() => openPhotoPicker("vehicle_photo")}
                                className="h-12 w-12 flex items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 flex-shrink-0"
                              >
                                <Camera size={20} />
                              </button>
                            </div>
                          </FieldShell>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_auto]">
                          <FieldShell label="رقم اللوحة" error={errors.plateNumber}>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={form.plateNumber}
                                onChange={(event) => setForm((current) => ({ ...current, plateNumber: event.target.value }))}
                                placeholder="00000"
                                className={cn(inputClass(errors.plateNumber, "text-center text-lg tracking-[0.25em]"), "flex-1")}
                              />
                              <select
                                value={form.provinceCode}
                                onChange={(event) => setForm((current) => ({ ...current, provinceCode: event.target.value }))}
                                className={cn(inputClass(undefined, "text-center"), "w-20")}
                              >
                                {Array.from({ length: 22 }, (_, index) => String(index + 1)).map((item) => (
                                  <option key={item}>{item}</option>
                                ))}
                              </select>
                            </div>
                          </FieldShell>

                          <FieldShell label="فئة اللوحة">
                            <select
                              value={form.plateCategory}
                              onChange={(event) => setForm((current) => ({ ...current, plateCategory: event.target.value }))}
                              className={inputClass()}
                            >
                              {["خصوصي", "نقل", "أجرة", "مؤقت", "جيش", "شرطة"].map((item) => (
                                <option key={item}>{item}</option>
                              ))}
                            </select>
                          </FieldShell>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                              <ShieldAlert size={18} />
                            </div>
                            <span className="text-lg font-black text-slate-900">تفاصيل المخالفة</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {["أمنية", "مالية", "أخرى"].map((category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() =>
                                setForm((current) => ({
                                  ...current,
                                  violationCategory: category,
                                  violationId: "",
                                  description: "",
                                }))
                              }
                              className={cn(
                                "rounded-2xl border px-5 py-3 text-sm font-black transition",
                                form.violationCategory === category
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700",
                              )}
                            >
                              {category}
                            </button>
                          ))}
                        </div>

                        <div className="mt-4">
                          <FieldShell label="نوع المخالفة" error={errors.violationId}>
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <select
                                  value={form.violationId}
                                  onChange={(event) => handleViolationChange(event.target.value)}
                                  className={inputClass(errors.violationId, "appearance-none")}
                                >
                                  <option value="">اختر النوع...</option>
                                  {violationsList.map((item) => (
                                    <option key={item.title} value={item.title}>
                                      {item.title}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              </div>
                              <button
                                type="button"
                                onClick={() => openPhotoPicker("violation_photo")}
                                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700"
                              >
                                <Camera size={20} />
                              </button>
                            </div>
                          </FieldShell>
                        </div>

                        <FieldShell label="ملاحظات إضافية" error={errors.description} className="mt-4">
                          <textarea
                            value={form.description}
                            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                            rows={5}
                            className={inputClass(errors.description, "min-h-[140px] resize-none py-4")}
                            placeholder="أدخل الوصف التفصيلي هنا..."
                          />
                        </FieldShell>
                      </div>
                    </div>
                  ) : null}

                  {step === 3 ? (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                              <CheckCircle2 size={18} />
                            </div>
                            <span className="text-lg font-black text-slate-900">الإجراء المنفذ</span>
                          </div>
                        </div>

                        <div>
                          <FieldShell label="نوع الإجراء">
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <select
                                  value={form.actionTaken}
                                  onChange={(event) => setForm((current) => ({ ...current, actionTaken: event.target.value }))}
                                  className={inputClass(undefined, "appearance-none")}
                                >
                                  <option>عمل التزام</option>
                                  <option>عمل محضر ضبط</option>
                                  <option>فرض غرامة مالية</option>
                                  <option>توقيف مؤقت</option>
                                  <option>تحويل للجهة المختصة</option>
                                </select>
                                <ChevronDown size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              </div>
                              <button
                                type="button"
                                onClick={() => openPhotoPicker("commitment")}
                                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700"
                              >
                                <Camera size={20} />
                              </button>
                            </div>
                          </FieldShell>
                        </div>

                        <FieldShell label="ملاحظات ووثائق أخرى" className="mt-4">
                          <textarea
                            value={form.finalNotes}
                            onChange={(event) => setForm((current) => ({ ...current, finalNotes: event.target.value }))}
                            rows={5}
                            className={inputClass(undefined, "min-h-[140px] resize-none py-4")}
                            placeholder="أي ملاحظات إضافية أو توثيق ملحق..."
                          />
                        </FieldShell>
                      </div>
                    </div>
                  ) : null}

                  {step === 4 ? (
                    <div ref={step4Ref} className="space-y-6">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                              <Eye size={18} />
                            </div>
                            <span className="text-lg font-black text-slate-900">المعاينة النهائية</span>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-3">
                            <CompactReviewCard label="الاسم" value={form.fullName || "—"} icon={<User size={15} />} />
                            <CompactReviewCard label="رقم الهوية" value={form.idNumber || "—"} icon={<FileText size={15} />} />
                            <CompactReviewCard label="نوع المركبة" value={form.vehicleType || "—"} icon={<Truck size={15} />} />
                            <CompactReviewCard label="رقم المركبة" value={form.plateNumber ? `${form.plateNumber} / ${form.provinceCode}` : "—"} icon={<Truck size={15} />} />
                            <CompactReviewCard label="رقم الجوال" value={form.phones.filter(Boolean).join(" - ") || "—"} icon={<Phone size={15} />} />
                            <CompactReviewCard label="نوع المخالفة" value={form.violationId || "—"} icon={<ShieldAlert size={15} />} />
                          </div>

                          <div>
                            <div className="mb-3 flex items-center justify-between">
                              <h4 className="text-base font-black text-slate-900">صور المعاينة</h4>
                              <p className="text-[11px] font-bold text-slate-500">اسحب لليمين أو اليسار لمعاينة الصور</p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-3">
                              <div className="overflow-x-auto pb-3 snap-x snap-mandatory touch-pan-x h-52" style={{ WebkitOverflowScrolling: 'touch' }}>
                                <div className="flex gap-3 items-start">
                                  {(previewOrderedPhotos.length ? previewOrderedPhotos : [{ id: 'empty', url: '', name: 'لا توجد صور', sizeLabel: '', capturedAt: '', type: 'violation_photo' }]).map((photo) => (
                                    <div key={photo.id} className="shrink-0 w-56 snap-start">
                                      {photo.url ? (
                                        <button
                                          type="button"
                                          onClick={() => openPreviewGallery('معاينة الصور', previewOrderedPhotos.length ? previewOrderedPhotos : [], previewOrderedPhotos.findIndex(p => p.id === photo.id))}
                                          className="group relative w-full aspect-[4/3] overflow-hidden rounded-xl border bg-slate-50"
                                        >
                                          <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                                        </button>
                                      ) : (
                                        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                                          <span className="text-sm text-slate-400">لا توجد صور</span>
                                        </div>
                                      )}
                                      <p className="mt-2 text-center text-sm font-black text-slate-800">{photo.id === 'empty' ? '—' : photoMeta[photo.type].label}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {false ? (
                    <div className="h-full rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#eef6ff_100%)] p-5 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                        <div className="text-right">
                          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">
                            <Eye size={14} />
                            <span>المعاينة النهائية</span>
                          </div>
                          <h3 className="mt-3 text-xl font-black text-slate-900">مراجعة سريعة قبل الحفظ</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            تم ترتيب الشاشة لتعرض أهم البيانات والصور في واجهة واحدة.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          <MiniReviewStat label="المخالفة" value={form.violationId || "—"} />
                          <MiniReviewStat label="الإجراء" value={form.actionTaken || "—"} />
                          <MiniReviewStat
                            label="الصور"
                            value={String(
                              (Object.values(capturedPhotos) as PhotoAsset[][]).reduce(
                                (total, items) => total + items.length,
                                0,
                              ),
                            )}
                          />
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                        <div className="rounded-[1.8rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                              <Eye size={18} />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-slate-900">مراجعة سريعة</h3>
                              <p className="text-[11px] font-bold text-slate-500">ملخص بيانات المخالفة</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <CompactReviewCard label="الاسم" value={form.fullName || "لا يوجد"} icon={<User size={15} />} />
                              <CompactReviewCard label="رقم الهوية" value={form.idNumber || "لا يوجد"} icon={<FileText size={15} />} />
                              <CompactReviewCard
                                label="رقم الجوال"
                                value={form.phones.filter(Boolean).join(" - ") || "لا يوجد"}
                                icon={<Phone size={15} />}
                              />
                              <CompactReviewCard label="المركبة" value={form.vehicleType || "لا يوجد"} icon={<Truck size={15} />} />
                              <CompactReviewCard
                                label="رقم اللوحة"
                                value={form.plateNumber ? `${form.plateNumber} / ${form.provinceCode}` : "لا يوجد"}
                                icon={<Truck size={15} />}
                              />
                            </div>
                            <CompactReviewCard
                              label="ملاحظات مختصرة"
                              value={form.finalNotes || form.description || "لا توجد"}
                              icon={<FileText size={15} />}
                            />
                          </div>
                        </div>

                        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="text-right">
                              <h4 className="text-base font-black text-slate-900">الصور المرتبطة</h4>
                              <p className="text-[11px] font-bold text-slate-500">اسحب لعرض جميع الصور الملتقطة</p>
                            </div>
                            <div className="rounded-2xl bg-slate-900 p-2 text-white">
                              <Camera size={16} />
                            </div>
                          </div>

                          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                            {(Object.keys(photoMeta) as PhotoType[]).map((type) => {
                              const photos = capturedPhotos[type] || [];
                              return (
                                <div key={type} className="flex-shrink-0 w-48 snap-start">
                                  <ReviewPhotoTile
                                    type={type}
                                    photos={photos}
                                    onOpen={() =>
                                      photos.length > 0
                                        ? openPreviewGallery(`معاينة ${photoMeta[type].label}`, photos, 0)
                                        : openPhotoPicker(type)
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {false ? (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                              <Eye size={18} />
                            </div>
                            <span className="text-lg font-black text-slate-900">المعاينة النهائية</span>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* إطار البيانات الموحد */}
                          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                                <Eye size={18} />
                              </div>
                              <h3 className="text-lg font-black text-slate-900">ملخص البيانات</h3>
                            </div>
                            
                            <div className="grid gap-6 md:grid-cols-2">
                              {/* قسم بيانات الهوية */}
                              <div className="rounded-xl border border-slate-200 bg-white p-5">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                                    <User size={16} />
                                  </div>
                                  <h4 className="text-base font-black text-slate-900">بيانات الهوية</h4>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">الاسم الكامل</p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">{form.fullName || "لا يوجد"}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">رقم الهوية</p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">{form.idNumber || "لا يوجد"}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">نوع الهوية</p>
                                      <p className="mt-1 text-sm font-bold text-slate-800">{form.idType || "لا يوجد"}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">أرقام الهاتف</p>
                                      <p className="mt-1 text-sm font-bold text-slate-800">{form.phones.join("، ") || "لا يوجد"}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* قسم بيانات المركبة */}
                              <div className="rounded-xl border border-slate-200 bg-white p-5">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                                    <Truck size={16} />
                                  </div>
                                  <h4 className="text-base font-black text-slate-900">بيانات المركبة</h4>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">نوع وجمال المركبة</p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">{form.vehicleType || "لا يوجد"}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">رقم اللوحة</p>
                                      <p className="mt-1 text-sm font-bold text-slate-800">{form.plateNumber || "لا يوجد"}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">رمز المحافظة</p>
                                      <p className="mt-1 text-sm font-bold text-slate-800">{form.provinceCode || "لا يوجد"}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">فئة اللوحة</p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">{form.plateCategory || "لا يوجد"}</p>
                                  </div>
                                </div>
                              </div>

                              {/* قسم تفاصيل المخالفة */}
                              <div className="rounded-xl border border-slate-200 bg-white p-5">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                                    <ShieldAlert size={16} />
                                  </div>
                                  <h4 className="text-base font-black text-slate-900">تفاصيل المخالفة</h4>
                                </div>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">فئة المخالفة</p>
                                      <p className="mt-1 text-sm font-bold text-slate-800">{form.violationCategory || "لا يوجد"}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">نوع المخالفة</p>
                                      <p className="mt-1 text-sm font-bold text-slate-800">{form.violationId || "لا يوجد"}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ملاحظات إضافية</p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">{form.description || "لا يوجد"}</p>
                                  </div>
                                </div>
                              </div>

                              {/* قسم الإجراء المنفذ */}
                              <div className="rounded-xl border border-slate-200 bg-white p-5">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                                    <CheckCircle2 size={16} />
                                  </div>
                                  <h4 className="text-base font-black text-slate-900">الإجراء المنفذ</h4>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">نوع الإجراء</p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">{form.actionTaken || "لا يوجد"}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ملاحظات ووثائق</p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">{form.finalNotes || "لا يوجد"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* قسم الصور الملتقطة - شريط أفقي */}
                          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                                <Camera size={18} />
                              </div>
                              <h3 className="text-lg font-black text-slate-900">الصور الملتقطة</h3>
                            </div>
                            
                            <div className="flex gap-4 overflow-x-auto pb-4" style={{ direction: "rtl" }}>
                              {(Object.keys(photoMeta) as PhotoType[]).map((type) => {
                                const photos = capturedPhotos[type] || [];
                                const meta = photoMeta[type];
                                return (
                                  <div
                                    key={type}
                                    className="flex-shrink-0 w-48"
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        photos.length > 0
                                          ? openPreviewGallery(`معاينة ${meta.label}`, photos, 0)
                                          : openPhotoPicker(type)
                                      }
                                      className={cn(
                                        "group relative w-full aspect-[4/3] rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg",
                                        photos.length > 0
                                          ? "border-blue-200 bg-white hover:border-blue-400"
                                          : "border-dashed border-slate-200 bg-slate-50 hover:border-blue-200"
                                      )}
                                    >
                                      {photos.length > 0 ? (
                                        <img
                                          src={photos[0]}
                                          alt={meta.label}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-full items-center justify-center">
                                          <div className="rounded-xl p-3 bg-slate-100 text-slate-400">
                                            {meta.icon}
                                          </div>
                                        </div>
                                      )}
                                      {photos.length > 0 && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                      )}
                                    </button>
                                    <p className="mt-2 text-center text-sm font-black text-slate-800">{meta.label}</p>
                                    <p className="text-center text-[11px] font-bold text-slate-500">
                                      {photos.length > 0 ? `${photos.length} صورة` : "اضغط لإضافة صور"}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {step !== 4 ? (
                <aside className="hidden overflow-y-auto border-r border-slate-100 bg-white p-5 xl:block">
                  <div className="rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Snapshot
                    </p>
                    <h3 className="mt-3 text-lg font-black text-slate-900">لوحة متابعة ذكية</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      عرض سريع للحالة الحالية والصور الملتقطة والمحتوى الجاهز للحفظ.
                    </p>

                    <div className="mt-5 space-y-3">
                      <SideMetric label="الاسم" value={form.fullName || "—"} />
                      <SideMetric label="المخالفة" value={form.violationId || "—"} />
                      <SideMetric label="الإجراء" value={form.actionTaken || "—"} />
                      <SideMetric
                        label="الصور"
                        value={String(
                          (Object.values(capturedPhotos) as PhotoAsset[][]).reduce(
                            (total, items) => total + items.length,
                            0,
                          ),
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {(Object.keys(photoMeta) as PhotoType[]).map((type) => (
                      <div key={type}>
                        <PhotoStripCard
                          type={type}
                          photos={capturedPhotos[type] || []}
                          onCapture={() => openPhotoPicker(type)}
                          onPreview={(index) =>
                            openPreviewGallery(
                              `معاينة ${photoMeta[type].label}`,
                              capturedPhotos[type] || [],
                              index,
                            )
                          }
                          onRemove={(photoId) => removeDraftPhoto(type, photoId)}
                        />
                      </div>
                    ))}
                  </div>
                </aside>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => {
                    if (step > 1) {
                      setStep((current) => current - 1);
                    } else {
                      setShowForm(false);
                      setPreviewGallery(null);
                    }
                  }}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-600 transition hover:bg-slate-100"
                >
                  <ArrowLeft size={15} />
                  <span>{step === 1 ? "إغلاق" : "السابق"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!validate()) return;
                    if (step < 4) {
                      setStep((current) => current + 1);
                      return;
                    }
                    saveRecord();
                  }}
                  className={cn(
                    "inline-flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-black text-white transition",
                    step < 4 ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700",
                  )}
                >
                  {isSaving ? (
                    <span>جارٍ الحفظ...</span>
                  ) : (
                    <>
                      <span>{step < 4 ? "متابعة" : "اعتماد وحفظ"}</span>
                      <Check size={15} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function parseIdentityText(rawText: string): { id: string; name: string } {
  const linePreservedText = normalizeArabicDigits(rawText.replace(/[|]/g, " "));
  const normalizedText = linePreservedText.replace(/[ \t]+/g, " ").trim();

  const lines = linePreservedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const idMatches = normalizedText.match(/\b\d{8,14}\b/g) || [];
  const preferredId =
    idMatches.find((item) => item.length === 12) ||
    idMatches.find((item) => item.length === 11) ||
    idMatches.find((item) => item.length === 8) ||
    idMatches[0] ||
    "";

  const explicitNameLine =
    lines.find((line) => /^(?:name|الاسم|اسم)\s*[:\-]/i.test(line)) ||
    lines.find((line) => {
      const clean = line.replace(/\d/g, "").trim();
      return clean.length >= 8 && /[\u0600-\u06FFa-zA-Z]/.test(clean);
    }) ||
    "";

  const preferredName = sanitizeExtractedName(
    explicitNameLine.replace(/^(?:name|الاسم|اسم)\s*[:\-]?\s*/i, ""),
  );

  return {
    id: preferredId,
    name: preferredName,
  };
}

function normalizeArabicDigits(value: string) {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const easternDigits = "۰۱۲۳۴۵۶۷۸۹";

  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const arabicIndex = arabicDigits.indexOf(digit);
    if (arabicIndex >= 0) return String(arabicIndex);

    const easternIndex = easternDigits.indexOf(digit);
    return easternIndex >= 0 ? String(easternIndex) : digit;
  });
}

function sanitizeExtractedName(value: string) {
  return value
    .replace(/[^\u0600-\u06FFa-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function normalizeGuideRect(rect: RegionRect): RegionRect {
  const x2 = rect.x + rect.width;
  const y2 = rect.y + rect.height;
  const minX = clamp01(Math.min(rect.x, x2));
  const minY = clamp01(Math.min(rect.y, y2));
  const maxX = clamp01(Math.max(rect.x, x2));
  const maxY = clamp01(Math.max(rect.y, y2));

  return {
    x: minX,
    y: minY,
    width: Math.max(0.001, maxX - minX),
    height: Math.max(0.001, maxY - minY),
  };
}

function denormalizeGuideRect(rect: RegionRect, width: number, height: number) {
  return {
    x: rect.x * width,
    y: rect.y * height,
    width: rect.width * width,
    height: rect.height * height,
  };
}

function parseIdentityTextFromRegions(regionResults: OcrRegionResult[]): { id: string; name: string } {
  const normalizedRegions = regionResults.map((region) => ({
    key: region.key,
    text: normalizeArabicDigits(region.text.replace(/[|]/g, " ")),
  }));

  const combinedLines = normalizedRegions
    .flatMap((region) =>
      region.text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    );

  const prioritizedNameLines = normalizedRegions
    .filter((region) => region.key === "name_band" || region.key === "full")
    .flatMap((region) =>
      region.text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    );

  return {
    id: findBestYemeniIdCandidate(normalizedRegions),
    name: findBestYemeniNameCandidate(prioritizedNameLines.length ? prioritizedNameLines : combinedLines),
  };
}

async function buildIdentityOcrTargets(
  imageUrl: string,
  guideRegions?: Partial<Record<GuideTarget, RegionRect>>,
): Promise<OcrRegionImage[]> {
  const image = await loadImageElement(imageUrl);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const defaultNameRegion = {
    x: width * 0.58,
    y: height * 0.29,
    width: width * 0.24,
    height: height * 0.1,
  };
  const defaultIdRegion = {
    x: width * 0.54,
    y: height * 0.19,
    width: width * 0.28,
    height: height * 0.09,
  };
  const guidedNameRegion = guideRegions?.name_band
    ? denormalizeGuideRect(guideRegions.name_band, width, height)
    : defaultNameRegion;
  const guidedIdRegion = guideRegions?.id_band
    ? denormalizeGuideRect(guideRegions.id_band, width, height)
    : defaultIdRegion;

  return [
    {
      key: "full",
      dataUrl: preprocessTextRegion(image, {
        x: width * 0.48,
        y: height * 0.1,
        width: width * 0.4,
        height: height * 0.58,
      }),
    },
    {
      key: "name_band",
      dataUrl: preprocessTextRegion(image, guidedNameRegion),
    },
    {
      key: "id_band",
      dataUrl: preprocessTextRegion(image, guidedIdRegion),
    },
    {
      key: "lower_band",
      dataUrl: preprocessTextRegion(image, {
        x: width * 0.5,
        y: height * 0.16,
        width: width * 0.34,
        height: height * 0.28,
      }),
    },
  ];
}

function findBestYemeniIdCandidate(regionResults: OcrRegionResult[]) {
  const candidates = regionResults.flatMap((region) => {
    const normalizedText = region.text.replace(/[ \t]+/g, " ").trim();
    const collapsedDigits = normalizedText.replace(/[^\d]/g, "");
    const regionBoost = region.key === "id_band" ? 4 : region.key === "lower_band" ? 2 : 1;
    const keywordBoost = yemeniIdentityKeywords.some((keyword) => normalizedText.includes(keyword)) ? 2 : 0;

    return yemeniIdentityPatterns.flatMap((pattern) => {
      const directMatches = Array.from(normalizedText.matchAll(pattern.regex)).map((match) => ({
        id: match[0].replace(/[^\d]/g, ""),
        score: pattern.priority + regionBoost + keywordBoost,
      }));

      const collapsedMatch = new RegExp(`^\\d{${pattern.length}}$`).test(collapsedDigits)
        ? [{
            id: collapsedDigits,
            score: pattern.priority + regionBoost + keywordBoost + 3,
          }]
        : [];

      return [...directMatches, ...collapsedMatch];
    });
  });

  const best = candidates.sort((a, b) => b.score - a.score)[0];
  return best?.id || "";
}

function findBestYemeniNameCandidate(lines: string[]) {
  const explicitNameLine =
    lines.find((line) => /^(?:name|الاسم|اسم)\s*[:\-]/i.test(line)) ||
    lines.find((line) => {
      const clean = sanitizeExtractedName(line.replace(/\d/g, " "));
      const wordCount = clean.split(/\s+/).filter(Boolean).length;
      return clean.length >= 8 && wordCount >= 3;
    }) ||
    "";

  return sanitizeExtractedName(
    explicitNameLine
      .replace(/^(?:name|الاسم|اسم)\s*[:\-]?\s*/i, "")
      .replace(/\b(?:الجنس|العنوان|تاريخ|المهنة)\b.*$/i, ""),
  );
}

function resolveYemeniIdentityType(idValue: string) {
  const match = yemeniIdentityPatterns.find((pattern) => new RegExp(pattern.regex.source).test(idValue));
  return match?.idType || "";
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image_load_failed"));
    image.src = src;
  });
}

function cropImageRegion(
  image: HTMLImageElement,
  region: { x: number; y: number; width: number; height: number },
) {
  const canvas = document.createElement("canvas");
  const baseWidth = image.naturalWidth || image.width;
  const baseHeight = image.naturalHeight || image.height;
  const safeX = Math.max(0, Math.floor(region.x));
  const safeY = Math.max(0, Math.floor(region.y));
  const safeWidth = Math.max(1, Math.min(baseWidth - safeX, Math.floor(region.width)));
  const safeHeight = Math.max(1, Math.min(baseHeight - safeY, Math.floor(region.height)));

  canvas.width = safeWidth;
  canvas.height = safeHeight;

  const context = canvas.getContext("2d");
  if (!context) return image.src;

  context.drawImage(image, safeX, safeY, safeWidth, safeHeight, 0, 0, safeWidth, safeHeight);
  return canvas.toDataURL("image/jpeg", 0.92);
}

function preprocessTextRegion(
  image: HTMLImageElement,
  region: { x: number; y: number; width: number; height: number },
) {
  const canvas = document.createElement("canvas");
  const baseWidth = image.naturalWidth || image.width;
  const baseHeight = image.naturalHeight || image.height;
  const safeX = Math.max(0, Math.floor(region.x));
  const safeY = Math.max(0, Math.floor(region.y));
  const safeWidth = Math.max(1, Math.min(baseWidth - safeX, Math.floor(region.width)));
  const safeHeight = Math.max(1, Math.min(baseHeight - safeY, Math.floor(region.height)));
  const scale = 4;

  canvas.width = safeWidth * scale;
  canvas.height = safeHeight * scale;

  const context = canvas.getContext("2d");
  if (!context) return image.src;

  context.imageSmoothingEnabled = false;
  context.filter = "grayscale(100%) contrast(220%) brightness(110%)";
  context.drawImage(
    image,
    safeX,
    safeY,
    safeWidth,
    safeHeight,
    0,
    0,
    safeWidth * scale,
    safeHeight * scale,
  );
  const imageData = context.getImageData(0, 0, safeWidth * scale, safeHeight * scale);
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const gray = Math.round(red * 0.299 + green * 0.587 + blue * 0.114);
    const ink = gray < 180 ? 0 : 255;
    data[index] = ink;
    data[index + 1] = ink;
    data[index + 2] = ink;
    data[index + 3] = 255;
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

function getRecordPhotos(
  photoStore: Record<string, PhotoCollection>,
  recordId: number | string,
): PhotoAsset[] {
  return Object.values(photoStore[String(recordId)] || {}).flat() as PhotoAsset[];
}

function inputClass(error?: string, extra = "") {
  return cn(
    "h-12 w-full rounded-2xl border bg-white px-4 text-right text-sm font-black outline-none transition focus:border-blue-500 focus:bg-white",
    error ? "border-red-500 bg-red-50" : "border-slate-200",
    extra,
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:scale-105 hover:shadow-xl">
      <div className="relative z-10 flex flex-col items-center justify-center p-6">
        <div className="mb-3 rounded-2xl bg-white/20 p-4 text-white shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:scale-110">
          {icon}
        </div>
        <div className="text-4xl font-black text-white drop-shadow-lg">{value}</div>
        <div className="mt-2 text-sm font-bold text-white/90">{label}</div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}

function ActionChip({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white/90">
      {label}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-black text-slate-800">{value || "—"}</p>
    </div>
  );
}

function PreviewMetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] font-black text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function SectionShell({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
          {icon}
        </div>
        <div className="text-right">
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FieldShell({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-black text-slate-600">{label}</label>
      {children}
      {error ? <p className="mt-1 text-[11px] font-bold text-red-500">{error}</p> : null}
    </div>
  );
}

function PhotoTriggerCard({
  type,
  photos,
  onCapture,
  onPreview,
}: {
  type: PhotoType;
  photos: PhotoAsset[];
  onCapture: () => void;
  onPreview: () => void;
}) {
  const meta = photoMeta[type];
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-slate-900 p-2 text-white">{meta.icon}</div>
        <span className="text-[10px] font-black text-slate-400">
          {photos.length > 0 ? `${photos.length} صورة` : "بدون صور"}
        </span>
      </div>
      <p className="mt-4 text-sm font-black text-slate-900">{meta.label}</p>
      <p className="mt-1 text-[11px] font-bold text-slate-500">{meta.hint}</p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onCapture}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-[11px] font-black text-white transition hover:bg-slate-800"
        >
          <Camera size={14} />
          <span>التقاط</span>
        </button>
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-black text-slate-700 transition hover:bg-slate-50"
        >
          <Eye size={14} />
          <span>معاينة</span>
        </button>
      </div>
    </div>
  );
}

function MiniReviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

function CompactReviewCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-right">
          <p className="text-[11px] font-black text-slate-500">{label}</p>
          <p className="mt-1 text-sm font-black leading-6 text-slate-900">{value}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">{icon}</div>
      </div>
    </div>
  );
}

function ReviewPhotoTile({
  type,
  photos,
  onOpen,
}: {
  type: PhotoType;
  photos: PhotoAsset[];
  onOpen: () => void;
}) {
  const meta = photoMeta[type];

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group overflow-hidden rounded-[1.4rem] border text-right transition hover:shadow-md",
        photos.length > 0 ? "border-slate-200 bg-slate-950" : "border-dashed border-slate-200 bg-slate-50",
      )}
    >
      <div className="relative aspect-[4/3]">
        {photos.length > 0 ? (
          <>
            <img src={photos[0].url} alt={meta.label} className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-3 text-white">
              <p className="text-sm font-black">{meta.label}</p>
              <p className="text-[11px] font-bold text-white/80">{photos.length} صورة</p>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <div className="rounded-2xl bg-white p-3 shadow-sm">{meta.icon}</div>
            <p className="text-sm font-black text-slate-700">{meta.label}</p>
            <p className="text-[11px] font-bold">اضغط لإضافة صورة</p>
          </div>
        )}
      </div>
    </button>
  );
}

function SideMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

function PhotoStripCard({
  type,
  photos,
  onCapture,
  onPreview,
  onRemove,
}: {
  type: PhotoType;
  photos: PhotoAsset[];
  onCapture: () => void;
  onPreview: (index: number) => void;
  onRemove: (photoId: string) => void;
}) {
  const meta = photoMeta[type];
  const accentClasses =
    meta.accent === "emerald"
      ? "border-emerald-100 from-emerald-500/10 to-white"
      : meta.accent === "orange"
        ? "border-orange-100 from-orange-500/10 to-white"
        : meta.accent === "violet"
          ? "border-violet-100 from-violet-500/10 to-white"
          : "border-blue-100 from-blue-500/10 to-white";

  return (
    <div className={`rounded-[1.9rem] border bg-gradient-to-br p-4 shadow-sm ${accentClasses}`}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCapture}
          className="inline-flex h-10 items-center gap-2 rounded-2xl bg-white px-4 text-[11px] font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Camera size={14} />
          <span>التقاط</span>
        </button>
        <div className="text-right">
          <p className="text-sm font-black text-slate-900">{meta.label}</p>
          <p className="text-[11px] font-bold text-slate-500">
            {photos.length > 0 ? `${photos.length} صورة` : "لا توجد صور بعد"}
          </p>
        </div>
      </div>

      {photos.length > 0 ? (
        <div className="mt-4 relative">
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {photos.map((photo, index) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-2xl border border-white bg-white shadow-sm flex-shrink-0 w-20 snap-start">
                <button type="button" onClick={() => onPreview(index)} className="block w-full">
                  <img src={photo.url} alt={photo.name} className="h-20 w-full object-cover transition group-hover:scale-105" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(photo.id)}
                  className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-700 transition hover:bg-rose-500 hover:text-white"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          {photos.length > 3 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                type="button"
                onClick={(e) => {
                  const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto') as HTMLElement;
                  if (container) {
                    container.scrollBy({ left: -100, behavior: 'smooth' });
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                <ArrowLeft size={14} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  const container = e.currentTarget.parentElement?.querySelector('.overflow-x-auto') as HTMLElement;
                  if (container) {
                    container.scrollBy({ left: 100, behavior: 'smooth' });
                  }
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-5 text-center text-[11px] font-bold text-slate-500">
          التقط صورة لتظهر هنا مباشرة.
        </div>
      )}
    </div>
  );
}
