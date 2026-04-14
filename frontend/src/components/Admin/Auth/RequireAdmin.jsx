import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { verifyToken, isAdmin, logout } from "../../../services/authService";

export default function RequireAdmin({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await verifyToken();
        if (!user || !isAdmin()) {
          logout();
          navigate("/admin/login");
          return;
        }
        setChecking(false);
      } catch (error) {
        console.error("Erreur de vérification:", error);
        logout();
        navigate("/admin/login");
      }
    };

    checkAdmin();
  }, [navigate]);

  if (checking) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return children;
}
