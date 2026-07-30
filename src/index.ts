import express from "express";
const tasks = [{
  id: 1,
  title: 'Task 1',
  done:true
},
{
  id: 2,
  title: 'Task 2',
  done:false  
},{
  id: 3,
  title: 'Task 3',
  done:true
}]
const app = express();
const PORT = 3000;
app.get('/', (req, res) => {
  res.json({
    name: 'Task API',
    version: '1.0',
    endpoints: ['/tasks'],
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