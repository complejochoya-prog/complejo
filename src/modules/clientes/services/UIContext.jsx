import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../../../firebase/config';
import { collection, onSnapshot, query, orderBy, doc, setDoc, updateDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';
import { useConfig } from '../../core/services/ConfigContext';

const UIContext = createContext({});

export function useUI() {
    return useContext(UIContext);
}

export default function UIProvider({ children }) {
    const { negocioId } = useConfig();
    const [homeContent, setHomeContent] = useState({});
    const [modulesConfig, setModulesConfig] = useState({});
    const [playerPosts, setPlayerPosts] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [schoolClasses, setSchoolClasses] = useState([]);
    const [liveUsage, setLiveUsage] = useState([]);
    const [usageHistory, setUsageHistory] = useState([]);

    useEffect(() => {
        if (!negocioId) return;

        // Home Content
        getDoc(doc(db, 'negocios', negocioId, 'configuracion', 'home')).then((docSnap) => {
            if (docSnap.exists()) setHomeContent(docSnap.data());
        });

        // Modules Config
        getDoc(doc(db, 'negocios', negocioId, 'configuracion', 'modules')).then((docSnap) => {
            if (docSnap.exists()) setModulesConfig(docSnap.data());
        });

        // Player Posts
        getDocs(query(collection(db, 'negocios', negocioId, 'player_posts'), orderBy('timestamp', 'desc'))).then((snapshot) => {
            setPlayerPosts(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
        });

        // Tournaments
        getDocs(query(collection(db, 'negocios', negocioId, 'tournaments'), orderBy('timestamp', 'desc'))).then((snapshot) => {
            setTournaments(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
        });

        // School Classes
        getDocs(query(collection(db, 'negocios', negocioId, 'school_classes'), orderBy('timestamp', 'desc'))).then((snapshot) => {
            setSchoolClasses(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
        });

        // Live Presence (keep real-time as it's active usage)
        const unsubscribeUsage = onSnapshot(query(collection(db, 'negocios', negocioId, 'live_usage'), orderBy('timestamp', 'desc')), (snapshot) => {
            setLiveUsage(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
        });

        // Usage History
        getDocs(query(collection(db, 'negocios', negocioId, 'usage_history'), orderBy('timestamp', 'desc'))).then((snapshot) => {
            setUsageHistory(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
        });

        return () => {
            unsubscribeUsage();
        };
    }, [negocioId]);

    const updateHomeContent = async (newContent) => {
        setHomeContent(newContent);
        await setDoc(doc(db, 'negocios', negocioId, 'configuracion', 'home'), newContent);
    };

    const updateModulesConfig = async (newConfig) => {
        setModulesConfig(newConfig);
        await setDoc(doc(db, 'negocios', negocioId, 'configuracion', 'modules'), newConfig);
    };

    const addPlayerPost = async (postData) => {
        const docRef = doc(collection(db, 'negocios', negocioId, 'player_posts'));
        await setDoc(docRef, { ...postData, timestamp: new Date().toISOString() });
    };

    const updatePlayerPost = async (id, postData) => {
        const docRef = doc(db, 'negocios', negocioId, 'player_posts', id);
        await updateDoc(docRef, postData);
    };

    const removePlayerPost = async (id) => {
        const docRef = doc(db, 'negocios', negocioId, 'player_posts', id);
        await deleteDoc(docRef);
    };

    const value = {
        homeContent,
        modulesConfig,
        playerPosts,
        tournaments,
        usageHistory,
        updateHomeContent,
        updateModulesConfig,
        addPlayerPost,
        updatePlayerPost,
        removePlayerPost
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
}
