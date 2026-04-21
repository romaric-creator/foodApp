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
  alpha,
  useTheme,
  Grid
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Restaurant as RestaurantIcon,
  LocalDining as LocalDiningIcon, CheckCircleOutline
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const IngredientsPage = () => {
  const location = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { menuName, ingredients = [], imageUrl } = location.state || {};
  const primaryColor = theme.palette.primary.main;

  return (
    <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Immersif */}
        <Box
          sx={{
            position: "relative",
            height: '40vh',
            background: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "flex-end",
            p: 4,
          }}
        >
          <IconButton
            sx={{
              position: "absolute",
              top: 20,
              left: 20,
              bgcolor: "rgba(255,255,255,0.2)",
              backdropFilter: 'blur(10px)',
              color: 'white',
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box>
             <Typography
              variant="h3"
              sx={{
                color: "white",
                fontWeight: 900,
                letterSpacing: -1,
                mb: 1
              }}
            >
              {menuName || "Le Plat"}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
               <Chip label="Fait Maison" size="small" sx={{ bgcolor: alpha(primaryColor, 0.8), color: 'white', fontWeight: 700 }} />
               <Chip label="Frais" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(5px)' }} />
            </Box>
          </Box>
        </Box>

        <Container maxWidth="xs" sx={{ mt: -4, position: 'relative', zIndex: 2, pb: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '32px',
              bgcolor: "white",
              boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.02)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box sx={{ 
                p: 1, borderRadius: '12px', bgcolor: alpha(primaryColor, 0.1), color: primaryColor,
                display: 'flex', alignItems: 'center'
              }}>
                <RestaurantIcon fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Composition
              </Typography>
            </Box>

            <List sx={{ p: 0 }}>
              {ingredients.length > 0 ? (
                ingredients.map((ingredient, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ListItem
                      sx={{
                        p: 0,
                        mb: 2,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleOutline sx={{ color: primaryColor, fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={ingredient}
                        primaryTypographyProps={{
                          sx: { fontWeight: 600, color: 'text.primary', fontSize: '0.95rem' },
                        }}
                      />
                    </ListItem>
                  </motion.div>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <LocalDiningIcon sx={{ fontSize: 40, opacity: 0.1, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Détails des ingrédients non spécifiés.
                  </Typography>
                </Box>
              )}
            </List>

            <Divider sx={{ my: 3, opacity: 0.5 }} />
            
            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block', fontStyle: 'italic' }}>
              * Nos ingrédients sont sélectionnés chaque matin pour vous garantir une fraîcheur optimale.
            </Typography>
          </Paper>
        </Container>
      </motion.div>
    </Box>
  );
};

import { Chip, Divider } from "@mui/material";

export default IngredientsPage;
