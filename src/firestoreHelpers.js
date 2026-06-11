import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

export async function getMenteesFromDB() {
  const snapshot = await getDocs(collection(db, "mentees"));
  return snapshot.docs.map(docItem => ({
    id: docItem.id,
    ...docItem.data()
  }));
}

export async function saveMenteeToDB(mentee) {
  await setDoc(doc(db, "mentees", mentee.id), {
    ...mentee,
    updatedAt: serverTimestamp()
  });
}

export async function updateMenteeInDB(id, data) {
  await updateDoc(doc(db, "mentees", id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteMenteeFromDB(id) {
  await deleteDoc(doc(db, "mentees", id));
}

export async function getWeeksFromDB(uid) {
  const ref = doc(db, "mentees", uid, "data", "weeks");
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return [];
  }

  return snapshot.data().weeks || [];
}

export async function saveWeeksToDB(uid, weeks) {
  await setDoc(doc(db, "mentees", uid, "data", "weeks"), {
    weeks,
    updatedAt: serverTimestamp()
  });
}

export async function getActiveWeekFromDB(uid) {
  const ref = doc(db, "mentees", uid, "data", "activeWeek");
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return 0;
  }

  return snapshot.data().activeWeek || 0;
}

export async function saveActiveWeekToDB(uid, activeWeek) {
  await setDoc(doc(db, "mentees", uid, "data", "activeWeek"), {
    activeWeek,
    updatedAt: serverTimestamp()
  });
}

export async function getResponsesFromDB(uid, weekIndex) {
  const ref = doc(db, "mentees", uid, "responses", String(weekIndex));
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return {};
  }

  return snapshot.data().responses || {};
}

export async function saveResponseToDB(uid, weekIndex, dayIndex, exerciseIndex, value) {
  const currentResponses = await getResponsesFromDB(uid, weekIndex);

  const updatedResponses = {
    ...currentResponses,
    [dayIndex]: {
      ...(currentResponses[dayIndex] || {}),
      [exerciseIndex]: {
        ...value,
        at: new Date().toLocaleString("es-EC")
      }
    }
  };

  await setDoc(doc(db, "mentees", uid, "responses", String(weekIndex)), {
    responses: updatedResponses,
    updatedAt: serverTimestamp()
  });

  return updatedResponses;
}
