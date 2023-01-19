import firebase from "firebase/app";
import "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB6b1yuhurfvUlKiIBTWtesYE-PIKdu6r0",
  authDomain: "minecraft-speedrun-tracker.firebaseapp.com",
  databaseURL: "wss://minecraft-speedrun-tracker-default-rtdb.firebaseio.com",
  projectId: "minecraft-speedrun-tracker",
  storageBucket: "minecraft-speedrun-tracker.appspot.com",
  messagingSenderId: "96938980480",
  appId: "1:96938980480:web:fb8de5a65f162c8b002265",
  measurementId: "G-R8M6EC6W3S"
};

firebase.initializeApp(firebaseConfig);

firebase.database.INTERNAL.forceWebSockets()

export default firebase;