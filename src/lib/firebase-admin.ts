import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";

let cachedAuth: Auth | null = null;

async function getAdminApp(): Promise<App> {
  const { initializeApp, getApps, cert } = await import("firebase-admin/app");
  if (getApps().length) return getApps()[0];

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function getFirebaseAdminAuth(): Promise<Auth> {
  if (!cachedAuth) {
    const { getAuth } = await import("firebase-admin/auth");
    cachedAuth = getAuth(await getAdminApp());
  }
  return cachedAuth;
}
