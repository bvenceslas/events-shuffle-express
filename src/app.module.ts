import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './events/events.module';
import { ParticipantModule } from './participant/participant.module';

@Module({
  imports: [
    // TODO: to be encapsulated
    MongooseModule.forRoot(
      'mongodb+srv://test_user:nA7etRNbGjs16dHU@braincluster.iyj68qh.mongodb.net/events-shuffle',
    ),
    EventsModule,
    ParticipantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
