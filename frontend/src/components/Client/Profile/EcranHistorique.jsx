import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ThemeProvider,
  createTheme,
  Container,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  Avatar,
  Fab,
  Zoom,
  Chip,
} from "@mui/material";
import { Delete as DeleteIcon, KeyboardArrowUp } from "@mui/icons-material";
import { fetchOrders, cancelOrder } from "../../../services/orderService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Pour des animations fluides

// Hook pour obtenir l'utilisateur (simplifié pour cet exemple, à remplacer par votre useAuth)
const getAuthUser = () => JSON.parse(localStorage.getItem("user"));

// Thème Material-UI personnalisé
const theme = createTheme({
  palette: {
    primary: { main: "#4CAF50" }, // Vert pour le primaire
    secondary: { main: "#F44336" }, // Rouge pour le secondaire (supprimer)
    background: { default: "#F7F9FC", paper: "#FFFFFF" }, // Couleurs de fond plus douces
    text: { primary: "#333333", secondary: "#666666" },
  },
  typography: {
    fontFamily: ['"Inter"', 'sans-serif'].join(','),
    h5: { fontWeight: 700, fontSize: "1.8rem" }, // Titre plus grand et gras
    h6: { fontWeight: 600, fontSize: "1.2rem" },
    subtitle1: { fontWeight: 600, fontSize: "1.1rem" },
    body1: { fontSize: "1rem" },
    body2: { fontSize: "0.9rem" },
  },
  shape: { borderRadius: 16 }, // Rayon de bordure global plus arrondi
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-6px)", // Déplacement plus prononcé au survol
            boxShadow: "0 12px 30px rgba(0,0,0,0.15)", // Ombre plus forte
          },
          borderRadius: 12, // Bordures arrondies pour les cartes
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#E0E0E0', // Fond pour le groupe de boutons
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none', // Pas de majuscules automatiques
          fontWeight: 500,
          '&.Mui-selected': {
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.05)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s',
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
      },
    },
  },
});

export default function EcranHistorique({ user, toast }) { // Ajout de toast comme prop
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");
  const [showTop, setShowTop] = useState(false);

  const currentUser = useMemo(() => user || getAuthUser(), [user]); // Mémorise l'utilisateur

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const loadHistorique = async () => {
      try {
        setLoading(true);
        const orders = await fetchOrders();
        const userOrders = orders.filter(order => order.idUsers === currentUser.id);
        setHistorique(userOrders);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique :", error);
        if (toast) toast("Erreur de chargement de l'historique.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadHistorique();

    // Connexion Socket.io pour le temps réel
    const socket = connectSocket();
    socket.emit('join-orders');

    // Écouter les nouvelles commandes de l'utilisateur
    socket.on('new-order', (newOrder) => {
      if (newOrder.idUsers === currentUser.id) {
        setHistorique(prev => {
          const exists = prev.find(o => o.id === newOrder.id || o.idOrder === newOrder.idOrder);
          if (exists) return prev;
          return [newOrder, ...prev];
        });
      }
    });

    // Écouter les mises à jour de statut
    socket.on('order-status-updated', (updatedOrder) => {
      if (updatedOrder.idUsers === currentUser.id) {
        setHistorique(prev => prev.map(o => 
          (o.id === updatedOrder.id || o.idOrder === updatedOrder.idOrder) 
            ? updatedOrder 
            : o
        ));
      }
    });

    // Écouter les mises à jour générales
    socket.on('order-updated', (updatedOrder) => {
      if (updatedOrder.idUsers === currentUser.id) {
        setHistorique(prev => {
          const exists = prev.find(o => o.id === updatedOrder.id || o.idOrder === updatedOrder.idOrder);
          if (exists) {
            return prev.map(o => 
              (o.id === updatedOrder.id || o.idOrder === updatedOrder.idOrder) 
                ? updatedOrder 
                : o
            );
          }
          return [updatedOrder, ...prev];
        });
      }
    });

    return () => {
      socket.off('new-order');
      socket.off('order-status-updated');
      socket.off('order-updated');
      socket.emit('leave-orders');
    };
  }, [currentUser, toast]);

  const viderHistorique = useCallback(async () => {
    if (!currentUser?.id) {
      if (toast) toast("Vous devez être connecté pour vider l'historique.", "info");
      return;
    }
    // Demander confirmation à l'utilisateur avant de vider
    if (!window.confirm("Êtes-vous sûr de vouloir vider votre historique de commandes ?")) {
      return;
    }

    try {
      if (historique.length === 0) {
        if (toast) toast("L'historique est déjà vide.", "info");
        return;
      }
      // Annuler toutes les commandes en cours
      const cancelPromises = historique
        .filter(order => order.statut === "en cours")
        .map(order => cancelOrder(order.idOrder || order.id, "annulée"));
      await Promise.all(cancelPromises);
      setHistorique([]);
      if (toast) toast("Historique vidé avec succès !", "success");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'historique :", error);
      if (toast) toast("Échec de la suppression de l'historique.", "error");
    }
  }, [currentUser, historique, toast]);

  const filtered = useMemo(() => {
    return filter === "Tous"
      ? historique
      : historique.filter(o => o.statut === filter);
  }, [historique, filter]);

  // Défilement
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() =>
    window.scrollTo({ top: 0, behavior: "smooth" }), []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "background.default", py: 4, minHeight: "100vh", position: "relative" }}>
        <Container maxWidth="lg">
          <Typography variant="h5" align="center" gutterBottom color="primary.main" sx={{ mb: 4 }}>
            Historique des commandes
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={(_, v) => v && setFilter(v)}
              aria-label="statut"
              sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
              {["Tous", "en cours", "prêt", "annulée"].map(s => (
                <ToggleButton key={s} value={s} aria-label={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {loading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 3 }).map((_, i) => ( // Moins de skeletons pour la rapidité
                <Grid key={i} item xs={12} sm={6} md={4}>
                  <Card sx={{ p: 2 }}>
                    <Skeleton variant="text" height={40} width="60%" />
                    <Skeleton variant="text" height={20} width="80%" sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="text" height={30} width="50%" sx={{ mt: 2, ml: 'auto' }} />
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: "center", mt: 8, p: 4, bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {filter === "Tous" ? "Aucune commande trouvée." : `Aucune commande avec le statut "${filter}".`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Passez votre première commande dès maintenant !
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filtered.map(order => (
                <Grid key={order.id} item xs={12} sm={6} md={4}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * filtered.indexOf(order) }}
                  >
                    <Card sx={{ borderLeft: `5px solid ${order.statut === 'en cours' ? theme.palette.primary.main : order.statut === 'prêt' ? '#4CAF50' : order.statut === 'annulée' ? theme.palette.secondary.main : 'grey.400'}` }}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography variant="h6" color="primary.main">
                            Commande #{order.id.substring(0, 8)} {/* Troncature pour la concision */}
                          </Typography>
                          <Chip label={order.statut.charAt(0).toUpperCase() + order.statut.slice(1)} 
                                color={order.statut === 'en cours' ? 'primary' : order.statut === 'prêt' ? 'success' : 'error'} 
                                size="small" sx={{ fontWeight: 'bold' }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Date: {new Date(order.timestamp).toLocaleDateString("fr-FR")} à {new Date(order.timestamp).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Utilisateur: {order.userName || "Non spécifié"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Table: {order.tableName || order.idTab || "Non spécifiée"}
                        </Typography>

                        {order.items.map((it, idx) => (
                          <Box key={idx} sx={{ display: "flex", alignItems: "center", mb: 1.5, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                            <Avatar src={it.image_url || "https://placehold.co/40x40/E0E0E0/666666?text=🍽️"} sx={{ mr: 2, width: 40, height: 40 }} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{it.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {it.quantite} × {it.price.toLocaleString("fr-FR")} FCFA
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {(it.quantite * it.price).toLocaleString("fr-FR")} FCFA
                            </Typography>
                          </Box>
                        ))}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" align="right" color="text.primary">
                          Total :{" "}
                          {order.items
                            .reduce((sum, x) => sum + x.quantite * x.price, 0)
                            .toLocaleString("fr-FR")} FCFA
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>

        {/* Conteneur pour les boutons flottants */}
        <Box sx={{ position: "fixed", bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Fab color="secondary" onClick={viderHistorique} aria-label="vider" sx={{ transition: 'all 0.3s ease-in-out', '&:hover': { transform: 'scale(1.1)' } }}>
                <DeleteIcon />
            </Fab>
            <Zoom in={showTop}>
                <Fab color="primary" onClick={scrollToTop} aria-label="haut" sx={{ transition: 'all 0.3s ease-in-out', '&:hover': { transform: 'scale(1.1)' } }}>
                    <KeyboardArrowUp />
                </Fab>
            </Zoom>
        </Box>

      </Box>
    </ThemeProvider>
  );
}
