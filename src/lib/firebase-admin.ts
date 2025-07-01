import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY!;
const serviceAccount = JSON.parse(raw);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

if (!getApps().length) {
	initializeApp({
		credential: cert(serviceAccount),
	});
}

export const adminDb = getFirestore();
