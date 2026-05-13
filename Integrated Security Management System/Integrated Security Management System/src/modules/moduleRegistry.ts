export interface ModuleDefinition {
  id: string;
  title: string;
  path: string;
  icon: string;
  color: string;
  shortDescription: string;
}

export const moduleRegistry: ModuleDefinition[] = [
  {
    id: "violations",
    title: "نظام المخالفات",
    path: "/violations",
    icon: "ShieldAlert",
    color: "bg-rose-600",
    shortDescription: "رصد المخالفات وإدارتها ومتابعة حالتها",
  },
  {
    id: "detainees",
    title: "نظام الموقوفين",
    path: "/detainees",
    icon: "Users",
    color: "bg-blue-600",
    shortDescription: "إدارة بيانات الموقوفين وإجراءات التوقيف",
  },
  {
    id: "property",
    title: "نظام الأمانات",
    path: "/property",
    icon: "Package",
    color: "bg-emerald-600",
    shortDescription: "تسجيل الأمانات والعهد وتسليمها",
  },
  {
    id: "reports",
    title: "نظام البلاغات والشكاوى",
    path: "/reports",
    icon: "Activity",
    color: "bg-indigo-600",
    shortDescription: "استقبال البلاغات ومتابعة قرارات المعالجة",
  },
  {
    id: "commitments",
    title: "نظام الالتزامات",
    path: "/commitments",
    icon: "FileCheck",
    color: "bg-amber-500",
    shortDescription: "إدارة الالتزامات وربطها بالمخالفات والبلاغات",
  },
];
