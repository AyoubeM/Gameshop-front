import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = ({ element: Component, ...rest }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !isAdmin) {
    // Redirige vers la page d'accueil si l'utilisateur n'est pas connecté ou n'est pas un administrateur
    return <Navigate to="/" />;
  }

  return <Component {...rest} />;
};

export default PrivateRoute;
