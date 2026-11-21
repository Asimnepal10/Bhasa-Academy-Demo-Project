const QUOTE_SNAPSHOT_DATE = "November 20, 2026 United States market close";

const achievementDefinitions = [
  { id: "profile-created", title: "Profile created", description: "Create a local StockPilot profile." },
  { id: "first-lesson", title: "First lesson", description: "Complete your first learning lesson." },
  { id: "five-lessons", title: "Learning momentum", description: "Complete five learning lessons." },
  { id: "fifteen-lessons", title: "Dedicated learner", description: "Complete fifteen learning lessons." },
  { id: "first-trade", title: "First trade", description: "Complete your first paper trade." },
  { id: "five-trades", title: "Active trader", description: "Complete five paper trades." },
  { id: "daily-challenge", title: "Daily challenger", description: "Complete the daily market challenge." },
  { id: "coach-used", title: "Coach connection", description: "Ask the stock coach a question." },
  { id: "quiz-score", title: "Quiz expert", description: "Earn at least 3 points in a quiz." },
  { id: "final-exam", title: "Final exam passed", description: "Score at least 70% on the final exam." }
];

const benchmark = {
  name: "S&P 500 Exchange-Traded Fund",
  symbol: "SPY",
  currentPrice: 689.81,
  dailyChange: -3.5,
  annualReturns: {
    2022: -19.48,
    2023: 24.29,
    2024: 24.54,
    2025: 15.41,
    2026: 0.97
  },
  history: {
    "10y": [223.53, 237.6, 267.5, 294.1, 321.9, 474.96, 382.43, 475.31, 591.95, 683.17, 689.81],
    "5y": [474.96, 382.43, 475.31, 591.95, 683.17, 689.81],
    "3y": [475.31, 591.95, 683.17, 689.81],
    "1y": [683.17, 689.81],
    ytd: [683.17, 689.81],
    "6m": [655.2, 689.81],
    "3m": [661.7, 689.81],
    "1m": [701.3, 689.81],
    "2w": [698.7, 689.81],
    "1w": [703.4, 689.81],
    "3d": [711.8, 702.1, 689.81],
    "1d": [714.83, 689.81]
  }
};

const stocks = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", currentPrice: 342.56, dailyChange: -1.81, marketCap: 5040.66, pe: 39.33, description: "A global consumer technology platform built around devices, software, and services.", history: { "10y": [28.96, 39.44, 73.41, 80.15, 132.69, 177.57, 129.93, 192.53, 243.36, 271.01, 342.56], "5y": [177.57, 129.93, 192.53, 243.36, 271.01, 342.56], "3y": [192.53, 243.36, 271.01, 342.56], "1y": [271.01, 342.56], ytd: [271.01, 342.56], "6m": [306.4, 342.56], "3m": [321.8, 342.56], "1m": [338.7, 342.56], "2w": [334.4, 342.56], "1w": [348.1, 342.56], "3d": [352.9, 346.7, 342.56], "1d": [348.87, 342.56] } },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology", currentPrice: 484.52, dailyChange: -2.68, marketCap: 3607.74, pe: 25.3, description: "A software and cloud giant with broad exposure to enterprise technology and artificial intelligence infrastructure.", history: { "10y": [62.14, 85.54, 101.57, 157.7, 222.42, 336.32, 239.82, 376.04, 423.35, 472.94, 484.52], "5y": [336.32, 239.82, 376.04, 423.35, 472.94, 484.52], "3y": [376.04, 423.35, 472.94, 484.52], "1y": [472.94, 484.52], ytd: [472.94, 484.52], "6m": [451.5, 484.52], "3m": [463.8, 484.52], "1m": [501.2, 484.52], "2w": [497.6, 484.52], "1w": [493.1, 484.52], "3d": [499.7, 491.8, 484.52], "1d": [497.88, 484.52] } },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology", currentPrice: 125.53, dailyChange: -13.8, marketCap: 3048.5, pe: 15.75, description: "A graphics and accelerated computing leader closely tied to artificial intelligence and data center demand.", history: { "10y": [2.63, 5.95, 7.66, 14.97, 21.01, 29.41, 14.61, 49.52, 144.47, 188.85, 125.53], "5y": [29.41, 14.61, 49.52, 144.47, 188.85, 125.53], "3y": [49.52, 144.47, 188.85, 125.53], "1y": [188.85, 125.53], ytd: [188.85, 125.53], "6m": [157.1, 125.53], "3m": [149.8, 125.53], "1m": [141.5, 125.53], "2w": [136.1, 125.53], "1w": [132.8, 125.53], "3d": [141.0, 136.6, 125.53], "1d": [145.63, 125.53] } },
  { symbol: "AMZN", name: "Amazon.com, Inc.", sector: "Consumer Discretionary", currentPrice: 246.82, dailyChange: -3.97, marketCap: 2697.5, pe: 19.95, description: "A consumer and cloud platform business with e-commerce, logistics, and web infrastructure strength.", history: { "10y": [37.49, 58.47, 75.1, 92.39, 162.85, 166.72, 84.0, 151.94, 224.19, 226.5, 246.82], "5y": [166.72, 84.0, 151.94, 224.19, 226.5, 246.82], "3y": [151.94, 224.19, 226.5, 246.82], "1y": [226.5, 246.82], ytd: [226.5, 246.82], "6m": [232.9, 246.82], "3m": [238.5, 246.82], "1m": [258.6, 246.82], "2w": [252.8, 246.82], "1w": [250.5, 246.82], "3d": [254.3, 249.8, 246.82], "1d": [257.01, 246.82] } },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology", currentPrice: 265.29, dailyChange: -2.6, marketCap: 3261.48, pe: 13.85, description: "A digital advertising and cloud platform business with broad artificial intelligence optionality.", history: { "10y": [39.05, 52.22, 67.2, 66.0, 88.19, 144.85, 88.23, 139.69, 191.79, 315.15, 265.29], "5y": [144.85, 88.23, 139.69, 191.79, 315.15, 265.29], "3y": [139.69, 191.79, 315.15, 265.29], "1y": [315.15, 265.29], ytd: [315.15, 265.29], "6m": [289.4, 265.29], "3m": [280.1, 265.29], "1m": [273.6, 265.29], "2w": [271.8, 265.29], "1w": [269.7, 265.29], "3d": [271.9, 268.2, 265.29], "1d": [272.38, 265.29] } },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financials", currentPrice: 310.53, dailyChange: -2.98, marketCap: 833.15, pe: 13.02, description: "A diversified financial institution with banking, capital markets, and credit exposure.", history: { "10y": [86.29, 106.94, 97.62, 139.4, 127.07, 158.35, 134.1, 170.1, 243.28, 325.48, 310.53], "5y": [158.35, 134.1, 170.1, 243.28, 325.48, 310.53], "3y": [170.1, 243.28, 325.48, 310.53], "1y": [325.48, 310.53], ytd: [325.48, 310.53], "6m": [318.0, 310.53], "3m": [323.2, 310.53], "1m": [317.4, 310.53], "2w": [314.9, 310.53], "1w": [316.3, 310.53], "3d": [321.4, 314.0, 310.53], "1d": [320.06, 310.53] } },
  { symbol: "KO", name: "The Coca-Cola Company", sector: "Consumer Staples", currentPrice: 96.99, dailyChange: 0.97, marketCap: 418.41, pe: 28.53, description: "A global beverage company often considered a defensive consumer staples exposure.", history: { "10y": [41.46, 45.88, 44.56, 54.84, 54.84, 59.21, 63.61, 58.93, 61.75, 69.12, 96.99], "5y": [59.21, 63.61, 58.93, 61.75, 69.12, 96.99], "3y": [58.93, 61.75, 69.12, 96.99], "1y": [69.12, 96.99], ytd: [69.12, 96.99], "6m": [82.5, 96.99], "3m": [88.7, 96.99], "1m": [93.3, 96.99], "2w": [95.4, 96.99], "1w": [96.0, 96.99], "3d": [95.7, 96.1, 96.99], "1d": [96.06, 96.99] } },
  { symbol: "META", name: "Meta Platforms, Inc.", sector: "Communication Services", currentPrice: 712.44, dailyChange: -1.94, marketCap: 1802.2, pe: 27.4, description: "A digital advertising and social platform company with a growing artificial intelligence and infrastructure footprint.", history: { "10y": [115.05, 176.46, 130.01, 353.96, 511.8, 694.9, 712.44], "5y": [176.46, 130.01, 353.96, 511.8, 694.9, 712.44], "3y": [353.96, 511.8, 694.9, 712.44], "1y": [694.9, 712.44], ytd: [694.9, 712.44], "6m": [668.0, 712.44], "3m": [701.4, 712.44], "1m": [724.6, 712.44], "2w": [719.8, 712.44], "1w": [717.9, 712.44], "3d": [720.3, 715.5, 712.44], "1d": [726.51, 712.44] } },
  { symbol: "TSLA", name: "Tesla, Inc.", sector: "Consumer Discretionary", currentPrice: 411.26, dailyChange: -1.84, marketCap: 1310.0, pe: 98.6, description: "An electric vehicle and energy business with strong brand identity and high volatility.", history: { "10y": [14.25, 21.15, 27.48, 83.67, 234.0, 352.26, 123.18, 248.48, 367.55, 419.84, 411.26], "5y": [352.26, 123.18, 248.48, 367.55, 419.84, 411.26], "3y": [248.48, 367.55, 419.84, 411.26], "1y": [419.84, 411.26], ytd: [419.84, 411.26], "6m": [387.5, 411.26], "3m": [403.7, 411.26], "1m": [419.2, 411.26], "2w": [414.1, 411.26], "1w": [416.3, 411.26], "3d": [418.7, 413.9, 411.26], "1d": [418.98, 411.26] } },
  { symbol: "AMD", name: "Advanced Micro Devices, Inc.", sector: "Technology", currentPrice: 186.88, dailyChange: 2.29, marketCap: 310.0, pe: 52.8, description: "A semiconductor designer with exposure to computing, servers, and artificial intelligence accelerators.", history: { "10y": [11.0, 10.28, 18.46, 45.86, 91.71, 143.9, 64.77, 147.41, 175.0, 182.34, 186.88], "5y": [143.9, 64.77, 147.41, 175.0, 182.34, 186.88], "3y": [147.41, 175.0, 182.34, 186.88], "1y": [182.34, 186.88], ytd: [182.34, 186.88], "6m": [169.1, 186.88], "3m": [173.6, 186.88], "1m": [181.2, 186.88], "2w": [182.4, 186.88], "1w": [184.1, 186.88], "3d": [180.5, 183.8, 186.88], "1d": [182.69, 186.88] } },
  { symbol: "V", name: "Visa Inc.", sector: "Financials", currentPrice: 342.12, dailyChange: 0.63, marketCap: 690.0, pe: 33.2, description: "A global payments network with durable transaction economics and high returns on capital.", history: { "10y": [79.66, 113.24, 132.88, 177.02, 218.73, 216.71, 207.76, 260.35, 310.77, 339.96, 342.12], "5y": [216.71, 207.76, 260.35, 310.77, 339.96, 342.12], "3y": [260.35, 310.77, 339.96, 342.12], "1y": [339.96, 342.12], ytd: [339.96, 342.12], "6m": [327.4, 342.12], "3m": [334.6, 342.12], "1m": [340.9, 342.12], "2w": [339.8, 342.12], "1w": [341.0, 342.12], "3d": [340.7, 341.5, 342.12], "1d": [339.98, 342.12] } },
  { symbol: "MA", name: "Mastercard Incorporated", sector: "Financials", currentPrice: 579.41, dailyChange: 0.51, marketCap: 528.0, pe: 36.2, description: "A premium global payments franchise with strong network effects and high-margin transaction flows.", history: { "10y": [102.98, 151.36, 188.65, 298.89, 356.94, 359.32, 347.41, 426.6, 499.77, 563.22, 579.41], "5y": [359.32, 347.41, 426.6, 499.77, 563.22, 579.41], "3y": [426.6, 499.77, 563.22, 579.41], "1y": [563.22, 579.41], ytd: [563.22, 579.41], "6m": [545.7, 579.41], "3m": [554.2, 579.41], "1m": [570.0, 579.41], "2w": [572.6, 579.41], "1w": [575.1, 579.41], "3d": [574.3, 577.8, 579.41], "1d": [576.47, 579.41] } },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc. Class B", sector: "Financials", currentPrice: 547.33, dailyChange: -0.24, marketCap: 1185.0, pe: 16.1, description: "A diversified holding company known for insurance, cash generation, and disciplined capital allocation.", history: { "10y": [162.98, 198.22, 204.3, 226.5, 279.8, 299.0, 308.9, 356.3, 436.1, 538.2, 547.33], "5y": [299.0, 308.9, 356.3, 436.1, 538.2, 547.33], "3y": [356.3, 436.1, 538.2, 547.33], "1y": [538.2, 547.33], ytd: [538.2, 547.33], "6m": [520.8, 547.33], "3m": [528.6, 547.33], "1m": [543.0, 547.33], "2w": [545.4, 547.33], "1w": [546.1, 547.33], "3d": [548.0, 547.6, 547.33], "1d": [548.64, 547.33] } },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", currentPrice: 169.42, dailyChange: 0.44, marketCap: 408.0, pe: 18.7, description: "A diversified healthcare company often viewed as a defensive large-cap holding.", history: { "10y": [115.21, 139.72, 128.4, 145.87, 157.38, 171.07, 176.65, 156.47, 153.11, 164.5, 169.42], "5y": [171.07, 176.65, 156.47, 153.11, 164.5, 169.42], "3y": [156.47, 153.11, 164.5, 169.42], "1y": [164.5, 169.42], ytd: [164.5, 169.42], "6m": [160.7, 169.42], "3m": [163.5, 169.42], "1m": [166.2, 169.42], "2w": [167.9, 169.42], "1w": [168.5, 169.42], "3d": [168.0, 168.6, 169.42], "1d": [168.68, 169.42] } },
  { symbol: "UNH", name: "UnitedHealth Group Incorporated", sector: "Healthcare", currentPrice: 648.15, dailyChange: 0.73, marketCap: 598.0, pe: 24.8, description: "A managed care and healthcare services leader with scale, recurring demand, and broad market influence.", history: { "10y": [128.12, 220.46, 249.12, 293.98, 350.12, 502.14, 530.18, 526.47, 540.88, 621.42, 648.15], "5y": [502.14, 530.18, 526.47, 540.88, 621.42, 648.15], "3y": [526.47, 540.88, 621.42, 648.15], "1y": [621.42, 648.15], ytd: [621.42, 648.15], "6m": [610.1, 648.15], "3m": [621.0, 648.15], "1m": [638.2, 648.15], "2w": [644.5, 648.15], "1w": [646.1, 648.15], "3d": [645.0, 646.8, 648.15], "1d": [643.45, 648.15] } },
  { symbol: "XOM", name: "Exxon Mobil Corporation", sector: "Energy", currentPrice: 126.14, dailyChange: -0.64, marketCap: 520.0, pe: 14.3, description: "A global energy producer that can diversify portfolios away from purely technology-led outcomes.", history: { "10y": [90.26, 83.64, 68.19, 70.9, 41.22, 61.19, 110.3, 102.3, 105.8, 129.95, 126.14], "5y": [61.19, 110.3, 102.3, 105.8, 129.95, 126.14], "3y": [102.3, 105.8, 129.95, 126.14], "1y": [129.95, 126.14], ytd: [129.95, 126.14], "6m": [121.7, 126.14], "3m": [124.1, 126.14], "1m": [127.4, 126.14], "2w": [128.2, 126.14], "1w": [127.8, 126.14], "3d": [127.6, 126.9, 126.14], "1d": [126.95, 126.14] } },
  { symbol: "COST", name: "Costco Wholesale Corporation", sector: "Consumer Staples", currentPrice: 987.41, dailyChange: 0.72, marketCap: 438.0, pe: 56.1, description: "A warehouse retailer with strong membership economics and resilient consumer positioning.", history: { "10y": [149.72, 186.24, 203.71, 293.92, 375.59, 566.95, 456.3, 660.76, 874.3, 951.2, 987.41], "5y": [566.95, 456.3, 660.76, 874.3, 951.2, 987.41], "3y": [660.76, 874.3, 951.2, 987.41], "1y": [951.2, 987.41], ytd: [951.2, 987.41], "6m": [920.6, 987.41], "3m": [944.2, 987.41], "1m": [972.5, 987.41], "2w": [980.1, 987.41], "1w": [983.4, 987.41], "3d": [981.7, 984.5, 987.41], "1d": [980.35, 987.41] } },
  { symbol: "PG", name: "Procter & Gamble Company", sector: "Consumer Staples", currentPrice: 171.83, dailyChange: 0.31, marketCap: 403.0, pe: 27.1, description: "A large consumer staples company known for brand durability and defensive portfolio characteristics.", history: { "10y": [83.52, 91.88, 91.92, 124.9, 138.02, 163.58, 151.84, 146.54, 155.6, 168.2, 171.83], "5y": [163.58, 151.84, 146.54, 155.6, 168.2, 171.83], "3y": [146.54, 155.6, 168.2, 171.83], "1y": [168.2, 171.83], ytd: [168.2, 171.83], "6m": [162.4, 171.83], "3m": [166.0, 171.83], "1m": [169.7, 171.83], "2w": [170.5, 171.83], "1w": [171.0, 171.83], "3d": [171.1, 171.4, 171.83], "1d": [171.30, 171.83] } },
  { symbol: "AVGO", name: "Broadcom Inc.", sector: "Technology", currentPrice: 1005.22, dailyChange: 1.08, marketCap: 468.0, pe: 40.7, description: "A semiconductor and infrastructure software company with strong connectivity and artificial intelligence demand exposure.", history: { "10y": [72.48, 143.66, 198.88, 316.25, 438.77, 665.42, 558.1, 920.37, 1038.22, 995.0, 1005.22], "5y": [665.42, 558.1, 920.37, 1038.22, 995.0, 1005.22], "3y": [920.37, 1038.22, 995.0, 1005.22], "1y": [995.0, 1005.22], ytd: [995.0, 1005.22], "6m": [933.2, 1005.22], "3m": [962.7, 1005.22], "1m": [988.4, 1005.22], "2w": [994.1, 1005.22], "1w": [1001.3, 1005.22], "3d": [998.0, 1001.9, 1005.22], "1d": [994.48, 1005.22] } }
];

const rangeLabels = {
  "10y": ["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
  "5y": ["2021", "2022", "2023", "2024", "2025", "2026"],
  "3y": ["2023", "2024", "2025", "2026"],
  "1y": ["2025 close", "2026"],
  ytd: ["January", "Now"],
  "6m": ["6 months ago", "Now"],
  "3m": ["3 months ago", "Now"],
  "1m": ["1 month ago", "Now"],
  "2w": ["2 weeks ago", "Now"],
  "1w": ["1 week ago", "Now"],
  "3d": ["3 days ago", "2 days ago", "Now"],
  "1d": ["Open", "Close"]
};

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function calculateCagr(start, end, years) {
  return (Math.pow(end / start, 1 / years) - 1) * 100;
}

function getFiveYearCagr(stock) {
  const data = stock.history["5y"];
  return calculateCagr(data[0], data[data.length - 1], 5);
}

function getTenYearCagr(stock) {
  const data = stock.history["10y"];
  return calculateCagr(data[0], data[data.length - 1], 10);
}

function buildLessons() {
  const groups = {
    Beginner: ["Understanding stock prices", "What a company share represents", "Why diversification matters", "How to use a watchlist", "What a benchmark does", "Understanding price to earnings ratio", "What volatility means", "Why paper trading helps", "How compound annual growth rate works", "Building a first stock process"],
    Intermediate: ["Comparing drawdowns across stocks", "Reading sector concentration risk", "Using rebalancing in a portfolio", "Comparing capital-light businesses", "Understanding cyclicality in valuations", "How earnings quality affects multiple expansion", "Spotting portfolio drift", "Using relative performance comparisons", "Why cash flow matters more than revenue growth", "When a stock can be great but still a bad investment"],
    Advanced: ["Separating business quality from market enthusiasm", "Evaluating valuation compression risk", "Thinking in expected value instead of narrative", "Understanding capital allocation discipline", "Using scenario analysis for stock ideas", "Comparing platform businesses and cyclical companies", "How benchmark-relative thinking improves decisions", "Interpreting long-run compounders after strong runs", "Studying macro sensitivity without overreacting", "Designing a repeatable investing process"]
  };

  return Object.entries(groups).flatMap(([difficulty, titles]) => titles.map((title, index) => ({
    id: `${slugify(difficulty)}-${index + 1}`,
    difficulty,
    title,
    summary: `${title} explained in a practical and beginner-friendly way.`,
    prompts: [
      `How would you explain “${title}” in your own words?`,
      `What is one mistake an investor could make by misunderstanding “${title}”?`
    ]
  })));
}

function createQuizQuestion(difficulty, topic, index) {
  const templates = {
    Beginner: {
      answers: ["Understand the concept clearly before acting.", "Trade first and learn later.", "Use one metric as the whole story.", "Ignore context completely."],
      explanation: "At the beginner level, the best habit is understanding the principle clearly before taking action."
    },
    Intermediate: {
      answers: ["Compare the idea with alternatives, risk, and a benchmark.", "Focus only on the latest headline.", "Ignore how the stock fits your portfolio.", "Assume short-term momentum explains everything."],
      explanation: "Intermediate investors benefit from comparing the idea with risk, alternatives, and benchmark-relative behavior."
    },
    Advanced: {
      answers: ["Evaluate business quality, valuation, downside path, and alternatives together.", "Buy because the story sounds exciting.", "Ignore uncertainty.", "Judge the stock with one ratio only."],
      explanation: "Advanced decision-making combines quality, valuation, risk path, and opportunity cost instead of relying on one shortcut."
    }
  };

  return {
    id: `${slugify(difficulty)}-${slugify(topic)}-${index}`,
    difficulty,
    topic,
    question: `${difficulty} ${topic} question ${index}: which answer reflects the strongest investing process?`,
    answers: templates[difficulty].answers,
    correctIndex: 0,
    explanation: templates[difficulty].explanation
  };
}

function buildQuizBank() {
  const topics = ["Valuation", "Risk", "Portfolio construction", "Backtesting", "Paper trading", "Benchmark analysis", "Stock selection", "Behavior and discipline"];
  const difficulties = ["Beginner", "Intermediate", "Advanced"];
  const items = [];
  difficulties.forEach((difficulty) => {
    topics.forEach((topic) => {
      for (let index = 1; index <= 6; index += 1) {
        items.push(createQuizQuestion(difficulty, topic, index));
      }
    });
  });
  return items;
}

function buildGames() {
  return [
    { id: "return-ranker", title: "Return ranker", description: "See which tracked stock has the stronger five-year return profile.", prompt: "Reveal the strongest five-year compounder." },
    { id: "sector-match", title: "Sector match", description: "Match the selected stock to the correct sector.", prompt: "Reveal the selected stock sector." },
    { id: "definition-dash", title: "Definition dash", description: "Learn a glossary term quickly.", prompt: "Reveal a random glossary definition." }
  ];
}

function buildGlossaryTerms() {
  return [
    { term: "Compound annual growth rate", shortDefinition: "The annualized rate that converts a multi-year total return into a smoother yearly comparison number.", longDefinition: "Compound annual growth rate estimates what steady annual rate would turn a starting value into an ending value over multiple years. It is useful for comparing stocks across long periods, but it does not show the drawdowns or volatility that happened along the way." },
    { term: "Price to earnings ratio", shortDefinition: "A valuation ratio comparing stock price with earnings per share.", longDefinition: "The price to earnings ratio shows how much investors are paying for each dollar of earnings. It can be useful for comparison, but it should not be used alone because growth, margins, cash flow, and business quality all matter." },
    { term: "Drawdown", shortDefinition: "The drop from a stock or portfolio peak to its next low before recovery.", longDefinition: "Drawdown matters because investors experience it emotionally in real time. A stock can have strong long-term returns and still suffer a painful drawdown, which is why return alone is not the whole story." },
    { term: "Diversification", shortDefinition: "Spreading exposure across different businesses, sectors, or risk drivers.", longDefinition: "Diversification reduces the chance that one stock, one sector, or one narrative will dominate the portfolio outcome. True diversification is not only about quantity, but also about owning different kinds of exposures." },
    { term: "Benchmark", shortDefinition: "A standard used to compare strategy performance.", longDefinition: "A benchmark acts as a reference point for judging stock selection or a full strategy. If a portfolio gains less than a broad benchmark while taking similar or more risk, it may not have added much value." },
    { term: "Volatility", shortDefinition: "The amount and speed of price movement over time.", longDefinition: "Volatility measures how much prices fluctuate. It is useful, but it is not identical to permanent loss. A volatile stock can still be high quality, while a calm stock can still be a poor investment." },
    { term: "Beta", shortDefinition: "A measure of how sensitive a stock is to moves in the broad market.", longDefinition: "Beta estimates whether a stock tends to move more or less than the overall market. It helps explain market sensitivity, but it does not replace analysis of business quality, debt, valuation, or management behavior." },
    { term: "Free cash flow", shortDefinition: "Cash left after operating expenses and capital spending.", longDefinition: "Free cash flow helps investors judge how much real cash a business produces after reinvestment needs. It often matters more than simple earnings when evaluating whether a company can fund dividends, buybacks, or growth." },
    { term: "Market capitalization", shortDefinition: "The total market value of a company’s equity.", longDefinition: "Market capitalization is usually calculated by multiplying share price by shares outstanding. It helps categorize companies by size, but it does not automatically tell you whether the stock is attractive or safe." },
    { term: "Rebalancing", shortDefinition: "Resetting portfolio weights back toward target allocations.", longDefinition: "Rebalancing is a process used to keep a portfolio aligned with its intended structure. Without it, a few winners can gradually dominate the account and create more concentration risk than originally intended." },
    { term: "Margin of safety", shortDefinition: "A buffer between what you pay and what you think something is worth.", longDefinition: "A margin of safety gives the investor some room for mistakes in analysis or unexpected business weakness. The lower the purchase price relative to estimated value, the more protection the investor may have if things do not go perfectly." },
    { term: "Opportunity cost", shortDefinition: "What you give up by choosing one investment instead of another.", longDefinition: "Opportunity cost matters because capital is limited. Even if a stock is decent, it may still be a poor choice if there is a better alternative with stronger return potential, better downside protection, or better portfolio fit." },
    { term: "Risk-adjusted return", shortDefinition: "Return considered together with the amount of risk taken to earn it.", longDefinition: "Risk-adjusted return asks whether the investor was compensated fairly for volatility, drawdowns, concentration, or uncertainty. Sometimes the smoother path is more useful than the higher but more painful one." },
    { term: "Earnings quality", shortDefinition: "How durable and cash-backed a company’s reported earnings appear to be.", longDefinition: "High earnings quality often means profits are supported by real cash flow, consistent operations, and less dependence on accounting distortions or one-time events. Investors usually trust those earnings more over time." },
    { term: "Scenario analysis", shortDefinition: "Testing multiple possible future outcomes instead of assuming one perfect forecast.", longDefinition: "Scenario analysis improves decision-making by forcing the investor to consider good, base, and bad cases. It reduces overconfidence and makes portfolio sizing or valuation decisions more realistic." }
  ].map((entry) => ({ ...entry, question: `How would you explain ${entry.term.toLowerCase()} to a beginner investor?`, answer: entry.longDefinition }));
}

const lessons = buildLessons();
const quizBank = buildQuizBank();
const games = buildGames();
const glossaryTerms = buildGlossaryTerms();

const strategies = [
  { id: "balanced-leaders", name: "Balanced market leaders", symbols: ["AAPL", "MSFT", "JPM", "KO", "UNH", "XOM"], rationale: "Blends growth, defensives, financials, healthcare, and energy for a more balanced large-cap strategy." },
  { id: "artificial-intelligence-focus", name: "Artificial intelligence focus", symbols: ["NVDA", "MSFT", "AVGO", "AMD", "META"], rationale: "Targets companies tied closely to artificial intelligence infrastructure and platforms." },
  { id: "defensive-income-mix", name: "Defensive income mix", symbols: ["KO", "PG", "JNJ", "JPM", "BRK.B"], rationale: "Focuses on steadier businesses and capital allocation discipline." },
  { id: "platform-mega-caps", name: "Platform mega-caps", symbols: ["AAPL", "MSFT", "AMZN", "GOOGL", "META"], rationale: "Concentrates on dominant platform businesses with broad digital reach." },
  { id: "full-universe", name: "Full tracked universe", symbols: stocks.map((stock) => stock.symbol), rationale: "Equal-weights every tracked stock for a broad in-site benchmark." }
];

const dailyChallenges = [
  { id: "lesson", title: "Complete one lesson", description: "Open any lesson and mark it complete once you understand the concept." },
  { id: "trade", title: "Place one paper trade", description: "Use the simulator to complete one buy or sell trade." },
  { id: "glossary", title: "Reveal one glossary answer", description: "Use the glossary and reveal the answer to a practice question." },
  { id: "quiz", title: "Answer one quiz question correctly", description: "Load a quiz and get at least one answer correct." },
  { id: "coach", title: "Ask the stock coach a question", description: "Use the coach to learn something new today." }
];

const coachPrompts = [
  "What is compound annual growth rate and why does it matter?",
  "How do I know whether a stock is too expensive?",
  "Which tracked stock looks the most defensive right now?",
  "How should I diversify a paper trading portfolio?",
  "Explain drawdown in simple words."
];

function getDailyChallenge(date = new Date()) {
  return dailyChallenges[date.getDate() % dailyChallenges.length];
}

function annualReturn(stock, year) {
  const series = stock.history["5y"];
  const map = { 2021: series[0], 2022: series[1], 2023: series[2], 2024: series[3], 2025: series[4], 2026: series[5] };
  return ((map[year] / map[year - 1]) - 1) * 100;
}

function runBacktest(strategyId, startingCapital) {
  const strategy = strategies.find((item) => item.id === strategyId) || strategies[0];
  let strategyValue = startingCapital;
  let benchmarkValue = startingCapital;
  const breakdown = Object.entries(benchmark.annualReturns).map(([year, benchmarkReturn]) => {
    const strategyReturn = strategy.symbols.reduce((sum, symbol) => sum + annualReturn(stocks.find((stock) => stock.symbol === symbol), Number(year)), 0) / strategy.symbols.length;
    strategyValue *= 1 + strategyReturn / 100;
    benchmarkValue *= 1 + benchmarkReturn / 100;
    return { year: Number(year), strategyReturn, benchmarkReturn, strategyValue, benchmarkValue };
  });
  const totalReturn = ((strategyValue / startingCapital) - 1) * 100;
  const benchmarkReturn = ((benchmarkValue / startingCapital) - 1) * 100;
  const compoundAnnualGrowthRate = calculateCagr(startingCapital, strategyValue, breakdown.length);
  return {
    strategy,
    breakdown,
    totalReturn,
    benchmarkReturn,
    finalStrategyValue: strategyValue,
    finalBenchmarkValue: benchmarkValue,
    compoundAnnualGrowthRate,
    outperformanceGap: totalReturn - benchmarkReturn
  };
}

function buildCoachResponse(question, selectedSymbol) {
  const input = String(question || "").toLowerCase().trim();
  const selectedStock = stocks.find((stock) => stock.symbol === selectedSymbol) || stocks[0];
  if (!input) return "Try asking about a stock, a term, diversification, valuation, risk, backtesting, or paper trading.";
  if (input.includes(selectedStock.symbol.toLowerCase()) || input.includes(selectedStock.name.toLowerCase()) || input.includes("selected stock")) {
    return `${selectedStock.name} is in the ${selectedStock.sector} sector. Its current price is ${selectedStock.currentPrice.toFixed(2)}, its daily move is ${selectedStock.dailyChange.toFixed(2)} percent, its five-year compound annual growth rate is ${getFiveYearCagr(selectedStock).toFixed(1)} percent, and its ten-year compound annual growth rate is ${getTenYearCagr(selectedStock).toFixed(1)} percent. ${selectedStock.description}`;
  }
  if (input.includes("diversification")) return "Diversification means spreading risk across different business types, sectors, and return drivers so that one idea cannot dominate your outcome.";
  if (input.includes("valuation") || input.includes("price to earnings") || input.includes("p/e")) return "Valuation is about what you pay compared with what you receive. Price to earnings ratio is a useful starting point, but growth, margins, cash flow, and balance sheet strength also matter.";
  if (input.includes("risk") || input.includes("drawdown") || input.includes("volatility")) return "Volatility measures movement, but true investing risk includes drawdown size, valuation risk, business weakness, leverage, and behavior under stress.";
  if (input.includes("paper trading") || input.includes("simulator")) return "Paper trading lets you practice decisions, sizing, and discipline without risking real money. It is best used for building repeatable habits.";
  if (input.includes("backtest")) return "A backtest shows how a rules-based strategy would have behaved historically. It is useful for learning and comparison, but it is not a guarantee of future returns.";
  if (input.includes("what is") || input.includes("define") || input.includes("meaning of")) {
    const glossaryMatch = glossaryTerms.find((term) => input.includes(term.term.toLowerCase()));
    if (glossaryMatch) return `${glossaryMatch.term}: ${glossaryMatch.longDefinition}`;
    return "I do not have that exact term listed, but the best way to learn a new investing term is to understand what it measures, why investors use it, and what mistake beginners make when they rely on it alone.";
  }
  return "A strong investing process starts with understanding the business, the valuation, the downside path, and the alternatives. Then compare the idea with a benchmark, test it in paper trading, and use analytics or backtesting for more context.";
}

function getBootstrapPayload() {
  return {
    snapshotDate: QUOTE_SNAPSHOT_DATE,
    benchmark,
    stocks,
    strategies,
    rangeLabels,
    lessons,
    quizBank,
    games,
    glossaryTerms,
    coachPrompts,
    achievementDefinitions,
    dailyChallenge: getDailyChallenge()
  };
}

module.exports = {
  QUOTE_SNAPSHOT_DATE,
  benchmark,
  stocks,
  strategies,
  rangeLabels,
  lessons,
  quizBank,
  games,
  glossaryTerms,
  coachPrompts,
  achievementDefinitions,
  calculateCagr,
  getFiveYearCagr,
  getTenYearCagr,
  getDailyChallenge,
  runBacktest,
  buildCoachResponse,
  getBootstrapPayload
};