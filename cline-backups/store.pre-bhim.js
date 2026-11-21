const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], sessions: [] }, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function randomId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function createDefaultPaperAccount() {
  return {
    cash: 100000,
    positions: {},
    history: [],
    valueHistory: [100000]
  };
}

function createGuestUser() {
  return {
    id: randomId('user'),
    email: '',
    username: `guest-${crypto.randomBytes(3).toString('hex')}`,
    passwordHash: '',
    isGuest: true,
    createdAt: new Date().toISOString(),
    paper: createDefaultPaperAccount(),
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
    token: randomId('session'),
    userId,
    createdAt: new Date().toISOString()
  };
}

function getUserAndSessionByToken(db, token) {
  if (!token) return { user: null, session: null };
  const session = db.sessions.find((item) => item.token === token);
  if (!session) return { user: null, session: null };
  const user = db.users.find((item) => item.id === session.userId) || null;
  return { user, session };
}

function calculatePaperValue(user, stocks) {
  const holdings = Object.entries(user.paper.positions || {}).reduce((sum, [symbol, position]) => {
    const stock = stocks.find((item) => item.symbol === symbol);
    return sum + ((stock ? stock.currentPrice : 0) * position.shares);
  }, 0);
  return Number((user.paper.cash + holdings).toFixed(2));
}

function recalculateAchievements(user) {
  const achievements = new Set(user.achievements || []);
  if (!user.isGuest) achievements.add('profile-created');
  if ((user.completedLessons || []).length >= 1) achievements.add('first-lesson');
  if ((user.completedLessons || []).length >= 5) achievements.add('five-lessons');
  if ((user.completedLessons || []).length >= 15) achievements.add('fifteen-lessons');
  if ((user.paper.history || []).length >= 1) achievements.add('first-trade');
  if ((user.paper.history || []).length >= 5) achievements.add('five-trades');
  if (user.lastChallengeKey) achievements.add('daily-challenge');
  if ((user.coachLog || []).length >= 1) achievements.add('coach-used');
  if ((user.bestQuizScore || 0) >= 3) achievements.add('quiz-score');
  if ((user.bestFinalExamScore || 0) >= 70) achievements.add('final-exam');
  user.achievements = [...achievements];
  return user;
}

function publicUser(user, stocks) {
  const safe = JSON.parse(JSON.stringify(user));
  delete safe.passwordHash;
  safe.paperAccountValue = calculatePaperValue(safe, stocks);
  return safe;
}

function seedUsers(db) {
  const seedDefinitions = [
    { username: 'LongTermLuna', email: 'luna@example.com', value: 108240, lessons: 18, achievements: ['profile-created', 'first-lesson', 'five-lessons', 'fifteen-lessons', 'first-trade', 'five-trades', 'quiz-score'], bestQuizScore: 5 },
    { username: 'ChartCaptain', email: 'captain@example.com', value: 106910, lessons: 11, achievements: ['profile-created', 'first-lesson', 'five-lessons', 'first-trade', 'five-trades', 'daily-challenge'], bestQuizScore: 4 },
    { username: 'ValueVoyager', email: 'voyager@example.com', value: 103550, lessons: 20, achievements: ['profile-created', 'first-lesson', 'five-lessons', 'fifteen-lessons', 'first-trade', 'five-trades', 'coach-used', 'quiz-score'], bestQuizScore: 5 }
  ];

  seedDefinitions.forEach((seed) => {
    const exists = db.users.find((user) => user.username === seed.username);
    if (!exists) {
      db.users.push({
        id: randomId('user'),
        email: seed.email,
        username: seed.username,
        passwordHash: hashPassword('demo-password'),
        isGuest: false,
        createdAt: new Date().toISOString(),
        paper: { cash: seed.value, positions: {}, history: [], valueHistory: [100000, seed.value] },
        completedLessons: new Array(seed.lessons).fill(0).map((_, index) => `seed-${index + 1}`),
        glossaryReveals: [],
        bestQuizScore: seed.bestQuizScore,
        bestFinalExamScore: 0,
        achievements: seed.achievements,
        lastChallengeKey: null,
        coachLog: []
      });
    }
  });
}

module.exports = {
  readDb,
  writeDb,
  ensureDb,
  hashPassword,
  createGuestUser,
  createSession,
  getUserAndSessionByToken,
  calculatePaperValue,
  recalculateAchievements,
  publicUser,
  createDefaultPaperAccount,
  seedUsers
};