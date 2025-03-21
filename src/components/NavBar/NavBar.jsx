import React, { useContext, useState } from "react";
import { BsCollectionFill } from "react-icons/bs";
import { FaPlus, FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import useAuth from "../hooks/useAuth";
import "./NavBar.css";

const NavBar = () => {
  const { loading, isAdmin } = useAuth();
  const { cart } = useContext(CartContext);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (loading) {
    return <nav className="navbar">Chargement...</nav>;
  }

  return (
    <nav>
      <div className="logo">
        <Link to="/">GameShop</Link>
      </div>
      <ul className="nav-links">
        {isAdmin && (
          <li className="productform">
            <Link to="/product-form">
              <FaPlus />
            </Link>
          </li>
        )}
        <li className="UserLogin">
          {user ? (
            <Link to="/dashboard">Dashboard</Link>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </li>
        <li className="CategorieList">
          <Link to="/categorie-list">
            <BsCollectionFill />{" "}
          </Link>
        </li>
        <li
          className="shoppingCart"
          onMouseEnter={() => setShowCartPreview(true)}
          onMouseLeave={() => setShowCartPreview(false)}
        >
          <Link to="/shopping-cart">
            <FaShoppingCart />
          </Link>
          {showCartPreview && (
            <div className="cart-preview">
              {cart.length === 0 ? (
                <p>Votre panier est vide.</p>
              ) : (
                <ul>
                  {cart.slice(0, 3).map((product, index) => (
                    <li key={index}>
                      {product.name} - €{product.price}
                    </li>
                  ))}
                </ul>
              )}
              {cart.length > 3 && <p>Et plus...</p>}
            </div>
          )}
        </li>
        {user && (
          <li>
            <button onClick={() => logout(navigate)}>Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
