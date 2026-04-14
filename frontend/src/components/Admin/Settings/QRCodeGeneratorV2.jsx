import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { SaveAlt as SaveAltIcon, QrCode as QrCodeIcon } from "@mui/icons-material";
import {
  createTable,
  getTables,
  deleteTable,
} from "../../../services/tableService";
import { generateQRCode } from "../../../services/qrcodeService";
import QRDisplayModal from "./QRDisplayModal";
import TableList from "./TableList";

const QRCodeGeneratorV2 = () => {
  const [text, setText] = useState("");
  const [tables, setTables] = useState([]);
  const [openQRModal, setOpenQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await getTables();
      setTables(response);
    } catch {
      setSnackbar({ open: true, message: "Erreur de chargement des tables", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async () => {
    if (!text.trim()) {
      setSnackbar({ open: true, message: "Le nom de la table ne peut pas être vide", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      await createTable({ nom: text });
      setText("");
      await fetchTables();
      setSnackbar({ open: true, message: "Table créée avec succès", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Erreur lors de la création de la table", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQRModal = async (table) => {
    setLoading(true);
    try {
      const qr = await generateQRCode(table.idTab || table.id);
      setQrData(qr);
      setSelectedTable(table);
      setOpenQRModal(true);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || "Erreur lors de la génération du QR Code", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQRModal = () => {
    setOpenQRModal(false);
    setSelectedTable(null);
    setQrData(null);
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
        gap: { xs: 4, md: 8 },
        p: { xs: 2, md: 4 },
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
          Créer une nouvelle table
        </Typography>
        <TextField
          label="Nom de la table"
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveAltIcon />}
          onClick={handleCreateTable}
          disabled={loading}
        >
          Créer
        </Button>
      </Paper>

      <TableList
        tables={tables}
        loading={loading}
        handleOpenQRModal={handleOpenQRModal}
        handleOpenDeleteModal={() => {}}
      />

      <QRDisplayModal
        open={openQRModal}
        onClose={handleCloseQRModal}
        selectedTable={selectedTable}
        qrData={qrData}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QRCodeGeneratorV2;

