import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Container,
  alpha,
  useTheme,
  Chip
} from "@mui/material";
import { ShoppingCart, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import RecommendationSection from "./RecommendationSection";
import { useApp } from "../../../contexts/AppContext";
import { motion } from "framer-motion";

export default function EcranPanier({ panier, calculerTotal, modifierQuantite, retirerDuPanier, passerCommande, commandeLoading, setOngletActif, ajouterAuPanier }) {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useApp();
  
  const primaryColor = theme.palette.primary.main;

  const handlePasserCommande = useCallback(async () => {
    setError("");
    try {
      await passerCommande();
    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi de la commande.");
    }
  }, [passerCommande]);

  return (
    <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Profilé Mobile */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        bgcolor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        py: 2,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <IconButton onClick={() => setOngletActif(0)} sx={{ mr: 1, color: 'text.primary' }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 900, flexGrow: 1, letterSpacing: -0.5 }}>
          Mon Panier
        </Typography>
        {panier.length > 0 && (
          <Chip 
            label={`${panier.length} items`} 
            size="small" 
            sx={{ bgcolor: alpha(primaryColor, 0.1), color: primaryColor, fontWeight: 800 }} 
          />
        )}
      </Box>

      <Container maxWidth="md" sx={{ flexGrow: 1, py: 3, pb: 20 }}>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', p: 2, borderRadius: 3, mb: 3, textAlign: 'center', border: '1px solid' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{error}</Typography>
            </Box>
          </motion.div>
        )}

        {panier.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 10, p: 4 }}>
            <Box sx={{ 
              width: 120, height: 120, borderRadius: '40px', bgcolor: alpha(primaryColor, 0.1), 
              display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 
            }}>
              <ShoppingCart sx={{ fontSize: 60, color: primaryColor }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Votre panier est vide</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, px: 4 }}>
              Il semble que vous n'ayez pas encore fait votre choix. Nos chefs vous attendent !
            </Typography>
            <Button
              variant="contained"
              onClick={() => setOngletActif(0)}
              sx={{ px: 4, py: 1.8, borderRadius: '16px', fontWeight: 800, bgcolor: primaryColor, boxShadow: `0 8px 20px ${alpha(primaryColor, 0.3)}` }}
            >
              Parcourir le menu
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1, mb: 1 }}>
              Articles Séléctionnés
            </Typography>
            
            <Box sx={{ display: "grid", gap: 2, mb: 2 }}>
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

            <Box sx={{ mt: 4 }}>
               <RecommendationSection 
                userId={user?.id || user?.idUsers} 
                currentPanier={panier} 
                onAdd={ajouterAuPanier} 
              />
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}

