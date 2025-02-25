import { doc, getDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";

const useAuth = () => {
  const { user, loading } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user && user.uid) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setIsAdmin(userData.role === "admin");
        }
      } else {
        setIsAdmin(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { user, loading, isAdmin };
};

export default useAuth;
