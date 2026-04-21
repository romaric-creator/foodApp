import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Button, Modal, CircularProgress,
  TextField, Chip, Stack, IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import { MenuBook as MenuBookIcon, Add as AddIcon, Search as SearchIcon, Edit as EditIcon } from '@mui/icons-material';
import MenuForm from './MenuForm';
import { useMenus } from '../../../hooks/useMenus';
import { useCategories } from '../../../hooks/useCategories';

const MenuItemComponent = ({ menu, onEdit }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
    <Box sx={{ 
      p: 2, display: "flex", flexDirection: "column", gap: 1, 
      borderRadius: 4, border: '1px solid', borderColor: 'rgba(248,250,252,0.1)', 
      bgcolor: "background.paper", minHeight: 250, position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': { transform: 'translateY(-5px)', borderColor: 'primary.main', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }
    }}>
      <img src={`${menu.image_url}`} alt={menu.name} style={{ width: "100%", height: "auto", maxHeight: 150, objectFit: 'cover', borderRadius: "12px" }} />
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 900, mt: 1, color: 'text.primary' }}>{menu.name}</Typography>
        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>{menu.price} FCFA</Typography>
      </Box>
      <IconButton 
        aria-label="modifier" 
        onClick={() => onEdit(menu)} 
        sx={{ 
          position: 'absolute', top: 8, right: 8, 
          bgcolor: 'rgba(248,250,252,0.05)', 
          backdropFilter: 'blur(5px)',
          '&:hover': { bgcolor: 'rgba(248,250,252,0.15)' } 
        }}
      >
        <EditIcon color="primary" />
      </IconButton>
    </Box>
  </motion.div>
);

const MenuManager = () => {
  const { menus, loading: menusLoading, loadMenusByCategory } = useMenus();
  const { categories, loading: categoriesLoading, loadCategories } = useCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isMenuModalOpen, setMenuModalOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState(null);

  const init = useCallback(async () => {
    const cats = await loadCategories();
    if (cats.length > 0 && cats[0]?.idCat) {
      const defaultCat = cats[0].idCat;
      setSelectedCategory(defaultCat);
      loadMenusByCategory(defaultCat);
    }
  }, [loadCategories, loadMenusByCategory]);

  useEffect(() => {
    init();
  }, [init]);

  const openMenuModal = (menu = null) => {
    setCurrentMenu(menu);
    setMenuModalOpen(true);
  };

  const closeMenuModal = () => {
    setMenuModalOpen(false);
    if (selectedCategory) {
      loadMenusByCategory(selectedCategory);
    }
  };

  const handleCategoryChange = (cat) => {
    if (!cat || !cat.idCat) return;
    setSelectedCategory(cat.idCat);
    loadMenusByCategory(cat.idCat);
  };

  const isLoading = menusLoading || categoriesLoading;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1, color: 'primary.main', justifyContent: 'center' }}
        >
          <MenuBookIcon sx={{ fontSize: '2rem' }} />
          Gestion du Menu
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, alignItems: { sm: 'center' } }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher un menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                ),
              }}
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openMenuModal(null)} disabled={isLoading} sx={{ whiteSpace: 'nowrap' }}>
              Ajouter un menu
            </Button>
          </Stack>

          <Box sx={{ display: "flex", gap: 1.5, overflowX: 'auto', pb: 2, flexWrap: 'nowrap', borderBottom: '1px solid', borderColor: 'rgba(248,250,252,0.05)' }}>
            {categories.map((cat) => (
              <Chip
                key={cat.idCat}
                label={cat.name}
                onClick={() => handleCategoryChange(cat)}
                variant={selectedCategory === cat.idCat ? "filled" : "outlined"}
                color={selectedCategory === cat.idCat ? "primary" : "default"}
                clickable
                sx={{ 
                  flexShrink: 0,
                  px: 1,
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
              />
            ))}
          </Box>
        </Box>

        {isLoading && menus.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {menus
              .filter(menu => menu.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((menu, index) => (
                <Grid item xs={12} sm={6} md={3} key={menu.idMenu || index}>
                  <MenuItemComponent menu={menu} onEdit={openMenuModal} />
                </Grid>
              ))
            }
          </Grid>
        )}

        <Modal open={isMenuModalOpen} onClose={closeMenuModal}>
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: { xs: '95%', md: 1000 }, 
            maxHeight: '90vh',
            overflowY: 'auto',
            bgcolor: 'transparent', // On laisse le Paper du MenuForm gérer le fond
            outline: 'none'
          }}>
            <MenuForm existingMenu={currentMenu} onSuccess={closeMenuModal} />
          </Box>
        </Modal>
      </Box>
    </motion.div>
  );
};
export default MenuManager;