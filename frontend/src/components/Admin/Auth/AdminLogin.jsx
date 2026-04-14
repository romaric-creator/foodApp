import React, { useState, useRef, useEffect } from "react";
import {
  Box, Paper, Typography, TextField, Button, CircularProgress,
  Snackbar, Alert, IconButton, InputAdornment, Container, alpha, useTheme
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AppContext";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });
  const navigate = useNavigate();
  const theme = useTheme();
  const emailRef = useRef();
  
  const { login, loading } = useAuth();

  useEffect(() => {
    if (emailRef.current) emailRef.current.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSnackbar({ open: false, message: "", severity: "error" });

    try {
      const user = await login(email, password);

      if (user.role !== "admin") {
        setSnackbar({ 
          open: true, 
          message: "Accès refusé : vous n'êtes pas admin.", 
          severity: "error" 
        });
        return;
      }

      if (onLogin) onLogin();
      navigate("/admin");
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.message || "Erreur lors de la connexion.", 
        severity: "error" 
      });
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Éléments décoratifs en arrière-plan */}
      <Box sx={{ 
        position: 'absolute', 
        top: -100, 
        right: -100, 
        width: 400, 
        height: 400, 
        borderRadius: '50%', 
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        zIndex: 0
      }} />
      <Box sx={{ 
        position: 'absolute', 
        bottom: -50, 
        left: -50, 
        width: 300, 
        height: 300, 
        borderRadius: '50%', 
        bgcolor: alpha(theme.palette.secondary.main, 0.05),
        zIndex: 0
      }} />

      <Container maxWidth="xs" sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ 
            width: 64, 
            height: 64, 
            borderRadius: 3, 
            bgcolor: 'primary.main', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
          }}>
            <LockOutlined sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Typography variant="h4" fontWeight="800" gutterBottom>
            GOURMI Admin
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connectez-vous pour gérer votre restaurant
          </Typography>
        </Box>

        <Paper sx={{ 
          p: 4, 
          borderRadius: 4, 
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1)
        }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Adresse Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              fullWidth
              disabled={loading}
              inputRef={emailRef}
              variant="outlined"
              placeholder="admin@gourmi.com"
            />
            <TextField
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              fullWidth
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={e => e.preventDefault()}
                      disabled={loading}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              disabled={loading}
              size="large"
              sx={{ 
                py: 1.8, 
                fontSize: '1rem',
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                   boxShadow: `0 12px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Accéder au Dashboard"}
            </Button>
          </Box>
        </Paper>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          &copy; {new Date().getFullYear()} GOURMI POS System. Tous droits réservés.
        </Typography>
      </Container>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(s => ({ ...s, open: false }))} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
