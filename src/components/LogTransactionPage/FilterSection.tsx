// FilterSection.tsx
import React from "react";

interface FilterSectionProps {
  filterMonth: string;
  setFilterMonth: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (value: "asc" | "desc") => void;
  filterCampaignId: boolean;
  setFilterCampaignId: (value: boolean) => void;
}

const FilterSection = ({
  filterMonth,
  setFilterMonth,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  filterCampaignId,
  setFilterCampaignId,
}: FilterSectionProps) => {
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleSortOrderChange = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
  };

  return (
    <div className="flex mb-4 space-x-2 w-[550px]">
      <div>
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
      <div>
        <label>
          <input
            type="checkbox"
            checked={filterCampaignId}
            onChange={() => setFilterCampaignId(!filterCampaignId)}
          />
          Campaign ID
        </label>
      </div>
      <div>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="">Tidak Diurutkan</option>
          <option value="date">Tanggal</option>
          <option value="status">Status</option>
          <option value="campaign id">Campaign ID</option>
        </select>
        {sortBy && (
          <button
            onClick={handleSortOrderChange}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            {sortOrder === "asc" ? "Ascending" : "Descending"}
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterSection;
