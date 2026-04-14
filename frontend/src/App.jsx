import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from './contexts/AppContext';
import CustomThemeProvider from './theme/CustomThemeProvider';
import Dashboard from './components/Admin/Dashboard/Dashboard';
import AdminLogin from './components/Admin/Auth/AdminLogin';
import MenuList from './components/Client/Layout/MenuList';
import ClientLogin from "./components/Client/Auth/ClientLogin";
import IngredientsPage from "./components/Client/Menu/IngredientsPage";
import DashboardWrapper from "./components/Admin/Dashboard/DashboardWrapper";

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Routes pour la partie admin */}
          <Route
            path="/admin"
            element={
              <CustomThemeProvider>
                <DashboardWrapper>
                  <Dashboard />
                </DashboardWrapper>
              </CustomThemeProvider>
            }
          />

          {/* Routes pour la partie client */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client/:idtable/*" element={<MenuList />} />
          <Route path="/client/:idtable/ingredients/:menuId" element={<IngredientsPage />} />

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;