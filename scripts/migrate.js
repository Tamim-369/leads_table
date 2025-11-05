const { spawn } = require('child_process');

console.log('🔄 Migrating existing data to normalize field names...');

const curl = spawn('curl', [
  '-X', 'POST',
  'http://localhost:3000/api/leads/migrate',
  '-H', 'Content-Type: application/json'
]);

curl.stdout.on('data', (data) => {
  console.log('✅ Response:', data.toString());
});

curl.stderr.on('data', (data) => {
  console.error('❌ Error:', data.toString());
});

curl.on('close', (code) => {
  if (code === 0) {
    console.log('🎉 Data migration completed successfully!');
  } else {
    console.log(`❌ Migration failed with code ${code}`);
  }
});