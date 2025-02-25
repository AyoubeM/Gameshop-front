import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import NavBar from "../NavBar/NavBar";
import "./EditProduct.css";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    categorie: "",
    imageUrl: "",
    server: "",
    subProduct: [],
  });
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({
    email: "",
    password: "",
    additionalInfo: "",
  });

  useEffect(() => {
    const fetchProductAndAccounts = async () => {
      try {
        // Fetch product data
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        }

        // Fetch accounts
        const accountsRef = collection(db, "accounts");
        const q = query(accountsRef, where("productId", "==", productId));
        const accountsSnap = await getDocs(q);
        const accountsData = accountsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAccounts(accountsData);
      } catch (error) {
        console.error("Erreur lors de la récupération:", error);
      }
    };

    fetchProductAndAccounts();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        ...formData,
        price: Number(formData.price),
      });
      alert("Produit mis à jour avec succès!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Erreur lors de la mise à jour du produit");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.email || !newAccount.password) {
      alert("Email et mot de passe sont requis");
      return;
    }

    try {
      const accountsRef = collection(db, "accounts");
      const accountDoc = await addDoc(accountsRef, {
        ...newAccount,
        productId,
        sold: false,
        createdAt: new Date(),
      });

      setAccounts([
        ...accounts,
        { id: accountDoc.id, ...newAccount, sold: false },
      ]);
      setNewAccount({ email: "", password: "", additionalInfo: "" });

      // Mettre à jour le compteur de comptes disponibles
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        accountsAvailable: (formData.accountsAvailable || 0) + 1,
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout du compte:", error);
      alert("Erreur lors de l'ajout du compte");
    }
  };

  return (
    <>
      <NavBar />
      <div className="edit-product-container">
        <h1>Modifier le Produit</h1>
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Nom:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Prix:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Catégorie:</label>
            <input
              type="text"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Image URL:</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Serveur:</label>
            <select
              name="server"
              value={formData.server}
              onChange={handleChange}
            >
              <option value="">Sélectionner un serveur</option>
              <option value="America">America</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="Global">Global</option>
              <option value="Jp">Jp</option>
            </select>
          </div>

          <div className="button-group">
            <button type="submit">Sauvegarder</button>
            <button type="button" onClick={() => navigate("/dashboard")}>
              Annuler
            </button>
          </div>
        </form>

        <div className="accounts-section">
          <h2>Gestion des Comptes</h2>
          <div className="add-account-form">
            <h3>Ajouter un compte</h3>
            <form onSubmit={handleAddAccount}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={newAccount.email}
                  onChange={handleAccountChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe:</label>
                <input
                  type="text"
                  name="password"
                  value={newAccount.password}
                  onChange={handleAccountChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Informations supplémentaires:</label>
                <textarea
                  name="additionalInfo"
                  value={newAccount.additionalInfo}
                  onChange={handleAccountChange}
                />
              </div>
              <button type="submit">Ajouter le compte</button>
            </form>
          </div>

          <div className="accounts-list">
            <h3>Comptes existants</h3>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Mot de passe</th>
                  <th>Statut</th>
                  <th>Info supplémentaires</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className={account.sold ? "sold" : ""}>
                    <td>{account.email}</td>
                    <td>{account.password}</td>
                    <td>{account.sold ? "Vendu" : "Disponible"}</td>
                    <td>{account.additionalInfo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProduct;
