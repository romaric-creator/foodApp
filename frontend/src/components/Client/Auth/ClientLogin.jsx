import React, { useState } from "react";
import { 
  Box, Button, Typography, Paper, Snackbar, Alert, TextField, 
  CircularProgress, Tabs, Tab, alpha, useTheme, Container, IconButton, InputAdornment 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AppContext";
import { 
  RestaurantMenu, PersonAdd, Login as LoginIcon, ArrowBack, 
  EmailOutlined, LockOutlined, AccountCircleOutlined 
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const ClientLogin = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, register, loading } = useAuth();
  
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  const primaryColor = theme.palette.primary.main;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      const idTable = localStorage.getItem("idtable");
      idTable ? navigate(`/client/${idTable}`) : navigate("/");
    } catch (err) {
      setError(err.message || "Identifiants incorrects");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!name || !email || !password) return setError("Tous les champs sont requis");
      await register({ name, email, password });
      const idTable = localStorage.getItem("idtable");
      idTable ? navigate(`/client/${idTable}`) : navigate("/");
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      {/* Bouton Retour */}
      <IconButton 
        onClick={() => navigate(-1)}
        sx={{ position: 'absolute', top: 16, left: 16, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)' }}
      >
        <ArrowBack />
      </IconButton>

      <Container maxWidth="xs" sx={{ mt: 'auto', mb: 'auto', px: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ 
              display: 'inline-flex', p: 2, borderRadius: '24px', 
              bgcolor: alpha(primaryColor, 0.2), backdropFilter: 'blur(10px)', mb: 2,
              border: `1px solid ${alpha(primaryColor, 0.3)}`
            }}>
              <RestaurantMenu sx={{ fontSize: 40, color: primaryColor }} />
            </Box>
            <Typography variant="h3" fontWeight="900" sx={{ color: 'white', letterSpacing: -1, mb: 0.5 }}>
              GOURMI
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase' }}>
              Le goût de l'excellence
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: '32px', 
            bgcolor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            overflow: 'hidden'
          }}>
            <Tabs
              value={tab}
              onChange={(_, v) => { setTab(v); setError(null); }}
              variant="fullWidth"
              sx={{ 
                mb: 4, 
                bgcolor: alpha(theme.palette.divider, 0.05),
                borderRadius: '16px',
                p: 0.5,
                '.MuiTabs-indicator': { height: '100%', borderRadius: '12px', bgcolor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 0 },
                '.MuiTab-root': { zIndex: 1, fontWeight: 700, textTransform: 'none', transition: 'all 0.2s', minHeight: '44px' },
                '.Mui-selected': { color: primaryColor }
              }}
            >
              <Tab label="Connexion" />
              <Tab label="Inscription" />
            </Tabs>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: tab === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: tab === 0 ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {tab === 0 ? (
                  <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField 
                      placeholder="Email" 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      fullWidth 
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: alpha(primaryColor, 0.5) }} /></InputAdornment>,
                        sx: { borderRadius: '16px', bgcolor: 'white' }
                      }}
                    />
                    <TextField 
                      placeholder="Mot de passe" 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      fullWidth 
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: alpha(primaryColor, 0.5) }} /></InputAdornment>,
                        sx: { borderRadius: '16px', bgcolor: 'white' }
                      }}
                    />
                    <Button 
                      type="submit" 
                      variant="contained" 
                      disabled={loading} 
                      sx={{ 
                        mt: 1, py: 2, borderRadius: '16px', fontSize: "1rem", fontWeight: 800,
                        bgcolor: primaryColor, boxShadow: `0 8px 24px ${alpha(primaryColor, 0.4)}`,
                        '&:hover': { bgcolor: theme.palette.primary.dark }
                      }}
                    >
                      {loading ? <CircularProgress size={26} color="inherit" /> : "Se connecter"}
                    </Button>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleSignup} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField 
                      placeholder="Nom complet" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      required 
                      fullWidth 
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><AccountCircleOutlined sx={{ color: alpha(primaryColor, 0.5) }} /></InputAdornment>,
                        sx: { borderRadius: '16px', bgcolor: 'white' }
                      }}
                    />
                    <TextField 
                      placeholder="Email" 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      fullWidth 
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: alpha(primaryColor, 0.5) }} /></InputAdornment>,
                        sx: { borderRadius: '16px', bgcolor: 'white' }
                      }}
                    />
                    <TextField 
                      placeholder="Mot de passe" 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      fullWidth 
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: alpha(primaryColor, 0.5) }} /></InputAdornment>,
                        sx: { borderRadius: '16px', bgcolor: 'white' }
                      }}
                    />
                    <Button 
                      type="submit" 
                      variant="contained" 
                      disabled={loading} 
                      sx={{ 
                        mt: 1, py: 2, borderRadius: '16px', fontSize: "1rem", fontWeight: 800,
                        bgcolor: primaryColor, boxShadow: `0 8px 24px ${alpha(primaryColor, 0.4)}`,
                        '&:hover': { bgcolor: theme.palette.primary.dark }
                      }}
                    >
                      {loading ? <CircularProgress size={26} color="inherit" /> : "Créer mon compte"}
                    </Button>
                  </Box>
                )}
              </motion.div>
            </AnimatePresence>
          </Paper>
        </motion.div>
      </Container>

      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', mb: 4, px: 4 }}>
        En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
      </Typography>

      {error && (
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert severity="error" variant="filled" sx={{ borderRadius: '12px' }}>{error}</Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default ClientLogin;
