import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { ParticipantDto } from './dto/participant.dto';

@Controller({
  path: 'participant',
  version: '1',
})
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Post()
  async createV1(@Body() createParticipantDto: ParticipantDto) {
    return await this.participantService.create(createParticipantDto);
  }

  @Get()
  async getAllParticipantsV1() {
    return await this.participantService.findAll();
  }

  @Get(':id')
  async getParticipantByIdV1(@Param('id') participantId: string) {
    return await this.participantService.findOneById(participantId);
  }

  @Get('/name/:name')
  async getParticipantByNameV1(@Param('name') participantName: string) {
    return await this.participantService.findOneByName(participantName);
  }

  @Put(':id')
  async updateV1(
    @Param('id') participantId: string,
    @Body() updateParticipantDto: ParticipantDto,
  ) {
    return await this.participantService.update(
      participantId,
      updateParticipantDto,
    );
  }
}
