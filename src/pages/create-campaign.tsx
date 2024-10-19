// pages/create-campaign.tsx
import CreateCampaign from "@/components/CreateCampaign";
import { GetServerSideProps } from "next";
import nookies from "nookies";

const CreateCampaignPage = ({ role }: { role: string }) => {
  return <CreateCampaign role={role} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = nookies.get(context);
  const role = cookies.role || "guest"; // Default role jika tidak ada cookie

  // Tambahkan logika lain jika diperlukan, seperti pengecekan autentikasi

  return {
    props: { role }, // Pass role sebagai props
  };
};

export default CreateCampaignPage;
