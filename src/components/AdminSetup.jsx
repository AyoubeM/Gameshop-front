import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";

const AdminSetup = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const setupAdmin = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage("Vous devez être connecté");
        navigate("/login");
        return;
      }

      console.log("Current user:", user); // Pour le debug

      // Créer ou mettre à jour le document utilisateur
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          role: "admin",
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setMessage("Compte admin créé avec succès!");
    } catch (error) {
      console.error("Error details:", error); // Pour voir les détails de l'erreur
      setMessage(`Erreur: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Configuration Admin</h2>
      <p>Utilisateur connecté: {auth.currentUser?.email}</p>
      <button onClick={setupAdmin}>Devenir Admin</button>
      {message && (
        <p style={{ color: message.includes("Erreur") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AdminSetup;
