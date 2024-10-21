import { GetServerSideProps } from "next";
import nookies from "nookies";
import { ref, get } from "firebase/database";
import { database } from "../firebase/firebase"; // Sesuaikan dengan path firebase Anda
import MainLayout from "@/components/MainLayout";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Papa from "papaparse";

// declare module "jspdf" {

//   interface AutoTableOptions {
//     head?: Array<Array<AutoTableCell>>;
//     body?: Array<Array<AutoTableCell>>;
//     startY?: number;
//     margin?: { horizontal?: number; vertical?: number };
//     theme?: "striped" | "grid" | "plain" | "invert";
//     styles?: {
//       cellPadding?: number;
//       fontSize?: number;
//       overflow?: "linebreak" | "ellipses" | "hidden";
//     };
//     headStyles?: {
//       fillColor?: number[];
//       textColor?: number[];
//     };
//     alternateRowStyles?: {
//       fillColor?: number[];
//     };
//   }

//   // Ini mendefinisikan fungsi autoTable yang menerima jsPDF dan opsi AutoTableOptions
//   export function autoTable(doc: jsPDF, options: AutoTableOptions): void;

//   // Ini juga menambahkan autoTable ke jsPDF
//   interface jsPDF {
//     autoTable: typeof autoTable;
//   }
// }
type AutoTableCell = string | number | null;
interface AutoTableOptions {
  head?: Array<Array<AutoTableCell>>;
  body?: Array<Array<AutoTableCell>>;
  startY?: number;
  margin?: { horizontal?: number; vertical?: number };
  theme?: "striped" | "grid" | "plain" | "invert";
  styles?: {
    cellPadding?: number;
    fontSize?: number;
    overflow?: "linebreak" | "ellipses" | "hidden";
  };
  headStyles?: {
    fillColor?: number[];
    textColor?: number[];
  };
  alternateRowStyles?: {
    fillColor?: number[];
  };
}

import "jspdf-autotable";

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
  const exportToPDF = () => {
    const doc = new jsPDF() as jsPDF & {
      autoTable: (options: AutoTableOptions) => void;
    };

    doc.setFontSize(20);
    doc.text("Log Transaksi", 14, 22);

    const headers = [
      "ID Transaksi",
      "Jumlah",
      "Tanggal",
      "Email",
      "Nama",
      "Telepon",
      "Status",
    ];

    const data = Object.entries(transactions).map(([id, transaction]) => [
      id,
      transaction.amount,
      new Date(transaction.created_at).toLocaleString(),
      transaction.email,
      transaction.name,
      transaction.phone,
      transaction.status,
    ]);

    doc.autoTable({
      head: [headers],
      body: data,
      startY: 30,
      margin: { horizontal: 10 },
      theme: "striped",
      styles: {
        cellPadding: 5,
        fontSize: 10,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    });

    doc.save("log_transaksi.pdf");
  };

  const exportToXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(
      Object.entries(transactions).map(([id, transaction]) => ({
        ID: id,
        Jumlah: transaction.amount,
        Tanggal: new Date(transaction.created_at).toLocaleString(),
        Email: transaction.email,
        Nama: transaction.name,
        Telepon: transaction.phone,
        Status: transaction.status,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transaksi");
    XLSX.writeFile(wb, "log_transaksi.xlsx");
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(
      Object.entries(transactions).map(([id, transaction]) => ({
        ID: id,
        Jumlah: transaction.amount,
        Tanggal: new Date(transaction.created_at).toLocaleString(),
        Email: transaction.email,
        Nama: transaction.name,
        Telepon: transaction.phone,
        Status: transaction.status,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "log_transaksi.csv");
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Log Transaksi</h1>
        <div className="mb-4">
          <button
            onClick={exportToPDF}
            className="mr-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Ekspor PDF
          </button>
          <button
            onClick={exportToXLSX}
            className="mr-2 bg-green-500 text-white px-4 py-2 rounded"
          >
            Ekspor XLSX
          </button>
          <button
            onClick={exportToCSV}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Ekspor CSV
          </button>
        </div>
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
