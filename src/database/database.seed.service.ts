import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DatabaseConfig, DatabaseSchema } from './models/database-schema';
import { join } from 'path';
import { existsSync } from 'fs';
import { getAllTableNamesQuery, getTableMetadataQuery } from './queries/core_queries';

@Injectable()
export class DatabaseSeedService {
    private dataSource: DataSource;

    constructor() {
    }


    loadSeedConfig(): DatabaseConfig {
        const configPath = join(process.cwd(), 'seed.config.ts');

        // Check if the config file exists
        if (!existsSync(configPath)) {
            throw new Error(
                `Configuration file "seed.config.ts" is missing. Please ensure it exists in the project root.`
            );
        }

        // Dynamically import the config file
        const config = require(configPath);
        const databaseConfig = config?.SeedConfig.database;
        // Validate the structure of the config file
        if (!databaseConfig) {
            throw new Error(
                `Invalid configuration file: Missing "database" property. The file must export a "database" object.`
            );
        }

        this.validateDatabaseConfig(databaseConfig);
        return databaseConfig;
    }


    validateDatabaseConfig(databaseConfig: DatabaseConfig) {

        const requiredFields: Array<keyof DatabaseConfig> = [
            'type',
            'host',
            'port',
            'username',
            'password',
            'database',
        ];

        requiredFields.forEach((field) => {
            if (!databaseConfig[field]) {
                throw new Error(
                    `Invalid database configuration: Missing required field "${new String(field)}".`
                );
            }
        });

        if (databaseConfig.type !== 'postgres') {
            throw new Error(
                `Unsupported database type "${databaseConfig.type}". Only "postgres" is currently supported.`
            );
        }
    }


    /**
     * Initializes the database connection.
     */
    private async initializeDataSource(): Promise<void> {

        if (!this.dataSource?.isInitialized) {
            try {
                this.dataSource = new DataSource(this.loadSeedConfig());
                await this.dataSource.initialize();
            } catch (e) {
                console.log('data source issues:', e);
                throw e;
            }

        }
    }

    /**
     * Introspects the database schema to retrieve table and column metadata.
     */
    async introspectSchema(schemaName?: string): Promise<DatabaseSchema> {
        await this.initializeDataSource();
        let tables = [];
        try {
            const allTableNamesQuery = getAllTableNamesQuery(schemaName);
            tables = await this.dataSource.query(
                allTableNamesQuery.text, allTableNamesQuery.values
            );

        } catch (error) {
            console.error("some shit aint right", error);
            return;
        }

        const schema: DatabaseSchema = {};

        for (const { table_name: tableName } of tables) {

            const query = getTableMetadataQuery(tableName, schemaName);
            const rawQueryText = query.text.replace(/\s+/g, ' ').trim();
            const result = await this.dataSource.query(rawQueryText, [query.values]);

            // Check if metadata and columns are available
            const columns = result.map((column) => ({
                name: column.propertyName || null,
                type: column.type || null,
                isPrimary: column.isPrimary || false,
                isNullable: column.isNullable || false,
                isGenerated: column.isGenerated || false,
                default: column.default || null,
                length: column.length || null,
                precision: column.precision || null,
                scale: column.scale || null,
                enum: column.enum || undefined,
                referencedTable: column.relationMetadata?.entityMetadata?.tableName || null,
                referencedColumn: column.referencedColumn?.propertyName || null,
                comment: column.comment || null,
                relationType: column.relationMetadata?.type || null,
            })) || [];

            schema[tableName] = columns;
        }

        return schema;
    }

    // function to scan for .entity.ts files and 

}