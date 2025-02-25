import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../components/firebase";

// Liste des catégories initiales
const initialCategories = [
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

// Fonction pour migrer les catégories vers Firestore
export const migrateCategories = async () => {
  try {
    const categoriesRef = collection(db, "categories");

    for (const categoryName of initialCategories) {
      await addDoc(categoriesRef, {
        name: categoryName,
        createdAt: new Date(),
      });
    }

    console.log("Catégories migrées avec succès!");
    return true;
  } catch (error) {
    console.error("Erreur lors de la migration des catégories:", error);
    return false;
  }
};

// Fonction pour récupérer toutes les catégories
export const fetchCategories = async () => {
  try {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return [];
  }
};
