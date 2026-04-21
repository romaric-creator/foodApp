import React, { useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const ClientThemeProvider = ({ children }) => {
  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: 'light',
        primary: { main: "#FF9800" }, // Orange original
        secondary: { main: "#1a202c" },
        background: { default: "#FBFBFB", paper: "#FFFFFF" },
        text: { primary: "#1a202c", secondary: "#6b7280" },
        orange: {
          main: "#FF9800",
          light: "#FFB74D",
          dark: "#EF6C00",
          contrastText: "#FFFFFF",
        },
        red: {
          main: "#F44336",
          light: "#E57373",
          dark: "#D32F2F",
        },
        backgroundPanier: {
          default: "#FBFBFB",
          paper: "#FFFFFF",
        },
      },
      typography: {
        fontFamily: ['"Inter"', 'sans-serif'].join(','),
        h5: { fontWeight: 800, fontSize: "1.8rem" },
        h6: { fontWeight: 700, fontSize: "1.3rem" },
        subtitle1: { fontWeight: 600, fontSize: "1.1rem" },
        body1: { fontSize: "1rem" },
        body2: { fontSize: "0.9rem" },
        button: { fontWeight: 600, textTransform: 'none' }
      },
      shape: {
        borderRadius: 16
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            }
          }
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 50,
              textTransform: 'none',
              fontWeight: 700,
            }
          }
        }
      }
    });
  }, []);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default ClientThemeProvider;
