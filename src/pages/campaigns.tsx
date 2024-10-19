// pages/campaigns.tsx
import { GetServerSideProps } from "next";
import nookies from "nookies";
import { ref, get, remove } from "firebase/database";
import { database } from "../firebase/firebase"; // Sesuaikan dengan path firebase Anda
import CardCampaign from "../components/CardCampaigns"; // Import CardCampaign
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import MainLayout from "@/components/MainLayout";

interface Campaign {
  id: number;
  title: string;
  buttonText: string;
  description: string;
  endDate: string;
  imageUrl: string;
  targetAmount: string;
  approved: string;
}

interface CampaignsPageProps {
  role: string;
  campaigns: Campaign[];
}

const CampaignsPage = ({ role, campaigns }: CampaignsPageProps) => {
  const [campaignList, setCampaigns] = useState<Campaign[]>(campaigns); // Definisikan state untuk kampanye
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus kampanye ini?")) {
      await remove(ref(database, `campaigns/${id}`));
      // Update state setelah delete
      setCampaigns((prevCampaigns) =>
        prevCampaigns.filter((campaign) => campaign.id !== id)
      );
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <Link href="/create-campaign" className="text-blue-500 hover:underline">
          Buat Kampanye Baru
        </Link>
        <Link
          href="/rejected"
          className="text-blue-500 hover:underline mt-4 block"
        >
          Lihat Kampanye Ditolak
        </Link>
        <Link
          href="/approve-campaigns"
          className="text-blue-500 hover:underline"
        >
          Approval Kampanye
        </Link>
        <h1 className="text-2xl font-bold mb-6">Daftar Kampanye</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaignList.map((campaign) => (
            <div key={campaign.id} className="relative">
              <CardCampaign
                id={campaign.id.toString()} // Pastikan ID adalah string
                title={campaign.title}
                description={campaign.description}
                imageUrl={campaign.imageUrl}
                endDate={campaign.endDate}
                targetAmount={campaign.targetAmount} // Pastikan targetAmount adalah string
              />
              {role === "superadmin" && (
                <button
                  onClick={() => handleDelete(campaign.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white py-1 px-2 rounded"
                >
                  Hapus
                </button>
              )}
              <button
                onClick={() => router.push(`/editCampaign/${campaign.id}`)}
                className="absolute top-2 right-14 bg-yellow-500 text-white py-1 px-2 rounded"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>{" "}
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

  // Ambil data kampanye dari database
  const campaignsRef = ref(database, "campaigns");
  const snapshot = await get(campaignsRef);
  const data = snapshot.val();

  // Pastikan data adalah objek dan mendefinisikan tipe data
  const campaigns: Campaign[] = [];
  if (data) {
    Object.entries(data).forEach(([id, campaign]) => {
      const campaignData = campaign as Campaign;
      if (campaignData.approved === "accepted") {
        // Hanya tambahkan kampanye yang disetujui
        campaigns.push({
          id: Number(id),
          title: campaignData.title,
          buttonText: campaignData.buttonText,
          description: campaignData.description,
          endDate: campaignData.endDate,
          imageUrl: campaignData.imageUrl,
          targetAmount: campaignData.targetAmount,
          approved: campaignData.approved,
        });
      }
    });
  }

  return {
    props: { role, campaigns }, // Pass role dan data campaigns sebagai props
  };
};

export default CampaignsPage;
