
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const ClientLayout = ({ cart, setCart }) => {
  return (
    <Box>
      {/* Vous pouvez ajouter ici votre header, nav, etc. */}
      <Outlet />
      {/* Vous pouvez ajouter ici votre footer si nécessaire */}
    </Box>
  );
};

export default ClientLayout;
