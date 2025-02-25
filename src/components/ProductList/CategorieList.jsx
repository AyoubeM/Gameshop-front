import axios from "axios";
import React, { useEffect, useState } from "react";
import NavBar from "../NavBar/NavBar";
import "./CategorieList.css";
import { useNavigate } from "react-router-dom";

// ... existing code ...

const CategorieList = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Liste des catégories par défaut
  const defaultCategories = [
    "Jujutsu Kaisen Phantom Parade",
    "Genshin Impact",
    "Honkai: Star Rail",
    "Fate/Grand Order",
    "Dragon Ball Legend",
    "Pokemon TCG Pocket",
    "Yu-Gi-Oh! Duel Links",
    "One Piece Bounty Rush",
    "Dokkan Battle",
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/categories");
        // Combine les catégories de la base de données avec les catégories par défaut
        const dbCategories = response.data;
        const allCategories = [
          ...new Set([
            ...defaultCategories,
            ...dbCategories.map((cat) => cat.name),
          ]),
        ].map((name) => ({
          name,
          description:
            dbCategories.find((cat) => cat.name === name)?.description ||
            "Aucune description disponible",
        }));
        setCategories(allCategories);
      } catch (error) {
        console.error("Erreur lors de la récupération", error);
        // En cas d'erreur, afficher au moins les catégories par défaut
        setCategories(
          defaultCategories.map((name) => ({
            name,
          }))
        );
      }
    };

    fetchCategories();
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
