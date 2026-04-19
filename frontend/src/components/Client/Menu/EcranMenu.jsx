import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Fab,
  InputAdornment,
  alpha,
  useTheme,
  Paper,
  IconButton
} from "@mui/material";
import { Search, Refresh, KeyboardArrowUp, RestaurantMenu as RestaurantIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import MenuCard from "./MenuCard";
import { useNavigate, useParams } from "react-router-dom";

const AnimatedMenuItem = React.memo(({ menu, ajouterAuPanier, onShowIngredients }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.3 }}
  >
    <MenuCard menu={menu} onAddToCart={ajouterAuPanier} onShowIngredients={onShowIngredients} />
  </motion.div>
));

const EcranMenu = ({
  theme: propTheme,
  recherche,
  setRecherche,
  categories,
  categorieSelectionnee,
  setCategorieSelectionnee,
  chargement,
  filteredMenus,
  ajouterAuPanier,
}) => {
  const theme = useTheme();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const navigate = useNavigate();
  const { idtable } = useParams();
  
  const orangeColor = theme.palette.orange?.main || "#FF9800";

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShowScrollButton(y > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShowIngredients = (menuId, description, imageUrl) => {
    const ingredientList = description ? description.split(",").map((item) => item.trim()) : [];
    navigate(`/client/${idtable}/ingredients/${menuId}`, { 
      state: { 
        menuName: filteredMenus.find(m => m.idMenu === menuId)?.name || "Inconnu", 
        ingredients: ingredientList, 
        imageUrl: imageUrl 
      } 
    });
  };

  return (
    <Box sx={{ bgcolor: 'backgroundPanier.default', minHeight: '100vh' }}>
      {/* Header Visuel */}
      <Box sx={{ 
        height: '220px', 
        width: '100%', 
        position: 'relative',
        bgcolor: orangeColor,
        background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 3,
        pt: 2,
        pb: 4
      }}>
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 900, mb: 0.5, letterSpacing: -1 }}>
          GOURMI
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
          {idtable ? `Table N° ${idtable}` : "Bienvenue à notre table"}
        </Typography>
      </Box>

      {/* Barre de Recherche et Catégories */}
      <Box sx={{ 
        mt: -4, 
        px: 2, 
        position: 'relative', 
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <Paper elevation={4} sx={{ 
          p: 0.5, 
          borderRadius: 4, 
          display: 'flex', 
          alignItems: 'center',
          bgcolor: 'background.paper'
        }}>
          <TextField
            fullWidth
            placeholder="Rechercher votre plat préféré..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            variant="standard"
            sx={{ px: 2 }}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: orangeColor }} />
                </InputAdornment>
              )
            }}
          />
          <IconButton 
            onClick={() => { setRecherche(""); setCategorieSelectionnee(null); }}
            sx={{ color: 'text.secondary', p: 1.5 }}
          >
            <Refresh />
          </IconButton>
        </Paper>

        <Box
          sx={{
            width: '100%',
            overflowX: 'auto',
            display: 'flex',
            gap: 1.5,
            py: 1,
            '::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {categories.map((categorie) => (
            <Chip
              key={categorie.idCat}
              label={categorie.name}
              onClick={() => setCategorieSelectionnee(categorie.idCat)}
              sx={{
                px: 1,
                py: 2.5,
                borderRadius: 3,
                fontSize: '0.9rem',
                fontWeight: 700,
                bgcolor: categorieSelectionnee === categorie.idCat ? orangeColor : 'white',
                color: categorieSelectionnee === categorie.idCat ? 'white' : 'text.primary',
                boxShadow: categorieSelectionnee === categorie.idCat 
                  ? `0 4px 12px ${alpha(orangeColor, 0.4)}` 
                  : '0 2px 8px rgba(0,0,0,0.05)',
                '&:hover': {
                  bgcolor: categorieSelectionnee === categorie.idCat ? orangeColor : 'grey.100',
                },
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Liste des Plats */}
      <Box sx={{ p: 2, pb: 10 }}>
        {chargement ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress sx={{ color: orangeColor }} />
          </Box>
        ) : filteredMenus.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun plat trouvé
            </Typography>
            <Button 
              variant="text" 
              onClick={() => { setRecherche(""); setCategorieSelectionnee(null); }}
              sx={{ color: orangeColor }}
            >
              Voir tout le menu
            </Button>
          </Box>
        ) : (
          filteredMenus.map((menu) => (
            <AnimatedMenuItem
              key={menu.idMenu}
              menu={menu}
              ajouterAuPanier={ajouterAuPanier}
              onShowIngredients={handleShowIngredients}
            />
          ))
        )}
      </Box>

      {/* Bouton scroll top */}
      {showScrollButton && (
        <Fab
          onClick={scrollToTop}
          size="medium"
          sx={{
            position: "fixed",
            bottom: 80,
            right: 20,
            zIndex: 1000,
            bgcolor: orangeColor,
            color: 'white',
            '&:hover': { bgcolor: theme.palette.orange?.dark || '#EF6C00' }
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      )}
    </Box>
  );
};

export default EcranMenu;
