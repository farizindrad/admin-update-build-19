// pages/editCampaign/[id].tsx
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ref, get, set } from "firebase/database";
import { database } from "../../firebase/firebase"; // Sesuaikan dengan path firebase Anda
import { useRouter } from "next/router";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage"; // Import Firebase Storage
import "react-quill/dist/quill.snow.css";
import MainLayout from "@/components/MainLayout";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const EditCampaign = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [targetAmount, setTargetAmount] = useState("");
  const [endDate, setEndDate] = useState("");
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchCampaign = async () => {
      if (id) {
        const campaignRef = ref(database, `campaigns/${id}`);
        const snapshot = await get(campaignRef);
        const campaignData = snapshot.val();
        if (campaignData) {
          setTitle(campaignData.title);
          setDescription(campaignData.description);
          setTargetAmount(campaignData.targetAmount);
          setEndDate(campaignData.endDate);
          // Gambar tidak perlu di-set di sini, karena kita hanya mengedit informasi
        }
      }
    };

    fetchCampaign();
  }, [id]);

  const handleImageUpload = async (file: File) => {
    const storage = getStorage();
    const storageReference = storageRef(storage, `images/${file.name}`);
    await uploadBytes(storageReference, file);
    return getDownloadURL(storageReference);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const campaignId = id as string;

    try {
      // Jika ada file gambar yang di-upload, upload dan ambil URL-nya
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      // Simpan data kampanye ke Firebase
      await set(ref(database, `campaigns/${campaignId}`), {
        title,
        description,
        imageUrl: imageUrl || undefined, // Hanya update jika ada gambar baru
        targetAmount: targetAmount || "10000000", // Default target amount
        endDate,
        buttonText: "Donasi Sekarang", // Default button text
      });

      // Setelah berhasil, arahkan kembali ke halaman kampanye
      router.push("/campaigns");
    } catch (error) {
      console.error("Error updating campaign:", error);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Edit Kampanye</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Judul:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Deskripsi:</label>
            <ReactQuill
              value={description}
              onChange={setDescription}
              className="border p-2"
            />
          </div>
          <div>
            <label className="block text-gray-700">
              Upload Gambar (optional):
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  setImageFile(e.target.files[0]);
                }
              }}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-gray-700">Target Jumlah:</label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="border p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-gray-700">Tanggal Berakhir:</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Update Kampanye
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default EditCampaign;
