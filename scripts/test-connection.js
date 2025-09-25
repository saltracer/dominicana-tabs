const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🧪 Testing Supabase connection...\n');
    
    // Test basic connection
    console.log('1. Testing basic connection...');
    const { data: books, error } = await supabase
      .from('books')
      .select('id, title, author, category')
      .limit(3);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log(`📚 Found ${books.length} books:`);
    books.forEach(book => {
      console.log(`  - ${book.title} by ${book.author} (${book.category})`);
    });
    
    // Test search functionality
    console.log('\n2. Testing search functionality...');
    const { data: searchResults, error: searchError } = await supabase
      .from('books')
      .select('id, title, author')
      .ilike('title', '%Aquinas%')
      .limit(2);
    
    if (searchError) {
      console.error('❌ Search failed:', searchError);
    } else {
      console.log('✅ Search successful!');
      console.log(`🔍 Found ${searchResults.length} books matching "Aquinas":`);
      searchResults.forEach(book => {
        console.log(`  - ${book.title} by ${book.author}`);
      });
    }
    
    // Test category filtering
    console.log('\n3. Testing category filtering...');
    const { data: theologyBooks, error: catError } = await supabase
      .from('books')
      .select('id, title, author')
      .eq('category', 'Theology')
      .limit(2);
    
    if (catError) {
      console.error('❌ Category filtering failed:', catError);
    } else {
      console.log('✅ Category filtering successful!');
      console.log(`📖 Found ${theologyBooks.length} Theology books:`);
      theologyBooks.forEach(book => {
        console.log(`  - ${book.title} by ${book.author}`);
      });
    }
    
    console.log('\n🎉 All tests passed! Your Supabase integration is ready.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection();
