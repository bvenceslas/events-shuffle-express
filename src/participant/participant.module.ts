import { Module } from '@nestjs/common';
import { ParticipantController } from './participant.controller';
import { ParticipantService } from './participant.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Participant, ParticipantSchema } from './models/participant.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Participant.name, schema: ParticipantSchema },
    ]),
  ],
  controllers: [ParticipantController],
  providers: [ParticipantService],
  exports: [ParticipantService],
})
export class ParticipantModule {}
