import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import {
  Restaurant,
  AccessTime,
  CheckCircle,
  Print as PrintIcon,
} from "@mui/icons-material";
import { useKitchen } from "../../contexts/AppContext";
import { getKitchenStats } from "../../api/orders";

const KitchenDashboard = () => {
  const [tab, setTab] = useState(0); // 0: pending, 1: preparing, 2: all
  const { markPreparing, markServed, getKitchenOrders } = useKitchen();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await getKitchenOrders();
      setOrders(Array.isArray(data) ? data : []);
      
      const statsData = await getKitchenStats();
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error("Erreur:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsPreparing = async (orderId) => {
    try {
      await markPreparing(orderId);
      await fetchOrders();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleMarkAsServed = async (orderId) => {
    try {
      await markServed(orderId);
      await fetchOrders();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handlePrint = (order) => {
    // TODO: Implémenter l'impression
    window.print();
  };

  const filteredOrders = orders.filter((order) => {
    if (tab === 0) return order.statut === "en cours";
    if (tab === 1) return order.statut === "prêt";
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "en cours":
        return "warning";
      case "prêt":
        return "info";
      case "annulée":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "en cours":
        return "En préparation";
      case "prêt":
        return "Prêt à servir";
      case "annulée":
        return "Annulée";
      default:
        return status;
    }
  };

  if (loading && !orders.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100%', color: 'text.primary' }}>
      {/* Statistiques Dynamiques */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: "Total Jour", value: stats.total_orders, color: 'primary.main' },
            { label: "En attente", value: stats.pending_count, color: '#FB923C' },
            { label: "En cours", value: stats.confirmed_count, color: '#94A3B8' },
            { label: "Servies", value: stats.served_count, color: '#10B981' }
          ].map((s, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper sx={{ 
                p: 3, textAlign: "center", borderRadius: 4, 
                bgcolor: 'background.paper', 
                border: '1px solid rgba(248,250,252,0.05)',
                transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <Typography variant="h3" sx={{ fontWeight: 1000, color: s.color, mb: 1 }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>{s.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Barre de Filtres (Onglets) */}
      <Paper sx={{ mb: 4, borderRadius: 4, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)}
          sx={{
            '& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3 },
            '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', py: 2 }
          }}
        >
          <Tab
            label={
              <Badge badgeContent={orders.filter((o) => o.statut === "en cours").length} color="error">
                En préparation
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={orders.filter((o) => o.statut === "prêt").length} color="info">
                Prêts
              </Badge>
            }
          />
          <Tab label="Toutes" />
        </Tabs>
      </Paper>

      {/* Grille des Bons de Commande */}
      <Grid container spacing={3}>
        {filteredOrders.map((order) => (
          <Grid item xs={12} md={6} lg={4} key={order.idOrder}>
            <Card sx={{ 
              borderRadius: 4, bgcolor: 'background.paper', 
              border: '1px solid rgba(248,250,252,0.05)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    TABLE {order.table_name}
                  </Typography>
                  <Chip
                    label={getStatusLabel(order.statut).toUpperCase()}
                    sx={{ 
                      bgcolor: order.statut === 'en cours' ? 'rgba(251,146,60,0.1)' : 'rgba(16,185,129,0.1)',
                      color: order.statut === 'en cours' ? 'primary.main' : '#10B981',
                      fontWeight: 900, fontSize: '0.7rem', borderRadius: 2
                    }}
                  />
                </Box>

                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                  BON #{order.idOrder} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>

                <Box sx={{ my: 3, p: 2, bgcolor: 'rgba(248,250,252,0.02)', borderRadius: 2 }}>
                  {order.items.map((item, idx) => (
                    <Box key={idx} display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {item.quantity}x {item.menu_name}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 1000, mb: 3 }}>
                  {order.total.toLocaleString()} FCFA
                </Typography>

                <Stack direction="row" spacing={1.5}>
                  {order.statut === "en cours" && (
                    <Button
                      variant="contained"
                      onClick={() => handleMarkAsServed(order.idOrder)}
                      fullWidth
                      sx={{ 
                        bgcolor: 'primary.main', fontWeight: 900, borderRadius: 2,
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      PRÊT !
                    </Button>
                  )}
                  {order.statut === "prêt" && (
                    <Button
                      variant="outlined"
                      startIcon={<AccessTime />}
                      onClick={() => handleMarkAsPreparing(order.idOrder)}
                      sx={{ borderRadius: 2, fontWeight: 800, borderColor: 'rgba(248,250,252,0.2)', color: 'text.secondary' }}
                    >
                      REFAIRE
                    </Button>
                  )}
                  <IconButton 
                    onClick={() => handlePrint(order)}
                    sx={{ bgcolor: 'rgba(248,250,252,0.05)', borderRadius: 2, '&:hover': { bgcolor: 'rgba(248,250,252,0.1)' } }}
                  >
                    <PrintIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default KitchenDashboard;

