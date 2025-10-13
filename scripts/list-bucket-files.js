/**
 * List Files in Rosary Audio Bucket
 * Quick script to see what's actually in your Supabase bucket
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing credentials. Need EXPO_PUBLIC_SUPABASE_URL and service key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllFiles() {
  console.log('📂 Listing all files in rosary-audio bucket\n');
  
  // List root folders
  const { data: rootItems, error: rootError } = await supabase.storage
    .from('rosary-audio')
    .list('', { limit: 100 });

  if (rootError) {
    console.error('❌ Error listing root:', rootError.message);
    return;
  }

  console.log(`Root level (${rootItems.length} items):`);
  rootItems.forEach(item => {
    console.log(`  ${item.name}${!item.id ? '/' : ''}`);
  });

  // List each folder
  for (const item of rootItems) {
    if (!item.id) { // It's a folder
      console.log(`\n📁 Folder: ${item.name}/`);
      
      const { data: folderItems, error: folderError } = await supabase.storage
        .from('rosary-audio')
        .list(item.name, { limit: 100 });

      if (folderError) {
        console.error(`  ❌ Error: ${folderError.message}`);
        continue;
      }

      console.log(`  (${folderItems.length} files):`);
      folderItems.forEach(file => {
        const size = file.metadata?.size ? (file.metadata.size / 1024).toFixed(1) + ' KB' : 'unknown';
        console.log(`    ✓ ${file.name} (${size})`);
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Done listing files');
}

listAllFiles().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

