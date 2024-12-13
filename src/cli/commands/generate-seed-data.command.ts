import { Injectable } from '@nestjs/common';
import { ClassificationService } from 'src/classifications/classification.service';
import { AIService } from 'src/intelligence/ai.service';

// @Command({
//     command: ['generate-seed-data'],
//     describe: 'Generate seed data based on client database schema',
// })
@Injectable()
export class GenerateSeedDataCommand {
    constructor(
        // private readonly databaseService: DatabaseService,
        private readonly classificationService: ClassificationService,
        private readonly aiService: AIService
    ) {}

    async run() {
        // // const schema = await this.databaseService.introspectSchema();
        // const rules = this.classificationService.getRules();
        // const seedData = await this.aiService.generateSeedData(schema, rules);
        // console.log('Seed data generated successfully!');
        // console.log(seedData);
    }
}