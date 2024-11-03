import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Readme, ReadmeSchema } from './schemas/readme.schema';
import { ReadmeController } from './readme.controller';
import { ReadmeService } from './readme.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Readme.name, schema: ReadmeSchema }]),
  ],
  controllers: [ReadmeController],
  providers: [ReadmeService],
})
export class ReadmeModule {}
