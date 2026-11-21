(function (root) {
const snapshotDate = 'November 20, 2026 U.S. market close • refreshed November 21, 2026 UTC';

const achievementDefinitions = [
  { id: 'profile-created', title: 'Profile created', description: 'Create and save a full StockPilot account.' },
  { id: 'first-lesson', title: 'First lesson', description: 'Complete your first lesson in the learning hub.' },
  { id: 'five-lessons', title: 'Learning momentum', description: 'Complete five lessons across any difficulty.' },
  { id: 'fifteen-lessons', title: 'Dedicated learner', description: 'Complete fifteen lessons and build real study momentum.' },
  { id: 'curriculum-complete', title: 'Curriculum complete', description: 'Complete the full lesson curriculum.' },
  { id: 'first-trade', title: 'First paper trade', description: 'Place your first trade in the paper trading simulator.' },
  { id: 'five-trades', title: 'Active trader', description: 'Place at least five paper trades.' },
  { id: 'ten-trades', title: 'Seasoned simulator', description: 'Place at least ten paper trades.' },
  { id: 'portfolio-builder', title: 'Portfolio builder', description: 'Hold at least three open positions at the same time.' },
  { id: 'paper-profit', title: 'Paper profit', description: 'Grow your paper portfolio above the starting balance.' },
  { id: 'glossary-explorer', title: 'Glossary explorer', description: 'Reveal at least five glossary practice answers.' },
  { id: 'glossary-scholar', title: 'Glossary scholar', description: 'Reveal at least twelve glossary practice answers.' },
  { id: 'daily-challenge', title: 'Daily challenger', description: 'Complete the challenge of the day.' },
  { id: 'coach-used', title: 'Coach connection', description: 'Ask the stock coach at least one question.' },
  { id: 'coach-strategist', title: 'Coach strategist', description: 'Use the stock coach at least five times.' },
  { id: 'quiz-score', title: 'Quiz performer', description: 'Reach a quiz score of at least three in a session.' },
  { id: 'quiz-master', title: 'Quiz master', description: 'Reach a quiz score of at least eight in a session.' },
  { id: 'final-exam', title: 'Final exam pass', description: 'Score at least 70 percent on the final exam.' }
];

const rangeLabels = Object.freeze({
  '10y': ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
  '5y': ['2021', '2022', '2023', '2024', '2025', '2026'],
  '3y': ['2023', '2024', '2025', '2026'],
  '1y': ['Dec 2025', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  ytd: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  '6m': ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  '3m': ['Sep', 'Oct', 'Nov'],
  '1m': ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  '2w': ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10'],
  '1w': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  '3d': ['Day 1', 'Day 2', 'Day 3'],
  '1d': ['Open', 'Midday', 'Close']
});

const sectorBiases = Object.freeze({
  Technology: 3.5,
  'Financial Services': 1.2,
  Healthcare: 1.7,
  Consumer: 1.1,
  Industrials: 1.3,
  Energy: 0.7,
  'Communication Services': 1.6,
  Utilities: 0.4,
  Automotive: 1.9,
  Transportation: 1.4,
  'Real Estate': 0.8,
  Materials: 1.0
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function growthFactor(percent) {
  return 1 + (percent / 100);
}

function totalReturnFromAnnual(annualGrowth, years) {
  return (Math.pow(growthFactor(annualGrowth), years) - 1) * 100;
}

function seedFromString(text) {
  return [...String(text)].reduce((sum, character) => sum + character.charCodeAt(0), 0);
}

function wave(seed, step, amplitude) {
  return (Math.sin((seed * 0.071) + (step * 1.19)) * amplitude) + (Math.cos((seed * 0.031) + (step * 0.61)) * amplitude * 0.45);
}

function buildRangeSeries(currentPrice, steps, totalReturn, volatility, seed) {
  if (steps <= 1) return [round(currentPrice)];
  const startingPrice = Math.max(1, currentPrice / growthFactor(totalReturn));
  const values = [startingPrice];
  for (let index = 1; index < steps; index += 1) {
    const progress = index / (steps - 1);
    const driftPerStep = totalReturn / (steps - 1);
    const wiggle = wave(seed, index, volatility) * (1 - Math.abs(0.5 - progress));
    const candidate = Math.max(1, values[index - 1] * growthFactor(driftPerStep + wiggle));
    values.push(candidate);
  }
  const scaleFactor = currentPrice / values[values.length - 1];
  return values.map((value, index) => (index === values.length - 1 ? round(currentPrice) : round(Math.max(1, value * scaleFactor))));
}

function buildIntradaySeries(currentPrice, dailyChange, seed) {
  const open = Math.max(1, currentPrice / growthFactor(dailyChange));
  const midday = Math.max(1, ((open + currentPrice) / 2) * (1 + wave(seed, 1, 0.003)));
  return [round(open), round(midday), round(currentPrice)];
}

function buildHistory(stock) {
  const seed = seedFromString(stock.symbol);
  const sectorBias = sectorBiases[stock.sector] || 0;
  const momentum = clamp(sectorBias + wave(seed, 2, 4), -8, 8);
  return {
    '10y': buildRangeSeries(stock.currentPrice, rangeLabels['10y'].length, totalReturnFromAnnual(stock.annualGrowth, 10), stock.volatility * 1.25, seed),
    '5y': buildRangeSeries(stock.currentPrice, rangeLabels['5y'].length, totalReturnFromAnnual((stock.annualGrowth * 0.96) + (sectorBias * 0.25), 5), stock.volatility * 1.1, seed + 5),
    '3y': buildRangeSeries(stock.currentPrice, rangeLabels['3y'].length, totalReturnFromAnnual((stock.annualGrowth * 0.92) + (sectorBias * 0.2), 3), stock.volatility, seed + 11),
    '1y': buildRangeSeries(stock.currentPrice, rangeLabels['1y'].length, clamp((stock.annualGrowth * 0.72) + momentum + (stock.dailyChange * 4.5), -25, 48), stock.volatility * 0.95, seed + 17),
    ytd: buildRangeSeries(stock.currentPrice, rangeLabels.ytd.length, clamp((stock.annualGrowth * 0.5) + (momentum * 0.7) + (stock.dailyChange * 3), -18, 30), stock.volatility * 0.85, seed + 23),
    '6m': buildRangeSeries(stock.currentPrice, rangeLabels['6m'].length, clamp((stock.annualGrowth * 0.34) + (momentum * 0.55) + (stock.dailyChange * 2.2), -14, 22), stock.volatility * 0.75, seed + 29),
    '3m': buildRangeSeries(stock.currentPrice, rangeLabels['3m'].length, clamp((stock.annualGrowth * 0.18) + (momentum * 0.3) + (stock.dailyChange * 1.3), -10, 15), stock.volatility * 0.65, seed + 31),
    '1m': buildRangeSeries(stock.currentPrice, rangeLabels['1m'].length, clamp((stock.dailyChange * 5) + (momentum * 0.35), -10, 12), stock.volatility * 0.55, seed + 37),
    '2w': buildRangeSeries(stock.currentPrice, rangeLabels['2w'].length, clamp((stock.dailyChange * 2.6) + (momentum * 0.2), -8, 9), stock.volatility * 0.45, seed + 41),
    '1w': buildRangeSeries(stock.currentPrice, rangeLabels['1w'].length, clamp((stock.dailyChange * 1.6) + (momentum * 0.12), -6, 7), stock.volatility * 0.38, seed + 43),
    '3d': buildRangeSeries(stock.currentPrice, rangeLabels['3d'].length, clamp(stock.dailyChange * 1.05, -4, 4), stock.volatility * 0.3, seed + 47),
    '1d': buildIntradaySeries(stock.currentPrice, stock.dailyChange, seed + 53)
  };
}

const rawStocks = [
  ['AAPL', 'Apple', 'Technology', 221.45, 1.12, 3380, 31.4, 22, 0.9, 'Consumer devices, ecosystem services, and premium hardware loyalty.'],
  ['MSFT', 'Microsoft', 'Technology', 612.2, 0.88, 4580, 39.8, 27, 0.8, 'Cloud, enterprise software, productivity tools, and artificial intelligence infrastructure.'],
  ['NVDA', 'NVIDIA', 'Technology', 198.6, 2.35, 4870, 44.2, 41, 1.4, 'Accelerated computing chips powering artificial intelligence and data centers.'],
  ['AMZN', 'Amazon', 'Technology', 257.9, -0.42, 2760, 56.1, 24, 1.1, 'E-commerce, cloud infrastructure, digital media, and logistics scale.'],
  ['GOOGL', 'Alphabet', 'Technology', 212.3, 0.54, 2870, 28.7, 21, 0.9, 'Search, advertising, cloud, and platform products with strong cash generation.'],
  ['META', 'Meta Platforms', 'Technology', 941.15, 1.47, 2380, 30.2, 26, 1.2, 'Social platforms, advertising engines, and expanding artificial intelligence tools.'],
  ['AMD', 'Advanced Micro Devices', 'Technology', 266.7, 1.93, 430, 47.5, 28, 1.5, 'High-performance computing chips for servers, personal computers, and AI workloads.'],
  ['AVGO', 'Broadcom', 'Technology', 441.2, 0.76, 990, 36.4, 27, 1.1, 'Semiconductor and infrastructure software platform with broad enterprise exposure.'],
  ['ORCL', 'Oracle', 'Technology', 198.4, 0.29, 610, 33.1, 18, 0.8, 'Database software, enterprise applications, and cloud infrastructure services.'],
  ['CRM', 'Salesforce', 'Technology', 412.8, 0.65, 395, 32.7, 19, 1.0, 'Customer relationship software with recurring enterprise subscriptions.'],
  ['ADBE', 'Adobe', 'Technology', 676.4, -0.55, 305, 35.9, 18, 1.0, 'Creative software, digital documents, and marketing workflow tools.'],
  ['NOW', 'ServiceNow', 'Technology', 1042.3, 1.16, 232, 68.4, 26, 1.2, 'Workflow automation platform serving large enterprise operations.'],
  ['NFLX', 'Netflix', 'Technology', 1134.5, 0.91, 500, 39.4, 28, 1.1, 'Global streaming platform with subscription scale and ad-supported growth.'],
  ['INTC', 'Intel', 'Technology', 49.2, -1.48, 212, 27.3, 6, 1.4, 'Legacy chipmaker working through manufacturing and product transition cycles.'],
  ['QCOM', 'Qualcomm', 'Technology', 264.8, 0.73, 295, 24.6, 16, 1.1, 'Wireless chip and licensing business tied to mobile and connected devices.'],
  ['PANW', 'Palo Alto Networks', 'Technology', 592.2, 1.44, 192, 52.1, 24, 1.3, 'Cybersecurity platform focused on network, cloud, and endpoint defense.'],
  ['CRWD', 'CrowdStrike', 'Technology', 518.6, 2.02, 138, 74.3, 31, 1.5, 'Endpoint and cloud cybersecurity leader with subscription-driven growth.'],
  ['SNOW', 'Snowflake', 'Technology', 311.4, -0.88, 108, 97.5, 25, 1.6, 'Cloud data platform with analytics and warehousing tools.'],
  ['JPM', 'JPMorgan Chase', 'Financial Services', 284.4, 0.61, 814, 14.1, 14, 0.7, 'Diversified banking leader with scale in consumer, commercial, and capital markets.'],
  ['BAC', 'Bank of America', 'Financial Services', 54.8, -0.23, 403, 13.4, 10, 0.8, 'Large consumer and commercial bank sensitive to rates and credit conditions.'],
  ['GS', 'Goldman Sachs', 'Financial Services', 698.7, 0.58, 242, 15.2, 12, 0.9, 'Investment banking and trading franchise serving institutions and wealth clients.'],
  ['MS', 'Morgan Stanley', 'Financial Services', 182.2, 0.41, 296, 16.7, 11, 0.8, 'Wealth management, advisory, and capital markets platform.'],
  ['V', 'Visa', 'Financial Services', 417.6, 0.67, 884, 34.5, 17, 0.7, 'Global payments network benefiting from digital transaction growth.'],
  ['MA', 'Mastercard', 'Financial Services', 613.4, 0.74, 561, 36.8, 18, 0.8, 'Global payments processor with strong cross-border transaction economics.'],
  ['SCHW', 'Charles Schwab', 'Financial Services', 105.3, -0.36, 190, 21.5, 14, 0.9, 'Brokerage and advisory platform with retail investor reach.'],
  ['BLK', 'BlackRock', 'Financial Services', 1092.7, 0.49, 163, 23.1, 15, 0.8, 'Asset management giant with scale across passive and active products.'],
  ['C', 'Citigroup', 'Financial Services', 88.6, -0.14, 174, 11.7, 8, 0.9, 'Global bank working through a long operational simplification effort.'],
  ['USB', 'U.S. Bancorp', 'Financial Services', 61.5, 0.21, 103, 12.8, 7, 0.7, 'Regional banking franchise with payments and consumer lending exposure.'],
  ['UNH', 'UnitedHealth Group', 'Healthcare', 641.3, 0.37, 593, 22.6, 15, 0.6, 'Managed care and healthcare services platform with wide scale advantages.'],
  ['LLY', 'Eli Lilly', 'Healthcare', 1188.4, 1.92, 1105, 58.9, 32, 1.2, 'Drugmaker benefiting from obesity, diabetes, and pipeline momentum.'],
  ['JNJ', 'Johnson & Johnson', 'Healthcare', 178.6, -0.11, 468, 16.4, 7, 0.5, 'Diversified healthcare company with device and pharmaceutical exposure.'],
  ['PFE', 'Pfizer', 'Healthcare', 41.8, -0.62, 236, 14.2, 3, 0.9, 'Large pharmaceutical company navigating post-pandemic revenue normalization.'],
  ['MRK', 'Merck', 'Healthcare', 142.5, 0.44, 361, 18.3, 10, 0.7, 'Pharmaceutical company with oncology leadership and pipeline depth.'],
  ['ABBV', 'AbbVie', 'Healthcare', 214.8, 0.63, 379, 18.9, 12, 0.6, 'Biopharma company balancing mature cash flows and new product growth.'],
  ['TMO', 'Thermo Fisher Scientific', 'Healthcare', 612.7, 0.55, 214, 25.6, 13, 0.8, 'Life sciences tools and diagnostics supplier for research and production labs.'],
  ['ISRG', 'Intuitive Surgical', 'Healthcare', 477.9, 1.27, 172, 63.5, 20, 1.0, 'Robotic surgery platform with installed-base and procedure growth.'],
  ['COST', 'Costco', 'Consumer', 1022.5, 0.69, 455, 49.2, 19, 0.7, 'Membership warehouse retailer with strong pricing power and loyalty.'],
  ['WMT', 'Walmart', 'Consumer', 118.4, 0.33, 955, 33.6, 13, 0.5, 'Scaled retailer blending physical stores, logistics, and digital commerce.'],
  ['HD', 'Home Depot', 'Consumer', 467.2, 0.48, 463, 26.8, 14, 0.7, 'Home improvement retailer linked to housing, renovation, and contractor demand.'],
  ['SBUX', 'Starbucks', 'Consumer', 122.3, -0.41, 141, 29.4, 11, 0.9, 'Global coffee brand with digital loyalty, store traffic, and margin focus.'],
  ['NKE', 'Nike', 'Consumer', 101.2, -0.86, 150, 31.1, 8, 1.0, 'Athletic apparel brand managing product cycles and global wholesale demand.'],
  ['MCD', 'McDonald’s', 'Consumer', 372.7, 0.57, 278, 28.5, 12, 0.6, 'Franchise restaurant model with brand power and resilient cash flow.'],
  ['LOW', 'Lowe’s', 'Consumer', 318.4, 0.52, 181, 24.7, 15, 0.7, 'Home improvement retailer with productivity and share repurchase support.'],
  ['TGT', 'Target', 'Consumer', 176.5, -0.17, 82, 17.3, 7, 0.8, 'General merchandise retailer balancing margins, traffic, and inventory mix.'],
  ['CAT', 'Caterpillar', 'Industrials', 421.1, 0.73, 213, 20.8, 13, 0.9, 'Heavy equipment maker tied to construction, mining, and infrastructure cycles.'],
  ['DE', 'Deere', 'Industrials', 504.8, 0.94, 142, 18.7, 14, 0.9, 'Agricultural and construction machinery producer with precision technology tailwinds.'],
  ['GE', 'GE Aerospace', 'Industrials', 256.6, 1.08, 275, 35.2, 16, 1.0, 'Aerospace supplier focused on jet engines, services, and defense demand.'],
  ['RTX', 'RTX', 'Industrials', 146.3, 0.29, 195, 22.4, 10, 0.7, 'Aerospace and defense platform with recurring aftermarket and defense programs.'],
  ['HON', 'Honeywell', 'Industrials', 271.4, 0.31, 175, 24.2, 11, 0.7, 'Industrial technology and automation company with diversified end markets.'],
  ['XOM', 'Exxon Mobil', 'Energy', 149.5, -0.28, 619, 14.4, 9, 0.9, 'Integrated energy producer with upstream scale and shareholder return focus.'],
  ['CVX', 'Chevron', 'Energy', 168.2, -0.19, 319, 15.1, 8, 0.9, 'Integrated oil major balancing production growth and capital discipline.'],
  ['SLB', 'SLB', 'Energy', 65.7, 0.84, 94, 18.5, 10, 1.0, 'Oilfield services provider benefiting from global energy project activity.'],
  ['DIS', 'Disney', 'Communication Services', 144.9, 0.21, 262, 29.8, 11, 0.9, 'Media, parks, and streaming ecosystem with global entertainment brands.'],
  ['TMUS', 'T-Mobile US', 'Communication Services', 281.7, 0.63, 324, 23.4, 16, 0.7, 'Wireless carrier still expanding share through network and customer gains.'],
  ['VZ', 'Verizon', 'Communication Services', 49.3, -0.12, 208, 9.6, 4, 0.5, 'Telecom operator prized more for cash flow and yield than rapid growth.'],
  ['NEE', 'NextEra Energy', 'Utilities', 83.7, 0.14, 177, 20.3, 9, 0.5, 'Utility and renewable energy leader with long-dated infrastructure projects.'],
  ['SO', 'Southern Company', 'Utilities', 87.2, 0.18, 95, 19.7, 7, 0.4, 'Regulated utility with steady cash flows and transmission expansion plans.'],
  ['DUK', 'Duke Energy', 'Utilities', 121.8, 0.22, 99, 18.6, 6, 0.4, 'Utility operator with defensive earnings and capital spending visibility.'],
  ['TSLA', 'Tesla', 'Automotive', 327.5, -1.76, 1048, 62.8, 22, 1.8, 'Electric vehicle and energy platform with cyclical sentiment swings.'],
  ['UBER', 'Uber', 'Transportation', 131.6, 1.11, 252, 41.3, 27, 1.3, 'Ride-sharing and delivery network with improving operating leverage.'],
  ['PLD', 'Prologis', 'Real Estate', 155.7, 0.27, 145, 35.1, 12, 0.7, 'Industrial real estate owner tied to logistics and warehouse demand.'],
  ['AMT', 'American Tower', 'Real Estate', 246.9, -0.08, 114, 29.2, 9, 0.6, 'Wireless tower real estate platform supported by mobile data growth.'],
  ['LIN', 'Linde', 'Materials', 564.4, 0.59, 263, 31.0, 15, 0.7, 'Industrial gases supplier with long contracts and steady margin profile.'],
  ['FCX', 'Freeport-McMoRan', 'Materials', 61.9, 0.97, 89, 18.1, 11, 1.1, 'Copper miner leveraged to commodity cycles and electrification demand.'],
  ['BRK.B', 'Berkshire Hathaway', 'Financial Services', 570.0, -0.35, 800.44, 13.83, 13, 0.6, 'Diversified holding company spanning insurance, railroads, utilities, and high-quality equity stakes.'],
  ['KO', 'Coca-Cola', 'Consumer', 96.99, 0.97, 418.41, 28.53, 9, 0.5, 'Global beverage leader with strong brand power, distribution scale, and resilient cash flow.'],
  ['PG', 'Procter & Gamble', 'Consumer', 169.37, 0.99, 392.56, 25.51, 10, 0.45, 'Consumer staples company with a broad brand portfolio and consistent cash generation.'],
  ['PEP', 'PepsiCo', 'Consumer', 140.54, 1.12, 192.12, 17.66, 8, 0.5, 'Food and beverage giant with snack leadership and global distribution reach.'],
  ['CSCO', 'Cisco Systems', 'Technology', 90.64, -4.24, 360.57, 24.17, 10, 0.8, 'Networking and infrastructure provider benefiting from enterprise connectivity and security demand.'],
  ['IBM', 'IBM', 'Technology', 224.44, 0.25, 214.01, 19.1, 9, 0.9, 'Enterprise technology company focused on hybrid cloud, consulting, and mission-critical software.'],
  ['TXN', 'Texas Instruments', 'Technology', 263.75, -7.67, 242.91, 34.16, 12, 1.0, 'Analog semiconductor leader serving industrial and embedded electronics customers.'],
  ['AMAT', 'Applied Materials', 'Technology', 302.63, -10.88, 242.1, 26.13, 18, 1.2, 'Semiconductor equipment supplier tied to chip fabrication investment cycles.'],
  ['MU', 'Micron Technology', 'Technology', 594.51, -14.02, 680.71, 13.46, 24, 1.6, 'Memory and storage chip producer leveraged to data center, AI, and device demand.'],
  ['ANET', 'Arista Networks', 'Technology', 167.62, -11.6, 214.25, 44.58, 29, 1.4, 'High-speed cloud networking company serving hyperscale and enterprise data centers.'],
  ['BKNG', 'Booking Holdings', 'Consumer', 144.91, -1.55, 109.12, 15.14, 19, 1.1, 'Online travel platform with strong profitability across lodging and trip booking services.'],
  ['ABNB', 'Airbnb', 'Consumer', 170.36, -1.37, 101.7, 31.9, 22, 1.3, 'Global travel marketplace connecting hosts and guests through an asset-light platform model.'],
  ['COP', 'ConocoPhillips', 'Energy', 136.12, 0.89, 162.78, 14.28, 11, 1.0, 'Exploration and production company with commodity leverage and capital return focus.'],
  ['AXP', 'American Express', 'Financial Services', 301.7, -3.01, 203.35, 17.0, 18, 0.9, 'Payments and premium card issuer with strong affluent consumer and small-business exposure.'],
  ['SPGI', 'S&P Global', 'Financial Services', 439.57, -0.68, 128.18, 26.13, 14, 0.7, 'Financial data, ratings, and index company benefiting from recurring information demand.'],
  ['ADP', 'Automatic Data Processing', 'Technology', 301.71, 0.29, 119.96, 26.75, 12, 0.6, 'Payroll and human capital management provider with sticky enterprise workflows.'],
  ['AMGN', 'Amgen', 'Healthcare', 435.64, -0.64, 237.86, 25.27, 10, 0.6, 'Biotechnology company with established therapies, cash generation, and pipeline optionality.'],
  ['DHR', 'Danaher', 'Healthcare', 220.36, -2.99, 155.75, 36.01, 13, 0.8, 'Life sciences and diagnostics platform known for operational discipline and recurring demand.'],
  ['CMCSA', 'Comcast', 'Communication Services', 24.9, 0.2, 88.42, 7.83, 7, 0.7, 'Cable, broadband, and media company balancing connectivity cash flow with content assets.'],
  ['BMY', 'Bristol Myers Squibb', 'Healthcare', 58.8, 0.82, 120.19, 13.01, 7, 0.6, 'Pharmaceutical company with established therapies, oncology exposure, and pipeline execution focus.'],
  ['TSM', 'Taiwan Semiconductor Manufacturing', 'Technology', 318.71, -9.37, 8265.31, 22.4, 30, 1.4, 'Foundry leader manufacturing advanced chips for smartphones, servers, and AI accelerators.'],
  ['ACN', 'Accenture', 'Technology', 221.17, 1.19, 136.15, 17.67, 12, 0.7, 'Global consulting and technology services firm with deep enterprise digital transformation exposure.'],
  ['BA', 'Boeing', 'Industrials', 155.89, -2.85, 123.54, 16.14, 10, 1.4, 'Aerospace manufacturer tied to commercial aircraft demand, defense programs, and execution recovery.'],
  ['GILD', 'Gilead Sciences', 'Healthcare', 166.43, -0.02, 208.2, 18.5, 8, 0.6, 'Biopharmaceutical company with antiviral, oncology, and immunology franchises.'],
  ['CME', 'CME Group', 'Financial Services', 307.56, 0.45, 110.3, 25.23, 11, 0.6, 'Derivative exchange operator with recurring transaction, data, and clearing revenue.'],
  ['CB', 'Chubb', 'Financial Services', 371.63, 0.46, 141.99, 13.03, 12, 0.6, 'Global property and casualty insurer with disciplined underwriting and strong pricing power.']
];

const liveQuoteSnapshot = Object.fromEntries([
  ['AAPL', [342.56, -1.81]],
  ['MSFT', [484.52, -2.68]],
  ['NVDA', [125.53, -13.8]],
  ['AMZN', [246.82, -3.97]],
  ['GOOGL', [265.29, -2.6]],
  ['META', [560.84, -5.87]],
  ['AMD', [424.39, -13.26]],
  ['AVGO', [304.41, -12.21]],
  ['ORCL', [101.19, -8.49]],
  ['CRM', [180.62, -1.47]],
  ['ADBE', [217.71, -1.77]],
  ['NOW', [87.61, -1.36]],
  ['NFLX', [56.73, -2.91]],
  ['INTC', [51.28, -7.77]],
  ['QCOM', [149.94, -7.38]],
  ['PANW', [343.32, -4.94]],
  ['CRWD', [229.44, -5.69]],
  ['SNOW', [254.82, -5.18]],
  ['JPM', [310.53, -2.98]],
  ['BAC', [47.04, -3.11]],
  ['GS', [790.69, -6.69]],
  ['MS', [165.67, -5.31]],
  ['V', [401.87, 0.06]],
  ['MA', [625.59, -0.1]],
  ['SCHW', [90.16, -2.05]],
  ['BLK', [1101.72, -2.97]],
  ['C', [110.62, -3.96]],
  ['USB', [56.05, -2.11]],
  ['UNH', [339.85, 2.88]],
  ['LLY', [1347.11, -0.24]],
  ['JNJ', [270.47, 1.37]],
  ['PFE', [27.4, -0.42]],
  ['MRK', [133.72, 0.74]],
  ['ABBV', [286.2, 1.01]],
  ['TMO', [669.54, -2.71]],
  ['ISRG', [399.05, -1.93]],
  ['COST', [1102.15, 0.93]],
  ['WMT', [127.95, 1.65]],
  ['HD', [339.04, 0.72]],
  ['SBUX', [103.13, -1.21]],
  ['NKE', [32.92, -4.06]],
  ['MCD', [273.24, 0.35]],
  ['LOW', [220.84, 0.8]],
  ['TGT', [165.83, -0.9]],
  ['CAT', [510.45, -5.01]],
  ['DE', [609.25, -2.5]],
  ['GE', [309.62, -2.9]],
  ['RTX', [190.17, -1.6]],
  ['HON', [212.64, -2.28]],
  ['XOM', [159.99, 0.7]],
  ['CVX', [208.37, 0.95]],
  ['SLB', [45.89, -4.18]],
  ['DIS', [117.98, -1.87]],
  ['TMUS', [165.6, 1.9]],
  ['VZ', [46.48, 1.71]],
  ['NEE', [83.45, -0.33]],
  ['SO', [93.13, -0.16]],
  ['DUK', [129.78, 0.76]],
  ['TSLA', [345.82, -7.57]],
  ['UBER', [63.47, -3.25]],
  ['PLD', [122.5, -0.64]],
  ['AMT', [184.21, 1.71]],
  ['LIN', [502.83, -1.42]],
  ['FCX', [45.99, -6.37]],
  ['BRK.B', [570.0, -0.35]],
  ['KO', [96.99, 0.97]],
  ['PG', [169.37, 0.99]],
  ['PEP', [140.54, 1.12]],
  ['CSCO', [90.64, -4.24]],
  ['IBM', [224.44, 0.25]],
  ['TXN', [263.75, -7.67]],
  ['AMAT', [302.63, -10.88]],
  ['MU', [594.51, -14.02]],
  ['ANET', [167.62, -11.6]],
  ['BKNG', [144.91, -1.55]],
  ['ABNB', [170.36, -1.37]],
  ['COP', [136.12, 0.89]],
  ['AXP', [301.7, -3.01]],
  ['SPGI', [439.57, -0.68]],
  ['ADP', [301.71, 0.29]],
  ['AMGN', [435.64, -0.64]],
  ['DHR', [220.36, -2.99]],
  ['CMCSA', [24.9, 0.2]],
  ['BMY', [58.8, 0.82]],
  ['TSM', [318.71, -9.37]],
  ['ACN', [221.17, 1.19]],
  ['BA', [155.89, -2.85]],
  ['GILD', [166.43, -0.02]],
  ['CME', [307.56, 0.45]],
  ['CB', [371.63, 0.46]]
]);

const stocks = rawStocks.map(([symbol, name, sector, currentPrice, dailyChange, marketCap, pe, annualGrowth, volatility, description]) => {
  const liveQuote = liveQuoteSnapshot[symbol];
  return {
    symbol,
    name,
    sector,
    currentPrice: liveQuote ? liveQuote[0] : currentPrice,
    dailyChange: liveQuote ? liveQuote[1] : dailyChange,
    marketCap,
    pe,
    annualGrowth,
    volatility,
    description
  };
}).map((stock) => ({
  ...stock,
  history: buildHistory(stock)
})).map((stock, _, allStocks) => ({
  ...stock,
  compareSymbols: allStocks.filter((candidate) => candidate.sector === stock.sector && candidate.symbol !== stock.symbol).slice(0, 4).map((candidate) => candidate.symbol)
}));

const benchmark = {
  symbol: 'SPY',
  name: 'S&P 500 Exchange-Traded Fund',
  sector: 'Benchmark',
  currentPrice: 689.81,
  dailyChange: -3.5,
  marketCap: 610.81,
  pe: 24.5,
  annualGrowth: 11.5,
  volatility: 0.65,
  description: 'Broad large-cap market benchmark used to compare performance.',
  history: null
};

benchmark.history = buildHistory(benchmark);

const backtestYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const benchmarkAnnualReturns = [18.4, 27.1, -18.1, 24.8, 13.4, 16.1, 11.2];

const strategies = [
  {
    id: 'quality-compounders',
    name: 'Quality compounders',
    rationale: 'Focuses on durable businesses with strong margins, healthy balance sheets, and long runways for compounding.',
    annualReturns: [22.5, 24.4, -11.5, 27.9, 18.7, 20.4, 13.9]
  },
  {
    id: 'value-rotation',
    name: 'Value rotation',
    rationale: 'Looks for reasonably valued companies where expectations are modest and earnings resilience can surprise investors.',
    annualReturns: [10.6, 29.1, 4.5, 15.3, 10.9, 12.7, 8.4]
  },
  {
    id: 'momentum-leaders',
    name: 'Momentum leaders',
    rationale: 'Emphasizes relative strength and trend persistence while accepting more volatility along the way.',
    annualReturns: [28.9, 18.8, -23.7, 35.2, 24.3, 19.8, 12.2]
  },
  {
    id: 'dividend-stability',
    name: 'Dividend stability',
    rationale: 'Targets steadier cash-generating businesses that may lag in euphoric markets but usually hold up better in rough patches.',
    annualReturns: [7.9, 16.1, -4.2, 11.4, 9.2, 10.1, 7.1]
  },
  {
    id: 'ai-infrastructure',
    name: 'AI infrastructure basket',
    rationale: 'Builds exposure to data center, semiconductor, networking, and software suppliers powering artificial intelligence demand.',
    annualReturns: [31.5, 22.6, -19.4, 40.8, 28.2, 26.5, 17.6]
  },
  {
    id: 'balanced-barbell',
    name: 'Balanced barbell',
    rationale: 'Combines growth leaders with steadier cash-flow businesses to smooth out portfolio swings without fully giving up upside.',
    annualReturns: [16.7, 23.2, -9.8, 21.6, 15.5, 16.2, 10.4]
  }
];

const lessonBlueprints = [
  ['Beginner', 'How stock prices move', 'Learn what pushes a stock price higher or lower over time.', ['Identify one business reason and one market reason a stock might move.', 'Compare a one-day move with a five-year trend.', 'Explain why price movement alone does not tell the full story.']],
  ['Beginner', 'Tickers, exchanges, and sectors', 'Understand symbols, listing venues, and why sector grouping helps comparisons.', ['Pick two stocks in the same sector.', 'Name one reason cross-sector comparisons can be misleading.', 'Explain why tickers matter in fast-moving markets.']],
  ['Beginner', 'Reading a stock quote', 'Practice interpreting price, daily change, valuation, and market capitalization.', ['Read a stock quote and summarize it in one sentence.', 'Explain what market capitalization measures.', 'Compare daily change with valuation.']],
  ['Beginner', 'Risk and reward basics', 'See why higher upside often comes with wider price swings and deeper drawdowns.', ['Describe a trade-off between safety and upside.', 'Name one way investors limit position risk.', 'Explain why volatility feels different from permanent loss.']],
  ['Beginner', 'Diversification in plain English', 'Spread exposure so one mistake or one industry does not control the full portfolio.', ['List three different sectors to combine.', 'Explain what diversification can and cannot do.', 'Describe one over-diversification risk.']],
  ['Beginner', 'Order types and execution', 'Learn the difference between market orders, limit orders, and why execution quality matters.', ['Describe when a limit order can help.', 'Explain why a market order may be risky in thin trading.', 'Name one trade-off between speed and price control.']],
  ['Beginner', 'Market capitalization and business scale', 'Use market cap to frame company size, maturity, and possible risk differences.', ['Compare a mega-cap with a mid-cap.', 'Explain why size does not guarantee better returns.', 'Describe how scale can create both strength and complexity.']],
  ['Beginner', 'Valuation with the price-to-earnings ratio', 'Use the price-to-earnings ratio as a starting point for valuation discussion.', ['Explain why a lower P/E is not automatically better.', 'Describe one reason high-growth firms often trade at higher multiples.', 'Compare valuation only after checking profitability.']],
  ['Beginner', 'Long-term compounding', 'See how steady gains over many years can outweigh short-term noise.', ['Define compounding in your own words.', 'Explain why time matters more than precision for long-term investors.', 'List one habit that helps compounding work.']],
  ['Beginner', 'Building a starter watchlist', 'Create a repeatable watchlist process instead of jumping between random names.', ['Pick five stocks across different sectors.', 'Explain why a watchlist should mix quality and curiosity.', 'Describe one metric you would track every month.']],
  ['Intermediate', 'Revenue growth versus earnings growth', 'Understand why sales growth, margins, and expense control all matter.', ['Explain how revenue can rise while earnings fall.', 'Compare growth quality with growth speed.', 'Describe why margins matter in expansion years.']],
  ['Intermediate', 'Free cash flow and business quality', 'Measure whether reported profits are turning into spendable cash.', ['Explain why free cash flow can matter more than headline earnings.', 'Name one type of business that naturally converts cash well.', 'Describe how capital intensity affects cash generation.']],
  ['Intermediate', 'Operating margins and leverage', 'Learn how fixed costs can amplify gains and losses as revenue changes.', ['Define operating leverage.', 'Explain why software firms can scale differently from retailers.', 'Describe a margin warning sign.']],
  ['Intermediate', 'Balance sheet strength', 'Use cash, debt, and flexibility to judge resilience in harder markets.', ['Name one reason leverage can become dangerous.', 'Explain why cash on hand matters during slowdowns.', 'Describe when debt can still be productive.']],
  ['Intermediate', 'Compare within a sector first', 'Build cleaner analysis by comparing similar business models before broad market comparisons.', ['Choose two sector peers and list what you would compare first.', 'Explain why a bank and a chipmaker should not share the same rubric.', 'Describe a useful peer group rule.']],
  ['Intermediate', 'Position sizing and concentration', 'Decide how large a position should be relative to confidence and risk.', ['Describe how conviction and volatility influence position size.', 'Explain why a great idea can still be too large.', 'List one sign of hidden concentration.']],
  ['Intermediate', 'Drawdowns and recovery math', 'Learn why avoiding very large losses can matter as much as capturing big gains.', ['Calculate what a 50 percent drawdown requires to recover.', 'Explain why recovery math gets harder as losses grow.', 'Describe one habit that can reduce drawdown risk.']],
  ['Intermediate', 'Dollar-cost averaging versus lump sum', 'Compare staged buying with immediate deployment depending on opportunity and risk tolerance.', ['Name one strength of dollar-cost averaging.', 'Name one strength of lump-sum investing.', 'Explain when investor psychology matters more than math.']],
  ['Intermediate', 'Rebalancing a portfolio', 'Maintain intended exposures instead of letting winners silently dominate the account.', ['Describe what rebalancing accomplishes.', 'Explain why taxes and transaction costs still matter.', 'List one simple rebalancing schedule.']],
  ['Intermediate', 'Backtesting with humility', 'Use backtests to learn patterns without pretending they guarantee future results.', ['Explain one limit of backtesting.', 'Describe what overfitting looks like.', 'Name one reason benchmarks matter in strategy evaluation.']],
  ['Advanced', 'Margin of safety', 'Study why investors want a gap between market price and conservative intrinsic value estimates.', ['Explain why uncertainty makes a margin of safety useful.', 'Describe one trap of false precision in valuation.', 'Name one business that may deserve a wider safety margin.']],
  ['Advanced', 'Moats and competitive durability', 'Look beyond current profits to the forces that protect or erode long-term returns.', ['List two sources of competitive advantage.', 'Explain why moats can shrink even when profits are high today.', 'Describe one moat you would not fully trust.']],
  ['Advanced', 'Cyclicals versus secular growers', 'Separate temporary cycle benefits from durable long-run structural expansion.', ['Define a cyclical business in plain English.', 'Explain why secular growth can still face valuation risk.', 'Describe why timing matters more for cyclicals.']],
  ['Advanced', 'Capital allocation discipline', 'Judge how leadership uses cash through buybacks, reinvestment, debt reduction, and acquisitions.', ['Name one sign of thoughtful capital allocation.', 'Explain why buybacks can destroy value at the wrong price.', 'Describe when reinvestment deserves priority over distributions.']],
  ['Advanced', 'Benchmark-aware portfolio design', 'Judge performance relative to opportunity cost, not just absolute gains.', ['Explain why beating cash is different from beating the market.', 'Describe one role for a benchmark in strategy review.', 'List one danger of hugging the benchmark too closely.']],
  ['Advanced', 'Scenario planning and ranges', 'Think in outcomes and probabilities rather than one fragile forecast.', ['Write one bull case and one bear case for a stock.', 'Explain why ranges beat single-point predictions.', 'Describe how you would size uncertainty.']],
  ['Advanced', 'Factor exposure and crowding', 'Understand how growth, value, quality, or momentum tilts can drive portfolios more than stock picking.', ['Define factor exposure simply.', 'Explain what crowding means in a popular trade.', 'Describe why factor awareness helps risk control.']],
  ['Advanced', 'Risk budgeting across positions', 'Treat portfolio risk as something allocated intentionally, not discovered later.', ['Explain the difference between capital weight and risk weight.', 'Describe why correlated positions can surprise investors.', 'List one reason a small position can still drive risk.']],
  ['Advanced', 'Multiple expansion and compression', 'Study how valuation changes can help or hurt returns even if the business performs well.', ['Define multiple expansion.', 'Explain how a strong company can deliver weak returns from too high a starting price.', 'Describe why patience matters with expensive compounders.']],
  ['Advanced', 'Thesis review and exit rules', 'Write what must happen, what would break the thesis, and what triggers a reassessment.', ['List one reason to update a thesis.', 'Explain the difference between volatility and thesis damage.', 'Describe one disciplined exit trigger.']]
];

const lessons = lessonBlueprints.map(([difficulty, title, summary, prompts], index) => ({
  id: `${difficulty.toLowerCase()}-${index + 1}`,
  difficulty,
  title,
  summary,
  prompts
}));

const glossaryTerms = [
  {
    term: 'Bull market',
    shortDefinition: 'A period when prices trend higher and investor confidence is generally strong.',
    longDefinition: 'A bull market is a sustained stretch in which many stock prices rise over time. It often reflects improving earnings, easier financial conditions, or stronger investor optimism, but not every stock participates equally.',
    question: 'Why can a bull market still contain weak stocks or weak sectors?',
    answer: 'Because market trends are broad averages, while individual companies still depend on their own earnings, valuation, and competitive position.'
  },
  {
    term: 'Bear market',
    shortDefinition: 'A period of broad market weakness where prices fall and risk appetite shrinks.',
    longDefinition: 'A bear market is a prolonged market decline, often connected to recession fears, tighter financial conditions, or falling profit expectations. Bear markets can reset valuations and expose weak balance sheets.',
    question: 'What tends to matter more in a bear market: excitement or balance-sheet strength?',
    answer: 'Balance-sheet strength usually matters more because weaker financing conditions can punish fragile businesses.'
  },
  {
    term: 'Volatility',
    shortDefinition: 'How widely and how quickly a price tends to move up and down.',
    longDefinition: 'Volatility measures how large and frequent price swings are. High volatility does not automatically mean poor quality, but it does mean outcomes can feel more emotionally demanding and risk control becomes more important.',
    question: 'Why can a great company still be a volatile stock?',
    answer: 'Because expectations, valuation, sentiment, and macro conditions can make even strong businesses trade with wide swings.'
  },
  {
    term: 'Diversification',
    shortDefinition: 'Spreading risk across different holdings so one mistake hurts less.',
    longDefinition: 'Diversification means holding a mix of businesses, sectors, or strategies so a single problem does not dominate total results. It reduces single-name and single-theme risk, but it cannot remove market risk entirely.',
    question: 'What kind of risk can diversification reduce most effectively?',
    answer: 'It is most effective at reducing company-specific or sector-specific risk.'
  },
  {
    term: 'Market capitalization',
    shortDefinition: 'The market value of a company’s equity, calculated from share price times shares outstanding.',
    longDefinition: 'Market capitalization shows how large the market currently values a company’s equity base. Larger market caps often imply broader coverage and steadier operations, but size does not guarantee better performance.',
    question: 'Why is market cap often more useful than share price alone?',
    answer: 'Because share price does not account for how many shares exist, while market cap reflects total equity value.'
  },
  {
    term: 'Price-to-earnings ratio',
    shortDefinition: 'A valuation metric that compares stock price to earnings per share.',
    longDefinition: 'The price-to-earnings ratio, often shortened to P/E, shows how much investors are paying for each dollar of earnings. It becomes more useful when comparing similar profitable businesses with similar growth and risk profiles.',
    question: 'Why should a price-to-earnings ratio usually be compared within a sector?',
    answer: 'Because different industries naturally trade at different margin structures, growth rates, and capital intensity levels.'
  },
  {
    term: 'Earnings per share',
    shortDefinition: 'Profit allocated to each share after dividing net income by shares outstanding.',
    longDefinition: 'Earnings per share, or EPS, gives a per-share view of profitability. Investors often track how EPS grows over time, but they still need to study revenue, margins, and share-count changes to understand what is driving it.',
    question: 'Can earnings per share rise even if total profit is flat?',
    answer: 'Yes. Share buybacks can reduce the share count and increase earnings per share even without higher total profit.'
  },
  {
    term: 'Free cash flow',
    shortDefinition: 'Cash left after operating expenses and capital spending needed to run the business.',
    longDefinition: 'Free cash flow shows how much real cash remains after a company funds operations and necessary investment. Strong free cash flow can support buybacks, debt reduction, acquisitions, or reinvestment.',
    question: 'Why do investors care about free cash flow in addition to earnings?',
    answer: 'Because free cash flow shows whether accounting profits are actually turning into usable cash.'
  },
  {
    term: 'Operating margin',
    shortDefinition: 'The share of revenue left after core operating costs are paid.',
    longDefinition: 'Operating margin measures how efficiently a company turns revenue into operating profit. Expanding margins often signal better scale, pricing power, or cost discipline, while shrinking margins may signal pressure.',
    question: 'Why can margin trends matter even when revenue is still growing?',
    answer: 'Because weaker margins can mean growth is becoming less profitable or more expensive to sustain.'
  },
  {
    term: 'Beta',
    shortDefinition: 'A rough measure of how sensitive a stock is relative to broad market moves.',
    longDefinition: 'Beta compares a stock’s historical movement to the overall market. A beta above one suggests the stock often moves more than the market, while a beta below one suggests smaller relative swings.',
    question: 'What does a beta above one usually suggest?',
    answer: 'It usually suggests the stock has tended to move more sharply than the market.'
  },
  {
    term: 'Drawdown',
    shortDefinition: 'The decline from a previous peak to a later trough.',
    longDefinition: 'Drawdown measures how far an investment falls before it recovers. It is a useful reality check because large declines require even larger gains to climb back to the old peak.',
    question: 'Why do drawdowns matter so much to long-term investors?',
    answer: 'Because very large losses demand disproportionately large future gains just to get back to even.'
  },
  {
    term: 'Compound annual growth rate',
    shortDefinition: 'The smoothed annual rate needed to grow from a start value to an end value over time.',
    longDefinition: 'Compound annual growth rate, or CAGR, translates a total gain across multiple years into an annualized growth rate. It is useful for comparing multi-year results across different stocks or strategies.',
    question: 'Why is compound annual growth rate helpful when comparing long periods?',
    answer: 'Because it turns lumpy multi-year performance into one annualized rate that is easier to compare.'
  },
  {
    term: 'Dollar-cost averaging',
    shortDefinition: 'Investing the same amount at regular intervals instead of all at once.',
    longDefinition: 'Dollar-cost averaging spreads purchases over time. It may reduce emotional stress and timing pressure, but it can underperform immediate investing when markets trend higher persistently.',
    question: 'What is the main psychological benefit of dollar-cost averaging?',
    answer: 'It can make investors less dependent on getting one exact entry point right.'
  },
  {
    term: 'Limit order',
    shortDefinition: 'An order that sets the maximum buy price or minimum sell price you will accept.',
    longDefinition: 'A limit order gives the investor price control. The trade will only execute at the set price or better, but the trade may not happen at all if the market never reaches that price.',
    question: 'What is the main trade-off of using a limit order?',
    answer: 'You gain price control, but you may miss the trade if the market does not reach your price.'
  },
  {
    term: 'Stop-loss',
    shortDefinition: 'A preset exit level intended to cap downside if a trade moves against you.',
    longDefinition: 'A stop-loss is a risk-control rule that tells an investor to exit when price falls to a certain level. It can help protect capital, but it can also force exits during temporary volatility if placed poorly.',
    question: 'Why can a badly placed stop-loss still create problems?',
    answer: 'Because normal volatility may trigger the exit before the original thesis is truly broken.'
  },
  {
    term: 'Risk-reward ratio',
    shortDefinition: 'A comparison between possible downside and possible upside in a trade or investment.',
    longDefinition: 'The risk-reward ratio frames whether the potential upside seems large enough relative to the downside. Good investing still requires probability and thesis quality, not just attractive payoff math.',
    question: 'Why is a high upside estimate alone not enough for a strong risk-reward ratio?',
    answer: 'Because the chance of achieving that upside and the chance of permanent loss both matter.'
  },
  {
    term: 'Rebalancing',
    shortDefinition: 'Adjusting holdings back toward target weights after prices move.',
    longDefinition: 'Rebalancing stops winning positions from silently becoming too large and restores intended portfolio exposure. It can reduce risk drift, although taxes and transaction costs still matter.',
    question: 'Why do investors rebalance instead of simply letting winners run forever?',
    answer: 'Because position sizes can grow beyond the original risk plan and distort the portfolio.'
  },
  {
    term: 'Margin of safety',
    shortDefinition: 'A buffer between market price and a conservative estimate of value.',
    longDefinition: 'A margin of safety accounts for uncertainty in analysis. When investors demand a wider gap between price and estimated value, they leave room for bad assumptions, cyclical pressure, or unforeseen problems.',
    question: 'Why does uncertainty usually call for a larger margin of safety?',
    answer: 'Because the more fragile your assumptions are, the more room you need for error.'
  },
  {
    term: 'Moat',
    shortDefinition: 'A durable competitive advantage that helps protect profits over time.',
    longDefinition: 'A moat can come from brand strength, network effects, switching costs, scale, regulation, or intellectual property. Strong moats can support higher returns for long periods, but they still need monitoring.',
    question: 'What is one common source of a moat?',
    answer: 'Switching costs, scale, network effects, strong brands, and proprietary assets are all common moat sources.'
  },
  {
    term: 'Liquidity',
    shortDefinition: 'How easily an asset can be bought or sold without dramatically affecting its price.',
    longDefinition: 'Liquidity matters because investors often care not just about what something is worth but how easily they can enter or exit. Highly liquid stocks usually have tighter spreads and lower execution friction.',
    question: 'Why is liquidity important when placing larger trades?',
    answer: 'Because low liquidity can widen spreads and move price against you during execution.'
  },
  {
    term: 'Sector rotation',
    shortDefinition: 'Money shifting from one part of the market to another as leadership changes.',
    longDefinition: 'Sector rotation happens when investors favor different industries based on growth expectations, interest rates, economic cycles, or risk appetite. Strong fundamentals do not guarantee leadership if market preferences change.',
    question: 'What often triggers sector rotation?',
    answer: 'Changes in growth expectations, rates, valuations, or macroeconomic conditions can all trigger it.'
  },
  {
    term: 'Benchmark',
    shortDefinition: 'A reference index or fund used to judge performance.',
    longDefinition: 'A benchmark gives investors context for whether a strategy is adding value beyond a simple alternative. Without a benchmark, strong-looking absolute returns can still reflect missed opportunity or hidden risk.',
    question: 'Why is a benchmark useful even when a portfolio is profitable?',
    answer: 'Because it shows whether the portfolio outperformed a reasonable alternative after considering opportunity cost.'
  },
  {
    term: 'Valuation',
    shortDefinition: 'An estimate of what a business is worth relative to price.',
    longDefinition: 'Valuation connects business quality, growth, cash flow, and risk to the market price investors pay. A great business can still be a poor investment if the starting price already assumes too much future success.',
    question: 'Can a wonderful company still be a bad investment at the wrong price?',
    answer: 'Yes. If expectations are too high and valuation is too rich, future returns can still disappoint.'
  },
  {
    term: 'Opportunity cost',
    shortDefinition: 'The return you give up by choosing one option instead of another.',
    longDefinition: 'Opportunity cost reminds investors that capital is limited. Choosing a weak idea does not just risk losses; it also prevents that money from working in a stronger idea or a simpler benchmark.',
    question: 'How does opportunity cost change the way investors judge mediocre returns?',
    answer: 'It forces them to compare those returns with what the same money might have earned elsewhere.'
  }
];

function pickDistractors(values, correct, offset) {
  const unique = [...new Set(values.filter((value) => value !== correct))];
  const distractors = [];
  for (let index = 0; index < unique.length && distractors.length < 3; index += 1) {
    distractors.push(unique[(index + offset) % unique.length]);
  }
  return distractors;
}

function buildChoiceSet(correct, distractors, offset) {
  const correctIndex = offset % 4;
  const answers = new Array(4);
  let distractorIndex = 0;
  for (let index = 0; index < 4; index += 1) {
    if (index === correctIndex) answers[index] = correct;
    else {
      answers[index] = distractors[distractorIndex] || distractors[distractors.length - 1] || correct;
      distractorIndex += 1;
    }
  }
  return { answers, correctIndex };
}

function makeQuestion(id, difficulty, topic, question, correct, distractors, explanation, offset) {
  const choiceSet = buildChoiceSet(correct, distractors, offset);
  return {
    id,
    difficulty,
    topic,
    question,
    answers: choiceSet.answers,
    correctIndex: choiceSet.correctIndex,
    explanation
  };
}

const glossaryNames = glossaryTerms.map((term) => term.term);
const glossaryDefinitions = glossaryTerms.map((term) => term.shortDefinition);

const beginnerQuestions = glossaryTerms.flatMap((term, index) => ([
  makeQuestion(
    `beginner-term-${index}`,
    'Beginner',
    'Foundations',
    `Which investing term best matches this idea? ${term.shortDefinition}`,
    term.term,
    pickDistractors(glossaryNames, term.term, index + 1),
    `The correct term is ${term.term} because it matches that definition exactly.`,
    index
  ),
  makeQuestion(
    `beginner-definition-${index}`,
    'Beginner',
    'Foundations',
    `What is the best plain-English description of ${term.term}?`,
    term.shortDefinition,
    pickDistractors(glossaryDefinitions, term.shortDefinition, index + 3),
    term.longDefinition,
    index + 1
  )
]));

const intermediateConcepts = [
  {
    topic: 'Valuation',
    label: 'Comparing P/E ratios',
    question: 'When two profitable companies have similar growth and risk, what can a lower price-to-earnings ratio suggest?',
    correct: 'The stock may be cheaper relative to current earnings.',
    distractors: ['The company automatically has faster growth.', 'The balance sheet is guaranteed to be stronger.', 'The stock will outperform immediately.'],
    explanation: 'A lower P/E can suggest cheaper valuation, but only after growth, margins, and risk are also compared.',
    scenarioQuestion: 'Which situation is the best use case for a price-to-earnings comparison?',
    scenarioCorrect: 'Comparing two profitable peers in the same sector.',
    scenarioDistractors: ['Comparing a utility with an early-stage software company.', 'Comparing a profitable firm with a company that has no earnings.', 'Predicting next week’s price movement from a chart alone.'],
    scenarioExplanation: 'P/E comparisons work best for similar profitable businesses because sector economics matter.',
    applicationQuestion: 'Why might a very low P/E still be a warning sign?',
    applicationCorrect: 'The market may expect earnings to weaken or business risk to rise.',
    applicationDistractors: ['Because low P/E always means accounting fraud.', 'Because low P/E prevents price appreciation.', 'Because low P/E only appears in utilities.'],
    applicationExplanation: 'Sometimes a stock is cheap for a reason, so low multiples still require business analysis.'
  },
  {
    topic: 'Risk',
    label: 'Volatility versus permanent loss',
    question: 'What is the clearest difference between volatility and permanent loss?',
    correct: 'Volatility is price movement, while permanent loss is damage that may not recover.',
    distractors: ['They are always the same thing.', 'Volatility only happens in small-cap stocks.', 'Permanent loss matters only to traders.'],
    explanation: 'Volatility can be temporary, but permanent loss usually reflects a broken thesis or damaged business value.',
    scenarioQuestion: 'Which action best reflects healthy risk management?',
    scenarioCorrect: 'Sizing positions so one mistake cannot dominate the full portfolio.',
    scenarioDistractors: ['Putting all capital into the highest-conviction idea without a plan.', 'Ignoring drawdown math because the company is popular.', 'Buying only stocks that went up yesterday.'],
    scenarioExplanation: 'Good risk management starts with position sizing, diversification, and thesis discipline.',
    applicationQuestion: 'Why can a strong company still have a volatile stock?',
    applicationCorrect: 'Because valuation, sentiment, and macro conditions can still swing hard.',
    applicationDistractors: ['Because quality removes all price movement.', 'Because volatility only affects unprofitable companies.', 'Because a strong company cannot be widely owned.'],
    applicationExplanation: 'Even great businesses can be repriced quickly when expectations change.'
  },
  {
    topic: 'Diversification',
    label: 'Correlation and portfolio structure',
    question: 'What is the main goal of diversification?',
    correct: 'Reduce the impact of any single company, sector, or theme going wrong.',
    distractors: ['Guarantee a profit every year.', 'Avoid all market declines.', 'Own as many stocks as possible regardless of quality.'],
    explanation: 'Diversification reduces concentrated risk but does not eliminate market risk entirely.',
    scenarioQuestion: 'Which portfolio is more diversified?',
    scenarioCorrect: 'A portfolio spread across multiple sectors and business models.',
    scenarioDistractors: ['Five semiconductor stocks with similar customers.', 'Three airlines and two hotels.', 'Ten companies that all depend on the same commodity.'],
    scenarioExplanation: 'Owning several stocks is not enough if they all share the same core risk driver.',
    applicationQuestion: 'What is a common limit of diversification?',
    applicationCorrect: 'It cannot fully shield investors from a broad market selloff.',
    applicationDistractors: ['It forces every position to underperform.', 'It only works for bond portfolios.', 'It eliminates the need to understand holdings.'],
    applicationExplanation: 'Diversification helps most with stock-specific and sector-specific risk, not every macro shock.'
  },
  {
    topic: 'Orders',
    label: 'Execution choices',
    question: 'What is the main advantage of a limit order over a market order?',
    correct: 'It gives the investor more control over execution price.',
    distractors: ['It guarantees immediate execution.', 'It always delivers a better fill than any other order.', 'It eliminates portfolio risk.'],
    explanation: 'A limit order sets a maximum buy or minimum sell price, which adds control but not certainty of execution.',
    scenarioQuestion: 'When can a market order become more dangerous?',
    scenarioCorrect: 'When a stock is thinly traded or moving very quickly.',
    scenarioDistractors: ['When a stock is liquid and stable.', 'When the investor already knows the ticker symbol.', 'When a company has positive free cash flow.'],
    scenarioExplanation: 'Wide spreads and fast movement can create unexpectedly poor fills for market orders.',
    applicationQuestion: 'What is the trade-off of using a limit order?',
    applicationCorrect: 'You may not get filled if the market never reaches your price.',
    applicationDistractors: ['You are forced to buy more shares than planned.', 'You must hold the stock for one year.', 'You cannot cancel the order.'],
    applicationExplanation: 'Price control is helpful, but unfilled orders are the price of that control.'
  },
  {
    topic: 'Portfolio',
    label: 'Position sizing',
    question: 'Why does position sizing matter even when the thesis looks strong?',
    correct: 'Because any single idea can still go wrong or stay wrong longer than expected.',
    distractors: ['Because strong ideas never deserve meaningful weight.', 'Because sizing only matters for professional funds.', 'Because a good business guarantees a good stock return.'],
    explanation: 'Sizing reflects uncertainty, volatility, and the cost of being wrong.',
    scenarioQuestion: 'Which choice best reflects disciplined sizing?',
    scenarioCorrect: 'Making a volatile idea smaller than a steadier idea of similar conviction.',
    scenarioDistractors: ['Making the newest trade the largest by default.', 'Doubling every losing position automatically.', 'Sizing every stock equally regardless of business risk.'],
    scenarioExplanation: 'Risk-adjusted sizing keeps the portfolio from being accidentally driven by the wildest positions.',
    applicationQuestion: 'What is a hidden concentration risk?',
    applicationCorrect: 'Owning several different stocks that all depend on the same theme.',
    applicationDistractors: ['Holding cash during a volatile week.', 'Tracking a benchmark for context.', 'Rebalancing after strong gains.'],
    applicationExplanation: 'Different tickers can still share one underlying economic exposure.'
  },
  {
    topic: 'Cash flow',
    label: 'Free cash flow quality',
    question: 'Why do many investors care deeply about free cash flow?',
    correct: 'It shows whether reported profits are turning into usable cash.',
    distractors: ['It replaces revenue completely.', 'It only matters for banks.', 'It makes valuation irrelevant.'],
    explanation: 'Free cash flow helps investors judge how real and flexible the business economics are.',
    scenarioQuestion: 'Which business often has stronger cash conversion?',
    scenarioCorrect: 'A software company with recurring subscriptions and modest capital needs.',
    scenarioDistractors: ['A capital-heavy commodity project in buildout mode.', 'A retailer holding too much inventory.', 'A cyclical manufacturer during a sharp downturn.'],
    scenarioExplanation: 'Light-capital subscription businesses often convert a large share of operating profit into cash.',
    applicationQuestion: 'What can weak free cash flow hint at?',
    applicationCorrect: 'That the business may need heavy spending or that earnings quality deserves a closer look.',
    applicationDistractors: ['That price movement will stop immediately.', 'That the stock must be overvalued.', 'That margins will always expand next quarter.'],
    applicationExplanation: 'Weak cash conversion can reflect capital intensity, working capital strain, or weaker earnings quality.'
  },
  {
    topic: 'Margins',
    label: 'Operating leverage',
    question: 'What does operating leverage describe?',
    correct: 'How fixed costs can make profit grow faster or shrink faster than revenue.',
    distractors: ['How a company borrows from banks.', 'How many shares are outstanding.', 'How dividends are paid.'],
    explanation: 'When a business has meaningful fixed costs, revenue changes can have an amplified effect on operating profit.',
    scenarioQuestion: 'Why can software companies sometimes scale margins quickly?',
    scenarioCorrect: 'Because once the platform is built, added revenue can carry high incremental profit.',
    scenarioDistractors: ['Because they never face competition.', 'Because they do not pay employees.', 'Because accounting rules guarantee margin expansion.'],
    scenarioExplanation: 'Low incremental delivery costs can make mature software platforms highly scalable.',
    applicationQuestion: 'What is one warning sign in margin analysis?',
    applicationCorrect: 'Revenue is growing, but operating margin keeps shrinking.',
    applicationDistractors: ['Daily share price is flat for one session.', 'The company uses a ticker symbol.', 'Analysts cover the stock heavily.'],
    applicationExplanation: 'Weakening margins can mean growth is becoming less efficient or less profitable.'
  },
  {
    topic: 'Balance sheet',
    label: 'Debt and flexibility',
    question: 'Why does balance-sheet strength matter in difficult markets?',
    correct: 'Strong balance sheets give companies more flexibility when conditions worsen.',
    distractors: ['Because debt always boosts returns.', 'Because cash automatically doubles earnings.', 'Because only lenders care about balance sheets.'],
    explanation: 'Cash, manageable debt, and financial flexibility help businesses survive rough periods and invest when weaker rivals cannot.',
    scenarioQuestion: 'Which company is likely more resilient in a downturn?',
    scenarioCorrect: 'One with cash, manageable debt, and stable cash flow.',
    scenarioDistractors: ['One that depends on constant refinancing despite weak demand.', 'One with shrinking margins and heavy near-term maturities.', 'One relying on optimistic capital markets sentiment.'],
    scenarioExplanation: 'Resilience comes from optionality and not needing perfect external conditions.',
    applicationQuestion: 'When can debt still be sensible?',
    applicationCorrect: 'When cash flows are stable and the borrowed capital supports attractive returns.',
    applicationDistractors: ['When management wants a quick stock-price reaction only.', 'When the company cannot service interest expense.', 'When no clear reinvestment plan exists.'],
    applicationExplanation: 'Debt is a tool, and it works best when the business can comfortably carry it.'
  },
  {
    topic: 'Drawdowns',
    label: 'Recovery math',
    question: 'If a position falls 50 percent, roughly what gain is needed to recover back to even?',
    correct: 'A 100 percent gain.',
    distractors: ['A 50 percent gain.', 'A 25 percent gain.', 'A 75 percent gain.'],
    explanation: 'Losing half of a position means doubling from the lower base just to return to the original level.',
    scenarioQuestion: 'What lesson does drawdown recovery math teach?',
    scenarioCorrect: 'Avoiding very large losses can be just as important as finding big winners.',
    scenarioDistractors: ['Losses do not matter if the idea was popular.', 'Recovery is always quick after large declines.', 'Volatility guarantees better long-term returns.'],
    scenarioExplanation: 'Large losses create a steep mathematical hill to climb, so downside control matters.',
    applicationQuestion: 'Which practice can help manage drawdown risk?',
    applicationCorrect: 'Using position sizes and diversification that fit the thesis and volatility.',
    applicationDistractors: ['Buying only after one strong day.', 'Ignoring correlation across holdings.', 'Assuming every dip is a gift.'],
    applicationExplanation: 'Drawdown control is usually built before the decline begins.'
  },
  {
    topic: 'Benchmarking',
    label: 'Measuring against alternatives',
    question: 'Why is a benchmark useful when reviewing results?',
    correct: 'It shows whether the strategy beat a reasonable alternative after opportunity cost.',
    distractors: ['It guarantees future returns will match the past.', 'It removes the need for a thesis.', 'It only matters for passive investors.'],
    explanation: 'A benchmark adds context. A portfolio can make money and still lag a simpler choice.',
    scenarioQuestion: 'What is a good benchmark use?',
    scenarioCorrect: 'Comparing a stock-picking strategy with a broad market index fund.',
    scenarioDistractors: ['Comparing one day of price action with a five-year plan.', 'Judging a biotech stock against a cash account only.', 'Ignoring time period alignment entirely.'],
    scenarioExplanation: 'Benchmarks are most useful when time frame and risk profile are reasonably aligned.',
    applicationQuestion: 'What does opportunity cost add to performance review?',
    applicationCorrect: 'It forces you to ask what the same capital could have earned elsewhere.',
    applicationDistractors: ['It means only the highest-risk asset matters.', 'It eliminates the need for patience.', 'It makes every stock comparison invalid.'],
    applicationExplanation: 'Opportunity cost helps separate good-looking returns from truly strong decisions.'
  },
  {
    topic: 'Backtesting',
    label: 'Using history carefully',
    question: 'What is one major limit of backtesting?',
    correct: 'Past patterns can fail if conditions change or the test is overfitted.',
    distractors: ['Backtesting always beats live trading.', 'Backtests remove transaction costs automatically.', 'Any strategy with a strong backtest is guaranteed to work.'],
    explanation: 'Backtesting can teach discipline and patterns, but it does not guarantee future success.',
    scenarioQuestion: 'What does overfitting mean in a backtest?',
    scenarioCorrect: 'Tuning rules so closely to old data that the strategy may not generalize.',
    scenarioDistractors: ['Using multiple years of data.', 'Comparing results with a benchmark.', 'Tracking drawdowns and returns together.'],
    scenarioExplanation: 'Overfitted tests often look brilliant historically but fail in live conditions.',
    applicationQuestion: 'What should a thoughtful backtest include?',
    applicationCorrect: 'A benchmark, realistic assumptions, and enough skepticism to stress the rules.',
    applicationDistractors: ['Only the best period for the strategy.', 'No comparison point at all.', 'A promise that future returns will match exactly.'],
    applicationExplanation: 'Useful backtests are comparative, realistic, and humble.'
  },
  {
    topic: 'Peer analysis',
    label: 'Compare like with like',
    question: 'Why is it usually better to compare companies within the same sector first?',
    correct: 'Because growth, margins, and capital needs differ widely across industries.',
    distractors: ['Because sector labels guarantee the same returns.', 'Because valuation never varies within a sector.', 'Because cross-sector analysis is impossible.'],
    explanation: 'Sector comparisons help investors avoid misleading apples-to-oranges judgments.',
    scenarioQuestion: 'Which comparison is usually cleaner?',
    scenarioCorrect: 'Two payment networks with similar business models.',
    scenarioDistractors: ['A bank and a chip designer.', 'A retailer and an oil major.', 'A utility and a streaming company.'],
    scenarioExplanation: 'Peer groups work best when economics and valuation frameworks are similar.',
    applicationQuestion: 'What is the first question to ask when choosing comparables?',
    applicationCorrect: 'Do these companies make money in similar ways and face similar risks?',
    applicationDistractors: ['Did both move today?', 'Do both have short ticker symbols?', 'Do both appear in headlines often?'],
    applicationExplanation: 'Comparability starts with business model and economic drivers.'
  },
  {
    topic: 'Rebalancing',
    label: 'Keeping exposures intentional',
    question: 'What does rebalancing mainly accomplish?',
    correct: 'It brings holdings back toward intended weights after moves distort the mix.',
    distractors: ['It guarantees the highest-returning stock is always largest.', 'It eliminates market risk completely.', 'It turns a bad thesis into a good one.'],
    explanation: 'Rebalancing restores the risk profile the investor originally wanted.',
    scenarioQuestion: 'When is rebalancing often considered?',
    scenarioCorrect: 'After one or more holdings have grown far beyond target size.',
    scenarioDistractors: ['Immediately after any tiny market move.', 'Only if the portfolio is losing money.', 'Only when dividends are paid.'],
    scenarioExplanation: 'Rebalancing is usually tied to meaningful drift, not every small fluctuation.',
    applicationQuestion: 'What still matters when rebalancing?',
    applicationCorrect: 'Taxes, transaction costs, and whether the thesis itself has changed.',
    applicationDistractors: ['Nothing else matters once a target weight is set.', 'Only headlines matter.', 'Only price charts matter.'],
    applicationExplanation: 'Rebalancing is a process, not a mindless rule.'
  },
  {
    topic: 'Compounding',
    label: 'Time and consistency',
    question: 'What usually matters most for compounding to work?',
    correct: 'Time, consistency, and avoiding major unforced errors.',
    distractors: ['Predicting every short-term move.', 'Owning only the most volatile stocks.', 'Changing strategies every month.'],
    explanation: 'Compounding works best when gains can stay invested and setbacks are controlled.',
    scenarioQuestion: 'Which habit supports compounding?',
    scenarioCorrect: 'Sticking to a repeatable process across many years.',
    scenarioDistractors: ['Chasing whatever led the last three days.', 'Trading out of boredom.', 'Ignoring valuation entirely.'],
    scenarioExplanation: 'Consistency often matters more than tactical cleverness.',
    applicationQuestion: 'What can interrupt compounding most severely?',
    applicationCorrect: 'Large permanent losses or repeated major drawdowns.',
    applicationDistractors: ['A single flat day in the market.', 'Using watchlists for research.', 'Comparing stocks within a sector.'],
    applicationExplanation: 'Compounding relies on staying in the game and protecting the capital base.'
  },
  {
    topic: 'Paper trading',
    label: 'Skill building without cash risk',
    question: 'Why do many learners start with paper trading?',
    correct: 'It lets them practice decisions and process without risking real money.',
    distractors: ['It guarantees they will beat the market later.', 'It removes all emotional bias forever.', 'It makes research unnecessary.'],
    explanation: 'Paper trading is useful for learning execution, sizing, journaling, and discipline before real capital is on the line.',
    scenarioQuestion: 'What is a smart way to use a paper-trading simulator?',
    scenarioCorrect: 'Document entries, exits, and the reasoning behind each trade.',
    scenarioDistractors: ['Place random trades until one works.', 'Ignore position size because the money is fake.', 'Judge results only by one lucky trade.'],
    scenarioExplanation: 'A simulator is most useful when the process is realistic and reviewed carefully.',
    applicationQuestion: 'What is one limit of paper trading?',
    applicationCorrect: 'Real emotions and capital pressure are often weaker than they are with real money.',
    applicationDistractors: ['It cannot teach order entry.', 'It makes price data inaccurate by definition.', 'It prevents portfolio review.'],
    applicationExplanation: 'Paper trading helps, but it does not perfectly recreate real-money psychology.'
  },
  {
    topic: 'Sector rotation',
    label: 'Leadership changes',
    question: 'What does sector rotation describe?',
    correct: 'Capital moving from one part of the market to another as conditions change.',
    distractors: ['A stock split in a single company.', 'A guaranteed reversal pattern.', 'A type of dividend policy.'],
    explanation: 'Sector leadership changes as rates, growth expectations, sentiment, and valuations shift.',
    scenarioQuestion: 'What can trigger sector rotation?',
    scenarioCorrect: 'Changing interest rates or changing growth expectations.',
    scenarioDistractors: ['A company choosing a new ticker symbol.', 'An investor checking a watchlist.', 'A one-day pause in trading.'],
    scenarioExplanation: 'Macro forces and market preference shifts often drive rotation.',
    applicationQuestion: 'Why can a good stock still lag during rotation?',
    applicationCorrect: 'Because investor attention and capital may be favoring a different theme or sector.',
    applicationDistractors: ['Because fundamentals stop mattering forever.', 'Because only low-priced stocks can lead.', 'Because sector rotation is random noise with no effect.'],
    applicationExplanation: 'Market leadership can shift even when individual business quality stays intact.'
  },
  {
    topic: 'Growth analysis',
    label: 'Revenue and earnings together',
    question: 'Why can revenue growth alone be misleading?',
    correct: 'Because growth without margins or cash flow may not create strong shareholder value.',
    distractors: ['Because revenue never matters.', 'Because only dividends matter.', 'Because high sales always mean low profits.'],
    explanation: 'Investors want to know whether growth is efficient, durable, and profitable.',
    scenarioQuestion: 'Which result is usually stronger?',
    scenarioCorrect: 'Revenue growth with stable or improving margins.',
    scenarioDistractors: ['Revenue growth paired with worsening unit economics.', 'Rapid sales growth funded by fragile balance-sheet stretching.', 'Any growth regardless of returns on capital.'],
    scenarioExplanation: 'Healthy growth normally shows up in margins, cash conversion, or returns too.',
    applicationQuestion: 'What should investors ask after seeing strong sales growth?',
    applicationCorrect: 'Is the company turning that growth into durable profit and cash flow?',
    applicationDistractors: ['Did the ticker symbol change?', 'How many social media posts mentioned it today?', 'Can the stock skip all future drawdowns?'],
    applicationExplanation: 'Revenue is the start of the story, not the finish.'
  }
];

const intermediateQuestions = intermediateConcepts.flatMap((concept, index) => ([
  makeQuestion(`intermediate-direct-${index}`, 'Intermediate', concept.topic, concept.question, concept.correct, concept.distractors, concept.explanation, index),
  makeQuestion(`intermediate-scenario-${index}`, 'Intermediate', concept.topic, concept.scenarioQuestion, concept.scenarioCorrect, concept.scenarioDistractors, concept.scenarioExplanation, index + 1),
  makeQuestion(`intermediate-application-${index}`, 'Intermediate', concept.topic, concept.applicationQuestion, concept.applicationCorrect, concept.applicationDistractors, concept.applicationExplanation, index + 2)
]));

const advancedConcepts = [
  {
    topic: 'Margin of safety',
    question: 'Why do experienced investors often demand a margin of safety?',
    correct: 'Because even careful analysis includes uncertainty, and the buffer helps absorb mistakes.',
    distractors: ['Because valuation never changes.', 'Because cheap stocks always outperform immediately.', 'Because estimates of value are perfectly precise.'],
    explanation: 'A margin of safety recognizes that businesses, assumptions, and cycles are uncertain.',
    scenarioQuestion: 'Which situation calls for the largest margin of safety?',
    scenarioCorrect: 'A cyclical or highly uncertain business with fragile assumptions.',
    scenarioDistractors: ['A business with highly predictable cash flows and a fortress balance sheet.', 'A broad-market benchmark fund only.', 'A cash account with no market exposure.'],
    scenarioExplanation: 'The more uncertain the range of outcomes, the more price cushion investors typically want.',
    applicationQuestion: 'What is a common mistake in valuation work?',
    applicationCorrect: 'Using a precise single-point estimate as if it were guaranteed.',
    applicationDistractors: ['Comparing a stock with peers.', 'Reviewing cash flow conversion.', 'Tracking operating margins over time.'],
    applicationExplanation: 'Advanced analysis usually works with ranges, probabilities, and humility, not exact certainty.'
  },
  {
    topic: 'Moats',
    question: 'What is the best description of a moat?',
    correct: 'A durable advantage that helps a business defend profits and market share over time.',
    distractors: ['A guarantee that the stock price only rises.', 'A tax strategy unique to large companies.', 'A chart pattern near the fifty-day average.'],
    explanation: 'Moats come from things like switching costs, brands, network effects, scale, and regulatory strength.',
    scenarioQuestion: 'Which feature can create a moat?',
    scenarioCorrect: 'Customers face high switching costs when leaving the platform.',
    scenarioDistractors: ['The company changed its logo recently.', 'The stock had one strong quarter.', 'The shares are trading above book value.'],
    scenarioExplanation: 'Switching costs can make customer relationships sticky and hard for competitors to steal.',
    applicationQuestion: 'Why must moats still be monitored?',
    applicationCorrect: 'Because competition, regulation, or technology can erode them over time.',
    distractors: ['Because moats disappear every quarter automatically.', 'Because moats only matter for banks.', 'Because moat analysis replaces valuation entirely.'],
    applicationExplanation: 'A moat is an advantage, not a permanent guarantee.'
  },
  {
    topic: 'Cyclicals',
    question: 'How is a cyclical business different from a secular grower?',
    correct: 'Its results depend more on the economic cycle than on a long structural trend alone.',
    distractors: ['It never earns profits.', 'It cannot pay dividends.', 'It always has lower volatility.'],
    explanation: 'Cyclical businesses swing with demand, prices, rates, or commodity conditions more directly.',
    scenarioQuestion: 'Which company is often more cyclical?',
    scenarioCorrect: 'A machinery maker tied to construction and industrial spending.',
    scenarioDistractors: ['A utility with regulated demand.', 'A mission-critical software platform with recurring revenue.', 'A payments network benefiting from steady transaction growth.'],
    scenarioExplanation: 'Industrial and commodity-linked businesses often move with the economic cycle.',
    applicationQuestion: 'Why does timing matter more for cyclicals?',
    applicationCorrect: 'Because earnings and sentiment can swing sharply around cycle turns.',
    distractors: ['Because valuation never matters for cyclicals.', 'Because all cyclicals behave the same.', 'Because secular growers ignore macro conditions entirely.'],
    applicationExplanation: 'When cycle expectations shift, cyclicals can rerate quickly in both directions.'
  },
  {
    topic: 'Capital allocation',
    question: 'What does strong capital allocation usually mean?',
    correct: 'Management puts cash toward the highest long-term return opportunities with discipline.',
    distractors: ['Management always buys back stock no matter the price.', 'Management avoids all reinvestment.', 'Management changes strategy every quarter.'],
    explanation: 'Good capital allocation weighs reinvestment, debt, buybacks, acquisitions, and dividends thoughtfully.',
    scenarioQuestion: 'When can buybacks destroy value?',
    scenarioCorrect: 'When shares are repurchased aggressively at very inflated prices.',
    scenarioDistractors: ['When the balance sheet is healthy and the stock is reasonably valued.', 'When the business has excess cash and few better uses.', 'When repurchases are modest and opportunistic.'],
    scenarioExplanation: 'Buying back expensive stock can lock in weak future returns on that cash.',
    applicationQuestion: 'Why does capital allocation deserve close attention?',
    applicationCorrect: 'Because even a strong business can underperform if cash is used poorly.',
    distractors: ['Because it only affects quarterly traders.', 'Because operating margins already answer the question completely.', 'Because valuation does not depend on management decisions.'],
    applicationExplanation: 'How leaders deploy cash can shape long-term per-share value creation.'
  },
  {
    topic: 'Benchmarks',
    question: 'What is the most useful reason to stay benchmark-aware?',
    correct: 'It helps compare results with a realistic alternative and highlights opportunity cost.',
    distractors: ['It forces every portfolio to mimic an index exactly.', 'It makes security selection irrelevant.', 'It eliminates the need for risk control.'],
    explanation: 'Advanced investors use benchmarks for context without letting them dominate every decision.',
    scenarioQuestion: 'What is benchmark hugging?',
    scenarioCorrect: 'Staying so close to an index that active decisions barely matter.',
    scenarioDistractors: ['Holding cash while searching for ideas.', 'Comparing stocks within one sector.', 'Measuring drawdown during a selloff.'],
    scenarioExplanation: 'If a portfolio looks almost identical to the benchmark, active risk and reward may not justify the effort.',
    applicationQuestion: 'What is one danger of ignoring benchmarks completely?',
    applicationCorrect: 'You may think results are strong even when a simple alternative did better.',
    distractors: ['You will never learn about volatility.', 'You must sell all winning positions.', 'You cannot own individual stocks.'],
    applicationExplanation: 'Opportunity cost matters, especially over multi-year periods.'
  },
  {
    topic: 'Scenario planning',
    question: 'Why do advanced investors often use scenario analysis?',
    correct: 'Because outcomes usually fall into a range rather than one exact forecast.',
    distractors: ['Because one prediction is always enough.', 'Because scenarios remove uncertainty.', 'Because only traders need scenario work.'],
    explanation: 'Scenario planning helps investors think in probabilities and prepare for different business outcomes.',
    scenarioQuestion: 'What is a strong scenario-analysis habit?',
    scenarioCorrect: 'Writing a bull case, base case, and bear case with key assumptions.',
    scenarioDistractors: ['Assuming only the most optimistic case matters.', 'Ignoring downside once a company is admired.', 'Using one revenue estimate and never revisiting it.'],
    scenarioExplanation: 'Good scenario work makes the assumptions visible and reviewable.',
    applicationQuestion: 'What is the main benefit of thinking in ranges?',
    applicationCorrect: 'It reduces false certainty and supports better sizing decisions.',
    distractors: ['It guarantees profits.', 'It replaces all valuation work.', 'It makes benchmarks unnecessary.'],
    applicationExplanation: 'Ranges reflect reality better than a single fragile number.'
  },
  {
    topic: 'Factor exposure',
    question: 'What does factor exposure mean in a portfolio?',
    correct: 'The portfolio is tilted toward shared traits like growth, value, quality, or momentum.',
    distractors: ['The portfolio owns only one sector.', 'The portfolio can no longer be diversified.', 'The portfolio is benchmarked to cash.'],
    explanation: 'Many portfolios are driven partly by factor tilts even when they appear diversified by ticker count.',
    scenarioQuestion: 'What is factor crowding?',
    scenarioCorrect: 'Too many investors piling into the same trade or theme at once.',
    scenarioDistractors: ['Owning a benchmark fund.', 'Comparing drawdowns with returns.', 'Using a limit order instead of a market order.'],
    scenarioExplanation: 'Crowded factor exposures can reverse sharply when sentiment or rates change.',
    applicationQuestion: 'Why should investors track factor exposure?',
    applicationCorrect: 'Because hidden shared drivers can dominate portfolio risk more than individual names suggest.',
    distractors: ['Because factors replace company analysis completely.', 'Because factor exposure only exists in hedge funds.', 'Because factors guarantee outperformance every year.'],
    applicationExplanation: 'Factor awareness helps explain performance and correlation across holdings.'
  },
  {
    topic: 'Risk budgeting',
    question: 'What is risk budgeting?',
    correct: 'Deliberately deciding how much portfolio risk each position or theme is allowed to contribute.',
    distractors: ['Spending cash according to quarterly revenue.', 'Buying the same number of shares in every stock.', 'Using only price targets to size trades.'],
    explanation: 'Risk budgeting goes beyond dollar weight and asks what really drives portfolio swings.',
    scenarioQuestion: 'Why can a small position still create large risk?',
    scenarioCorrect: 'Because it may be far more volatile or highly correlated with other positions.',
    scenarioDistractors: ['Because small positions never matter.', 'Because only cash creates risk.', 'Because position size alone explains everything.'],
    scenarioExplanation: 'Risk contribution depends on volatility and correlation, not just capital weight.',
    applicationQuestion: 'What question belongs in a risk budget review?',
    applicationCorrect: 'If this position falls sharply, how much does it really change the full portfolio?',
    distractors: ['How many letters are in the ticker?', 'Did the company announce a slogan change?', 'Can the position avoid every market correction?'],
    applicationExplanation: 'Risk budgeting asks about portfolio impact, not just idea quality.'
  },
  {
    topic: 'Valuation multiples',
    question: 'What is multiple compression?',
    correct: 'A decline in valuation even if the business itself remains fundamentally solid.',
    distractors: ['A rise in revenue driven by volume.', 'A reduction in share count through buybacks.', 'A rally caused by short covering.'],
    explanation: 'A stock can perform poorly when investors decide they are willing to pay less for each dollar of earnings or cash flow.',
    scenarioQuestion: 'When is multiple compression most likely to hurt?',
    scenarioCorrect: 'When a very expensive stock meets slower growth or higher rates.',
    scenarioDistractors: ['When a low-expectation value stock surprises positively.', 'When a company reduces debt and improves cash flow.', 'When valuation starts from already depressed levels.'],
    scenarioExplanation: 'Rich valuations leave more room for disappointment if the narrative cools.',
    applicationQuestion: 'Why can a strong company still deliver weak stock returns?',
    applicationCorrect: 'Because valuation can shrink even while the business executes reasonably well.',
    distractors: ['Because earnings never matter.', 'Because long-term investors ignore price paid.', 'Because operating leverage disappears in good businesses.'],
    applicationExplanation: 'Business quality and stock return are related but not identical.'
  },
  {
    topic: 'Thesis review',
    question: 'What belongs in a written investment thesis?',
    correct: 'What must happen, what could go wrong, and what would invalidate the idea.',
    distractors: ['Only a target price with no assumptions.', 'A chart screenshot without business context.', 'A promise to hold forever no matter what changes.'],
    explanation: 'Good theses make assumptions explicit so new information can be evaluated rationally.',
    scenarioQuestion: 'What is a thesis break?',
    scenarioCorrect: 'A fundamental change that directly undermines the original reason for owning the stock.',
    scenarioDistractors: ['Any ordinary volatile week.', 'A benchmark outperforming for one month.', 'A stock moving sideways after earnings.'],
    scenarioExplanation: 'Thesis breaks are about fundamental damage, not routine price noise.',
    applicationQuestion: 'Why review a thesis regularly?',
    applicationCorrect: 'Because the business, valuation, or competitive setup may evolve over time.',
    distractors: ['Because the original analysis must always be discarded quickly.', 'Because price movement alone tells the whole story.', 'Because strong companies never need reevaluation.'],
    applicationExplanation: 'Revisiting the thesis helps separate temporary noise from meaningful change.'
  },
  {
    topic: 'Capital intensity',
    question: 'Why does capital intensity matter in analysis?',
    correct: 'Businesses that need heavy reinvestment can convert less of their profit into free cash flow.',
    distractors: ['Capital intensity only matters for banks.', 'High capital intensity guarantees higher margins.', 'It only affects dividend stocks.'],
    explanation: 'A business that must constantly spend on equipment, inventory, or capacity may show weaker cash conversion.',
    scenarioQuestion: 'Which company is usually more capital-intensive?',
    scenarioCorrect: 'A manufacturer building and maintaining expensive physical capacity.',
    scenarioDistractors: ['A software platform delivered digitally.', 'A licensing business with minimal physical assets.', 'A data service with asset-light economics.'],
    scenarioExplanation: 'Physical expansion usually consumes more capital than digital distribution.',
    applicationQuestion: 'What is one impact of high capital intensity?',
    applicationCorrect: 'Reported earnings may overstate the cash truly available to owners.',
    distractors: ['Volatility disappears over time automatically.', 'Valuation no longer matters.', 'It guarantees debt-free growth.'],
    applicationExplanation: 'Investors need to connect accounting earnings with actual reinvestment demands.'
  },
  {
    topic: 'Opportunity cost',
    question: 'Why is opportunity cost especially important for advanced investors?',
    correct: 'Because capital tied up in mediocre ideas cannot be deployed into better opportunities.',
    distractors: ['Because it only matters when markets fall.', 'Because benchmarks eliminate opportunity cost.', 'Because all profitable investments are equally good.'],
    explanation: 'Advanced portfolio decisions are not just about avoiding losses but about choosing the strongest uses of scarce capital.',
    scenarioQuestion: 'Which decision reflects opportunity-cost awareness?',
    scenarioCorrect: 'Selling a stagnant thesis when a better risk-adjusted idea appears.',
    scenarioDistractors: ['Holding every position indefinitely regardless of quality.', 'Ignoring comparisons with benchmark returns.', 'Adding to every loser to avoid admitting a mistake.'],
    scenarioExplanation: 'Capital discipline includes recognizing when the next dollar belongs somewhere else.',
    applicationQuestion: 'How does opportunity cost improve portfolio review?',
    applicationCorrect: 'It forces investors to compare current holdings with the next-best realistic alternative.',
    distractors: ['It removes the need for diversification.', 'It guarantees better timing.', 'It makes sector analysis irrelevant.'],
    applicationExplanation: 'Strong investing is partly the art of choosing between competing good options.'
  },
  {
    topic: 'Mean reversion',
    question: 'What does mean reversion suggest in markets?',
    correct: 'Extreme conditions may moderate over time rather than continue forever unchanged.',
    distractors: ['Every trend ends immediately.', 'All cheap stocks rebound quickly.', 'Volatility disappears after one correction.'],
    explanation: 'Mean reversion is a tendency, not a promise. It can affect margins, valuation, growth, or sentiment.',
    scenarioQuestion: 'Where is mean reversion often discussed?',
    scenarioCorrect: 'In unusually high margins or unusually high valuation multiples.',
    scenarioDistractors: ['In ticker symbol changes.', 'In exchange listing rules only.', 'In the number of outstanding options contracts alone.'],
    scenarioExplanation: 'When metrics are far above long-run norms, analysts often ask whether they can stay there.',
    applicationQuestion: 'Why should investors care about mean reversion in valuation?',
    applicationCorrect: 'Because paying too much during peak optimism can compress future returns.',
    distractors: ['Because valuation and returns are unrelated.', 'Because expensive stocks always keep getting more expensive forever.', 'Because benchmarks never mean-revert.'],
    applicationExplanation: 'High expectations can fade even if the business remains healthy.'
  },
  {
    topic: 'Portfolio construction',
    question: 'What is a barbell portfolio?',
    correct: 'A mix of faster-growing assets and steadier, lower-volatility holdings.',
    distractors: ['A portfolio made only of companies in one industry.', 'A strategy that uses only cash and options.', 'A chart pattern after earnings.'],
    explanation: 'Barbell construction can balance upside with stability when built thoughtfully.',
    scenarioQuestion: 'Why might investors use a barbell approach?',
    scenarioCorrect: 'To keep some upside exposure while reducing the chance that one style dominates the whole account.',
    scenarioDistractors: ['To avoid ever making trade-offs.', 'To eliminate all market risk.', 'To guarantee benchmark outperformance every year.'],
    scenarioExplanation: 'The goal is balance, not perfection.',
    applicationQuestion: 'What still matters in a barbell portfolio?',
    applicationCorrect: 'Correlation, valuation, and whether each side truly diversifies the other.',
    distractors: ['Only the number of holdings.', 'Only which positions moved today.', 'Only whether all tickers are well known.'],
    applicationExplanation: 'A barbell helps only if the pieces actually behave differently enough.'
  },
  {
    topic: 'Risk-adjusted returns',
    question: 'What makes a return risk-adjusted rather than just absolute?',
    correct: 'It considers how much volatility, drawdown, or uncertainty was taken to earn it.',
    distractors: ['It ignores losses and focuses only on gains.', 'It uses only daily price changes.', 'It measures returns before costs and risk.'],
    explanation: 'Two strategies with the same total return can feel very different if one suffered far deeper losses along the way.',
    scenarioQuestion: 'Which strategy may be more attractive on a risk-adjusted basis?',
    scenarioCorrect: 'The one that earned similar returns with smaller drawdowns.',
    scenarioDistractors: ['The one with the wildest swings but no process.', 'The one with only one lucky year.', 'The one that ignored benchmark comparisons.'],
    scenarioExplanation: 'Risk-adjusted thinking values smoother compounding and better survivability.',
    applicationQuestion: 'Why does drawdown belong in return analysis?',
    applicationCorrect: 'Because large losses can reduce staying power and make recovery harder.',
    distractors: ['Because drawdown only matters for short sellers.', 'Because drawdown and volatility are irrelevant once a stock is profitable.', 'Because strong returns automatically erase risk.'],
    applicationExplanation: 'The path matters, not only the finish line.'
  }
];

const advancedQuestions = advancedConcepts.flatMap((concept, index) => ([
  makeQuestion(`advanced-direct-${index}`, 'Advanced', concept.topic, concept.question, concept.correct, concept.distractors, concept.explanation, index),
  makeQuestion(`advanced-scenario-${index}`, 'Advanced', concept.topic, concept.scenarioQuestion, concept.scenarioCorrect, concept.scenarioDistractors, concept.scenarioExplanation, index + 1),
  makeQuestion(`advanced-application-${index}`, 'Advanced', concept.topic, concept.applicationQuestion, concept.applicationCorrect, concept.applicationDistractors || concept.distractors, concept.applicationExplanation, index + 2)
]));

const quizBank = [...beginnerQuestions, ...intermediateQuestions, ...advancedQuestions];

const games = [
  {
    id: 'return-ranker',
    title: 'Return Ranker',
    description: 'Try to identify which tracked stock has delivered the strongest five-year compounding trend.',
    prompt: 'Think about which businesses combine strong demand, scale, and multi-year earnings momentum.'
  },
  {
    id: 'sector-match',
    title: 'Sector Match',
    description: 'Match a selected stock to its sector and compare it with better peer groups.',
    prompt: 'Ask yourself how the company actually makes money before selecting a sector.'
  },
  {
    id: 'definition-dash',
    title: 'Definition Dash',
    description: 'Guess the correct glossary term from a short clue and then reveal the full explanation.',
    prompt: 'A good definition is short, precise, and useful in real investing decisions.'
  },
  {
    id: 'valuation-pick',
    title: 'Valuation Pick',
    description: 'Review two ideas and decide which one sounds cheaper relative to current earnings.',
    prompt: 'Remember that valuation only becomes meaningful after comparing growth, margins, and risk.'
  },
  {
    id: 'risk-meter',
    title: 'Risk Meter',
    description: 'Spot which position would likely add the most portfolio risk based on volatility and concentration.',
    prompt: 'Risk is shaped by size, volatility, and correlation rather than by conviction alone.'
  },
  {
    id: 'catalyst-clue',
    title: 'Catalyst Clue',
    description: 'Identify whether a clue sounds like a business catalyst, a valuation reset, or a macro headwind.',
    prompt: 'Catalysts can improve or weaken the thesis, so context matters.'
  }
];

const coachPrompts = [
  'Explain diversification like I am brand new to investing.',
  'How should I compare two stocks fairly?',
  'What does the price-to-earnings ratio really tell me?',
  'Why should I use paper trading before real money?',
  'How do drawdowns change long-term results?',
  'Summarize the selected stock in plain English.'
];

const dailyChallenges = [
  {
    id: 'semiconductor-compare',
    title: 'Compare two semiconductor leaders',
    description: 'Compare NVIDIA and AMD. Write one sentence about valuation, one sentence about growth, and one sentence about what risk could break the thesis.'
  },
  {
    id: 'portfolio-risk-scan',
    title: 'Run a portfolio risk scan',
    description: 'Review your paper portfolio, identify the largest single-position risk, and explain one rebalancing action you could take.'
  },
  {
    id: 'benchmark-check',
    title: 'Benchmark your process',
    description: 'Run a backtest, compare the selected strategy with the broad benchmark, and write down whether the extra risk looked worth it.'
  },
  {
    id: 'valuation-and-moat',
    title: 'Separate quality from price',
    description: 'Pick a high-quality stock and explain why a good business can still be a weak investment if the starting valuation is too rich.'
  },
  {
    id: 'lesson-stack',
    title: 'Stack two lessons together',
    description: 'Complete two lessons from the same difficulty level and connect them in one short takeaway about better decision-making.'
  },
  {
    id: 'glossary-application',
    title: 'Use glossary terms in context',
    description: 'Choose three glossary terms and explain how each one would affect a real paper-trading decision you might make.'
  },
  {
    id: 'watchlist-discipline',
    title: 'Build a balanced watchlist',
    description: 'Create a five-stock watchlist from at least three sectors, then explain why the mix is more balanced than a single-theme basket.'
  }
];

function getDayOfYear(date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const difference = date - start;
  return Math.floor(difference / 86400000);
}

function getDailyChallenge(date = new Date()) {
  const challengeIndex = getDayOfYear(date) % dailyChallenges.length;
  return dailyChallenges[challengeIndex];
}

function calculateCagr(values, years) {
  if (!values?.length || years <= 0) return 0;
  return (Math.pow(values[values.length - 1] / values[0], 1 / years) - 1) * 100;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: value >= 100 ? 0 : 2 }).format(value);
}

function formatPercent(value, digits = 1) {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${Number(value).toFixed(digits)}%`;
}

function findStockByQuestion(question) {
  const normalized = String(question || '').toLowerCase();
  return stocks.find((stock) => normalized.includes(stock.symbol.toLowerCase()) || normalized.includes(stock.name.toLowerCase()));
}

function findGlossaryTermByQuestion(question) {
  const normalized = String(question || '').toLowerCase();
  return glossaryTerms.find((term) => normalized.includes(term.term.toLowerCase()));
}

function summarizeStock(stock) {
  const fiveYearCagr = calculateCagr(stock.history['5y'], 5);
  const tenYearCagr = calculateCagr(stock.history['10y'], 10);
  const peerLabel = stock.compareSymbols.length ? ` Comparable names in the same sector include ${stock.compareSymbols.join(', ')}.` : '';
  return `${stock.name} (${stock.symbol}) in ${stock.sector} closed at ${formatCurrency(stock.currentPrice)} on ${snapshotDate} with a daily move of ${formatPercent(stock.dailyChange)}. It trades at about ${stock.pe.toFixed(1)} times earnings, its five-year compound annual growth rate is ${formatPercent(fiveYearCagr)}, and its ten-year compound annual growth rate is ${formatPercent(tenYearCagr)}. ${stock.description}${peerLabel}`;
}

function buildCoachResponse(question, selectedSymbol) {
  const normalized = String(question || '').trim().toLowerCase();
  const mentionedStock = findStockByQuestion(normalized) || stocks.find((stock) => stock.symbol === selectedSymbol) || stocks[0];
  const glossaryMatch = findGlossaryTermByQuestion(normalized);

  if (!normalized || normalized.includes('selected stock') || normalized.includes('summarize')) {
    return summarizeStock(mentionedStock);
  }

  if (glossaryMatch) {
    return `${glossaryMatch.term}: ${glossaryMatch.longDefinition} Practical note: ${glossaryMatch.answer}`;
  }

  if (normalized.includes('diversification')) {
    return 'Diversification means spreading risk across businesses, sectors, or styles so one mistake does not dominate the entire portfolio. It is most useful for lowering company-specific and sector-specific risk, but it cannot fully remove broad market risk.';
  }

  if (normalized.includes('paper trading') || normalized.includes('paper trade') || normalized.includes('simulator')) {
    return 'Paper trading is practice mode. It helps you test entries, exits, position sizing, journaling, and discipline without risking real money. The biggest limitation is that real-money emotions usually feel much stronger than simulated decisions.';
  }

  if (normalized.includes('backtest') || normalized.includes('strategy')) {
    const strategyNames = strategies.map((strategy) => strategy.name).join(', ');
    return `Backtests are useful when they compare a strategy with a benchmark, use realistic assumptions, and stay humble about the future. In this demo you can review ${strategyNames}. The most important questions are how the strategy performed, what drawdowns it suffered, and whether the outperformance looked durable or just lucky.`;
  }

  if (normalized.includes('risk') || normalized.includes('drawdown') || normalized.includes('volatility')) {
    return 'Risk is more than price movement. Volatility shows how much prices swing, while drawdown shows how far an investment fell from a prior peak. Long-term investors care about both because large drawdowns reduce staying power and require disproportionately large recoveries.';
  }

  if (normalized.includes('valuation') || normalized.includes('p/e') || normalized.includes('price-to-earnings')) {
    return 'Valuation asks what you are paying relative to the business you are buying. A price-to-earnings ratio is one starting point, but it works best when growth, margins, cash flow, and risk are also compared. A great company can still produce weak stock returns if the starting price is too high.';
  }

  if (normalized.includes('compare') || normalized.includes('peer')) {
    return `${summarizeStock(mentionedStock)} When you compare stocks, start with peers in the same sector, then layer in valuation, growth, margin profile, cash flow, and balance-sheet strength.`;
  }

  return `${summarizeStock(mentionedStock)} If you want a deeper answer, try asking about diversification, valuation, risk, backtesting, drawdowns, paper trading, or a glossary term by name.`;
}

function runBacktest(strategyId, startingCapital = 10000) {
  const strategy = strategies.find((candidate) => candidate.id === strategyId) || strategies[0];
  const initialCapital = Number.isFinite(Number(startingCapital)) && Number(startingCapital) > 0 ? Number(startingCapital) : 10000;

  let strategyValue = initialCapital;
  let benchmarkValue = initialCapital;
  const breakdown = backtestYears.map((year, index) => {
    strategyValue *= growthFactor(strategy.annualReturns[index]);
    benchmarkValue *= growthFactor(benchmarkAnnualReturns[index]);
    return {
      year,
      strategyReturn: strategy.annualReturns[index],
      benchmarkReturn: benchmarkAnnualReturns[index],
      strategyValue: round(strategyValue),
      benchmarkValue: round(benchmarkValue)
    };
  });

  const finalStrategyValue = breakdown[breakdown.length - 1].strategyValue;
  const finalBenchmarkValue = breakdown[breakdown.length - 1].benchmarkValue;
  const totalReturn = round(((finalStrategyValue / initialCapital) - 1) * 100, 1);
  const benchmarkReturn = round(((finalBenchmarkValue / initialCapital) - 1) * 100, 1);
  const compoundAnnualGrowthRate = round((Math.pow(finalStrategyValue / initialCapital, 1 / backtestYears.length) - 1) * 100, 1);
  const outperformanceGap = round(totalReturn - benchmarkReturn, 1);

  return {
    strategy: {
      id: strategy.id,
      name: strategy.name,
      rationale: strategy.rationale
    },
    breakdown,
    finalStrategyValue,
    finalBenchmarkValue,
    totalReturn,
    benchmarkReturn,
    compoundAnnualGrowthRate,
    outperformanceGap
  };
}

function getBootstrapPayload() {
  return {
    snapshotDate,
    rangeLabels,
    benchmark,
    stocks,
    strategies,
    lessons,
    quizBank,
    games,
    glossaryTerms,
    coachPrompts,
    achievementDefinitions,
    dailyChallenge: getDailyChallenge()
  };
}

const catalog = {
  snapshotDate,
  rangeLabels,
  stocks,
  benchmark,
  strategies,
  lessons,
  quizBank,
  games,
  glossaryTerms,
  coachPrompts,
  achievementDefinitions,
  getDailyChallenge,
  getBootstrapPayload,
  buildCoachResponse,
  runBacktest
};

if (typeof module !== 'undefined' && module.exports) module.exports = catalog;
if (root) root.StockPilotCatalog = catalog;
})(typeof window !== 'undefined' ? window : null);