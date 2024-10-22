import { GetServerSideProps } from "next";
import nookies from "nookies";
import {
  ref,
  get,
  query,
  orderByKey,
  limitToFirst,
  startAt,
} from "firebase/database";
import { database } from "../firebase/firebase"; // Sesuaikan dengan path firebase Anda
import MainLayout from "@/components/MainLayout";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { useState } from "react";

type AutoTableCell = string | number | null | undefined;
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
  totalPages: number;
  currentPage: number;
}

const LogTransactionsPage = ({
  transactions,
  totalPages,
  currentPage,
}: LogTransactionsPageProps & { totalPages: number; currentPage: number }) => {
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterCampaignId, setFilterCampaignId] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<string>("asc");

  const limit = 15;

  // Filter dan sort transactions
  const filterTransactionsByMonth = (transactions: {
    [key: string]: Transaction;
  }) => {
    if (!filterMonth) return transactions;
    const filtered = Object.entries(transactions).filter(([, transaction]) => {
      const transactionDate = new Date(transaction.created_at);
      return transactionDate.getMonth() + 1 === parseInt(filterMonth);
    });
    return Object.fromEntries(filtered);
  };

  const sortTransactions = (transactions: { [key: string]: Transaction }) => {
    const filteredTransactions = filterCampaignId
      ? Object.entries(transactions).filter(
          ([, transaction]) =>
            transaction.campaignId !== undefined &&
            transaction.campaignId !== null
        )
      : Object.entries(transactions);

    const sorted = filteredTransactions.sort(([, a], [, b]) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "status") {
        return sortOrder === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      if (sortBy === "campaign id") {
        const campaignA = a.campaignId ?? Number.MAX_SAFE_INTEGER;
        const campaignB = b.campaignId ?? Number.MAX_SAFE_INTEGER;
        return sortOrder === "asc"
          ? campaignA - campaignB
          : campaignB - campaignA;
      }
      return 0;
    });

    return Object.fromEntries(sorted);
  };

  const paginatedTransactions = sortTransactions(
    filterTransactionsByMonth(transactions)
  );

  const filteredTransactions = sortTransactions(
    filterTransactionsByMonth(paginatedTransactions)
  );

  // Fungsi untuk menangani perubahan sortBy
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  // Fungsi untuk menangani perubahan urutan
  const handleSortOrderChange = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const exportToPDF = () => {
    const doc = new jsPDF() as jsPDF & {
      autoTable: (options: AutoTableOptions) => void;
    };

    doc.setFontSize(20);
    doc.text("Log Transaksi", 14, 22);

    const headers = [
      "ID Transaksi",
      "CampaignId",
      "Jumlah",
      "Tanggal",
      "Email",
      "Nama",
      "Telepon",
      "Status",
    ];

    const data = Object.entries(filteredTransactions).map(
      ([id, transaction]) => [
        id,
        transaction.campaignId,
        transaction.amount,
        new Date(transaction.created_at).toLocaleString(),
        transaction.email,
        transaction.name,
        transaction.phone,
        transaction.status,
      ]
    );

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
      Object.entries(filteredTransactions).map(([id, transaction]) => ({
        ID: id,
        Campaign_Id: transaction.campaignId,
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
      Object.entries(filteredTransactions).map(([id, transaction]) => ({
        ID: id,
        Campaign_Id: transaction.campaignId,
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

        {/* Tabel Transaksi */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">ID Transaksi</th>
                <th className="border px-4 py-2">Campaign Id</th>
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
                  <td className="border px-4 py-2">{transaction.campaignId}</td>
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

        {/* Pagination */}
        <div className="mt-4">
          {/* Tautan ke halaman sebelumnya */}
          {currentPage > 1 && (
            <a href={`?page=${currentPage - 1}`} className="mr-2 text-blue-600">
              Previous
            </a>
          )}
          {/* Tautan ke halaman berikutnya */}
          {currentPage < totalPages && (
            <a href={`?page=${currentPage + 1}`} className="text-blue-600">
              Next
            </a>
          )}
        </div>
        {/* Menampilkan informasi halaman saat ini */}
        <p className="mt-2">
          Halaman {currentPage} dari {totalPages}
        </p>
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
  const transactionsTyped = transactionsData as { [key: string]: Transaction };

  // Pagination logic
  const page = parseInt(context.query.page as string) || 1; // Menggunakan type assertion
  const limit = 15; // Jumlah item per halaman
  const totalTransactions = Object.keys(transactionsTyped).length; // Total jumlah transaksi
  const totalPages = Math.ceil(totalTransactions / limit); // Total halaman
  const startIndex = (page - 1) * limit; // Indeks mulai untuk slice
  const paginatedTransactions = Object.entries(transactionsTyped)
    .slice(startIndex, startIndex + limit)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as { [key: string]: Transaction });

  return {
    props: {
      transactions: paginatedTransactions,
      totalPages,
      currentPage: page,
    },
  };
};

export default LogTransactionsPage;
