// App.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Snackbar,
  Alert,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import {
  Fastfood,
  ShoppingCart,
  AccessTime,
  Person,
  Add,
  Remove,
  Delete,
} from "@mui/icons-material";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";
const URL_IMG = "http://localhost:3000";

export default function App() {
  // --- LOGIQUE inchangée ---
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const menusRes = await axios.get(`${API_BASE_URL}/api/menus`);
        const categoriesRes = await axios.get(`${API_BASE_URL}/api/categories`);
        setMenus(menusRes.data.map((m) => ({ ...m, selectionCount: 0 })));
        setCategories(categoriesRes.data);
        setSelectedCategory(categoriesRes.data[0]?.idCat);
      } catch {
        showSnackbar("Erreur lors du chargement", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const addToCart = (menu) => {
    const exists = cart.find((i) => i.idMenu === menu.idMenu);
    if (exists) {
      setCart(
        cart.map((i) =>
          i.idMenu === menu.idMenu ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([...cart, { ...menu, quantity: 1, price: parseFloat(menu.price) }]);
    }
    setMenus(
      menus.map((m) =>
        m.idMenu === menu.idMenu ? { ...m, selectionCount: m.selectionCount + 1 } : m
      )
    );
    showSnackbar(`${menu.name} ajouté au panier`);
  };

  const decreaseItemQuantity = (item) => {
    setCart(
      cart
        .map((i) =>
          i.idMenu === item.idMenu ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const calculateTotal = () =>
    cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);

  const placeOrder = async () => {
    if (!cart.length) {
      showSnackbar("Votre panier est vide", "error");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/commande`, {
        idUsers: 1,
        idtable: 9,
        items: cart.map((i) => ({
          idMenu: i.idMenu,
          quantity: i.quantity,
          price: i.price,
        })),
        status: "En cours",
      });
      showSnackbar("Commande passée !");
      setOrderHistory([...orderHistory, ...cart]);
      setCart([]);
    } catch {
      showSnackbar("Erreur lors de la commande", "error");
    }
  };
  // --- FIN logique ---

  const filteredMenus = menus.filter(
    (m) =>
      (!selectedCategory || m.idCat === selectedCategory) &&
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Rendu des écrans ---
  const renderMenu = () => (
    <Box sx={{ p: 2, pb: 10, bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Typography variant="h6" fontWeight="bold">
        Choose Your Favorite{" "}
        <Box component="span" color="error.main">
          Food
        </Box>
      </Typography>
      <TextField
        fullWidth
        placeholder="Search"
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          mt: 1,
          "& .MuiOutlinedInput-root": { borderRadius: 4 },
        }}
      />

      <Box sx={{ mt: 2, display: "flex", gap: 1, overflowX: "auto" }}>
        {categories.map((cat) => (
          <Button
            key={cat.idCat}
            size="small"
            variant={selectedCategory === cat.idCat ? "contained" : "outlined"}
            color="error"
            onClick={() => setSelectedCategory(cat.idCat)}
            sx={{ borderRadius: 10 }}
          >
            {cat.name}
          </Button>
        ))}
      </Box>

      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress color="error" />
        </Box>
      ) : filteredMenus.length === 0 ? (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          Aucun résultat
        </Typography>
      ) : (
        filteredMenus.map((item) => (
          <Card
            key={item.idMenu}
            sx={{
              mb: 2,
              borderRadius: 4,
              boxShadow: 2,
              overflow: "visible",
            }}
          >
            <CardMedia
              component="img"
              height="180"
              image={`${URL_IMG}/uploads/${item.image_url}`}
              alt={item.name}
              sx={{ objectFit: "cover", borderTopRadius: 4 }}
            />
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {item.description}
              </Typography>
              <Typography variant="h6" color="error.main">
                {item.price}€
              </Typography>
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={() => addToCart(item)}
                sx={{ mt: 1, borderRadius: 10 }}
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );

  const renderCart = () => (
    <Box sx={{ p: 2, pb: 10, bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Typography variant="h6" mb={2}>
        Panier ({cart.length})
      </Typography>
      {!cart.length ? (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          Votre panier est vide.
        </Typography>
      ) : (
        <>
          {cart.map((item, i) => (
            <Card
              key={i}
              sx={{ mb: 2, borderRadius: 4, boxShadow: 2 }}
            >
              <CardMedia
                component="img"
                height="150"
                image={`${URL_IMG}/uploads/${item.image_url}`}
                alt={item.name}
              />
              <CardContent>
                <Typography fontWeight="bold">{item.name}</Typography>
                <Typography color="error.main">{item.price}€</Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <IconButton onClick={() => decreaseItemQuantity(item)}>
                    <Remove />
                  </IconButton>
                  <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                  <IconButton onClick={() => addToCart(item)}>
                    <Add />
                  </IconButton>
                  <IconButton onClick={() => setCart(cart.filter((_, idx) => idx !== i))}>
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>.
            </Card>
          ))}
          <Typography variant="h6">Total : {calculateTotal()}€</Typography>
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={placeOrder}
            sx={{ mt: 2, borderRadius: 10 }}
          >
            Passer la commande
          </Button>
        </>
      )}
    </Box>
  );

  const renderHistory = () => (
    <Box sx={{ p: 2, pb: 10, bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Typography variant="h6" mb={2}>
        Historique
      </Typography>
      {!orderHistory.length ? (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          Aucune commande passée.
        </Typography>
      ) : (
        orderHistory.map((item, i) => (
          <Card key={i} sx={{ mb: 2, borderRadius: 4, boxShadow: 2 }}>
            <CardMedia
              component="img"
              height="150"
              image={`${URL_IMG}/uploads/${item.image_url}`}
              alt={item.name}
            />
            <CardContent>
              <Typography fontWeight="bold">{item.name}</Typography>
              <Typography color="error.main">{item.price}€</Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );

  const renderProfile = () => (
    <Box sx={{ p: 2, pb: 10, bgcolor: "#fafafa", minHeight: "100vh" }}>
      <Typography variant="h6" mb={2}>
        Mon Profil
      </Typography>
      <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
        <CardContent>
          <Typography>Nom : John Doe</Typography>
          <Typography>Email : johndoe@example.com</Typography>
          <Typography>Téléphone : 123-456-7890</Typography>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <>
      {page === 0 && renderMenu()}
      {page === 1 && renderCart()}
      {page === 2 && renderHistory()}
      {page === 3 && renderProfile()}

      <Paper
        sx={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          borderRadius: 8,
          width: "90%",
          boxShadow: 3,
        }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={page}
          onChange={(e, v) => setPage(v)}
          sx={{
            bgcolor: "#fff",
            "& .Mui-selected": { color: "#d32f2f" },
          }}
        >
          <BottomNavigationAction label="Menu" icon={<Fastfood />} />
          <BottomNavigationAction label="Panier" icon={<ShoppingCart />} />
          <BottomNavigationAction label="Historique" icon={<AccessTime />} />
          <BottomNavigationAction label="Profil" icon={<Person />} />
        </BottomNavigation>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ bgcolor: "#d32f2f", color: "#fff" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}