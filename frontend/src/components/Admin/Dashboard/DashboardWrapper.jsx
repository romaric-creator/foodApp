import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AppContext";

/**
 * DashboardWrapper protège les pages selon la connexion admin.
 * @param {React.ReactNode} children - Composants enfants
 * @param {boolean} redirectIfLoggedIn - true pour pages login/inscription (redirige si déjà connecté)
 */
export default function DashboardWrapper({ children, redirectIfLoggedIn = false }) {
  const navigate = useNavigate();
  const { loading, isAdmin } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isAdmin && !redirectIfLoggedIn) {
      // Pas d'admin connecté → redirige vers login
      navigate("/login");
    } else if (isAdmin && redirectIfLoggedIn) {
      // Déjà connecté en admin → redirige vers dashboard
      navigate("/admin");
    }
  }, [navigate, redirectIfLoggedIn, isAdmin, loading]);

  if (loading) return null; // Ou un composant de chargement

  return <>{children}</>;
}
