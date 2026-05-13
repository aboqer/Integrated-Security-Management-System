import React, { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Clock3, FileCheck, LoaderCircle, Plus, RefreshCcw, Search } from "lucide-react";
import { api, ApiError } from "../../../services/api";
import { PageSection } from "../../../shared/components/PageSection";

interface CommitmentRecord {
  id: string;
  commitment_number: string;
  person_name: string;
  commitment_type_name?: string;
  location_name?: string;
  title: string;
  description: string;
  status: string;
  committed_at: string;
  due_at?: string | null;
}

interface ReferenceItem {
  id: string;
  name_ar?: string;
}

interface PersonItem {
  id: string;
  full_name_ar: string;
}

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  open: "مفتوح",
  in_review: "قيد المراجعة",
  approved: "معتمد",
  closed: "مغلق",
  cancelled: "ملغي",
  transferred: "محول",
};

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  open: "bg-blue-100 text-blue-700",
  in_review: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-900 text-white",
  cancelled: "bg-rose-100 text-rose-700",
  transferred: "bg-indigo-100 text-indigo-700",
};

export function CommitmentsPage() {
  const [records, setRecords] = useState<CommitmentRecord[]>([]);
  const [people, setPeople] = useState<PersonItem[]>([]);
  const [types, setTypes] = useState<ReferenceItem[]>([]);
  const [locations, setLocations] = useState<ReferenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    personId: "",
    commitmentTypeId: "",
    locationId: "",
    title: "",
    description: "",
    dueAt: "",
    notes: "",
  });

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [commitments, peopleList, typeList, locationList] = await Promise.all([
        api.commitments.list(search ? `search=${encodeURIComponent(search)}` : ""),
        api.people.list(),
        api.reference.commitmentTypes(),
        api.reference.locations(),
      ]);

      setRecords(commitments as CommitmentRecord[]);
      setPeople(peopleList as PersonItem[]);
      setTypes(typeList as ReferenceItem[]);
      setLocations(locationList as ReferenceItem[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "تعذر تحميل بيانات الالتزامات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [search]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.commitments.create({
        personId: form.personId,
        commitmentTypeId: form.commitmentTypeId || null,
        locationId: form.locationId || null,
        title: form.title,
        description: form.description,
        dueAt: form.dueAt || null,
        notes: form.notes || null,
      });

      setForm({
        personId: "",
        commitmentTypeId: "",
        locationId: "",
        title: "",
        description: "",
        dueAt: "",
        notes: "",
      });

      await loadData();
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : "تعذر إنشاء الالتزام");
    } finally {
      setSubmitting(false);
    }
  }

  const openCount = records.filter((item) => item.status === "open").length;
  const reviewCount = records.filter((item) => item.status === "in_review").length;
  const closedCount = records.filter((item) => item.status === "closed").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2.25rem] bg-[linear-gradient(135deg,#111827_0%,#1d4ed8_55%,#f59e0b_100%)] p-8 text-white shadow-xl">
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black">
            النظام الخامس
          </div>
          <h1 className="mt-4 text-3xl font-black">نظام الالتزامات</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-100">
            تم بناء هذه الوحدة بنفس منطق نظام المخالفات، مع إمكان الربط بالشخص والموقع ونوع الالتزام
            وتتبع الحالة والتنفيذ ضمن واجهة تشغيل مستقلة.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <MetricCard icon={<FileCheck size={20} />} label="إجمالي الالتزامات" value={String(records.length)} />
          <MetricCard icon={<Clock3 size={20} />} label="قيد التنفيذ" value={String(openCount + reviewCount)} />
          <MetricCard icon={<CheckCircle2 size={20} />} label="المكتمل" value={String(closedCount)} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <PageSection
          title="إنشاء التزام جديد"
          description="نموذج مستقل للالتزامات مع نفس أسلوب أنظمة السجلات التشغيلية."
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="الشخص"
                value={form.personId}
                onChange={(value) => setForm((current) => ({ ...current, personId: value }))}
                options={people.map((item) => ({ value: item.id, label: item.full_name_ar }))}
                required
              />
              <SelectField
                label="نوع الالتزام"
                value={form.commitmentTypeId}
                onChange={(value) => setForm((current) => ({ ...current, commitmentTypeId: value }))}
                options={types.map((item) => ({ value: item.id, label: item.name_ar || "غير محدد" }))}
              />
              <SelectField
                label="الموقع"
                value={form.locationId}
                onChange={(value) => setForm((current) => ({ ...current, locationId: value }))}
                options={locations.map((item) => ({ value: item.id, label: item.name_ar || "غير محدد" }))}
              />
              <TextField
                label="تاريخ الاستحقاق"
                type="datetime-local"
                value={form.dueAt}
                onChange={(value) => setForm((current) => ({ ...current, dueAt: value }))}
              />
            </div>

            <TextField
              label="عنوان الالتزام"
              value={form.title}
              onChange={(value) => setForm((current) => ({ ...current, title: value }))}
              required
            />

            <TextAreaField
              label="وصف الالتزام"
              value={form.description}
              onChange={(value) => setForm((current) => ({ ...current, description: value }))}
              required
            />

            <TextAreaField
              label="ملاحظات"
              value={form.notes}
              onChange={(value) => setForm((current) => ({ ...current, notes: value }))}
            />

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-70"
            >
              {submitting ? <LoaderCircle size={18} className="animate-spin" /> : <Plus size={18} />}
              <span>{submitting ? "جاري الحفظ..." : "إضافة الالتزام"}</span>
            </button>
          </form>
        </PageSection>

        <PageSection
          title="سجل الالتزامات"
          description="قائمة تشغيلية قابلة للبحث، وبنية جاهزة للتوسعة إلى تفاصيل وتحديث حالة."
          actions={
            <>
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ابحث بالعنوان أو رقم الالتزام"
                  className="rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => void loadData()}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCcw size={16} />
              </button>
            </>
          }
        >
          {loading ? (
            <div className="flex min-h-60 items-center justify-center text-slate-500">
              <LoaderCircle size={22} className="animate-spin" />
              <span className="mr-3 text-sm">جاري تحميل الالتزامات...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {records.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
                  لا توجد التزامات مطابقة حاليًا.
                </div>
              ) : (
                records.map((record) => (
                  <article
                    key={record.id}
                    className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="text-right">
                        <div className="text-lg font-black text-slate-900">{record.title}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {record.commitment_number} • {record.person_name}
                          {record.commitment_type_name ? ` • ${record.commitment_type_name}` : ""}
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{record.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-2 text-xs font-black ${statusStyles[record.status] || statusStyles.open}`}>
                          {statusLabels[record.status] || record.status}
                        </span>
                        {record.due_at ? (
                          <span className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-600">
                            الاستحقاق: {new Date(record.due_at).toLocaleDateString("ar-SA")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </PageSection>
      </div>
    </div>
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
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">{icon}</div>
        <div className="text-right">
          <div className="text-xs text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-black text-slate-900">{value}</div>
        </div>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-right">
      <span className="mb-2 block text-sm font-black text-slate-700">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-right">
      <span className="mb-2 block text-sm font-black text-slate-700">{label}</span>
      <textarea
        rows={4}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <label className="block text-right">
      <span className="mb-2 block text-sm font-black text-slate-700">{label}</span>
      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
      >
        <option value="">اختر</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
