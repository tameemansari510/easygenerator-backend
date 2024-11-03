import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Readme extends Document {
  @Prop({ required: true })
  content: string;
}

export const ReadmeSchema = SchemaFactory.createForClass(Readme);
