import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import React, { useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AccountManager from "./components/AccountManager";
import AdminSetup from "./components/AdminSetup";
import CategoryProducts from "./components/CategoryProducts/CategoryProducts";
import AuthProvider from "./components/context/AuthContext";
import CartProvider from "./components/context/CartContext";
import Dashboard from "./components/Dashboard/Dashboard";
import EditProduct from "./components/EditProduct/EditProduct";
import Home from "./components/Home/Home";
import LoginPage from "./components/LoginPage/LoginPage";
import ProductDetails from "./components/ProductDetails/ProductDetails";
import ProductForm from "./components/ProductForm/ProductForm";
import CategorieList from "./components/ProductList/CategorieList";
import ProtectedRoute from "./components/ProtectedRoute";
import ShoppingCart from "./components/ShoppingCart/ShopingCart";
import SignUpPage from "./components/SignUpPage/SignUpPage";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <PayPalScriptProvider
          options={{
            "client-id":
              "ASUcf5W_zz8nhZi4sPSHhlQpcPzBLbRocMGCfJxERf0Wr7ql7JQhTIPWHoeGtLJ3p0qf0NGxwmLtEDHc",
            currency: "EUR",
            intent: "capture",
          }}
        >
          <Router>
            <AccountManager isAuthenticated={isAuthenticated} />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product-form" element={<ProductForm />} />
              <Route path="/categorie-list" element={<CategorieList />} />
              <Route
                path="/category/:categoryName"
                element={<CategoryProducts />}
              />
              <Route
                path="/product-details/:productId"
                element={<ProductDetails />}
              />
              <Route path="/shopping-cart" element={<ShoppingCart />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin-setup" element={<AdminSetup />} />
              <Route
                path="/edit-product/:productId"
                element={<EditProduct />}
              />
            </Routes>
          </Router>
        </PayPalScriptProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
