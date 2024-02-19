import { initializeApp } from 'firebase/app';
import {createUserWithEmailAndPassword } from "firebase/auth";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCiQL3r0qy4lcpmRXbHycqoTHEhbb8UZQI",
    authDomain: "opti-gluco-samp.firebaseapp.com",
    projectId: "opti-gluco-samp",
    storageBucket: "opti-gluco-samp.appspot.com",
    messagingSenderId: "408361100399",
    appId: "1:408361100399:web:5f5e6a9c3a84056270d99a",
    measurementId: "G-Z5KR1J2277"
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app)

  export {auth,createUserWithEmailAndPassword};
  