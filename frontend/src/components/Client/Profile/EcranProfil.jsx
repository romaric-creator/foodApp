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
  alpha,
  useTheme
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
import { useNavigate } from "react-router-dom";

const EcranProfil = ({ user: initialUser, onLogout }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: initialUser?.name || "",
    email: initialUser?.email || "",
    password: "",
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const primaryColor = theme.palette.primary.main;

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      return setSnackbar({ open: true, message: "Le nom et l'email sont requis.", severity: "error" });
    }
    try {
      const userId = initialUser.idUsers || initialUser.id;
      const updateData = { name: formData.name, email: formData.email };
      if (formData.password) updateData.password = formData.password;
      
      await updateUser(userId, updateData);
      localStorage.setItem("user", JSON.stringify({ ...initialUser, ...updateData }));
      setSnackbar({ open: true, message: "Profil mis à jour !", severity: "success" });
      setEditMode(false);
    } catch (error) {
      setSnackbar({ open: true, message: "Erreur lors de la mise à jour.", severity: "error" });
    }
  };

  if (!initialUser) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: '32px', textAlign: 'center', bgcolor: 'white', maxWidth: 400, border: '1px solid rgba(0,0,0,0.05)' }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: alpha(primaryColor, 0.1), color: primaryColor, mx: 'auto', mb: 2 }}>
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Espace Client</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Connectez-vous pour suivre vos commandes et personnaliser votre profil.</Typography>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={() => navigate('/client/login')}
            sx={{ borderRadius: '16px', py: 1.5, fontWeight: 800, bgcolor: primaryColor }}
          >
            Se connecter
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh', pb: 4 }}>
      {/* Profil Header */}
      <Box sx={{ 
        height: '200px', 
        background: `linear-gradient(45deg, ${primaryColor}, ${theme.palette.primary.dark})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        mb: 8
      }}>
        <Avatar
          sx={{
            width: 120,
            height: 120,
            bgcolor: 'white',
            color: primaryColor,
            fontSize: '3rem',
            fontWeight: 900,
            border: '6px solid white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            position: 'absolute',
            bottom: -60
          }}
        >
          {initialUser.name?.charAt(0).toUpperCase()}
        </Avatar>
      </Box>

      <Container maxWidth="xs">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 900, mb: 4 }}>
            {editMode ? "Modifier mon profil" : initialUser.name}
          </Typography>

          <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                label="Nom complet"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editMode}
                variant="outlined"
                InputProps={{ sx: { borderRadius: '12px' } }}
              />

              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editMode}
                variant="outlined"
                InputProps={{ sx: { borderRadius: '12px' } }}
              />

              {editMode && (
                <TextField
                  fullWidth
                  label="Nouveau mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '12px' } }}
                />
              )}

              <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                {editMode ? (
                  <>
                    <Button variant="contained" fullWidth onClick={handleSave} sx={{ borderRadius: '12px', py: 1.5, bgcolor: primaryColor }}>
                      Sauvegarder
                    </Button>
                    <Button variant="outlined" fullWidth onClick={() => setEditMode(false)} sx={{ borderRadius: '12px', py: 1.5 }}>
                      Annuler
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="contained" fullWidth onClick={() => setEditMode(true)} sx={{ borderRadius: '12px', py: 1.5, bgcolor: primaryColor }}>
                      Modifier
                    </Button>
                    <Button variant="outlined" color="error" fullWidth onClick={onLogout} sx={{ borderRadius: '12px', py: 1.5 }}>
                      Déconnexion
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EcranProfil;
