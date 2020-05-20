importScripts('https://www.gstatic.com/firebasejs/7.14.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.2/firebase-messaging.js');

var firebaseConfig = {
    apiKey: "AIzaSyAHCCdakQEZXp2yAu0VzrS98bs3234H0oU",
    authDomain: "new-chat-app-38943.firebaseapp.com",
    databaseURL: "https://new-chat-app-38943.firebaseio.com",
    projectId: "new-chat-app-38943",
    storageBucket: "new-chat-app-38943.appspot.com",
    messagingSenderId: "1004161523676",
    appId: "1:1004161523676:web:99771656d107ef9de37919"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  messaging.setBackgroundMessageHandler(function(payload) {
    //console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'you Got new Message';
    const notificationOptions = {
      body: payload.data.message,
      icon: payload.data.icon
    };
  
    return self.registration.showNotification(notificationTitle,
      notificationOptions);
  });