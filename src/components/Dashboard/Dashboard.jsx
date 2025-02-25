import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { migrateCategories } from "../../utils/categories";
import migrateToFirestore from "../../utils/migrateToFirestore";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import NavBar from "../NavBar/NavBar";
import "./Dashboard.css";

const exportOrdersToCSV = async () => {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Date,Client,Email,Total,Statut\n";

    querySnapshot.forEach((doc) => {
      const order = doc.data();
      const date = order.date?.toDate().toLocaleString() || "N/A";
      const client = order.payerInfo?.name || "Inconnu";
      const email = order.payerInfo?.email || "Inconnu";
      const total = order.total ? `$${order.total.toFixed(2)}` : "0";
      const status = order.status || "En attente";

      csvContent += `${doc.id},${date},${client},${email},${total},${status}\n`;
    });

    // Création d'un fichier CSV téléchargeable
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historique_commandes.csv");
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error("Erreur lors de l'exportation des commandes :", error);
    alert("Échec de l'exportation des commandes.");
  }
};

const Dashboard = () => {
  const { isAdmin } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [newCategory, setNewCategory] = useState("");
  const [dashboardCategories, setDashboardCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "orders") {
        fetchOrders();
      } else if (activeTab === "products") {
        fetchProducts();
      } else if (activeTab === "categories") {
        loadCategories();
      } else if (activeTab === "accounts") {
        fetchProductsWithAccounts();
      }
    }
  }, [isAdmin, activeTab]);

  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);

      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate().toLocaleString(),
      }));

      setOrders(ordersData);
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, "products");
      const querySnapshot = await getDocs(productsRef);
      const productsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // S'assurer que toutes les propriétés nécessaires existent
        return {
          id: doc.id,
          name: data.name || "",
          price: data.price || 0,
          description: data.description || "",
          categorie: data.categorie || "",
          imageUrl: data.imageUrl || "",
          server: data.server || "",
          subProduct: Array.isArray(data.subProduct) ? data.subProduct : [],
          createdAt: data.createdAt || new Date(),
        };
      });
      console.log("Produits récupérés:", productsData);
      setProducts(productsData);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesRef = collection(db, "categories");
      const snapshot = await getDocs(categoriesRef);
      const categoriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDashboardCategories(categoriesData);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  const fetchAccounts = async (productId) => {
    try {
      console.log("Fetching accounts for product:", productId);
      const accountsRef = collection(db, "accounts");
      const q = query(
        accountsRef,
        where("productId", "==", productId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      console.log("Found accounts:", snapshot.size);

      const accountsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleString(),
      }));

      setAccounts(accountsData);

      const availableAccounts = accountsData.filter((acc) => !acc.sold).length;
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        accountsAvailable: availableAccounts,
      });

      setProducts(
        products.map((p) =>
          p.id === productId
            ? { ...p, accountsAvailable: availableAccounts }
            : p
        )
      );
    } catch (error) {
      console.error("Erreur lors du chargement des comptes:", error);
    }
  };

  const handleMigration = async () => {
    if (
      window.confirm("Voulez-vous migrer tous les produits vers Firestore?")
    ) {
      const success = await migrateToFirestore();
      if (success) {
        alert("Migration réussie!");
      } else {
        alert("Erreur lors de la migration");
      }
    }
  };

  const handleCategoriesMigration = async () => {
    if (window.confirm("Voulez-vous migrer les catégories vers Firestore?")) {
      const success = await migrateCategories();
      if (success) {
        alert("Catégories migrées avec succès!");
      } else {
        alert("Erreur lors de la migration des catégories");
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const categoriesRef = collection(db, "categories");
      await addDoc(categoriesRef, {
        name: newCategory.trim(),
        createdAt: new Date(),
      });
      setNewCategory("");
      loadCategories(); // Recharger les catégories
      alert("Catégorie ajoutée avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
      alert("Erreur lors de l'ajout de la catégorie");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")
    ) {
      try {
        await deleteDoc(doc(db, "categories", categoryId));
        loadCategories(); // Recharger les catégories
        alert("Catégorie supprimée avec succès!");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression de la catégorie");
      }
    }
  };

  const handleDelete = async (productId) => {
    if (!productId) {
      console.error("ID du produit manquant");
      return;
    }

    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        // D'abord, supprimer tous les comptes associés
        const accountsRef = collection(db, "accounts");
        const q = query(accountsRef, where("productId", "==", productId));
        const accountsSnap = await getDocs(q);

        const batch = writeBatch(db);
        accountsSnap.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        // Ensuite, supprimer le produit
        const productRef = doc(db, "products", productId);
        await deleteDoc(productRef);

        // Rafraîchir la liste des produits
        fetchProducts();

        console.log("Produit et comptes associés supprimés avec succès");
        alert("Produit et comptes associés supprimés avec succès!");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      fetchOrders(); // Recharger la liste des commandes
      alert("Statut de la commande mis à jour avec succès!");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  const handleViewOrderDetails = (order) => {
    // Implement the logic to view order details
    console.log("View order details:", order);
  };

  const updateProductAccountCount = async (productId) => {
    try {
      const accountsRef = collection(db, "accounts");
      const q = query(
        accountsRef,
        where("productId", "==", productId),
        where("sold", "==", false)
      );
      const snapshot = await getDocs(q);

      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        accountsAvailable: snapshot.size,
      });

      // Mettre à jour l'état local
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, accountsAvailable: snapshot.size } : p
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du compteur:", error);
    }
  };

  const fetchProductsWithAccounts = async () => {
    try {
      // D'abord, récupérer tous les produits
      const productsRef = collection(db, "products");
      const productsSnap = await getDocs(productsRef);
      const productsData = productsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Récupérer tous les comptes
      const accountsRef = collection(db, "accounts");
      const accountsSnap = await getDocs(accountsRef);
      const accountsData = accountsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Grouper les comptes par productId
      const accountsByProduct = accountsData.reduce((acc, account) => {
        if (account.productId) {
          if (!acc[account.productId]) {
            acc[account.productId] = [];
          }
          acc[account.productId].push(account);
        }
        return acc;
      }, {});

      // Mettre à jour les produits avec leurs comptes
      const updatedProducts = productsData.map((product) => {
        const productAccounts = accountsByProduct[product.id] || [];
        const availableAccounts = productAccounts.filter(
          (account) => !account.sold
        ).length;

        return {
          ...product,
          accountsAvailable: availableAccounts,
          accounts: productAccounts,
        };
      });

      console.log("Produits avec leurs comptes:", updatedProducts);
      setProducts(updatedProducts);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des produits et comptes:",
        error
      );
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === "accounts" && selectedProductId) {
      fetchAccounts(selectedProductId);
    }
  }, [isAdmin, activeTab, selectedProductId]);

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return (
          <div className="orders-section">
            <h2>Historique des Commandes</h2>
            <div className="orders-list">
              <button onClick={exportOrdersToCSV} className="export-btn">
                📥 Exporter en CSV
              </button>

              {orders.length === 0 ? (
                <p className="no-orders">Aucune commande trouvée</p>
              ) : (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Produits</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Livraison</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.date}</td>
                        <td>
                          <div className="client-info">
                            <span>{order.payerInfo?.name}</span>
                            <span className="client-email">
                              {order.payerInfo?.email}
                            </span>
                          </div>
                        </td>
                        <td>
                          <ul className="products-list">
                            {order.products.map((product, index) => (
                              <li key={index}>
                                {product.name}
                                {product.version && ` (${product.version})`}
                                <span className="product-details">
                                  ${product.price} x {product.quantity}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td>${order.total.toFixed(2)}</td>
                        <td>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.id, e.target.value)
                            }
                            className={`status-select ${order.status.toLowerCase()}`}
                          >
                            <option value="pending">En attente</option>
                            <option value="processing">En cours</option>
                            <option value="completed">Terminée</option>
                            <option value="cancelled">Annulée</option>
                          </select>
                        </td>
                        <td>
                          <span
                            className={`delivery-status ${
                              order.accountDelivered ? "delivered" : "pending"
                            }`}
                          >
                            {order.accountDelivered
                              ? "Compte livré"
                              : "En attente de livraison"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="view-details-btn"
                            onClick={() => handleViewOrderDetails(order)}
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      case "products":
        return (
          <div className="products-section">
            <h2>Gestion des Produits</h2>
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img
                      src={product.imageUrl || "/default-product.jpg"}
                      alt={product.name}
                    />
                  </div>
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p className="price">${product.price}</p>
                    <p className="description">{product.description}</p>
                    <p className="category">Catégorie: {product.categorie}</p>
                  </div>
                  <div className="product-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(product.id)}
                    >
                      Modifier
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(product.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "categories":
        return (
          <div className="categories-section">
            <h2>Gestion des Catégories</h2>
            <div className="categories-container">
              <div className="categories-form-section">
                <h3>Ajouter une nouvelle catégorie</h3>
                <form
                  onSubmit={handleAddCategory}
                  className="add-category-form"
                >
                  <div className="input-group">
                    <label htmlFor="category-name">Nom du jeu:</label>
                    <input
                      id="category-name"
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Ex: Genshin Impact"
                      required
                    />
                  </div>
                  <button type="submit" className="add-button">
                    <i className="fas fa-plus"></i> Ajouter
                  </button>
                </form>
              </div>

              <div className="categories-list-section">
                <h3>Catégories existantes</h3>
                <div className="categories-list">
                  {dashboardCategories.map((category) => (
                    <div key={category.id} className="category-item">
                      <div className="category-info">
                        <span className="category-name">{category.name}</span>
                        <span className="category-date">
                          {new Date(
                            category.createdAt?.toDate()
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Voulez-vous vraiment supprimer la catégorie "${category.name}" ?`
                            )
                          ) {
                            const categoryRef = doc(
                              db,
                              "categories",
                              category.id
                            );
                            deleteDoc(categoryRef)
                              .then(() => {
                                loadCategories(); // Recharger la liste
                                alert("Catégorie supprimée avec succès");
                              })
                              .catch((error) => {
                                console.error(
                                  "Erreur lors de la suppression:",
                                  error
                                );
                                alert(
                                  "Erreur lors de la suppression de la catégorie"
                                );
                              });
                          }
                        }}
                        className="delete-btn"
                        title="Supprimer la catégorie"
                      >
                        Remove
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "accounts":
        return (
          <div className="accounts-section">
            <h2>Gestion des Comptes</h2>
            <div className="accounts-container">
              <div className="products-list">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`product-item ${
                      selectedProductId === product.id ? "selected" : ""
                    }`}
                    onClick={() => {
                      console.log("Selecting product:", product.id);
                      setSelectedProductId(product.id);
                    }}
                  >
                    <div className="product-info">
                      <img src={product.imageUrl} alt={product.name} />
                      <div className="product-text">
                        <h3>{product.name}</h3>
                        <p>
                          Comptes disponibles: {product.accountsAvailable || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedProductId && (
                <div className="accounts-list">
                  <h3>Comptes du produit ({accounts.length} total)</h3>
                  <table className="accounts-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Mot de passe</th>
                        <th>Statut</th>
                        <th>Vendu à</th>
                        <th>Date de vente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center" }}>
                            Aucun compte trouvé
                          </td>
                        </tr>
                      ) : (
                        accounts.map((account) => (
                          <tr
                            key={account.id}
                            className={account.sold ? "sold" : ""}
                          >
                            <td>{account.email}</td>
                            <td>{account.password}</td>
                            <td>{account.sold ? "Vendu" : "Disponible"}</td>
                            <td>{account.soldTo || "-"}</td>
                            <td>
                              {account.soldAt
                                ? new Date(
                                    account.soldAt.seconds * 1000
                                  ).toLocaleString()
                                : "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <NavBar />
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        {!isAdmin ? (
          <div className="unauthorized">Accès non autorisé</div>
        ) : (
          <div className="dashboard-layout">
            <div className="sidebar">
              <button
                className={`tab-button ${
                  activeTab === "orders" ? "active" : ""
                }`}
                onClick={() => setActiveTab("orders")}
              >
                Historique des commandes
              </button>
              <button
                className={`tab-button ${
                  activeTab === "products" ? "active" : ""
                }`}
                onClick={() => setActiveTab("products")}
              >
                Gestion des produits
              </button>
              <button
                className={`tab-button ${
                  activeTab === "categories" ? "active" : ""
                }`}
                onClick={() => setActiveTab("categories")}
              >
                Gestion des catégories
              </button>
              <button
                className={`tab-button ${
                  activeTab === "accounts" ? "active" : ""
                }`}
                onClick={() => setActiveTab("accounts")}
              >
                Gestion des comptes
              </button>
            </div>
            <div className="content-area">
              <div className="admin-content">
                <button onClick={handleMigration} className="migrate-button">
                  Migrer les produits vers Firestore
                </button>
                <button
                  onClick={handleCategoriesMigration}
                  className="migrate-button"
                >
                  Migrer les catégories vers Firestore
                </button>
                {renderContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
