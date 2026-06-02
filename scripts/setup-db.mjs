import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eshcfbocdobjgcwcktik.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzaGNmYm9jZG9iamdjd2NrdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MTgwODIsImV4cCI6MjA5MDQ5NDA4Mn0.ZIaUQQq-c6CXsScxe5Lne4z6s7fEG_cCVO10hsu51z4'
);

// Check if tables exist by trying to insert a minimal row
const tables = ['posts', 'comments', 'reactions', 'follows'];
for (const name of tables) {
  const { error } = await supabase.from(name).select('*', { count: 'exact', head: true });
  if (error && error.code === 'PGRST205') {
    console.log(`${name}: NOT FOUND`);
  } else if (error) {
    console.log(`${name}: ${error.message}`);
  } else {
    console.log(`${name}: EXISTS`);
  }
}

// Check profiles columns by inserting a test row
const { data: existingProfiles } = await supabase.from('profiles').select('*').limit(1);
if (existingProfiles && existingProfiles.length > 0) {
  console.log('profiles columns:', Object.keys(existingProfiles[0]).join(', '));
} else {
  // Try to get column info by attempting an insert with known columns
  const { error: insertErr } = await supabase.from('profiles').insert({ fullname: '_test_' }).select();
  if (insertErr) {
    console.log('profiles insert error:', insertErr.message);
    // Parse the error to find column info
    if (insertErr.message?.includes('column')) {
      console.log('Likely columns needed');
    }
  }
}
