import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase"; // Sesuaikan path ini
import { getDatabase, ref, get, update } from "firebase/database";
import { useRouter } from "next/router";
import nookies from "nookies"; // Impor nookies
import { v4 as uuidv4 } from "uuid"; // Impor uuid

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Sign in dengan email dan password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Buat deviceToken unik menggunakan uuid
      const deviceToken = uuidv4();

      // Ambil informasi user dari database
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const role = userData.role;

        // Update status login dan deviceToken
        await update(userRef, {
          ...userData, // Pastikan data lama tidak hilang
          isLoggedIn: true, // Set isLoggedIn ke true
          deviceToken, // Tambahkan atau perbarui deviceToken
        });

        // Simpan token ke dalam cookies
        const token = await user.getIdToken(); // Mendapatkan ID token dari user
        nookies.set(null, "token", token, {
          path: "/",
          maxAge: 30 * 24 * 60 * 60, // 30 hari
        });
        nookies.set(null, "role", role, {
          path: "/",
          maxAge: 30 * 24 * 60 * 60, // 30 hari
        });

        // Redirect berdasarkan role
        if (role === "admin" || role === "superadmin") {
          router.push("/dashboard");
        } else {
          router.push("/unauthorized");
        }
      } else {
        console.error("User data not found in database.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-sm mx-auto"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-6"
      />
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
      >
        Login
      </button>
    </form>
  );
};

export default Login;
