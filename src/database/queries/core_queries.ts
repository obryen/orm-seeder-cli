
export function getAllTableNamesQuery(schemaName = 'public') {
    return {
        text: `SELECT table_name FROM information_schema.tables WHERE table_schema = $1`,
        values: [schemaName],
    };
}


export function getTableMetadataQuery(tableName: string, schemaName = 'public') {
    return {
        values: [tableName, schemaName],
        text: `SELECT 
    c.column_name AS name,
    c.data_type AS type,
    CASE 
        WHEN tc.constraint_type = 'PRIMARY KEY' THEN true
        ELSE false
    END AS isPrimary,
    CASE 
        WHEN c.is_nullable = 'YES' THEN true
        ELSE false
    END AS isNullable,
    CASE 
        WHEN c.is_generated = 'ALWAYS' THEN true
        ELSE false
    END AS isGenerated,
    c.column_default AS default,
    c.character_maximum_length AS length,
    c.numeric_precision AS precision,
    c.numeric_scale AS scale,
    fk.referenced_table_name AS referencedTable,
    fk.referenced_column_name AS referencedColumn,
    pgd.description AS comment,
    CASE 
        WHEN fk.referenced_table_name IS NOT NULL THEN 'FOREIGN KEY'
        ELSE NULL
    END AS relationType
FROM 
    information_schema.columns c
LEFT JOIN 
    information_schema.table_constraints tc 
    ON c.table_name = tc.table_name 
    AND c.table_schema = tc.table_schema
    AND tc.constraint_type = 'PRIMARY KEY'
    AND c.column_name = ANY (SELECT kcu.column_name
                             FROM information_schema.key_column_usage kcu
                             WHERE kcu.constraint_name = tc.constraint_name)
LEFT JOIN 
    (
        SELECT 
            kcu.table_name AS table_name,
            kcu.column_name AS column_name,
            ccu.table_name AS referenced_table_name,
            ccu.column_name AS referenced_column_name
        FROM 
            information_schema.key_column_usage kcu
        INNER JOIN 
            information_schema.referential_constraints rc
            ON kcu.constraint_name = rc.constraint_name
        INNER JOIN 
            information_schema.constraint_column_usage ccu
            ON rc.unique_constraint_name = ccu.constraint_name
    ) fk
    ON c.table_name = fk.table_name
    AND c.column_name = fk.column_name
LEFT JOIN 
    pg_catalog.pg_description pgd
    ON pgd.objsubid = c.ordinal_position
    AND pgd.objoid = (
        SELECT oid 
        FROM pg_catalog.pg_class 
        WHERE relname = c.table_name 
        AND relnamespace = (
            SELECT oid 
            FROM pg_catalog.pg_namespace 
            WHERE nspname = c.table_schema
        )
    )
WHERE 
    c.table_name = $1
    AND c.table_schema = $2;`
    }
}