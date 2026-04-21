import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Container,
  useTheme,
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
  alpha
} from "@mui/material";
import { Delete as DeleteIcon, KeyboardArrowUp, ReceiptLong } from "@mui/icons-material";
import { fetchOrders, cancelOrder } from "../../../services/orderService";
import { connectSocket } from "../../../services/socketService";
import { motion, AnimatePresence } from "framer-motion";

const getAuthUser = () => JSON.parse(localStorage.getItem("user"));

export default function EcranHistorique({ user, toast }) {
  const theme = useTheme();
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");
  const [showTop, setShowTop] = useState(false);

  const primaryColor = theme.palette.primary.main;
  const currentUser = useMemo(() => user || getAuthUser(), [user]);

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
        if (toast) toast("Erreur de chargement de l'historique.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadHistorique();

    const socket = connectSocket();
    socket.emit('join-orders');

    socket.on('new-order', (newOrder) => {
      if (newOrder.idUsers === currentUser.id) {
        setHistorique(prev => {
          const exists = prev.find(o => o.id === newOrder.id || o.idOrder === newOrder.idOrder);
          if (exists) return prev;
          return [newOrder, ...prev];
        });
      }
    });

    socket.on('order-status-updated', (updatedOrder) => {
      if (updatedOrder.idUsers === currentUser.id) {
        setHistorique(prev => prev.map(o => 
          (o.id === updatedOrder.id || o.idOrder === updatedOrder.idOrder) 
            ? updatedOrder 
            : o
        ));
      }
    });

    return () => {
      socket.off('new-order');
      socket.off('order-status-updated');
      socket.emit('leave-orders');
    };
  }, [currentUser, toast]);

  const viderHistorique = useCallback(async () => {
    if (!currentUser?.id) return;
    if (!window.confirm("Voulez-vous vraiment vider votre historique ?")) return;

    try {
      const cancelPromises = historique
        .filter(order => order.statut === "en cours")
        .map(order => cancelOrder(order.idOrder || order.id, "annulée"));
      await Promise.all(cancelPromises);
      setHistorique([]);
      if (toast) toast("Historique vidé !");
    } catch (error) {
      if (toast) toast("Échec de la suppression.", "error");
    }
  }, [currentUser, historique, toast]);

  const filtered = useMemo(() => {
    return filter === "Tous" ? historique : historique.filter(o => o.statut === filter);
  }, [historique, filter]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh', pb: 12 }}>
      {/* Header Premium */}
      <Box sx={{ 
        pt: 6, pb: 4, px: 3, 
        background: `linear-gradient(45deg, ${primaryColor}, ${theme.palette.primary.dark})`,
        borderRadius: '0 0 40px 40px',
        color: 'white',
        mb: 4
      }}>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1, mb: 1 }}>
          Mes Commandes
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
          Suivez l'état de vos préparations en temps réel
        </Typography>
      </Box>

      <Container maxWidth="xs">
        {/* Filtres modernisés */}
        <Box sx={{ mb: 4, overflowX: 'auto', display: 'flex', gap: 1, pb: 1, '::-webkit-scrollbar': { display: 'none' } }}>
          {["Tous", "en cours", "prêt", "annulée"].map(s => (
            <Chip
              key={s}
              label={s === "Tous" ? "Tout" : s.charAt(0).toUpperCase() + s.slice(1)}
              onClick={() => setFilter(s)}
              sx={{
                borderRadius: '12px',
                fontWeight: 800,
                bgcolor: filter === s ? primaryColor : 'white',
                color: filter === s ? 'white' : 'text.primary',
                boxShadow: filter === s ? `0 4px 12px ${alpha(primaryColor, 0.3)}` : 'none',
                border: '1px solid',
                borderColor: filter === s ? primaryColor : 'rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={160} sx={{ borderRadius: '24px' }} />)}
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <ReceiptLong sx={{ fontSize: 80, color: 'text.disabled', opacity: 0.1, mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary' }}>Aucune commande</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.6 }}>Votre historique est vide pour le moment.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <AnimatePresence>
              {filtered.map((order, idx) => (
                <motion.div
                  key={order.id || order.idOrder}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card sx={{ 
                    borderRadius: '24px', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.02)',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.primary', opacity: 0.4, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                            #{String(order.id || order.idOrder || '').substring(0, 8)}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, mt: 0.5 }}>
                            {new Date(order.timestamp).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })} • {new Date(order.timestamp).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                        <Chip 
                          label={order.statut} 
                          size="small"
                          sx={{ 
                            fontWeight: 900, 
                            fontSize: '0.65rem',
                            textTransform: 'uppercase',
                            bgcolor: order.statut === 'en cours' ? alpha(primaryColor, 0.1) : order.statut === 'prêt' ? '#E8F5E9' : '#FFEBEE',
                            color: order.statut === 'en cours' ? primaryColor : order.statut === 'prêt' ? '#2E7D32' : '#C62828'
                          }} 
                        />
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {order.items.map((it, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={it.image_url} variant="rounded" sx={{ width: 40, height: 40, borderRadius: '10px' }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{it.name}</Typography>
                              <Typography variant="caption" color="text.secondary">Qté: {it.quantite}</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                              {(it.quantite * it.price).toLocaleString()} <span style={{ fontSize: '0.6rem' }}>FCFA</span>
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Total</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: primaryColor }}>
                          {order.items.reduce((s, x) => s + x.quantite * x.price, 0).toLocaleString()} <span style={{ fontSize: '0.7rem' }}>FCFA</span>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        )}
      </Container>

      {/* FAB Actions */}
      <Box sx={{ position: "fixed", bottom: 100, right: 20, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Fab 
          size="small" 
          onClick={viderHistorique} 
          sx={{ bgcolor: 'white', color: 'error.main', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          <DeleteIcon />
        </Fab>
        <Zoom in={showTop}>
          <Fab 
            size="medium" 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            sx={{ bgcolor: primaryColor, color: 'white', boxShadow: `0 8px 20px ${alpha(primaryColor, 0.4)}` }}
          >
            <KeyboardArrowUp />
          </Fab>
        </Zoom>
      </Box>
    </Box>
  );
}
