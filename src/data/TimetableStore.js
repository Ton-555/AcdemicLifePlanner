const genTimeBlock = (day, hour, minute, date = null) => {
  return { day: day, time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, date: date };
};

const initial_class_data = [
  { title: 'Startup', startTime: genTimeBlock('MON', 9, 0), endTime: genTimeBlock('MON', 12, 0, '2025-02-24'), location: 'LH-2-204', extra_descriptions: ['ส่งงาน', 'ด่วน'] },
  { title: 'Mobile Application', startTime: genTimeBlock('TUE', 10, 0), endTime: genTimeBlock('TUE', 12, 0, '2025-02-25'), location: 'SC-9-333', extra_descriptions: ['มีการบ้าน'] },
];

const initial_exam_data = [
  { title: 'Midterm: Startup', startTime: genTimeBlock('MON', 9, 0, '2025-02-24'), endTime: genTimeBlock('MON', 12, 0, '2025-02-24'), location: 'SC-9-333', extra_descriptions: ['No calculators allowed'] },
];

const timetableStore = {
  classes: initial_class_data,
  exams: initial_exam_data,
  listeners: new Set(),
  getClasses() { return [...this.classes]; },
  getExams() { return [...this.exams]; },
  addClass(item) { this.classes = [...this.classes, item]; this.emit(); },
  updateClass(index, item) { const c = [...this.classes]; c[index] = item; this.classes = c; this.emit(); },
  deleteClass(index) { const c = [...this.classes]; c.splice(index, 1); this.classes = c; this.emit(); },
  addExam(item) { this.exams = [...this.exams, item]; this.emit(); },
  updateExam(index, item) { const e = [...this.exams]; e[index] = item; this.exams = e; this.emit(); },
  deleteExam(index) { const e = [...this.exams]; e.splice(index, 1); this.exams = e; this.emit(); },
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  emit() { const snapshot = { classes: this.getClasses(), exams: this.getExams() }; this.listeners.forEach(l => { try { l(snapshot); } catch (e) { /* ignore listener errors */ } }); }
};

export default timetableStore;
