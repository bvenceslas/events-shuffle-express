import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsDto } from './dto/events.dto';
import { Events } from './models/events.model';

@Controller({
  path: 'event',
  version: '1',
})
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createEventV1(@Body() createEventDto: EventsDto) {
    return await this.eventsService.createV1(createEventDto);
  }

  @Get()
  async getAllEventsV1() {
    return await this.eventsService.findAllV1();
  }

  @Get(':id')
  async getEventByIdV1(@Param('id') eventId: string) {
    return await this.eventsService.findOneByIdV1(eventId);
  }

  @Get('/name/:name')
  async getEventByNameV1(@Param('name') eventName: string) {
    return await this.eventsService.findOneByNameV1(eventName);
  }

  @Put(':id')
  async updateEventV1(@Param('id') eventId: string, @Body() data: EventsDto) {
    return await this.eventsService.updateV1(eventId, data);
  }
}
