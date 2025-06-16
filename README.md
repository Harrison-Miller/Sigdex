# Sigdex

Sigdex is a modern Age of Sigmar army and unit browser, inspired by the idea of a 'pokedex' for Warhammer. It lets you quickly view unit stats, weapons, abilities, and keywords for any army, with a clean and mobile-friendly interface. Data is sourced from BSData.

## Features
- Browse all armies and select one to view its units
- View unit details: stats, weapons, abilities, and keywords
- Ability formatting: bold, italics, bullet points, and timing
- Local caching for fast reloads
- Favorites system for quick access
- Roadmap: Army rules and list building

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## Data Source
Sigdex reads from [BSData](https://github.com/BSData/age-of-sigmar-4th). Army files are mapped internally for easy access and are cached locally for performance.

## Roadmap
- [x] View unit rules
- [x] Favorites system
- [x] Local caching
- [ ] View army rules
- [ ] List building

---

This project uses Vue 3, TypeScript, Vite, Vue Router, and Vitest. Contributions and feedback are welcome!
