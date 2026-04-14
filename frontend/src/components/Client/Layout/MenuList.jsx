import React, { useEffect, useState, useMemo, useContext, useCallback } from "react";
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Button,
  Badge,
  Skeleton,
  Fade,
  Zoom,
  Alert,
} from "@mui/material";
import {
  Restaurant,
  ShoppingCart,
  History as HistoryIcon,
  Person,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import EcranMenu from "../Menu/EcranMenu";
import EcranPanier from "../Cart/EcranPanier";
import EcranHistorique from "../Profile/EcranHistorique";
import EcranProfil from "../Profile/EcranProfil";
import { useApp, useData, useOrders, useNotification } from "../../../contexts/AppContext";

const BOTTOM_NAV_HEIGHT = 56;

export default function MenuList() {
  const theme = useTheme();
  const { idtable } = useParams();

  // New context hooks
  const { user, isAuthenticated } = useApp();
  const { menus, categories, tables, loadMenus, loadCategories, loadTables } = useData();
  const { orders: historique, loadOrders } = useOrders();
  const { showFeedback } = useNotification();

  // Local states
  const [authLoading, setAuthLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [qrError, setQrError] = useState("");
  const [categorieSelectionnee, setCategorieSelectionnee] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [debouncedRecherche, setDebouncedRecherche] = useState("");
  const [panier, setPanier] = useState([]);
  const [commandeLoading, setCommandeLoading] = useState(false);
  const [ongletActif, setOngletActif] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const toast = useCallback((message, severity = "success") => {
    showFeedback(message, severity);
  }, [showFeedback]);

  // 1. Init user + idtable avec validation token QR
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const timestamp = urlParams.get("t");

    if (idtable) {
      localStorage.setItem("idtable", idtable);
      
      // Simple table validation - check if table exists in loaded tables
      if (tables && tables.length > 0) {
        const tableExists = tables.find(t => (t.idTab || t.id) === parseInt(idtable));
        if (!tableExists) {
          setQrError("Table non trouvée.");
          toast("Table non trouvée.", "error");
          localStorage.removeItem("idtable");
        }
      } else if (tables) {
        // If no tables, try to load them
        loadTables().catch(() => {
          setQrError("Erreur lors de la vérification de la table.");
          toast("Erreur QR.", "error");
          localStorage.removeItem("idtable");
        });
      }
    } else {
      setQrError("ID de table manquant dans l'URL.");
      toast("ID de table manquant dans l'URL.", "error");
      localStorage.removeItem("idtable");
    }
  }, [idtable, toast, tables, loadTables]);

  // 2. Load menus and categories on mount
  useEffect(() => {
    loadMenus();
    loadCategories();
    loadTables();
  }, []);

  // 3. Set initial category once categories are loaded
  useEffect(() => {
    if (categories && categories.length > 0 && !categorieSelectionnee) {
      setCategorieSelectionnee(categories[0].idCat);
    }
  }, [categories, categorieSelectionnee]);

  // 4. Load orders on mount
  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user?.id, loadOrders]);

  // 5. Debounce recherche
  useEffect(() => {
    const t = setTimeout(() => setDebouncedRecherche(recherche), 300);
    return () => clearTimeout(t);
  }, [recherche]);

  // 6. Scroll top
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredMenus = useMemo(
    () => menus.filter(m => m.name.toLowerCase().includes(debouncedRecherche.toLowerCase())),
    [menus, debouncedRecherche]
  );

  const ajouterAuPanier = item => {
    setPanier(curr => {
      const exists = curr.find(i => i.idMenu === item.idMenu);
      if (exists) return curr.map(i => i.idMenu === item.idMenu ? { ...i, quantite: i.quantite + 1 } : i);
      return [...curr, { ...item, quantite: 1, price: parseFloat(item.price) }];
    });
    toast(`${item.name} ajouté`);
  };
  const modifierQuantite = (item, delta) => {
    setPanier(curr => curr
      .map(i => i.idMenu === item.idMenu ? { ...i, quantite: i.quantite + delta } : i)
      .filter(i => i.quantite > 0)
    );
  };
  const retirerDuPanier = id => setPanier(curr => curr.filter(i => i.idMenu !== id));
  const calculerTotal = () => panier.reduce((s, i) => s + i.price * i.quantite, 0).toFixed(2);

  const passerCommande = async () => {
    if (!isAuthenticated) {
      setOngletActif(3);
      setShowLoginForm(true);
      toast("Connectez-vous", "error");
      return;
    }
    if (!panier.length) { toast("Panier vide", "error"); return; }
    setCommandeLoading(true);
    try {
      const total = panier.reduce((sum, i) => sum + i.price * i.quantite, 0);
      // Use the context's order creation method
      const { createOrder } = useOrders();
      await createOrder({
        idUsers: user.id,
        idTab: idtable,
        items: panier.map(i => ({ idMenu: i.idMenu, quantite: i.quantite, price: i.price })),
        total
      });
      toast("Commande réussie");
      setPanier([]);
      loadOrders(); // Reload orders
    } catch (error) {
      console.error("Erreur commande:", error);
      toast("Erreur commande", "error");
    }
    setCommandeLoading(false);
  };

  const handleLogin = async (email, password) => {
    // Login is now handled via useAuth hook
    const { login } = useApp();
    setAuthLoading(true);
    try {
      await login(email, password);
      toast("Connecté");
      setShowLoginForm(false);
    } catch (error) {
      toast("Erreur de connexion", "error");
    }
    setAuthLoading(false);
  };

  const handleSignup = async (name, email, password) => {
    const { register } = useApp();
    setAuthLoading(true);
    try {
      await register(name, email, password);
      toast("Inscription réussie");
      setShowLoginForm(false);
    } catch (error) {
      toast("Erreur lors de l'inscription", "error");
    }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast("Déconnecté");
  };

  // Le chargement de l'écran menu dépend de l'API
  const isMenuLoading = !menus || !categories;

  const screens = [
    <EcranMenu key="menu" theme={theme} recherche={recherche} setRecherche={setRecherche} categories={categories} categorieSelectionnee={categorieSelectionnee} setCategorieSelectionnee={setCategorieSelectionnee} chargement={isMenuLoading} filteredMenus={filteredMenus} ajouterAuPanier={ajouterAuPanier} />,
    <EcranPanier key="panier" panier={panier} calculerTotal={calculerTotal} modifierQuantite={modifierQuantite} retirerDuPanier={retirerDuPanier} passerCommande={passerCommande} commandeLoading={commandeLoading} setOngletActif={setOngletActif} />,
    <EcranHistorique key="hist" historique={historique} />,
    <EcranProfil key="profil" user={user} onLogin={handleLogin} onSignup={handleSignup} authLoading={authLoading} onLogout={handleLogout} />
  ];

  if (qrError) return <Box sx={{ p: 4, textAlign: "center" }}><Alert severity="error">{qrError}</Alert><Button sx={{ mt: 2 }} onClick={() => window.location.reload()}>Réessayer</Button></Box>;
  if (showLoginForm) return (
    <Fade in>
      <div>
        <EcranProfil user={user} onLogin={handleLogin} onSignup={handleSignup} authLoading={authLoading} onCancel={() => setShowLoginForm(false)} />
      </div>
    </Fade>
  );

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'backgroundPanier.default'
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pb: `${BOTTOM_NAV_HEIGHT + 16}px`,
          position: 'relative'
        }}
      >
        <AnimatePresence mode="wait">
          {isMenuLoading && ongletActif === 0 ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Box sx={{ p: 2, mt: '220px' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Box key={i} sx={{ mb: 2, display: 'flex', gap: 2 }}>
                    <Skeleton variant="rectangular" width={130} height={140} sx={{ borderRadius: 4 }} />
                    <Box sx={{ flex: 1, py: 1 }}>
                      <Skeleton variant="text" width="80%" height={30} />
                      <Skeleton variant="text" width="60%" height={20} />
                      <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <Skeleton variant="text" width="30%" height={30} />
                         <Skeleton variant="circular" width={40} height={40} />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key={ongletActif}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {screens[ongletActif]}
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <Paper
        elevation={10}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: BOTTOM_NAV_HEIGHT + 10,
          zIndex: 1000,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: 'hidden',
          bgcolor: 'background.paper'
        }}
      >
        <BottomNavigation
          value={ongletActif}
          onChange={(_, v) => setOngletActif(v)}
          showLabels
          sx={{ 
            height: '100%',
            '& .Mui-selected': { 
              color: theme.palette.orange?.main || '#FF9800',
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 800,
                fontSize: '0.75rem'
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
                sx={{ '& .MuiBadge-badge': { bgcolor: theme.palette.orange?.main || '#FF9800', color: 'white' } }}
              >
                <ShoppingCart />
              </Badge>
            } 
          />
          <BottomNavigationAction label="Historique" icon={<HistoryIcon />} />
          <BottomNavigationAction label="Profil" icon={<Person />} />
        </BottomNavigation>
      </Paper>

      <Zoom in={showScrollTop}>
        <Fab
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          size="small"
          sx={{
            position: 'fixed',
            bottom: BOTTOM_NAV_HEIGHT + 30,
            right: 20,
            zIndex: 999,
            bgcolor: 'white',
            color: theme.palette.orange?.main || '#FF9800',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Zoom>
    </Box>
  );
}
