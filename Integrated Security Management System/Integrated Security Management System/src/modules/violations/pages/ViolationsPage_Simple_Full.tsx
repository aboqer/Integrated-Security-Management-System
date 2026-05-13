// هذا الملف يحتوي على التصميم المبسط الكامل للمعاينة النهائية
// استبدل قسم المعاينة النهائية في الملف الأصلي بهذا الكود

<div className="space-y-4">
  {/* قسم البيانات المبسط */}
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="grid gap-3 md:grid-cols-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">الاسم</p>
        <p className="mt-1 text-sm font-bold text-slate-800">{form.fullName || "لا يوجد"}</p>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">رقم الهوية</p>
        <p className="mt-1 text-sm font-bold text-slate-800">{form.idNumber || "لا يوجد"}</p>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">رقم اللوحة</p>
        <p className="mt-1 text-sm font-bold text-slate-800">{form.plateNumber || "لا يوجد"}</p>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">نوع المخالفة</p>
        <p className="mt-1 text-sm font-bold text-slate-800">{form.violationId || "لا يوجد"}</p>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">نوع الإجراء</p>
        <p className="mt-1 text-sm font-bold text-slate-800">{form.actionTaken || "لا يوجد"}</p>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">الهاتف</p>
        <p className="mt-1 text-sm font-bold text-slate-800">{form.phones.join("، ") || "لا يوجد"}</p>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">فئة اللوحة</p>
        <p className="mt-1 text-sm font-bold text-slate-800">{form.plateCategory || "لا يوجد"}</p>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">نوع المركبة</p>
        <p className="mt-1 text-sm font-bold text-slate-800">{form.vehicleType || "لا يوجد"}</p>
      </div>
    </div>
  </div>

  {/* قسم الصور الملتقطة - شريط أفقي */}
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
