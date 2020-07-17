import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
	apiKey: "AIzaSyBfXtU6tbnMI8LdKN-znmMVfxIRBkV0bc4",
	authDomain: "react-slack-chat-6c32d.firebaseapp.com",
	databaseURL: "https://react-slack-chat-6c32d.firebaseio.com",
	projectId: "react-slack-chat-6c32d",
	storageBucket: "react-slack-chat-6c32d.appspot.com",
	messagingSenderId: "650852800895",
	appId: "1:650852800895:web:3fdc1d3d8519ae85dc624a",
	measurementId: "G-ZRNVSW2X0T",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//firebase.analytics();

export default firebase;
