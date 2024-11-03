import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ReadmeService } from './readme.service';
import { ReadmeDto } from './dto/readme.dto';

@Controller('readme')
export class ReadmeController {
  constructor(private readmeService: ReadmeService) {}
  private logger = new Logger(ReadmeController.name);

  @Get()
  async readme() {
    try {
      this.logger.log({
        message: `Entering readme`,
      });
      const res = await this.readmeService.readme();
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

  // This resourse is not used in the application.
  // Added to create content in the db for testing.
  @Post()
  async createContent(@Body() readmeDto: ReadmeDto) {
    return await this.readmeService.createContent(readmeDto.content);
  }
}
