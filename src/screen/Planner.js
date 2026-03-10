import React, { useState, useEffect, useMemo } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, Modal, Alert, Image, ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import activityStore from '../data/ActivityStore';

// ── กิจกรรมแนะนำ (hardcode) ──
const FEATURED_ACTIVITIES = [
    {
        id: "f1",
        title: "Job Fair 2026",
        date: "2026-02-20",
        displayDate: "20 ก.พ. 2026",
        time: "09:00 - 16:00 น.",
        location: "ห้องคอนเวนชั่น มก.กำแพงแสน",
        image: "https://kps.ku.ac.th/v8/images/Satang/2569/Feb/613324.jpg",
    },
    {
        id: "f2",
        title: "Lib Learn Life",
        date: "2026-02-03",
        displayDate: "3 ก.พ. 2026",
        time: "10:00 - 20:00 น.",
        location: "สวนด้านหน้าสำนักงานบริหารจัดการการเรียนรู้",
        image: "https://scontent.fkdt2-1.fna.fbcdn.net/v/t39.30808-6/619260339_1478488657612149_5296629279182397039_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=13d280&_nc_ohc=qR7mPQGZClMQ7kNvwEL92rU&_nc_oc=AdnJBDo4a61UNuFLUHbLTwC2SYj3GWHzPiPTEod5IoW-Zef6-6qsCOVDkxcL1yWBi3Q&_nc_zt=23&_nc_ht=scontent.fkdt2-1.fna&_nc_gid=tHQ8DPCH0jEyNAkT2etBTw&oh=00_Afuq72HN_dDhdD8d6KI9D5ZXmuEhk_GuVFDv58VvA8N_xA&oe=699FA1F4",
    },
    {
        id: "f3",
        title: "Music In The Garden",
        date: "2026-03-10",
        displayDate: "10 มี.ค. 2026",
        time: "11:00 - 18:00 น.",
        location: "สนามกีฬาหลักและลานอเนกประสงค์กลาง",
        image: "https://scontent.fkdt2-1.fna.fbcdn.net/v/t39.30808-6/637807135_1231482309166679_4376201818258179145_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=13d280&_nc_ohc=pA5JcaCdhP8Q7kNvwEcnPR3&_nc_oc=AdkU2731yA-yO_oua-sPLFU5jGgeWNgKgOuDdcHIgvAkW7IHobascF_18z15ENQtLKE&_nc_zt=23&_nc_ht=scontent.fkdt2-1.fna&_nc_gid=kVL4f4vCTsn1UbtfGDSWQA&oh=00_AfuVsaad4mr_m2XAKO0x7sFs1UyHVGKkmNN-r0MRB9jLhg&oe=699FA8CA",
    },
];

// ── ค่าเริ่มต้น form ──
const EMPTY_FORM = {
    title: '', dateStr: '', dateObj: new Date(),
    startStr: '', startObj: new Date(),
    endStr: '', endObj: new Date(),
    location: '', description: '', imageUrl: '',
};

export default function Planner() {
    const [activeTab, setActiveTab] = useState("activity");

    // ─── Study Plans (Firebase persist) ───
    const [studyPlans, setStudyPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [taskModal, setTaskModal] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // ─── User Activities (ActivityStore) ───
    const [activities, setActivities] = useState(activityStore.getActivities());
    const [actFormVisible, setActFormVisible] = useState(false);
    const [editingAct, setEditingAct] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [showActDatePicker, setShowActDatePicker] = useState(false);
    const [showActStartPicker, setShowActStartPicker] = useState(false);
    const [showActEndPicker, setShowActEndPicker] = useState(false);

    // ── Detail modal ──
    const [detailAct, setDetailAct] = useState(null); // activity object to show detail

    // subscribe ActivityStore
    useEffect(() => {
        const unsub = activityStore.subscribe((acts) => setActivities(acts));
        return () => unsub();
    }, []);

    // โหลด study plans
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const user = auth.currentUser;
                if (!user) { setLoadingPlans(false); return; }
                const snap = await getDoc(doc(db, 'userStudyPlans', user.uid));
                if (snap.exists()) setStudyPlans(snap.data().plans || []);
            } catch (e) { console.error(e); }
            finally { setLoadingPlans(false); }
        };
        fetchPlans();
    }, []);

    const savePlans = async (plans) => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            await setDoc(doc(db, 'userStudyPlans', user.uid), { plans });
        } catch (e) { console.error(e); }
    };

    // ── Study Plans helpers ──
    const formatDate = (d) => d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const parseThaiDate = (s) => {
        if (s === "ไม่ระบุวัน") return new Date(9999, 0, 0);
        const p = s.split('/');
        return p.length === 3 ? new Date(parseInt(p[2]) - 543, parseInt(p[1]) - 1, parseInt(p[0])) : new Date(9999, 0, 0);
    };

    const addTask = () => {
        if (!taskTitle.trim()) { Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อแผนการเรียน"); return; }
        const t = { id: Date.now().toString(), title: taskTitle, date: taskDate || "ไม่ระบุวัน", done: false };
        const updated = [t, ...studyPlans];
        setStudyPlans(updated); savePlans(updated);
        setTaskModal(false); setTaskTitle(""); setTaskDate("");
    };

    const toggleDone = (id) => {
        const updated = studyPlans.map(i => i.id === id ? { ...i, done: !i.done } : i);
        setStudyPlans(updated); savePlans(updated);
    };

    const deleteTask = (id) => {
        Alert.alert("ลบ Task", "ยืนยันการลบ?", [
            { text: "ยกเลิก" },
            { text: "ลบ", style: "destructive", onPress: () => { const u = studyPlans.filter(t => t.id !== id); setStudyPlans(u); savePlans(u); } }
        ]);
    };

    // ── Activity form helpers ──
    const fmtTime = (d) => d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    const fmtDate = (d) => d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const pad = (n) => String(n).padStart(2, '0');

    const openAdd = () => {
        setEditingAct(null);
        setForm({ ...EMPTY_FORM, dateObj: new Date(), startObj: new Date(), endObj: new Date() });
        setActFormVisible(true);
    };

    const openEdit = (act) => {
        setEditingAct(act);
        const dateObj = act.date ? (() => { const [y, m, d] = act.date.split('-').map(Number); return new Date(y, m - 1, d); })() : new Date();
        const startObj = act.startTime ? (() => { const [h, min] = act.startTime.split(':').map(Number); const t = new Date(); t.setHours(h, min, 0, 0); return t; })() : new Date();
        const endObj = act.endTime ? (() => { const [h, min] = act.endTime.split(':').map(Number); const t = new Date(); t.setHours(h, min, 0, 0); return t; })() : new Date();
        setForm({
            title: act.title || '',
            dateStr: act.date ? fmtDate(dateObj) : '',
            dateObj,
            startStr: act.startTime ? fmtTime(startObj) : '',
            startObj,
            endStr: act.endTime ? fmtTime(endObj) : '',
            endObj,
            location: act.location || '',
            description: act.description || '',
            imageUrl: act.image || '',
        });
        setActFormVisible(true);
    };

    const handleSaveAct = () => {
        if (!form.title.trim()) { Alert.alert("แจ้งเตือน", "กรุณาใส่ชื่อกิจกรรม"); return; }
        const dateStr = form.dateStr ? `${form.dateObj.getFullYear()}-${pad(form.dateObj.getMonth() + 1)}-${pad(form.dateObj.getDate())}` : '';
        const startTime = form.startStr ? `${pad(form.startObj.getHours())}:${pad(form.startObj.getMinutes())}` : '';
        const endTime = form.endStr ? `${pad(form.endObj.getHours())}:${pad(form.endObj.getMinutes())}` : '';
        const item = {
            id: editingAct ? editingAct.id : Date.now().toString(),
            title: form.title.trim(),
            date: dateStr,
            startTime,
            endTime,
            location: form.location.trim(),
            description: form.description.trim(),
            image: form.imageUrl.trim(),
        };
        if (editingAct) activityStore.updateActivity(editingAct.id, item);
        else activityStore.addActivity(item);
        setActFormVisible(false);
    };

    const handleDeleteAct = (id) => {
        Alert.alert("ลบกิจกรรม", "ยืนยันการลบ?", [
            { text: "ยกเลิก" },
            { text: "ลบ", style: "destructive", onPress: () => { activityStore.deleteActivity(id); setActFormVisible(false); } }
        ]);
    };

    // ── Featured activities ──
    const now = new Date();
    const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const featuredWithStatus = FEATURED_ACTIVITIES.map(act => {
        const [y, m, d] = act.date.split('-').map(Number);
        const actMs = new Date(y, m - 1, d).getTime();
        return { ...act, _featured: true, isPast: actMs < todayMs, isToday: actMs === todayMs };
    });

    // ── User activities ──
    const userWithStatus = [...activities].map(act => {
        if (!act.date) return { ...act, _featured: false, isPast: false, isToday: false };
        const [y, m, d] = act.date.split('-').map(Number);
        const actMs = new Date(y, m - 1, d).getTime();
        return { ...act, _featured: false, isPast: actMs < todayMs, isToday: actMs === todayMs };
    });

    // ── Merge & sort all activities by date ──
    const allActivities = [...featuredWithStatus, ...userWithStatus].sort((a, b) => {
        const da = a.date || '';
        const db_ = b.date || '';
        if (!da && !db_) return 0;
        if (!da) return 1;
        if (!db_) return -1;
        return da.localeCompare(db_);
    });

    return (
        <View style={styles.container}>
            <View style={styles.topHeader}>
                <Text style={styles.topHeaderText}>Academic Life Planner</Text>
                <Ionicons name="pulse-outline" size={28} color="#fff" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                <View style={{ padding: 20 }}>
                    <Text style={styles.title}>Activity & Planner</Text>

                    {/* Tab selector */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === "activity" && styles.activeTab]}
                            onPress={() => setActiveTab("activity")}
                        >
                            <Text style={activeTab === "activity" ? styles.activeTabText : styles.inactiveTabText}>กิจกรรมเสริม</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === "study" && styles.activeTab]}
                            onPress={() => setActiveTab("study")}
                        >
                            <Text style={activeTab === "study" ? styles.activeTabText : styles.inactiveTabText}>เช็คลิสต์การเรียน</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ─── Tab: กิจกรรมเสริม ─── */}
                    {activeTab === "activity" && (
                        <>
                            <View style={styles.listHeader}>
                                <Text style={styles.sectionTitle}>ทั้งหมด {allActivities.length} รายการ</Text>
                                <TouchableOpacity style={[styles.addButton, { backgroundColor: '#FF9500' }]} onPress={openAdd}>
                                    <Ionicons name="add" size={20} color="#fff" />
                                    <Text style={styles.addText}> เพิ่มกิจกรรม</Text>
                                </TouchableOpacity>
                            </View>

                            {allActivities.length === 0 && (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="star-outline" size={60} color="#ddd" />
                                    <Text style={styles.emptyText}>ยังไม่มีกิจกรรม</Text>
                                </View>
                            )}

                            {allActivities.map((act) => (
                                <TouchableOpacity
                                    key={act.id}
                                    style={[styles.actCard, act.isPast && { opacity: 0.55 }]}
                                    onPress={() => setDetailAct(act)}
                                    activeOpacity={0.85}
                                >
                                    {act.image ? (
                                        <Image source={{ uri: act.image }} style={styles.actCardImage} resizeMode="cover" />
                                    ) : (
                                        <View style={styles.actCardImagePlaceholder}>
                                            <Ionicons name="star" size={32} color="#FF9500" />
                                        </View>
                                    )}
                                    <View style={styles.actCardContent}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
                                            <Text style={styles.actCardTitle} numberOfLines={1}>{act.title}</Text>
                                            <View style={[styles.statusBadge, act.isPast ? styles.badgePast : (act.isToday ? styles.badgeToday : styles.badgeFuture)]}>
                                                <Text style={styles.statusBadgeText}>
                                                    {act.isPast ? 'ผ่านไปแล้ว' : (act.isToday ? 'วันนี้!' : 'ยังไม่ถึง')}
                                                </Text>
                                            </View>
                                            {!act._featured && (
                                                <View style={styles.myBadge}><Text style={styles.myBadgeText}>ของฉัน</Text></View>
                                            )}
                                        </View>
                                        {(act.displayDate || act.date) ? (
                                            <View style={styles.actInfoRow}>
                                                <Ionicons name="calendar-outline" size={13} color="#FF9500" />
                                                <Text style={styles.actInfoText}>
                                                    {' '}{act.displayDate || act.date}
                                                    {(act.time || act.startTime) ? `  ·  ${act.time || act.startTime}${act.endTime ? ' – ' + act.endTime : ''}` : ''}
                                                </Text>
                                            </View>
                                        ) : null}
                                        {act.location ? (
                                            <View style={styles.actInfoRow}>
                                                <Ionicons name="location-outline" size={13} color="#888" />
                                                <Text style={styles.actInfoText} numberOfLines={1}> {act.location}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                    <Ionicons name="chevron-forward-outline" size={16} color="#ccc" style={{ alignSelf: 'center', marginRight: 8 }} />
                                </TouchableOpacity>
                            ))}
                        </>
                    )}

                    {/* ─── Tab: เช็คลิสต์การเรียน ─── */}
                    {activeTab === "study" && (
                        <>
                            <View style={styles.listHeader}>
                                <Text style={styles.sectionTitle}>แผนการเรียนของฉัน</Text>
                                <TouchableOpacity style={styles.addButton} onPress={() => setTaskModal(true)}>
                                    <Ionicons name="add" size={20} color="#fff" />
                                    <Text style={styles.addText}> เพิ่มแผน</Text>
                                </TouchableOpacity>
                            </View>

                            {loadingPlans && (
                                <View style={styles.emptyContainer}>
                                    <ActivityIndicator size="large" color="#ff3b3b" />
                                    <Text style={[styles.emptyText, { marginTop: 12 }]}>กำลังโหลด...</Text>
                                </View>
                            )}

                            {!loadingPlans && studyPlans.slice().sort((a, b) => {
                                if (a.done !== b.done) return a.done - b.done;
                                return parseThaiDate(a.date) - parseThaiDate(b.date);
                            }).map((item) => (
                                <View key={item.id} style={[styles.taskCard, item.done && { opacity: 0.6 }]}>
                                    <TouchableOpacity onPress={() => toggleDone(item.id)}>
                                        <Ionicons
                                            name={item.done ? "checkmark-circle" : "ellipse-outline"}
                                            size={24}
                                            color={item.done ? "#4CAF50" : "#ff3b3b"}
                                        />
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.taskTitle, item.done && { textDecorationLine: "line-through" }]}>{item.title}</Text>
                                        <Text style={styles.taskDate}>{item.date}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => deleteTask(item.id)}>
                                        <Ionicons name="trash-outline" size={18} color="#ccc" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {!loadingPlans && studyPlans.length === 0 && (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="document-text-outline" size={60} color="#ddd" />
                                    <Text style={styles.emptyText}>ยังไม่มีแผนการเรียน{'\n'}กดปุ่ม 'เพิ่มแผน' ได้เลย</Text>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>

            {/* ── Detail Modal (กดดูรายละเอียด) ── */}
            <Modal visible={!!detailAct} animationType="slide" transparent onRequestClose={() => setDetailAct(null)}>
                <View style={styles.actModalOverlay}>
                    <View style={[styles.actModalContent, { paddingBottom: 30 }]}>
                        {detailAct && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* รูปภาพ */}
                                {detailAct.image ? (
                                    <Image source={{ uri: detailAct.image }} style={styles.detailImage} resizeMode="cover" />
                                ) : (
                                    <View style={styles.detailImagePlaceholder}>
                                        <Ionicons name="star" size={48} color="#FF9500" />
                                    </View>
                                )}

                                {/* title + badge */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                                    <Text style={styles.detailTitle}>{detailAct.title}</Text>
                                    <View style={[styles.statusBadge, detailAct.isPast ? styles.badgePast : (detailAct.isToday ? styles.badgeToday : styles.badgeFuture)]}>
                                        <Text style={styles.statusBadgeText}>
                                            {detailAct.isPast ? 'ผ่านไปแล้ว' : (detailAct.isToday ? 'วันนี้!' : 'ยังไม่ถึง')}
                                        </Text>
                                    </View>
                                </View>

                                {/* วันที่ + เวลา */}
                                {(detailAct.displayDate || detailAct.date) && (
                                    <View style={styles.detailRow}>
                                        <Ionicons name="calendar-outline" size={16} color="#FF9500" />
                                        <Text style={styles.detailText}>
                                            {' '}{detailAct.displayDate || detailAct.date}
                                            {(detailAct.time || detailAct.startTime)
                                                ? `  ·  ${detailAct.time || detailAct.startTime}${detailAct.endTime ? ' – ' + detailAct.endTime : ''}`
                                                : ''}
                                        </Text>
                                    </View>
                                )}

                                {/* สถานที่ */}
                                {detailAct.location ? (
                                    <View style={styles.detailRow}>
                                        <Ionicons name="location-outline" size={16} color="#888" />
                                        <Text style={styles.detailText}> {detailAct.location}</Text>
                                    </View>
                                ) : null}

                                {/* รายละเอียด */}
                                {detailAct.description ? (
                                    <Text style={styles.detailDesc}>{detailAct.description}</Text>
                                ) : null}

                                {/* ปุ่ม */}
                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
                                    <TouchableOpacity
                                        style={[styles.btn, { backgroundColor: '#eee' }]}
                                        onPress={() => setDetailAct(null)}
                                    >
                                        <Text style={{ color: '#666', fontWeight: 'bold' }}>ปิด</Text>
                                    </TouchableOpacity>
                                    {/* เฉพาะกิจกรรม "ของฉัน" ถึงแก้/ลบได้ */}
                                    {!detailAct._featured && (
                                        <>
                                            <TouchableOpacity
                                                style={[styles.btn, { backgroundColor: '#333' }]}
                                                onPress={() => {
                                                    const act = detailAct;
                                                    setDetailAct(null);
                                                    setTimeout(() => handleDeleteAct(act.id), 300);
                                                }}
                                            >
                                                <Ionicons name="trash-outline" size={18} color="#fff" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.btn, { backgroundColor: '#FF9500', flex: 2 }]}
                                                onPress={() => {
                                                    const act = detailAct;
                                                    setDetailAct(null);
                                                    setTimeout(() => openEdit(act), 300);
                                                }}
                                            >
                                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>แก้ไข</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* ── Modal เพิ่มแผนการเรียน ── */}
            <Modal visible={taskModal} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>สร้างแผนการเรียนใหม่</Text>
                        <TextInput
                            placeholder="เช่น อ่านหนังสือสอบ Midterm"
                            style={styles.modalInput}
                            value={taskTitle}
                            onChangeText={setTaskTitle}
                        />
                        <TouchableOpacity style={styles.modalInput} onPress={() => setShowDatePicker(true)}>
                            <Text style={{ color: taskDate ? "#000" : "#999" }}>{taskDate || "ระบุวันที่"}</Text>
                        </TouchableOpacity>
                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.btn, { backgroundColor: "#eee" }]} onPress={() => setTaskModal(false)}>
                                <Text style={{ color: "#666" }}>ปิด</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, { backgroundColor: "#ff3b3b", flex: 2, marginLeft: 10 }]} onPress={addTask}>
                                <Text style={{ color: "#fff", fontWeight: "bold" }}>บันทึก</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── Modal เพิ่ม/แก้ไขกิจกรรม (Full Form) ── */}
            <Modal visible={actFormVisible} animationType="slide" transparent onRequestClose={() => setActFormVisible(false)}>
                <View style={styles.actModalOverlay}>
                    <View style={styles.actModalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>{editingAct ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}</Text>

                            {/* ชื่อกิจกรรม */}
                            <Text style={styles.fieldLabel}>ชื่อกิจกรรม *</Text>
                            <View style={styles.fieldBox}>
                                <Ionicons name="star-outline" size={18} color="#FF9500" style={styles.fieldIcon} />
                                <TextInput
                                    style={styles.fieldInput}
                                    placeholder="เช่น Job Fair 2026"
                                    value={form.title}
                                    onChangeText={v => setForm(f => ({ ...f, title: v }))}
                                />
                            </View>

                            {/* วันที่ */}
                            <Text style={styles.fieldLabel}>วันที่จัดกิจกรรม</Text>
                            <TouchableOpacity style={styles.fieldBox} onPress={() => setShowActDatePicker(true)}>
                                <Ionicons name="calendar-outline" size={18} color="#666" style={styles.fieldIcon} />
                                <Text style={{ color: form.dateStr ? "#000" : "#999", flex: 1, paddingVertical: 13 }}>{form.dateStr || "เลือกวันที่"}</Text>
                            </TouchableOpacity>

                            {/* เวลา */}
                            <Text style={styles.fieldLabel}>เวลา</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity style={[styles.fieldBox, { flex: 1 }]} onPress={() => setShowActStartPicker(true)}>
                                    <Ionicons name="time-outline" size={18} color="#666" style={styles.fieldIcon} />
                                    <Text style={{ color: form.startStr ? "#000" : "#999", flex: 1, paddingVertical: 13 }}>{form.startStr || "เริ่ม"}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.fieldBox, { flex: 1 }]} onPress={() => setShowActEndPicker(true)}>
                                    <Ionicons name="time-outline" size={18} color="#666" style={styles.fieldIcon} />
                                    <Text style={{ color: form.endStr ? "#000" : "#999", flex: 1, paddingVertical: 13 }}>{form.endStr || "สิ้นสุด"}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* สถานที่ */}
                            <Text style={styles.fieldLabel}>สถานที่</Text>
                            <View style={styles.fieldBox}>
                                <Ionicons name="location-outline" size={18} color="#666" style={styles.fieldIcon} />
                                <TextInput
                                    style={styles.fieldInput}
                                    placeholder="เช่น ห้องคอนเวนชั่น"
                                    value={form.location}
                                    onChangeText={v => setForm(f => ({ ...f, location: v }))}
                                />
                            </View>

                            {/* รายละเอียด */}
                            <Text style={styles.fieldLabel}>รายละเอียด</Text>
                            <View style={[styles.fieldBox, { alignItems: 'flex-start' }]}>
                                <Ionicons name="document-text-outline" size={18} color="#666" style={[styles.fieldIcon, { paddingTop: 13 }]} />
                                <TextInput
                                    style={[styles.fieldInput, { height: 80, textAlignVertical: 'top' }]}
                                    placeholder="รายละเอียดเพิ่มเติม..."
                                    value={form.description}
                                    onChangeText={v => setForm(f => ({ ...f, description: v }))}
                                    multiline
                                />
                            </View>

                            {/* URL รูปภาพ */}
                            <Text style={styles.fieldLabel}>URL รูปภาพ (ถ้ามี)</Text>
                            <View style={styles.fieldBox}>
                                <Ionicons name="image-outline" size={18} color="#666" style={styles.fieldIcon} />
                                <TextInput
                                    style={styles.fieldInput}
                                    placeholder="https://..."
                                    value={form.imageUrl}
                                    onChangeText={v => setForm(f => ({ ...f, imageUrl: v }))}
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* ปุ่ม */}
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                {editingAct && (
                                    <TouchableOpacity
                                        style={[styles.btn, { backgroundColor: '#333', flex: 1 }]}
                                        onPress={() => handleDeleteAct(editingAct.id)}
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#fff" />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.btn, { backgroundColor: '#eee', flex: 1 }]}
                                    onPress={() => setActFormVisible(false)}
                                >
                                    <Text style={{ color: '#666', fontWeight: 'bold' }}>ยกเลิก</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, { backgroundColor: '#FF9500', flex: 2 }]}
                                    onPress={handleSaveAct}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{editingAct ? 'บันทึก' : 'เพิ่มกิจกรรม'}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {showDatePicker && (
                <DateTimePicker value={selectedDate} mode="date" display="default"
                    onChange={(e, d) => { setShowDatePicker(false); if (d) { setSelectedDate(d); setTaskDate(formatDate(d)); } }} />
            )}
            {showActDatePicker && (
                <DateTimePicker value={form.dateObj} mode="date" display="default"
                    onChange={(e, d) => { setShowActDatePicker(false); if (d) setForm(f => ({ ...f, dateObj: d, dateStr: fmtDate(d) })); }} />
            )}
            {showActStartPicker && (
                <DateTimePicker value={form.startObj} mode="time" display="default" is24Hour
                    onChange={(e, t) => { setShowActStartPicker(false); if (t) setForm(f => ({ ...f, startObj: t, startStr: fmtTime(t) })); }} />
            )}
            {showActEndPicker && (
                <DateTimePicker value={form.endObj} mode="time" display="default" is24Hour
                    onChange={(e, t) => { setShowActEndPicker(false); if (t) setForm(f => ({ ...f, endObj: t, endStr: fmtTime(t) })); }} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FDFDFD" },
    topHeader: {
        backgroundColor: "#ff3b3b",
        paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5,
    },
    topHeaderText: { color: "#fff", fontWeight: "bold", fontSize: 24 },
    title: { fontSize: 32, fontWeight: "800", color: "#1a1a1a", marginBottom: 20 },
    tabContainer: {
        flexDirection: "row", backgroundColor: "#F1F3F5",
        borderRadius: 20, padding: 6, marginBottom: 25,
    },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 16 },
    activeTab: { backgroundColor: "#fff", elevation: 3 },
    activeTabText: { color: "#ff3b3b", fontWeight: "bold" },
    inactiveTabText: { color: "#adb5bd" },
    listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#444" },
    addButton: {
        flexDirection: "row", backgroundColor: "#ff3b3b",
        paddingVertical: 8, paddingHorizontal: 15, borderRadius: 12, alignItems: "center",
    },
    addText: { color: "#fff", fontWeight: "bold", fontSize: 13 },

    // Activity cards
    actCard: {
        backgroundColor: "#fff", borderRadius: 20, marginBottom: 16,
        overflow: "hidden", elevation: 3,
        borderWidth: 1, borderColor: "#F1F1F1",
        flexDirection: 'row', alignItems: 'flex-start',
    },
    actCardImage: { width: 80, height: 80 },
    actCardImagePlaceholder: {
        width: 80, height: 80, backgroundColor: '#FFF7EE',
        justifyContent: 'center', alignItems: 'center',
    },
    actCardContent: { flex: 1, padding: 12 },
    actCardTitle: { fontSize: 15, fontWeight: "700", color: "#222", flexShrink: 1 },
    actInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
    actInfoText: { fontSize: 12, color: "#888" },
    actDesc: { fontSize: 12, color: "#aaa", marginTop: 4, fontStyle: 'italic' },

    sectionSubTitle: { fontSize: 14, fontWeight: '700', color: '#888', marginBottom: 12, letterSpacing: 0.5 },

    // Status badge
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
    statusBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
    badgePast: { backgroundColor: '#aaa' },
    badgeToday: { backgroundColor: '#FF9500' },
    badgeFuture: { backgroundColor: '#34C759' },

    // Task cards
    taskCard: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#fff", padding: 18, borderRadius: 18,
        marginBottom: 12, borderWidth: 1, borderColor: "#F1F1F1",
    },
    taskTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
    taskDate: { fontSize: 12, color: "#999", marginTop: 2 },

    emptyContainer: { alignItems: "center", marginTop: 50 },
    emptyText: { color: "#999", marginTop: 15, textAlign: "center", lineHeight: 22 },

    // Modals
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
    modalBox: { backgroundColor: "#fff", borderRadius: 25, padding: 25 },
    actModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    actModalContent: {
        backgroundColor: "#fff", borderTopLeftRadius: 25, borderTopRightRadius: 25,
        padding: 25, maxHeight: '90%',
    },
    modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20, color: '#1a1a1a' },
    modalInput: {
        backgroundColor: "#F8F9FA", borderRadius: 12, padding: 15,
        marginBottom: 15, borderWidth: 1, borderColor: "#EEE"
    },

    // Full form fields
    fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 8 },
    fieldBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F8F9FA', borderRadius: 12,
        borderWidth: 1, borderColor: '#EEE', marginBottom: 4,
    },
    fieldIcon: { paddingHorizontal: 12 },
    fieldInput: { flex: 1, padding: 13, fontSize: 15, color: '#333' },

    row: { flexDirection: "row" },
    btn: { flex: 1, padding: 15, borderRadius: 12, alignItems: "center" },
});
