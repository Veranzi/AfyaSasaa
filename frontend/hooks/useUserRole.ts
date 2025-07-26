import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";

export function useUserRole(user: User | null) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useUserRole: user", user);
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getDoc(doc(db, "users", user.uid)).then((docSnap) => {
      if (docSnap.exists()) {
        const fetchedRole = docSnap.data().role || null;
        console.log("Fetched role from Firestore:", fetchedRole);
        setRole(fetchedRole);
      } else {
        console.log("No user document found for UID:", user.uid);
        setRole(null);
      }
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    console.log("useUserRole: role", role, "loading", loading);
  }, [role, loading]);

  return { role, loading };
}