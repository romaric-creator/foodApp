import React, { useState, useEffect, useMemo } from "react";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../../../services/categoryService";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Modal,
  Backdrop,
  Fade,
  Paper,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Category as CategoryIcon 
} from "@mui/icons-material";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories :", error);
        setNotification({ open: true, message: "Erreur lors du chargement des catégories.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setActionLoading(true);
    try {
      const newCategory = await createCategory({ name: newCategoryName });
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setNotification({ open: true, message: "Catégorie ajoutée avec succès.", severity: "success" });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie :", error);
      setNotification({ open: true, message: "Impossible d'ajouter la catégorie. Veuillez réessayer.", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenConfirmDelete = (category) => {
    setSelectedCategory(category);
    setOpenConfirmDelete(true);
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDelete(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    setActionLoading(true);
    try {
      await deleteCategory(selectedCategory.idCat || selectedCategory.id);
      setCategories(categories.filter((cat) => (cat.idCat || cat.id) !== (selectedCategory.idCat || selectedCategory.id)));
      setNotification({ open: true, message: "Catégorie supprimée avec succès.", severity: "success" });
      handleCloseConfirmDelete();
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie :", error);
      setNotification({ open: true, message: "Impossible de supprimer la catégorie. Veuillez réessayer.", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCategory = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      setEditingCategory(categoryId);
      setNewCategoryName(category.name);
    }
  };

  const handleSaveEdit = async () => {
    if (!newCategoryName.trim() || !editingCategory) return;
    setActionLoading(true);
    try {
      await updateCategory(editingCategory, { name: newCategoryName });
      setCategories(categories.map((cat) => ((cat.idCat || cat.id) === editingCategory ? { ...cat, name: newCategoryName } : cat)));
      setEditingCategory(null);
      setNewCategoryName("");
      setNotification({ open: true, message: "Catégorie modifiée avec succès.", severity: "success" });
    } catch (error) {
      console.error("Erreur lors de la modification de la catégorie :", error);
      setNotification({ open: true, message: "Impossible de modifier la catégorie. Veuillez réessayer.", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', textAlign: 'center', justifyContent: 'center' }}
        >
          <CategoryIcon fontSize="large" color="primary" />
          Gestion des Catégories
        </Typography>
      </Box>

      {/* Section de création et de recherche de catégories */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Nom de la catégorie"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          sx={{ borderRadius: 2 }}
          inputProps={{ 'aria-label': 'Nom de la catégorie' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={editingCategory ? handleSaveEdit : handleAddCategory}
          disabled={actionLoading}
          sx={{ borderRadius: 2, fontWeight: 'bold', minWidth: 120 }}
        >
          {editingCategory ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </Box>
      <TextField
        fullWidth
        variant="outlined"
        label="Rechercher une catégorie"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3, borderRadius: 2 }}
        inputProps={{ 'aria-label': 'Recherche catégorie' }}
      />

      {/* Section de la liste des catégories */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2}>
          {filteredCategories.map((cat) => (
            <Grid item xs={12} sm={6} key={cat.idCat || cat.id}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}>
                <Typography variant="h6" fontWeight="bold" color="primary.main">{cat.name}</Typography>
                <Box>
                  <IconButton color="primary" onClick={() => handleEditCategory(cat.id)} aria-label="Modifier la catégorie">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleOpenConfirmDelete(cat)} aria-label="Supprimer la catégorie">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modals et Snackbar */}
      <Modal open={openConfirmDelete} onClose={handleCloseConfirmDelete} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openConfirmDelete}>
          <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 350, mx: 'auto', mt: 10, textAlign: 'center', boxShadow: 24 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Confirmer la suppression ?</Typography>
            <Button variant="contained" color="error" onClick={handleDeleteCategory} sx={{ mr: 2 }}>Oui, supprimer</Button>
            <Button variant="outlined" onClick={handleCloseConfirmDelete}>Annuler</Button>
          </Paper>
        </Fade>
      </Modal>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={notification.severity} variant="filled" onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryManager;