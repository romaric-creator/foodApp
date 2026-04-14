import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Chip, Tabs, Tab, TextField, Button, CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Receipt as ReceiptIcon, Download as DownloadIcon, Print as PrintIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import { fetchOrders, updateOrderStatus } from '../../../services/orderService';
import { fetchUserById } from '../../../services/userService';
import { fetchTableById } from '../../../services/tableService';
import { connectSocket, disconnectSocket, getSocket } from '../../../services/socketService';

const OrderManager = ({ setCommandeSuccess, setCommandeError, menuMap, audioAllowed }) => {
  const [commandes, setCommandes] = useState([]);
  const [activeTab, setActiveTab] = useState("en cours");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadCommandes = useCallback(async () => {
    setIsLoading(true);
    try {
      const commandesData = await fetchOrders();
      const commandesWithDetails = await Promise.all(
        commandesData.map(async (commande) => {
          const userDoc = await fetchUserById(commande.idUsers);
          const tableDoc = await fetchTableById(commande.idTab);
          return {
            ...commande,
            userName: userDoc?.name || `Utilisateur inconnu (${commande.idUsers})`,
            tableName: tableDoc?.nom || "Table inconnue",
          };
        })
      );
      setCommandes(commandesWithDetails);
    } catch (err) {
      console.error(
        "Erreur lors du chargement des commandes ou des menus :",
        err
      );
      setCommandeError("Erreur lors du chargement des commandes.");
    } finally {
      setIsLoading(false);
    }
  }, [setCommandeError]);

  useEffect(() => {
    loadCommandes();
    
    // Connexion Socket.io pour le temps réel
    const socket = connectSocket();
    socket.emit('join-orders');

    // Écouter les nouvelles commandes
    socket.on('new-order', async (newOrder) => {
      try {
        const userDoc = await fetchUserById(newOrder.idUsers);
        const tableDoc = await fetchTableById(newOrder.idTab);
        const orderWithDetails = {
          ...newOrder,
          userName: userDoc?.name || `Utilisateur inconnu (${newOrder.idUsers})`,
          tableName: tableDoc?.nom || "Table inconnue",
        };
        setCommandes(prev => {
          const exists = prev.find(c => c.id === newOrder.id || c.idOrder === newOrder.idOrder);
          if (exists) return prev;
          return [orderWithDetails, ...prev];
        });
      } catch (err) {
        console.error("Erreur lors de l'ajout de la nouvelle commande:", err);
      }
    });

    // Écouter les mises à jour de statut
    socket.on('order-status-updated', async (updatedOrder) => {
      try {
        const userDoc = await fetchUserById(updatedOrder.idUsers);
        const tableDoc = await fetchTableById(updatedOrder.idTab);
        const orderWithDetails = {
          ...updatedOrder,
          userName: userDoc?.name || `Utilisateur inconnu (${updatedOrder.idUsers})`,
          tableName: tableDoc?.nom || "Table inconnue",
        };
        setCommandes(prev => prev.map(c => 
          (c.id === updatedOrder.id || c.idOrder === updatedOrder.idOrder) 
            ? orderWithDetails 
            : c
        ));
      } catch (err) {
        console.error("Erreur lors de la mise à jour de la commande:", err);
      }
    });

    // Écouter les mises à jour générales
    socket.on('order-updated', async (updatedOrder) => {
      try {
        const userDoc = await fetchUserById(updatedOrder.idUsers);
        const tableDoc = await fetchTableById(updatedOrder.idTab);
        const orderWithDetails = {
          ...updatedOrder,
          userName: userDoc?.name || `Utilisateur inconnu (${updatedOrder.idUsers})`,
          tableName: tableDoc?.nom || "Table inconnue",
        };
        setCommandes(prev => {
          const exists = prev.find(c => c.id === updatedOrder.id || c.idOrder === updatedOrder.idOrder);
          if (exists) {
            return prev.map(c => 
              (c.id === updatedOrder.id || c.idOrder === updatedOrder.idOrder) 
                ? orderWithDetails 
                : c
            );
          }
          return [orderWithDetails, ...prev];
        });
      } catch (err) {
        console.error("Erreur lors de la mise à jour de la commande:", err);
      }
    });

    return () => {
      socket.off('new-order');
      socket.off('order-status-updated');
      socket.off('order-updated');
      socket.emit('leave-orders');
    };
  }, [loadCommandes]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      const updatedCommandes = commandes.map((commande) =>
        commande.id === orderId || commande.idOrder === orderId ? { ...commande, statut: newStatus } : commande
      );
      setCommandes(updatedCommandes);
      setCommandeSuccess(`Statut de la commande ${orderId} mis à jour avec succès.`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
      setCommandeError(`Erreur lors de la mise à jour de la commande ${orderId}.`);
    }
  };

  const generateOrderHtml = (commande) => {
    const items = Array.isArray(commande.items) ? commande.items : [];
    const total = items.reduce((sum, item) => sum + (item.quantite || 1) * item.price, 0).toFixed(2);
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding:5px; border:1px solid #ddd;">${menuMap[item.idMenu] || "Menu Non Trouvé"}</td>
        <td style="padding:5px; border:1px solid #ddd; text-align:center;">${item.quantite || 1}</td>
        <td style="padding:5px; border:1px solid #ddd; text-align:right;">${item.price} FCFA</td>
      </tr>
    `).join("");
    return `
      <div style="font-family: Arial, sans-serif; padding:20px;">
        <h1 style="text-align:center; color:#4CAF50;">Commande</h1>
        <p><strong>Utilisateur :</strong> ${commande.userName || "Non défini"}</p>
        <p><strong>Table :</strong> ${commande.tableName || "Non défini"}</p>
        <p><strong>Statut :</strong> ${commande.statut || "Non défini"}</p>
        <h3>Items</h3>
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:5px; border:1px solid #ddd;">Menu</th>
              <th style="padding:5px; border:1px solid #ddd;">Quantité</th>
              <th style="padding:5px; border:1px solid #ddd;">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <h2 style="text-align:right; color:#FF5722; margin-top:20px;">Total : ${total} FCFA</h2>
      </div>
    `;
  };

  const handlePrintCommande = (commande) => {
    const htmlContent = generateOrderHtml(commande);
    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadCommande = (commande) => {
    const htmlContent = generateOrderHtml(commande);
    const doc = new jsPDF();
    doc.html(htmlContent, {
      callback: function (doc) {
        doc.save(`Commande_${commande.userName || "Utilisateur"}.pdf`);
      },
      x: 10,
      y: 10,
      width: 190,
    });
  };

  const commandesByStatus = {
    "en cours": commandes.filter(c => c.statut === "en cours"),
    "prêt": commandes.filter(c => c.statut === "prêt"),
    "annulée": commandes.filter(c => c.statut === "annulée")
  };

  const filteredCommandes = commandesByStatus[activeTab]
    .filter(commande => {
      const tableName = commande.tableName || "";
      const userName = commande.userName || "";
      return (
        tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1, color: 'primary.main', justifyContent: 'center' }}
      >
        <ReceiptIcon sx={{ fontSize: '2rem' }} />
        Gestion des Commandes
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher par table ou nom utilisateur..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.default' } }}
        />
      </Box>
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="En cours" value="en cours" />
        <Tab label="Prêt" value="prêt" />
        <Tab label="Annulée" value="annulée" />
      </Tabs>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : filteredCommandes.length === 0 ? (
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 8 }}>
          Aucune commande {activeTab}.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredCommandes.map((commande) => (
            <Grid item xs={12} sm={6} md={4} key={commande.id}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Utilisateur : {commande.userName}
                    </Typography>
                    <Chip label={commande.statut} color={commande.statut === "prêt" ? "success" : commande.statut === "en cours" ? "warning" : "error"} sx={{ fontWeight: "bold" }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Table : {commande.tableName || "Non spécifiée"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Total : {commande.items.reduce((sum, item) => sum + (item.quantite || 1) * item.price, 0).toFixed(2)} FCFA
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                      Items commandés :
                    </Typography>
                    {commande.items.map((item, idx) => (
                      <Typography key={idx} variant="body2" color="text.secondary">
                        - {menuMap[item.idMenu] || "Menu Non Trouvé"} (x{item.quantite || 1})
                      </Typography>
                    ))}
                  </Box>
                  <Box sx={{ mt: 3 }}>
                    <TextField
                      select
                      label="Mettre à jour le statut"
                      value={commande.statut}
                      onChange={(e) => handleUpdateStatus(commande.id, e.target.value)}
                      fullWidth
                      size="small"
                      SelectProps={{ native: true }}
                    >
                      <option value="en cours">En cours</option>
                      <option value="prêt">Prêt</option>
                      <option value="annulée">Annulée</option>
                    </TextField>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => handlePrintCommande(commande)} sx={{ borderRadius: 2, textTransform: "none" }}>Imprimer</Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleDownloadCommande(commande)} sx={{ borderRadius: 2, textTransform: "none" }}>Télécharger</Button>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
export default OrderManager;