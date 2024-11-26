import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { ParticipantDto } from './dto/participant.dto';

@Controller({
  path: 'participant',
  version: 'v1',
})
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Post()
  async create(@Body() createParticipantDto: ParticipantDto) {
    return await this.participantService.create(createParticipantDto);
  }

  @Get()
  async getAllParticipants() {
    return await this.participantService.findAll();
  }

  @Get(':id')
  async getParticipantById(@Param('id') participantId: string) {
    return await this.participantService.findOneById(participantId);
  }

  @Get('/name/:name')
  async getParticipantByName(@Param('name') participantName: string) {
    return await this.participantService.findOneByName(participantName);
  }

  @Put(':id')
  async update(
    @Param('id') participantId: string,
    @Body() updateParticipantDto: ParticipantDto,
  ) {
    return await this.participantService.update(
      participantId,
      updateParticipantDto,
    );
  }
}
