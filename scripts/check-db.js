const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://tamimtest103_db_user:pichonedimu!!@cluster0.az2lptz.mongodb.net/?appName=Cluster0";

async function checkDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Check fb_leads database
    const db = client.db('fb_leads');
    const collections = await db.listCollections().toArray();
    
    console.log('\nCollections in fb_leads database:');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
      
      if (count > 0 && count <= 5) {
        // Show sample documents for small collections
        const samples = await db.collection(collection.name).find({}).limit(2).toArray();
        console.log(`  Sample documents:`, samples.map(doc => ({
          _id: doc._id,
          advertiser: doc.advertiser,
          service: doc.service
        })));
      }
    }
    
    // Also check the default database (test)
    const testDb = client.db('test');
    const testCollections = await testDb.listCollections().toArray();
    
    if (testCollections.length > 0) {
      console.log('\nCollections in test database:');
      for (const collection of testCollections) {
        const count = await testDb.collection(collection.name).countDocuments();
        console.log(`- ${collection.name}: ${count} documents`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkDatabase();