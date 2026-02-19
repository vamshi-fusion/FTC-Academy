import { createServer } from 'node:http';
import { runLessonChecks } from '../shared/lessonExercises.js';

const PORT = Number(process.env.CHECKS_PORT || 3001);

const json = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
};

const readBody = async (req) => {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
  }
  return data;
};

const server = createServer(async (req, res) => {
  if (!req.url) return json(res, 400, { error: 'Missing URL' });

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  const match = req.url.match(/^\/api\/lessons\/([^/]+)\/check$/);
  if (!match || req.method !== 'POST') {
    return json(res, 404, { error: 'Not found' });
  }

  try {
    const lessonId = decodeURIComponent(match[1]);
    const rawBody = await readBody(req);
    const parsed = rawBody ? JSON.parse(rawBody) : {};
    const code = typeof parsed.code === 'string' ? parsed.code : '';

    const { exercise, results, allPassed } = runLessonChecks(lessonId, code);

    return json(res, 200, {
      lessonId,
      exercise: {
        title: exercise.title,
        prompt: exercise.prompt,
        successMessage: exercise.successMessage,
      },
      results,
      allPassed,
    });
  } catch (error) {
    return json(res, 500, { error: 'Failed to run checks.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Lesson checks server running on http://0.0.0.0:${PORT}`);
});
