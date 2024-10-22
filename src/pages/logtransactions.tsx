import { GetServerSideProps } from "next";
import nookies from "nookies";
import { ref, get } from "firebase/database";
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
}

const LogTransactionsPage = ({ transactions }: LogTransactionsPageProps) => {
  const [filterMonth, setFilterMonth] = useState<string>(""); // filterMonth adalah string
  const [sortBy, setSortBy] = useState<string>(""); // Menyimpan kriteria (date/status)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterCampaignId, setFilterCampaignId] = useState<boolean>(false);

  // Fungsi untuk mem-filter transaksi berdasarkan bulan
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

  // Fungsi untuk mengurutkan transaksi berdasarkan kriteria dan urutan (ascending/descending)
  const sortTransactions = (transactions: { [key: string]: Transaction }) => {
    // Pertama, filter transaksi yang tidak memiliki campaignId jika checkbox diaktifkan
    const filteredTransactions = filterCampaignId
      ? Object.entries(transactions).filter(
          ([, transaction]) =>
            transaction.campaignId !== undefined &&
            transaction.campaignId !== null
        )
      : Object.entries(transactions);

    // Kemudian, urutkan transaksi
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
        const campaignA = a.campaignId ?? Number.MAX_SAFE_INTEGER; // Gunakan nilai besar untuk nilai null/undefined
        const campaignB = b.campaignId ?? Number.MAX_SAFE_INTEGER; // Gunakan nilai besar untuk nilai null/undefined

        return sortOrder === "asc"
          ? campaignA - campaignB
          : campaignB - campaignA;
      }
      return 0;
    });

    return Object.fromEntries(sorted);
  };

  // Menggabungkan filter dan sorting
  const filteredTransactions = sortTransactions(
    filterTransactionsByMonth(transactions)
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
      Object.entries(transactions).map(([id, transaction]) => ({
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
      Object.entries(transactions).map(([id, transaction]) => ({
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

        {/* Filter dan Sort Section */}
        <div className="flex mb-4 space-x-4">
          <div>
            <label>Filter Bulan: </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border px-2 py-1"
            >
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
          {/* Checkbox untuk filter campaignId */}
          <div>
            <label>
              <input
                type="checkbox"
                checked={filterCampaignId}
                onChange={() => setFilterCampaignId(!filterCampaignId)}
              />
              Tampilkan hanya yang memiliki Campaign ID
            </label>
          </div>
          <div>
            <label>Urutkan Berdasarkan: </label>
            {/* Dropdown untuk urutan */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border px-2 py-1"
            >
              <option value="">Tidak Diurutkan</option>
              <option value="date">Tanggal</option>
              <option value="status">Status</option>
              <option value="campaign id">Campaign Id</option>
            </select>

            {sortBy && (
              <button
                onClick={handleSortOrderChange}
                className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
              >
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </button>
            )}
          </div>
        </div>

        {/* Tombol Ekspor */}
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
              {Object.entries(filteredTransactions).map(([id, transaction]) => (
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
