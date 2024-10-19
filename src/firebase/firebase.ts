import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKHjsnQSQ8ZWOeH7qeAhLMwcLhSH2N3Hg",
  authDomain: "adminfirebase-f4.firebaseapp.com",
  databaseURL:
    "https://adminfirebase-f4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "adminfirebase-f4",
  storageBucket: "adminfirebase-f4.appspot.com",
  messagingSenderId: "520235611565",
  appId: "1:520235611565:web:e0918d74adf39569f69d24",
};

// // Initialize Firebase
// let app: FirebaseApp;

// if (!getApps().length) {
//   app = initializeApp(firebaseConfig);
// } else {
//   app = getApps()[0];
// }
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { auth, database, storage };
