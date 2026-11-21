# StockPilot Dynamic Stocks Platform

StockPilot is a dynamic stocks platform built with a plain HTML/CSS/JavaScript frontend and an Express backend. It supports persistent profiles, paper trading state, achievements, challenge completion, and API-driven data flows.

## Features

- Large tracked stock universe
- Interactive stock explorer with multiple chart ranges
- Searchable stock screener with filters and sorting
- Dynamic paper trading simulator with persistent account data
- Detailed analytics section with stock comparison and narrative summaries
- Dynamic Backtest Lab with server-calculated strategy results
- Learning Hub with 30 lessons across beginner, intermediate, and advanced levels
- Final exam system for broader knowledge testing
- Quiz Center with topic selection and difficulty selection
- Mini-games to keep users engaged
- Expanded glossary with more terms, deeper explanations, and revealable answers
- Floating quick-definition modal for terms
- Dedicated achievements tracker page
- Daily challenge system
- Profile/login screen with persistent server-backed saved progress
- AI-style stock coach that can answer broader investing questions and define additional concepts in a general way
- Back to top button
- Express backend with API routes
- Persistent JSON data storage for users and progress

## Project Structure

- `index.html` — the frontend shell and all content sections
- `styles.css` — responsive layout and calmer interface styling
- `script.js` — frontend logic that consumes backend APIs
- `server.js` — Express backend and API routes
- `lib/catalog.js` — shared stock, lesson, glossary, game, and backtest catalog data
- `lib/store.js` — persistent JSON data storage helpers
- `data/db.json` — simple persistent data store for users and sessions
- `.nojekyll` — retained from earlier static deployment setup

## Run Locally

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Open the app in your browser at:

```bash
http://localhost:4173
```

## Data Notes

- This site uses a **verified embedded quote snapshot** dated **November 20, 2026 United States market close**.
- Historical chart ranges and backtest outputs are based on embedded market data for consistency and predictable demo behavior.
- Profiles, sessions, paper trades, achievements, lesson progress, quiz records, glossary reveals, and daily challenge completion are stored in a persistent JSON data file on the server.
- The stock coach is a **local AI-style educational assistant**, not a live online model.

## Important Disclaimer

- This project is for educational and demonstration purposes only.
- It does not provide live financial data, brokerage execution, regulated account services, or financial advice.