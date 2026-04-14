import React from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Restaurant as RestaurantIcon,
  LocalDining as LocalDiningIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const IngredientsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { menuName, ingredients = [], imageUrl } = location.state || {};

  return (
    <Container maxWidth="md" sx={{ py: 0.3, px: 0.3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={3}
          sx={{
            overflow: "hidden",
            borderRadius: 4,
            bgcolor: "background.paper",
            position: "relative",
            mx: 0,
          }}
        >
          {/* Header avec image */}
          <Box
            sx={{
              position: "relative",
              height: 200,
              background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "flex-end",
              p: 1.5,
            }}
          >
            <Tooltip title="Retour" placement="right">
              <IconButton
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "background.default" },
                }}
                onClick={() => navigate(-1)}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {menuName || "Détails du plat"}
            </Typography>
          </Box>

          {/* Liste des ingrédients */}
          <Box sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "primary.main",
                fontWeight: "bold",
              }}
            >
              <RestaurantIcon />
              Ingrédients
            </Typography>

            <List sx={{ py: 0.5 }}>
              {ingredients.length > 0 ? (
                ingredients.map((ingredient, index) => (
                  <Fade in timeout={300 * (index + 1)} key={index}>
                    <ListItem
                      sx={{
                        bgcolor: "background.default",
                        mb: 0.5,
                        borderRadius: 2,
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "translateX(8px)",
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <LocalDiningIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={ingredient}
                        primaryTypographyProps={{
                          sx: { fontWeight: 500 },
                        }}
                      />
                    </ListItem>
                  </Fade>
                ))
              ) : (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  Aucun ingrédient disponible pour ce plat.
                </Typography>
              )}
            </List>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default IngredientsPage;
