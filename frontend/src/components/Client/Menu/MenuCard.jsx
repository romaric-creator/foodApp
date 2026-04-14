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
  const orangeColor = theme.palette.orange?.main || "#FF9800";

  return (
    <Card sx={{
      display: 'flex',
      flexDirection: 'row',
      height: '140px',
      mb: 2,
      borderRadius: 4,
      overflow: 'hidden',
      boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
      border: '1px solid',
      borderColor: alpha(theme.palette.divider, 0.05),
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-4px) scale(1.02)',
        boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
      }
    }}>
      <Box sx={{ position: 'relative', width: '130px', minWidth: '130px' }}>
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
        <Box sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          bgcolor: 'rgba(255,255,255,0.9)',
          borderRadius: '50%',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <IconButton 
            size="small"
            onClick={() => onShowIngredients(menu.idMenu, menu.description, menu.image_url)}
            sx={{ color: 'text.secondary' }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        flex: 1,
        p: 2,
        gap: 0.5
      }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 800,
            color: 'text.primary',
            fontSize: '1.05rem',
            lineHeight: 1.2,
            mb: 0.5
          }}
        >
          {menu.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: '0.85rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1,
            lineHeight: 1.3
          }}
        >
          {menu.description || "Une délicieuse spécialité de la maison préparée avec soin."}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 'auto'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 900,
              color: orangeColor,
              fontSize: '1.2rem'
            }}
          >
            {formatPrice(menu.price)} <Box component="span" sx={{ fontSize: '0.7rem' }}>FCFA</Box>
          </Typography>

          <Button
            variant="contained"
            onClick={() => onAddToCart(menu)}
            size="small"
            sx={{
              minWidth: '40px',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              p: 0,
              bgcolor: orangeColor,
              '&:hover': {
                bgcolor: theme.palette.orange?.dark || '#EF6C00',
              },
              boxShadow: `0 4px 12px ${alpha(orangeColor, 0.4)}`
            }}
          >
            <AddIcon sx={{ fontSize: 24 }} />
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default MenuCard;
