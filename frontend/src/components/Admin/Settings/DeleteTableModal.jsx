import React from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  Backdrop,
  Fade,
} from "@mui/material";

const DeleteTableModal = ({ open, onClose, onDelete, isLoading }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 300 }}
    >
      <Fade in={open} timeout={300}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            p: 4,
            borderRadius: 3,
            maxWidth: 350,
            bgcolor: "background.paper",
            textAlign: "center",
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Confirmer la suppression ?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button variant="contained" color="error" onClick={onDelete} disabled={isLoading}>
              Oui, supprimer
            </Button>
            <Button variant="outlined" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default DeleteTableModal;
