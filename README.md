# StockPilot Dynamic Stocks Platform

StockPilot is now a dynamic stocks platform built with a plain HTML/CSS/JavaScript frontend and an Express backend. It supports persistent profiles, paper trading state, achievements, challenge completion, and API-driven data flows.

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
- Express backend with API routes
- Persistent JSON data storage for users and progress
- Dynamic profile, paper trading, coach, and achievement updates

## Project Structure

- `index.html` — the full frontend shell and all content sections
- `styles.css` — responsive layout and calmer interface styling
- `script.js` — frontend logic that consumes backend APIs
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

## Publish

Because this project now includes a backend, it should be deployed to a host that supports Node.js server processes.

## Data and Feature Notes

- This site uses a **static verified quote snapshot** dated **November 20, 2026 United States market close**.
- Historical chart ranges and backtest outputs are still based on embedded market data for consistency and predictable demo behavior.
- Profiles, sessions, paper trades, achievements, lesson progress, quiz records, glossary reveals, and daily challenge completion are now stored in a persistent JSON database on the server.
- The stock coach is still a **local AI-style educational assistant**, not a live online model.
- Quotes and charts do **not automatically refresh live** after deployment unless a real market-data API is integrated later.

## Important Disclaimer

- This project is for educational and demonstration purposes only.
- It does not provide live financial data, brokerage execution, regulated account services, or financial advice.