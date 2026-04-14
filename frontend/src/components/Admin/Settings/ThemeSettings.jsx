import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ThemeSettingsContext } from '../../theme/CustomThemeProvider';

// Thèmes prédéfinis pour la restauration
const predefinedThemes = {
  rustic: {
    name: '🏺 Bistrot Rustique',
    primary: '#8B4513',
    secondary: '#CD853F',
    background: '#1A1412'
  },
  mediterranean: {
    name: '🫒 Méditerranée',
    primary: '#1976D2',
    secondary: '#4CAF50',
    background: '#1A1F2B'
  },
  asian: {
    name: '🍜 Asiatique',
    primary: '#D32F2F',
    secondary: '#FFD700',
    background: '#1C1C1C'
  },
  patisserie: {
    name: '🧁 Pâtisserie',
    primary: '#EC407A',
    secondary: '#F8BBD0',
    background: '#2B1F26'
  },
  modern: {
    name: '🍽️ Gastronomique',
    primary: '#6200EA',
    secondary: '#00BFA5',
    background: '#0A0A0A'
  },
  organic: {
    name: '🥬 Bio & Nature',
    primary: '#43A047',
    secondary: '#81C784',
    background: '#1B2618'
  },
  seafood: {
    name: '🦐 Fruits de Mer',
    primary: '#0288D1',
    secondary: '#4FC3F7',
    background: '#102027'
  },
  steakhouse: {
    name: '🥩 Steakhouse',
    primary: '#BF360C',
    secondary: '#FF6E40',
    background: '#221D1D'
  },
  cocktailBar: {
    name: '🍸 Cocktail Lounge',
    primary: '#6A1B9A',
    secondary: '#CE93D8',
    background: '#1A1A1A'
  },
  dessert: {
    name: '🍰 Salon de Thé',
    primary: '#C2185B',
    secondary: '#F06292',
    background: '#2C2126'
  }
};

const defaultTheme = {
  primary: '#8BC34A',       // Vert pomme
  secondary: '#CDDC39',     // Jaune-vert
  background: '#1B1F1A',    // Vert très sombre
};


const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

const ThemeSettings = () => {
  const { customTheme, updateTheme } = useContext(ThemeSettingsContext);
  const [primary, setPrimary] = useState(customTheme.primary);
  const [secondary, setSecondary] = useState(customTheme.secondary);
  const [background, setBackground] = useState(customTheme.background);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setPrimary(customTheme.primary);
    setSecondary(customTheme.secondary);
    setBackground(customTheme.background);
  }, [customTheme]);

  const handleSave = () => {
    updateTheme({ primary, secondary, background });
    setSnackbar({ open: true, message: "Thème mis à jour", severity: "success" });
  };

  const handleReset = () => {
    setPrimary(defaultTheme.primary);
    setSecondary(defaultTheme.secondary);
    setBackground(defaultTheme.background);
    updateTheme(defaultTheme);
    setSnackbar({ open: true, message: "Thème réinitialisé", severity: "success" });
  };

  const handleGenerate = () => {
    const newPrimary = getRandomColor();
    const newSecondary = getRandomColor();
    const newBackground = getRandomColor();

    setPrimary(newPrimary);
    setSecondary(newSecondary);
    setBackground(newBackground);
    updateTheme({ primary: newPrimary, secondary: newSecondary, background: newBackground });

    setSnackbar({ open: true, message: "Thème généré aléatoirement", severity: "info" });
  };

  const handleThemeSelect = (event) => {
    const themeName = event.target.value;
    if (themeName && predefinedThemes[themeName]) {
      const theme = predefinedThemes[themeName];
      setPrimary(theme.primary);
      setSecondary(theme.secondary);
      setBackground(theme.background);
      updateTheme({
        primary: theme.primary,
        secondary: theme.secondary,
        background: theme.background
      });
      setSelectedTheme(themeName);
      setSnackbar({ 
        open: true, 
        message: `Thème ${theme.name} appliqué avec succès`, 
        severity: "success" 
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: { xs: 1, sm: 3 }, minHeight: '75vh', alignItems: 'center' }}>
      <Paper sx={{
        p: { xs: 2, sm: 4 },
        width: '100%',
        maxWidth: 600,
        borderRadius: 4,
        boxShadow: 6,
        background: 'linear-gradient(135deg, #e0f7fa, #ffe0b2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        alignItems: 'center',
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', color: 'primary.main', mb: 4 }}>
          Personnaliser le Thème
        </Typography>
        <FormControl fullWidth sx={{ mb: 4, borderRadius: 2 }}>
          <InputLabel>Thèmes Restaurant</InputLabel>
          <Select
            value={selectedTheme}
            onChange={handleThemeSelect}
            label="Thèmes Restaurant"
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }
            }}
          >
            {Object.entries(predefinedThemes).map(([key, theme]) => (
              <MenuItem 
                key={key} 
                value={key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 1.5
                }}
              >
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`,
                  mr: 1
                }} />
                {theme.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
          <TextField
            label="Couleur principale"
            type="color"
            value={primary}
            onChange={e => setPrimary(e.target.value)}
            sx={{ flex: 1, borderRadius: 2 }}
            inputProps={{ 'aria-label': 'Couleur principale' }}
          />
          <TextField
            label="Secondaire"
            type="color"
            value={secondary}
            onChange={e => setSecondary(e.target.value)}
            sx={{ flex: 1, borderRadius: 2 }}
            inputProps={{ 'aria-label': 'Couleur secondaire' }}
          />
          <TextField
            label="Fond"
            type="color"
            value={background}
            onChange={e => setBackground(e.target.value)}
            sx={{ flex: 1, borderRadius: 2 }}
            inputProps={{ 'aria-label': 'Couleur de fond' }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ borderRadius: 2, fontWeight: 'bold', flex: 1 }}>Enregistrer</Button>
          <Button variant="outlined" color="secondary" onClick={handleReset} sx={{ borderRadius: 2, fontWeight: 'bold', flex: 1 }}>Réinitialiser</Button>
          <Button variant="outlined" color="info" onClick={handleGenerate} sx={{ borderRadius: 2, fontWeight: 'bold', flex: 1 }}>Aléatoire</Button>
        </Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default ThemeSettings;
