import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('chemistry123', 10);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'chemistry-with-tahsan' },
    update: {},
    create: {
      slug: 'chemistry-with-tahsan',
      brandName: 'Chemistry with Tahsan',
      ownerName: 'MD. Manirul Islam Bhuyan (Tahsan)',
      bio:
        'Cambridge & Edexcel Chemistry specialist with 17+ years of teaching experience, ' +
        'covering O Level, IGCSE, AS and A2 Chemistry. B.Pharm background. Based in Uttara, Dhaka.',
      photoUrl: '/images/teacher-profile.jpg',
      phone: '+8801805722207',
      whatsapp: '+8801805722207',
      email: 'tahsan@chemistrywithtahsan.com',
      address: 'Uttara, Dhaka, Bangladesh',
      facebookUrl: 'https://facebook.com/chemistrywithtahsan',
      instagramUrl: 'https://instagram.com/chemistrywithtahsan',
      youtubeUrl: 'https://youtube.com/@chemistrywithtahsan',
    },
  });

  await prisma.user.upsert({
    where: { email: 'tahsan@chemistrywithtahsan.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'MD. Manirul Islam Bhuyan',
      email: 'tahsan@chemistrywithtahsan.com',
      passwordHash,
      role: 'OWNER',
    },
  });

  const courseData = [
    { name: 'Cambridge Pre-O Level', academicLevel: 'Pre-O Level', examBoard: 'Cambridge (CAIE)', description: 'Foundation chemistry for students preparing to enter O Level.' },
    { name: 'CAIE 8/9', academicLevel: 'Grade 8/9', examBoard: 'Cambridge (CAIE)', description: 'Cambridge Lower Secondary Chemistry, grades 8 and 9.' },
    { name: 'EDXL 8/9', academicLevel: 'Grade 8/9', examBoard: 'Edexcel', description: 'Edexcel Lower Secondary Chemistry, grades 8 and 9.' },
    { name: 'CAIE 10', academicLevel: 'O Level / IGCSE', examBoard: 'Cambridge (CAIE)', description: 'Cambridge O Level (5070) and IGCSE (0620) Chemistry, full syllabus.' },
    { name: 'CAIE AS', academicLevel: 'AS Level', examBoard: 'Cambridge (CAIE)', description: 'Cambridge International AS Level Chemistry (9701).' },
    { name: 'CAIE A2', academicLevel: 'A2 Level', examBoard: 'Cambridge (CAIE)', description: 'Cambridge International A2 Level Chemistry (9701).' },
  ];

  const courses: Record<string, string> = {};
  for (const c of courseData) {
    let course = await prisma.course.findFirst({ where: { tenantId: tenant.id, name: c.name } });
    if (!course) {
      course = await prisma.course.create({ data: { ...c, tenantId: tenant.id } });
    }
    courses[c.name] = course.id;
  }

  const batchDefs = [
    { courseName: 'CAIE 10', name: 'CAIE 10 — Friday Batch', schedule: 'Every Friday, 4:00 PM - 6:00 PM', capacity: 20, status: 'ONGOING' as const },
    { courseName: 'CAIE AS', name: 'CAIE AS — Saturday Batch', schedule: 'Every Saturday, 5:00 PM - 7:00 PM', capacity: 15, status: 'ONGOING' as const },
    { courseName: 'EDXL 8/9', name: 'EDXL 8/9 — Evening Batch', schedule: 'Sunday & Tuesday, 6:00 PM - 7:30 PM', capacity: 18, status: 'UPCOMING' as const },
  ];

  const batches: Record<string, string> = {};
  for (const b of batchDefs) {
    let batch = await prisma.batch.findFirst({ where: { tenantId: tenant.id, name: b.name } });
    if (!batch) {
      batch = await prisma.batch.create({
        data: {
          tenantId: tenant.id,
          courseId: courses[b.courseName],
          name: b.name,
          schedule: b.schedule,
          capacity: b.capacity,
          status: b.status,
          startDate: new Date('2026-08-01'),
        },
      });
    }
    batches[b.name] = batch.id;
  }

  const studentDefs = [
    { code: 'STU-0001', name: 'Arafat Hossain', level: 'O Level / IGCSE', board: 'Cambridge (CAIE)', batch: 'CAIE 10 — Friday Batch', course: 'CAIE 10', phone: '+8801711000001', parent: 'Mr. Hossain', parentContact: '+8801711000011' },
    { code: 'STU-0002', name: 'Farhana Akter', level: 'O Level / IGCSE', board: 'Cambridge (CAIE)', batch: 'CAIE 10 — Friday Batch', course: 'CAIE 10', phone: '+8801711000002', parent: 'Mrs. Akter', parentContact: '+8801711000012' },
    { code: 'STU-0003', name: 'Nabil Rahman', level: 'AS Level', board: 'Cambridge (CAIE)', batch: 'CAIE AS — Saturday Batch', course: 'CAIE AS', phone: '+8801711000003', parent: 'Mr. Rahman', parentContact: '+8801711000013' },
    { code: 'STU-0004', name: 'Sadia Islam', level: 'AS Level', board: 'Cambridge (CAIE)', batch: 'CAIE AS — Saturday Batch', course: 'CAIE AS', phone: '+8801711000004', parent: 'Mr. Islam', parentContact: '+8801711000014' },
    { code: 'STU-0005', name: 'Tanvir Ahmed', level: 'Grade 8/9', board: 'Edexcel', batch: 'EDXL 8/9 — Evening Batch', course: 'EDXL 8/9', phone: '+8801711000005', parent: 'Mrs. Ahmed', parentContact: '+8801711000015' },
  ];

  for (const s of studentDefs) {
    let student = await prisma.student.findFirst({ where: { tenantId: tenant.id, studentCode: s.code } });
    if (!student) {
      student = await prisma.student.create({
        data: {
          tenantId: tenant.id,
          studentCode: s.code,
          name: s.name,
          academicLevel: s.level,
          examBoard: s.board,
          phone: s.phone,
          whatsapp: s.phone,
          parentName: s.parent,
          parentContact: s.parentContact,
          status: 'ACTIVE',
        },
      });
    }

    let enrollment = await prisma.enrollment.findFirst({ where: { tenantId: tenant.id, studentId: student.id, batchId: batches[s.batch] } });
    if (!enrollment) {
      enrollment = await prisma.enrollment.create({
        data: {
          tenantId: tenant.id,
          studentId: student.id,
          courseId: courses[s.course],
          batchId: batches[s.batch],
          status: 'ACTIVE',
        },
      });
    }

    const existingPayment = await prisma.payment.findFirst({ where: { tenantId: tenant.id, studentId: student.id } });
    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          tenantId: tenant.id,
          studentId: student.id,
          enrollmentId: enrollment.id,
          amount: 3000,
          paidAmount: 1500,
          dueAmount: 1500,
          paymentDate: new Date(),
          method: 'BKASH',
          status: 'PARTIALLY_PAID',
        },
      });
    }
  }

  // A couple of resources
  const resourceDefs = [
    {
      title: 'Cambridge O Level / IGCSE Chemistry Handbook',
      description: 'Full syllabus-focused handbook covering Cambridge 5070 and 0620 Chemistry.',
      type: 'PDF_BOOK' as const,
      subject: 'Chemistry',
      course: 'CAIE 10',
      coverImageUrl: '/images/handbook-cover-dark.jpg',
      visibility: 'PUBLIC' as const,
      price: 450,
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Organic Chemistry Reaction Map (Free Sample)',
      description: 'A free revision sheet mapping key organic chemistry reactions.',
      type: 'REVISION_MAP' as const,
      subject: 'Organic Chemistry',
      course: 'CAIE 10',
      visibility: 'PUBLIC' as const,
      price: 0,
      status: 'PUBLISHED' as const,
    },
  ];

  for (const r of resourceDefs) {
    const existing = await prisma.resource.findFirst({ where: { tenantId: tenant.id, title: r.title } });
    if (!existing) {
      await prisma.resource.create({
        data: {
          tenantId: tenant.id,
          title: r.title,
          description: r.description,
          type: r.type,
          subject: r.subject,
          courseId: courses[r.course],
          coverImageUrl: r.coverImageUrl,
          visibility: r.visibility,
          price: r.price,
          status: r.status,
        },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete. Login with tahsan@chemistrywithtahsan.com / chemistry123');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
