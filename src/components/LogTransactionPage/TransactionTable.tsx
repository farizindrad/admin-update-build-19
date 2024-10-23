import React from "react";
import { Transaction } from "../../types/Transaction"; // Buatkan file type untuk tipe data Transaction

interface TransactionTableProps {
  transactions: { [key: string]: Transaction };
}

const TransactionTable = ({ transactions }: TransactionTableProps) => {
  return (
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
  );
};

export default TransactionTable;
