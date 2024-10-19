// components/CardCampaign.tsx
import React, { useEffect, useState } from "react";
// import Link from "next/link";
import { formatCurrency } from "../firebase/format";

type CardCampaignProps = {
  id: string;
  title: string;
  description: string;
  //   buttonText: string;
  imageUrl: string;
  endDate: string;
  targetAmount: string;
};

const CardCampaign: React.FC<CardCampaignProps> = ({
  id,
  title,
  description,
  //   buttonText,
  imageUrl,
  endDate,
  targetAmount,
}) => {
  const [totalAmount, setTotalAmount] = useState<number>(0);

  console.log(targetAmount);
  console.log(endDate);
  const calculateRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  // Menghitung sisa hari
  const remainingDays = calculateRemainingDays(endDate);

  useEffect(() => {
    const fetchTotalAmount = async () => {
      try {
        const response = await fetch(
          `https://9f3d-110-136-78-231.ngrok-free.app/total-amount/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              "User-Agent": "CustomUserAgent",
            },
          }
        );
        const data = await response.json();
        setTotalAmount(data.totalAmount || 0);
      } catch (error) {
        console.error("Error fetching total amount:", error);
      }
    };

    fetchTotalAmount();
  }, [id]);

  // Menghitung kekurangan dari target
  const remainingAmount = parseInt(targetAmount) - totalAmount;

  const percentage =
    totalAmount && targetAmount
      ? (totalAmount / parseFloat(targetAmount)) * 100
      : 0;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
      <img src={imageUrl} alt={title} className="h-48 w-full object-cover" />
      <div className="p-6 flex-1">
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <div
          className="text-gray-600 mb-5"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <p className="text-gray-600 mb-5">
          Tenggat waktu: {remainingDays} hari
        </p>
        <div className="mb-5">
          <p className="text-gray-600 mb-2">
            Total terkumpul: {formatCurrency(totalAmount)}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-slate-700 h-4 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p
            className={`text-gray-600 mb-5 ${
              remainingAmount > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            Kurang: {remainingAmount > 0 ? formatCurrency(remainingAmount) : 0}{" "}
            untuk mencapai target
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {percentage.toFixed(2)}% dari target tercapai
          </p>
        </div>
        {/* <Link
          href={`/campaigns/${id}`}
          className="mt-auto inline-block text-center bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-300 py-2 px-4 rounded-md"
        >
          {buttonText} →
        </Link> */}
      </div>
    </div>
  );
};

export default CardCampaign;
