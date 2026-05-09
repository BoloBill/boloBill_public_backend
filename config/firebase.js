import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

let serviceAccount;

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is missing in env");
}

try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  // console.log("🔥 Firebase Admin Project:", serviceAccount);


  serviceAccount.private_key =
    serviceAccount.private_key.replace(/\\n/g, "\n");
    
  
} catch (err) {
  throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// console.log("admin initialized with project:", admin);

// const decoded = await admin.auth().verifyIdToken("eyJhbGciOiJSUzI1NiIsImtpZCI6IjgwNzZkZGJhYjQxNTU1NmUxNjkxNTRjNmE0YTBiZGJkNDQ2OWI3OWMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzNDI1OTQ1NDA3MDgtOHFjNmQxOTdtYWd1Z2Jlb3NtcDU3a2RyN3F2ZHB0azcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzNDI1OTQ1NDA3MDgtNmR1OGtpZXNoYmQ5ZDhkZWw5cjdjbnJxZTQyNDlkM2IuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDM3Mzg0ODg5MjUzMzk4MzYzMTUiLCJlbWFpbCI6ImdoYW5zaHlhbXBhdGlkYXIzMDExQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiR2hhbnNoeWFtIFBhdGlkYXIiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSXJtcjVFV2Zia3BfUjNJcUNCdXpkVFh6UElRdFpPMWozaHlUcXNVT1lMYkx2YXlnPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkdoYW5zaHlhbSIsImZhbWlseV9uYW1lIjoiUGF0aWRhciIsImlhdCI6MTc3ODA0NzcyNiwiZXhwIjoxNzc4MDUxMzI2fQ.XR2f9Ew82RDmclJ4tqDLerfMGDDCHyVyCTpUyvXXfw2b1xMQowDSqqPv-jEynSISVefWerKyBkefR_j6eyRugKiSws8uOsEmNXZzVwy-7OndXYmeMZUQXKJtpu9TkRysnh6RSJwArEsMB6IzK_dsQktSA2swpr1g27yGBPsfKsSrKH2HOSHu_1U63tYIkJrqlk1ABaOJe-rHKm3Ovpe1BTB3mnMBMWziDu9r4V4UOnqFaElCLbrW_LpNaGGb0t9vE1Gu_Fwv1NTdsiL7BZYECahb_eV8-cXoEMlvhEG8YcdbMN9GEstQQvczCXKYXTLO-_LaXOjX2RVW7nrtS0w8Iw");

// console.log("DECODED TOKEN:", decoded); // 🔥 THIS IS KEY

export default admin;