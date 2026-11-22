import { cert, initializeApp } from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";
import firebaseServiceAccount from "../../serviceAccountKey.json";

export const fireBaseApp = initializeApp({
    credential: cert(firebaseServiceAccount as ServiceAccount)
})