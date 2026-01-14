'use strict';

const express = require('express');
const cors = require('cors');
const promClient = require('prom-client');
const { calculate } = require('./calc');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

const register = promClient.register;
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Count of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationNs = Number(process.hrtime.bigint() - start);
    const durationSec = durationNs / 1e9;
    const route = req.route && req.route.path ? req.route.path : req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode)
    };
    httpRequestDuration.observe(labels, durationSec);
    httpRequestsTotal.inc(labels);
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

function parseOperation(input) {
  const op = String(input || '').toLowerCase();
  switch (op) {
    case '+':
    case 'add':
      return 'add';
    case '-':
    case 'sub':
      return 'sub';
    case '*':
    case 'x':
    case 'mul':
      return 'mul';
    case '/':
    case 'div':
      return 'div';
    default:
      return op;
  }
}

function mapError(error) {
  if (!error) {
    return { status: 500, code: 'unknown_error' };
  }
  switch (error.message) {
    case 'invalid_number':
      return { status: 400, code: 'invalid_number' };
    case 'invalid_operation':
      return { status: 400, code: 'invalid_operation' };
    case 'division_by_zero':
      return { status: 422, code: 'division_by_zero' };
    default:
      return { status: 500, code: 'internal_error' };
  }
}

app.get('/api/calc', (req, res) => {
  const op = parseOperation(req.query.op);
  try {
    const result = calculate({
      a: req.query.a,
      b: req.query.b,
      op
    });
    res.json({ result });
  } catch (error) {
    const mapped = mapError(error);
    res.status(mapped.status).json({ error: mapped.code });
  }
});

app.post('/api/calc', (req, res) => {
  const op = parseOperation(req.body.op);
  try {
    const result = calculate({
      a: req.body.a,
      b: req.body.b,
      op
    });
    res.json({ result });
  } catch (error) {
    const mapped = mapError(error);
    res.status(mapped.status).json({ error: mapped.code });
  }
});

app.listen(port, () => {
  console.log(`calc-backend listening on port ${port}`);
});
