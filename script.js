const SESSION_STORAGE_KEY = 'stockpilot-session-token';
const QUIZ_SESSION_LENGTH = 10;

const state = {
  sessionToken: (() => {
    try { return window.localStorage.getItem(SESSION_STORAGE_KEY); } catch { return null; }
  })(),
  bootstrap: null,
  user: null,
  selectedSymbol: null,
  selectedSector: 'All sectors',
  selectedSort: 'daily-desc',
  searchTerm: '',
  watchlistRange: '10y',
  analyticsRange: '10y',
  analyticsCompare: 'benchmark',
  paperRange: '10y',
  selectedStrategy: null,
  startingCapital: 10000,
  learningFilter: 'All levels',
  quizDifficulty: 'Beginner',
  quizTopic: 'All topics',
  quizPool: [],
  quizIndex: 0,
  quizScore: 0,
  quizAnswered: false,
  quizCompleted: false,
  quizWrongAnswers: [],
  finalExamPool: [],
  finalExamIndex: 0,
  finalExamScore: 0,
  glossarySearch: '',
  coachResponse: 'Ask the coach about a stock, a term, diversification, valuation, risk, backtesting, or paper trading.'
};

const els = {};

function $(id) { return document.getElementById(id); }

function cacheElements() {
  [
    'snapshotDateLabel','marketSummary','marketMoodLabel','marketMoodText','overviewMetrics','accountForm','accountEmail','accountUsername','accountPassword','logoutButton','accountStatus','accountSummary','selectedSymbol','selectedName','selectedSector','selectedPrice','selectedChange','selectedMarketCap','selectedMetrics','watchlistRangeSelect','trendChart','chartCaption','watchlistGrid','trackedCountTag','searchInput','sectorFilter','sortSelect','tableSummary','stockTableBody','tradeForm','tradeSearchInput','stockSuggestions','tradeSymbolSelect','tradeSide','tradeShares','tradePreview','resetPortfolioButton','tradeStatus','paperTradingSummary','paperTradingNarrative','paperRangeSelect','portfolioChart','positionsTableBody','tradeHistory','analyticsSelectedTag','analyticsRangeSelect','analyticsCompareSelect','analyticsMetrics','analyticsChart','analyticsNarrative','portfolioAnalyticsMetrics','aiSummaryBlock','strategySelect','startingCapital','runBacktestButton','backtestChart','backtestMetrics','strategySummary','backtestBreakdown','dailyChallengeTitle','dailyChallengeDescription','completeChallengeButton','dailyChallengeStatus','learningFilters','learningProgressText','learningProgressFill','lessonGrid','startFinalExamButton','finalExamStatus','quizDifficultySelect','quizTopicSelect','startQuizButton','quizMeta','quizQuestion','quizAnswers','quizFeedback','quizScore','quizNextButton','quizResults','quizRestartButton','finalExamArea','gamesGrid','glossarySearch','glossarySummary','glossaryGrid','achievementOverview','achievementGrid','coachPrompts','coachForm','coachInput','coachSelectedStockButton','coachResponse','floatingDefinition','floatingDefinitionTitle','floatingDefinitionText','closeDefinitionButton','backToTopButton'
  ].forEach((id) => { els[id] = $(id); });
}

function safeText(el, value) { if (el) el.textContent = value; }
function safeHTML(el, value) { if (el) el.innerHTML = value; }

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function persistSessionToken(token) {
  state.sessionToken = token || null;
  try {
    if (token) window.localStorage.setItem(SESSION_STORAGE_KEY, token);
    else window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {}
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.sessionToken) headers['x-stockpilot-session'] = state.sessionToken;
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function scrollToSection(sectionId) {
  const el = $(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatCurrency(value, rounded = false) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: rounded ? 0 : 2 }).format(value);
}

function formatPercent(value, digits = 2) {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${Number(value).toFixed(digits)}%`;
}

function toneClass(value) {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

function cagr(values, years) {
  return (Math.pow(values[values.length - 1] / values[0], 1 / years) - 1) * 100;
}

function getSelectedStock() {
  return state.bootstrap.stocks.find((stock) => stock.symbol === state.selectedSymbol) || state.bootstrap.stocks[0];
}

function getFiveYearCagr(stock) { return cagr(stock.history['5y'], 5); }
function getTenYearCagr(stock) { return cagr(stock.history['10y'], 10); }

function calculateReturn(values) { return ((values[values.length - 1] / values[0]) - 1) * 100; }

function calculateMaxDrawdown(values) {
  let peak = values[0];
  let maxDrawdown = 0;
  values.forEach((value) => {
    peak = Math.max(peak, value);
    maxDrawdown = Math.min(maxDrawdown, ((value - peak) / peak) * 100);
  });
  return maxDrawdown;
}

function getFilteredStocks() {
  const term = state.searchTerm.trim().toLowerCase();
  let list = [...state.bootstrap.stocks];
  if (term) list = list.filter((stock) => `${stock.symbol} ${stock.name}`.toLowerCase().includes(term));
  if (state.selectedSector !== 'All sectors') list = list.filter((stock) => stock.sector === state.selectedSector);
  switch (state.selectedSort) {
    case 'fiveYear-desc': list.sort((a, b) => getFiveYearCagr(b) - getFiveYearCagr(a)); break;
    case 'tenYear-desc': list.sort((a, b) => getTenYearCagr(b) - getTenYearCagr(a)); break;
    case 'pe-asc': list.sort((a, b) => a.pe - b.pe); break;
    case 'cap-desc': list.sort((a, b) => b.marketCap - a.marketCap); break;
    case 'name-asc': list.sort((a, b) => a.name.localeCompare(b.name)); break;
    default: list.sort((a, b) => b.dailyChange - a.dailyChange); break;
  }
  return list;
}

function drawChart(canvas, labels, datasets) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || Number(canvas.getAttribute('width')) || 640;
  const height = canvas.clientHeight || Number(canvas.getAttribute('height')) || 320;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const padding = { top: 28, right: 18, bottom: 38, left: 62 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const all = datasets.flatMap((dataset) => dataset.values);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;

  ctx.strokeStyle = 'rgba(148,163,184,0.12)';
  ctx.lineWidth = 1;
  for (let row = 0; row <= 5; row += 1) {
    const y = padding.top + (chartHeight / 5) * row;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  ctx.fillStyle = '#9fb0cf';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  for (let row = 0; row <= 5; row += 1) {
    const value = max - (range / 5) * row;
    const y = padding.top + (chartHeight / 5) * row;
    ctx.fillText(formatCurrency(value, true), padding.left - 8, y + 4);
  }

  ctx.textAlign = 'center';
  labels.forEach((label, index) => {
    const x = padding.left + (chartWidth / (labels.length - 1 || 1)) * index;
    ctx.fillText(label, x, height - 10);
  });

  datasets.forEach((dataset) => {
    const points = dataset.values.map((value, index) => {
      const x = padding.left + (chartWidth / (dataset.values.length - 1 || 1)) * index;
      const normalized = (value - min) / range;
      const y = padding.top + chartHeight - normalized * chartHeight;
      return { x, y };
    });
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height);
    gradient.addColorStop(0, `${dataset.color}44`);
    gradient.addColorStop(1, `${dataset.color}00`);
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.lineTo(points[0].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.strokeStyle = dataset.color;
    ctx.lineWidth = 3;
    ctx.stroke();
  });
}

function renderOverview() {
  const avgMove = state.bootstrap.stocks.reduce((sum, stock) => sum + stock.dailyChange, 0) / state.bootstrap.stocks.length;
  const topMover = [...state.bootstrap.stocks].sort((a, b) => b.dailyChange - a.dailyChange)[0];
  const bestCompounder = [...state.bootstrap.stocks].sort((a, b) => getFiveYearCagr(b) - getFiveYearCagr(a))[0];
  safeText(els.snapshotDateLabel, state.bootstrap.snapshotDate);
  safeHTML(els.marketSummary, [
    { label: 'Broad benchmark', value: formatCurrency(state.bootstrap.benchmark.currentPrice), detail: formatPercent(state.bootstrap.benchmark.dailyChange), tone: state.bootstrap.benchmark.dailyChange },
    { label: 'Average tracked daily move', value: formatPercent(avgMove), detail: `${state.bootstrap.stocks.filter((stock) => stock.dailyChange > 0).length} stocks higher`, tone: avgMove },
    { label: 'Top daily mover', value: topMover.symbol, detail: formatPercent(topMover.dailyChange), tone: topMover.dailyChange },
    { label: 'Best five-year compounder', value: bestCompounder.symbol, detail: formatPercent(getFiveYearCagr(bestCompounder), 1), tone: getFiveYearCagr(bestCompounder) }
  ].map((card) => `<article class="metric-card"><span>${card.label}:</span><strong>${card.value}</strong><p class="${toneClass(card.tone)}">${card.detail}</p></article>`).join(''));
  safeText(els.marketMoodLabel, avgMove < 0 ? 'Markets closed with a cautious tone.' : 'Markets closed with a stable to positive tone.');
  safeText(els.marketMoodText, 'Verified market data is served through the StockPilot backend for a dynamic demo experience.');
  safeHTML(els.overviewMetrics, [
    { label: 'Tracked stocks', value: String(state.bootstrap.stocks.length) },
    { label: 'Lessons available', value: String(state.bootstrap.lessons.length) },
    { label: 'Glossary terms', value: String(state.bootstrap.glossaryTerms.length) },
    { label: 'Paper account value', value: formatCurrency(state.user?.paperAccountValue || 100000, true) }
  ].map((item) => `<article class="metric-card"><span>${item.label}:</span><strong>${item.value}</strong></article>`).join(''));
}

function renderAccount() {
  safeHTML(els.accountSummary, [
    { label: 'Profile status', value: state.user ? (state.user.isGuest ? 'Guest session' : 'Signed in') : 'Not signed in' },
    { label: 'Username', value: state.user?.username || 'Not set' },
    { label: 'Completed lessons', value: String(state.user?.completedLessons?.length || 0) },
    { label: 'Achievements unlocked', value: String(state.user?.achievements?.length || 0) }
  ].map((item) => `<article class="metric-card"><span>${item.label}:</span><strong>${item.value}</strong></article>`).join(''));
  safeText(els.accountStatus, state.user ? `Session active for ${state.user.username}.` : 'Create a profile or continue as a guest.');
}

function renderSelectors() {
  const sectors = ['All sectors', ...new Set(state.bootstrap.stocks.map((stock) => stock.sector))];
  if (els.sectorFilter) {
    els.sectorFilter.innerHTML = sectors.map((sector) => `<option value="${sector}">${sector}</option>`).join('');
    els.sectorFilter.value = state.selectedSector;
  }

  if (els.sortSelect) {
    els.sortSelect.innerHTML = [
      { value: 'daily-desc', label: 'Highest daily change' },
      { value: 'fiveYear-desc', label: 'Highest five-year compound annual growth rate' },
      { value: 'tenYear-desc', label: 'Highest ten-year compound annual growth rate' },
      { value: 'pe-asc', label: 'Lowest price to earnings ratio' },
      { value: 'cap-desc', label: 'Largest market capitalization' },
      { value: 'name-asc', label: 'Company name A to Z' }
    ].map((item) => `<option value="${item.value}">${item.label}</option>`).join('');
    els.sortSelect.value = state.selectedSort;
  }

  if (els.strategySelect) {
    els.strategySelect.innerHTML = state.bootstrap.strategies.map((strategy) => `<option value="${strategy.id}">${strategy.name}</option>`).join('');
    els.strategySelect.value = state.selectedStrategy;
  }

  if (els.tradeSymbolSelect) {
    els.tradeSymbolSelect.innerHTML = state.bootstrap.stocks.map((stock) => `<option value="${stock.symbol}">${stock.symbol} — ${stock.name}</option>`).join('');
    els.tradeSymbolSelect.value = state.selectedSymbol;
  }

  if (els.stockSuggestions) {
    els.stockSuggestions.innerHTML = state.bootstrap.stocks.map((stock) => `<option value="${stock.symbol}"></option><option value="${stock.name}"></option>`).join('');
  }

  if (els.quizDifficultySelect) {
    els.quizDifficultySelect.innerHTML = ['Beginner','Intermediate','Advanced'].map((difficulty) => `<option value="${difficulty}">${difficulty}</option>`).join('');
    els.quizDifficultySelect.value = state.quizDifficulty;
  }

  if (els.quizTopicSelect) {
    const topics = ['All topics', ...new Set(state.bootstrap.quizBank.map((quiz) => quiz.topic))];
    els.quizTopicSelect.innerHTML = topics.map((topic) => `<option value="${topic}">${topic}</option>`).join('');
    els.quizTopicSelect.value = state.quizTopic;
  }
}

function selectStock(symbol) {
  state.selectedSymbol = symbol;
  renderWatchlist();
  renderSelectedStock();
  renderAnalytics();
  renderTable();
  renderTradePreview();
  if (els.tradeSymbolSelect) els.tradeSymbolSelect.value = symbol;
}

function renderWatchlist() {
  safeText(els.trackedCountTag, `Tracked stocks: ${state.bootstrap.stocks.length}`);
  safeHTML(els.watchlistGrid, state.bootstrap.stocks.map((stock) => `<button class="watchlist-item compact-stock-row ${stock.symbol === state.selectedSymbol ? 'active' : ''}" type="button" data-symbol="${stock.symbol}"><div class="compact-stock-main"><strong>${stock.symbol}</strong><p class="ticker-subline">${stock.name}</p></div><div class="compact-stock-side"><strong>${formatCurrency(stock.currentPrice)}</strong><p class="${toneClass(stock.dailyChange)}">${formatPercent(stock.dailyChange)}</p></div></button>`).join(''));
}

function renderSelectedStock() {
  const stock = getSelectedStock();
  safeText(els.selectedSymbol, stock.symbol);
  safeText(els.selectedName, stock.name);
  safeText(els.selectedSector, stock.sector);
  safeText(els.selectedPrice, formatCurrency(stock.currentPrice));
  safeText(els.selectedChange, formatPercent(stock.dailyChange));
  if (els.selectedChange) els.selectedChange.className = toneClass(stock.dailyChange);
  safeText(els.selectedMarketCap, `${formatCurrency(stock.marketCap, true)} billion`);
  safeHTML(els.selectedMetrics, [
    { label: 'Five-year compound annual growth rate', value: formatPercent(getFiveYearCagr(stock), 1) },
    { label: 'Ten-year compound annual growth rate', value: formatPercent(getTenYearCagr(stock), 1) },
    { label: 'Price to earnings ratio', value: stock.pe.toFixed(2) },
    { label: 'Business summary', value: stock.description }
  ].map((metric) => `<article class="metric-chip"><span>${metric.label}:</span><strong>${metric.value}</strong></article>`).join(''));
  drawChart(els.trendChart, state.bootstrap.rangeLabels[state.watchlistRange], [
    { label: stock.name, values: stock.history[state.watchlistRange], color: '#60a5fa' },
    { label: state.bootstrap.benchmark.name, values: state.bootstrap.benchmark.history[state.watchlistRange], color: '#34d399' }
  ]);
  safeText(els.chartCaption, `${stock.name} over the selected range compared with the broad market benchmark.`);
}

function renderTable() {
  const filtered = getFilteredStocks();
  safeText(els.tableSummary, `Showing stocks: ${filtered.length} from the ${state.bootstrap.snapshotDate} snapshot.`);
  safeHTML(els.stockTableBody, filtered.map((stock) => `<tr data-symbol="${stock.symbol}" class="${stock.symbol === state.selectedSymbol ? 'active-row' : ''}" tabindex="0"><td><strong>${stock.symbol}</strong></td><td>${stock.name}</td><td>${stock.sector}</td><td>${formatCurrency(stock.currentPrice)}</td><td class="${toneClass(stock.dailyChange)}">${formatPercent(stock.dailyChange)}</td><td>${formatPercent(getFiveYearCagr(stock), 1)}</td><td>${stock.pe.toFixed(2)}</td><td><button class="button button-secondary" type="button" data-symbol="${stock.symbol}">Load stock</button></td></tr>`).join(''));
}

function renderTradePreview() {
  const stock = state.bootstrap.stocks.find((item) => item.symbol === els.tradeSymbolSelect?.value) || getSelectedStock();
  const shares = Number(els.tradeShares?.value || 1);
  safeHTML(els.tradePreview, `<strong>${stock.name}</strong><p>Estimated trade value: ${formatCurrency(stock.currentPrice * shares)}</p><p>Paper account cash available: ${formatCurrency(state.user?.paper?.cash || 100000, true)}</p>`);
}

function buildPaperSeries(range) {
  const labels = state.bootstrap.rangeLabels[range];
  const positions = Object.entries(state.user?.paper?.positions || {});
  const cash = state.user?.paper?.cash ?? 100000;
  if (!positions.length) return new Array(labels.length).fill(Number(cash.toFixed(2)));
  return labels.map((_, index) => {
    const holdingsValue = positions.reduce((sum, [symbol, position]) => {
      const stock = state.bootstrap.stocks.find((item) => item.symbol === symbol);
      const series = stock?.history?.[range] || [];
      const point = series[Math.min(index, series.length - 1)] || 0;
      return sum + (position.shares * point);
    }, 0);
    return Number((cash + holdingsValue).toFixed(2));
  });
}

function renderPaperTrading() {
  if (!state.user) return;
  const positions = Object.entries(state.user.paper.positions || {});
  safeHTML(els.paperTradingSummary, [
    { label: 'Paper cash', value: formatCurrency(state.user.paper.cash, true) },
    { label: 'Paper account value', value: formatCurrency(state.user.paperAccountValue, true) },
    { label: 'Open positions', value: String(positions.length) },
    { label: 'Trades placed', value: String(state.user.paper.history.length) }
  ].map((item) => `<article class="metric-card"><span>${item.label}:</span><strong>${item.value}</strong></article>`).join(''));
  safeHTML(els.paperTradingNarrative, `<strong>Paper trading note</strong><p>Your holdings, cash, account value, and trade history are stored on the server and loaded through the StockPilot API.</p>`);
  safeHTML(els.positionsTableBody, positions.length ? positions.map(([symbol, position]) => {
    const stock = state.bootstrap.stocks.find((item) => item.symbol === symbol);
    const value = position.shares * (stock?.currentPrice || 0);
    const cost = position.shares * position.averageCost;
    const pnl = value - cost;
    return `<tr><td>${symbol}</td><td>${position.shares}</td><td>${formatCurrency(position.averageCost)}</td><td>${formatCurrency(value)}</td><td class="${toneClass(pnl)}">${formatCurrency(pnl)}</td></tr>`;
  }).join('') : `<tr><td colspan="5">No open positions yet.</td></tr>`);
  safeHTML(els.tradeHistory, state.user.paper.history.length ? [...state.user.paper.history].reverse().map((trade) => `<article class="activity-item"><strong>${trade.type === 'buy' ? 'Buy' : 'Sell'} ${trade.symbol}</strong><p>${trade.shares} shares at ${formatCurrency(trade.price)} • ${new Date(trade.timestamp).toLocaleString()}</p></article>`).join('') : `<article class="activity-item"><strong>No trades yet</strong><p>Your trade log will appear here after your first trade.</p></article>`);
  drawChart(els.portfolioChart, state.bootstrap.rangeLabels[state.paperRange], [
    { label: 'Paper account projection', values: buildPaperSeries(state.paperRange), color: '#60a5fa' },
    { label: getSelectedStock().name, values: getSelectedStock().history[state.paperRange], color: '#34d399' }
  ]);
  renderOverview();
}

function renderAnalytics() {
  const stock = getSelectedStock();
  const datasets = [{ label: stock.name, values: stock.history[state.analyticsRange], color: '#60a5fa' }];
  if (state.analyticsCompare === 'benchmark') datasets.push({ label: state.bootstrap.benchmark.name, values: state.bootstrap.benchmark.history[state.analyticsRange], color: '#34d399' });
  drawChart(els.analyticsChart, state.bootstrap.rangeLabels[state.analyticsRange], datasets);
  safeText(els.analyticsSelectedTag, stock.symbol);
  const rangeReturn = calculateReturn(stock.history[state.analyticsRange]);
  safeHTML(els.analyticsMetrics, [
    { label: 'Current price', value: formatCurrency(stock.currentPrice), tone: 0 },
    { label: 'Daily change', value: formatPercent(stock.dailyChange), tone: stock.dailyChange },
    { label: 'Five-year compound annual growth rate', value: formatPercent(getFiveYearCagr(stock), 1), tone: getFiveYearCagr(stock) },
    { label: 'Ten-year compound annual growth rate', value: formatPercent(getTenYearCagr(stock), 1), tone: getTenYearCagr(stock) },
    { label: 'Selected range return', value: formatPercent(rangeReturn, 1), tone: rangeReturn },
    { label: 'Price to earnings ratio', value: stock.pe.toFixed(2), tone: 0 }
  ].map((metric) => `<article class="metric-card"><span>${metric.label}:</span><strong class="${metric.tone ? toneClass(metric.tone) : ''}">${metric.value}</strong></article>`).join(''));
  safeHTML(els.analyticsNarrative, `<strong>${stock.name}</strong><p>${stock.description}</p><p>Across the selected range, the stock returned ${formatPercent(rangeReturn, 1)}. Over five years its compound annual growth rate is ${formatPercent(getFiveYearCagr(stock), 1)} and over ten years it is ${formatPercent(getTenYearCagr(stock), 1)}.</p>`);
  safeHTML(els.portfolioAnalyticsMetrics, [
    { label: 'Paper account value', value: formatCurrency(state.user?.paperAccountValue || 100000, true), tone: 0 },
    { label: 'Paper account drawdown', value: formatPercent(calculateMaxDrawdown(state.user?.paper?.valueHistory || [100000]), 1), tone: calculateMaxDrawdown(state.user?.paper?.valueHistory || [100000]) },
    { label: 'Best quiz score', value: String(state.user?.bestQuizScore || 0), tone: 0 },
    { label: 'Achievements unlocked', value: String(state.user?.achievements?.length || 0), tone: 0 }
  ].map((metric) => `<article class="metric-card"><span>${metric.label}:</span><strong class="${metric.tone ? toneClass(metric.tone) : ''}">${metric.value}</strong></article>`).join(''));
  safeHTML(els.aiSummaryBlock, state.bootstrap.stocks.map((stockItem) => `<article class="activity-item"><strong>${stockItem.name}</strong><p>${stockItem.description}</p></article>`).join(''));
}

async function renderBacktest() {
  const data = await api(`/api/backtest/${encodeURIComponent(state.selectedStrategy)}?capital=${encodeURIComponent(state.startingCapital)}`);
  drawChart(els.backtestChart, ['Start', ...data.breakdown.map((item) => String(item.year))], [
    { label: data.strategy.name, values: [state.startingCapital, ...data.breakdown.map((item) => Number(item.strategyValue.toFixed(2)))], color: '#60a5fa' },
    { label: state.bootstrap.benchmark.name, values: [state.startingCapital, ...data.breakdown.map((item) => Number(item.benchmarkValue.toFixed(2)))], color: '#34d399' }
  ]);
  safeHTML(els.backtestMetrics, [
    { label: 'Final strategy value', value: formatCurrency(data.finalStrategyValue, true), tone: 0 },
    { label: 'Strategy total return', value: formatPercent(data.totalReturn, 1), tone: data.totalReturn },
    { label: 'Benchmark total return', value: formatPercent(data.benchmarkReturn, 1), tone: data.benchmarkReturn },
    { label: 'Compound annual growth rate', value: formatPercent(data.compoundAnnualGrowthRate, 1), tone: data.compoundAnnualGrowthRate },
    { label: 'Outperformance gap', value: formatPercent(data.outperformanceGap, 1), tone: data.outperformanceGap }
  ].map((metric) => `<article class="metric-card"><span>${metric.label}:</span><strong class="${metric.tone ? toneClass(metric.tone) : ''}">${metric.value}</strong></article>`).join(''));
  safeHTML(els.strategySummary, `<strong>${data.strategy.name}</strong><p>${data.strategy.rationale}</p><p>This strategy ${data.totalReturn >= data.benchmarkReturn ? 'outperformed' : 'underperformed'} the broad market benchmark by ${formatPercent(data.outperformanceGap, 1)} across the backtest window.</p>`);
  safeHTML(els.backtestBreakdown, data.breakdown.map((item) => `<article class="activity-item"><strong>${item.year}</strong><p>Strategy ${formatPercent(item.strategyReturn, 1)} versus benchmark ${formatPercent(item.benchmarkReturn, 1)}.</p><p>Strategy value ${formatCurrency(item.strategyValue, true)} • benchmark value ${formatCurrency(item.benchmarkValue, true)}</p></article>`).join(''));
}

function renderDailyChallenge() {
  const challenge = state.bootstrap.dailyChallenge;
  safeText(els.dailyChallengeTitle, challenge.title);
  safeText(els.dailyChallengeDescription, challenge.description);
  const completed = Boolean(state.user?.lastChallengeKey && state.user.lastChallengeKey.includes(challenge.id));
  safeText(els.dailyChallengeStatus, completed ? 'You already completed today’s challenge.' : 'Today’s challenge is available.');
}

function renderLearning() {
  const visible = state.bootstrap.lessons.filter((lesson) => state.learningFilter === 'All levels' || lesson.difficulty === state.learningFilter);
  const completedCount = state.user?.completedLessons?.length || 0;
  safeText(els.learningProgressText, `${completedCount} of ${state.bootstrap.lessons.length} lessons completed.`);
  if (els.learningProgressFill) els.learningProgressFill.style.width = `${(completedCount / state.bootstrap.lessons.length) * 100}%`;
  safeHTML(els.learningFilters, ['All levels','Beginner','Intermediate','Advanced'].map((filter) => `<button class="button button-secondary ${state.learningFilter === filter ? 'active-pill' : ''}" type="button" data-learning-filter="${filter}">${filter}</button>`).join(''));
  safeHTML(els.lessonGrid, visible.map((lesson) => `<article class="card compact-lesson-card"><div class="card-title-row compact-card-title"><div><p class="eyebrow">${lesson.difficulty}</p><h3>${lesson.title}</h3></div><span class="tag">${(state.user?.completedLessons || []).includes(lesson.id) ? 'Completed' : 'Lesson'}</span></div><p class="compact-copy">${lesson.summary}</p><details class="lesson-details"><summary>Open lesson details</summary><div class="summary-block compact-summary-block"><strong>Try it yourself</strong>${lesson.prompts.map((prompt) => `<p>${prompt}</p>`).join('')}</div></details><div class="button-row compact-button-row"><button class="button button-secondary" type="button" data-complete-lesson="${lesson.id}">${(state.user?.completedLessons || []).includes(lesson.id) ? 'Completed' : 'Mark complete'}</button></div></article>`).join(''));
}

function buildQuizPool() {
  return state.bootstrap.quizBank.filter((quiz) => quiz.difficulty === state.quizDifficulty && (state.quizTopic === 'All topics' || quiz.topic === state.quizTopic));
}

function buildQuizSession() {
  const fullPool = buildQuizPool();
  return shuffleArray(fullPool).slice(0, Math.min(QUIZ_SESSION_LENGTH, fullPool.length));
}

function renderQuiz() {
  if (!state.quizPool.length) state.quizPool = buildQuizSession();
  if (!state.quizPool.length) {
    safeText(els.quizMeta, 'No questions available for this filter.');
    safeText(els.quizQuestion, 'Choose another difficulty or topic.');
    safeHTML(els.quizAnswers, '');
    safeHTML(els.quizResults, '');
    safeText(els.quizScore, 'Score: 0');
    els.quizNextButton?.classList.add('hidden');
    els.quizRestartButton?.classList.add('hidden');
    return;
  }
  if (state.quizCompleted) {
    const totalQuestions = state.quizPool.length;
    const percentage = totalQuestions ? Math.round((state.quizScore / totalQuestions) * 100) : 0;
    safeText(els.quizMeta, `${state.quizDifficulty} • ${state.quizTopic} • Quiz complete`);
    safeText(els.quizQuestion, 'Quiz complete');
    safeHTML(els.quizAnswers, '');
    safeText(els.quizFeedback, '');
    if (els.quizFeedback) els.quizFeedback.className = 'feedback-text';
    if (els.quizResults) {
      els.quizResults.classList.remove('hidden');
      safeHTML(els.quizResults, `<strong>Final score</strong><p>You scored ${state.quizScore} out of ${totalQuestions} (${percentage}%). Change the difficulty or topic, or retake this session to keep practicing.</p>${state.quizWrongAnswers.length ? `<div class="wrong-answer-review"><strong>Review missed questions</strong>${state.quizWrongAnswers.slice(0, 8).map((item) => `<article class="review-item"><p><strong>Question:</strong> ${item.question}</p><p><strong>Correct answer:</strong> ${item.correct}</p><p>${item.explanation}</p></article>`).join('')}</div>` : '<p>Perfect score. Great job.</p>'}`);
    }
    safeText(els.quizScore, `Score: ${state.quizScore}`);
    els.quizNextButton?.classList.add('hidden');
    els.quizRestartButton?.classList.remove('hidden');
    return;
  }
  els.quizNextButton?.classList.remove('hidden');
  els.quizRestartButton?.classList.add('hidden');
  els.quizResults?.classList.add('hidden');
  const question = state.quizPool[state.quizIndex % state.quizPool.length];
  safeText(els.quizMeta, `Question ${state.quizIndex + 1} of ${state.quizPool.length} • ${state.quizDifficulty} • ${state.quizTopic} • Best score: ${state.user?.bestQuizScore || 0}`);
  safeText(els.quizQuestion, question.question);
  safeHTML(els.quizAnswers, question.answers.map((answer, index) => `<button class="button button-secondary quiz-answer" type="button" data-quiz-answer="${index}" ${state.quizAnswered ? 'disabled' : ''}>${answer}</button>`).join(''));
  safeText(els.quizScore, `Score: ${state.quizScore}`);
  if (els.quizNextButton) {
    els.quizNextButton.disabled = !state.quizAnswered;
    els.quizNextButton.textContent = state.quizAnswered
      ? (state.quizIndex >= state.quizPool.length - 1 ? 'Finish quiz' : 'Next question')
      : 'Answer to continue';
  }
}

function renderFinalExam() {
  if (!state.finalExamPool.length) {
    safeText(els.finalExamArea, 'Start the final exam from the Learning Hub when ready.');
    return;
  }
  const question = state.finalExamPool[state.finalExamIndex];
  safeHTML(els.finalExamArea, `<strong>Question ${state.finalExamIndex + 1} of ${state.finalExamPool.length}</strong><p>${question.question}</p><div class="quiz-answers">${question.answers.map((answer, index) => `<button class="button button-secondary quiz-answer" type="button" data-final-answer="${index}">${answer}</button>`).join('')}</div><p class="form-status">Score: ${state.finalExamScore}</p>`);
}

function renderGames() {
  if (els.gamesGrid) {
    safeHTML(els.gamesGrid, '');
    const section = els.gamesGrid.closest('section');
    if (section) section.classList.add('hidden');
  }
}

function renderGlossary() {
  const search = state.glossarySearch.trim().toLowerCase();
  const filtered = search ? state.bootstrap.glossaryTerms.filter((term) => `${term.term} ${term.shortDefinition} ${term.longDefinition}`.toLowerCase().includes(search)) : state.bootstrap.glossaryTerms;
  safeText(els.glossarySummary, `Showing glossary terms: ${filtered.length}`);
  safeHTML(els.glossaryGrid, filtered.map((term) => `<article class="glossary-card compact-glossary-card"><div class="card-title-row compact-card-title"><h3>${term.term}</h3><button class="button button-secondary compact-inline-button" type="button" data-open-definition="${term.term}">Quick definition</button></div><p class="compact-copy">${term.shortDefinition}</p><details class="glossary-details"><summary>Open explanation and practice</summary><div class="summary-block compact-summary-block"><strong>Detailed explanation</strong><p>${term.longDefinition}</p></div><div class="summary-block compact-summary-block"><strong>Try it yourself</strong><p>${term.question}</p><div class="button-row compact-button-row"><button class="button button-secondary" type="button" data-reveal-glossary="${term.term}">Reveal answer</button></div><p id="glossary-answer-${term.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">${(state.user?.glossaryReveals || []).includes(term.term) ? term.answer : 'Answer hidden until reveal.'}</p></div></details></article>`).join(''));
}

function renderAchievements() {
  safeHTML(els.achievementOverview, [
    { label: 'Unlocked achievements', value: String(state.user?.achievements?.length || 0) },
    { label: 'Completed lessons', value: String(state.user?.completedLessons?.length || 0) },
    { label: 'Best quiz score', value: String(state.user?.bestQuizScore || 0) },
    { label: 'Paper trades', value: String(state.user?.paper?.history?.length || 0) }
  ].map((item) => `<article class="metric-card"><span>${item.label}:</span><strong>${item.value}</strong></article>`).join(''));
  const definitions = state.bootstrap.achievementDefinitions || [];
  safeHTML(els.achievementGrid, definitions.map((achievement) => `<article class="achievement-card compact-achievement-card ${(state.user?.achievements || []).includes(achievement.id) ? 'unlocked' : ''}"><div class="card-title-row compact-card-title"><h3>${achievement.title}</h3><span class="tag">${(state.user?.achievements || []).includes(achievement.id) ? 'Unlocked' : 'Locked'}</span></div><p class="compact-copy">${achievement.description}</p></article>`).join(''));
}

function renderCoach() {
  safeHTML(els.coachPrompts, state.bootstrap.coachPrompts.map((prompt) => `<button class="button button-secondary" type="button" data-coach-prompt="${prompt}">${prompt}</button>`).join(''));
  safeText(els.coachResponse, state.coachResponse);
}

function openDefinition(termName) {
  const term = state.bootstrap.glossaryTerms.find((item) => item.term === termName);
  if (!term) return;
  safeText(els.floatingDefinitionTitle, term.term);
  safeText(els.floatingDefinitionText, term.longDefinition);
  els.floatingDefinition?.classList.remove('hidden');
}

function closeDefinition() {
  els.floatingDefinition?.classList.add('hidden');
}

async function createGuestSession() {
  const data = await api('/api/auth/guest', { method: 'POST' });
  persistSessionToken(data.sessionToken);
  state.user = data.user;
}

async function refreshMe() {
  if (!state.sessionToken) return;
  const data = await api('/api/me');
  state.user = data.user;
}

async function bootstrap() {
  cacheElements();
  state.bootstrap = await api('/api/bootstrap');
  state.selectedSymbol = state.bootstrap.stocks[0].symbol;
  state.selectedStrategy = state.bootstrap.strategies[0].id;
  if (state.sessionToken) {
    try { await refreshMe(); }
    catch { persistSessionToken(null); await createGuestSession(); }
  } else {
    await createGuestSession();
  }
  renderSelectors();
  renderOverview();
  renderAccount();
  renderWatchlist();
  renderSelectedStock();
  renderTable();
  renderPaperTrading();
  renderAnalytics();
  await renderBacktest();
  renderDailyChallenge();
  renderLearning();
  state.quizPool = buildQuizSession();
  renderQuiz();
  renderFinalExam();
  renderGames();
  renderGlossary();
  renderAchievements();
  renderCoach();
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-scroll-target]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      scrollToSection(el.dataset.scrollTarget);
    });
  });

  els.accountForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = { email: els.accountEmail.value, username: els.accountUsername.value, password: els.accountPassword.value };
      let data;
      if (state.user?.isGuest) {
        try {
          data = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
          persistSessionToken(data.sessionToken);
          safeText(els.accountStatus, 'Profile created successfully.');
        } catch {
          data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ identifier: payload.email || payload.username, password: payload.password }) });
          persistSessionToken(data.sessionToken);
          safeText(els.accountStatus, 'Logged in successfully.');
        }
      } else {
        data = await api('/api/me/profile', { method: 'PUT', body: JSON.stringify(payload) });
        safeText(els.accountStatus, 'Profile saved successfully.');
      }
      state.user = data.user;
      renderAccount();
      renderAchievements();
      renderOverview();
    } catch (error) {
      safeText(els.accountStatus, error.message);
    }
  });

  els.logoutButton?.addEventListener('click', async () => {
    if (state.sessionToken) { try { await api('/api/auth/logout', { method: 'POST' }); } catch {} }
    persistSessionToken(null);
    await createGuestSession();
    renderAccount();
    renderPaperTrading();
    renderAchievements();
    renderOverview();
  });

  els.watchlistGrid?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-symbol]');
    if (button) selectStock(button.dataset.symbol);
  });

  els.stockTableBody?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-symbol]');
    if (button) selectStock(button.dataset.symbol);
  });

  els.searchInput?.addEventListener('input', (event) => { state.searchTerm = event.target.value; renderTable(); });
  els.sectorFilter?.addEventListener('change', (event) => { state.selectedSector = event.target.value; renderTable(); });
  els.sortSelect?.addEventListener('change', (event) => { state.selectedSort = event.target.value; renderTable(); });
  els.watchlistRangeSelect?.addEventListener('change', (event) => { state.watchlistRange = event.target.value; renderSelectedStock(); });

  document.querySelector('.action-select-trade')?.addEventListener('click', () => scrollToSection('simulator'));
  document.querySelector('.action-select-analytics')?.addEventListener('click', () => scrollToSection('analytics'));
  document.querySelector('.action-select-coach')?.addEventListener('click', async () => {
    if (els.coachInput) els.coachInput.value = `Summarize ${state.selectedSymbol} for me.`;
    const data = await api('/api/coach/ask', { method: 'POST', body: JSON.stringify({ question: els.coachInput?.value || '', selectedSymbol: state.selectedSymbol }) });
    state.coachResponse = data.response;
    state.user = data.user;
    renderCoach();
    renderAchievements();
    scrollToSection('coach');
  });

  els.tradeSearchInput?.addEventListener('input', (event) => {
    const value = event.target.value.toLowerCase();
    const match = state.bootstrap.stocks.find((stock) => stock.symbol.toLowerCase() === value || stock.name.toLowerCase() === value);
    if (match) selectStock(match.symbol);
  });

  els.tradeSymbolSelect?.addEventListener('change', (event) => selectStock(event.target.value));
  els.tradeShares?.addEventListener('input', renderTradePreview);

  els.tradeForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const data = await api('/api/paper/trade', { method: 'POST', body: JSON.stringify({ side: els.tradeSide.value, symbol: els.tradeSymbolSelect.value, shares: Number(els.tradeShares.value) }) });
      state.user = data.user;
      safeText(els.tradeStatus, data.message);
      if (els.tradeStatus) els.tradeStatus.className = 'form-status positive';
      renderPaperTrading();
      renderAchievements();
      renderOverview();
      renderAccount();
    } catch (error) {
      safeText(els.tradeStatus, error.message);
      if (els.tradeStatus) els.tradeStatus.className = 'form-status negative';
    }
  });

  els.resetPortfolioButton?.addEventListener('click', async () => {
    const data = await api('/api/paper/reset', { method: 'POST' });
    state.user = data.user;
    safeText(els.tradeStatus, 'Paper trading account reset.');
    renderPaperTrading();
    renderOverview();
    renderAchievements();
    renderAccount();
  });

  els.paperRangeSelect?.addEventListener('change', (event) => { state.paperRange = event.target.value; renderPaperTrading(); });
  els.analyticsRangeSelect?.addEventListener('change', (event) => { state.analyticsRange = event.target.value; renderAnalytics(); });
  els.analyticsCompareSelect?.addEventListener('change', (event) => { state.analyticsCompare = event.target.value; renderAnalytics(); });
  els.strategySelect?.addEventListener('change', (event) => { state.selectedStrategy = event.target.value; renderBacktest(); });
  els.startingCapital?.addEventListener('input', (event) => { state.startingCapital = Number(event.target.value) || 10000; });

  els.runBacktestButton?.addEventListener('click', async () => {
    await renderBacktest();
    scrollToSection('backtest');
  });

  els.completeChallengeButton?.addEventListener('click', async () => {
    const data = await api('/api/challenge/complete', { method: 'POST' });
    state.user = data.user;
    renderDailyChallenge();
    renderAchievements();
    renderAccount();
  });

  els.learningFilters?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-learning-filter]');
    if (!button) return;
    state.learningFilter = button.dataset.learningFilter;
    renderLearning();
  });

  els.lessonGrid?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-complete-lesson]');
    if (!button) return;
    const data = await api('/api/lessons/complete', { method: 'POST', body: JSON.stringify({ lessonId: button.dataset.completeLesson }) });
    state.user = data.user;
    renderLearning();
    renderAchievements();
    renderAccount();
  });

  function resetQuizState() {
    state.quizPool = buildQuizSession();
    state.quizIndex = 0;
    state.quizScore = 0;
    state.quizAnswered = false;
    state.quizCompleted = false;
    state.quizWrongAnswers = [];
    safeText(els.quizFeedback, '');
    if (els.quizFeedback) els.quizFeedback.className = 'feedback-text';
    els.quizResults?.classList.add('hidden');
  }

  els.quizDifficultySelect?.addEventListener('change', (event) => { state.quizDifficulty = event.target.value; resetQuizState(); renderQuiz(); });
  els.quizTopicSelect?.addEventListener('change', (event) => { state.quizTopic = event.target.value; resetQuizState(); renderQuiz(); });
  els.startQuizButton?.addEventListener('click', () => { resetQuizState(); renderQuiz(); });
  els.quizRestartButton?.addEventListener('click', () => { resetQuizState(); renderQuiz(); });

  els.quizAnswers?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-quiz-answer]');
    if (!button || state.quizAnswered || state.quizCompleted) return;
    const question = state.quizPool[state.quizIndex % state.quizPool.length];
    state.quizAnswered = true;
    if (Number(button.dataset.quizAnswer) === question.correctIndex) {
      state.quizScore += 1;
      safeText(els.quizFeedback, `Correct. ${question.explanation}`);
      if (els.quizFeedback) els.quizFeedback.className = 'form-status positive';
    } else {
      state.quizWrongAnswers.push({
        question: question.question,
        correct: question.answers[question.correctIndex],
        explanation: question.explanation
      });
      safeText(els.quizFeedback, `Not quite. ${question.explanation}`);
      if (els.quizFeedback) els.quizFeedback.className = 'form-status negative';
    }
    const data = await api('/api/quiz/submit', { method: 'POST', body: JSON.stringify({ score: state.quizScore }) });
    state.user = data.user;
    renderQuiz();
    renderAchievements();
    renderAccount();
  });

  els.quizNextButton?.addEventListener('click', () => {
    if (!state.quizPool.length || state.quizCompleted) return;
    if (!state.quizAnswered) {
      safeText(els.quizFeedback, 'Choose an answer before moving to the next question.');
      if (els.quizFeedback) els.quizFeedback.className = 'form-status negative';
      return;
    }
    if (state.quizIndex >= state.quizPool.length - 1) {
      state.quizCompleted = true;
      renderQuiz();
      return;
    }
    state.quizIndex += 1;
    state.quizAnswered = false;
    safeText(els.quizFeedback, '');
    if (els.quizFeedback) els.quizFeedback.className = 'feedback-text';
    renderQuiz();
  });

  els.startFinalExamButton?.addEventListener('click', () => {
    state.finalExamPool = [...state.bootstrap.quizBank].sort(() => Math.random() - 0.5).slice(0, 12);
    state.finalExamIndex = 0;
    state.finalExamScore = 0;
    renderFinalExam();
    scrollToSection('quiz-center');
  });

  els.finalExamArea?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-final-answer]');
    if (!button || !state.finalExamPool.length) return;
    const question = state.finalExamPool[state.finalExamIndex];
    if (Number(button.dataset.finalAnswer) === question.correctIndex) state.finalExamScore += 1;
    state.finalExamIndex += 1;
    if (state.finalExamIndex >= state.finalExamPool.length) {
      const percentage = Math.round((state.finalExamScore / state.finalExamPool.length) * 100);
      const data = await api('/api/quiz/submit', { method: 'POST', body: JSON.stringify({ finalExamScore: percentage }) });
      state.user = data.user;
      safeHTML(els.finalExamArea, `<strong>Final exam complete</strong><p>Your score was ${state.finalExamScore} out of ${state.finalExamPool.length}. ${percentage >= 70 ? 'You passed the final exam.' : 'You can retake the exam anytime.'}</p>`);
      safeText(els.finalExamStatus, percentage >= 70 ? 'Final exam passed.' : 'Final exam completed, but not yet passed.');
      renderAchievements();
      renderAccount();
      return;
    }
    renderFinalExam();
  });

  els.glossarySearch?.addEventListener('input', (event) => {
    state.glossarySearch = event.target.value;
    renderGlossary();
  });

  els.glossaryGrid?.addEventListener('click', async (event) => {
    const revealButton = event.target.closest('[data-reveal-glossary]');
    const definitionButton = event.target.closest('[data-open-definition]');
    if (revealButton) {
      const data = await api('/api/glossary/reveal', { method: 'POST', body: JSON.stringify({ term: revealButton.dataset.revealGlossary }) });
      state.user = data.user;
      renderGlossary();
      renderAchievements();
      renderAccount();
    }
    if (definitionButton) openDefinition(definitionButton.dataset.openDefinition);
  });

  els.coachPrompts?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-coach-prompt]');
    if (!button) return;
    if (els.coachInput) els.coachInput.value = button.dataset.coachPrompt;
    const data = await api('/api/coach/ask', { method: 'POST', body: JSON.stringify({ question: button.dataset.coachPrompt, selectedSymbol: state.selectedSymbol }) });
    state.coachResponse = data.response;
    state.user = data.user;
    renderCoach();
    renderAchievements();
    renderAccount();
  });

  els.coachForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = await api('/api/coach/ask', { method: 'POST', body: JSON.stringify({ question: els.coachInput?.value || '', selectedSymbol: state.selectedSymbol }) });
    state.coachResponse = data.response;
    state.user = data.user;
    renderCoach();
    renderAchievements();
    renderAccount();
  });

  els.coachSelectedStockButton?.addEventListener('click', async () => {
    const data = await api('/api/coach/ask', { method: 'POST', body: JSON.stringify({ question: `Summarize ${state.selectedSymbol} for me.`, selectedSymbol: state.selectedSymbol }) });
    state.coachResponse = data.response;
    state.user = data.user;
    renderCoach();
    renderAchievements();
    renderAccount();
  });

  els.closeDefinitionButton?.addEventListener('click', closeDefinition);
  els.floatingDefinition?.addEventListener('click', (event) => {
    if (event.target.id === 'floatingDefinition') closeDefinition();
  });

  els.backToTopButton?.addEventListener('click', () => scrollToSection('overview'));

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDefinition();
  });

  window.addEventListener('resize', async () => {
    renderSelectedStock();
    renderPaperTrading();
    renderAnalytics();
    await renderBacktest();
  });
}

bootstrap().catch((error) => {
  console.error(error);
  document.body.innerHTML = `<div style="padding:24px;color:white;font-family:Arial,sans-serif;"><h1>StockPilot failed to load</h1><p>${error.message}</p></div>`;
});