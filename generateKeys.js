import { getPublicKey, nip19 } from 'nostr-tools';
import { randomBytes } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Diretório do usuário
const homeDir = os.homedir();

// Gerar private key aleatória (32 bytes em Uint8Array)
const privateKeyBytes = randomBytes(32);
const privateKeyHex = Buffer.from(privateKeyBytes).toString('hex');

// Gerar chave pública
const publicKeyBytes = getPublicKey(privateKeyBytes);
const publicKeyHex = Buffer.from(publicKeyBytes).toString('hex');

// Gerar npub e nsec legíveis
const nsec = nip19.nsecEncode(privateKeyBytes);
const npub = nip19.npubEncode(publicKeyBytes);

console.log("Private Key (hex):", privateKeyHex);
console.log("Public Key (hex):", publicKeyHex);
console.log("nsec:", nsec);
console.log("npub:", npub);

// Caminhos dos arquivos
const privateKeyPath = path.join(homeDir, 'private.key');
const npubPath = path.join(homeDir, 'public.npub');

// Salvar private key (apenas leitura para o usuário)
fs.writeFileSync(privateKeyPath, nsec, { mode: 0o600 });

// Salvar npub (legível publicamente)
fs.writeFileSync(npubPath, npub, { mode: 0o644 });

console.log(`\nChaves salvas em:\nPrivate key: ${privateKeyPath}\nPublic npub: ${npubPath}`);


