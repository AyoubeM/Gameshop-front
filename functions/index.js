const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configuration de nodemailer avec Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "votre-email@gmail.com", // Remplacez par votre email Gmail
    pass: "votre-mot-de-passe-app", // Remplacez par votre mot de passe d'application
  },
});

// Fonction pour envoyer les emails
const sendEmail = async (to, accountData, orderId) => {
  const mailOptions = {
    from: "votre-email@gmail.com", // Remplacez par votre email Gmail
    to: to,
    subject: `Détails de votre compte - Commande #${orderId}`,
    html: `
      <h2>Merci pour votre achat!</h2>
      <p>Voici les détails de votre compte :</p>
      <ul>
        <li>Email: ${accountData.email}</li>
        <li>Mot de passe: ${accountData.password}</li>
        ${
          accountData.additionalInfo
            ? `<li>Informations supplémentaires: ${accountData.additionalInfo}</li>`
            : ""
        }
      </ul>
      <p>Conservez ces informations en lieu sûr.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Fonction déclenchée lors de l'achat
exports.sendAccountEmail = functions.https.onCall(async (data, context) => {
  const { to, productId, orderId } = data;
  const accountRef = admin.firestore();

  try {
    const result = await accountRef.runTransaction(async (transaction) => {
      // Récupérer un compte non vendu
      const accountsQuery = await accountRef
        .collection("accounts")
        .where("productId", "==", productId)
        .where("sold", "==", false)
        .limit(1)
        .get();

      if (accountsQuery.empty) {
        throw new Error("Aucun compte disponible");
      }

      const accountDoc = accountsQuery.docs[0];
      const accountData = accountDoc.data();

      // Marquer le compte comme vendu
      transaction.update(accountDoc.ref, {
        sold: true,
        soldTo: to,
        soldAt: admin.firestore.FieldValue.serverTimestamp(),
        orderId: orderId,
      });

      // Décrémenter le compteur de comptes disponibles
      const productRef = accountRef.collection("products").doc(productId);
      transaction.update(productRef, {
        accountsAvailable: admin.firestore.FieldValue.increment(-1),
      });

      return accountData;
    });

    // Envoyer l'email avec les détails du compte
    await sendEmail(to, result, orderId);
    return { success: true };
  } catch (error) {
    console.error("Erreur transaction:", error);
    throw new functions.https.HttpsError("aborted", error.message);
  }
});

// Fonction déclenchée lors de la création d'un produit
exports.createAccount = functions.firestore
  .document("products/{productId}")
  .onCreate(async (snap, context) => {
    const product = snap.data();
    if (product.accountDetails) {
      // Stocker les détails du compte dans une collection séparée et sécurisée
      await admin.firestore().collection("accounts").add({
        productId: snap.id,
        email: product.accountDetails.email,
        password: product.accountDetails.password,
        additionalInfo: product.accountDetails.additionalInfo,
        sold: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Supprimer les informations sensibles du produit
      await snap.ref.update({
        "accountDetails.email": "***",
        "accountDetails.password": "***",
      });
    }
  });
