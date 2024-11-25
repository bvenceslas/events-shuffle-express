import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ParticipantDocument = HydratedDocument<Participant>;

@Schema({ collection: 'participants' })
export class Participant {
  @Prop({ type: String, required: true, trim: true })
  name: string;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
