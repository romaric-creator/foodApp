import React, { useMemo, useState, createContext, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { getDashboardTheme, updateDashboardTheme } from '../services/themeService';

export const ThemeSettingsContext = createContext({ customTheme: null, updateTheme: () => {} });

// Base colors for a dark theme
const darkTheme = {
  mode: 'dark',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  background: '#121212',
  surface: '#1e1e1e',
  textPrimary: '#ffffff',
  textSecondary: '#b3b3b3'
};

// Base colors for a light theme
const lightTheme = {
  mode: 'light',
  primary: '#4f46e5',
  secondary: '#6d28d9',
  background: '#f4f6f8',
  surface: '#ffffff',
  textPrimary: '#1a202c',
  textSecondary: '#6b7280'
};

const CustomThemeProvider = ({ children }) => {
  const [customTheme, setCustomTheme] = useState(
    JSON.parse(localStorage.getItem('customTheme')) || darkTheme
  );

  useEffect(() => {
    const fetchAndSetTheme = async () => {
      if (window.location.pathname.includes("dashboard")) {
        try {
          const data = await getDashboardTheme();
          // Choose base theme based on mode from DB or default to dark
          const defaultModeTheme = data && data.mode === 'light' ? lightTheme : darkTheme;
          // Merge database data with the full default theme
          const merged = { ...defaultModeTheme, ...data };
          setCustomTheme(merged);
          localStorage.setItem('customTheme', JSON.stringify(merged));
        } catch (err) {
          console.error("Erreur récupération thème:", err);
          // If fetch fails, fall back to the complete default dark theme
          setCustomTheme(darkTheme);
          localStorage.setItem('customTheme', JSON.stringify(darkTheme));
        }
      }
    };

    fetchAndSetTheme();
  }, []);

  const updateTheme = (newModeOrTheme) => {
    let newTheme;
    if (typeof newModeOrTheme === 'string') {
      newTheme = newModeOrTheme === 'dark' ? darkTheme : lightTheme;
    } else {
      newTheme = { ...customTheme, ...newModeOrTheme };
    }
    
    setCustomTheme(newTheme);
    localStorage.setItem('customTheme', JSON.stringify(newTheme));

    if (window.location.pathname.includes("dashboard")) {
      updateDashboardTheme(newTheme).catch(err => console.error("Erreur mise à jour thème:", err));
    }
  };

  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: customTheme.mode || 'dark',
        primary: { main: customTheme.primary },
        secondary: { main: customTheme.secondary },
        background: { default: customTheme.background, paper: customTheme.surface },
        text: { primary: customTheme.textPrimary, secondary: customTheme.textSecondary },
        // Ajout de la palette spécifique à EcranPanier
        orange: {
          main: "#FF9800", // Orange plus vif pour les actions principales (Checkout)
          light: "#FFB74D",
          dark: "#EF6C00",
          contrastText: "#FFFFFF",
        },
        red: {
          main: "#F44336", // Rouge pour les icônes de suppression
          light: "#E57373",
          dark: "#D32F2F",
        },
        backgroundPanier: {
          default: "#FBFBFB", // Fond général très clair
          paper: "#FFFFFF",   // Fond des cartes et éléments principaux
        },
      },
      typography: {
        // ... (votre configuration de typographie)
        fontFamily: ['"Inter"', 'sans-serif'].join(','), // Utilisation de Inter pour EcranPanier
        h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '0.02em' },
        h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '0.02em' },
        h3: { fontSize: '1.75rem', fontWeight: 600, letterSpacing: '0.02em' },
        h4: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.02em' },
        h5: { fontWeight: 800, fontSize: "1.8rem" }, // Titre du panier
        h6: { fontWeight: 700, fontSize: "1.3rem" }, // Titre des items
        subtitle1: { fontWeight: 600, fontSize: "1.1rem" },
        subtitle2: { fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.02em' },
        body1: { fontSize: "1rem" },
        body2: { fontSize: "0.9rem" },
        button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.02em' }
      },
      shape: {
        borderRadius: 16 // Bordures globalement très arrondies
      },
      components: {
        // ... (vos surcharges de composants)
        MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                '&:hover': {
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                },
                display: 'flex', // Assure le layout flex pour les items du panier
                alignItems: 'center',
                p: 1.5,
                backgroundColor: 'transparent',
                '& .MuiCardContent-root': {
                  backgroundColor: 'inherit'
                }
              }
            }
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none'
              }
            }
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 50, // Boutons très arrondis (pill-shaped)
                textTransform: 'none', // Pas de majuscules automatiques
                fontWeight: 700, // Texte plus gras
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)',
                },
                padding: '12px 24px', // Padding généreux
              },
              containedPrimary: {
                background: 'linear-gradient(45deg, #FF9800 30%, #FF7043 90%)', // Dégradé pour le bouton principal
                '&:hover': {
                  background: 'linear-gradient(45deg, #FB8C00 30%, #F4511E 90%)',
                },
              },
              outlinedPrimary: { // Pour le bouton "Parcourir le menu"
                borderColor: 'orange.light',
                color: 'orange.dark',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.08)',
                  borderColor: 'orange.main',
                },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                transition: 'transform 0.2s, background-color 0.2s',
                '&:active': {
                  transform: 'scale(0.9)',
                },
                // Styles spécifiques pour les boutons +/- dans la carte
                '&.quantity-control-button': {
                  borderRadius: 8, // Carrés arrondis
                  backgroundColor: 'rgba(255, 152, 0, 0.1)', // Fond très léger pour +/-
                  color: 'orange.dark',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                  },
                },
                '&.delete-item-button': {
                  borderRadius: 8,
                  backgroundColor: 'rgba(244, 67, 54, 0.1)', // Fond léger pour supprimer
                  color: 'red.dark',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.2)',
                  },
                }
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                  '& fieldset': {
                    borderWidth: 2
                  },
                  '&:hover fieldset': {
                    borderWidth: 2
                  }
                }
              }
            }
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: 'none'
              }
            }
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                fontWeight: 500
              }
            }
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 12
              }
            }
          },
          MuiSnackbar: {
            styleOverrides: {
              root: {
                '& .MuiAlert-root': {
                  borderRadius: 8
                }
              }
            }
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }
            }
          },
          MuiBottomNavigation: {
            styleOverrides: {
              root: {
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(18, 18, 18, 0.8)'
              }
            }
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundImage: 'none'
              }
            }
          }
      }
    });
  }, [customTheme]);

  return (
    <ThemeSettingsContext.Provider value={{ customTheme, updateTheme }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeSettingsContext.Provider>
  );
};

export default CustomThemeProvider;