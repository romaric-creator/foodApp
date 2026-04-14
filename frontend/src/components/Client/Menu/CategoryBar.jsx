import React from 'react';
import { Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const CategoryBar = ({ categories, selectedCategory, onSelectCategory, theme }) => {
  return (
    <Box
      component={motion.div}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      sx={{
        display: "flex",
        overflowX: "auto",
        gap: 1.5,
        pb: 2,
        px: 2,
        "&::-webkit-scrollbar": { height: 8 },
        "&::-webkit-scrollbar-thumb": {
          background: theme.palette.divider,
          borderRadius: 4,
        },
        height: 70,
        alignItems: "center",
      }}
    >
      {categories.map((category) => (
        <Chip
          key={category.idCat}
          label={category.name}
          onClick={() => onSelectCategory(category.idCat)}
          sx={{
            borderRadius: 24,
            px: 3,
            py: 2.5,
            fontSize: '0.95rem',
            fontWeight: 600,
            textTransform: "uppercase",
            transition: "all 0.3s ease",
            cursor: "pointer",
            boxShadow: selectedCategory === category.idCat 
              ? "0 4px 12px rgba(0,0,0,0.2)" 
              : "0 2px 6px rgba(0,0,0,0.1)",
            backgroundColor: selectedCategory === category.idCat
              ? theme.palette.primary.main
              : "#fff",
            color: selectedCategory === category.idCat
              ? "#fff"
              : theme.palette.text.primary,
            "&:hover": {
              transform: "translateY(-2px)",
              backgroundColor: selectedCategory === category.idCat
                ? theme.palette.primary.dark
                : "#f5f5f5",
            },
          }}
        />
      ))}
    </Box>
  );
};

export default CategoryBar;
