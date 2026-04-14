import React, { useContext } from "react";
import { Snackbar, Alert, Slide } from "@mui/material";
import { FeedbackContext } from "../contexts/FeedbackContext";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedbackSnackbar() {
  const { feedback, closeFeedback } = useContext(FeedbackContext);

  return (
    <AnimatePresence>
      {feedback.open && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{ position: "fixed", bottom: 24, left: 0, right: 0, zIndex: 1400, display: "flex", justifyContent: "center" }}
        >
          <Snackbar
            open={feedback.open}
            autoHideDuration={3500}
            onClose={closeFeedback}
            TransitionComponent={(props) => <Slide {...props} direction="up" />}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={closeFeedback}
              severity={feedback.severity}
              variant="filled"
              sx={{ minWidth: 280, fontWeight: "bold", fontSize: 16, borderRadius: 2 }}
            >
              {feedback.message}
            </Alert>
          </Snackbar>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
