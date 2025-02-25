import { PayPalButtons } from "@paypal/react-paypal-js";
import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import NavBar from "../NavBar/NavBar";
import "./ShoppingCart.css";

const ShoppingCart = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const [quantities, setQuantities] = useState(cart.map(() => 1));

  // Calculer le total du panier
  const calculateTotal = () => {
    return cart
      .reduce((total, item, index) => {
        const itemPrice =
          item.subProduct && item.subProduct.length > 0
            ? item.subProduct[0].price
            : item.price;
        return total + parseFloat(itemPrice) * quantities[index];
      }, 0)
      .toFixed(2);
  };

  // Mettre à jour la quantité d'un produit
  const updateQuantity = (index, value) => {
    const newQuantities = [...quantities];
    newQuantities[index] = Math.max(1, parseInt(value) || 1);
    setQuantities(newQuantities);
  };

  const handlePaypalApprove = (data, actions) => {
    return actions.order.capture().then(function (details) {
      alert("Transaction completed by " + details.payer.name.given_name);
      clearCart();
    });
  };

  const createPaypalOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: calculateTotal(),
            currency_code: "EUR",
          },
          payee: {
            email_address: "ayoube.manjal.pro@gmail.com",
          },
          items: cart.map((item, index) => ({
            name: item.name,
            description:
              item.subProduct && item.subProduct.length > 0
                ? item.subProduct[0].dlc
                : "Standard",
            unit_amount: {
              value: (item.subProduct && item.subProduct.length > 0
                ? item.subProduct[0].price
                : item.price
              ).toString(),
              currency_code: "EUR",
            },
            quantity: quantities[index].toString(),
          })),
        },
      ],
    });
  };

  const handlePaypalMeRedirect = () => {
    const total = calculateTotal();
    const paypalMeUrl = `https://www.paypal.com/paypalme/vinmoha/${total}?choiceType=true`;
    window.location.href = paypalMeUrl;
  };

  const handleBuyNow = () => {
    const paypalButtons = document.querySelector(".paypal-buttons");
    if (paypalButtons) {
      paypalButtons.click();
    }
  };

  const handleRemoveItem = (index) => {
    removeFromCart(index);
    const newQuantities = [...quantities];
    newQuantities.splice(index, 1);
    setQuantities(newQuantities);
  };

  return (
    <div className="shopping-cart">
      <NavBar />
      <div className="cart-container">
        <h1>Your Cart</h1>

        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="item-image">
                    <img src={item.imageUrl} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    {item.subProduct && item.subProduct.length > 0 ? (
                      <p className="sub-product">
                        Option: {item.subProduct[0].dlc} - $
                        {item.subProduct[0].price}
                      </p>
                    ) : (
                      <p className="price">${item.price}</p>
                    )}
                    l
                    <div className="quantity-control">
                      <label>Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        value={quantities[index]}
                        onChange={(e) => updateQuantity(index, e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveItem(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="total">
                <h2>Total: ${calculateTotal()}</h2>
              </div>

              <div className="payment-options">
                <button
                  className="buy-now-btn"
                  onClick={handlePaypalMeRedirect}
                >
                  Buy Now
                </button>

                <div className="paypal-buttons-container">
                  <PayPalButtons
                    createOrder={createPaypalOrder}
                    onApprove={handlePaypalApprove}
                    style={{
                      layout: "vertical",
                      color: "blue",
                      shape: "rect",
                      label: "checkout",
                      height: 55,
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
