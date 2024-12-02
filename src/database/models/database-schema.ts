export type ColumnMetadata = {
    name: string;
    type: string | any; // Replace `any` with specific types if you have them
    isPrimary: boolean;
    isNullable: boolean;
    isGenerated: boolean;
    default: string | null;
    length: number | null;
    precision: number | null;
    scale: number | null;
    referencedTable: string | null;
    referencedColumn: string | null;
    comment: string | null;
    relationType: string | null;
  };
  
  export type DatabaseSchema = {
    [tableName: string]: ColumnMetadata[];
  };


  export class DatabaseConfig {
    type: 'postgres'; // Extend for other DB types if needed
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  }
  
  export interface SeedConfig {
    database: DatabaseConfig;
  }
  