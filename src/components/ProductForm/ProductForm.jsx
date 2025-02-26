import { addDoc, collection, doc, writeBatch } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { fetchCategories } from "../../utils/categories";
import { db } from "../firebase";
import NavBar from "../NavBar/NavBar";
import "./ProductForm.css";

const ProductForm = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [server, setServer] = useState("");
  const [platform, setPlatform] = useState("");
  const [subProduct, setSubProduct] = useState([{ dlc: "", price: "" }]);
  const [categories, setCategories] = useState([]);
  const [accountDetails, setAccountDetails] = useState({
    email: "",
    password: "",
    recoveryEmail: "",
    additionalInfo: "",
  });
  const [accountBatch, setAccountBatch] = useState("");

  // Charger les catégories au démarrage
  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    };
    loadCategories();
  }, []);

  // Ajouter un sous-produit
  const addSubProduct = () => {
    setSubProduct([...subProduct, { dlc: "", price: "" }]);
  };

  // Supprimer un sous-produit
  const deleteSubProduct = (index) => {
    setSubProduct(subProduct.filter((_, i) => i !== index));
  };

  // Mettre à jour un sous-produit
  const updateSubProduct = (index, field, value) => {
    const updatedSubProduct = subProduct.map((sub, i) =>
      i === index ? { ...sub, [field]: value } : sub
    );
    setSubProduct(updatedSubProduct);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Compter le nombre de comptes valides
      const validAccounts = accountBatch
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const [email, password] = line.split(",");
          return { email: email?.trim(), password: password?.trim() };
        })
        .filter((acc) => acc.email && acc.password);

      // Créer le produit d'abord
      const productsRef = collection(db, "products");
      const productDoc = await addDoc(productsRef, {
        name,
        price: Number(price),
        description,
        categorie: categorie.trim(),
        imageUrl,
        server,
        platform,
        subProduct,
        hasAccount: true,
        accountsAvailable: validAccounts.length,
        createdAt: new Date(),
      });

      // Ensuite, créer les comptes avec la référence au produit
      const batch = writeBatch(db);
      const accountsRef = collection(db, "accounts");

      validAccounts.forEach((account) => {
        const docRef = doc(accountsRef);
        batch.set(docRef, {
          productId: productDoc.id,
          email: account.email,
          password: account.password,
          recoveryEmail: accountDetails.recoveryEmail,
          additionalInfo: accountDetails.additionalInfo,
          server: server,
          platform: platform,
          sold: false,
          createdAt: new Date(),
        });
      });

      await batch.commit();

      // Réinitialiser le formulaire
      setAccountBatch("");
      setAccountDetails({
        email: "",
        password: "",
        recoveryEmail: "",
        additionalInfo: "",
      });
      setSubProduct([{ dlc: "", price: "" }]);
      setName("");
      setPrice("");
      setDescription("");
      setCategorie("");
      setImageUrl("");
      setServer("");
      setPlatform("");

      alert(`Produit ajouté avec succès avec ${validAccounts.length} comptes!`);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'ajout");
    }
  };

  return (
    <>
      <NavBar />
      <h2>Add New Product</h2>
      <div className="container">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="product-name">Name:</label>
            <input
              type="text"
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-server">Server (optional):</label>
            <select
              id="product-server"
              value={server}
              onChange={(e) => setServer(e.target.value)}
            >
              <option value="">Select a server</option>
              <option value="America">America</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="Global">Global</option>
              <option value="Jp">Jp</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="product-price">Price:</label>
            <input
              type="number"
              id="product-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-categorie">Game:</label>
            <select
              id="product-categorie"
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              required
            >
              <option value="">Sélectionner un jeu</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section des versions (anciennement subProduct) */}
          <div className="form-group">
            <label>Versions:</label>
            {subProduct.map((sub, index) => (
              <div key={index} className="sub-product-form">
                <input
                  type="text"
                  placeholder="Version name"
                  value={sub.dlc}
                  onChange={(e) =>
                    updateSubProduct(index, "dlc", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Version price"
                  value={sub.price}
                  onChange={(e) =>
                    updateSubProduct(index, "price", e.target.value)
                  }
                  min="0"
                  step="0.01"
                />
                <button type="button" onClick={() => deleteSubProduct(index)}>
                  Delete
                </button>
              </div>
            ))}
            <button type="button" onClick={addSubProduct}>
              Add Version
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="product-image">Image URL:</label>
            <input
              type="url"
              id="product-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-description">Description:</label>
            <textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              rows="4"
              required
            />
          </div>

          <div className="form-section">
            <h3>Détails du compte</h3>
            <input
              type="text"
              placeholder="Email du compte"
              value={accountDetails.email}
              onChange={(e) =>
                setAccountDetails({ ...accountDetails, email: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Mot de passe"
              value={accountDetails.password}
              onChange={(e) =>
                setAccountDetails({
                  ...accountDetails,
                  password: e.target.value,
                })
              }
            />
            <textarea
              placeholder="Informations supplémentaires"
              value={accountDetails.additionalInfo}
              onChange={(e) =>
                setAccountDetails({
                  ...accountDetails,
                  additionalInfo: e.target.value,
                })
              }
            />
          </div>

          <div className="form-section">
            <h3>Import de comptes en masse</h3>
            <textarea
              placeholder="Format: email,password,info_supplémentaires
exemple1@mail.com,pass123,info1
exemple2@mail.com,pass456,info2"
              value={accountBatch}
              onChange={(e) => setAccountBatch(e.target.value)}
              rows="10"
            />
          </div>

          <div className="form-group">
            <label htmlFor="platform">Platform:</label>
            <input
              type="text"
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="Platform (e.g., PC, PS5, etc.)"
            />
          </div>

          <button type="submit" className="submit-button">
            Add Product
          </button>
        </form>
      </div>
    </>
  );
};

export default ProductForm;
