import { addDoc, collection } from "firebase/firestore";
import { db } from "../components/firebase";

const migrateToFirestore = async () => {
  try {
    // 1. Récupérer tous les produits du backend
    const response = await fetch("http://localhost:3000/products");
    const products = await response.json();

    // 2. Pour chaque produit, l'ajouter à Firestore
    const productsRef = collection(db, "products");

    for (const product of products) {
      await addDoc(productsRef, {
        ...product,
        createdAt: new Date(), // Ajouter un timestamp
        price: Number(product.price), // S'assurer que le prix est un nombre
      });
    }

    console.log(`Migration réussie! ${products.length} produits migrés.`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
    return false;
  }
};

export default migrateToFirestore;
