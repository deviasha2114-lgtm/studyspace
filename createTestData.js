const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Read .env file to get JWT_SECRET
const envPath = path.resolve(__dirname, '.env');
const envBuffer = fs.readFileSync(envPath, 'utf8');
const envLines = envBuffer.split('\n');
let jwtSecret = '';

for (const line of envLines) {
  if (line.startsWith('JWT_SECRET=')) {
    let value = line.substring('JWT_SECRET='.length).trim();
    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    jwtSecret = value;
    break;
  }
}

if (!jwtSecret) {
  console.error('JWT_SECRET not found in .env file');
  process.exit(1);
}

console.log('Using JWT_SECRET (length:', jwtSecret.length, ')', JSON.stringify(jwtSecret));

async function main() {
  const timestamp = Date.now();
  
  // Create a test user
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: `test${timestamp}@example.com`,
      bio: 'This is a test user for AI endpoint testing'
    }
  });

  console.log('Created user:', user.id);

  // Create a test community for the note
  const community = await prisma.community.create({
    data: {
      name: `Test Community ${timestamp}`,
      slug: `test-community-${timestamp}`,
      description: 'A test community for testing purposes'
    }
  });

  console.log('Created community:', community.id);

  // Create a test note for the user in the community
  const note = await prisma.note.create({
    data: {
      title: 'Test Note for AI',
      content: 'This is a sample note about machine learning. Machine learning is a subset of artificial intelligence that focuses on building systems that learn from data. Key concepts include supervised learning, unsupervised learning, and reinforcement learning.',
      status: 'APPROVED',
      authorId: user.id,
      communityId: community.id
    }
  });

  console.log('Created note:', note.id);

  // Generate JWT token
  const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });

  console.log('Generated token:', token);

  await prisma.$disconnect();
  
  // Return values for testing
  return { userId: user.id, noteId: note.id, token };
}

main().then(result => {
  console.log('\n=== TEST RESULTS ===');
  console.log('User ID:', result.userId);
  console.log('Note ID:', result.noteId);
  console.log('Token:', result.token);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
