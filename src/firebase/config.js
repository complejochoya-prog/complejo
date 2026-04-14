// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyALR6pBrIU1cSSguL6BZt5dDa4AUTiWNMw",
    authDomain: "complejo-giovanni.firebaseapp.com",
    projectId: "complejo-giovanni",
    storageBucket: "complejo-giovanni.firebasestorage.app",
    messagingSenderId: "274367268670",
    appId: "1:274367268670:web:56a02fc25f02baa51c4e6f",
    measurementId: "G-MY74SBDVKQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export async function getDeviceToken() {
    try {
        if (!messaging) return null;
        // The VAPID key is required to receive push notifications. 
        // Typically this comes from Firebase Console -> Project Settings -> Cloud Messaging -> Web configuration
        // Using a placeholder for now as it wasn't strictly provided, or standard generation
        const token = await getToken(messaging, {
            vapidKey: "BEl6HXk_6E5AOhH0A3wH31s1gT2F1L2Lw_h2t_6E-G_zO0A1..." // Placeholder. User needs to replace this.
        });
        return token;
    } catch (error) {
        console.error("Error getting FCM token:", error);
        return null;
    }
}

export default app;
