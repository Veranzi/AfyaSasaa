import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0CHLU1m6GGZzhzNaMHjvJiyre_y9Ojpg",
  authDomain: "dataposit-842b1.firebaseapp.com",
  databaseURL: "https://dataposit-842b1-default-rtdb.firebaseio.com",
  projectId: "dataposit-842b1",
  storageBucket: "dataposit-842b1.appspot.com",
  messagingSenderId: "235318339354",
  appId: "1:235318339354:web:957ba93ffa67921485aea3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app; 