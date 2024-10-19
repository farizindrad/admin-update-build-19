import { GetServerSideProps } from "next";
import nookies from "nookies";
import { ref, get } from "firebase/database";
import { database } from "../firebase/firebase"; // Sesuaikan dengan path firebase Anda
import MainLayout from "@/components/MainLayout";

interface Transaction {
  amount: string;
  created_at: number;
  email: string;
  name: string;
  phone: string;
  status: string;
  campaignId?: number;
  updatedAt?: number;
}

interface LogTransactionsPageProps {
  transactions: { [key: string]: Transaction };
}

const LogTransactionsPage = ({ transactions }: LogTransactionsPageProps) => {
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Log Transaksi</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">ID Transaksi</th>
                <th className="border px-4 py-2">Jumlah</th>
                <th className="border px-4 py-2">Tanggal</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Nama</th>
                <th className="border px-4 py-2">Telepon</th>
                <th className="border px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(transactions).map(([id, transaction]) => (
                <tr key={id}>
                  <td className="border px-4 py-2">{id}</td>
                  <td className="border px-4 py-2">{transaction.amount}</td>
                  <td className="border px-4 py-2">
                    {new Date(transaction.created_at).toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">{transaction.email}</td>
                  <td className="border px-4 py-2">{transaction.name}</td>
                  <td className="border px-4 py-2">{transaction.phone}</td>
                  <td className="border px-4 py-2">{transaction.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = nookies.get(context);
  const token = cookies.token;
  const role = cookies.role || "guest";

  if (!token) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (role !== "admin" && role !== "superadmin") {
    return {
      redirect: {
        destination: "/unauthorized",
        permanent: false,
      },
    };
  }

  // Ambil data transaksi dari Firebase
  const transactionsRef = ref(database, "new-transactions"); // Sesuaikan dengan path database Anda
  const snapshot = await get(transactionsRef);
  const transactionsData = snapshot.val() || {};

  return {
    props: { transactions: transactionsData },
  };
};

export default LogTransactionsPage;
