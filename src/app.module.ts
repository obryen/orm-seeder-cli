import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AIService } from './intelligence/ai.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AIService],
})
export class AppModule { }
