// components/Navbar.tsx
import React from "react";
import { useRouter } from "next/router";
import nookies from "nookies";
import { auth } from "../firebase/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";
import { getDatabase, ref, update } from "firebase/database";

const Navbar: React.FC = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const user = auth.currentUser;
      console.log(user);
      if (user) {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        await update(userRef, {
          isLoggedIn: false,
          deviceToken: null,
        });
        console.log("as");
      }

      await firebaseSignOut(auth);
      nookies.destroy(null, "token", { path: "/" });
      nookies.destroy(null, "role", { path: "/" });
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto">
        <button
          onClick={handleSignOut}
          className="text-white hover:bg-gray-700 p-2 rounded"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
