import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Paper,
  Avatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { updateUser } from "../../../services/userService";

const EcranProfil = ({ user: initialUser, onLogout }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: initialUser?.name || "",
    email: initialUser?.email || "",
    password: initialUser?.password || "",
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      return setSnackbar({ open: true, message: "Le nom et l'email sont requis.", severity: "error" });
    }
    try {
      const userId = initialUser.idUsers || initialUser.id;
      const updateData = { name: formData.name, email: formData.email };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await updateUser(userId, updateData);
      const updated = { ...initialUser, ...updateData };
      localStorage.setItem("user", JSON.stringify(updated));
      setSnackbar({ open: true, message: "Profil mis à jour avec succès !", severity: "success" });
      setEditMode(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setSnackbar({ open: true, message: "Erreur lors de la mise à jour.", severity: "error" });
    }
  };

  if (!initialUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: 'center',
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 120,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              }}
            />
            
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                margin: '20px auto',
                border: '4px solid white',
                position: 'relative',
                zIndex: 1
              }}
            >
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              Bienvenue sur votre profil
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Connectez-vous pour accéder à toutes les fonctionnalités
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{
                borderRadius: 2,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
                height: '48px'
              }}
              href="/client/login"
            >
              Se connecter
            </Button>
          </Paper>
        </Container>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <Container maxWidth="md" sx={{ py: 0.3, px: 0.3 }}>
        <Paper
          elevation={3}
          sx={{ borderRadius: 2, overflow: 'hidden' }}
        >
          {/* Header avec gradient */}
          <Box
            sx={{
              height: 200,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              position: 'relative',
              p: 3
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'white',
                color: 'primary.main',
                fontSize: '3rem',
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                marginBottom: '-60px'
              }}
            >
              {initialUser.name?.charAt(0).toUpperCase() || "U"}
            </Avatar>
          </Box>

          {/* Contenu */}
          <Box sx={{ p: 2, pt: 8 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                textAlign: 'center', 
                mb: 4, 
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {editMode ? "Modifier mon profil" : "Mon Profil"}
            </Typography>

            <Box
              component="form"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxWidth: 480,
                mx: 'auto'
              }}
            >
              <TextField
                fullWidth
                label="Nom"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editMode}
                inputProps={{
                  maxLength: 30,
                  style: { fontSize: '0.9rem' }
                }}
                sx={{ bgcolor: 'background.paper' }}
              />

              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editMode}
                sx={{ bgcolor: 'background.paper' }}
              />

              {editMode && (
                <TextField
                  fullWidth
                  label="Mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  sx={{ bgcolor: 'background.paper' }}
                />
              )}

              {/* Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                mt: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                '& .MuiButton-root': {
                  flex: 1,
                  height: '40px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  borderRadius: 1,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  minWidth: { xs: '100%', sm: '120px' }
                }
              }}>
                {editMode ? (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon sx={{ fontSize: 20 }} />}
                      onClick={handleSave}
                    >
                      Enregistrer
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon sx={{ fontSize: 20 }} />}
                      onClick={() => setEditMode(false)}
                    >
                      Annuler
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon sx={{ fontSize: 20 }} />}
                      onClick={() => setEditMode(true)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<LogoutIcon sx={{ fontSize: 20 }} />}
                      onClick={onLogout}
                    >
                      Déconnexion
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </motion.div>
  );
};

export default EcranProfil;
