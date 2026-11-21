const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function buildEmptyDb() {
  return {
    users: [],
    sessions: []
  };
}

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, `${JSON.stringify(buildEmptyDb(), null, 2)}\n`, 'utf8');
  }
}

function readDb() {
  ensureDb();
  try {
    const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : []
    };
  } catch {
    return buildEmptyDb();
  }
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function createPaperState() {
  return {
    cash: 100000,
    positions: {},
    history: [],
    valueHistory: [100000]
  };
}

function createGuestUser() {
  const stamp = `${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  return {
    id: `guest_${stamp}`,
    email: `guest-${stamp}@stockpilot.local`,
    username: `Guest-${stamp.slice(-6)}`,
    passwordHash: null,
    isGuest: true,
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

function createSession(userId) {
  return {
    token: crypto.randomBytes(24).toString('hex'),
    userId,
    createdAt: new Date().toISOString()
  };
}

function getUserAndSessionByToken(db, token) {
  if (!token) return { session: null, user: null };
  const session = db.sessions.find((item) => item.token === token) || null;
  if (!session) return { session: null, user: null };
  const user = db.users.find((item) => item.id === session.userId) || null;
  if (!user) return { session: session || null, user: null };
  return { session, user };
}

function calculatePaperValue(user, stocks) {
  const holdingsValue = Object.entries(user.paper?.positions || {}).reduce((sum, [symbol, position]) => {
    const stock = stocks.find((item) => item.symbol === symbol);
    return sum + ((stock?.currentPrice || 0) * (position?.shares || 0));
  }, 0);
  return Number(((user.paper?.cash || 0) + holdingsValue).toFixed(2));
}

function recalculateAchievements(user) {
  const achievements = new Set();
  const completedLessons = user.completedLessons || [];
  const paperHistory = user.paper?.history || [];
  const glossaryReveals = user.glossaryReveals || [];
  const coachLog = user.coachLog || [];
  const openPositions = Object.keys(user.paper?.positions || {}).length;
  const paperValue = Number.isFinite(Number(user.paper?.cash))
    ? Number(user.paper.cash) + Object.values(user.paper?.positions || {}).reduce((sum, position) => sum + ((position?.shares || 0) * (position?.averageCost || 0)), 0)
    : 0;

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

function publicUser(user, stocks) {
  recalculateAchievements(user);
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    isGuest: user.isGuest,
    createdAt: user.createdAt,
    paper: user.paper,
    paperAccountValue: calculatePaperValue(user, stocks),
    completedLessons: user.completedLessons,
    glossaryReveals: user.glossaryReveals,
    bestQuizScore: user.bestQuizScore || 0,
    bestFinalExamScore: user.bestFinalExamScore || 0,
    achievements: user.achievements,
    lastChallengeKey: user.lastChallengeKey,
    coachLogCount: (user.coachLog || []).length
  };
}

function normalizeUser(user) {
  user.paper = user.paper || createPaperState();
  user.paper.cash = Number.isFinite(Number(user.paper.cash)) ? Number(user.paper.cash) : 100000;
  user.paper.positions = user.paper.positions && typeof user.paper.positions === 'object' ? user.paper.positions : {};
  user.paper.history = Array.isArray(user.paper.history) ? user.paper.history : [];
  user.paper.valueHistory = Array.isArray(user.paper.valueHistory) && user.paper.valueHistory.length ? user.paper.valueHistory : [100000];
  user.completedLessons = Array.isArray(user.completedLessons) ? user.completedLessons : [];
  user.glossaryReveals = Array.isArray(user.glossaryReveals) ? user.glossaryReveals : [];
  user.bestQuizScore = Number.isFinite(Number(user.bestQuizScore)) ? Number(user.bestQuizScore) : 0;
  user.bestFinalExamScore = Number.isFinite(Number(user.bestFinalExamScore)) ? Number(user.bestFinalExamScore) : 0;
  user.achievements = Array.isArray(user.achievements) ? user.achievements : [];
  user.coachLog = Array.isArray(user.coachLog) ? user.coachLog : [];
  user.isGuest = Boolean(user.isGuest);
  return recalculateAchievements(user);
}

function seedUsers(db) {
  db.users = Array.isArray(db.users) ? db.users.map(normalizeUser) : [];
  db.sessions = Array.isArray(db.sessions)
    ? db.sessions.filter((session) => session && typeof session.token === 'string' && db.users.some((user) => user.id === session.userId))
    : [];
  return db;
}

module.exports = {
  DB_PATH,
  ensureDb,
  readDb,
  writeDb,
  hashPassword,
  createGuestUser,
  createSession,
  getUserAndSessionByToken,
  calculatePaperValue,
  recalculateAchievements,
  publicUser,
  seedUsers
};