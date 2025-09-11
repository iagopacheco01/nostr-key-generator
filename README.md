# 🔑  NostraKey - A Command-Line Nostr Key Tool

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-latest-blue)](https://www.npmjs.com/)

This repository contains a **Node.js** script that generates **private and public keys** for the [Nostr](https://nostr.com/) network.
The keys are generated in the following formats:

- **Hexadecimal**
- **nsec**
- **npub**

The keys are automatically saved as files in the user's directory.

✨ Features

    Interactive Menu: Easily navigate through all available options.

    Multi-language Support: Full support for both English and Portuguese.

    Random Generation: Create a new, completely random key pair.

    Seed Phrase Generation (BIP39): Generate keys from a 12-word mnemonic seed phrase for easy backup and recovery.

    Vanity Key Generation: Find a key pair with a custom prefix (e.g., npub1iago...).

    Key Verification: Validate any existing nsec or npub key.

    Secure Saving: Generated keys are automatically saved with secure file permissions in your user's home directory.

---

## 📦 Prerequisites

Before getting started, make sure you have installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

Check your installation:

```bash
node -v
npm -v
```

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/iagopacheco01/nostr-key-generator
cd nostr-key-generator
```

Install dependencies:

```bash
npm install
```

## ⚡ Usage

To generate your Nostr keys:

```bash
node generateKeys.js
```

The script will create files containing:

- Private key (hexadecimal and nsec)
- Public key (hexadecimal and npub)

The files will be saved in the current directory.

## 📁 Project Structure

```
nostr-key-generator/
├── generateKeys.js      # Main script
├── package.json         # Project dependencies and information
└── README.md            # Project documentation
```

## 📝 Notes

- Your 12-word seed phrase is your ultimate backup. Treat it with the same security as your private key. Store it offline and never share it.

- Generating vanity keys is computationally intensive. Prefixes longer than 4-5 characters can take a very long time to find.

- While the tool outputs hexadecimal keys, the nsec format is the modern standard for importing private keys into most Nostr clients.

- The npub format is your public address and is safe to share publicly.

## 📌 Quick Commands

```bash
# Clone repository
git clone https://github.com/iagopacheco01/nostr-key-generator
# Navigate into project folder
cd nostr-key-generator

# Install dependencies
npm install

# Generate keys
node generateKeys.js
```
