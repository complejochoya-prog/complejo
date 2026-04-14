import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext({});

export function useAuth() {
    return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                
                // Get business & role from Firestore
                // We assume user doc exists in 'users' collection or similar
                const unsubDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        // Fallback if no doc yet (e.g. legacy or just created)
                        setUserData({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            rol: localStorage.getItem('userRole') || 'mozo',
                            negocioId: localStorage.getItem('negocioId') || 'giovanni'
                        });
                    }
                });
                
                return () => unsubDoc();
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        userData,
        loading,
        role: userData?.rol || 'mozo',
        negocioId: userData?.negocioId || 'giovanni'
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
