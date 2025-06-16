# Sigdex

Sigdex is an Age of Sigmar utility app for viewing unit rules. In the future, we will add support for viewing army rules and list building. The app reads from BSData.

## Features
- Browse all armies and select one to view its units
- View unit details, including stats, weapons, abilities, and keywords
- Future: Army rules and list building

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
Sigdex reads from [BSData](https://github.com/BSData/warhammer-age-of-sigmar). Army files are mapped internally for easy access.

## Roadmap
- [x] View unit rules
- [ ] View army rules
- [ ] List building

---

This project uses Vue 3, TypeScript, Vue Router, and Vitest.
