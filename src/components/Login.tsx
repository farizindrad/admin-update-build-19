// /components/login.tsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase"; // Sesuaikan path ini
import { getDatabase, ref, get } from "firebase/database";
import { useRouter } from "next/router";
import nookies from "nookies"; // Impor nookies

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Ambil informasi role dari database
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`); // Pastikan path ini sesuai
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const role = userData.role;

        // Simpan token ke dalam cookies
        const token = await user.getIdToken(); // Mendapatkan ID token
        nookies.set(null, "token", token, { path: "/" }); // Menyimpan token ke dalam cookies
        nookies.set(null, "role", role, { path: "/" }); // Menyimpan role ke dalam cookies

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
