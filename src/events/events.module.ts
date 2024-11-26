import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Events, EventsSchema } from './models/events.model';
import { ParticipantModule } from 'src/participant/participant.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Events.name,
        schema: EventsSchema,
      },
    ]),
    ParticipantModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
