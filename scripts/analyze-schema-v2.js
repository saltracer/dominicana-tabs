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
    
    // Try to get tables by attempting to query common table names
    const commonTables = [
      'profiles', 'users', 'books', 'bookmarks', 'reading_progress', 
      'reading_progresses', 'user_profiles', 'ebooks', 'library',
      'auth', 'public', 'supabase'
    ];
    
    const foundTables = [];
    
    console.log('🔍 Checking for common tables...\n');
    
    for (const tableName of commonTables) {
      try {
        // Try to get a single row to see if table exists
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .limit(1);
        
        if (!error) {
          foundTables.push({
            name: tableName,
            count: count || 0,
            accessible: true
          });
          console.log(`✅ Found table: ${tableName} (${count || 0} rows)`);
        } else if (error.code === 'PGRST116') {
          // Table doesn't exist
          console.log(`❌ Table not found: ${tableName}`);
        } else {
          console.log(`⚠️  Table ${tableName} exists but has access issues: ${error.message}`);
          foundTables.push({
            name: tableName,
            count: 0,
            accessible: false,
            error: error.message
          });
        }
      } catch (err) {
        console.log(`❌ Error checking table ${tableName}: ${err.message}`);
      }
    }
    
    console.log('\n📊 Detailed analysis of accessible tables:\n');
    
    for (const table of foundTables.filter(t => t.accessible)) {
      console.log(`🗂️  Table: ${table.name}`);
      console.log('─'.repeat(50));
      
      try {
        // Get a sample row to understand the structure
        const { data: sampleData, error: sampleError } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);
        
        if (!sampleError && sampleData && sampleData.length > 0) {
          console.log('📋 Sample data structure:');
          const sample = sampleData[0];
          Object.keys(sample).forEach(key => {
            const value = sample[key];
            const type = typeof value;
            const isNull = value === null;
            const isArray = Array.isArray(value);
            const displayType = isArray ? 'array' : type;
            const displayValue = isNull ? 'null' : 
                               isArray ? `[${value.length} items]` :
                               type === 'string' && value.length > 50 ? 
                               `"${value.substring(0, 50)}..."` : 
                               JSON.stringify(value);
            
            console.log(`  ${key}: ${displayType} = ${displayValue}`);
          });
        } else {
          console.log('📋 No sample data available (table is empty or inaccessible)');
        }
        
        // Try to get all columns by selecting all and seeing what comes back
        const { data: allData, error: allError } = await supabase
          .from(table.name)
          .select('*')
          .limit(0);
        
        if (!allError) {
          console.log('\n📝 Table appears to be accessible for queries');
        }
        
      } catch (err) {
        console.log(`❌ Error analyzing table ${table.name}: ${err.message}`);
      }
      
      console.log('\n');
    }
    
    // Check authentication status
    console.log('🔐 Authentication Status:');
    console.log('─'.repeat(50));
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('❌ Not authenticated (this is normal for anonymous access)');
    } else if (user) {
      console.log(`✅ Authenticated as: ${user.email}`);
    } else {
      console.log('ℹ️  Anonymous access (no user session)');
    }
    
    console.log('\n🎉 Schema analysis complete!');
    console.log('\n💡 Next steps:');
    console.log('1. Review the table structures above');
    console.log('2. Update the TypeScript types to match your schema');
    console.log('3. Update the hooks to work with your existing tables');
    
  } catch (error) {
    console.error('❌ Error analyzing schema:', error);
  }
}

analyzeSchema();
