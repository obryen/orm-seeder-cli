import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseSeedService } from './database.seed.service';

describe('DatabaseSeedService Integration Test', () => {
    let databaseSeedService: DatabaseSeedService;

    beforeAll(async () => {
        // Initialize the testing module
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DatabaseSeedService,
            ],
        }).compile();

        databaseSeedService = module.get<DatabaseSeedService>(DatabaseSeedService);
    });

    it('should introspect the database schema and print it', async () => {
        const schema = await databaseSeedService.introspectSchema();

        // Example assertions
        expect(schema).toBeDefined();
        // expect(Object.keys(schema).length).toBeGreaterThan(0);

        // Print the schema to console for debugging
        console.log('Database Schema:', JSON.stringify(schema, null, 2));

    });
});