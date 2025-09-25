const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getBooksSample() {
  try {
    console.log('📚 Fetching sample books from your database...\n');
    
    // Get a few sample books to understand the structure
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error fetching books:', error);
      return;
    }
    
    console.log(`Found ${books.length} sample books:\n`);
    
    books.forEach((book, index) => {
      console.log(`📖 Book ${index + 1}:`);
      console.log('─'.repeat(40));
      Object.keys(book).forEach(key => {
        const value = book[key];
        const type = typeof value;
        const isNull = value === null;
        const isArray = Array.isArray(value);
        const displayType = isArray ? 'array' : type;
        const displayValue = isNull ? 'null' : 
                           isArray ? `[${value.length} items]` :
                           type === 'string' && value.length > 100 ? 
                           `"${value.substring(0, 100)}..."` : 
                           JSON.stringify(value);
        
        console.log(`  ${key}: ${displayType} = ${displayValue}`);
      });
      console.log('\n');
    });
    
    // Get all unique categories
    const { data: categories, error: catError } = await supabase
      .from('books')
      .select('category')
      .not('category', 'is', null);
    
    if (!catError && categories) {
      const uniqueCategories = [...new Set(categories.map(c => c.category))];
      console.log('📂 Available categories:');
      uniqueCategories.forEach(cat => console.log(`  - ${cat}`));
    }
    
    console.log('\n🎉 Books analysis complete!');
    
  } catch (error) {
    console.error('❌ Error analyzing books:', error);
  }
}

getBooksSample();
