// /components/ManageAdmins.tsx
import { useEffect, useState } from "react";
import { ref, get, set, remove } from "firebase/database";
import { database, auth } from "../firebase/firebase"; // Pastikan auth diimpor di sini
import { createUserWithEmailAndPassword } from "firebase/auth";
import { UserCredential } from "firebase/auth"; // Import UserCredential

interface Admin {
  uid: string;
  name: string;
  email: string;
  role: string;
}

interface User {
  name: string;
  email: string;
  role: "admin" | "volunteer"; // Menambahkan role volunteer
}

const ManageAdmins = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [formData, setFormData] = useState<Omit<Admin, "uid">>({
    name: "",
    email: "",
    role: "admin", // Default role diatur ke admin
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      const adminsRef = ref(database, "users");
      const snapshot = await get(adminsRef);
      const data = snapshot.val() as Record<string, User>;

      if (data) {
        const adminList = Object.entries(data)
          .filter(([, user]) => user.role === "admin")
          .map(([uid, user]) => ({ uid, ...user }));
        setAdmins(adminList);
      }
    };

    fetchAdmins();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedEmail = formData.email.replace(/[@.]/g, "-");

    try {
      if (isEditing) {
        // Jika sedang mengedit, update data admin
        const adminRef = ref(database, `users/${sanitizedEmail}`);
        await set(adminRef, { ...formData, uid: sanitizedEmail });
        setAdmins((prev) =>
          prev.map((admin) =>
            admin.email === formData.email
              ? { ...formData, uid: sanitizedEmail }
              : admin
          )
        );
      } else {
        // Jika menambahkan admin baru, buat akun dan simpan data
        const userCredential: UserCredential =
          await createUserWithEmailAndPassword(
            auth,
            formData.email,
            "12341234" // Ganti dengan password yang diinginkan
          );
        const uid = userCredential.user.uid;

        const adminRef = ref(database, `users/${uid}`);
        await set(adminRef, {
          ...formData,
          uid: uid,
        });

        setAdmins((prev) => [...prev, { ...formData, uid }]);
      }

      // Reset form data
      setFormData({ name: "", email: "", role: "admin" });
      setIsEditing(false);
    } catch (error) {
      console.error("Error creating/updating admin:", error);
    }
  };

  const handleEdit = (admin: Admin) => {
    setFormData({ name: admin.name, email: admin.email, role: admin.role });
    setIsEditing(true);
  };

  const handleDelete = async (uid: string) => {
    await remove(ref(database, `users/${uid}`));
    setAdmins((prev) => prev.filter((admin) => admin.uid !== uid));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage</h2>
      <ul>
        {admins.map((admin) => (
          <li key={admin.uid} className="flex justify-between mb-2">
            <span>
              {admin.name} - {admin.email} ({admin.role})
            </span>
            <div>
              <button
                onClick={() => handleEdit(admin)}
                className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(admin.uid)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-4">
        {isEditing ? "Edit" : "Tambah"}
      </h2>
      <form onSubmit={handleSubmit} className="mt-2">
        <input
          type="text"
          name="name"
          placeholder="Nama"
          value={formData.name}
          onChange={handleChange}
          className="border rounded p-2 mb-2 w-full"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border rounded p-2 mb-2 w-full"
          required
        />
        {/* Dropdown untuk memilih role */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="border rounded p-2 mb-2 w-full"
        >
          <option value="admin">Admin</option>
          <option value="volunteer">Volunteer</option>
        </select>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {isEditing ? "Update" : "Tambah"}
        </button>
      </form>
    </div>
  );
};

export default ManageAdmins;
