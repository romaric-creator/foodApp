import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Container,
  useTheme // Pour accéder au thème global
} from "@mui/material";
import { ShoppingCart, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; // Pour la navigation arrière
import CartItem from "./CartItem"; // Importation du nouveau composant
import CartSummary from "./CartSummary"; // Importation du nouveau composant

export default function EcranPanier({ panier, calculerTotal, modifierQuantite, retirerDuPanier, passerCommande, commandeLoading, setOngletActif }) {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme(); // Accéder au thème global

  // Utilisation de useCallback pour mémoriser la fonction de commande
  const handlePasserCommande = useCallback(async () => {
    setError(""); // Réinitialiser l'erreur avant de tenter la commande
    try {
      await passerCommande();
    } catch (err) {
      console.error("Erreur dans handlePasserCommande:", err);
      setError("Une erreur est survenue lors de l'envoi de la commande. Veuillez réessayer.");
    }
  }, [passerCommande]);

  return (
    <Box sx={{ bgcolor: theme.palette.backgroundPanier.default, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* En-tête de la page */}
      <Box sx={{
        position: 'sticky', // sticky pour suivre le défilement
        top: 0,
        zIndex: 1100,
        bgcolor: theme.palette.backgroundPanier.paper,
        borderBottom: '1px solid',
        borderColor: 'rgba(0,0,0,0.1)',
        py: 2,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, color: 'text.primary' }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, flexGrow: 1 }}>
          Détails de la commande
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ flexGrow: 1, py: 3, pb: 10, bgcolor: 'backgroundPanier.default' }}>
        {error && (
          <Box sx={{ bgcolor: 'red.light', color: 'red.dark', p: 2, borderRadius: 2, mb: 3, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {error}
            </Typography>
          </Box>
        )}

        {panier.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 8, p: 4, bgcolor: 'backgroundPanier.paper', borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <ShoppingCart sx={{ fontSize: 100, color: theme.palette.orange.light, mb: 3 }} />
            <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
              Votre panier est vide !
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ajoutez de délicieux plats pour passer commande.
            </Typography>
            <Button
              variant="outlined" // Style outlined pour le bouton de retour au menu
              color="orange"
              onClick={() => setOngletActif(0)}
              sx={{ px: 5, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
            >
              Parcourir le menu
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: "grid", gap: 2, mb: 3 }}>
              {panier.map(item => (
                <CartItem
                  key={item.idMenu}
                  item={item}
                  modifierQuantite={modifierQuantite}
                />
              ))}
            </Box>
            
            <CartSummary
              calculerTotal={calculerTotal}
              handlePasserCommande={handlePasserCommande}
              commandeLoading={commandeLoading}
            />
          </>
        )}
      </Container>
    </Box>
  );
}
