import React from 'react';
import {
  Modal,
  Paper,
  Typography,
  Button,
  Stack,
  Fade,
  Box as MuiBox,
} from '@mui/material';

const DeleteMenuModal = ({ open, onClose, onConfirm, isLoading }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={MuiBox}
      BackdropProps={{ sx: { bgcolor: 'rgba(0,0,0,0.3)' } }}
      aria-labelledby="modal-suppression-menu"
      aria-describedby="confirmation-message"
    >
      <Fade in={open}>
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 350, mx: 'auto', mt: 10, textAlign: 'center' }}>
          <Typography id="modal-suppression-menu" variant="h6" sx={{ mb: 2 }}>
            Confirmer la suppression ?
          </Typography>
          <Typography id="confirmation-message" variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce menu ?
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" color="error" onClick={onConfirm} disabled={isLoading}>
              Oui, supprimer
            </Button>
            <Button variant="outlined" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
          </Stack>
        </Paper>
      </Fade>
    </Modal>
  );
};

export default DeleteMenuModal;
