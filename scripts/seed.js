const { spawn } = require('child_process');

console.log('🌱 Seeding database with sample data...');

const curl = spawn('curl', [
  '-X', 'POST',
  'http://localhost:3000/api/leads/seed',
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
    console.log('🎉 Database seeded successfully!');
  } else {
    console.log(`❌ Seeding failed with code ${code}`);
  }
});