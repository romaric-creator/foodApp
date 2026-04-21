import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Snackbar,
  Alert,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Person as PersonIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { fetchUsers, deleteUser } from "../../../services/userService";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const filteredUsers = users.filter((user) => {
    const nameStr = user.name || "";
    const emailStr = user.email || "";
    return (
      nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
        setNotification({
          open: true,
          message: "Erreur lors du chargement des utilisateurs.",
          severity: "error",
        });
      }
    };
    loadUsers();
    // Refresh toutes les 5 secondes
    const interval = setInterval(loadUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClickDelete = (user) => {
    setUserToDelete(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      const originalUsers = users;
      setUsers(users.filter((u) => (u.idUsers || u.id) !== (userToDelete.idUsers || userToDelete.id)));
      handleCloseDialog();

      try {
        await deleteUser(userToDelete.idUsers || userToDelete.id);
        setNotification({
          open: true,
          message: "Utilisateur supprimé avec succès.",
          severity: "success",
        });
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        setUsers(originalUsers);
        setNotification({
          open: true,
          message: "Erreur lors de la suppression.",
          severity: "error",
        });
      }
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography
        variant="h4"
        align="center"
        sx={{
          mb: 4,
          fontWeight: "bold",
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <PersonIcon fontSize="large" color="primary" />
        Gestion des Utilisateurs
      </Typography>

      <Box sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
        <TextField
          fullWidth
          label="Rechercher un utilisateur (nom ou e-mail)"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {filteredUsers.length === 0 ? (
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mt: 8 }}
        >
          {users.length > 0 && searchQuery
            ? "Aucun utilisateur ne correspond à votre recherche."
            : "Aucun utilisateur trouvé."}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.idUsers || user.id}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  bgcolor: "background.paper",
                  border: "1px solid rgba(248,250,252,0.05)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": { transform: "translateY(-5px)", boxShadow: '0 10px 40px rgba(0,0,0,0.4)', borderColor: 'primary.main' },
                }}
              >
                <Avatar
                  src={user.profileImage || undefined}
                  alt={user.name}
                  sx={{
                    width: 80,
                    height: 80,
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                  }}
                >
                  {!user.profileImage && user.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {user.email}
                </Typography>
                <IconButton
                  color="error"
                  onClick={() => handleClickDelete(user)}
                  aria-label="Supprimer l'utilisateur"
                >
                  <DeleteIcon />
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirmer la suppression"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
            <Typography component="span" fontWeight="bold">
              {userToDelete?.name}
            </Typography>
            ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManager;