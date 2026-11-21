const test = require('node:test');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');
const catalog = require('../lib/catalog');
const createStaticApi = require('../static-api');

function createStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    }
  };
}

function jsonRequest(method, body, sessionToken) {
  const headers = {};
  if (sessionToken) headers['x-stockpilot-session'] = sessionToken;
  return { method, headers, body: JSON.stringify(body) };
}

test('static API serves the catalog and backtest data without a server', async () => {
  const api = createStaticApi(catalog, createStorage(), webcrypto);
  const bootstrap = await api.request('/api/bootstrap');
  const backtest = await api.request(`/api/backtest/${catalog.strategies[0].id}?capital=15000`);

  assert.equal(bootstrap.stocks.length, catalog.stocks.length);
  assert.equal(bootstrap.achievementDefinitions.length, catalog.achievementDefinitions.length);
  assert.equal(backtest.strategy.id, catalog.strategies[0].id);
  assert.ok(backtest.breakdown.length > 0);
  assert.ok(backtest.finalStrategyValue > 0);
});

test('static API persists profiles and progress and supports paper trades', async () => {
  const storage = createStorage();
  const api = createStaticApi(catalog, storage, webcrypto);
  const guest = await api.request('/api/auth/guest', { method: 'POST' });
  const session = guest.sessionToken;
  const lessonId = catalog.lessons[0].id;
  const glossaryTerm = catalog.glossaryTerms[0].term;

  await api.request('/api/paper/trade', jsonRequest('POST', { side: 'buy', symbol: 'AAPL', shares: 1 }, session));
  await api.request('/api/lessons/complete', jsonRequest('POST', { lessonId }, session));
  await api.request('/api/glossary/reveal', jsonRequest('POST', { term: glossaryTerm }, session));
  await api.request('/api/quiz/submit', jsonRequest('POST', { score: 3 }, session));
  await api.request('/api/challenge/complete', jsonRequest('POST', {}, session));
  const coach = await api.request('/api/coach/ask', jsonRequest('POST', {
    question: 'Explain diversification.',
    selectedSymbol: 'AAPL'
  }, session));

  const restoredApi = createStaticApi(catalog, storage, webcrypto);
  const { user } = await restoredApi.request('/api/me', { headers: { 'x-stockpilot-session': session } });

  assert.equal(user.paper.positions.AAPL.shares, 1);
  assert.equal(user.paper.history.length, 1);
  assert.deepEqual(user.completedLessons, [lessonId]);
  assert.deepEqual(user.glossaryReveals, [glossaryTerm]);
  assert.equal(user.bestQuizScore, 3);
  assert.ok(user.achievements.includes('first-trade'));
  assert.ok(user.achievements.includes('first-lesson'));
  assert.ok(user.achievements.includes('daily-challenge'));
  assert.equal(user.coachLogCount, 1);
  assert.match(coach.response, /Diversification/);
});

test('static API validates trades and supports local profile sign-in', async () => {
  const storage = createStorage();
  const api = createStaticApi(catalog, storage, webcrypto);

  await assert.rejects(
    api.request('/api/paper/trade', jsonRequest('POST', { side: 'buy', symbol: 'AAPL', shares: 1 }, 'missing-session')),
    /Authentication required/
  );

  const registration = await api.request('/api/auth/register', jsonRequest('POST', {
    email: 'demo@example.com',
    username: 'DemoUser',
    password: 'local-demo-password'
  }));
  const login = await api.request('/api/auth/login', jsonRequest('POST', {
    identifier: 'demouser',
    password: 'local-demo-password'
  }));
  const failedLogin = api.request('/api/auth/login', jsonRequest('POST', {
    identifier: 'demouser',
    password: 'incorrect-password'
  }));

  assert.equal(registration.user.isGuest, false);
  assert.equal(login.user.username, 'DemoUser');
  await assert.rejects(failedLogin, /Invalid login credentials/);
  await api.request('/api/auth/logout', jsonRequest('POST', {}, registration.sessionToken));
  await assert.rejects(
    api.request('/api/me', { headers: { 'x-stockpilot-session': registration.sessionToken } }),
    /Authentication required/
  );
});
