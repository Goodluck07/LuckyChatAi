// pages/index.js
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { auth, db } from '../utils/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import styles from './chat.module.css';
import CustomModal from '../components/CustomModal';

export default function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [historyMessages, setHistoryMessages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);

                // Load full chat history from Firestore
                const chatRef = doc(db, 'chats', user.uid);
                const chatDoc = await getDoc(chatRef);
                if (chatDoc.exists()) {
                    const allMessages = chatDoc.data().messages || [];
                    setHistoryMessages(allMessages); // Load history messages
                    setMessages([]); // Clear messages when signing in
                } else {
                    setMessages([]); // Initialize messages if no history exists
                    setHistoryMessages([]); // Initialize history messages
                }
            } else {
                router.push('/auth'); // Redirect to auth page if not signed in
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleSignOut = () => {
        setIsModalOpen(true);
    };

    const handleConfirmSignOut = async () => {
        // Clear localStorage and reset states on sign out
        localStorage.removeItem('chatMessages');
        setMessages([]); // Clear messages on sign out
        setHistoryMessages([]);
        setShowHistory(false);
        await signOut(auth);
        router.push('/auth');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleShowHistory = () => {
        setShowHistory(!showHistory); // Toggle history display
    };

    async function handleSend() {
        if (!input) return;

        setLoading(true);
        const userMessage = { sender: 'user', text: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');

        try {
            // Translate the user's input to English for processing
            const resTranslate = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: input, targetLang: 'en' })
            });

            if (!resTranslate.ok) {
                const errorData = await resTranslate.json();
                console.error('Translation API error:', errorData);
                throw new Error(errorData.error || 'Translation error');
            }

            const translateData = await resTranslate.json();
            const translatedInput = translateData.translatedText;
            const detectedUserLanguage = translateData.detectedSourceLanguage;

            // Send the translated input to the model for processing
            const res = await fetch('/api/invoke-model', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputText: translatedInput }),
            });

            if (!res.ok) {
                const result = await res.json();
                console.error('Model invocation API error:', result);
                throw new Error(result.error || 'Model invocation error');
            }

            const result = await res.json();

            // Translate the bot's response back to the user's detected language
            const resBackTranslate = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: result.text, targetLang: detectedUserLanguage }),
            });

            if (!resBackTranslate.ok) {
                const backTranslateData = await resBackTranslate.json();
                console.error('Back-translation API error:', backTranslateData);
                throw new Error(backTranslateData.error || 'Back-translation error');
            }

            const backTranslateData = await resBackTranslate.json();
            const botMessage = { sender: 'bot', text: backTranslateData.translatedText };
            const newMessages = [...updatedMessages, botMessage];
            setMessages(newMessages);

            // Save the new session messages to Firestore
            const chatRef = doc(db, 'chats', user.uid);
            
            // Check if the document exists before updating
            const chatDoc = await getDoc(chatRef);
            if (!chatDoc.exists()) {
                // Create the document if it doesn't exist
                await setDoc(chatRef, { messages: newMessages });
            } else {
                // Update the existing document
                await updateDoc(chatRef, {
                    messages: arrayUnion(...newMessages)
                });
            }
        } catch (error) {
            console.error('Error getting response:', error);
            const errorMessage = { sender: 'bot', text: `Sorry, there was an error: ${error.message}` };
            setMessages(messages => [...messages, errorMessage]);
        } finally {
            setLoading(false);
        }
    }

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Welcome to LuckyChatAI Assistant</h1>
                <div className={styles.userInfo}>
                    <p>Logged in as: <strong>{user.email}</strong></p>
                    <button onClick={handleSignOut} className={styles.button}>
                        Sign Out
                    </button>
                    <button onClick={handleShowHistory} className={styles.button}>
                        {showHistory ? 'Hide History' : 'Show History'}
                    </button>
                </div>
            </header>
            <div className={styles.chatBox}>
                {messages.map((message, index) => (
                    <div key={index} className={message.sender === 'user' ? styles.userMessage : styles.botMessage}>
                        <p><strong>{message.sender === 'user' ? 'You' : 'Bot'}:</strong> {message.text}</p>
                    </div>
                ))}
                {loading && <p className={styles.loading}>Bot is typing...</p>}
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
            {showHistory && (
                <div className={styles.historyContainer}>
                    <h2>Chat History</h2>
                    {historyMessages.map((message, index) => (
                        <div key={index} className={message.sender === 'user' ? styles.userMessage : styles.botMessage}>
                            <p><strong>{message.sender === 'user' ? 'You' : 'Bot'}:</strong> {message.text}</p>
                        </div>
                    ))}
                </div>
            )}
            <CustomModal 
                isOpen={isModalOpen} 
                onRequestClose={handleCloseModal} 
                onConfirm={handleConfirmSignOut} 
            />
        </div>
    );
}
