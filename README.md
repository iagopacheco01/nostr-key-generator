# 🔑 Nostr Key Generator (Node.js)

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-latest-blue)](https://www.npmjs.com/)

This repository contains a **Node.js** script that generates **private and public keys** for the [Nostr](https://nostr.com/) network.
The keys are generated in the following formats:

- **Hexadecimal**
- **nsec**
- **npub**

The keys are automatically saved as files in the user's directory.

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

- Never share your private keys.
- Use the `nsec` format to import keys into compatible Nostr clients.
- The `npub` format is safe to share publicly.

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
