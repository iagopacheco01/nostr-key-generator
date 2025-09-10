import { getPublicKey, nip19 } from 'nostr-tools';
import { randomBytes } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

// ANSI escape sequences for colors and styles
const green = '\x1b[32m';
const cyan = '\x1b[36m';
const reset = '\x1b[0m'; // Reseta todas as configurações

// User directory
const homeDir = os.homedir();

// Generate random private key (32 bytes in Uint8Array)
const privateKeyBytes = randomBytes(32);
const privateKeyHex = Buffer.from(privateKeyBytes).toString('hex');

// Generate public key
const publicKeyBytes = getPublicKey(privateKeyBytes);
const publicKeyHex = Buffer.from(publicKeyBytes).toString('hex');

// Generate readable npub and nsec
const nsec = nip19.nsecEncode(privateKeyBytes);
const npub = nip19.npubEncode(publicKeyBytes);

console.log(`${cyan}Private Key (hex):${reset} ${privateKeyHex}`);
console.log(`${cyan}Public Key (hex):${reset} ${publicKeyHex}`);
console.log(`${cyan}nsec:${reset} ${nsec}`);
console.log(`${cyan}npub:${reset} ${npub}`);

// File paths
const privateKeyPath = path.join(homeDir, 'private.key');
const npubPath = path.join(homeDir, 'public.npub');

// Save private key (read-only for user)
fs.writeFileSync(privateKeyPath, nsec, { mode: 0o600 });

// Save npub (publicly readable)
fs.writeFileSync(npubPath, npub, { mode: 0o644 });

console.log(`\n${green}Chaves salvas em: (Keys saved to:)${reset}`);
console.log(`${cyan}Private key:${reset} ${privateKeyPath}`);
console.log(`${cyan}Public npub:${reset} ${npubPath}`);


