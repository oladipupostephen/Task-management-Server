import express from "express";
const swaggerUi = require('swagger-ui-express');
const openapi = require('../openapi.json');
// Original demo data — POST /reset restores a fresh copy of this list.
const SEED_TASKS = [
  { id: 1, title: 'Buy groceries', done: false },
  { id: 2, title: 'Walk the dog', done: true },
  { id: 3, title: 'Read a book', done: false },
];

// In-memory task store — data is lost when the server restarts.
const tasks = SEED_TASKS.map((task) => ({ ...task }));
const app = express();
const PORT = 3000;
// OpenAPI spec — interactive docs at /docs.
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));


// API metadata — lists available endpoints for clients and docs.
app.get('/', (req, res) => {
  res.json({
    name: 'Task API',
    version: '1.0',
    endpoints: ['/tasks', '/stats', '/reset'],
  });
});

app.get ('/tasks', (req, res) => {
  res.json(tasks);
});

//get single task
// :id is a path parameter — the number in /tasks/2 comes from the URL, not the body.
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  // 404, not an empty 200 — status codes tell machines whether the resource exists.
  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }


  res.json(task);
});

// Update title and/or done on an existing task (partial body is OK).
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  const { title, done } = req.body ?? {};
  const hasTitle = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'title');
  const hasDone = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'done');

  if (!hasTitle && !hasDone) {
    return res.status(400).json({ error: 'request body must include title and/or done' });
  }

  if (hasTitle) {
    if (title === null || String(title).trim() === '') {
      return res.status(400).json({ error: 'title cannot be empty' });
    }
    task.title = String(title).trim();
  }

  if (hasDone) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({ error: 'done must be a boolean' });
    }
    task.done = done;
  }

  res.json(task);
});

// Remove a task. 204 = success with no response body.
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});



// Create a task. Client sends { "title": "..." }; server assigns id and done=false.
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  // Business rule: never trust the client — title must be present and non-empty.
  if (title === undefined || title === null || String(title).trim() === '') {
    return res.status(400).json({ error: 'title is required and cannot be empty' });
  }

  // Next free id is one above the current highest (handles gaps if tasks are removed later).
  const id = tasks.length === 0 ? 1 : Math.max(...tasks.map((t) => t.id)) + 1;
  const task = { id, title: String(title).trim(), done: false };

  tasks.push(task);
  res.status(201).json(task);
});


app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});



// 
app.listen(PORT, () => {
  console.log(`CRUD API listening on port ${PORT}`);
});