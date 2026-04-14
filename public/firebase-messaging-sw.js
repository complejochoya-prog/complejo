importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// This config must match the one in src/firebase/config.js (specifically messagingSenderId)
firebase.initializeApp({
    messagingSenderId: "274367268670"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    const notificationTitle = payload.notification?.title || 'Nueva Notificación';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes un nuevo mensaje.',
        icon: '/icon-192.png' // Using the PWA icon we created earlier
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
