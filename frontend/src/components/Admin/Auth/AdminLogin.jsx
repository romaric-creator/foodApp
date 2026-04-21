import React, { useState, useRef, useEffect } from "react";
import {
  Box, Paper, Typography, TextField, Button, CircularProgress,
  Snackbar, Alert, IconButton, InputAdornment, Container, alpha, useTheme
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined, RestaurantMenu } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AppContext";
import { motion } from "framer-motion";

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });
  const navigate = useNavigate();
  const theme = useTheme();
  const emailRef = useRef();
  
  const { login, loading } = useAuth();
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    if (emailRef.current) emailRef.current.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSnackbar({ open: false, message: "", severity: "error" });

    try {
      const user = await login(email, password);
      if (user.role !== "admin") {
        setSnackbar({ open: true, message: "Accès refusé : vous n'êtes pas admin.", severity: "error" });
        return;
      }
      if (onLogin) onLogin();
      navigate("/admin");
    } catch (error) {
      setSnackbar({ open: true, message: error.message || "Erreur lors de la connexion.", severity: "error" });
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <Container maxWidth="xs" sx={{ mt: 'auto', mb: 'auto', px: 3 }}>
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 5 }}>
             <Box sx={{ 
              display: 'inline-flex', p: 2.5, borderRadius: '28px', 
              bgcolor: alpha(primaryColor, 0.2), backdropFilter: 'blur(10px)', mb: 3,
              border: `1px solid ${alpha(primaryColor, 0.3)}`
            }}>
              <RestaurantMenu sx={{ fontSize: 48, color: primaryColor }} />
            </Box>
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 900, letterSpacing: -1.5, mb: 0.5 }}>
              GOURMI <Box component="span" sx={{ fontSize: '1rem', fontWeight: 500, verticalAlign: 'middle', bgcolor: primaryColor, px: 1, borderRadius: '8px', ml: 1 }}>ADMIN</Box>
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
              Gestion & Pilotage Stratégique
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ 
            p: 4, 
            borderRadius: '40px', 
            bgcolor: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(20px)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Identifiant Administrateur"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                fullWidth
                disabled={loading}
                inputRef={emailRef}
                variant="filled"
                InputProps={{ 
                  disableUnderline: true, 
                  sx: { borderRadius: '16px', bgcolor: alpha(theme.palette.divider, 0.05) } 
                }}
              />
              <TextField
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                fullWidth
                disabled={loading}
                variant="filled"
                InputProps={{
                  disableUnderline: true,
                  sx: { borderRadius: '16px', bgcolor: alpha(theme.palette.divider, 0.05) },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                disabled={loading}
                sx={{ 
                  py: 2, 
                  borderRadius: '16px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  bgcolor: primaryColor,
                  boxShadow: `0 12px 24px ${alpha(primaryColor, 0.4)}`,
                  '&:hover': {
                     bgcolor: theme.palette.primary.dark,
                     transform: 'translateY(-2px)',
                     boxShadow: `0 15px 30px ${alpha(primaryColor, 0.5)}`,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {loading ? <CircularProgress size={26} color="inherit" /> : "Accéder à la Console"}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>

      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', mb: 4, letterSpacing: 1 }}>
        &copy; {new Date().getFullYear()} GOURMI SYSTEM • SÉCURISÉ
      </Typography>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminLogin;
