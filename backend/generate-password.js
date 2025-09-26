#!/usr/bin/env node
/**
 * Password hash generator utility
 * Usage: node generate-password.js [password]
 * If no password provided, prompts for input
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

async function generatePasswordHash(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log('\n🔐 Password Hash Generated:');
  console.log(hash);
  console.log('\n📝 Add this to your .env file:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('\n⚠️  Keep this hash secure and never share it!');
}

async function main() {
  const password = process.argv[2];
  
  if (password) {
    await generatePasswordHash(password);
    return;
  }

  // Prompt for password
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter admin password: ', async (password) => {
    if (!password || password.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      rl.close();
      return;
    }
    
    await generatePasswordHash(password);
    rl.close();
  });
}

main().catch(console.error);