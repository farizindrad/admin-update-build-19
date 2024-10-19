import { GetServerSideProps } from "next";
import nookies from "nookies";
import { ref, get, remove } from "firebase/database";
import { database } from "../firebase/firebase"; // Sesuaikan dengan path firebase Anda

interface Campaign {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  targetAmount: string;
  endDate: string;
  approved: string;
}

interface RejectedCampaignsPageProps {
  rejectedCampaigns: Campaign[];
}

const RejectedCampaignsPage = ({
  rejectedCampaigns,
}: RejectedCampaignsPageProps) => {
  const handleDelete = async (id: number) => {
    const campaignRef = ref(database, `campaigns/${id}`);
    await remove(campaignRef); // Menghapus kampanye dari database
    window.location.reload(); // Reload halaman untuk memperbarui daftar
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Kampanye Ditolak</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rejectedCampaigns.map((campaign) => (
          <div key={campaign.id} className="border p-4 rounded">
            <h2 className="text-lg font-bold">{campaign.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: campaign.description }} />
            <img
              src={campaign.imageUrl}
              alt={campaign.title}
              className="w-full h-auto"
            />
            <p>Target Jumlah: {campaign.targetAmount}</p>
            <p>Tanggal Berakhir: {campaign.endDate}</p>
            <div className="flex justify-between mt-2">
              <button
                onClick={() => handleDelete(campaign.id)} // Menghapus kampanye
                className="bg-red-500 text-white py-1 px-2 rounded"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
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

  // Ambil data kampanye yang ditolak
  const rejectedCampaignsRef = ref(database, "campaigns");
  const snapshot = await get(rejectedCampaignsRef);
  const data = snapshot.val();

  const rejectedCampaigns: Campaign[] = [];
  if (data) {
    Object.entries(data).forEach(([id, campaign]) => {
      const campaignData = campaign as Campaign;
      if (campaignData.approved === "rejected") {
        rejectedCampaigns.push({
          id: Number(id),
          title: campaignData.title,
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
    props: { rejectedCampaigns },
  };
};

export default RejectedCampaignsPage;
