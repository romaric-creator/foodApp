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
} from "@mui/icons-material";
import { ThemeSettingsContext } from "../../../theme/CustomThemeProvider";
import OrderManager from "../Orders/OrderManager";
import MenuManager from "../Menu/MenuManager";
import CategoryManager from "../Menu/CategoryManager";
import UserManager from "../Users/UserManager";
import ProfileManager from "../Users/ProfileManager";
import QRCodeGenerator from "../Settings/QRCodeGenerator";
import KitchenDashboard from "../../Kitchen/KitchenDashboard";
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
          bgcolor: "background.paper",
          borderBottom: `1px solid ${muiTheme.palette.divider}`,
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
                fontWeight: "bold",
                color: "text.primary",
                letterSpacing: "1px",
              }}
            >
              GOURMI
            </Typography>
          </Box>
          <Tooltip title="Changer de thème">
            <IconButton onClick={toggleTheme} color="background.paper">
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
            bgcolor: "background.paper",
            borderRight: `1px solid ${muiTheme.palette.divider}`,
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
                    borderRadius: 2,
                    my: 0.5,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "& .MuiListItemIcon-root": {
                        color: "primary.contrastText",
                      },
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    },
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: "text.secondary",
                      "&.Mui-selected": {
                        color: "primary.contrastText",
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: activeSection === item.id ? "bold" : "regular",
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
          p: 3,
          pt: 10,
          bgcolor: "background.default",
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