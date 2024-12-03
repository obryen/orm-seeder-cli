import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios, { AxiosInstance } from 'axios';
import { ColumnMetadata, DatabaseSchema } from "src/database/models/database-schema";

@Injectable()
export class AIService {
    private axiosInstance: AxiosInstance;

    constructor() {
            this.axiosInstance = axios.create({
                baseURL: 'https://api.openai.com/v1',
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });
    
    }

    async generateSeedData(schema: DatabaseSchema, rules: Record<string, any>): Promise<Record<string, any[]>> {
        const seedData: Record<string, any[]> = {};
        for (const [tableName, columns] of Object.entries(schema)) {
            const tableData = await this.callOpenAI(tableName, columns, rules);
            seedData[tableName] = tableData;
        }
        return seedData;
    }

    async callOpenAI(tableName: string, columns: ColumnMetadata[], rules: Record<string, any>): Promise<any[]> {
        const prompt = this.createPrompt(tableName, columns, rules);
        const payload = {
            model: 'text-davinci-003',
            prompt,
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

    private createPrompt(tableName: string, columns: ColumnMetadata[], rules: Record<string, any>): string {
        return `
      Generate realistic seed data for the table "${tableName}".
      Schema:
      ${columns.map(col => `${col.name} (${col.type})`).join('\n')}
      Rules:
      ${JSON.stringify(rules, null, 2)}
    `;
    }
}