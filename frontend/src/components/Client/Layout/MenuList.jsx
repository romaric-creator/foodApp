import React, { useEffect, useState, useMemo, useContext, useCallback } from "react";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  Skeleton,
  Zoom,
  Alert,
  Fab,
} from "@mui/material";
import {
  Restaurant,
  ShoppingCart,
  History as HistoryIcon,
  Person,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import EcranMenu from "../Menu/EcranMenu";
import EcranPanier from "../Cart/EcranPanier";
import EcranHistorique from "../Profile/EcranHistorique";
import EcranProfil from "../Profile/EcranProfil";
import { useApp, useData, useOrders, useNotification } from "../../../contexts/AppContext";

const BOTTOM_NAV_HEIGHT = 64;

export default function MenuList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { idtable } = useParams();

  const { user, isAuthenticated, login, register } = useApp();
  const { menus, categories, tables, loadMenus, loadCategories, loadTables } = useData();
  const { orders: historique, loadOrders, createOrder } = useOrders();
  const { showNotification } = useNotification();

  const [authLoading, setAuthLoading] = useState(false);
  const [categorieSelectionnee, setCategorieSelectionnee] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [debouncedRecherche, setDebouncedRecherche] = useState("");
  const [panier, setPanier] = useState([]);
  const [commandeLoading, setCommandeLoading] = useState(false);
  const [ongletActif, setOngletActif] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const primaryColor = theme.palette.primary.main;

  const toast = useCallback((message, severity = "success") => {
    showNotification(message, severity);
  }, [showNotification]);

  useEffect(() => {
    loadMenus();
    loadCategories();
    loadTables();
  }, []);

  useEffect(() => {
    // On n'initialise plus forcément sur la première catégorie pour permettre de tout voir au départ si besoin
    // Mais si l'utilisateur veut absolument commencer par une catégorie, on garde la logique.
    if (categories?.length > 0 && categorieSelectionnee === null) {
      // Optionnel : décommentez pour forcer la première catégorie au chargement
      // setCategorieSelectionnee(categories[0].idCat);
    }
  }, [categories]);

  useEffect(() => {
    if (user?.id) loadOrders();
  }, [user]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedRecherche(recherche), 300);
    return () => clearTimeout(t);
  }, [recherche]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredMenus = useMemo(
    () => menus.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(debouncedRecherche.toLowerCase());
      const matchesCategory = !categorieSelectionnee || m.idCat === categorieSelectionnee;
      const isAvailable = m.is_available !== false && (m.stock_quantity === undefined || m.stock_quantity > 0);
       return matchesSearch && matchesCategory && isAvailable;
    }),
    [menus, debouncedRecherche, categorieSelectionnee]
  );

  const ajouterAuPanier = item => {
    setPanier(curr => {
      const exists = curr.find(i => i.idMenu === item.idMenu);
      if (exists) return curr.map(i => i.idMenu === item.idMenu ? { ...i, quantite: i.quantite + 1 } : i);
      return [...curr, { ...item, quantite: 1, price: parseFloat(item.price) }];
    });
    toast(`${item.name} ajouté au panier`);
  };

  const modifierQuantite = (item, delta) => {
    setPanier(curr => curr
      .map(i => i.idMenu === item.idMenu ? { ...i, quantite: i.quantite + delta } : i)
      .filter(i => i.quantite > 0)
    );
  };

  const retirerDuPanier = id => setPanier(curr => curr.filter(i => i.idMenu !== id));
  const calculerTotal = () => panier.reduce((s, i) => s + i.price * i.quantite, 0).toFixed(0);

  const passerCommande = async () => {
    if (!isAuthenticated) {
      toast("Veuillez vous connecter pour commander", "info");
      navigate('/client/login');
      return;
    }
    if (!panier.length) return;
    setCommandeLoading(true);
    try {
      const total = panier.reduce((sum, i) => sum + i.price * i.quantite, 0);
      await createOrder({
        idUsers: user.id || user.idUsers,
        idTab: idtable,
        items: panier.map(i => ({ idMenu: i.idMenu, quantite: i.quantite, price: i.price })),
        total
      });
      toast("Commande envoyée en cuisine !");
      setPanier([]);
      loadOrders();
    } catch (error) {
       toast("Une erreur est survenue", "error");
    }
    setCommandeLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.reload();
  };

  const isMenuLoading = !menus || !categories;

  const screens = [
    <EcranMenu key="menu" recherche={recherche} setRecherche={setRecherche} categories={categories} categorieSelectionnee={categorieSelectionnee} setCategorieSelectionnee={setCategorieSelectionnee} chargement={isMenuLoading} filteredMenus={filteredMenus} ajouterAuPanier={ajouterAuPanier} />,
    <EcranPanier key="panier" panier={panier} calculerTotal={calculerTotal} modifierQuantite={modifierQuantite} retirerDuPanier={retirerDuPanier} passerCommande={passerCommande} commandeLoading={commandeLoading} setOngletActif={setOngletActif} ajouterAuPanier={ajouterAuPanier} />,
    <EcranHistorique key="hist" historique={historique} />,
    <EcranProfil key="profil" user={user} onLogout={handleLogout} />
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA' }}>
      <AnimatePresence mode="wait">
        <motion.div
           key={ongletActif}
           initial={{ opacity: 0, x: 10 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -10 }}
           transition={{ duration: 0.3 }}
        >
          {screens[ongletActif]}
        </motion.div>
      </AnimatePresence>

      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: BOTTOM_NAV_HEIGHT + 10,
          zIndex: 2000,
          borderTopLeftRadius: '30px',
          borderTopRightRadius: '30px',
          bgcolor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.05)'
        }}
      >
        <BottomNavigation
          value={ongletActif}
          onChange={(_, v) => setOngletActif(v)}
          showLabels
          sx={{ 
            height: '100%',
            bgcolor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 0',
              color: 'text.secondary',
              '&.Mui-selected': { 
                color: primaryColor,
                '& .MuiBottomNavigationAction-label': { fontWeight: 800, fontSize: '0.7rem' }
              }
            }
          }}
        >
          <BottomNavigationAction label="Menu" icon={<Restaurant />} />
          <BottomNavigationAction 
            label="Panier" 
            icon={
              <Badge 
                badgeContent={panier.length} 
                sx={{ '& .MuiBadge-badge': { bgcolor: primaryColor, color: 'white', fontWeight: 800 } }}
              >
                <ShoppingCart />
              </Badge>
            } 
          />
          <BottomNavigationAction label="Commandes" icon={<HistoryIcon />} />
          <BottomNavigationAction label="Compte" icon={<Person />} />
        </BottomNavigation>
      </Paper>

    </Box>
  );
}
