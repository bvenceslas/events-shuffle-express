import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsDto } from './dto/events.dto';
import { Events } from './models/events.model';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createEvent(@Body() createEventDto: EventsDto) {
    return await this.eventsService.create(createEventDto);
  }

  @Get()
  async getAllEvents() {
    return await this.eventsService.findAll();
  }

  @Get(':id')
  async getEventById(@Param('id') eventId: string) {
    return await this.eventsService.findOneById(eventId);
  }

  @Get('/name/:name')
  async getEventByName(@Param('name') eventName: string) {
    return await this.eventsService.findOneByName(eventName);
  }

  @Put(':id')
  async updateEvent(@Param('id') eventId: string, @Body() data: EventsDto) {
    return await this.eventsService.update(eventId, data);
  }
}
