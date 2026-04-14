import React, { useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  Backdrop,
  Fade,
} from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";

const logoUrl = "/logo512.png";

const QRDisplayModal = ({ open, onClose, selectedTable, qrData }) => {
  const qrRef = useRef(null);

  const handleDownloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector("canvas");
      if (canvas) {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `QRCode_Table_${selectedTable?.idTab || selectedTable?.id}.png`;
        link.click();
      }
    }
  };

  // Utiliser qrData.qrUrl si disponible, sinon fallback
  const qrValue = qrData?.qrUrl || (selectedTable
    ? `${window.location.origin}/client/${selectedTable.idTab || selectedTable.id}`
    : "");

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 300 }}
    >
      <Fade in={open} timeout={300}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            p: 4,
            borderRadius: 3,
            maxWidth: 400,
            bgcolor: "background.paper",
            textAlign: "center",
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            QR Code - Table {selectedTable?.nom}
          </Typography>
          {qrValue && (
            <Box ref={qrRef} sx={{ mb: 2 }}>
              <QRCodeCanvas
                value={qrValue}
                size={256}
                fgColor="black"
                bgColor="white"
                imageSettings={{ src: logoUrl, height: 52, width: 52, excavate: true }}
              />
            </Box>
          )}
          {qrData && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
              Token sécurisé généré le {new Date(qrData.timestamp).toLocaleString()}
            </Typography>
          )}
          <Button variant="contained" onClick={handleDownloadQRCode} fullWidth>
            Télécharger le QR Code
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default QRDisplayModal;
