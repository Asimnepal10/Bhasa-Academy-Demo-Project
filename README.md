# StockPilot Dynamic Stocks Platform

StockPilot is an interactive stocks and learning demo that can run as a static GitHub Pages site or with its optional Express backend.

## Features

- Large tracked stock universe instead of only a handful of names
- Interactive stock explorer with multiple chart ranges
- Searchable stock screener with filters and sorting
- Paper trading simulator with:
  - stock search suggestions
  - buy and sell functionality
  - cash tracking
  - open positions
  - trade history
  - paper account performance chart across many ranges
- Detailed analytics section with stock comparison and narrative summaries
- Static Backtest Lab with strategy comparison versus the S&P 500 exchange-traded fund benchmark
- Learning Hub with 30 lessons across beginner, intermediate, and advanced levels
- Final exam system for broader knowledge testing
- Quiz Center with topic selection and difficulty selection
- Mini-games to keep users engaged
- Expanded glossary with more terms, deeper explanations, and revealable answers
- Floating quick-definition modal for terms
- Dedicated achievements tracker page
- Daily challenge system
- Local profile/login screen with browser-based saved progress
- AI-style stock coach that can answer broader investing questions and define additional concepts in a general way
- Back to top button
- GitHub Pages-compatible local profiles, paper trading, coach, learning progress, and achievements
- Optional Express backend with API routes and JSON data storage

## Project Structure

- `index.html` — the full frontend shell and all content sections
- `styles.css` — responsive layout and calmer interface styling
- `script.js` — frontend logic that uses either the Express API or the static adapter
- `static-api.js` — browser-local API and storage adapter for static hosting
- `server.js` — Express backend and API routes
- `lib/catalog.js` — shared stock, lesson, glossary, game, and backtest catalog data
- `lib/store.js` — persistent JSON data storage helpers
- `data/db.json` — simple persistent data store for users and sessions
- `.nojekyll` — ensures static hosts like GitHub Pages serve files as-is

## Run Locally

If you have Node.js installed:

```bash
npm start
```

This starts the Express server on port `4173` by default.

Open the app in your browser at:

```bash
http://localhost:4173
```

Run the local adapter checks with:

```bash
npm test
```

## Publish

This project can be published directly to GitHub Pages:

1. Push the project to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Choose the branch and folder containing `index.html` (usually `main` and `/ (root)`), then save.
4. Open the Pages URL shown in the repository settings.

GitHub Pages does not run Node.js. The frontend detects the static host and saves demo profiles and progress in that browser’s local storage. This data does not sync across browsers or devices and is not a secure account system. To use the server-backed mode instead, run `npm start` locally or deploy the project to a Node.js host.

## Data and Feature Notes

- This site uses a **static verified quote snapshot** dated **November 20, 2026 United States market close**.
- Historical chart ranges and backtest outputs are still based on embedded market data for consistency and predictable demo behavior.
- On GitHub Pages, profiles, paper trades, achievements, lesson progress, quiz records, glossary reveals, and daily challenge completion are saved in that browser's local storage. With the optional Express backend, they are stored in the JSON database on the server.
- The stock coach is still a **local AI-style educational assistant**, not a live online model.
- Quotes and charts do **not automatically refresh live** after deployment unless a real market-data API is integrated later.

## Important Disclaimer

- This project is for educational and demonstration purposes only.
- It does not provide live financial data, brokerage execution, regulated account services, or financial advice.