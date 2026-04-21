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
import { motion, AnimatePresence } from "framer-motion";
import MenuCard from "./MenuCard";
import { useNavigate, useParams } from "react-router-dom";

const AnimatedMenuItem = React.memo(({ menu, ajouterAuPanier, onShowIngredients }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
  >
    <MenuCard menu={menu} onAddToCart={ajouterAuPanier} onShowIngredients={onShowIngredients} />
  </motion.div>
));

const EcranMenu = ({
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
  
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

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
    <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh' }}>
      {/* Header Immersif */}
      <Box sx={{ 
        height: '240px', 
        width: '100%', 
        position: 'relative',
        background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        px: 3,
        pb: 6
      }}>
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8 }}
        >
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 900, mb: 0, letterSpacing: -1.5 }}>
            GOURMI
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, opacity: 0.9 }}>
            {idtable ? `Table N° ${idtable}` : "Bienvenue chez nous"}
          </Typography>
        </motion.div>
      </Box>

      {/* Barre de Recherche Flottante */}
      <Box sx={{ 
        mt: -3, 
        px: 2, 
        position: 'sticky', 
        top: 20,
        zIndex: 1100,
      }}>
        <Paper elevation={0} sx={{ 
          p: 0.8, 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center',
          bgcolor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
        }}>
          <TextField
            fullWidth
            placeholder="Que souhaitez-vous manger ?"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            variant="standard"
            sx={{ px: 2 }}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: primaryColor }} />
                </InputAdornment>
              )
            }}
          />
          {recherche && (
            <IconButton onClick={() => setRecherche("")} size="small" sx={{ mr: 1 }}>
              <Refresh fontSize="small" />
            </IconButton>
          )}
        </Paper>
      </Box>

      {/* Catégories - Horizontales avec défilement fluide */}
      <Box sx={{ mt: 3, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ px: 3, mb: 1.5, fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.7rem' }}>
          Nos Catégories
        </Typography>
        <Box
          sx={{
            width: '100%',
            overflowX: 'auto',
            display: 'flex',
            gap: 1.5,
            px: 3,
            pb: 2,
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
                py: 2.8,
                borderRadius: '16px',
                fontSize: '0.85rem',
                fontWeight: 800,
                bgcolor: categorieSelectionnee === categorie.idCat ? primaryColor : 'white',
                color: categorieSelectionnee === categorie.idCat ? 'white' : 'text.primary',
                boxShadow: categorieSelectionnee === categorie.idCat 
                  ? `0 6px 15px ${alpha(primaryColor, 0.4)}` 
                  : '0 4px 10px rgba(0,0,0,0.04)',
                border: '1px solid',
                borderColor: categorieSelectionnee === categorie.idCat ? primaryColor : 'rgba(0,0,0,0.03)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: categorieSelectionnee === categorie.idCat ? primaryColor : 'white',
                  transform: 'translateY(-2px)'
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Liste des Plats - Animation au défilement */}
      <Box sx={{ p: 2.5, pb: 12 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 900, fontSize: '1.2rem' }}>
          {recherche ? 'Résultats de recherche' : 'Séléction du Chef'}
        </Typography>
        
        {chargement ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <CircularProgress sx={{ color: primaryColor, mx: 'auto', my: 4 }} />
          </Box>
        ) : filteredMenus.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <RestaurantIcon sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.2, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">Aucun plat trouvé</Typography>
            <Button onClick={() => { setRecherche(""); setCategorieSelectionnee(null); }} sx={{ color: primaryColor, mt: 1, fontWeight: 700 }}>
              Voir tout le menu
            </Button>
          </Box>
        ) : (
          <AnimatePresence>
            {filteredMenus.map((menu) => (
              <AnimatedMenuItem
                key={menu.idMenu}
                menu={menu}
                ajouterAuPanier={ajouterAuPanier}
                onShowIngredients={handleShowIngredients}
              />
            ))}
          </AnimatePresence>
        )}
      </Box>

      {/* Fab pour remonter */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ position: "fixed", bottom: 100, right: 20, zIndex: 1200 }}
          >
            <Fab
              onClick={scrollToTop}
              size="medium"
              sx={{
                bgcolor: primaryColor,
                color: 'white',
                boxShadow: `0 8px 20px ${alpha(primaryColor, 0.4)}`,
                '&:hover': { bgcolor: theme.palette.primary.dark }
              }}
            >
              <KeyboardArrowUp />
            </Fab>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default EcranMenu;
