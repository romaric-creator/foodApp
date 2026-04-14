import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
} from "@mui/icons-material";

const TableList = ({ tables, loading, handleOpenQRModal, handleOpenDeleteModal }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
        Tables existantes
      </Typography>
      {loading ? (
        <CircularProgress sx={{ mx: "auto", my: 4 }} />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell align="center">QR Code</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tables.map((table) => (
                <TableRow key={table.id || table.idTab}>
                  <TableCell>{table.nom}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleOpenQRModal(table)} aria-label="Voir QR Code">
                      <QrCodeIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => handleOpenDeleteModal(table)} aria-label="Supprimer Table">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default TableList;
