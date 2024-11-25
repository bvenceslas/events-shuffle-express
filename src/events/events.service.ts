import {
  ConflictException,
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

  async createV1(createEventDto: EventsDto) {
    // handle duplicated events
    const eventName = createEventDto.name.trim();
    const duplicatedEvent = this.findOneByNameV1(eventName);

    if (duplicatedEvent) {
      throw new ConflictException(
        `Event [${eventName}] already exists, please use another name`,
      );
    }

    const newEvent = new this.eventModel(createEventDto);
    const createdEvent = await newEvent.save();
    return createdEvent._id;
  }

  async findAllV1() {
    return await this.eventModel.find({}).exec();
  }

  async findOneByIdV1(eventId: string) {
    return await this.eventModel.findOne({ _id: eventId });
  }

  async findOneByNameV1(eventName: string) {
    return await this.eventModel.findOne({ name: eventName });
  }

  async updateV1(eventId: string, eventData: EventsDto) {
    // check if the event exists
    const foundEvent = this.findOneByIdV1(eventId);

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
