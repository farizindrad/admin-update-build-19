// pages/approve-campaigns.tsx
import { GetServerSideProps } from "next";
import nookies from "nookies";
import { ref, get, update } from "firebase/database";
import { database } from "../firebase/firebase"; // Sesuaikan dengan path firebase Anda
import Link from "next/link";
import MainLayout from "@/components/MainLayout";

interface Campaign {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  targetAmount: string;
  endDate: string;
  approved: string; // Tambahkan field approved
}

interface ApproveCampaignsPageProps {
  campaigns: Campaign[];
}

const ApproveCampaignsPage = ({ campaigns }: ApproveCampaignsPageProps) => {
  const handleApproval = async (id: number, isApproved: boolean) => {
    const campaignRef = ref(database, `campaigns/${id}`);
    if (isApproved) {
      // Jika disetujui, update status approved
      await update(campaignRef, { approved: "accepted" });
    } else {
      // Jika ditolak, hapus kampanye dari database
      await update(campaignRef, { approved: "rejected" });
    }

    window.location.reload();
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Approval Kampanye</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border p-4 rounded">
              <h2 className="text-lg font-bold">{campaign.title}</h2>
              <div
                className="text-gray-600 mb-5"
                dangerouslySetInnerHTML={{ __html: campaign.description }}
              />
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                className="w-full h-auto"
              />
              <p>Target Jumlah: {campaign.targetAmount}</p>
              <p>Tanggal Berakhir: {campaign.endDate}</p>
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => handleApproval(campaign.id, true)}
                  className="bg-green-500 text-white py-1 px-2 rounded"
                >
                  Setujui
                </button>
                <button
                  onClick={() => handleApproval(campaign.id, false)}
                  className="bg-red-500 text-white py-1 px-2 rounded"
                >
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/campaigns"
          className="text-blue-500 hover:underline mt-4 block"
        >
          Kembali ke Daftar Kampanye
        </Link>
      </div>{" "}
    </MainLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = nookies.get(context);
  const token = cookies.token;
  const role = cookies.role || "guest";

  if (!token || role !== "superadmin") {
    return {
      redirect: {
        destination: "/unauthorized",
        permanent: false,
      },
    };
  }

  // Ambil data kampanye dari database yang belum disetujui
  const campaignsRef = ref(database, "campaigns");
  const snapshot = await get(campaignsRef);
  const data = snapshot.val();

  const campaigns: Campaign[] = [];
  if (data) {
    Object.entries(data).forEach(([id, campaign]) => {
      const campaignData = campaign as Campaign;
      if (campaignData.approved === "pending") {
        campaigns.push({
          id: Number(id),
          title: campaignData.title,
          description: campaignData.description,
          endDate: campaignData.endDate,
          imageUrl: campaignData.imageUrl,
          targetAmount: campaignData.targetAmount,
          approved: "rejected",
        });
      }
    });
  }

  return {
    props: { campaigns },
  };
};

export default ApproveCampaignsPage;
