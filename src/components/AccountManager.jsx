import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AccountManager = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si l'utilisateur est authentifié et essaie d'accéder à login ou register
    if (
      isAuthenticated &&
      (location.pathname === "/login" || location.pathname === "/register")
    ) {
      // Redirection vers le dashboard ou la page d'accueil
      navigate("/dashboard");
    }
  }, [isAuthenticated, location, navigate]);

  return null; // Ce composant ne rend rien, il gère uniquement la logique de redirection
};

export default AccountManager;
