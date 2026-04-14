// Importations nécessaires
import React, { useEffect, useState } from "react";
import { fetchCategories } from "../../../services/categoryService";
import {
	Box,
	TextField,
	Button,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Paper,
	Typography,
	Snackbar,
	Alert,
	CircularProgress,
	Grid,
	IconButton,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

// Importation des services et hooks
import { createMenu, updateMenu, deleteMenu } from "../../../services/menuService";
// Upload d'image : pour l'instant, on accepte juste une URL
// TODO: Implémenter un endpoint API pour l'upload d'images
import { useForm } from "../../../hooks/useForm";
import ImageUpload from "./ImageUpload";
import DeleteMenuModal from "./DeleteMenuModal";

// Composant de formulaire
const MenuForm = ({ existingMenu, onSuccess }) => {
	const { values, errors, handleChange, handleSubmit } = useForm(
		{
			name: existingMenu?.name || "",
			description: existingMenu?.description || "",
			price: existingMenu?.price || "",
			categoryId: existingMenu?.idCat || existingMenu?.category_id || "",
		},
		(values) => {
			const errors = {};
			if (!values.name.trim()) errors.name = "Le nom est requis.";
			if (!values.description.trim()) errors.description = "La description est requise.";
			if (!values.price.trim()) errors.price = "Le prix est requis.";
			if (!values.categoryId) errors.categoryId = "La catégorie est requise.";
			if (!existingMenu && !imageFile) errors.imageFile = "Une image est requise.";
			return errors;
		}
	);

	const [idMenu] = useState(existingMenu?.idMenu || existingMenu?.id || "");
	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(existingMenu?.image_url || "");
	const [categories, setCategories] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "error",
	});
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

	// Chargement des catégories
	useEffect(() => {
		const loadCategories = async () => {
			try {
				const data = await fetchCategories();
				setCategories(data);
				if (!existingMenu && data.length > 0 && !values.categoryId) {
					handleChange({ target: { name: "categoryId", value: data[0].idCat || data[0].id } });
				}
			} catch (err) {
				console.error("Erreur lors de la récupération des catégories:", err);
				setSnackbar({
					open: true,
					message: "Erreur lors de la récupération des catégories.",
					severity: "error",
				});
			}
		};

		loadCategories();
	}, [existingMenu, values.categoryId, handleChange]);

	// Gestion du changement d'image
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImageFile(file);
			setImagePreview(URL.createObjectURL(file));
		}
	};

	// Soumission du formulaire
	const submitForm = async (formValues) => {
		setIsLoading(true);

		let imageUrl = existingMenu?.image_url || "";
		if (imageFile) {
			// Convertir l'image en base64 pour le stockage temporaire
			// TODO: Implémenter un endpoint API pour l'upload d'images
			try {
				imageUrl = await new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result);
					reader.onerror = reject;
					reader.readAsDataURL(imageFile);
				});
				setImagePreview(imageUrl);
			} catch (err) {
				console.error("Erreur lors de la conversion de l'image :", err);
				setSnackbar({
					open: true,
					message: "Erreur lors de la conversion de l'image. Utilisez une URL d'image valide.",
					severity: "error",
				});
				setIsLoading(false);
				return;
			}
		}

		const menuData = {
			name: formValues.name.trim(),
			description: formValues.description.trim(),
			price: formValues.price.trim(),
			idCat: formValues.categoryId,
			...(imageUrl ? { image_url: imageUrl } : {}),
		};

		try {
			if (existingMenu) {
				await updateMenu(idMenu, menuData);
				setSnackbar({
					open: true,
					message: "Menu mis à jour avec succès !",
					severity: "success",
				});
			} else {
				await createMenu(menuData);
				setSnackbar({
					open: true,
					message: "Menu créé avec succès !",
					severity: "success",
				});
			}
			onSuccess();
		} catch (error) {
			console.error("Erreur lors de la soumission du menu :", error);
			setSnackbar({
				open: true,
				message: `Erreur lors de la soumission: ${error.message}`,
				severity: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Suppression du menu
	const handleDelete = async () => {
		if (!idMenu) {
			setSnackbar({ open: true, message: "ID de menu manquant pour la suppression.", severity: "error" });
			return;
		}
		setIsLoading(true);
		try {
			await deleteMenu(idMenu);
			setSnackbar({
				open: true,
				message: "Menu supprimé avec succès !",
				severity: "success",
			});
			onSuccess();
			setDeleteModalOpen(false);
		} catch (error) {
			console.error("Erreur lors de la suppression du menu :", error);
			setSnackbar({
				open: true,
				message: "Erreur lors de la suppression.",
				severity: "error",
			});
			setDeleteModalOpen(false);
		} finally {
			setIsLoading(false);
		}
	};

	// Fonctions de gestion du modal
	const handleOpenDeleteModal = () => setDeleteModalOpen(true);
	const handleCloseDeleteModal = () => setDeleteModalOpen(false);

	// La partie Redesign
	return (
		<Paper elevation={4} sx={{
			p: { xs: 2, sm: 4 },
			borderRadius: 4,
			boxShadow: 6,
			bgcolor: 'background.paper',
			width: '100%', // Assurez-vous qu'il prend toute la largeur disponible
			maxWidth: 1400, // Limitez la largeur pour ne pas qu'il soit trop étiré
			mx: 'auto',
			my: 2
		}}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
				<Typography variant="h5" fontWeight="bold" color="primary">
					{existingMenu ? 'Modifier le Menu' : 'Créer un Menu'}
				</Typography>
				{existingMenu && (
					<IconButton
						color="error"
						onClick={handleOpenDeleteModal}
						aria-label="Supprimer le menu"
						disabled={isLoading}
					>
						<DeleteIcon />
					</IconButton>
				)}
			</Box>

			<Grid container spacing={6}>
				{/* Colonne de l'image */}
				<Grid item xs={12} md={6}>
					<ImageUpload
						imagePreview={imagePreview}
						handleImageChange={handleImageChange}
						validationError={errors.imageFile}
					/>
				</Grid>

				{/* Colonne du formulaire */}
				<Grid item xs={12} md={6}>
					<Box component="form" onSubmit={handleSubmit(submitForm)} sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }} autoComplete="off">
						<TextField
							label="Nom du menu"
							name="name"
							value={values.name}
							onChange={handleChange}
							required
							fullWidth
							autoFocus
							error={!!errors.name}
							helperText={errors.name}
						/>
						<TextField
							label="Description"
							name="description"
							value={values.description}
							onChange={handleChange}
							required
							fullWidth
							multiline
							minRows={3}
							error={!!errors.description}
							helperText={errors.description}
						/>
						<TextField
							label="Prix (FCFA)"
							name="price"
							value={values.price}
							onChange={handleChange}
							required
							fullWidth
							type="number"
							inputProps={{ 'min': 0, 'step': 0.01 }}
							error={!!errors.price}
							helperText={errors.price}
						/>
						<FormControl fullWidth required error={!!errors.categoryId}>
							<InputLabel id="select-category-label">Catégorie</InputLabel>
							<Select
								labelId="select-category-label"
								name="categoryId"
								value={values.categoryId}
								label="Catégorie"
								onChange={handleChange}
							>
								{categories.map(cat => (
									<MenuItem key={cat.idCat || cat.id} value={cat.idCat || cat.id}>{cat.name}</MenuItem>
								))}
							</Select>
							{!!errors.categoryId && <Typography color="error" variant="caption">{errors.categoryId}</Typography>}
						</FormControl>

						<Box sx={{ mt: 'auto', pt: 2 }}>
							<Button
								type="submit"
								variant="contained"
								color="primary"
								fullWidth
								sx={{ borderRadius: 2, fontWeight: 'bold', py: 1.5 }}
								disabled={isLoading}
							>
								{isLoading ? <CircularProgress size={22} color="inherit" /> : existingMenu ? 'Enregistrer les modifications' : 'Créer le menu'}
							</Button>
						</Box>
					</Box>
				</Grid>
			</Grid>

			{/* Modal de confirmation de suppression */}
			<DeleteMenuModal
				open={isDeleteModalOpen}
				onClose={handleCloseDeleteModal}
				onConfirm={handleDelete}
				isLoading={isLoading}
			/>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar(s => ({ ...s, open: false }))}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Paper>
	);
};

export default MenuForm;