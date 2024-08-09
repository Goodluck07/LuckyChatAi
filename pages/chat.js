// components/Chat.js
import { useState } from 'react';
import styles from './chat.module.css';
import { getLLMResponse } from '../utils/awsClient';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input) return;

    const userMessage = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Get the bot response
      const botResponse = await getLLMResponse(input);
      const botMessage = { sender: 'bot', text: botResponse };

      // Update messages with bot's response
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage = { sender: 'bot', text: 'Sorry, there was an error.' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1>AI Customer Support Chatbot</h1>
      <div className={styles.chatBox}>
        {messages.map((message, index) => (
          <div key={index} className={message.sender === 'user' ? styles.userMessage : styles.botMessage}>
            <p>
              <strong>{message.sender === 'user' ? 'You' : 'Bot'}:</strong> {message.text}
            </p>
          </div>
        ))}
        {loading && <p>Bot is typing...</p>}
      </div>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className={styles.inputField}
        />
        <button onClick={handleSend} className={styles.sendButton} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
