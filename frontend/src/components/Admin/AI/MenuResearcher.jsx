import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HistoryIcon from '@mui/icons-material/History';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import api from '../../../config/api';

const MenuResearcher = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleResearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/ai/tools/research-menu', {
        name: searchTerm
      });
      setResult(response.data);
    } catch (err) {
      console.error('Research error:', err);
      setError('Impossible de trouver des informations précises sur ce plat.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // On pourrait ajouter un petit feedback ici
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SearchIcon color="primary" /> Recherche Gastronomique IA
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Entrez le nom d'un plat pour que Gourmi IQ effectue une recherche approfondie sur son origine, son histoire et ses ingrédients.
      </Typography>

      <Paper elevation={0} sx={{ p: 2, mb: 4, display: 'flex', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ex: Koki, Ndolé, Poisson Braisé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
          disabled={isLoading}
          size="small"
        />
        <Button
          variant="contained"
          onClick={handleResearch}
          disabled={isLoading || !searchTerm.trim()}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          sx={{ borderRadius: 2, px: 4 }}
        >
          {isLoading ? 'Recherche...' : 'Rechercher'}
        </Button>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {result && (
        <Grid container spacing={3}>
          {/* Fiche d'identité */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MenuBookIcon color="primary" />
                <Typography variant="h6">Fiche d'identité</Typography>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemText primary="Nom" secondary={result.name} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Origine" secondary={result.origin} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Prix suggéré" secondary={`${result.suggested_price_fcfa} FCFA (${result.suggested_price_euro} €)`} />
                </ListItem>
              </List>
              
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Allergènes :</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {result.allergens?.map((a, i) => (
                  <Chip key={i} label={a} size="small" color="warning" variant="outlined" />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Histoire et Description */}
          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon color="primary" />
                  <Typography variant="h6">Histoire & Marketing</Typography>
                </Box>
                <Button 
                  size="small" 
                  startIcon={<ContentCopyIcon />} 
                  onClick={() => copyToClipboard(result.marketing_description)}
                >
                  Copier la description
                </Button>
              </Box>
              
              <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                "{result.history}"
              </Typography>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Description Marketing Premium :
              </Typography>
              <Typography variant="body1" paragraph>
                {result.marketing_description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>Ingrédients clés :</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {result.ingredients_principaux?.map((ing, i) => (
                      <Chip key={i} label={ing} size="small" variant="filled" />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>Points nutritionnels :</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {result.nutritional_highlights?.map((n, i) => (
                      <Chip key={i} label={n} size="small" color="success" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default MenuResearcher;
