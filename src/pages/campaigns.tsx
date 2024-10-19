// pages/campaigns.tsx
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database } from "../firebase/firebase"; // Sesuaikan dengan path firebase Anda
import CardCampaign from "../components/CardCampaigns"; // Import CardCampaign
import Link from "next/link";

interface Campaign {
  id: number;
  title: string;
  buttonText: string;
  description: string;
  endDate: string;
  imageUrl: string;
  targetAmount: string; // Ubah menjadi string sesuai dengan tipe dari database
}

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const campaignsRef = ref(database, "campaigns"); // Path ke data kampanye
      const snapshot = await get(campaignsRef);
      const data = snapshot.val();

      if (data) {
        const campaignList: Campaign[] = Object.entries(data).map(
          ([id, campaign]) => {
            const {
              title,
              buttonText,
              description,
              endDate,
              imageUrl,
              targetAmount,
            } = campaign as Campaign;
            return {
              id: Number(id),
              title,
              buttonText,
              description,
              endDate,
              imageUrl,
              targetAmount,
            };
          }
        );
        setCampaigns(campaignList);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Link href="/create-campaign" className="text-blue-500 hover:underline">
        Buat Kampanye Baru
      </Link>
      <h1 className="text-2xl font-bold mb-6">Daftar Kampanye</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <CardCampaign
            key={campaign.id}
            id={campaign.id.toString()} // Pastikan ID adalah string
            title={campaign.title}
            description={campaign.description}
            buttonText={campaign.buttonText}
            imageUrl={campaign.imageUrl}
            endDate={campaign.endDate}
            targetAmount={campaign.targetAmount} // Pastikan targetAmount adalah string
          />
        ))}
      </div>
    </div>
  );
};

export default CampaignsPage;
