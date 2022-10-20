import { initializeApp } from 'firebase/app'
import { getStorage } from "firebase/storage";
 
// Initialize Firebase
const app = initializeApp ({
    apiKey: "AIzaSyBaZVxeuMiNaAfbNE2dY5pGazBY9sJaTF4",
    authDomain: "file-upload-97c34.firebaseapp.com",
    projectId: "file-upload-97c34",
    storageBucket: "file-upload-97c34.appspot.com",
    messagingSenderId: "625626084952",
    appId: "1:625626084952:web:ebb4826a63f951a26b3c2d",
});
 
// Firebase storage reference
const storage = getStorage(app);
export default storage;