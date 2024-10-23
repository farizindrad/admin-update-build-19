import { useState, useEffect, useCallback } from "react";
import MainLayout from "../components/MainLayout";
import FilterSection from "../components/LogTransactionPage/FilterSection";
import TransactionTable from "../components/LogTransactionPage/TransactionTable";
import ExportButtons from "../components/LogTransactionPage/ExportButtons";
import { Transaction } from "../types/Transaction";
import { database } from "../firebase/firebase";
import { ref, get } from "firebase/database";
// import nookies from "nookies";

const LogTransactionsPage = () => {
  const [transactions, setTransactions] = useState<{
    [key: string]: Transaction;
  }>({});
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterCampaignId, setFilterCampaignId] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [itemsPerPage, setItemsPerPage] = useState<number>(15); // Jumlah item per halaman default

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset ke halaman pertama saat jumlah item per halaman berubah
  };

  const fetchTransactions = useCallback(
    async (page: number) => {
      const transactionsRef = ref(database, "new-transactions");
      const snapshot = await get(transactionsRef);
      const transactionsData = snapshot.val() || {};

      const typedTransactionsData: { [key: string]: Transaction } =
        transactionsData;

      const sortedTransactions = Object.entries(typedTransactionsData).sort(
        ([, a], [, b]) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
      );

      const startIndex = (page - 1) * itemsPerPage; // Gunakan itemsPerPage dari state
      const paginatedTransactions = sortedTransactions.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      setTotalPages(Math.ceil(sortedTransactions.length / itemsPerPage));
      return Object.fromEntries(paginatedTransactions) as {
        [key: string]: Transaction;
      };
    },
    [itemsPerPage]
  );

  useEffect(() => {
    const loadTransactions = async () => {
      const transactions = await fetchTransactions(currentPage);
      setTransactions(transactions);
    };
    loadTransactions();
  }, [currentPage, fetchTransactions]); // Tambahkan fetchTransactions di sini

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

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <MainLayout>
      <h1 className="text-3xl mb-4">Log Transaksi</h1>

      <div className="flex flex-row">
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
        <ExportButtons filteredTransactions={filteredTransactions} />
        <div className="pl-4 mt-4">
          <span className="mr-2">Items per page:</span>
          {[15, 25, 50, 100].map((num) => (
            <button
              key={num}
              className={`mx-1 px-2 py-1 rounded ${
                itemsPerPage === num ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => handleItemsPerPageChange(num)}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
      <TransactionTable transactions={filteredTransactions} />
      <div className="pagination mt-4 flex justify-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="mx-2">{` Page ${currentPage} of ${totalPages} `}</span>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </MainLayout>
  );
};

export default LogTransactionsPage;
