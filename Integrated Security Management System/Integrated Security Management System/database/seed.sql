-- Initial reference data. Run after schema.sql.

BEGIN;

INSERT INTO departments (code, name_ar, name_en, description) VALUES
  ('violations', 'إدارة المخالفات', 'Violations Department', 'رصد وتوثيق المخالفات والجزاءات'),
  ('custody', 'إدارة الأمانات', 'Custody Department', 'استلام وحفظ وتسليم الأمانات'),
  ('reports', 'إدارة البلاغات والشكاوي', 'Reports and Complaints Department', 'استقبال البلاغات والشكاوي ومتابعتها'),
  ('detainees', 'إدارة الموقوفين', 'Detainees Department', 'إدارة ملفات الموقوفين وإجراءاتهم'),
  ('commitments', 'إدارة الالتزامات', 'Commitments Department', 'تدوين الالتزامات والتعهدات والرجوع إليها'),
  ('admin', 'إدارة النظام', 'System Administration', 'إدارة المستخدمين والصلاحيات والإعدادات')
ON CONFLICT (code) DO NOTHING;

INSERT INTO roles (code, name_ar, description, is_system) VALUES
  ('super_admin', 'مدير النظام', 'صلاحيات كاملة على جميع الأنظمة', true),
  ('department_manager', 'مدير إدارة', 'إدارة ومراجعة سجلات الإدارة التابعة له', true),
  ('operator', 'مشغل', 'إدخال ومتابعة السجلات اليومية', true),
  ('viewer', 'مستعرض', 'عرض السجلات والتقارير دون تعديل', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO permissions (code, name_ar, module, description) VALUES
  ('violations.read', 'عرض المخالفات', 'violations', 'عرض سجلات المخالفات'),
  ('violations.write', 'إدارة المخالفات', 'violations', 'إنشاء وتعديل المخالفات'),
  ('custody.read', 'عرض الأمانات', 'custody', 'عرض سجلات الأمانات'),
  ('custody.write', 'إدارة الأمانات', 'custody', 'إنشاء وتعديل وتسليم الأمانات'),
  ('reports.read', 'عرض البلاغات والشكاوي', 'reports', 'عرض البلاغات والشكاوي'),
  ('reports.write', 'إدارة البلاغات والشكاوي', 'reports', 'إنشاء ومتابعة وإغلاق البلاغات والشكاوي'),
  ('detainees.read', 'عرض الموقوفين', 'detainees', 'عرض ملفات الموقوفين'),
  ('detainees.write', 'إدارة الموقوفين', 'detainees', 'إنشاء وتحديث إجراءات الموقوفين'),
  ('commitments.read', 'عرض الالتزامات', 'commitments', 'عرض سجل الالتزامات'),
  ('commitments.write', 'إدارة الالتزامات', 'commitments', 'إنشاء وتحديث الالتزامات'),
  ('users.manage', 'إدارة المستخدمين', 'admin', 'إدارة المستخدمين والأدوار'),
  ('reports.export', 'تصدير التقارير', 'admin', 'تصدير بيانات وتقارير الأنظمة')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'super_admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'violations.read', 'violations.write',
  'custody.read', 'custody.write',
  'reports.read', 'reports.write',
  'detainees.read', 'detainees.write',
  'commitments.read', 'commitments.write',
  'reports.export'
)
WHERE r.code = 'department_manager'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'violations.read', 'violations.write',
  'custody.read', 'custody.write',
  'reports.read', 'reports.write',
  'detainees.read', 'detainees.write',
  'commitments.read', 'commitments.write'
)
WHERE r.code = 'operator'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'violations.read',
  'custody.read',
  'reports.read',
  'detainees.read',
  'commitments.read'
)
WHERE r.code = 'viewer'
ON CONFLICT DO NOTHING;

INSERT INTO locations (code, name_ar, description) VALUES
  ('main_square', 'المربع الأمني', 'نقطة الضبط والمتابعة الرئيسية'),
  ('central_safe', 'الخزنة المركزية', 'موقع حفظ الأمانات عالية الحساسية'),
  ('custody_store', 'مستودع الأمانات', 'مستودع الأمانات العام'),
  ('detainee_office', 'مكتب الموقوفين', 'موقع إجراءات الموقوفين')
ON CONFLICT (code) DO NOTHING;

INSERT INTO violation_types (category, title_ar, description, default_priority) VALUES
  ('أمنية', 'مخالفة أمنية', 'مخالفة متعلقة بإجراءات الأمن داخل المنفذ', 'high'),
  ('مالية', 'مخالفة مالية', 'مخالفة متعلقة برسوم أو مبالغ أو تحصيل', 'normal'),
  ('مرورية', 'مخالفة مرورية', 'مخالفة متعلقة بالمركبات أو الحركة داخل المنفذ', 'normal'),
  ('إدارية', 'مخالفة إدارية', 'مخالفة متعلقة بالإجراءات والتعليمات', 'normal')
ON CONFLICT (category, title_ar) DO NOTHING;

INSERT INTO report_categories (name_ar, description, default_priority) VALUES
  ('بلاغ أمني', 'بلاغ يحتاج متابعة أمنية مباشرة', 'high'),
  ('شكوى مسافر', 'شكوى مقدمة من مسافر أو مستفيد', 'normal'),
  ('بلاغ ميداني', 'بلاغ من نقطة ميدانية داخل المنفذ', 'normal'),
  ('طارئ', 'بلاغ عاجل يتطلب استجابة فورية', 'urgent')
ON CONFLICT (name_ar) DO NOTHING;

INSERT INTO commitment_types (name_ar, description, default_due_days) VALUES
  ('تعهد مراجعة', 'التزام الشخص بالمراجعة في وقت محدد', 7),
  ('تعهد إحضار مستندات', 'التزام بإحضار وثائق أو مستندات ناقصة', 3),
  ('تعهد نظامي', 'تعهد عام بالالتزام بتعليمات المنفذ', NULL),
  ('تعهد مالي', 'التزام بسداد أو تسوية مبلغ', 14)
ON CONFLICT (name_ar) DO NOTHING;

INSERT INTO users (
  department_id,
  role_id,
  username,
  full_name_ar,
  employee_number,
  email,
  phone,
  password_hash
)
SELECT
  d.id,
  r.id,
  'admin',
  'مدير النظام',
  'ADMIN-001',
  'admin@example.local',
  NULL,
  crypt('admin123', gen_salt('bf'))
FROM departments d
CROSS JOIN roles r
WHERE d.code = 'admin' AND r.code = 'super_admin'
ON CONFLICT (username) DO NOTHING;

COMMIT;
