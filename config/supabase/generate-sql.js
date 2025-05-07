/**
 * SQL Generator voor Supabase
 * 
 * Dit script genereert SQL queries voor het aanmaken van tabellen, indexes,
 * RLS policies en storage buckets in Supabase op basis van de configuratie.
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

// Pad naar output SQL bestand
const outputPath = path.join(__dirname, 'supabase-setup.sql');

/**
 * Genereert SQL voor het aanmaken van een tabel
 * @param {Object} table - Tabel configuratie
 * @returns {String} SQL query
 */
function generateTableSQL(table) {
  const columns = table.columns.map(column => {
    let sql = `  "${column.name}" ${column.type}`;
    
    if (column.primaryKey) {
      sql += ' PRIMARY KEY';
    }
    
    if (column.notNull) {
      sql += ' NOT NULL';
    }
    
    if (column.unique) {
      sql += ' UNIQUE';
    }
    
    if (column.default) {
      sql += ` DEFAULT ${column.default}`;
    }
    
    if (column.references) {
      sql += ` REFERENCES ${column.references} ON DELETE CASCADE`;
    }
    
    return sql;
  }).join(',\n');
  
  return `-- Aanmaken van tabel ${table.name}
CREATE TABLE IF NOT EXISTS ${table.schema}.${table.name} (
${columns}
);

-- Commentaar toevoegen aan tabel
COMMENT ON TABLE ${table.schema}.${table.name} IS 'MarketPulse AI ${table.name} tabel';

`;
}

/**
 * Genereert SQL voor het aanmaken van indexes
 * @param {Object} table - Tabel configuratie
 * @returns {String} SQL query
 */
function generateIndexesSQL(table) {
  if (!table.indexes || table.indexes.length === 0) {
    return '';
  }
  
  return table.indexes.map(index => {
    const columns = index.columns.map(col => `"${col}"`).join(', ');
    return `-- Aanmaken van index ${index.name}
CREATE INDEX IF NOT EXISTS ${index.name} ON ${table.schema}.${table.name} (${columns});
`;
  }).join('\n');
}

/**
 * Genereert SQL voor het aanmaken van RLS policies
 * @param {String} tableName - Naam van de tabel
 * @param {Array} policies - Array van policy configuraties
 * @returns {String} SQL query
 */
function generatePoliciesSQL(tableName, policies) {
  if (!policies || policies.length === 0) {
    return '';
  }
  
  let sql = `-- Inschakelen van Row Level Security voor ${tableName}
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

`;
  
  sql += policies.map(policy => {
    let policySQL = `-- Aanmaken van policy ${policy.name}
CREATE POLICY ${policy.name}
ON public.${tableName}
FOR ${policy.operation}
`;
    
    if (policy.definition) {
      policySQL += `USING (${policy.definition})`;
    }
    
    if (policy.check) {
      policySQL += `${policy.definition ? '\n' : ''}WITH CHECK (${policy.check})`;
    }
    
    policySQL += ';\n';
    
    return policySQL;
  }).join('\n');
  
  return sql;
}

/**
 * Genereert SQL voor het aanmaken van storage buckets
 * @param {String} bucketName - Naam van de bucket
 * @param {Object} bucket - Bucket configuratie
 * @returns {String} SQL query
 */
function generateStorageBucketSQL(bucketName, bucket) {
  return `-- Aanmaken van storage bucket ${bucketName}
INSERT INTO storage.buckets (id, name, public)
VALUES ('${bucket.name}', '${bucket.name}', ${bucket.public})
ON CONFLICT (id) DO UPDATE SET public = ${bucket.public};

`;
}

/**
 * Genereert SQL voor het aanmaken van storage bucket policies
 * @param {String} bucketName - Naam van de bucket
 * @param {Array} policies - Array van policy configuraties
 * @returns {String} SQL query
 */
function generateStoragePoliciesSQL(bucketName, policies) {
  if (!policies || policies.length === 0) {
    return '';
  }
  
  return policies.map(policy => {
    let policySQL = `-- Aanmaken van storage policy ${policy.name}
CREATE POLICY ${policy.name}
ON storage.objects
FOR ${policy.operation}
`;
    
    if (policy.definition) {
      policySQL += `USING (bucket_id = '${bucketName}' AND ${policy.definition})`;
    } else {
      policySQL += `USING (bucket_id = '${bucketName}')`;
    }
    
    if (policy.check) {
      policySQL += `${policy.definition ? '\n' : ''}WITH CHECK (bucket_id = '${bucketName}' AND ${policy.check})`;
    }
    
    policySQL += ';\n';
    
    return policySQL;
  }).join('\n');
}

/**
 * Genereert het volledige SQL script
 * @returns {String} SQL script
 */
function generateSQL() {
  let sql = `-- MarketPulse AI Supabase Setup
-- Gegenereerd op ${new Date().toISOString()}

-- Tabellen aanmaken
`;
  
  // Genereer SQL voor tabellen en indexes
  Object.values(config.tables).forEach(table => {
    sql += generateTableSQL(table);
    sql += generateIndexesSQL(table);
    sql += '\n';
  });
  
  // Genereer SQL voor RLS policies
  sql += `-- Row Level Security Policies
`;
  
  Object.keys(config.policies).forEach(tableName => {
    sql += generatePoliciesSQL(tableName, config.policies[tableName]);
    sql += '\n';
  });
  
  // Genereer SQL voor storage buckets
  sql += `-- Storage Buckets
`;
  
  Object.keys(config.storage).forEach(bucketName => {
    const bucket = config.storage[bucketName];
    sql += generateStorageBucketSQL(bucketName, bucket);
    sql += generateStoragePoliciesSQL(bucketName, bucket.policies);
    sql += '\n';
  });
  
  // Genereer SQL voor triggers en functies
  sql += `-- Triggers en functies
-- Functie voor het bijwerken van updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

`;

  // Maak triggers voor elke tabel met een updated_at kolom
  Object.values(config.tables).forEach(table => {
    if (table.columns.some(col => col.name === 'updated_at')) {
      sql += `-- Trigger voor het bijwerken van updated_at in ${table.name}
CREATE TRIGGER update_${table.name}_updated_at
BEFORE UPDATE ON ${table.schema}.${table.name}
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

`;
    }
  });
  
  return sql;
}

// Genereer SQL en schrijf naar bestand
const sql = generateSQL();
fs.writeFileSync(outputPath, sql);

console.log(`SQL script gegenereerd in ${outputPath}`);
