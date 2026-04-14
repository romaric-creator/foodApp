import React, { useState } from "react";
import { 
  Box, Button, Typography, Paper, Snackbar, Alert, TextField, 
  CircularProgress, Tabs, Tab, alpha, useTheme, Container, IconButton 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AppContext";
import { RestaurantMenu, PersonAdd, Login as LoginIcon, ArrowBack } from "@mui/icons-material";

const ClientLogin = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, register, loading } = useAuth();
  
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  const orangeColor = theme.palette.orange?.main || "#FF9800";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      const idTable = localStorage.getItem("idtable");
      if (idTable) {
        navigate(`/client/${idTable}`);
      } else {
        // Rediriger vers une page par défaut ou demander de scanner un QR Code
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la connexion");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!name || !email || !password) {
        setError("Tous les champs sont requis");
        return;
      }
      await register({ name, email, password });
      const idTable = localStorage.getItem("idtable");
      if (idTable) {
        navigate(`/client/${idTable}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la création du compte");
    }
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      bgcolor: "backgroundPanier.default", // Utilise le fond clair du panier
      position: 'relative'
    }}>
      {/* Header décoratif */}
      <Box sx={{ 
        height: '35vh', 
        width: '100%', 
        bgcolor: orangeColor,
        background: `linear-gradient(135deg, ${orangeColor} 0%, ${theme.palette.orange?.dark || '#EF6C00'} 100%)`,
        borderBottomLeftRadius: '50% 20%',
        borderBottomRightRadius: '50% 20%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        p: 2
      }}>
        <RestaurantMenu sx={{ fontSize: 60, mb: 1, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: -1 }}>
          GOURMI
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
          Votre restaurant à portée de main
        </Typography>
      </Box>

      <Container maxWidth="xs" sx={{ mt: -8, pb: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Paper elevation={10} sx={{ 
          p: 3, 
          borderRadius: 4, 
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}>
          <Tabs
            value={tab}
            onChange={(_, v) => { setTab(v); setError(null); }}
            variant="fullWidth"
            sx={{ 
              mb: 3, 
              borderBottom: 1, 
              borderColor: 'divider',
              '.MuiTabs-indicator': { backgroundColor: orangeColor, height: 3, borderRadius: 3 },
              '.Mui-selected': { color: orangeColor }
            }}
          >
            <Tab icon={<LoginIcon />} label="Connexion" iconPosition="start" />
            <Tab icon={<PersonAdd />} label="Inscription" iconPosition="start" />
          </Tabs>

          <Box sx={{ px: 1 }}>
            {tab === 0 ? (
              <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField 
                  label="Email" 
                  type="email" 
                  variant="filled"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  fullWidth 
                  disabled={loading}
                  InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
                />
                <TextField 
                  label="Mot de passe" 
                  type="password" 
                  variant="filled"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  fullWidth 
                  disabled={loading}
                  InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading} 
                  sx={{ 
                    mt: 1,
                    py: 1.8,
                    borderRadius: 3,
                    fontSize: "1.1rem",
                    bgcolor: orangeColor,
                    '&:hover': { bgcolor: theme.palette.orange?.dark || '#EF6C00' },
                    boxShadow: `0 8px 16px ${alpha(orangeColor, 0.3)}`
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Commencer la commande"}
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSignup} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField 
                  label="Nom complet" 
                  variant="filled"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  fullWidth 
                  disabled={loading}
                  InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
                />
                <TextField 
                  label="Email" 
                  type="email" 
                  variant="filled"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  fullWidth 
                  disabled={loading}
                  InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
                />
                <TextField 
                  label="Mot de passe" 
                  type="password" 
                  variant="filled"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  fullWidth 
                  disabled={loading}
                  InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading} 
                  sx={{ 
                    mt: 1,
                    py: 1.8,
                    borderRadius: 3,
                    fontSize: "1.1rem",
                    bgcolor: orangeColor,
                    '&:hover': { bgcolor: theme.palette.orange?.dark || '#EF6C00' },
                    boxShadow: `0 8px 16px ${alpha(orangeColor, 0.3)}`
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Créer mon compte"}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>

        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
          sx={{ mt: 3, color: 'text.secondary', alignSelf: 'center' }}
        >
          Retour
        </Button>
      </Container>

      {error && (
        <Snackbar 
          open={!!error} 
          autoHideDuration={4000} 
          onClose={() => setError(null)} 
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="error" onClose={() => setError(null)} variant="filled" sx={{ width: "100%", borderRadius: 2 }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default ClientLogin;
