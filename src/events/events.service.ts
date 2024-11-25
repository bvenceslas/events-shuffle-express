import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Events } from './models/events.model';
import { Model } from 'mongoose';
import { EventsDto } from './dto/events.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Events.name)
    private readonly eventModel: Model<Events>,
  ) {}

  async create(createEventDto: EventsDto) {
    const newEvent = new this.eventModel(createEventDto);
    const createdEvent = await newEvent.save();
    return createdEvent._id;
  }

  async findAll() {
    return await this.eventModel.find({}).exec();
  }

  async findOneById(eventId: string) {
    return await this.eventModel.findOne({ _id: eventId });
  }

  async findOneByName(eventName: string) {
    return await this.eventModel.findOne({ name: eventName });
  }

  async update(eventId: string, eventData: EventsDto) {
    // check if the event exists
    const foundEvent = this.findOneById(eventId);

    if (!foundEvent) {
      throw new NotFoundException(`Event with id ${eventId} not found!`);
    }

    const updatedEvent = await this.eventModel.updateOne(
      { _id: eventId },
      { ...eventData },
    );

    if (!updatedEvent) {
      throw new InternalServerErrorException('Failed to updated the event');
    }

    return updatedEvent;
  }
}
