import React, { useState } from "react";
import { Box, TextField, Button, Paper, Typography, CircularProgress, Snackbar, Alert } from "@mui/material";
import { createUser } from "../../../services/userService";

const UserSignup = () => {
	const [signupName, setSignupName] = useState("");
	const [signupEmail, setSignupEmail] = useState("");
	const [signupPassword, setSignupPassword] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError("");
		try {
			await createUser({
				name: signupName,
				email: signupEmail,
				password: signupPassword,
			});
			setSnackbar({ open: true, message: "Compte créé avec succès !", severity: "success" });
		} catch (err) {
			console.error("Erreur lors de la création du compte:", err);
			setError(err.message || "Erreur lors de la création du compte");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Paper
			sx={{
				p: 3,
				width: "100%",
				borderRadius: 3,
				boxShadow: 3,
				backgroundColor: "background.paper",
			}}
		>
			<Typography variant="h6" sx={{ mb: 2 }}>
				Créer un compte
			</Typography>
			{error && (
				<Typography color="error" sx={{ mb: 2 }}>
					{error}
				</Typography>
			)}
			<Box
				component="form"
				onSubmit={handleSubmit}
				sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
			>
				<TextField
					label="Nom"
					type="text"
					value={signupName}
					onChange={(e) => setSignupName(e.target.value)}
					required
					fullWidth
					sx={{ backgroundColor: "#fff", borderRadius: 1 }}
				/>
				<TextField
					label="Email"
					type="email"
					value={signupEmail}
					onChange={(e) => setSignupEmail(e.target.value)}
					required
					fullWidth
					sx={{ backgroundColor: "#fff", borderRadius: 1 }}
				/>
				<TextField
					label="Mot de passe"
					type="password"
					value={signupPassword}
					onChange={(e) => setSignupPassword(e.target.value)}
					required
					fullWidth
					sx={{ backgroundColor: "#fff", borderRadius: 1 }}
				/>
				<Button
					variant="contained"
					type="submit"
					fullWidth
					sx={{ py: 1.5 }}
					disabled={submitting}
				>
					{submitting ? (
						<CircularProgress size={24} color="inherit" />
					) : (
						"Créer le compte"
					)}
				</Button>
			</Box>
			<Snackbar
				open={snackbar.open}
				autoHideDuration={3000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
			>
				<Alert severity={snackbar.severity} sx={{ width: "100%" }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Paper>
	);
};

export default UserSignup;
