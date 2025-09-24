const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeSchema() {
  try {
    console.log('🔍 Analyzing Supabase database schema...\n');
    
    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return;
    }
    
    console.log('📋 Tables found:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name} (${table.table_type})`);
    });
    
    console.log('\n📊 Detailed table information:\n');
    
    for (const table of tables) {
      console.log(`🗂️  Table: ${table.table_name}`);
      console.log('─'.repeat(50));
      
      // Get columns for this table
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default, character_maximum_length')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)
        .order('ordinal_position');
      
      if (columnsError) {
        console.error(`Error fetching columns for ${table.table_name}:`, columnsError);
        continue;
      }
      
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        console.log(`  ${col.column_name}: ${col.data_type}${maxLength} ${nullable}${defaultVal}`);
      });
      
      // Get constraints (primary keys, foreign keys, etc.)
      const { data: constraints, error: constraintsError } = await supabase
        .from('information_schema.table_constraints')
        .select('constraint_name, constraint_type')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name);
      
      if (!constraintsError && constraints.length > 0) {
        console.log('\n  🔗 Constraints:');
        constraints.forEach(constraint => {
          console.log(`    ${constraint.constraint_type}: ${constraint.constraint_name}`);
        });
      }
      
      // Get foreign key details
      const { data: foreignKeys, error: fkError } = await supabase
        .from('information_schema.key_column_usage')
        .select('column_name, constraint_name')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)
        .not('constraint_name', 'is', null);
      
      if (!fkError && foreignKeys.length > 0) {
        console.log('\n  🔗 Foreign Keys:');
        foreignKeys.forEach(fk => {
          console.log(`    ${fk.column_name} -> ${fk.constraint_name}`);
        });
      }
      
      // Get row count
      try {
        const { count, error: countError } = await supabase
          .from(table.table_name)
          .select('*', { count: 'exact', head: true });
        
        if (!countError) {
          console.log(`\n  📈 Row count: ${count}`);
        }
      } catch (err) {
        console.log(`\n  📈 Row count: Unable to fetch (may require authentication)`);
      }
      
      console.log('\n');
    }
    
    // Check for RLS policies
    console.log('🔒 Row Level Security (RLS) Status:');
    console.log('─'.repeat(50));
    
    for (const table of tables) {
      try {
        const { data: rlsStatus, error: rlsError } = await supabase
          .from('pg_tables')
          .select('relrowsecurity')
          .eq('tablename', table.table_name)
          .eq('schemaname', 'public')
          .single();
        
        if (!rlsError && rlsStatus) {
          const isEnabled = rlsStatus.relrowsecurity;
          console.log(`  ${table.table_name}: ${isEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
        }
      } catch (err) {
        console.log(`  ${table.table_name}: Unable to check RLS status`);
      }
    }
    
    console.log('\n🎉 Schema analysis complete!');
    
  } catch (error) {
    console.error('❌ Error analyzing schema:', error);
  }
}

analyzeSchema();
