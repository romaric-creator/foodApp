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
import { useKitchen, useOrders } from "../../contexts/AppContext";

const KitchenDashboard = () => {
  const [tab, setTab] = useState(0); // 0: pending, 1: preparing, 2: all
  const { orders, getKitchenOrders, markPreparing, markServed, getKitchenStats, loading } = useKitchen();
  const [stats, setStats] = useState(null);

  const fetchOrders = async () => {
    try {
      await getKitchenOrders();
      const statsData = await getKitchenStats();
      setStats(statsData);
    } catch (error) {
      console.error("Erreur:", error);
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
    if (tab === 0) return order.statut === "pending";
    if (tab === 1) return order.statut === "confirmed";
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "served":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "confirmed":
        return "En préparation";
      case "served":
        return "Servie";
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
    <Box sx={{ p: 3 }}>
      {/* Statistiques */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" color="primary">
                {stats.total_orders}
              </Typography>
              <Typography variant="body2">Commandes aujourd'hui</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" color="warning.main">
                {stats.pending_count}
              </Typography>
              <Typography variant="body2">En attente</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" color="info.main">
                {stats.confirmed_count}
              </Typography>
              <Typography variant="body2">En préparation</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h4" color="success.main">
                {stats.served_count}
              </Typography>
              <Typography variant="body2">Servies</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab
            label={
              <Badge badgeContent={orders.filter((o) => o.statut === "pending").length} color="error">
                En attente
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={orders.filter((o) => o.statut === "confirmed").length} color="info">
                En préparation
              </Badge>
            }
          />
          <Tab label="Toutes" />
        </Tabs>
      </Paper>

      {/* Liste des commandes */}
      <Grid container spacing={2}>
        {filteredOrders.map((order) => (
          <Grid item xs={12} md={6} lg={4} key={order.idOrder}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Table {order.table_name}
                  </Typography>
                  <Chip
                    label={getStatusLabel(order.statut)}
                    color={getStatusColor(order.statut)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Commande #{order.idOrder} • {new Date(order.created_at).toLocaleTimeString()}
                </Typography>

                <Box sx={{ my: 2 }}>
                  {order.items.map((item, idx) => (
                    <Box key={idx} display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">
                        {item.quantity}x {item.menu_name}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Typography variant="h6" color="primary" gutterBottom>
                  Total: {order.total.toFixed(2)} €
                </Typography>

                <Box display="flex" gap={1} mt={2}>
                  {order.statut === "pending" && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AccessTime />}
                      onClick={() => handleMarkAsPreparing(order.idOrder)}
                      fullWidth
                    >
                      En préparation
                    </Button>
                  )}
                  {order.statut === "confirmed" && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleMarkAsServed(order.idOrder)}
                      fullWidth
                    >
                      Servie
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={() => handlePrint(order)}
                  >
                    Imprimer
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredOrders.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Restaurant sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Aucune commande {tab === 0 ? "en attente" : tab === 1 ? "en préparation" : ""}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default KitchenDashboard;

