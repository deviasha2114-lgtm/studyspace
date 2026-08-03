import { Module } from '@nestjs/common';
import { StudyRoomsController } from './study-rooms.controller';
import { StudyRoomsService } from './study-rooms.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudyRoomsController],
  providers: [StudyRoomsService],
})
export class StudyRoomsModule {}