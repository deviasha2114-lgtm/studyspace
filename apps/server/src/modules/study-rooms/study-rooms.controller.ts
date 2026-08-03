import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { StudyRoomsService } from './study-rooms.service';
import { CreateStudyRoomDto } from './dto/create-study-room.dto';
import { UpdateStudyRoomDto } from './dto/update-study-room.dto';
import { JoinStudyRoomDto } from './dto/join-study-room.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('study-rooms')
export class StudyRoomsController {
  constructor(private readonly studyRoomsService: StudyRoomsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createStudyRoomDto: CreateStudyRoomDto, @Req() req: Request) {
    const userId = req['user'].id;
    return this.studyRoomsService.create(createStudyRoomDto, userId);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Query() query: any, @Req() req: Request) {
    const userId = req['user'].id;
    return this.studyRoomsService.findAll(query, userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user'].id;
    return this.studyRoomsService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateStudyRoomDto: UpdateStudyRoomDto, @Req() req: Request) {
    const userId = req['user'].id;
    return this.studyRoomsService.update(id, updateStudyRoomDto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user'].id;
    return this.studyRoomsService.remove(id, userId);
  }

  @Post(':id/join')
  @UseGuards(AuthGuard)
  join(@Param('id') id: string, @Body() joinStudyRoomDto: JoinStudyRoomDto, @Req() req: Request) {
    const userId = req['user'].id;
    return this.studyRoomsService.join(id, joinStudyRoomDto, userId);
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard)
  leave(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user'].id;
    return this.studyRoomsService.leave(id, userId);
  }

  @Post(':id/messages')
  @UseGuards(AuthGuard)
  sendMessage(@Param('id') id: string, @Body() { content }: { content: string }, @Req() req: Request) {
    const userId = req['user'].id;
    return this.studyRoomsService.sendMessage(id, content, userId);
  }

  @Get(':id/messages')
  @UseGuards(AuthGuard)
  getMessages(@Param('id') id: string, @Query('limit') limit: number = 50, @Req() req: Request) {
    const userId = req['user'].id;
    return this.studyRoomsService.getMessages(id, limit, userId);
  }

  @Post(':id/settings')
  @UseGuards(AuthGuard)
  updateSettings(@Param('id') id: string, @Body() settings: any, @Req() req: Request) {
    const userId = req['user'].id;
    return this.studyRoomsService.updateSettings(id, settings, userId);
  }

  @Post(':id/access')
  @UseGuards(AuthGuard)
  grantAccess(@Param('id') id: string, @Body() { userId }: { userId: string }, @Req() req: Request) {
    const grantedById = req['user'].id;
    return this.studyRoomsService.grantAccess(id, userId, grantedById);
  }

  @Delete(':id/access/:userId')
  @UseGuards(AuthGuard)
  revokeAccess(@Param('id') id: string, @Param('userId') userIdToRevoke: string, @Req() req: Request) {
    const userId = req['user'].id;
    return this.studyRoomsService.revokeAccess(id, userIdToRevoke, userId);
  }
}