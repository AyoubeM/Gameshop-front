import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { FaGoogle, FaLock, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { auth, db } from "../firebase";
import NavBar from "../NavBar/NavBar";
import "./SignUpPage.css";

const SignUpPage = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        role: "user",
        createdAt: new Date().toISOString(),
      });

      alert("Account created successfully!");
      navigate("/login");
    } catch (error) {
      setError(
        error.code === "auth/email-already-in-use"
          ? "Email already in use"
          : error.code === "auth/weak-password"
          ? "Password should be at least 6 characters"
          : "An error occurred during registration"
      );
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Créer le document utilisateur pour Google Sign Up
      await setDoc(
        doc(db, "users", userCredential.user.uid),
        {
          email: userCredential.user.email,
          role: "user",
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      navigate("/");
    } catch (error) {
      setError("Error with Google sign up");
    }
  };

  return (
    <>
      <NavBar />
      <div className="wrapper">
        <h1>Register</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FaUser className="icon" />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FaLock className="icon" />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <FaLock className="icon" />
          </div>

          <button type="submit">Register</button>

          <button
            type="button"
            className="google-signin"
            onClick={handleGoogleSignUp}
          >
            <FaGoogle className="icon" />
            Sign up with Google
          </button>

          <div className="register-link">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignUpPage;
