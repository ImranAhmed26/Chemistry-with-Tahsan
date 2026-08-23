import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { CoursesModule } from './courses/courses.module';
import { BatchesModule } from './batches/batches.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ClassSessionsModule } from './class-sessions/class-sessions.module';
import { ResourcesModule } from './resources/resources.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StudentsModule,
    CoursesModule,
    BatchesModule,
    EnrollmentsModule,
    ClassSessionsModule,
    ResourcesModule,
    PaymentsModule,
    DashboardModule,
    PublicModule,
  ],
})
export class AppModule {}
