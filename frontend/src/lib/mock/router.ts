// Handles every request api.ts would otherwise send to the real backend,
// against the in-memory data in ./data. Lets the whole app (public site +
// dashboard) run and be demoed with no backend or database running.
import type {
  AttendanceStatus,
  Batch,
  BatchDetail,
  ClassSessionDetail,
  CourseDetail,
  ListResponse,
  LoginResponse,
  Payment,
  PublicCourse,
  PublicResource,
  Resource,
  StudentDetail,
} from "@/types";
import {
  MOCK_TOKEN,
  MOCK_USER_EMAIL,
  MOCK_USER_PASSWORD,
  attendance,
  batches,
  classSessions,
  courses,
  enrollments,
  generateId,
  mockPublicTenant,
  mockTenant,
  mockUser,
  payments,
  resources,
  studentNotes,
  students,
} from "./data";

interface MockErrorBody {
  statusCode: number;
  message: string;
}

function fail(statusCode: number, message: string): never {
  throw { statusCode, message } as MockErrorBody;
}

interface MockRequestParams {
  method: string;
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  auth: boolean;
  token: string | null;
}

function requireAuth(params: MockRequestParams) {
  if (params.auth && params.token !== MOCK_TOKEN) {
    fail(401, "Unauthorized");
  }
}

function match(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    if (p.startsWith(":")) {
      params[p.slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (p !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

function paginated<T>(rows: T[]): ListResponse<T> {
  return { data: rows, total: rows.length };
}

function buildStudentDetail(id: string): StudentDetail {
  const student = students.find((s) => s.id === id);
  if (!student) fail(404, "Student not found");

  const studentEnrollments = enrollments
    .filter((e) => e.studentId === id)
    .map((e) => ({
      id: e.id,
      status: e.status,
      courseName: courses.find((c) => c.id === e.courseId)?.name,
      batchName: batches.find((b) => b.id === e.batchId)?.name,
      enrolledAt: e.enrolledAt,
      endedAt: e.endedAt,
    }));

  const enrolledBatchIds = new Set(enrollments.filter((e) => e.studentId === id).map((e) => e.batchId));
  const relevantSessions = classSessions.filter((cs) => enrolledBatchIds.has(cs.batchId));
  let presentCount = 0;
  let totalCount = 0;
  for (const session of relevantSessions) {
    const status = attendance[session.id]?.[id];
    if (status) {
      totalCount += 1;
      if (status === "PRESENT" || status === "LATE") presentCount += 1;
    }
  }

  return {
    ...student,
    enrollments: studentEnrollments,
    attendanceSummary: {
      presentCount,
      totalCount,
      percentage: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
    },
    payments: payments.filter((p) => p.studentId === id),
    studentNotes: studentNotes[id] ?? [],
  };
}

function buildBatchDetail(id: string): BatchDetail {
  const batch = batches.find((b) => b.id === id);
  if (!batch) fail(404, "Batch not found");

  const batchEnrollments = enrollments.filter((e) => e.batchId === id && e.status === "ACTIVE");
  const enrolledStudents = batchEnrollments.map((e) => {
    const student = students.find((s) => s.id === e.studentId)!;
    return { id: student.id, name: student.name, studentCode: student.studentCode, enrollmentId: e.id };
  });

  return {
    ...batch,
    course: courses.find((c) => c.id === batch.courseId),
    students: enrolledStudents,
    enrolledCount: enrolledStudents.length,
  };
}

function buildClassSessionDetail(id: string): ClassSessionDetail {
  const session = classSessions.find((s) => s.id === id);
  if (!session) fail(404, "Class session not found");

  const batch = batches.find((b) => b.id === session.batchId);
  const enrolledStudentIds = enrollments
    .filter((e) => e.batchId === session.batchId && e.status === "ACTIVE")
    .map((e) => e.studentId);

  return {
    ...session,
    batch,
    students: enrolledStudentIds.map((studentId) => {
      const student = students.find((s) => s.id === studentId)!;
      return {
        studentId,
        studentName: student.name,
        status: attendance[session.id]?.[studentId],
      };
    }),
  };
}

function buildCourseDetail(id: string): CourseDetail {
  const course = courses.find((c) => c.id === id);
  if (!course) fail(404, "Course not found");
  return {
    ...course,
    batches: batches
      .filter((b) => b.courseId === id)
      .map((b) => ({ id: b.id, name: b.name, schedule: b.schedule, status: b.status })),
  };
}

function toPublicCourse(course: (typeof courses)[number]): PublicCourse {
  return {
    ...course,
    batches: batches
      .filter((b) => b.courseId === course.id)
      .map((b) => ({ name: b.name, schedule: b.schedule, status: b.status })),
  };
}

function toPublicResource(resource: (typeof resources)[number]): PublicResource {
  return resource;
}

export async function mockRequest<T>(params: MockRequestParams): Promise<T> {
  const { method, path, query = {}, body } = params;
  let p: Record<string, string> | null;

  // --- Auth ---
  if (method === "POST" && path === "/auth/login") {
    const { email, password } = (body ?? {}) as { email?: string; password?: string };
    if (email !== MOCK_USER_EMAIL || password !== MOCK_USER_PASSWORD) {
      fail(401, "Invalid email or password");
    }
    return { accessToken: MOCK_TOKEN, user: mockUser, tenant: mockTenant } as LoginResponse as T;
  }

  // --- Public site (no auth) ---
  if (method === "GET" && (p = match("/public/tenant/:slug", path))) {
    if (p.slug !== mockTenant.slug) fail(404, "Tenant not found");
    return mockPublicTenant as T;
  }
  if (method === "GET" && match("/public/tenant/:slug/courses", path)) {
    return courses.filter((c) => c.status === "ACTIVE").map(toPublicCourse) as T;
  }
  if (method === "GET" && match("/public/tenant/:slug/resources", path)) {
    return resources.filter((r) => r.status === "PUBLISHED" && r.visibility === "PUBLIC").map(toPublicResource) as T;
  }

  // Everything below requires a logged-in session, matching the real API.
  requireAuth(params);

  // --- Dashboard ---
  if (method === "GET" && path === "/dashboard/summary") {
    const activeStudents = students.filter((s) => s.status === "ACTIVE");
    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      activeBatches: batches.filter((b) => b.status === "ONGOING" || b.status === "UPCOMING").length,
      activeCourses: courses.filter((c) => c.status === "ACTIVE").length,
      upcomingClasses: classSessions
        .filter((cs) => cs.status === "SCHEDULED")
        .map((cs) => ({
          id: cs.id,
          date: cs.date,
          startTime: cs.startTime,
          endTime: cs.endTime,
          topic: cs.topic,
          batchName: cs.batchName || batches.find((b) => b.id === cs.batchId)?.name || "",
        })),
      recentAttendance: classSessions
        .filter((cs) => attendance[cs.id])
        .map((cs) => {
          const records = Object.values(attendance[cs.id] ?? {});
          return {
            id: cs.id,
            date: cs.date,
            batchName: cs.batchName || batches.find((b) => b.id === cs.batchId)?.name || "",
            presentCount: records.filter((s) => s === "PRESENT" || s === "LATE").length,
            totalCount: records.length,
          };
        }),
      pendingPayments: payments
        .filter((p) => p.status !== "PAID")
        .map((p) => ({ id: p.id, studentName: p.studentName || "", dueAmount: p.dueAmount, status: p.status })),
      recentStudents: [...students]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5)
        .map((s) => ({ id: s.id, name: s.name, studentCode: s.studentCode, createdAt: s.createdAt })),
    } as T;
  }

  // --- Students ---
  if (method === "GET" && path === "/students") {
    let rows = students;
    if (query.status) rows = rows.filter((s) => s.status === query.status);
    if (query.academicLevel) rows = rows.filter((s) => s.academicLevel === query.academicLevel);
    if (query.search) {
      const term = String(query.search).toLowerCase();
      rows = rows.filter(
        (s) => s.name.toLowerCase().includes(term) || s.studentCode.toLowerCase().includes(term)
      );
    }
    return paginated(rows) as T;
  }
  if (method === "POST" && path === "/students") {
    const values = (body ?? {}) as Record<string, unknown>;
    const now = new Date().toISOString();
    const student = {
      id: generateId("student"),
      studentCode: `STU-${String(students.length + 1).padStart(4, "0")}`,
      name: String(values.name ?? ""),
      photoUrl: null,
      phone: (values.phone as string) || null,
      whatsapp: (values.whatsapp as string) || null,
      email: (values.email as string) || null,
      parentName: (values.parentName as string) || null,
      parentContact: (values.parentContact as string) || null,
      academicLevel: (values.academicLevel as string) || null,
      examBoard: (values.examBoard as string) || null,
      notes: (values.notes as string) || null,
      status: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
    };
    students.push(student);
    return student as T;
  }
  if (method === "GET" && (p = match("/students/:id", path))) {
    return buildStudentDetail(p.id) as T;
  }
  if (method === "PATCH" && (p = match("/students/:id", path))) {
    const student = students.find((s) => s.id === p!.id);
    if (!student) fail(404, "Student not found");
    Object.assign(student, body, { updatedAt: new Date().toISOString() });
    return student as T;
  }
  if (method === "PATCH" && (p = match("/students/:id/archive", path))) {
    const student = students.find((s) => s.id === p!.id);
    if (!student) fail(404, "Student not found");
    student.status = "ARCHIVED";
    return student as T;
  }
  if (method === "PATCH" && (p = match("/students/:id/reactivate", path))) {
    const student = students.find((s) => s.id === p!.id);
    if (!student) fail(404, "Student not found");
    student.status = "ACTIVE";
    return student as T;
  }
  if (method === "POST" && (p = match("/students/:id/notes", path))) {
    const { content } = (body ?? {}) as { content?: string };
    const note = { id: generateId("note"), content: content ?? "", authorUserId: mockUser.id, createdAt: new Date().toISOString() };
    studentNotes[p.id] = [note, ...(studentNotes[p.id] ?? [])];
    return note as T;
  }

  // --- Courses ---
  if (method === "GET" && path === "/courses") {
    return paginated(courses) as T;
  }
  if (method === "POST" && path === "/courses") {
    const values = (body ?? {}) as Record<string, unknown>;
    const course = {
      id: generateId("course"),
      name: String(values.name ?? ""),
      academicLevel: String(values.academicLevel ?? ""),
      examBoard: String(values.examBoard ?? ""),
      description: (values.description as string) || null,
      status: (values.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
    };
    courses.push(course);
    return course as T;
  }
  if (method === "GET" && (p = match("/courses/:id", path))) {
    return buildCourseDetail(p.id) as T;
  }
  if (method === "PATCH" && (p = match("/courses/:id", path))) {
    const course = courses.find((c) => c.id === p!.id);
    if (!course) fail(404, "Course not found");
    Object.assign(course, body);
    return course as T;
  }

  // --- Batches ---
  if (method === "GET" && path === "/batches") {
    let rows = batches;
    if (query.courseId) rows = rows.filter((b) => b.courseId === query.courseId);
    if (query.status) rows = rows.filter((b) => b.status === query.status);
    return paginated(rows) as T;
  }
  if (method === "POST" && path === "/batches") {
    const values = (body ?? {}) as Record<string, unknown>;
    const batch = {
      id: generateId("batch"),
      courseId: String(values.courseId ?? ""),
      name: String(values.name ?? ""),
      schedule: (values.schedule as string) || null,
      startDate: (values.startDate as string) || null,
      endDate: (values.endDate as string) || null,
      capacity: (values.capacity as number) ?? null,
      status: (values.status as Batch["status"]) || "UPCOMING",
    };
    batches.push(batch);
    return batch as T;
  }
  if (method === "GET" && (p = match("/batches/:id", path))) {
    return buildBatchDetail(p.id) as T;
  }
  if (method === "PATCH" && (p = match("/batches/:id", path))) {
    const batch = batches.find((b) => b.id === p!.id);
    if (!batch) fail(404, "Batch not found");
    Object.assign(batch, body);
    return batch as T;
  }

  // --- Enrollments ---
  if (method === "POST" && path === "/enrollments") {
    const { studentId, courseId, batchId } = (body ?? {}) as {
      studentId: string;
      courseId: string;
      batchId: string;
    };
    const enrollment = {
      id: generateId("enrollment"),
      studentId,
      courseId,
      batchId,
      status: "ACTIVE" as const,
      enrolledAt: new Date().toISOString(),
      endedAt: null,
    };
    enrollments.push(enrollment);
    return enrollment as T;
  }

  // --- Class sessions ---
  if (method === "GET" && path === "/class-sessions") {
    let rows = classSessions;
    if (query.batchId) rows = rows.filter((cs) => cs.batchId === query.batchId);
    if (query.status) rows = rows.filter((cs) => cs.status === query.status);
    return paginated(rows) as T;
  }
  if (method === "POST" && path === "/class-sessions") {
    const values = (body ?? {}) as Record<string, unknown>;
    const session = {
      id: generateId("session"),
      batchId: String(values.batchId ?? ""),
      date: String(values.date ?? ""),
      startTime: String(values.startTime ?? ""),
      endTime: String(values.endTime ?? ""),
      topic: (values.topic as string) || null,
      notes: (values.notes as string) || null,
      status: "SCHEDULED" as const,
      batchName: batches.find((b) => b.id === values.batchId)?.name,
    };
    classSessions.push(session);
    return session as T;
  }
  if (method === "GET" && (p = match("/class-sessions/:id", path))) {
    return buildClassSessionDetail(p.id) as T;
  }
  if (method === "PUT" && (p = match("/class-sessions/:id/attendance", path))) {
    const session = classSessions.find((s) => s.id === p!.id);
    if (!session) fail(404, "Class session not found");
    const { records } = (body ?? {}) as { records: Array<{ studentId: string; status: AttendanceStatus }> };
    attendance[session.id] = attendance[session.id] ?? {};
    for (const r of records) {
      attendance[session.id][r.studentId] = r.status;
    }
    session.status = "COMPLETED";
    return undefined as T;
  }

  // --- Resources ---
  if (method === "GET" && path === "/resources") {
    let rows = resources;
    if (query.type) rows = rows.filter((r) => r.type === query.type);
    return paginated(rows) as T;
  }
  if (method === "POST" && path === "/resources") {
    const values = (body ?? {}) as Record<string, unknown>;
    const resource = {
      id: generateId("resource"),
      title: String(values.title ?? ""),
      description: (values.description as string) || null,
      type: values.type as Resource["type"],
      subject: (values.subject as string) || null,
      courseId: (values.courseId as string) || null,
      chapterTopic: (values.chapterTopic as string) || null,
      fileUrl: (values.fileUrl as string) || null,
      coverImageUrl: (values.coverImageUrl as string) || null,
      visibility: values.visibility as Resource["visibility"],
      price: (values.price as number) ?? 0,
      status: values.status as Resource["status"],
    };
    resources.push(resource);
    return resource as T;
  }
  if (method === "PATCH" && (p = match("/resources/:id", path))) {
    const resource = resources.find((r) => r.id === p!.id);
    if (!resource) fail(404, "Resource not found");
    Object.assign(resource, body);
    return resource as T;
  }

  // --- Payments ---
  if (method === "GET" && path === "/payments") {
    let rows = payments;
    if (query.status) rows = rows.filter((pay) => pay.status === query.status);
    return paginated(rows) as T;
  }
  if (method === "POST" && path === "/payments") {
    const values = (body ?? {}) as Record<string, unknown>;
    const amount = Number(values.amount ?? 0);
    const paidAmount = Number(values.paidAmount ?? 0);
    const dueAmount = Math.max(amount - paidAmount, 0);
    const student = students.find((s) => s.id === values.studentId);
    const payment = {
      id: generateId("payment"),
      studentId: String(values.studentId ?? ""),
      studentName: student?.name,
      enrollmentId: enrollments.find((e) => e.studentId === values.studentId)?.id ?? null,
      amount,
      paidAmount,
      dueAmount,
      paymentDate: String(values.paymentDate ?? new Date().toISOString()),
      method: values.method as Payment["method"],
      status: (dueAmount <= 0 ? "PAID" : paidAmount > 0 ? "PARTIALLY_PAID" : "PENDING") as Payment["status"],
      notes: (values.notes as string) || null,
    };
    payments.push(payment);
    return payment as T;
  }

  fail(404, `No mock handler for ${method} ${path}`);
}
