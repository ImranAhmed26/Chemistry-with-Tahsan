// Types matching the Chemistry with Tahsan API contract.

export type Role = "OWNER" | "ADMIN" | "TEACHER" | string;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Tenant {
  id: string;
  slug: string;
  brandName: string;
  ownerName: string;
  photoUrl?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
  tenant: Tenant;
}

export interface PublicTenant {
  brandName: string;
  ownerName: string;
  bio?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
}

export type StudentStatus = "ACTIVE" | "ARCHIVED";

export const ACADEMIC_LEVELS = [
  "Cambridge Pre-O Level",
  "CAIE 8",
  "CAIE 9",
  "EDXL 8",
  "EDXL 9",
  "CAIE 10",
  "CAIE AS",
  "CAIE A2",
] as const;

export const EXAM_BOARDS = ["CAIE", "EDEXCEL"] as const;

export interface Student {
  id: string;
  studentCode: string;
  name: string;
  photoUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  parentName?: string | null;
  parentContact?: string | null;
  academicLevel?: string | null;
  examBoard?: string | null;
  notes?: string | null;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudentEnrollmentSummary {
  id: string;
  status: EnrollmentStatus;
  courseName?: string;
  batchName?: string;
  enrolledAt: string;
  endedAt?: string | null;
}

export interface StudentNote {
  id: string;
  content: string;
  authorUserId?: string;
  createdAt: string;
}

export interface AttendanceSummary {
  presentCount: number;
  totalCount: number;
  percentage: number;
}

export interface StudentDetail extends Student {
  enrollments: StudentEnrollmentSummary[];
  attendanceSummary: AttendanceSummary;
  payments: Payment[];
  studentNotes: StudentNote[];
  paymentStatus?: PaymentStatus;
}

export type CourseStatus = "ACTIVE" | "INACTIVE";

export interface Course {
  id: string;
  name: string;
  academicLevel: string;
  examBoard: string;
  description?: string | null;
  status: CourseStatus;
}

export interface CourseDetail extends Course {
  batches?: BatchSummary[];
}

export interface BatchSummary {
  id: string;
  name: string;
  schedule?: string | null;
  status: BatchStatus;
  startDate?: string | null;
  endDate?: string | null;
  capacity?: number | null;
  enrolledCount?: number;
}

export type BatchStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "ARCHIVED";

export interface Batch {
  id: string;
  courseId: string;
  name: string;
  schedule?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  capacity?: number | null;
  status: BatchStatus;
}

export interface BatchDetail extends Batch {
  course?: Course;
  students?: Array<{
    id: string;
    name: string;
    studentCode: string;
    enrollmentId: string;
  }>;
  enrolledCount?: number;
}

export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "WITHDRAWN";

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  batchId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  endedAt?: string | null;
}

export type ClassSessionStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface ClassSession {
  id: string;
  batchId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic?: string | null;
  notes?: string | null;
  status: ClassSessionStatus;
  batchName?: string;
}

export interface ClassSessionDetail extends ClassSession {
  batch?: Batch;
  students?: Array<{
    studentId: string;
    studentName: string;
    status?: AttendanceStatus;
  }>;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status?: AttendanceStatus;
}

export type ResourceType =
  | "NOTES"
  | "PDF_BOOK"
  | "QUESTION_PAPER"
  | "REVISION_MAP"
  | "EXAM_PACK"
  | "RECORDED_LECTURE";

export type ResourceVisibility = "PUBLIC" | "ENROLLED_ONLY" | "PRIVATE";
export type ResourceStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Resource {
  id: string;
  title: string;
  description?: string | null;
  type: ResourceType;
  subject?: string | null;
  courseId?: string | null;
  chapterTopic?: string | null;
  fileUrl?: string | null;
  coverImageUrl?: string | null;
  visibility: ResourceVisibility;
  price?: number | null;
  status: ResourceStatus;
}

export type PaymentMethod = "CASH" | "BKASH" | "NAGAD" | "BANK_TRANSFER" | "OTHER";
export type PaymentStatus = "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";

export interface Payment {
  id: string;
  studentId: string;
  studentName?: string;
  enrollmentId?: string | null;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  paymentDate: string;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string | null;
}

export interface DashboardSummary {
  totalStudents: number;
  activeStudents: number;
  activeBatches: number;
  activeCourses: number;
  upcomingClasses: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    topic?: string | null;
    batchName: string;
  }>;
  recentAttendance: Array<{
    id: string;
    date: string;
    batchName: string;
    presentCount: number;
    totalCount: number;
  }>;
  pendingPayments: Array<{
    id: string;
    studentName: string;
    dueAmount: number;
    status: PaymentStatus;
  }>;
  recentStudents: Array<{
    id: string;
    name: string;
    studentCode: string;
    createdAt: string;
  }>;
}

export interface PublicCourse extends Course {
  batches: Array<{ name: string; schedule?: string | null; status: BatchStatus }>;
}

export type PublicResource = Resource;

export interface ListResponse<T> {
  data: T[];
  total: number;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}
