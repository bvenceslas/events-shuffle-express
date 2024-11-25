import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventsDocument = HydratedDocument<Events>;

@Schema({ collection: 'events' })
export class Events {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: [Date],
    required: true,
  })
  dates: Date[];
}

export const EventsSchema = SchemaFactory.createForClass(Events);
