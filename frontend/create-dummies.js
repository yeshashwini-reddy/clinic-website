import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7U1uNLFQPGV7XcKj7WTo4JRaebX5_RzE",
  projectId: "clinic-822bf",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createDummy(email, password, role, name) {
  let user;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    user = userCredential.user;
    console.log(`Successfully created new Auth account for ${email}`);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`Auth account ${email} already exists. Logging in to get UID...`);
      try {
        const signinCred = await signInWithEmailAndPassword(auth, email, password);
        user = signinCred.user;
      } catch (signInErr) {
        console.error(`Failed to login to existing account ${email}:`, signInErr.message);
        return;
      }
    } else {
      console.error(`Error creating user ${email}:`, error.message);
      return;
    }
  }

  // Set the role in Firestore
  try {
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      role: role,
      phone: "1234567890",
      createdAt: new Date().toISOString()
    });
    console.log(`Successfully assigned role '${role}' in Firestore for ${email}`);
  } catch (dbErr) {
    console.error(`Firestore Error for ${email}:`, dbErr.message);
  }
}

async function main() {
  console.log("Setting up Admin and Doctor accounts...");
  await createDummy("admin@clinic.com", "admin123", "admin", "System Admin");
  await createDummy("doctor@clinic.com", "doctor123", "doctor", "Dr. Vanitha Reddy");
  console.log("Done!");
  process.exit(0);
}

main();
