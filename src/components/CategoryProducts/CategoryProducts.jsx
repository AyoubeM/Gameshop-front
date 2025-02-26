import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import NavBar from "../NavBar/NavBar";
import "./CategoryProducts.css";

const CategoryProducts = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Vérifier si la catégorie existe
        if (!categoryName) {
          setError("Catégorie non spécifiée");
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const productsRef = collection(db, "products");
        const q = query(productsRef, where("categorie", "==", categoryName));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Produits trouvés:", productsData);
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  const handleProductClick = (productId) => {
    navigate(`/product-details/${productId}`);
  };

  if (error) {
    return (
      <div>
        <NavBar />
        <div className="category-container">
          <div className="error">Erreur: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="category-container">
        <h1>{categoryName}</h1>
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            Aucun produit trouvé dans cette catégorie
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
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
                  <h2>{product.name}</h2>
                  <p className="price">${product.price}</p>
                  <p className="description">{product.description}</p>
                  {product.server && (
                    <p className="server">Serveur: {product.server}</p>
                  )}
                  {product.subProduct && product.subProduct.length > 0 && (
                    <div className="sub-products">
                      <h3>Versions disponibles:</h3>
                      <ul>
                        {product.subProduct.map((sub, index) => (
                          <li key={index}>
                            {sub.dlc}: ${sub.price}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
