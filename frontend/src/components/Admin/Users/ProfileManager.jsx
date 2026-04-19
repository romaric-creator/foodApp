import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { AccountCircle as AccountCircleIcon, Settings as SettingsIcon, Logout as LogoutIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../../../services/userService';
import { logout } from '../../../services/authService';

export default function ProfileManager() {
  const navigate = useNavigate();
  const [adminProfile, setAdminProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Le JWT et l'utilisateur sont stockés sous la clé "user"
    const admin = JSON.parse(localStorage.getItem('user'));
    if (admin && admin.role === 'admin') {
      setAdminProfile(admin);
      setProfileForm({ name: admin.name || '', email: admin.email || '', password: '' });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!profileForm.name || !profileForm.email) {
      setProfileMsg('Nom et email obligatoires.');
      return;
    }
    setIsLoading(true);
    setProfileMsg('');
    try {
      const userId = adminProfile.idUsers || adminProfile.id;
      const updateData = { name: profileForm.name, email: profileForm.email };
      if (profileForm.password) {
        updateData.password = profileForm.password;
      }
      await updateUser(userId, updateData);

      const updated = { ...adminProfile, name: profileForm.name, email: profileForm.email };
      setAdminProfile(updated);
      localStorage.setItem('admin', JSON.stringify(updated));
      localStorage.setItem('user', JSON.stringify(updated));
      setEditMode(false);
      setProfileMsg('Profil mis à jour avec succès.');
    } catch (e) {
      console.error('Erreur lors de la mise à jour du profil:', e);
      setProfileMsg('Erreur lors de la mise à jour du profil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Box sx={{ width: 100, height: 100, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: 'white' }}>
          <AccountCircleIcon sx={{ fontSize: 80 }} />
        </Box>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: 'primary.main' }}>Profil Administrateur</Typography>
        <Typography variant="body1" color="text.secondary">Gérez vos informations et préférences.</Typography>
      </Box>

      {/* Informations personnelles */}
      {adminProfile && !editMode && (
        <Box sx={{ mb: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon color="primary" /> Informations du compte
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2" color="text.secondary">Nom</Typography>
              <Typography variant="body1" fontWeight="bold">{adminProfile.name}</Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2" color="text.secondary">Email</Typography>
              <Typography variant="body1" fontWeight="bold">{adminProfile.email}</Typography>
            </Box>
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => setEditMode(true)} fullWidth>
              Modifier le profil
            </Button>
          </Box>
        </Box>
      )}

      {/* Formulaire modification */}
      {adminProfile && editMode && (
        <Box sx={{ mb: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Nom" name="name" value={profileForm.name} onChange={handleChange} fullWidth />
          <TextField label="Email" name="email" value={profileForm.email} onChange={handleChange} fullWidth />
          <TextField
            label="Mot de passe (laisser vide pour ne pas changer)"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={profileForm.password}
            onChange={handleChange}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} onMouseDown={e => e.preventDefault()}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ flex: 1 }} disabled={isLoading}>
              {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Enregistrer'}
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => { setEditMode(false); setProfileForm({ name: adminProfile.name, email: adminProfile.email, password: '' }); }} sx={{ flex: 1 }}>
              Annuler
            </Button>
          </Box>
        </Box>
      )}

      {/* Déconnexion */}
      <Button variant="outlined" color="error" onClick={handleLogout} startIcon={<LogoutIcon />} fullWidth>
        Se déconnecter
      </Button>

      {profileMsg && <Alert severity="info" sx={{ mt: 4 }}>{profileMsg}</Alert>}
    </Box>
  );
}
