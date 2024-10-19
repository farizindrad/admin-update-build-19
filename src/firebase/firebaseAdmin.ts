import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin"; // Impor tipe ServiceAccount
import serviceAccount from "../../serviceDev.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount), // Pakai "as ServiceAccount"
    databaseURL:
      "https://adminfirebase-f4-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

const adminAuth = admin.auth();
const adminDb = admin.database();

export { adminAuth, adminDb };
