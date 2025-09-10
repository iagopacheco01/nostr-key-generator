import { getPublicKey, nip19 } from 'nostr-tools';
import { randomBytes } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

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

console.log("Private Key (hex):", privateKeyHex);
console.log("Public Key (hex):", publicKeyHex);
console.log("nsec:", nsec);
console.log("npub:", npub);

// File paths
const privateKeyPath = path.join(homeDir, 'private.key');
const npubPath = path.join(homeDir, 'public.npub');

// Save private key (read-only for user)
fs.writeFileSync(privateKeyPath, nsec, { mode: 0o600 });

// Save npub (publicly readable)
fs.writeFileSync(npubPath, npub, { mode: 0o644 });

console.log(`\nChaves salvas em: (Keys saved to:)\nPrivate key: ${privateKeyPath}\nPublic npub: ${npubPath}`);


