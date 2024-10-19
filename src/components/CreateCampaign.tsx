import React, { useState } from "react";
import dynamic from "next/dynamic"; // Import dynamic dari Next.js
import { ref, set } from "firebase/database";
import { database } from "../firebase/firebase"; // Sesuaikan dengan path firebase Anda
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage"; // Import Firebase Storage
import { useRouter } from "next/router";

import "react-quill/dist/quill.snow.css";

// Import ReactQuill secara dinamis untuk menghindari error di server-side
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const CreateCampaign = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [targetAmount, setTargetAmount] = useState("");
  const [endDate, setEndDate] = useState("");
  const router = useRouter();

  const handleImageUpload = async (file: File) => {
    const storage = getStorage();
    const storageReference = storageRef(storage, `images/${file.name}`);
    await uploadBytes(storageReference, file);
    return getDownloadURL(storageReference);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const id = Date.now();

    if (!imageFile) {
      alert("Silakan pilih file gambar.");
      return;
    }

    try {
      // Upload gambar dan dapatkan URL-nya
      const imageUrl = await handleImageUpload(imageFile);

      // Simpan data kampanye ke Firebase
      await set(ref(database, `campaigns/${id}`), {
        id,
        title,
        description,
        imageUrl,
        targetAmount: targetAmount || "10000000", // Default target amount
        endDate,
        buttonText: "Donasi Sekarang", // Default button text
      });

      // Setelah berhasil, arahkan kembali ke halaman kampanye
      router.push("/campaigns");
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Buat Kampanye Baru</h1>
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
          <label className="block text-gray-700">Upload Gambar:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                setImageFile(e.target.files[0]);
              }
            }}
            className="border p-2 w-full"
            required
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
          Buat Kampanye
        </button>
      </form>
    </div>
  );
};

export default CreateCampaign;
