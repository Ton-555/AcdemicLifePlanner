import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const activityStore = {
    uid: null,
    activities: [],
    listeners: new Set(),
    _unsubFirestore: null,

    setUserId(uid) {
        if (this._unsubFirestore) {
            this._unsubFirestore();
            this._unsubFirestore = null;
        }
        this.uid = uid;
        if (uid) {
            const docRef = doc(db, 'userActivities', uid);
            this._unsubFirestore = onSnapshot(docRef, (docSnap) => {
                this.activities = docSnap.exists() ? (docSnap.data().activities || []) : [];
                this.emit();
            }, (error) => {
                console.error('ActivityStore snapshot error:', error);
            });
        } else {
            this.activities = [];
            this.emit();
        }
    },

    async _sync() {
        if (!this.uid) return;
        try {
            await setDoc(doc(db, 'userActivities', this.uid), { activities: this.activities });
        } catch (e) {
            console.error('ActivityStore sync error:', e);
        }
    },

    getActivities() { return [...this.activities]; },

    addActivity(item) {
        this.activities = [item, ...this.activities];
        this._sync();
        this.emit();
    },

    updateActivity(id, item) {
        this.activities = this.activities.map(a => a.id === id ? { ...a, ...item } : a);
        this._sync();
        this.emit();
    },

    deleteActivity(id) {
        this.activities = this.activities.filter(a => a.id !== id);
        this._sync();
        this.emit();
    },

    async clearAllData() {
        this.activities = [];
        this.emit();
        if (this.uid) {
            try {
                await setDoc(doc(db, 'userActivities', this.uid), { activities: [] });
            } catch (e) {
                console.error('ActivityStore clear error:', e);
            }
        }
    },

    subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
    emit() {
        const snap = this.getActivities();
        this.listeners.forEach(l => { try { l(snap); } catch (e) { } });
    },
};

export default activityStore;
