import React, { useEffect, useRef, useState } from 'react';

const backendBaseUrl = 'https://snowball-backend-d7sv.onrender.com';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {};
  }, []);

  const getTammyVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(v => v.name.toLowerCase().includes('tammy')) ||
      voices.find(v => v.name.toLowerCase().includes('female')) ||
      voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('woman'))
    );
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getTammyVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'You', text: input };
    setMessages(prev => [userMessage, ...prev]);
    setInput('');

    try {
      const res = await fetch(`${backendBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      const botMessage = { sender: 'Snowball', text: data.reply };
      setMessages(prev => [botMessage, ...prev]);
      speak(data.reply);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>❄️ Snowball</div>
      <div style={styles.chatBox}>
        {messages.map((msg, idx) => (
          <div key={idx} style={msg.sender === 'You' ? styles.userMsg : styles.botMsg}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        style={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message and press Enter..."
      />
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Segoe UI, sans-serif',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#101820',
    color: 'white',
    padding: '10px',
    paddingBottom: '80px',
    boxSizing: 'border-box',
  },
  header: {
    fontSize: '1.8rem',
    textAlign: 'center',
    marginBottom: '10px',
  },
  chatBox: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column-reverse',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '10px',
    paddingBottom: '90px',
  },
  userMsg: {
    alignSelf: 'flex-end',
    background: '#007BFF',
    padding: '12px 16px',
    borderRadius: '18px',
    margin: '6px 0',
    fontSize: '1rem',
    maxWidth: '80%',
    wordBreak: 'break-word',
  },
  botMsg: {
    alignSelf: 'flex-start',
    background: '#444',
    padding: '12px 16px',
    borderRadius: '18px',
    margin: '6px 0',
    fontSize: '1rem',
    maxWidth: '80%',
    wordBreak: 'break-word',
  },
  input: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    padding: '18px',
    fontSize: '1.1rem',
    borderRadius: 0,
    border: 'none',
    outline: 'none',
    backgroundColor: '#101820',
    color: 'white',
    zIndex: 1000,
  },
};
