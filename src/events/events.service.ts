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
import { VoteEventDto } from './dto/events.vote.dto';
import { ParticipantService } from 'src/participant/participant.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Events.name)
    private readonly eventModel: Model<Events>,
    private readonly participantService: ParticipantService,
  ) {}

  async create(createEventDto: EventsDto) {
    // handle duplicated events
    const eventName = createEventDto.name.trim();
    const duplicatedEvent = await this.findOneByName(eventName);

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

  async findAll() {
    const allEvents = await this.eventModel
      .find({}, { dates: 0, __v: 0 })
      .exec();

    return allEvents;
  }

  async findOneById(eventId: string) {
    return await this.eventModel.findOne({ _id: eventId }).lean();
  }

  async findOneByName(eventName: string) {
    return await this.eventModel.findOne({ name: eventName }).lean();
  }

  async findSuitableDates(eventId: string) {
    const foundEvent = await this.findOneById(eventId);

    if (!foundEvent) {
      throw new NotFoundException(`Event with id ${eventId} not found!`);
    }

    let suitableVote = foundEvent.votes[0];
    let suitableDates = [suitableVote];

    for (let i = 1; i < foundEvent.votes.length; i++) {
      if (foundEvent.votes[i].people.length > suitableVote.people.length) {
        suitableVote = foundEvent.votes[i];
        suitableDates = [suitableVote];
      } else if (
        foundEvent.votes[i].people.length === suitableVote.people.length
      ) {
        suitableDates.push(foundEvent.votes[i]);
      }
    }

    return {
      id: foundEvent._id,
      name: foundEvent.name,
      suitableDates,
    };
  }

  async update(eventId: string, eventData: EventsDto) {
    // check if the event exists
    const foundEvent = await this.findOneById(eventId);

    if (!foundEvent) {
      throw new NotFoundException(`Event with id ${eventId} not found!`);
    }

    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      eventId,
      {
        ...eventData,
      },
      { new: true },
    );

    if (!updatedEvent) {
      throw new InternalServerErrorException('Failed to updated the event');
    }

    return updatedEvent;
  }

  async createVote(eventId: string, eventData: VoteEventDto) {
    // check if the event exists
    const foundEvent = await this.findOneById(eventId);

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

      await this.update(eventId, {
        ...foundEvent,
        votes,
      });
    });

    // check if the event exists
    const foundUpdatedEvent = await this.findOneById(eventId);

    if (!foundEvent) {
      throw new NotFoundException(
        `Updated event with id: ${eventId} not found!`,
      );
    }

    return foundUpdatedEvent;
  }
}
