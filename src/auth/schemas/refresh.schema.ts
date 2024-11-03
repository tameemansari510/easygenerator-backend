import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class RefreshToken extends Document {
  @Prop({ required: true })
  refreshToken: string;
  @Prop({ required: true })
  accessToken: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  expiryDate: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
