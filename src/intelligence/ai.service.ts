import * as fs from 'fs'
import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import axios, { AxiosInstance } from 'axios';
import { DatabaseSeedService } from "../database/database.seed.service";
import { join } from 'path';

@Injectable()
export class AIService {
    private axiosInstance: AxiosInstance;

    constructor(@Inject() private seedService: DatabaseSeedService) {
        this.axiosInstance = axios.create({
            baseURL: 'https://api.openai.com/v1',
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

    }

    async generateSeedData(): Promise<any> {

        const schema = await this.seedService.introspectSchema()

        const seedData = await this.callOpenAI(JSON.stringify(schema));
        const sqlContent = Array.isArray(seedData) ? seedData.join('\n') : seedData;

        const filePath = join(__dirname, 'seed_data.sql');

        await fs.writeFileSync(filePath, sqlContent);

        console.log(`Seed data written to: ${filePath}`);
        return true;

    }

    async callOpenAI(schema: string): Promise<any[]> {
        const prompt = this.createPrompt(schema);
        const payload = {
            model: 'gpt-3.5',
            messages: [{ role: "system", content: "You are a database query writing expert." }, { role: "user", "content": prompt }],
            max_tokens: 1000,
        };

        try {
            const response = await this.axiosInstance.post('/completions', payload);
            console.log("response", response);
            return JSON.parse(response.data.choices[0].text.trim());
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            throw new InternalServerErrorException('Failed to generate data using OpenAI API');
        }
    }

    private createPrompt(schema: string): string {
        const promptTxt = `
      Generate realistic seed data insert queries for this schema "${schema}"
    `;

        console.log('prompt', promptTxt)
        return promptTxt;
    }
}