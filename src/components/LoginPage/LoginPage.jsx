import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { FaGoogle, FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import NavBar from "../NavBar/NavBar";
import "./LoginPage.css";

const LoginPage = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
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

    try {
      if (isRegistering) {
        // Création de compte
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created successfully!");
      } else {
        // Connexion
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/"); // Redirection vers la page d'accueil
    } catch (error) {
      setError(
        error.code === "auth/wrong-password"
          ? "Invalid password"
          : error.code === "auth/user-not-found"
          ? "User not found"
          : "An error occurred"
      );
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      setError("Error with Google sign in");
    }
  };

  return (
    <>
      <NavBar />
      <div className="wrapper">
        <h1>{isRegistering ? "Register" : "Login"}</h1>

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

          {!isRegistering && (
            <div className="remember-forgot">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#">Forgot password?</a>
            </div>
          )}

          <button type="submit">{isRegistering ? "Register" : "Login"}</button>

          <button
            type="button"
            className="google-signin"
            onClick={handleGoogleSignIn}
          >
            <FaGoogle className="icon" />
            Sign in with Google
          </button>

          <div className="register-link">
            <p>
              {isRegistering ? (
                <>
                  Already have an account?{" "}
                  <a href="#" onClick={() => setIsRegistering(false)}>
                    Login
                  </a>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <a href="#" onClick={() => setIsRegistering(true)}>
                    Register
                  </a>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </>
  );
};

export default LoginPage;
