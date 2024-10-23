import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Transaction } from "../../types/Transaction"; // Tipe data Transaction

interface ExportButtonsProps {
  filteredTransactions: { [key: string]: Transaction }; // Menggunakan filteredTransactions
}

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

const ExportButtons = ({ filteredTransactions }: ExportButtonsProps) => {
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
    <div className="mx-32 mb-4">
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
        className="bg-orange-500 text-white px-4 py-2 rounded"
      >
        Ekspor CSV
      </button>
    </div>
  );
};

export default ExportButtons;
