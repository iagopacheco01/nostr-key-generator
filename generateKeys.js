import inquirer from 'inquirer';
// FINAL VERSION: This import is 100% compatible with nostr-tools@1.17.0
import { getPublicKey, nip19, nip06 } from 'nostr-tools'; 
import { randomBytes } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

// --- HOME: CONSTANTS AND CONFIGURATION ---
const green = '\x1b[32m', cyan = '\x1b[36m', red = '\x1b[31m', yellow = '\x1b[33m', redBold = '\x1b[31;1m', reset = '\x1b[0m';
const homeDir = os.homedir();
const locales = {
  pt: {"lang_choice":"Escolha seu idioma:","menu_title":"O que você gostaria de fazer?","options":{"generate":"1) Gerar um novo par de chaves (aleatório)","generate_seed":"2) Gerar chaves de uma nova SEED (BIP39)","vanity":"3) Gerar chaves com um prefixo (vanity key)","verify":"4) Verificar uma chave (npub/nsec)","exit":"5) Sair"},"generate_success":"Chaves geradas e salvas com sucesso!","private_key_hex":"Chave Privada (hex)","public_key_hex":"Chave Pública (hex)","nsec":"nsec","npub":"npub","keys_saved_to":"Chaves salvas em:","private_key_path":"Chave privada","public_npub_path":"Npub público","seed_phrase_title":"Sua nova seed phrase de 12 palavras:","seed_warning":"IMPORTANTE: Anote estas palavras em ordem e guarde-as em um local seguro. Elas são a única forma de recuperar suas chaves.","vanity_prompt":"Digite o prefixo desejado (ex: iago, satoshi). Quanto mais longo, mais demorado:","vanity_searching":"Procurando por um npub que comece com '{}'... Isso pode levar muito tempo.","vanity_attempts":"Tentativas","vanity_found":"Chave encontrada após {} tentativas!","verify_prompt":"Insira a chave (npub ou nsec) para verificar:","verify_valid":"A chave é VÁLIDA.","verify_type":"Tipo","verify_hex":"Valor (hex)","verify_invalid":"ERRO: A chave fornecida é INVÁLIDA ou está em um formato incorreto.","exit_message":"Saindo. Até logo!"},
  en: {"lang_choice":"Choose your language:","menu_title":"What would you like to do?","options":{"generate":"1) Generate a new key pair (random)","generate_seed":"2) Generate keys from a new SEED (BIP39)","vanity":"3) Generate a key with a prefix (vanity key)","verify":"4) Verify a key (npub/nsec)","exit":"5) Exit"},"generate_success":"Keys generated and saved successfully!","private_key_hex":"Private Key (hex)","public_key_hex":"Public Key (hex)","nsec":"nsec","npub":"npub","keys_saved_to":"Keys saved to:","private_key_path":"Private key","public_npub_path":"Public npub","seed_phrase_title":"Your new 12-word seed phrase:","seed_warning":"IMPORTANT: Write these words down in order and store them in a safe place. They are the only way to recover your keys.","vanity_prompt":"Enter the desired prefix (e.g., iago, satoshi). The longer it is, the longer it takes:","vanity_searching":"Searching for an npub starting with '{}'... This may take a very long time.","vanity_attempts":"Attempts","vanity_found":"Key found after {} attempts!","verify_prompt":"Enter the key (npub or nsec) to verify:","verify_valid":"The key is VALID.","verify_type":"Type","verify_hex":"Value (hex)","verify_invalid":"ERROR: The provided key is INVALID or in a wrong format.","exit_message":"Exiting. Goodbye!"}
};
let t = locales.en;

// --- LOGIC FUNCTIONS ---
function saveKeys(nsec, npub) {
  const privateKeyPath = path.join(homeDir, 'private.key');
  const npubPath = path.join(homeDir, 'public.npub');
  fs.writeFileSync(privateKeyPath, nsec, { mode: 0o600 });
  fs.writeFileSync(npubPath, npub, { mode: 0o644 });
  console.log(`\n${green}${t.keys_saved_to}${reset}\n${cyan}${t.private_key_path}:${reset} ${privateKeyPath}\n${cyan}${t.public_npub_path}:${reset} ${npubPath}`);
}
function generateRandomKeys() {
  const privateKeyBytes = randomBytes(32);
  const privateKeyHex = Buffer.from(privateKeyBytes).toString('hex');
  const publicKeyBytes = getPublicKey(privateKeyBytes);
  const nsec = nip19.nsecEncode(privateKeyBytes);
  const npub = nip19.npubEncode(publicKeyBytes);
  console.log(`\n${cyan}${t.private_key_hex}:${reset} ${privateKeyHex}\n${cyan}${t.nsec}:${reset} ${nsec}\n${cyan}${t.npub}:${reset} ${npub}`);
  return { nsec, npub };
}
function generateFromSeed() {
  // FINAL VERSION: Using nip06, compatible with v1.17.0
  const mnemonic = nip06.generateSeedWords();
  const privateKeyBytes = nip06.privateKeyFromSeedWords(mnemonic);
  const privateKeyHex = Buffer.from(privateKeyBytes).toString('hex');
  const nsec = nip19.nsecEncode(privateKeyBytes);
  const npub = nip19.npubEncode(getPublicKey(privateKeyBytes));
  console.log(`\n${yellow}------------------------------------------------------${reset}`);
  console.log(`${cyan}${t.seed_phrase_title}${reset}\n${green}${mnemonic}${reset}`);
  console.log(`\n${redBold}${t.seed_warning}${reset}`);
  console.log(`${yellow}------------------------------------------------------${reset}`);
  console.log(`\n${cyan}${t.private_key_hex}:${reset} ${privateKeyHex}\n${cyan}${t.nsec}:${reset} ${nsec}\n${cyan}${t.npub}:${reset} ${npub}`);
  return { nsec, npub };
}
function generateVanityKeys(prefix) {
    console.log(cyan + t.vanity_searching.replace('{}', prefix) + reset);
    for (let attempts = 1; ; attempts++) {
      if (attempts % 10000 === 0) process.stdout.write(`\r${cyan}${t.vanity_attempts}: ${attempts.toLocaleString()}${reset}`);
      const privateKeyBytes = randomBytes(32);
      const publicKeyBytes = getPublicKey(privateKeyBytes);
      const npub = nip19.npubEncode(publicKeyBytes);
      if (npub.startsWith(`npub1${prefix}`)) {
        process.stdout.write('\r' + ' '.repeat(50) + '\r');
        console.log(green + t.vanity_found.replace('{}', attempts.toLocaleString()) + reset);
        const privateKeyHex = Buffer.from(privateKeyBytes).toString('hex');
        const nsec = nip19.nsecEncode(privateKeyBytes);
        console.log(`\n${cyan}${t.private_key_hex}:${reset} ${privateKeyHex}\n${cyan}${t.nsec}:${reset} ${nsec}\n${cyan}${t.npub}:${reset} ${npub}`);
        return { nsec, npub };
      }
    }
}
function verifyKey(key) {
    try {
      const decoded = nip19.decode(key.trim());
      console.log(`\n${green}${t.verify_valid}${reset}\n${cyan}${t.verify_type}:${reset} ${decoded.type}\n${cyan}${t.verify_hex}:${reset} ${decoded.data}`);
    } catch (error) {
      console.error(`\n${red}${t.verify_invalid}${reset}`);
    }
}

// --- MAIN MENU LOGIC ---
async function mainMenu() {
    const { lang } = await inquirer.prompt([ { type: 'list', name: 'lang', message: 'Choose your language / Escolha seu idioma:', choices: ['English', 'Português'] } ]);
    t = lang === 'English' ? locales.en : locales.pt;
    while (true) {
        console.log('\n' + '-'.repeat(50));
        const { action } = await inquirer.prompt([{ type: 'list', name: 'action', message: t.menu_title, choices: Object.values(t.options).map((opt, i) => ({ name: opt, value: Object.keys(t.options)[i] })), loop: false }]);
        let keys;
        switch (action) {
          case 'generate': keys = generateRandomKeys(); saveKeys(keys.nsec, keys.npub); break;
          case 'generate_seed': keys = generateFromSeed(); saveKeys(keys.nsec, keys.npub); break;
          case 'vanity': const { prefix } = await inquirer.prompt({ type: 'input', name: 'prefix', message: t.vanity_prompt, validate: (i) => /^[a-z0-9]+$/.test(i) ? true : 'Prefix can only contain lowercase letters and numbers.' }); keys = generateVanityKeys(prefix); saveKeys(keys.nsec, keys.npub); break;
          case 'verify': const { key } = await inquirer.prompt({ type: 'input', name: 'key', message: t.verify_prompt }); verifyKey(key); break;
          case 'exit': console.log(`\n${green}${t.exit_message}${reset}`); return;
        }
    }
}

mainMenu();
