import React from "react";
import { Box, Card, CardContent, Typography, Avatar, Button } from "@mui/material";

const UserDashboard = ({ user, handleLogout }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Mon Dashboard
      </Typography>
      {user ? (
        <Card sx={{ maxWidth: 400, mx: "auto", mb: 2, p: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Avatar sx={{ width: 80, height: 80, mb: 2 }}>
                {user.name ? user.name.charAt(0) : "U"}
              </Avatar>
              <Typography variant="h6">{user.name}</Typography>
              <Typography color="text.secondary">{user.email}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                ID: {user.id}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Typography>Aucun utilisateur connecté.</Typography>
      )}
      {user && (
        <Button variant="outlined" onClick={handleLogout} fullWidth>
          Logout
        </Button>
      )}
      {/* Utilisation de l'id de l'utilisateur pour la soumission de commande se fait dans MenuList.js */}
    </Box>
  );
};

export default UserDashboard;