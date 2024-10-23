import { useState } from "react";
import MainLayout from "../components/MainLayout";
import FilterSection from "../components/LogTransactionPage/FilterSection";
import TransactionTable from "../components/LogTransactionPage/TransactionTable";
import ExportButtons from "../components/LogTransactionPage/ExportButtons";
import { Transaction } from "../types/Transaction";
import { database } from "../firebase/firebase";
import { ref, get } from "firebase/database";
import { GetServerSideProps } from "next";
import nookies from "nookies";

interface LogTransactionsPageProps {
  transactions: { [key: string]: Transaction };
}

const LogTransactionsPage = ({ transactions }: LogTransactionsPageProps) => {
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterCampaignId, setFilterCampaignId] = useState<boolean>(false);

  // Fungsi untuk mem-filter dan mengurutkan transaksi
  const filterAndSortTransactions = (transactions: {
    [key: string]: Transaction;
  }) => {
    const filtered = Object.entries(transactions).filter(([, transaction]) => {
      if (filterMonth) {
        const transactionDate = new Date(transaction.created_at);
        return transactionDate.getMonth() + 1 === parseInt(filterMonth);
      }
      return true;
    });

    const filteredTransactions = filterCampaignId
      ? filtered.filter(
          ([, transaction]) =>
            transaction.campaignId !== undefined &&
            transaction.campaignId !== null
        )
      : filtered;

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

  // Menggabungkan filter dan sorting
  const filteredTransactions = filterAndSortTransactions(transactions);

  return (
    <MainLayout>
      <h1 className="text-3xl mb-4">Log Transaksi</h1>
      <FilterSection
        filterMonth={filterMonth}
        setFilterMonth={setFilterMonth}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        filterCampaignId={filterCampaignId}
        setFilterCampaignId={setFilterCampaignId}
      />
      <ExportButtons filteredTransactions={filteredTransactions} />{" "}
      <TransactionTable transactions={filteredTransactions} />
    </MainLayout>
  );
};

export default LogTransactionsPage;

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
