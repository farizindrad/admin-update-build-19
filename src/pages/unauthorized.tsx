// /pages/unauthorized.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Unauthorized = () => {
  const [countdown, setCountdown] = useState(3); // Timer awal 3 detik
  const router = useRouter();

  useEffect(() => {
    // Mengatur timer untuk countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer); // Stop timer jika countdown selesai
          router.push("/"); // Redirect ke halaman login
          return 0; // Reset countdown ke 0
        }
        return prev - 1; // Kurangi countdown
      });
    }, 1000); // Update setiap detik

    // Cleanup timer jika komponen unmount
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Unauthorized Access</h1>
        <p className="mt-4 text-lg text-gray-700">
          Kamu tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <p className="mt-4 text-lg text-gray-700">
          Kamu akan diarahkan ke halaman login dalam {countdown} detik.
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
