import { PayPalButtons } from "@paypal/react-paypal-js";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { db } from "../firebase";
import NavBar from "../NavBar/NavBar";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubProduct, setSelectedSubProduct] = useState(null);
  const { addToCart } = useContext(CartContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log("Tentative de récupération du produit avec ID:", productId);

        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        console.log("Document existe ?", productSnap.exists());
        console.log("Données du document:", productSnap.data());

        if (productSnap.exists()) {
          const productData = {
            id: productSnap.id,
            ...productSnap.data(),
          };
          console.log("Données formatées:", productData);
          setProduct(productData);
        } else {
          console.log("Aucun document trouvé avec l'ID:", productId);
          setError("Product not found");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération:", error);
        setError("Error fetching product");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    const itemToAdd = {
      ...product,
      subProduct: selectedSubProduct
        ? [selectedSubProduct]
        : product.subProduct,
    };
    addToCart(itemToAdd);
    alert("Product added to cart!");
  };

  const sendAccountDetails = async (orderData) => {
    try {
      const functions = getFunctions();
      const sendEmailFunction = httpsCallable(functions, "sendAccountEmail");

      // Appeler la fonction Cloud avec l'ID du produit
      const result = await sendEmailFunction({
        to: orderData.payer.email_address,
        productId: product.id,
        orderId: orderData.id,
      });

      if (!result.data.success) {
        throw new Error("Échec de l'envoi du compte");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des détails:", error);
      throw error;
    }
  };

  const handlePaypalMeRedirect = () => {
    const price = selectedSubProduct ? selectedSubProduct.price : product.price;
    const paypalMeUrl = `https://www.paypal.com/paypalme/vinmoha/${price}?choiceType=true`;
    window.location.href = paypalMeUrl;
  };

  const handleFakePayment = () => {
    alert("This is a fictitious payment. Payment process simulated!");
    // Here you can add any additional logic you want to test
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    return <div>Produit non trouvé</div>;
  }

  return (
    <div className="product-details-page">
      <NavBar />
      <div className="product-details-container">
        <div className="product-image-section">
          <img src={product.imageUrl} alt={product.name} />
        </div>
        <div className="product-info-section">
          <h1>{product.name}</h1>
          <p className="price">${product.price}USD</p>

          {/* Sélection du serveur si disponible */}
          {product.server && (
            <div className="server-selection">
              <label>Server</label>
              <select className="server-select">
                <option value={product.server}>{product.server}</option>
              </select>
            </div>
          )}

          {/* Sélection de la version */}
          {product.subProduct && product.subProduct.length > 0 && (
            <div className="version-selection">
              <label>Version</label>
              <select
                className="version-select"
                onChange={(e) => {
                  const selected = product.subProduct.find(
                    (sub) => sub.dlc === e.target.value
                  );
                  setSelectedSubProduct(selected);
                }}
              >
                <option value="">Select version</option>
                {product.subProduct.map((sub, index) => (
                  <option key={index} value={sub.dlc}>
                    {sub.dlc}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantité */}
          <div className="quantity-selection">
            <label>Quantity</label>
            <input type="number" defaultValue="1" min="1" />
          </div>

          <div className="payment-options">
            <PayPalButtons
              style={{
                layout: "vertical",
                color: "blue",
                shape: "rect",
                label: "buynow",
              }}
              createOrder={(data, actions) => {
                const price = selectedSubProduct
                  ? selectedSubProduct.price
                  : product.price;
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: price.toString(),
                      },
                    },
                  ],
                });
              }}
              onApprove={async (data, actions) => {
                try {
                  const order = await actions.order.capture();

                  // Vérifier la disponibilité des comptes avant de créer la commande
                  const accountsRef = collection(db, "accounts");
                  const accountQuery = query(
                    accountsRef,
                    where("productId", "==", product.id),
                    where("sold", "==", false),
                    limit(1)
                  );
                  const accountSnapshot = await getDocs(accountQuery);

                  if (accountSnapshot.empty) {
                    throw new Error("Désolé, ce produit n'est plus disponible");
                  }

                  // Créer la commande
                  const orderRef = collection(db, "orders");
                  const orderDoc = await addDoc(orderRef, {
                    date: new Date(),
                    userEmail: order.payer.email_address,
                    products: [
                      {
                        id: product.id,
                        name: product.name,
                        price: selectedSubProduct
                          ? selectedSubProduct.price
                          : product.price,
                        quantity: 1,
                        version: selectedSubProduct
                          ? selectedSubProduct.dlc
                          : null,
                      },
                    ],
                    total: selectedSubProduct
                      ? selectedSubProduct.price
                      : product.price,
                    status: "completed",
                    paypalOrderId: order.id,
                    payerInfo: {
                      name: `${order.payer.name.given_name} ${order.payer.name.surname}`,
                      email: order.payer.email_address,
                    },
                    accountDelivered: false,
                  });

                  // Envoyer les détails du compte
                  await sendAccountDetails(order);

                  // Marquer la commande comme livrée
                  await updateDoc(orderDoc, {
                    accountDelivered: true,
                  });

                  alert(
                    "Commande effectuée avec succès! Les détails du compte ont été envoyés par email."
                  );
                } catch (error) {
                  console.error("Erreur:", error);
                  alert(
                    error.message ||
                      "Erreur lors de la finalisation de la commande"
                  );
                }
              }}
            />

            <button className="buy-now-btn" onClick={handlePaypalMeRedirect}>
              Buy Now
            </button>

            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>

            <button className="fake-payment-button" onClick={handleFakePayment}>
              Simulate Payment
            </button>
          </div>

          <div className="description">
            <h2>Description</h2>
            <p>{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
