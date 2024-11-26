import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './events/events.module';
import { ParticipantModule } from './participant/participant.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb+srv://${configService.get('DATABASE_USER')}:${configService.get('DATABASE_PASSWORD')}@braincluster.iyj68qh.mongodb.net/${configService.get('DATABASE_NAME')}`,
      }),
    }),
    EventsModule,
    ParticipantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
