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
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', background: "background.paper", minHeight: 250, position: 'relative' }}>
      <img src={`${menu.image_url}`} alt={menu.name} style={{ width: "100%", height: "auto", maxHeight: 150, objectFit: 'cover', borderRadius: "8px" }} />
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 1 }}>{menu.name}</Typography>
        <Typography variant="body2" color="text.secondary">{menu.price} FCFA</Typography>
      </Box>
      <IconButton aria-label="modifier" onClick={() => onEdit(menu)} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>
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

          <Box sx={{ display: "flex", gap: 1, overflowX: 'auto', pb: 1, flexWrap: 'nowrap', borderBottom: '1px solid', borderColor: 'divider' }}>
            {categories.map((cat) => (
              <Chip
                key={cat.idCat}
                label={cat.name}
                onClick={() => handleCategoryChange(cat)}
                variant={selectedCategory === cat.idCat ? "filled" : "outlined"}
                color={selectedCategory === cat.idCat ? "primary" : "default"}
                clickable
                sx={{ flexShrink: 0 }}
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
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 450 }, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
            <MenuForm existingMenu={currentMenu} onSuccess={closeMenuModal} />
          </Box>
        </Modal>
      </Box>
    </motion.div>
  );
};
export default MenuManager;