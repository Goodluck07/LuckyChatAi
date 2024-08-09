// pages/auth.js
import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/router';
import { auth } from '../utils/firebaseConfig';
import styles from './auth.module.css';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const router = useRouter();

    const handleAuth = async () => {
        try {
            if (forgotPassword) {
                await sendPasswordResetEmail(auth, email);
                alert('Password reset email sent!');
                setForgotPassword(false); // Reset the forgot password state
            } else if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            router.push('/'); // Redirect to the chat page after successful sign-in/up
        } catch (error) {
            console.error('Error during authentication:', error);
            alert(error.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>{forgotPassword ? 'Reset Password' : isSignUp ? 'Sign Up' : 'Sign In'}</h1>
                <h2 className={styles.subtitle}>Welcome to LuckyChatAI</h2>
                <p className={styles.description}>
                    Need help with something? Just yelp for LuckyChat! Our chatbot is designed to provide quick and accurate responses to common customer queries, ensuring a seamless experience for your users.
                </p>
                <div className={styles.authContainer}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.inputField}
                    />
                    {!forgotPassword && (
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.inputField}
                        />
                    )}
                    <button onClick={handleAuth} className={styles.button}>
                        {forgotPassword ? 'Send Reset Email' : isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
                {!forgotPassword && (
                    <p className={styles.switchText}>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <a
                            onClick={() => setIsSignUp(!isSignUp)}
                            className={styles.link}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </a>
                    </p>
                )}
                <p className={styles.switchText}>
                    {forgotPassword ? (
                        <a onClick={() => setForgotPassword(false)} className={styles.link}>
                            Back to Sign In
                        </a>
                    ) : (
                        <a onClick={() => setForgotPassword(true)} className={styles.link}>
                            Forgot Password?
                        </a>
                    )}
                </p>
                <div className={styles.features}>
                    <h2 className={styles.featuresTitle}>Key Features</h2>
                    <ul className={styles.featureList}>
                        <li><strong>Real-time Support:</strong> Receive instant responses to customer inquiries, reducing wait times and improving satisfaction.</li>
                        <li><strong>24/7 Availability:</strong> The chatbot is always available, providing support and assistance round the clock.</li>
                        <li><strong>Customizable Responses:</strong> Tailor the chatbot’s responses to match your brand’s voice and style, enhancing the customer experience.</li>
                        <li><strong>Multi-language Support:</strong> Engage with customers in multiple languages, expanding your reach and inclusivity.</li>
                        <li><strong>Easy Integration:</strong> Seamlessly integrate the chatbot with your existing systems and platforms for a smooth deployment.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
