import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const timetableStore = {
  uid: null,
  classes: [],
  exams: [],
  listeners: new Set(),

  setUserId(uid) {
    this.uid = uid;
    if (uid) {
      this.fetchFromFirebase();
    } else {
      this.classes = [];
      this.exams = [];
      this.emit();
    }
  },

  async fetchFromFirebase() {
    if (!this.uid) return;
    try {
      const docRef = doc(db, 'userTimetables', this.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.classes = data.classes || [];
        this.exams = data.exams || [];
      } else {
        this.classes = [];
        this.exams = [];
      }
      this.emit();
    } catch (error) {
      console.error("Error fetching timetable data:", error);
    }
  },

  async syncToFirebase() {
    if (!this.uid) return;
    try {
      const docRef = doc(db, 'userTimetables', this.uid);
      await setDoc(docRef, { classes: this.classes, exams: this.exams }, { merge: true });
    } catch (error) {
      console.error("Error syncing timetable data:", error);
    }
  },

  getClasses() { return [...this.classes]; },
  getExams() { return [...this.exams]; },

  addClass(item) { this.classes = [...this.classes, item]; this.syncToFirebase(); this.emit(); },
  updateClass(index, item) { const c = [...this.classes]; c[index] = item; this.classes = c; this.syncToFirebase(); this.emit(); },
  deleteClass(index) { const c = [...this.classes]; c.splice(index, 1); this.classes = c; this.syncToFirebase(); this.emit(); },

  addExam(item) { this.exams = [...this.exams, item]; this.syncToFirebase(); this.emit(); },
  updateExam(index, item) { const e = [...this.exams]; e[index] = item; this.exams = e; this.syncToFirebase(); this.emit(); },
  deleteExam(index) { const e = [...this.exams]; e.splice(index, 1); this.exams = e; this.syncToFirebase(); this.emit(); },

  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  emit() { const snapshot = { classes: this.getClasses(), exams: this.getExams() }; this.listeners.forEach(l => { try { l(snapshot); } catch (e) { /* ignore listener errors */ } }); }
};

export default timetableStore;
