import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebase";
import { getDatabase, ref, onValue, update } from "firebase/database";
import nookies from "nookies";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);

        // Mengamati status login pengguna di Realtime Database
        const unsubscribeStatus = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Jika ada device lain yang aktif
            if (
              data.isLoggedIn &&
              data.deviceToken !== nookies.get(null, "deviceToken")
            ) {
              // Alert di perangkat lama
              alert(
                "You have been logged out from other device as your session has been moved to this device."
              );

              // Logout perangkat ini
              auth.signOut();
              nookies.destroy(null, "token", { path: "/" });
              nookies.destroy(null, "deviceToken", { path: "/" });
              router.push("/"); // Redirect ke halaman login
            }
          }
        });

        // Update status login di database
        const deviceToken = nookies.get(null, "deviceToken");
        update(userRef, {
          isLoggedIn: true,
          deviceToken: deviceToken, // Pastikan untuk menyimpan deviceToken yang baru
        });

        // Clean up listener on component unmount
        return () => {
          unsubscribeStatus();
        };
      }
    });

    // Clean up listener on component unmount
    return () => {
      unsubscribeAuth();
    };
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;
