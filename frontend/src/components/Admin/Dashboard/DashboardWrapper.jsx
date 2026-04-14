import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * DashboardWrapper protège les pages selon la connexion admin.
 * @param {React.ReactNode} children - Composants enfants
 * @param {boolean} redirectIfLoggedIn - true pour pages login/inscription (redirige si déjà connecté)
 */
export default function DashboardWrapper({ children, redirectIfLoggedIn = false }) {
  const navigate = useNavigate();

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));

    if (!admin && !redirectIfLoggedIn) {
      // Pas connecté → redirige vers login
      navigate("/login");
    } else if (admin && redirectIfLoggedIn) {
      // Déjà connecté → redirige vers dashboard
      navigate("/admin");
    }
  }, [navigate, redirectIfLoggedIn]);

  return <>{children}</>;
}
