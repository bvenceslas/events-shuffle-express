import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Participant } from './models/participant.model';
import { Model } from 'mongoose';
import { ParticipantDto } from './dto/participant.dto';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectModel(Participant.name)
    private readonly participantModel: Model<Participant>,
  ) {}

  async create(createParticipantDto: ParticipantDto) {
    // handle duplicated participant
    const participantName = createParticipantDto.name.trim();
    const duplicatedParticipant = await this.findOneByName(participantName);

    if (duplicatedParticipant) {
      throw new ConflictException(
        `Name [${participantName}] already taken, please use another name`,
      );
    }

    const newParticipant = new this.participantModel(createParticipantDto);
    const createdParticipant = await newParticipant.save();
    return createdParticipant;
  }

  async findAll() {
    return await this.participantModel.find({}).exec();
  }

  async findOneById(participantId: string) {
    return await this.participantModel.findOne({ _id: participantId }).lean();
  }

  async findOneByName(participantName) {
    return await this.participantModel
      .findOne({ name: participantName })
      .lean();
  }

  async update(participantId: string, data: ParticipantDto) {
    // check if the participant exists
    const foundParticipant = this.findOneById(participantId);

    if (!foundParticipant) {
      throw new NotFoundException(
        `Participant with id ${participantId} not found!`,
      );
    }

    const updatedParticipant = await this.participantModel.findByIdAndUpdate(
      participantId,
      { ...data },
    );

    if (!updatedParticipant) {
      throw new InternalServerErrorException(
        'Failed to updated the participant',
      );
    }

    return updatedParticipant;
  }
}
