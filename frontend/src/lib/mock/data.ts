// In-memory demo data used when NEXT_PUBLIC_USE_MOCK_DATA=true. Mirrors
// backend/prisma/seed.ts so the demo matches what a real backend would seed.
import type {
  AttendanceStatus,
  Batch,
  BatchStatus,
  Course,
  Enrollment,
  EnrollmentStatus,
  ClassSession,
  ClassSessionStatus,
  Payment,
  PublicTenant,
  Resource,
  Student,
  StudentNote,
  Tenant,
} from "@/types";

let nextId = 1000;
export function generateId(prefix: string): string {
  nextId += 1;
  return `${prefix}-${nextId}`;
}

export const MOCK_USER_EMAIL = "tahsan@chemistrywithtahsan.com";
export const MOCK_USER_PASSWORD = "chemistry123";
export const MOCK_TOKEN = "mock-token";

export const mockTenant: Tenant = {
  id: "tenant-1",
  slug: "chemistry-with-tahsan",
  brandName: "Chemistry with Tahsan",
  ownerName: "MD. Manirul Islam Bhuyan (Tahsan)",
  photoUrl: "/images/teacher-logic.jpg",
};

export const mockPublicTenant: PublicTenant = {
  brandName: "Chemistry with Tahsan",
  ownerName: "MD. Manirul Islam Bhuyan (Tahsan)",
  bio:
    "Cambridge & Edexcel Chemistry specialist with 17+ years of teaching experience, " +
    "covering O Level, IGCSE, AS and A2 Chemistry. B.Pharm background. Based in Uttara, Dhaka.",
  photoUrl: "/images/teacher-profile.jpg",
  phone: "+8801805722207",
  whatsapp: "+8801805722207",
  email: "tahsan@chemistrywithtahsan.com",
  address: "Uttara, Dhaka, Bangladesh",
  facebookUrl: "https://facebook.com/chemistrywithtahsan",
  instagramUrl: "https://instagram.com/chemistrywithtahsan",
  youtubeUrl: "https://youtube.com/@chemistrywithtahsan",
};

export const mockUser = {
  id: "user-1",
  name: "MD. Manirul Islam Bhuyan",
  email: MOCK_USER_EMAIL,
  role: "OWNER" as const,
};

export const courses: Course[] = [
  { id: "course-1", name: "Cambridge Pre-O Level", academicLevel: "Pre-O Level", examBoard: "Cambridge (CAIE)", description: "Foundation chemistry for students preparing to enter O Level.", status: "ACTIVE" },
  { id: "course-2", name: "CAIE 8/9", academicLevel: "Grade 8/9", examBoard: "Cambridge (CAIE)", description: "Cambridge Lower Secondary Chemistry, grades 8 and 9.", status: "ACTIVE" },
  { id: "course-3", name: "EDXL 8/9", academicLevel: "Grade 8/9", examBoard: "Edexcel", description: "Edexcel Lower Secondary Chemistry, grades 8 and 9.", status: "ACTIVE" },
  { id: "course-4", name: "CAIE 10", academicLevel: "O Level / IGCSE", examBoard: "Cambridge (CAIE)", description: "Cambridge O Level (5070) and IGCSE (0620) Chemistry, full syllabus.", status: "ACTIVE" },
  { id: "course-5", name: "CAIE AS", academicLevel: "AS Level", examBoard: "Cambridge (CAIE)", description: "Cambridge International AS Level Chemistry (9701).", status: "ACTIVE" },
  { id: "course-6", name: "CAIE A2", academicLevel: "A2 Level", examBoard: "Cambridge (CAIE)", description: "Cambridge International A2 Level Chemistry (9701).", status: "ACTIVE" },
];

export const batches: Batch[] = [
  { id: "batch-1", courseId: "course-4", name: "CAIE 10 — Friday Batch", schedule: "Every Friday, 4:00 PM - 6:00 PM", startDate: "2026-08-01", endDate: null, capacity: 20, status: "ONGOING" as BatchStatus },
  { id: "batch-2", courseId: "course-5", name: "CAIE AS — Saturday Batch", schedule: "Every Saturday, 5:00 PM - 7:00 PM", startDate: "2026-08-01", endDate: null, capacity: 15, status: "ONGOING" as BatchStatus },
  { id: "batch-3", courseId: "course-3", name: "EDXL 8/9 — Evening Batch", schedule: "Sunday & Tuesday, 6:00 PM - 7:30 PM", startDate: "2026-08-01", endDate: null, capacity: 18, status: "UPCOMING" as BatchStatus },
];

export const students: Student[] = [
  { id: "student-1", studentCode: "STU-0001", name: "Arafat Hossain", photoUrl: null, phone: "+8801711000001", whatsapp: "+8801711000001", email: null, parentName: "Mr. Hossain", parentContact: "+8801711000011", academicLevel: "O Level / IGCSE", examBoard: "Cambridge (CAIE)", notes: null, status: "ACTIVE", createdAt: "2026-08-01T09:00:00.000Z", updatedAt: "2026-08-01T09:00:00.000Z" },
  { id: "student-2", studentCode: "STU-0002", name: "Farhana Akter", photoUrl: null, phone: "+8801711000002", whatsapp: "+8801711000002", email: null, parentName: "Mrs. Akter", parentContact: "+8801711000012", academicLevel: "O Level / IGCSE", examBoard: "Cambridge (CAIE)", notes: null, status: "ACTIVE", createdAt: "2026-08-01T09:05:00.000Z", updatedAt: "2026-08-01T09:05:00.000Z" },
  { id: "student-3", studentCode: "STU-0003", name: "Nabil Rahman", photoUrl: null, phone: "+8801711000003", whatsapp: "+8801711000003", email: null, parentName: "Mr. Rahman", parentContact: "+8801711000013", academicLevel: "AS Level", examBoard: "Cambridge (CAIE)", notes: null, status: "ACTIVE", createdAt: "2026-08-01T09:10:00.000Z", updatedAt: "2026-08-01T09:10:00.000Z" },
  { id: "student-4", studentCode: "STU-0004", name: "Sadia Islam", photoUrl: null, phone: "+8801711000004", whatsapp: "+8801711000004", email: null, parentName: "Mr. Islam", parentContact: "+8801711000014", academicLevel: "AS Level", examBoard: "Cambridge (CAIE)", notes: null, status: "ACTIVE", createdAt: "2026-08-01T09:15:00.000Z", updatedAt: "2026-08-01T09:15:00.000Z" },
  { id: "student-5", studentCode: "STU-0005", name: "Tanvir Ahmed", photoUrl: null, phone: "+8801711000005", whatsapp: "+8801711000005", email: null, parentName: "Mrs. Ahmed", parentContact: "+8801711000015", academicLevel: "Grade 8/9", examBoard: "Edexcel", notes: null, status: "ACTIVE", createdAt: "2026-08-01T09:20:00.000Z", updatedAt: "2026-08-01T09:20:00.000Z" },
];

export const enrollments: Enrollment[] = [
  { id: "enrollment-1", studentId: "student-1", courseId: "course-4", batchId: "batch-1", status: "ACTIVE" as EnrollmentStatus, enrolledAt: "2026-08-01T09:00:00.000Z", endedAt: null },
  { id: "enrollment-2", studentId: "student-2", courseId: "course-4", batchId: "batch-1", status: "ACTIVE" as EnrollmentStatus, enrolledAt: "2026-08-01T09:05:00.000Z", endedAt: null },
  { id: "enrollment-3", studentId: "student-3", courseId: "course-5", batchId: "batch-2", status: "ACTIVE" as EnrollmentStatus, enrolledAt: "2026-08-01T09:10:00.000Z", endedAt: null },
  { id: "enrollment-4", studentId: "student-4", courseId: "course-5", batchId: "batch-2", status: "ACTIVE" as EnrollmentStatus, enrolledAt: "2026-08-01T09:15:00.000Z", endedAt: null },
  { id: "enrollment-5", studentId: "student-5", courseId: "course-3", batchId: "batch-3", status: "ACTIVE" as EnrollmentStatus, enrolledAt: "2026-08-01T09:20:00.000Z", endedAt: null },
];

export const classSessions: ClassSession[] = [
  { id: "session-1", batchId: "batch-1", date: "2026-08-15", startTime: "16:00", endTime: "18:00", topic: "Atomic structure", notes: null, status: "COMPLETED" as ClassSessionStatus, batchName: "CAIE 10 — Friday Batch" },
  { id: "session-2", batchId: "batch-1", date: "2026-08-22", startTime: "16:00", endTime: "18:00", topic: "Periodic table trends", notes: null, status: "SCHEDULED" as ClassSessionStatus, batchName: "CAIE 10 — Friday Batch" },
  { id: "session-3", batchId: "batch-2", date: "2026-08-16", startTime: "17:00", endTime: "19:00", topic: "Moles & stoichiometry", notes: null, status: "COMPLETED" as ClassSessionStatus, batchName: "CAIE AS — Saturday Batch" },
];

export const attendance: Record<string, Record<string, AttendanceStatus>> = {
  "session-1": { "student-1": "PRESENT", "student-2": "ABSENT" },
  "session-3": { "student-3": "PRESENT", "student-4": "LATE" },
};

export const resources: Resource[] = [
  {
    id: "resource-1",
    title: "Cambridge O Level / IGCSE Chemistry Handbook",
    description: "Full syllabus-focused handbook covering Cambridge 5070 and 0620 Chemistry.",
    type: "PDF_BOOK",
    subject: "Chemistry",
    courseId: "course-4",
    chapterTopic: null,
    fileUrl: null,
    coverImageUrl: "/images/handbook-cover-dark.jpg",
    visibility: "PUBLIC",
    price: 450,
    status: "PUBLISHED",
  },
  {
    id: "resource-2",
    title: "Organic Chemistry Reaction Map (Free Sample)",
    description: "A free revision sheet mapping key organic chemistry reactions.",
    type: "REVISION_MAP",
    subject: "Organic Chemistry",
    courseId: "course-4",
    chapterTopic: null,
    fileUrl: null,
    coverImageUrl: null,
    visibility: "PUBLIC",
    price: 0,
    status: "PUBLISHED",
  },
];

export const payments: Payment[] = students.map((s, i) => ({
  id: `payment-${i + 1}`,
  studentId: s.id,
  studentName: s.name,
  enrollmentId: enrollments[i]?.id ?? null,
  amount: 3000,
  paidAmount: 1500,
  dueAmount: 1500,
  paymentDate: "2026-08-10T00:00:00.000Z",
  method: "BKASH",
  status: "PARTIALLY_PAID",
  notes: null,
}));

export const studentNotes: Record<string, StudentNote[]> = {};
