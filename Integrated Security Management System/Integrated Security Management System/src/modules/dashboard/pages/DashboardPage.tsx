import { Link } from "react-router-dom";
import { moduleRegistry } from "../../moduleRegistry";
import { PageSection } from "../../../shared/components/PageSection";

const overviewStats = [
  { label: "الأنظمة التشغيلية", value: "5", helper: "منصة موحدة" },
  { label: "الوحدات الجاهزة", value: "4+1", helper: "الالتزامات مضافة" },
  { label: "الهيكل الحالي", value: "Modular", helper: "قابل للتوسع" },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#f97316_100%)] p-5 text-white shadow-2xl sm:rounded-[2.25rem] sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
          <div className="text-right">
            <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-black sm:px-4 sm:py-2 sm:text-xs">
              Integrated Security Management Platform
            </div>
            <h1 className="text-2xl font-black leading-tight sm:text-3xl md:text-4xl">
              منصة أمنية مركزية
              <br />
              تعمل بخمس وحدات تشغيلية مترابطة
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-[15px]">
              تم تنظيم المشروع إلى بنية حديثة تعتمد على وحدات مستقلة، بحيث يمكن تطوير كل نظام بشكل منفصل
              مع الحفاظ على طبقة مشتركة للمصادقة والتنقل والصلاحيات والمرجعيات.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {overviewStats.map((stat) => (
              <div key={stat.label} className="rounded-[1.35rem] border border-white/10 bg-white/10 p-4 backdrop-blur sm:rounded-[1.75rem] sm:p-5">
                <div className="text-xs text-blue-100">{stat.label}</div>
                <div className="mt-2 text-3xl font-black">{stat.value}</div>
                <div className="mt-1 text-xs text-slate-200">{stat.helper}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageSection
        title="الأنظمة التشغيلية"
        description="كل نظام أصبح يملك مساره المستقل ويمكن تطويره أو إعادة بنائه دون تشابك مع بقية المشروع."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {moduleRegistry.map((module) => (
            <Link
              key={module.id}
              to={module.path}
              className="group rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 text-right transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-lg sm:rounded-[1.75rem] sm:p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`h-12 w-12 rounded-2xl ${module.color} shadow-lg`} />
                <div>
                  <div className="text-lg font-black text-slate-900">{module.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-500">{module.shortDescription}</div>
                </div>
              </div>
              <div className="mt-5 text-xs font-black text-slate-400 transition group-hover:text-slate-700">
                فتح الوحدة
              </div>
            </Link>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
