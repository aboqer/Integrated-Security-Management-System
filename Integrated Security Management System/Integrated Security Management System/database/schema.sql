-- PostgreSQL schema for the integrated land-port security management system.
-- This schema is intentionally backend-agnostic so it can be used later with
-- Express, NestJS, Prisma, Drizzle, or direct SQL migrations.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE record_status AS ENUM (
  'draft',
  'open',
  'in_review',
  'approved',
  'closed',
  'cancelled',
  'transferred'
);

CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE person_gender AS ENUM ('male', 'female', 'unknown');
CREATE TYPE attachment_owner_type AS ENUM (
  'person',
  'violation',
  'custody',
  'report',
  'detainee',
  'commitment',
  'audit_log'
);

CREATE TYPE audit_action AS ENUM (
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'approve',
  'close',
  'transfer',
  'deliver',
  'export'
);

-- Organizational structure and access control.

CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  module text NOT NULL,
  description text
);

CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  username citext NOT NULL UNIQUE,
  full_name_ar text NOT NULL,
  employee_number text UNIQUE,
  email citext UNIQUE,
  phone text,
  password_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Shared people, identity, vehicle, and location data.

CREATE TABLE people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name_ar text NOT NULL,
  full_name_en text,
  nationality text,
  gender person_gender NOT NULL DEFAULT 'unknown',
  birth_date date,
  notes text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE person_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  id_type text NOT NULL,
  id_number text NOT NULL,
  issuing_country text,
  issued_at date,
  expires_at date,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_type, id_number)
);

CREATE TABLE person_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  phone text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (person_id, phone)
);

CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_person_id uuid REFERENCES people(id) ON DELETE SET NULL,
  plate_number text NOT NULL,
  plate_country text,
  plate_province text,
  plate_category text,
  vehicle_type text,
  color text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plate_number, plate_country, plate_province)
);

CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  code text UNIQUE,
  description text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Violations module. Interfaces are mostly ready; this table maps the current
-- form fields and leaves room for approval, reporting, and follow-up.

CREATE TABLE violation_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title_ar text NOT NULL,
  description text,
  default_priority priority_level NOT NULL DEFAULT 'normal',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category, title_ar)
);

CREATE TABLE violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number text NOT NULL UNIQUE,
  violation_type_id uuid REFERENCES violation_types(id) ON DELETE SET NULL,
  person_id uuid REFERENCES people(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  status record_status NOT NULL DEFAULT 'open',
  priority priority_level NOT NULL DEFAULT 'normal',
  title text NOT NULL,
  description text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Custody / property module.

CREATE TABLE custody_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL UNIQUE,
  person_id uuid REFERENCES people(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  status record_status NOT NULL DEFAULT 'open',
  received_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  notes text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE custody_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custody_record_id uuid NOT NULL REFERENCES custody_records(id) ON DELETE CASCADE,
  item_category text NOT NULL,
  item_name text NOT NULL,
  quantity numeric(12, 2) NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'piece',
  estimated_value numeric(14, 2),
  currency char(3) DEFAULT 'SAR',
  description text,
  storage_location text,
  status record_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE custody_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custody_record_id uuid NOT NULL REFERENCES custody_records(id) ON DELETE CASCADE,
  receiver_name text NOT NULL,
  receiver_id_type text,
  receiver_id_number text,
  authorized_by text NOT NULL,
  delivery_status text NOT NULL,
  delivered_by uuid REFERENCES users(id) ON DELETE SET NULL,
  delivered_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Reports and complaints module.

CREATE TABLE report_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL UNIQUE,
  description text,
  default_priority priority_level NOT NULL DEFAULT 'normal',
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE reports_complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL UNIQUE,
  category_id uuid REFERENCES report_categories(id) ON DELETE SET NULL,
  reporter_person_id uuid REFERENCES people(id) ON DELETE SET NULL,
  related_person_id uuid REFERENCES people(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  status record_status NOT NULL DEFAULT 'open',
  priority priority_level NOT NULL DEFAULT 'normal',
  source text,
  title text NOT NULL,
  description text NOT NULL,
  resolution_summary text,
  reported_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Detainees module. This is designed as a complete lifecycle, not just a form.

CREATE TABLE detainee_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text NOT NULL UNIQUE,
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  primary_violation_id uuid REFERENCES violations(id) ON DELETE SET NULL,
  primary_report_id uuid REFERENCES reports_complaints(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  status record_status NOT NULL DEFAULT 'open',
  detention_reason text NOT NULL,
  legal_basis text,
  requested_by text,
  detained_at timestamptz NOT NULL DEFAULT now(),
  expected_release_at timestamptz,
  released_at timestamptz,
  release_reason text,
  notes text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (released_at IS NULL OR released_at >= detained_at)
);

CREATE TABLE detainee_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detainee_case_id uuid NOT NULL REFERENCES detainee_cases(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_title text NOT NULL,
  description text,
  from_department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  to_department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  performed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Commitments module. This is the reference log for obligations made by people.

CREATE TABLE commitment_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL UNIQUE,
  description text,
  default_due_days integer,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_number text NOT NULL UNIQUE,
  person_id uuid NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  commitment_type_id uuid REFERENCES commitment_types(id) ON DELETE SET NULL,
  related_violation_id uuid REFERENCES violations(id) ON DELETE SET NULL,
  related_report_id uuid REFERENCES reports_complaints(id) ON DELETE SET NULL,
  related_detainee_case_id uuid REFERENCES detainee_cases(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  status record_status NOT NULL DEFAULT 'open',
  title text NOT NULL,
  description text NOT NULL,
  committed_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (completed_at IS NULL OR completed_at >= committed_at)
);

-- Cross-cutting attachments, status history, and audit trail.

CREATE TABLE attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type attachment_owner_type NOT NULL,
  owner_id uuid NOT NULL,
  file_name text NOT NULL,
  file_ext text,
  mime_type text,
  file_size_bytes bigint,
  storage_key text NOT NULL,
  checksum_sha256 text,
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

CREATE TABLE status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  old_status record_status,
  new_status record_status NOT NULL,
  reason text,
  changed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  before_data jsonb,
  after_data jsonb,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Updated-at triggers.

CREATE TRIGGER trg_departments_updated_at BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_people_updated_at BEFORE UPDATE ON people
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vehicles_updated_at BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_locations_updated_at BEFORE UPDATE ON locations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_violations_updated_at BEFORE UPDATE ON violations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_custody_records_updated_at BEFORE UPDATE ON custody_records
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_custody_items_updated_at BEFORE UPDATE ON custody_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reports_complaints_updated_at BEFORE UPDATE ON reports_complaints
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_detainee_cases_updated_at BEFORE UPDATE ON detainee_cases
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_commitments_updated_at BEFORE UPDATE ON commitments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes for search, dashboards, and reports.

CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_people_full_name_ar ON people USING gin (to_tsvector('simple', full_name_ar));
CREATE INDEX idx_person_identities_number ON person_identities(id_number);
CREATE INDEX idx_person_phones_phone ON person_phones(phone);
CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);

CREATE INDEX idx_violations_status ON violations(status);
CREATE INDEX idx_violations_person ON violations(person_id);
CREATE INDEX idx_violations_vehicle ON violations(vehicle_id);
CREATE INDEX idx_violations_occurred_at ON violations(occurred_at DESC);

CREATE INDEX idx_custody_records_status ON custody_records(status);
CREATE INDEX idx_custody_records_person ON custody_records(person_id);
CREATE INDEX idx_custody_items_record ON custody_items(custody_record_id);

CREATE INDEX idx_reports_status ON reports_complaints(status);
CREATE INDEX idx_reports_priority ON reports_complaints(priority);
CREATE INDEX idx_reports_reported_at ON reports_complaints(reported_at DESC);

CREATE INDEX idx_detainee_cases_status ON detainee_cases(status);
CREATE INDEX idx_detainee_cases_person ON detainee_cases(person_id);
CREATE INDEX idx_detainee_events_case ON detainee_events(detainee_case_id, occurred_at DESC);

CREATE INDEX idx_commitments_status ON commitments(status);
CREATE INDEX idx_commitments_person ON commitments(person_id);
CREATE INDEX idx_commitments_due_at ON commitments(due_at);

CREATE INDEX idx_attachments_owner ON attachments(owner_type, owner_id);
CREATE INDEX idx_status_history_entity ON status_history(entity_type, entity_id, changed_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id, created_at DESC);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

COMMIT;
