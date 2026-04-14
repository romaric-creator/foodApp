import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  useTheme
} from "@mui/material";

const CartSummary = ({ calculerTotal, handlePasserCommande, commandeLoading }) => {
  const theme = useTheme();

  return (
    <Box sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      bgcolor: theme.palette.backgroundPanier.paper,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
      p: 3,
      borderRadius: '20px 20px 0 0',
      zIndex: 1200,
    }}>
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: 'center',
        mb: 3,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Total
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
          ${calculerTotal}
        </Typography>
      </Box>
      <Button
        fullWidth
        variant="contained"
        color="orange"
        size="large"
        onClick={handlePasserCommande}
        sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
        disabled={commandeLoading}
      >
        {commandeLoading ? (<CircularProgress size={24} color="inherit" />) : "Payer"}
      </Button>
    </Box>
  );
};

export default CartSummary;
