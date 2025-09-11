// ==========================================================
//
//  NostraKey - A Command-Line Nostr Key Tool
//  Version: 1.0.3
//  Description: CLI tool for generating, verifying and saving
//  Nostr keys (bech32 + hex). Secure defaults for saved files.
//  Author: Iago Pacheco
//  License: MIT
//
// ==========================================================

// This import is 100% compatible with nostr-tools@1.17.0
import inquirer from 'inquirer';
import { getPublicKey, nip19, nip06 } from 'nostr-tools';
import { randomBytes } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

// --- COLORS & CONFIG ---
const green = '\x1b[32m', cyan = '\x1b[36m', red = '\x1b[31m', yellow = '\x1b[33m', redBold = '\x1b[31;1m', reset = '\x1b[0m';
const homeDir = os.homedir();

const locales = {
  pt: {
    lang_choice: 'Escolha seu idioma:',
    menu_title: 'O que você gostaria de fazer?',
    options: {
      generate: '1) Gerar um novo par de chaves (aleatório)',
      generate_seed: '2) Gerar chaves de uma nova SEED (BIP39)',
      vanity: '3) Gerar chaves com um prefixo (vanity key)',
      verify: '4) Verificar uma chave (npub/nsec)',
      exit: '5) Sair'
    },
    generate_success: 'Chaves geradas e salvas com sucesso!',
    private_key_hex: 'Chave Privada (hex)',
    public_key_hex: 'Chave Pública (hex)',
    nsec: 'nsec',
    npub: 'npub',
    keys_saved_to: 'Chaves salvas em:',
    private_key_path: 'Chave privada (nsec)',
    private_hex_path: 'Chave privada (hex)',
    public_npub_path: 'Npub público',
    public_hex_path: 'Chave pública (hex)',
    seed_phrase_title: 'Sua nova seed phrase de 12 palavras:',
    seed_warning: 'IMPORTANTE: Anote estas palavras em ordem e guarde-as em um local seguro. Elas são a única forma de recuperar suas chaves.',
    vanity_prompt: "Digite o prefixo desejado (ex: iago). Quanto maior, mais demorado:",
    vanity_searching: "Procurando por um npub que comece com '{}'... Isso pode levar muito tempo.",
    vanity_attempts: 'Tentativas',
    vanity_found: 'Chave encontrada após {} tentativas!',
    vanity_validate: 'Prefixo só pode conter letras minúsculas e números.',
    verify_prompt: 'Insira a chave (npub ou nsec) para verificar:',
    verify_valid: 'A chave é VÁLIDA.',
    verify_type: 'Tipo',
    verify_hex: 'Valor (hex)',
    verify_invalid: 'ERRO: A chave fornecida é INVÁLIDA ou está em um formato incorreto.',
    exit_message: 'Saindo. Até logo!'
  },
  en: {
    lang_choice: 'Choose your language:',
    menu_title: 'What would you like to do?',
    options: {
      generate: '1) Generate a new key pair (random)',
      generate_seed: '2) Generate keys from a new SEED (BIP39)',
      vanity: '3) Generate a key with a prefix (vanity key)',
      verify: '4) Verify a key (npub/nsec)',
      exit: '5) Exit'
    },
    generate_success: 'Keys generated and saved successfully!',
    private_key_hex: 'Private Key (hex)',
    public_key_hex: 'Public Key (hex)',
    nsec: 'nsec',
    npub: 'npub',
    keys_saved_to: 'Keys saved to:',
    private_key_path: 'Private key (nsec)',
    private_hex_path: 'Private key (hex)',
    public_npub_path: 'Public npub',
    public_hex_path: 'Public key (hex)',
    seed_phrase_title: 'Your new 12-word seed phrase:',
    seed_warning: 'IMPORTANT: Write these words down in order and store them in a safe place. They are the only way to recover your keys.',
    vanity_prompt: 'Enter the desired prefix (e.g., iago, satoshi). The longer it is, the longer it takes:',
    vanity_searching: "Searching for an npub starting with '{}'... This may take a very long time.",
    vanity_attempts: 'Attempts',
    vanity_found: 'Key found after {} attempts!',
    vanity_validate: 'Prefix can only contain lowercase letters and numbers.',
    verify_prompt: 'Enter the key (npub or nsec) to verify:',
    verify_valid: 'The key is VALID.',
    verify_type: 'Type',
    verify_hex: 'Value (hex)',
    verify_invalid: 'ERROR: The provided key is INVALID or in a wrong format.',
    exit_message: 'Exiting. Goodbye!'
  }
};

let t = locales.en;

// --- BANNER ---
function showBanner() {
  console.log('\n' + '='.repeat(50));
  console.log(`${green}       🔑  NostraKey  🔑${reset}`);
  console.log(`${yellow}--- Command-Line Nostr Key Tool ---${reset}`);
  console.log('='.repeat(50) + '\n');
}

// --- HELPERS ---
function toHexIfNeeded(value) {
  if (typeof value === 'string') return value;
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) return Buffer.from(value).toString('hex');
  if (value instanceof Uint8Array || Array.isArray(value)) return Buffer.from(value).toString('hex');
  return String(value);
}

function ensureMnemonicString(m) {
  if (Array.isArray(m)) return m.join(' ');
  return String(m);
}

function safeWriteFileSync(filePath, content, mode = 0o600) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  fs.writeFileSync(filePath, content, { mode });
}

// --- LOGIC FUNCTIONS ---
function saveKeys(nsec, npub, privateKeyHex, publicKeyHex) {
  const privateKeyPath = path.join(homeDir, 'private.key');
  const privateHexPath = path.join(homeDir, 'private.hex');
  const npubPath = path.join(homeDir, 'public.npub');
  const publicHexPath = path.join(homeDir, 'public.hex');

  safeWriteFileSync(privateKeyPath, nsec, 0o600);
  safeWriteFileSync(privateHexPath, privateKeyHex, 0o600);
  safeWriteFileSync(npubPath, npub, 0o644);
  safeWriteFileSync(publicHexPath, publicKeyHex, 0o644);

  console.log(`\n${green}${t.keys_saved_to}${reset}`);
  console.log(`${cyan}${t.private_key_path}:${reset} ${privateKeyPath}`);
  console.log(`${cyan}${t.private_hex_path}:${reset} ${privateHexPath}`);
  console.log(`${cyan}${t.public_npub_path}:${reset} ${npubPath}`);
  console.log(`${cyan}${t.public_hex_path}:${reset} ${publicHexPath}`);
}

function generateRandomKeys() {
  const privateKeyBytes = randomBytes(32);
  const privateKeyHex = Buffer.from(privateKeyBytes).toString('hex');
  const publicKeyHex = getPublicKey(privateKeyHex);
  const nsec = nip19.nsecEncode(privateKeyHex);
  const npub = nip19.npubEncode(publicKeyHex);

  console.log(`\n${cyan}${t.private_key_hex}:${reset} ${privateKeyHex}`);
  console.log(`${cyan}${t.public_key_hex}:${reset} ${publicKeyHex}`);
  console.log(`${cyan}${t.nsec}:${reset} ${nsec}`);
  console.log(`${cyan}${t.npub}:${reset} ${npub}`);
  return { nsec, npub, privateKeyHex, publicKeyHex };
}

function generateFromSeed() {
  const mnemonic = nip06.generateSeedWords();
  const mnemonicStr = ensureMnemonicString(mnemonic);

  let privateKeyRaw = nip06.privateKeyFromSeedWords(mnemonic);
  const privateKeyHex = toHexIfNeeded(privateKeyRaw);
  const publicKeyHex = getPublicKey(privateKeyHex);

  const nsec = nip19.nsecEncode(privateKeyHex);
  const npub = nip19.npubEncode(publicKeyHex);

  console.log(`\n${yellow}------------------------------------------------------${reset}`);
  console.log(`${cyan}${t.seed_phrase_title}${reset}\n${green}${mnemonicStr}${reset}`);
  console.log(`\n${redBold}${t.seed_warning}${reset}`);
  console.log(`${yellow}------------------------------------------------------${reset}`);

  console.log(`\n${cyan}${t.private_key_hex}:${reset} ${privateKeyHex}`);
  console.log(`${cyan}${t.public_key_hex}:${reset} ${publicKeyHex}`);
  console.log(`${cyan}${t.nsec}:${reset} ${nsec}`);
  console.log(`${cyan}${t.npub}:${reset} ${npub}`);
  return { nsec, npub, privateKeyHex, publicKeyHex };
}

function generateVanityKeys(prefix) {
  console.log(cyan + t.vanity_searching.replace("{}", prefix) + reset);
  const targetStart = `npub1${prefix}`;
  for (let attempts = 1; ; attempts++) {
    if (attempts % 10000 === 0) process.stdout.write(`\r${cyan}${t.vanity_attempts}: ${attempts.toLocaleString()}${reset}`);

    const privateKeyBytes = randomBytes(32);
    const privateKeyHex = Buffer.from(privateKeyBytes).toString('hex');
    const publicKeyHex = getPublicKey(privateKeyHex);

    const npub = nip19.npubEncode(publicKeyHex);
    if (npub.startsWith(targetStart)) {
      process.stdout.write('\r' + ' '.repeat(50) + '\r');
      console.log(green + t.vanity_found.replace('{}', attempts.toLocaleString()) + reset);

      const nsec = nip19.nsecEncode(privateKeyHex);

      console.log(`\n${cyan}${t.private_key_hex}:${reset} ${privateKeyHex}`);
      console.log(`${cyan}${t.public_key_hex}:${reset} ${publicKeyHex}`);
      console.log(`${cyan}${t.nsec}:${reset} ${nsec}`);
      console.log(`${cyan}${t.npub}:${reset} ${npub}`);
      return { nsec, npub, privateKeyHex, publicKeyHex };
    }
  }
}

function verifyKey(key) {
  try {
    const decoded = nip19.decode(key.trim());
    let data = decoded.data;
    if (typeof data !== 'string') {
      data = toHexIfNeeded(data);
    }
    console.log(`\n${green}${t.verify_valid}${reset}`);
    console.log(`${cyan}${t.verify_type}:${reset} ${decoded.type}`);
    console.log(`${cyan}${t.verify_hex}:${reset} ${data}`);
  } catch (error) {
    console.error(`\n${red}${t.verify_invalid}${reset}`);
  }
}

// --- MAIN MENU ---
async function mainMenu() {
  showBanner(); // exibe o banner no início

  const { lang } = await inquirer.prompt([
    {
      type: 'list',
      name: 'lang',
      message: `${locales.en.lang_choice} / ${locales.pt.lang_choice}`,
      choices: ['English', 'Português']
    }
  ]);
  t = lang === 'English' ? locales.en : locales.pt;

  while (true) {
    console.log('\n' + '-'.repeat(50));
    const optionKeys = Object.keys(t.options);
    const optionVals = Object.values(t.options);
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: t.menu_title,
      choices: optionVals.map((opt, i) => ({ name: opt, value: optionKeys[i] })),
      loop: false
    }]);

    let keys;
    switch (action) {
      case 'generate':
        keys = generateRandomKeys();
        saveKeys(keys.nsec, keys.npub, keys.privateKeyHex, keys.publicKeyHex);
        break;
      case 'generate_seed':
        keys = generateFromSeed();
        saveKeys(keys.nsec, keys.npub, keys.privateKeyHex, keys.publicKeyHex);
        break;
      case 'vanity': {
        const { prefix } = await inquirer.prompt({
          type: 'input',
          name: 'prefix',
          message: t.vanity_prompt,
          validate: (i) => /^[a-z0-9]+$/.test(i) ? true : t.vanity_validate
        });
        keys = generateVanityKeys(prefix);
        saveKeys(keys.nsec, keys.npub, keys.privateKeyHex, keys.publicKeyHex);
        break;
      }
      case 'verify': {
        const { key } = await inquirer.prompt({ type: 'input', name: 'key', message: t.verify_prompt });
        verifyKey(key);
        break;
      }
      case 'exit':
        console.log(`\n${green}${t.exit_message}${reset}`);
        return;
      default:
        console.log(`${red}Unknown option${reset}`);
    }
  }
}

// Run
mainMenu().catch(err => {
  console.error('\n' + red + 'Fatal error:' + reset, err);
  process.exit(1);
});

