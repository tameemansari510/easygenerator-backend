import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Readme } from './schemas/readme.schema';
import { Model } from 'mongoose';

@Injectable()
export class ReadmeService {
  constructor(@InjectModel(Readme.name) private ReadmeModel: Model<Readme>) {}
  private logger = new Logger(ReadmeService.name);

  async readme() {
    try {
      this.logger.log({
        message: `Entering readme`,
      });
      const res = await this.ReadmeModel.findOne();
      this.logger.log({
        message: `Exiting readme`,
      });
      return res;
    } catch (error) {
      this.logger.error({
        message: `Exception in readme`,
      });
      throw error;
    }
  }

  // This service is not used in the application.
  // Added to create content in the db for testing.
  async createContent(content: string) {
    return await this.ReadmeModel.create({ content });
  }
}
