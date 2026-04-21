import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  useTheme,
  alpha
} from "@mui/material";
import { Remove, Add, DeleteOutline } from "@mui/icons-material";
import { motion } from "framer-motion";

const CartItem = ({ item, modifierQuantite }) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      layout
    >
      <Card sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        border: '1px solid rgba(0,0,0,0.02)',
        mb: 2,
        overflow: 'visible'
      }}>
        <CardMedia
          component="img"
          sx={{
            width: 70,
            height: 70,
            objectFit: "cover",
            borderRadius: '16px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}
          image={item.image_url || "https://placehold.co/80x80/E0E0E0/666666?text=🍽️"}
          alt={item.name}
        />
        
        <CardContent sx={{ 
          flex: 1, 
          py: '0 !important', 
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            {item.name}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 900, color: primaryColor }}>
            {item.price.toLocaleString()} <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>FCFA</span>
          </Typography>
        </CardContent>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: '#F8F9FA', 
          borderRadius: '12px',
          p: 0.5,
          border: '1px solid rgba(0,0,0,0.03)'
        }}>
          <IconButton 
            size="small" 
            onClick={() => modifierQuantite(item, -1)}
            sx={{ 
              color: item.quantite === 1 ? 'error.main' : 'text.secondary',
              p: 0.5 
            }}
          >
            {item.quantite === 1 ? <DeleteOutline fontSize="small" /> : <Remove fontSize="small" />}
          </IconButton>
          
          <Typography sx={{ mx: 1.5, fontWeight: 900, fontSize: '0.9rem' }}>
            {item.quantite}
          </Typography>
          
          <IconButton 
            size="small" 
            onClick={() => modifierQuantite(item, 1)}
            sx={{ color: primaryColor, p: 0.5 }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Box>
      </Card>
    </motion.div>
  );
};

export default CartItem;
