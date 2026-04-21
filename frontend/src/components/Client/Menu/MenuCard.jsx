import React from "react";
import { Box, Typography, Button, Card, CardMedia, IconButton, alpha, useTheme } from "@mui/material";
import { Add as AddIcon, InfoOutlined as InfoIcon } from "@mui/icons-material";

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const MenuCard = ({ menu, onAddToCart, onShowIngredients }) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  return (
    <Card sx={{
      display: 'flex',
      flexDirection: 'row',
      height: '120px',
      mb: 2,
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.03)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
      }
    }}>
      <Box sx={{ position: 'relative', width: '120px', minWidth: '120px' }}>
        <CardMedia
          component="img"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          image={menu.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"}
          alt={menu.name}
        />
        <IconButton 
          size="small"
          onClick={() => onShowIngredients(menu.idMenu, menu.description, menu.image_url)}
          sx={{ 
            position: 'absolute',
            top: 6,
            left: 6,
            bgcolor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(4px)',
            '&:hover': { bgcolor: 'white' }
          }}
        >
          <InfoIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </IconButton>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        flex: 1,
        p: 1.5,
        gap: 0.2
      }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 800,
            fontSize: '1rem',
            color: 'text.primary',
            lineHeight: 1.2,
            mb: 0.3
          }}
        >
          {menu.name}
        </Typography>
        
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            fontSize: '0.75rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1,
            opacity: 0.8
          }}
        >
          {menu.description || "Délicieuse spécialité préparée avec soin."}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 'auto'
        }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 900,
              color: primaryColor,
              fontSize: '1.1rem'
            }}
          >
            {formatPrice(menu.price)} <Box component="span" sx={{ fontSize: '0.65rem', opacity: 0.7 }}>FCFA</Box>
          </Typography>

          <Button
            variant="contained"
            onClick={() => onAddToCart(menu)}
            sx={{
              minWidth: '36px',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              p: 0,
              bgcolor: primaryColor,
              boxShadow: `0 4px 12px ${alpha(primaryColor, 0.3)}`,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            <AddIcon sx={{ fontSize: 20 }} />
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default MenuCard;
