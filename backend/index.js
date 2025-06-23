import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST endpoint for chat
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // or 'gpt-3.5-turbo' if you prefer
      messages: [{ role: 'user', content: message }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('❌ OpenAI API error:', err);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

// ✅ Basic health check
app.get('/', (req, res) => {
  res.send('❄️ Snowball backend is live!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
