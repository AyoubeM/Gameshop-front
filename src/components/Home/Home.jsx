import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../index.css";
import { db } from "../firebase";
import NavBar from "../NavBar/NavBar.jsx";
import "./Home.css";

const Home = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestProducts();
  }, []);

  const fetchLatestProducts = async () => {
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, orderBy("createdAt", "desc"), limit(8));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Produits récupérés:", productsData);
      setLatestProducts(productsData);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleProductClick = (productId) => {
    console.log("ID du produit cliqué:", productId);
    navigate(`/product-details/${productId}`);
  };

  return (
    <div>
      <NavBar />
      <main>
        <div className="hero-section">
          <h1>GameShop</h1>
          <p>Find every you want</p>
        </div>

        <section className="latest-products">
          <h2>Derniers Produits</h2>
          <div className="products-slider">
            <div className="products-track">
              {latestProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="product-image">
                    <img
                      src={product.imageUrl || "/default-product.jpg"}
                      alt={product.name}
                    />
                  </div>
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p className="price">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
