import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Remove, Add } from "@mui/icons-material";
import { motion } from "framer-motion";

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const CartItem = ({ item, modifierQuantite }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardMedia
          component="img"
          sx={{
            width: 80, height: 80, objectFit: "cover", borderRadius: 2,
            flexShrink: 0, mr: 2
          }}
          image={item.image_url || "https://placehold.co/80x80/E0E0E0/666666?text=🍽️"}
          alt={item.name}
          loading="lazy"
        />
        <CardContent sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: '0 !important',
          ml: 0
        }}>
          <Box sx={{ flexGrow: 1, pr: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'text.primary', lineHeight: 1.2 }}>
              {item.name}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
              }}
            >
              {formatPrice(item.price)} FCFA
            </Typography>
          </Box>

          <Box sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: 'rgba(0,0,0,0.05)',
            borderRadius: 2,
            p: 0.5,
            ml: isMobile ? 1 : 2,
          }}>
            <IconButton onClick={() => modifierQuantite(item, -1)} size="small" className="quantity-control-button">
              <Remove sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography sx={{ mx: 0.5, fontSize: 16, fontWeight: 'bold', color: 'text.primary' }}>{item.quantite}</Typography>
            <IconButton onClick={() => modifierQuantite(item, 1)} size="small" className="quantity-control-button">
              <Add sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CartItem;
