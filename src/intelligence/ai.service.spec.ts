import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseSeedService } from '../database/database.seed.service';
import { AIService } from './ai.service';
describe('DatabaseSeedService Integration Test', () => {
    let aiService: AIService;

    beforeAll(async () => {
        // Initialize the testing module
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DatabaseSeedService,
                AIService
            ],
        }).compile();

        aiService = module.get<AIService>(AIService);
    });

    it('should introspect the database schema , build payload for the open AI prompt and send the ting', async () => {
        const res = await aiService.generateSeedData();

        // Example assertions
        expect(res).toBeDefined();
        // expect(Object.keys(schema).length).toBeGreaterThan(0);

        // Print the schema to console for debugging
        console.log('Responde:', res);

    });
});