(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory;
  if (root && root.StockPilotCatalog) {
    root.StockPilotStaticApi = factory(root.StockPilotCatalog, root.localStorage, root.crypto);
  }
})(typeof window !== 'undefined' ? window : null, function createStaticApi(catalog, storage, cryptoProvider) {
  const DB_KEY = 'stockpilot-static-db-v1';

  function readDb() {
    const saved = storage.getItem(DB_KEY);
    if (!saved) return { users: [], sessions: [] };
    try {
      const parsed = JSON.parse(saved);
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : []
      };
    } catch {
      throw new Error('Saved StockPilot browser data is invalid. Clear this site’s local storage and reload.');
    }
  }

  function writeDb(db) {
    storage.setItem(DB_KEY, JSON.stringify(db));
  }

  function randomId() {
    const bytes = new Uint8Array(16);
    cryptoProvider.getRandomValues(bytes);
    return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function createPaperState() {
    return { cash: 100000, positions: {}, history: [], valueHistory: [100000] };
  }

  function createUser({ email, username, passwordHash = null, isGuest = false }) {
    return {
      id: `${isGuest ? 'guest' : 'user'}_${randomId()}`,
      email,
      username,
      passwordHash,
      isGuest,
      createdAt: new Date().toISOString(),
      paper: createPaperState(),
      completedLessons: [],
      glossaryReveals: [],
      bestQuizScore: 0,
      bestFinalExamScore: 0,
      achievements: [],
      lastChallengeKey: null,
      coachLog: []
    };
  }

  function calculatePaperValue(user) {
    const holdingsValue = Object.entries(user.paper.positions).reduce((sum, [symbol, position]) => {
      const stock = catalog.stocks.find((item) => item.symbol === symbol);
      return sum + ((stock?.currentPrice || 0) * (position?.shares || 0));
    }, 0);
    return Number((user.paper.cash + holdingsValue).toFixed(2));
  }

  function recalculateAchievements(user) {
    const achievements = new Set();
    const completedLessons = user.completedLessons || [];
    const paperHistory = user.paper?.history || [];
    const glossaryReveals = user.glossaryReveals || [];
    const coachLog = user.coachLog || [];
    const openPositions = Object.keys(user.paper?.positions || {}).length;
    const paperValue = Number(user.paper?.cash || 0) + Object.values(user.paper?.positions || {}).reduce(
      (sum, position) => sum + ((position?.shares || 0) * (position?.averageCost || 0)),
      0
    );

    if (!user.isGuest) achievements.add('profile-created');
    if (completedLessons.length >= 1) achievements.add('first-lesson');
    if (completedLessons.length >= 5) achievements.add('five-lessons');
    if (completedLessons.length >= 15) achievements.add('fifteen-lessons');
    if (completedLessons.length >= 30) achievements.add('curriculum-complete');
    if (paperHistory.length >= 1) achievements.add('first-trade');
    if (paperHistory.length >= 5) achievements.add('five-trades');
    if (paperHistory.length >= 10) achievements.add('ten-trades');
    if (openPositions >= 3) achievements.add('portfolio-builder');
    if (paperValue > 100000) achievements.add('paper-profit');
    if (glossaryReveals.length >= 5) achievements.add('glossary-explorer');
    if (glossaryReveals.length >= 12) achievements.add('glossary-scholar');
    if (user.lastChallengeKey) achievements.add('daily-challenge');
    if (coachLog.length >= 1) achievements.add('coach-used');
    if (coachLog.length >= 5) achievements.add('coach-strategist');
    if ((user.bestQuizScore || 0) >= 3) achievements.add('quiz-score');
    if ((user.bestQuizScore || 0) >= 8) achievements.add('quiz-master');
    if ((user.bestFinalExamScore || 0) >= 70) achievements.add('final-exam');

    user.achievements = [...achievements];
    return user;
  }

  function publicUser(user) {
    recalculateAchievements(user);
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isGuest: user.isGuest,
      createdAt: user.createdAt,
      paper: user.paper,
      paperAccountValue: calculatePaperValue(user),
      completedLessons: user.completedLessons,
      glossaryReveals: user.glossaryReveals,
      bestQuizScore: user.bestQuizScore || 0,
      bestFinalExamScore: user.bestFinalExamScore || 0,
      achievements: user.achievements,
      lastChallengeKey: user.lastChallengeKey,
      coachLogCount: (user.coachLog || []).length
    };
  }

  function findUser(db, options) {
    const token = options.headers?.['x-stockpilot-session'] || options.headers?.['X-StockPilot-Session'];
    const session = db.sessions.find((item) => item.token === token);
    return session ? db.users.find((item) => item.id === session.userId) || null : null;
  }

  function requireUser(db, options) {
    const user = findUser(db, options);
    if (!user) throw new Error('Authentication required.');
    return user;
  }

  function parseBody(options) {
    if (!options.body) return {};
    return typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  }

  async function hashPassword(password, salt = randomId()) {
    const data = new TextEncoder().encode(`${salt}:${password}`);
    const digest = await cryptoProvider.subtle.digest('SHA-256', data);
    const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${salt}:${hash}`;
  }

  async function request(path, options = {}) {
    const url = new URL(path, 'https://stockpilot.local');
    const method = (options.method || 'GET').toUpperCase();
    const body = parseBody(options);

    if (url.pathname === '/api/bootstrap' && method === 'GET') return catalog.getBootstrapPayload();
    if (url.pathname.startsWith('/api/backtest/') && method === 'GET') {
      const strategyId = decodeURIComponent(url.pathname.slice('/api/backtest/'.length));
      const capital = Number(url.searchParams.get('capital') || 10000);
      return catalog.runBacktest(strategyId, capital);
    }

    const db = readDb();

    if (url.pathname === '/api/auth/guest' && method === 'POST') {
      const stamp = randomId();
      const user = createUser({
        email: `guest-${stamp}@stockpilot.local`,
        username: `Guest-${stamp.slice(-6)}`,
        isGuest: true
      });
      const session = { token: randomId(), userId: user.id, createdAt: new Date().toISOString() };
      db.users.push(user);
      db.sessions.push(session);
      writeDb(db);
      return { sessionToken: session.token, user: publicUser(user) };
    }

    if (url.pathname === '/api/auth/register' && method === 'POST') {
      const { email, username, password } = body;
      if (!email || !username || !password) throw new Error('Email, username, and password are required.');
      const existing = db.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase()
        || user.username.toLowerCase() === String(username).toLowerCase());
      if (existing) throw new Error('A user with that email or username already exists.');
      const user = createUser({ email, username, passwordHash: await hashPassword(password) });
      recalculateAchievements(user);
      const session = { token: randomId(), userId: user.id, createdAt: new Date().toISOString() };
      db.users.push(user);
      db.sessions.push(session);
      writeDb(db);
      return { sessionToken: session.token, user: publicUser(user) };
    }

    if (url.pathname === '/api/auth/login' && method === 'POST') {
      const { identifier, password } = body;
      if (!identifier || !password) throw new Error('Identifier and password are required.');
      const user = db.users.find((item) => item.email.toLowerCase() === String(identifier).toLowerCase()
        || item.username.toLowerCase() === String(identifier).toLowerCase());
      if (!user?.passwordHash) throw new Error('Invalid login credentials.');
      const [salt, expectedHash] = user.passwordHash.split(':');
      const submittedHash = (await hashPassword(password, salt)).split(':')[1];
      if (submittedHash !== expectedHash) throw new Error('Invalid login credentials.');
      const session = { token: randomId(), userId: user.id, createdAt: new Date().toISOString() };
      db.sessions.push(session);
      writeDb(db);
      return { sessionToken: session.token, user: publicUser(user) };
    }

    const user = requireUser(db, options);

    if (url.pathname === '/api/auth/logout' && method === 'POST') {
      const token = options.headers?.['x-stockpilot-session'] || options.headers?.['X-StockPilot-Session'];
      db.sessions = db.sessions.filter((session) => session.token !== token);
      writeDb(db);
      return { success: true };
    }

    if (url.pathname === '/api/me' && method === 'GET') {
      recalculateAchievements(user);
      writeDb(db);
      return { user: publicUser(user) };
    }

    if (url.pathname === '/api/me/profile' && method === 'PUT') {
      const { email, username, password } = body;
      if (!email || !username) throw new Error('Email and username are required.');
      const duplicate = db.users.find((item) => item.id !== user.id
        && (item.email.toLowerCase() === String(email).toLowerCase()
          || item.username.toLowerCase() === String(username).toLowerCase()));
      if (duplicate) throw new Error('A different user already uses that email or username.');
      user.email = email;
      user.username = username;
      user.isGuest = false;
      if (password) user.passwordHash = await hashPassword(password);
      recalculateAchievements(user);
      writeDb(db);
      return { user: publicUser(user) };
    }

    if (url.pathname === '/api/paper/trade' && method === 'POST') {
      const { side, symbol, shares } = body;
      const tradeShares = Number(shares);
      if (!['buy', 'sell'].includes(side)) throw new Error('Trade side must be buy or sell.');
      if (!Number.isInteger(tradeShares) || tradeShares <= 0) throw new Error('Shares must be a whole number greater than zero.');
      const stock = catalog.stocks.find((item) => item.symbol === symbol);
      if (!stock) throw new Error('Unknown stock symbol.');
      const existing = user.paper.positions[symbol] || { shares: 0, averageCost: 0 };
      const total = stock.currentPrice * tradeShares;
      if (side === 'buy') {
        if (total > user.paper.cash) throw new Error('Not enough paper cash available for that trade.');
        const totalShares = existing.shares + tradeShares;
        const totalCost = (existing.averageCost * existing.shares) + total;
        user.paper.positions[symbol] = { shares: totalShares, averageCost: totalCost / totalShares };
        user.paper.cash -= total;
      } else {
        if (existing.shares < tradeShares) throw new Error('You cannot sell more shares than you currently own.');
        existing.shares -= tradeShares;
        user.paper.cash += total;
        if (existing.shares === 0) delete user.paper.positions[symbol];
        else user.paper.positions[symbol] = existing;
      }
      user.paper.history.push({ type: side, symbol, shares: tradeShares, price: stock.currentPrice, timestamp: new Date().toISOString() });
      user.paper.valueHistory.push(calculatePaperValue(user));
      recalculateAchievements(user);
      writeDb(db);
      return { success: true, message: `${side === 'buy' ? 'Bought' : 'Sold'} ${tradeShares} shares of ${stock.name}.`, user: publicUser(user) };
    }

    if (url.pathname === '/api/paper/reset' && method === 'POST') {
      user.paper = createPaperState();
      recalculateAchievements(user);
      writeDb(db);
      return { success: true, user: publicUser(user) };
    }

    if (url.pathname === '/api/lessons/complete' && method === 'POST') {
      const { lessonId } = body;
      if (!lessonId) throw new Error('Lesson id is required.');
      if (!user.completedLessons.includes(lessonId)) user.completedLessons.push(lessonId);
      recalculateAchievements(user);
      writeDb(db);
      return { user: publicUser(user) };
    }

    if (url.pathname === '/api/glossary/reveal' && method === 'POST') {
      const { term } = body;
      if (!term) throw new Error('Term is required.');
      if (!user.glossaryReveals.includes(term)) user.glossaryReveals.push(term);
      recalculateAchievements(user);
      writeDb(db);
      return { user: publicUser(user) };
    }

    if (url.pathname === '/api/quiz/submit' && method === 'POST') {
      const { score, finalExamScore } = body;
      if (typeof score === 'number') user.bestQuizScore = Math.max(user.bestQuizScore || 0, score);
      if (typeof finalExamScore === 'number') user.bestFinalExamScore = Math.max(user.bestFinalExamScore || 0, finalExamScore);
      recalculateAchievements(user);
      writeDb(db);
      return { user: publicUser(user) };
    }

    if (url.pathname === '/api/challenge/complete' && method === 'POST') {
      const challenge = catalog.getDailyChallenge();
      user.lastChallengeKey = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}:${challenge.id}`;
      recalculateAchievements(user);
      writeDb(db);
      return { user: publicUser(user), challenge };
    }

    if (url.pathname === '/api/coach/ask' && method === 'POST') {
      const { question, selectedSymbol } = body;
      const response = catalog.buildCoachResponse(question, selectedSymbol);
      user.coachLog.push({ question: question || '', selectedSymbol: selectedSymbol || '', timestamp: new Date().toISOString() });
      recalculateAchievements(user);
      writeDb(db);
      return { response, user: publicUser(user) };
    }

    throw new Error(`Unknown StockPilot API route: ${method} ${url.pathname}`);
  }

  return { request };
});
