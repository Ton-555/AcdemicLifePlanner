import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const timetableStore = {
  uid: null,                     // รหัสผู้ใช้ที่ล็อกอินอยู่
  classes: [],                   // ข้อมูลตารางเรียน
  exams: [],                     // ข้อมูลตารางสอบ
  listeners: new Set(),          // ระบบแจ้งหน้าจออื่นๆ ให้ทราบเมื่อข้อมูลเปลี่ยน
  _unsubFirestore: null,         // ฟังก์ชัน unsubscribe จาก Firestore real-time listener

  // ฟังก์ชันรับค่า User ID เมื่อมีการล็อกอินหรือออกจากระบบ
  setUserId(uid) {
    // ยกเลิก listener เดิมก่อนเสมอ
    if (this._unsubFirestore) {
      this._unsubFirestore();
      this._unsubFirestore = null;
    }

    this.uid = uid;

    if (uid) {
      // TC-09: ใช้ onSnapshot แทน getDoc เพื่อ real-time sync ระหว่างอุปกรณ์
      const docRef = doc(db, 'userTimetables', uid);
      this._unsubFirestore = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.classes = data.classes || [];
          this.exams = data.exams || [];
        } else {
          this.classes = [];
          this.exams = [];
        }
        this.emit();
      }, (error) => {
        console.error("Error listening to timetable data:", error);
      });
    } else {
      // ล็อกเอาออก — ล้างข้อมูลและแจ้ง UI
      this.classes = [];
      this.exams = [];
      this.emit();
    }
  },

  // ฟังก์ชันบันทึกข้อมูลย้อนกลับขึ้น Firebase
  async syncToFirebase() {
    if (!this.uid) return;
    try {
      const docRef = doc(db, 'userTimetables', this.uid);
      await setDoc(docRef, { classes: this.classes, exams: this.exams }, { merge: true });
    } catch (error) {
      console.error("Error syncing timetable data:", error);
    }
  },

  // ดึงข้อมูลไปใช้
  getClasses() { return [...this.classes]; },
  getExams() { return [...this.exams]; },

  // จัดการเพิ่ม/แก้/ลบ วิชาเรียน
  addClass(item) { this.classes = [...this.classes, item]; this.syncToFirebase(); this.emit(); },
  updateClass(index, item) { const c = [...this.classes]; c[index] = item; this.classes = c; this.syncToFirebase(); this.emit(); },

  // TC-05: Cascading Delete — ลบวิชาเรียนแล้วลบตารางสอบที่ title ตรงกันออกด้วย
  deleteClass(index) {
    const deletedTitle = this.classes[index]?.title;
    const c = [...this.classes];
    c.splice(index, 1);
    this.classes = c;

    // ลบตารางสอบที่มีชื่อวิชาตรงกันออกด้วย (cascading delete)
    if (deletedTitle) {
      this.exams = this.exams.filter(
        exam => exam.title?.trim().toLowerCase() !== deletedTitle.trim().toLowerCase()
      );
    }

    this.syncToFirebase();
    this.emit();
  },

  // จัดการเพิ่ม/แก้/ลบ การสอบ
  addExam(item) { this.exams = [...this.exams, item]; this.syncToFirebase(); this.emit(); },
  updateExam(index, item) { const e = [...this.exams]; e[index] = item; this.exams = e; this.syncToFirebase(); this.emit(); },
  deleteExam(index) { const e = [...this.exams]; e.splice(index, 1); this.exams = e; this.syncToFirebase(); this.emit(); },

  // TC-03: Clear ข้อมูลทั้งหมดรวมถึง Firestore
  async clearAllData() {
    this.classes = [];
    this.exams = [];
    this.emit();
    if (this.uid) {
      try {
        const docRef = doc(db, 'userTimetables', this.uid);
        await setDoc(docRef, { classes: [], exams: [] });
      } catch (error) {
        console.error("Error clearing timetable data:", error);
      }
    }
  },

  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  emit() { const snapshot = { classes: this.getClasses(), exams: this.getExams() }; this.listeners.forEach(l => { try { l(snapshot); } catch (e) { /* ignore listener errors */ } }); }
};

export default timetableStore;
