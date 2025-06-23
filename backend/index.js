import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 POST /api/chat - handle chat requests
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'No valid message provided' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();

    console.log("✅ AI reply:", reply);

    if (!reply) {
      return res.status(500).json({ error: 'AI returned an empty response' });
    }

    res.json({ reply });

  } catch (err) {
    console.error('❌ OpenAI error:', err);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// ✅ GET / - health check
app.get('/', (req, res) => {
  res.send('❄️ Snowball backend is live!');
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
