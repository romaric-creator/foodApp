import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ReceiptOutlined as ReceiptIcon,
  TableRestaurantOutlined as TableRestaurantIcon,
  MenuBookOutlined as MenuBookIcon,
  CategoryOutlined as CategoryIcon,
  PeopleOutlined as PeopleIcon,
  Fastfood as FastfoodIcon,
  AccountCircleOutlined as AccountCircleIcon,
  Restaurant as RestaurantIcon,
  Brightness4,
  Brightness7,
  Psychology as AIIcon,
} from "@mui/icons-material";
import { ThemeSettingsContext } from "../../../theme/CustomThemeProvider";
import OrderManager from "../Orders/OrderManager";
import MenuManager from "../Menu/MenuManager";
import CategoryManager from "../Menu/CategoryManager";
import UserManager from "../Users/UserManager";
import ProfileManager from "../Users/ProfileManager";
import QRCodeGenerator from "../Settings/QRCodeGenerator";
import KitchenDashboard from "../../Kitchen/KitchenDashboard";
import AdminAIAssistant from "../AI/AdminAIAssistant";
import AIDashboard from "../AI/AIDashboard";
import MenuResearcher from "../AI/MenuResearcher";
import { useData } from "../../../contexts/AppContext";

const drawerWidth = 260;

export default function Dashboard() {
  const muiTheme = useTheme();
  const { updateTheme } = useContext(ThemeSettingsContext);
  const darkMode = muiTheme.palette.mode === "dark";
  const { menus, loadMenus } = useData();

  const [activeSection, setActiveSection] = useState("1");
  const [commandeError, setCommandeError] = useState("");
  const [commandeSuccess, setCommandeSuccess] = useState("");
  const [menuMap, setMenuMap] = useState({});

  useEffect(() => {
    // Build menu map from context
    if (menus && menus.length > 0) {
      const newMenuMap = menus.reduce((acc, menu) => {
        acc[menu.idMenu] = menu.name;
        return acc;
      }, {});
      setMenuMap(newMenuMap);
    } else {
      loadMenus();
    }
  }, [menus, loadMenus]);

  const toggleTheme = () => {
    const newMode = darkMode ? "light" : "dark";
    updateTheme(newMode);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "1":
        return (
          <OrderManager
            setCommandeSuccess={setCommandeSuccess}
            setCommandeError={setCommandeError}
            menuMap={menuMap}
          />
        );
      case "2":
        return <KitchenDashboard />;
      case "3":
        return <QRCodeGenerator />;
      case "4":
        return <MenuManager />;
      case "5":
        return <CategoryManager />;
      case "6":
        return <UserManager />;
      case "8":
        return <ProfileManager />;
      case "9":
        return <AIDashboard />;
      case "10":
        return <MenuResearcher />;
      default:
        return (
          <OrderManager
            setCommandeSuccess={setCommandeSuccess}
            setCommandeError={setCommandeError}
            menuMap={menuMap}
          />
        );
    }
  };

  const navItems = [
    { id: "1", text: "Commandes", icon: <ReceiptIcon /> },
    { id: "2", text: "Cuisine", icon: <RestaurantIcon /> },
    { id: "3", text: "Tables", icon: <TableRestaurantIcon /> },
    { id: "4", text: "Menu", icon: <MenuBookIcon /> },
    { id: "5", text: "Catégories", icon: <CategoryIcon /> },
    { id: "6", text: "Utilisateurs", icon: <PeopleIcon /> },
    { id: "9", text: "Gourmi IQ", icon: <AIIcon /> },
    { id: "8", text: "Profil", icon: <AccountCircleIcon /> },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: muiTheme.zIndex.drawer + 1,
          bgcolor: "#1E293B",
          borderBottom: `1px solid rgba(248,250,252,0.05)`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FastfoodIcon
              sx={{
                mr: 1,
                fontSize: 32,
                color: "primary.main",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: "white",
                letterSpacing: "-1px",
                fontSize: '1.4rem'
              }}
            >
              GOURMI<span style={{ color: '#FB923C' }}>.</span>
            </Typography>
          </Box>
          <Tooltip title="Changer de thème">
            <IconButton onClick={toggleTheme} sx={{ color: 'rgba(248,250,252,0.5)' }}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#1E293B",
            borderRight: `1px solid rgba(248,250,252,0.05)`,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", py: 2 }}>
          <Typography
            variant="overline"
            sx={{ px: 2, py: 1, color: "text.secondary", fontWeight: "bold" }}
          >
            NAVIGATION
          </Typography>
          <List sx={{ mt: 1, px: 1 }}>
            {navItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={activeSection === item.id}
                  onClick={() => setActiveSection(item.id)}
                  sx={{
                    borderRadius: '0 12px 12px 0',
                    my: 0.5,
                    mr: 2,
                    ml: 0,
                    py: 1.4,
                    pl: 3,
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    borderLeft: activeSection === item.id ? '4px solid #FB923C' : '4px solid transparent',
                    "&.Mui-selected": {
                      bgcolor: "rgba(251,146,60,0.12)",
                      color: "#FB923C",
                      "& .MuiListItemIcon-root": {
                        color: "#FB923C",
                      },
                      "&:hover": {
                        bgcolor: "rgba(251,146,60,0.18)",
                      },
                    },
                    "&:hover": {
                      bgcolor: "rgba(248,250,252,0.05)",
                      "& .MuiListItemIcon-root": {
                        color: "white",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: activeSection === item.id ? "#FB923C" : "rgba(248,250,252,0.4)",
                    }}
                  >
                    {React.cloneElement(item.icon, { sx: { fontSize: 22 } })}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.92rem',
                      fontWeight: activeSection === item.id ? 900 : 500,
                      letterSpacing: -0.3,
                      color: activeSection === item.id ? 'white' : 'inherit'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2, mx: 2 }} />
          <Box sx={{ px: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{ color: "text.secondary", mb: 1 }}
            >
              Bienvenue, Admin
            </Typography>
            <Typography variant="caption" sx={{ color: "text.disabled" }}>
              Tableau de bord de gestion
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          pt: 8,
          bgcolor: "#1A1C1E",
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {renderContent()}
      </Box>

      {/* Notifications */}
      <Snackbar
        open={Boolean(commandeSuccess)}
        autoHideDuration={6000}
        onClose={() => setCommandeSuccess("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setCommandeSuccess("")}
          severity="success"
          variant="filled"
        >
          {commandeSuccess}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(commandeError)}
        autoHideDuration={6000}
        onClose={() => setCommandeError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setCommandeError("")}
          severity="error"
          variant="filled"
        >
          {commandeError}
        </Alert>
      </Snackbar>
    </Box>
  );
}