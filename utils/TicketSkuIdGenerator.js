// utils/ticketIdGenerator.js
// const { customAlphabet } = require('nanoid');
 

// // Base58 characters (no confusing 0/O, 1/l, etc.)
// const base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
// const generateTicketSKUId = customAlphabet(base58, 14); // Exactly 14 chars

// module.exports = generateTicketSKUId;




// utils/ticketIdGenerator.js

// Base58 characters (no confusing 0/O, 1/l, etc.)
const base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Export a function that returns a promise resolving to the generator
async function getTicketSKUIdGenerator() {
  const { customAlphabet } = await import('nanoid');
  return customAlphabet(base58, 14); // Exactly 14 chars
}

// Usage example:
module.exports = getTicketSKUIdGenerator;
