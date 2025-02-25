import React, { useContext, useState } from "react";
import { BsCollectionFill } from "react-icons/bs";
import { FaPlus, FaShoppingCart, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import useAuth from "../hooks/useAuth";
import "./NavBar.css";

const NavBar = () => {
  const { loading, isAdmin } = useAuth();
  const { cart } = useContext(CartContext);
  const [showCartPreview, setShowCartPreview] = useState(false);

  if (loading) {
    return <nav className="navbar">Chargement...</nav>;
  }

  return (
    <nav>
      <div className="logo">
        <Link to="/">GameShop</Link>
      </div>
      <ul className="nav-links">
        {/* {isAdmin && ( */}
        <li className="productform">
          <Link to="/product-form">
            <FaPlus />
          </Link>
        </li>
        {/* )} */}
        <li className="UserLogin">
          <Link to="/login">
            <FaUser />
          </Link>
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
      </ul>
    </nav>
  );
};

export default NavBar;
