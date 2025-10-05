// Firebase Configuration - تم التحديث بالإعدادات الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyDlix7qhcXumRLOd9Z0-hoKQCzX90RCFiQ",
    authDomain: "store-gh0st.firebaseapp.com",
    projectId: "store-gh0st",
    storageBucket: "store-gh0st.firebasestorage.app",
    messagingSenderId: "617542014023",
    appId: "1:617542014023:web:fadb67939faa10362f8d62",
    measurementId: "G-BGNGCF2FV1"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

console.log('✅ Firebase connected successfully!');
console.log('🔗 Project: store-gh0st');
console.log('👤 Auth Domain: store-gh0st.firebaseapp.com');

// Export for use in other files
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;