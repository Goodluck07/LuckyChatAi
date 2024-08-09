// pages/index.js
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { auth, db } from '../utils/firebaseConfig';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
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
    const [conversationStarted, setConversationStarted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);

                // Load session messages from localStorage
                const savedMessages = JSON.parse(localStorage.getItem('currentMessages')) || [];
                setMessages(savedMessages);

                // Load full chat history from Firestore
                const conversationsRef = collection(db, 'conversations');
                const q = query(conversationsRef, where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const allMessages = [];
                querySnapshot.forEach((doc) => {
                    allMessages.push(...doc.data().messages || []);
                });
                setHistoryMessages(allMessages);
            } else {
                router.push('/auth');
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleSignOut = () => {
        setIsModalOpen(true);
    };

    const handleConfirmSignOut = async () => {
        localStorage.removeItem('currentMessages');
        setMessages([]);
        setHistoryMessages([]);
        setShowHistory(false);
        await signOut(auth);
        router.push('/auth');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleShowHistory = () => {
        setShowHistory(!showHistory);
    };

    const handleClearHistory = async () => {
        if (!user) return;

        const conversationsRef = collection(db, 'conversations');
        const q = query(conversationsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        // Delete each document
        for (const docSnap of querySnapshot.docs) {
            await deleteDoc(doc(db, 'conversations', docSnap.id));  // Use deleteDoc
        }

        setHistoryMessages([]);
    };

    const handleSend = async () => {
        if (!input) return;

        setLoading(true);
        const userMessage = { sender: 'user', text: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setConversationStarted(true);

        // Save current session messages to localStorage
        localStorage.setItem('currentMessages', JSON.stringify(updatedMessages));

        try {
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

            const conversationsRef = collection(db, 'conversations');
            await addDoc(conversationsRef, {
                userId: user.uid,
                messages: newMessages
            });  // Save the entire message array with userId

            // Update localStorage with the new messages
            localStorage.setItem('currentMessages', JSON.stringify(newMessages));

        } catch (error) {
            console.error('Error getting response:', error);
            const errorMessage = { sender: 'bot', text: `Sorry, there was an error: ${error.message}` };
            setMessages(messages => [...messages, errorMessage]);

            // Update localStorage with the error message
            localStorage.setItem('currentMessages', JSON.stringify([...messages, errorMessage]));
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = async (suggestionText) => {
        setInput(suggestionText);
        await handleSend();
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    const showInitialContent = messages.length === 0;

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
                {showInitialContent && !conversationStarted && (
                    <div className={styles.welcomeMessage}>
                        <div className={styles.logo}>GB Luna</div>
                        <div className={styles.suggestions}>
                            <div 
                                className={styles.suggestionBox}
                                onClick={() => handleSuggestionClick('I Need a creative idea!')}
                            >
                                Need a creative idea?
                            </div>
                            <div 
                                className={styles.suggestionBox}
                                onClick={() => handleSuggestionClick('I am Looking for advice, any help?')}
                            >
                                Looking for advice?
                            </div>
                            <div 
                                className={styles.suggestionBox}
                                onClick={() => handleSuggestionClick('I Want to learn something new and exciting')}
                            >
                                Want to learn something new?
                            </div>
                            <div 
                                className={styles.suggestionBox}
                                onClick={() => handleSuggestionClick('I Need help with a project')}
                            >
                                Need help with a project?
                            </div>
                        </div>
                    </div>
                )}
                {messages.map((message, index) => (
                    <div key={index} className={message.sender === 'user' ? styles.userMessage : styles.botMessage}>
                        <p><strong>{message.sender === 'user' ? 'You' : 'Luna'}:</strong> {message.text}</p>
                    </div>
                ))}
                {loading && <p className={styles.loading}>Luna is typing...</p>}
            </div>
            <div className={styles.inputContainer}>
                <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                    placeholder="Message Luna" 
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
                            <p><strong>{message.sender === 'user' ? 'You' : 'Luna'}:</strong> {message.text}</p>
                        </div>
                    ))}
                    <button onClick={handleClearHistory} className={styles.clearHistoryButton}>
                        Clear History
                    </button>
                </div>
            )}
            <CustomModal 
                isOpen={isModalOpen} 
                onConfirm={handleConfirmSignOut} 
                onRequestClose={handleCloseModal} 
            />
        </div>
        
    );
    
}

