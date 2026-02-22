import { auth, db, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp, increment } from 'firebase/firestore';

export async function signUp(email: string, password: string, username: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  if (!user) throw new Error('Failed to create user');

  await updateProfile(user, { displayName: username });

  // Create stats document
  const statsRef = doc(db, 'stats', user.uid);
  await setDoc(statsRef, {
    matches: 0,
    wins: 0,
    losses: 0,
    captures: 0,
    timePlayed: 0,
    createdAt: serverTimestamp()
  });

  // Create users lookup
  const usersRef = doc(db, 'users', user.uid);
  await setDoc(usersRef, {
    username,
    email,
    createdAt: serverTimestamp()
  });

  return user;
}

export async function login(identifier: string, password: string) {
  // identifier can be email or username
  let email = identifier;
  if (!identifier.includes('@')) {
    // treat as username
    const found = await findEmailByUsername(identifier);
    if (!found) throw new Error('Invalid email or password');
    email = found;
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  if (!user) throw new Error('Google login failed');

  // Ensure stats doc exists
  const statsRef = doc(db, 'stats', user.uid);
  const snap = await getDoc(statsRef);
  if (!snap.exists()) {
    await setDoc(statsRef, {
      matches: 0,
      wins: 0,
      losses: 0,
      captures: 0,
      timePlayed: 0,
      createdAt: serverTimestamp()
    });
  }

  // Ensure users lookup exists
  const usersRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(usersRef);
  if (!userSnap.exists()) {
    await setDoc(usersRef, {
      username: user.displayName || '',
      email: user.email || '',
      createdAt: serverTimestamp()
    });
  }

  return user;
}

export async function findEmailByUsername(username: string): Promise<string | null> {
  const q = query(collection(db, 'users'), where('username', '==', username));
  const snaps = await getDocs(q);
  if (snaps.empty) return null;
  const first = snaps.docs[0].data();
  return first.email || null;
}

export async function signOutUser() {
  await firebaseSignOut(auth);
}

export { auth };
