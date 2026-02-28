// api/assistant.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const projectId = process.env.VERTEX_PROJECT_ID;
  const location = process.env.VERTEX_LOCATION || 'us-central1';
  const model = process.env.VERTEX_MODEL || 'gemini-1.5-flash';
  const accessToken = process.env.VERTEX_ACCESS_TOKEN;

  if (!projectId || !accessToken) {
    return res.status(500).json({ error: 'Vertex env vars not configured' });
  }

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

  try {
    const vertexRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-goog-user-project': projectId,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Ты персональный лайф‑планнер. Помоги разложить запрос на конкретные шаги, задачи и блоки по времени.\n\nСообщение:\n${message}`,
              },
            ],
          },
        ],
      }),
    });

    if (!vertexRes.ok) {
      const text = await vertexRes.text();
      console.error(text);
      return res.status(500).json({ error: 'Vertex AI request failed' });
    }

    const data = await vertexRes.json();
    const candidate = data.candidates?.[0];
    const answer =
      candidate?.content?.parts?.map((p) => p.text).join('\n') ||
      'Не удалось разобрать ответ от Vertex AI.';

    return res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Proxy error' });
  }
}