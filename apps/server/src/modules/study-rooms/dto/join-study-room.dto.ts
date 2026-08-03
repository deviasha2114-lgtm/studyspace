import { IsOptional, Is there a way to handle potential issues when creating DTO files for a study room system? I need to create a data transfer object that validates input for joining study rooms. The DTO should include optional fields like goal, focus mode preference, and password with specific validation rules. I'll use class-validator decorators to ensure data integrity, making sure the goal is a short string, focus mode is boolean, and password meets alphanumeric requirements. This approach will help prevent invalid data from entering the system when users attempt to join study<tool_call>
<function=Write>
<parameter=content>
import { IsOptional, IsString, MaxLength, IsBoolean, Matches } from 'class-validator';

export class JoinStudyRoomDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  goal?: string;

  @IsOptional()
  @IsBoolean()
  isFocusMode?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9]{1,20}$/, { message: 'Password must be alphanumeric and 1-20 characters' })
  password?: string;
}