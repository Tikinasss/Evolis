const admin = require("firebase-admin");

function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  console.info("[auth] Firebase env check", {
    hasProjectId: Boolean(projectId),
    projectId: projectId || "(empty)",
    hasClientEmail: Boolean(clientEmail),
    hasPrivateKey: Boolean(privateKeyRaw),
    privateKeyLength: privateKeyRaw ? privateKeyRaw.length : 0,
    privateKeyHasBegin: privateKeyRaw ? privateKeyRaw.includes("-----BEGIN PRIVATE KEY-----") : false,
    privateKeyHasEnd: privateKeyRaw ? privateKeyRaw.includes("-----END PRIVATE KEY-----") : false,
    privateKeyHasEscapedNewlines: privateKeyRaw ? privateKeyRaw.includes("\\n") : false,
    privateKeyHasRealNewlines: privateKeyRaw ? privateKeyRaw.includes("\n") : false,
  });

  if (!projectId || !clientEmail || !privateKeyRaw) {
    console.warn("[auth] Firebase Admin disabled: missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY");
    return null;
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error) {
    console.error("[auth] Firebase Admin initialization failed", {
      code: error.code,
      message: error.message,
      projectId,
      clientEmail,
    });
    throw error;
  }

  return admin;
}

module.exports = {
  getFirebaseAdmin,
};