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
  const [sortOption, setSortOption] = useState("name-asc");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Check if the category exists
        if (!categoryName) {
          setError("Category not specified");
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

        console.log("Products found:", productsData);
        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error("Error retrieving products:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  const sortProducts = (option) => {
    const [criteria, order] = option.split("-");
    const sortedProducts = [...products].sort((a, b) => {
      if (criteria === "name") {
        return order === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (criteria === "price") {
        return order === "asc" ? a.price - b.price : b.price - a.price;
      } else if (criteria === "date") {
        return order === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
    setProducts(sortedProducts);
  };

  const handleSortChange = (e) => {
    const selectedOption = e.target.value;
    setSortOption(selectedOption);
    sortProducts(selectedOption);
  };

  const handleProductClick = (productId) => {
    navigate(`/product-details/${productId}`);
  };

  if (error) {
    return (
      <div>
        <NavBar />
        <div className="category-container">
          <div className="error">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="category-container">
        <h1>{categoryName}</h1>
        <div className="sort-controls">
          <label htmlFor="sort">Sort by:</label>
          <select id="sort" value={sortOption} onChange={handleSortChange}>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="date-asc">Date (Oldest to Newest)</option>
            <option value="date-desc">Date (Newest to Oldest)</option>
          </select>
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : products.length === 0 ? (
          <div className="no-products">No products found in this category</div>
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
                  <p className="price">${product.price}</p>{" "}
                  {product.server && (
                    <p className="server">Server: {product.server}</p>
                  )}
                  {product.subProduct && product.subProduct.length > 0 && (
                    <div className="sub-products">
                      <h3>Available Versions:</h3>
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
