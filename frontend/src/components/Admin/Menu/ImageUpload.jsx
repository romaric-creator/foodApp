import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const ImageUpload = ({ imagePreview, handleImageChange, validationError }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Aperçu de l'image</Typography>
      <Paper
        sx={{
          width: '100%',
          aspectRatio: '1/1',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          border: '2px dashed',
          borderColor: 'grey.400'
        }}
      >
        {imagePreview ? (
          <img src={imagePreview} alt="Aperçu de l'image du menu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            L'image du menu s'affichera ici.
          </Typography>
        )}
      </Paper>
      <Button
        variant="contained"
        component="label"
        startIcon={<AddPhotoAlternateIcon />}
        sx={{ borderRadius: 2, fontWeight: 'bold' }}
        color="secondary"
      >
        {imagePreview ? "Changer l'image" : 'Ajouter une image'}
        <input type="file" accept="image/*" hidden onChange={handleImageChange} aria-label="Choisir une image pour le menu" />
      </Button>
      {!!validationError && (
        <Typography color="error" variant="caption" sx={{ mt: 1, textAlign: 'center' }}>{validationError}</Typography>
      )}
    </Box>
  );
};

export default ImageUpload;
