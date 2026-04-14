// Ce composant affiche un formulaire permettant d'envoyer un message uniquement si l'utilisateur est connecté.
import React, { useState } from "react";
import { Box, TextField, Button, Paper, Typography, Snackbar, Alert } from "@mui/material";
// MessageForm - Fonctionnalité non implémentée dans l'API
// TODO: Implémenter un endpoint pour les messages si nécessaire

const MessageForm = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [message, setMessage] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  // Si l'utilisateur n'est pas connecté, affiche un message d'erreur
  if (!user) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error">Vous devez être connecté pour envoyer un message.</Alert>
      </Paper>
    );
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setSnackbar({ open: true, message: "Le message ne peut pas être vide.", severity: "error" });
      return;
    }
    try {
      // TODO: Implémenter l'appel API pour les messages
      // Pour l'instant, on simule juste un succès
      setSnackbar({ open: true, message: "Fonctionnalité en cours de développement.", severity: "info" });
      setMessage("");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du message :", error);
      setSnackbar({ open: true, message: "Erreur lors de l'enregistrement du message.", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Envoyer un message
      </Typography>
      <Box component="form" onSubmit={handleSend} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Votre message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          rows={4}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Envoyer
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MessageForm;
