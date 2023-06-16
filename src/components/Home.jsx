import Todo from "./Todo";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, provider } from "../config";
import { React, useState, useEffect } from "react";
import "./stylesheets/todoStyles.css";
import "./stylesheets/homeStyles.css";

function Home() {
  const [user, setUser] = useState(null);

  // attaching an event handler to observe the state change of auth when looged in lor logged out
  useEffect(() => {
    onAuthStateChanged(auth, setUser);
  }, []);

  const loginUser = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(auth);
        // The signed-in user info.
        const user = result.user;
        console.log({ user });
        // setUser(user);
      })
      .catch((error) => {
        setUser(null);
        const errorDetails = {
          errorCode: error.code,
          errorMessage: error.message,
          // The AuthCredential type that was used.
          credential: GoogleAuthProvider.credentialFromError(error),
        };
        console.log(errorDetails);
      });
  };
  const signout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log(auth);
        // setUser(null);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div className="outer-container">
      {!user ? (
        <div className="homePage">
          <div className="homeheader">
            <div className="title">Reminders</div>
            <div className="subtitle">
              Helps you to plan and schedule your daily life!
            </div>
          </div>

          <button className="signInButton" onClick={loginUser}>
            Sign In to continue
          </button>
        </div>
      ) : (
        <Todo signout={signout} user={user} />
      )}
    </div>
  );
}

export default Home;
