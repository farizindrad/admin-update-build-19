// /pages/dashboard.tsx
import { GetServerSideProps } from "next";
import nookies from "nookies";
import ManageAdmins from "../components/ManageAdmins";
import Link from "next/link";
import MainLayout from "@/components/MainLayout";

const Dashboard = ({ role }: { role: string }) => {
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Kamu adalah {role}</p>
        <Link
          href="/campaigns"
          className="text-blue-500 hover:underline mt-4 block"
        >
          Lihat Kampanye
        </Link>
        <Link
          href="/logtransactions"
          className="text-blue-500 hover:underline mt-4 block"
        >
          Lihat Transaksi
        </Link>
        {role === "superadmin" && <ManageAdmins />}
      </div>
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

  return {
    props: { role },
  };
};

export default Dashboard;
