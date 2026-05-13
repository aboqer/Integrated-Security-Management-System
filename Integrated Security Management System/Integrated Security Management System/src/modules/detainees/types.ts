export type UserRole = "admin" | "officer" | "viewer";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
}

export type CommitmentStatus = "active" | "completed" | "cancelled" | "overdue";
export type CommitmentType = "unauthorized_passengers" | "no_plate" | "violation" | "other";

export interface Commitment {
  id: string;
  commitmentNumber: string;
  date: string;
  personName: string;
  idNumber: string;
  phone?: string;
  vehiclePlate?: string;
  type: CommitmentType;
  status: CommitmentStatus;
  officerName: string;
  notes?: string;
  photoData?: string;
  createdAt: string;
}

export type DetaineeType = "civilian" | "military";

export type FileStatus =
  | "initial_investigation"
  | "under_procedure"
  | "transferred"
  | "joint_operation"
  | "closed_released";

export type TransferDestination =
  | "joint_ops"
  | "state_security"
  | "military_intel"
  | "military_investigations"
  | "military_security"
  | "criminal_investigation"
  | "security_management";

export interface SeizedItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
}

export interface ProcedureLog {
  id: string;
  timestamp: string;
  action: string;
  officer: string;
  details?: string;
}

export interface DetaineeCase {
  id: string;
  caseNumber: string;
  registrationDate: string;
  detaineeType: DetaineeType;
  fullName: string;
  idNumber: string;
  nationality?: string;
  phone?: string;
  address?: string;
  militaryRank?: string;
  militaryNumber?: string;
  unitName?: string;
  lastDutyDate?: string;
  accusation: string;
  seizedItems: SeizedItem[];
  photos?: {
    detaineePhoto?: string;
    idPhoto?: string;
  };
  status: FileStatus;
  transferDestination?: TransferDestination;
  loggedBy: string;
  procedureLogs: ProcedureLog[];
  createdAt: string;
}

export interface DetaineeFormState {
  detaineeType: DetaineeType;
  fullName: string;
  idNumber: string;
  nationality: string;
  phone: string;
  address: string;
  militaryRank: string;
  militaryNumber: string;
  unitName: string;
  lastDutyDate: string;
  accusation: string;
  status: FileStatus;
  transferDestination?: TransferDestination;
  seizedItems: SeizedItem[];
  photos: {
    detaineePhoto?: string;
    idPhoto?: string;
  };
}
