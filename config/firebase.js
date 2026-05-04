import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

let serviceAccount;

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is missing in env");
}

try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);



  serviceAccount.private_key =
    serviceAccount.private_key.replace(/\\n/g, "\n");
} catch (err) {
  throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;