import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const makeAdmin = async (email) => {
  try {
    // Trouver l'utilisateur par email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await setDoc(
        doc(db, "users", userDoc.id),
        {
          role: "admin",
        },
        { merge: true }
      );
      alert(`${email} is now an admin!`);
    } else {
      alert("User not found");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error making user admin");
  }
};

export default makeAdmin;
