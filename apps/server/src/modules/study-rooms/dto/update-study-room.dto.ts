import { IsOptional, IsIn, IsInt, Min, IsBoolean, IsDateString, IsString, Matches, MaxLength } from 'class-validator';
import { StudyRoomType, StudyRoomStatus } from '../study-rooms.model';

export class UpdateStudyRoomDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsIn([StudyRoomType.OPEN, StudyRoomType.SUBJECT, StudyRoomType.PRIVATE, StudyRoomType.BATCH, StudyRoomType.FOCUS])
  type?: StudyRoomType;

  @IsOptional()
  @IsIn([StudyRoomStatus.ACTIVE, StudyRoomStatus.INACTIVE, StudyRoomStatus.ARCHIVED])
  status?: StudyRoomStatus;

  @IsOptional()
  @Matches(/^[a-zA-Z0-9]{1,20}$/, { message: 'Password must be alphanumeric and 1-20 characters' })
  password?: string | null; // Allow null to remove password

  @IsOptional()
  @IsInt()
  @Min(1)
  maxCapacity?: number;

  @IsOptional()
  @IsBoolean()
  isPermanent?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string | null; // Allow null to remove expiration

  @IsOptional()
  @IsString()
  communityId?: string | null; // Allow null to disconnect community
}