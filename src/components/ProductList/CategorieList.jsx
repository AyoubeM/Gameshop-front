import axios from "axios";
import React, { useEffect, useState } from "react";
import NavBar from "../NavBar/NavBar";
import "./CategorieList.css";
import { useNavigate } from "react-router-dom";
import { fetchCategories } from "../../utils/categories";

const CategorieList = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Liste des catégories par défaut

  // Charger les catégories au démarrage
  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    };
    loadCategories();
  }, []); // Ajout de la dépendance vide pour éviter les appels en boucle

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  return (
    <>
      <NavBar />
      <h1>Liste des Jeux</h1>
      <div className="container">
        <div className="row">
          {categories.map((item, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div
                className="card"
                onClick={() => handleCategoryClick(item.name)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body">
                  <h5 className="card-title">{item.name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CategorieList;
