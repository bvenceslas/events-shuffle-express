import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Events, TypeVote } from './models/events.model';
import { Model } from 'mongoose';
import { EventsDto } from './dto/events.dto';
import { VoteEventDto } from './dto/events.vote.dto';
import { ParticipantService } from 'src/participant/participant.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Events.name)
    private readonly eventModel: Model<Events>,
    private readonly participantService: ParticipantService,
  ) {}

  async createV1(createEventDto: EventsDto) {
    // handle duplicated events
    const eventName = createEventDto.name.trim();
    const duplicatedEvent = await this.findOneByNameV1(eventName);

    if (duplicatedEvent) {
      throw new ConflictException(
        `Event [${eventName}] already exists, please use another name`,
      );
    }

    const newEvent = new this.eventModel(createEventDto);
    newEvent.votes = [];
    const createdEvent = await newEvent.save();
    return createdEvent._id;
  }

  async findAllV1() {
    const allEvents = await this.eventModel
      .find({}, { dates: 0, __v: 0 })
      .exec();

    return allEvents;
  }

  async findOneByIdV1(eventId: string) {
    return await this.eventModel.findOne({ _id: eventId }).lean();
  }

  async findOneByNameV1(eventName: string) {
    return await this.eventModel.findOne({ name: eventName }).lean();
  }

  async updateV1(eventId: string, eventData: EventsDto) {
    // check if the event exists
    const foundEvent = await this.findOneByIdV1(eventId);

    if (!foundEvent) {
      throw new NotFoundException(`Event with id ${eventId} not found!`);
    }

    const updatedEvent = await this.eventModel.findByIdAndUpdate(eventId, {
      ...eventData,
    });

    if (!updatedEvent) {
      throw new InternalServerErrorException('Failed to updated the event');
    }

    return updatedEvent;
  }

  async createVoteV1(eventId: string, eventData: VoteEventDto) {
    // check if the event exists
    const foundEvent = await this.findOneByIdV1(eventId);

    if (!foundEvent) {
      throw new NotFoundException(`Event with id: ${eventId} not found!`);
    }

    // check if the participant exists
    const { participant, votingDates } = eventData;
    const foundParticipant =
      await this.participantService.findOneByName(participant);

    if (!foundParticipant) {
      throw new NotFoundException(
        `Participant with name: ${participant} not found`,
      );
    }

    // get the event vote
    const votes = foundEvent.votes || [];

    // check voting dates
    votingDates.forEach(async (votingDate) => {
      const votingDateObj = new Date(votingDate);

      // (1) check valid (existing) dates
      const isValid = foundEvent.dates.some(
        (eventDate) =>
          votingDateObj.getTime() === new Date(eventDate).getTime(),
      );

      if (!isValid) {
        console.log(`Skipping inexistent date ${votingDateObj}`);
        return;
      }

      // (2) check if the date exists under event vote
      const existingVote = votes?.find(
        (vote) => votingDateObj.getTime() === vote.date.getTime(),
      );

      if (existingVote) {
        // if the person doesn't exist under the existing vote, add him
        if (!existingVote.people.includes(participant)) {
          existingVote.people.push(participant);
        }

        // else skipping...
      } else {
        votes.push({
          date: votingDateObj,
          people: [participant],
        });
      }

      // update the event with the constituted array
      const updatedVoteEvent = await this.updateV1(eventId, {
        ...foundEvent,
        votes,
      });

      return updatedVoteEvent;
    });

    // end
  }
}
