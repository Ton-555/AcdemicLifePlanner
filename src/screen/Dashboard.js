import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import timetableStore from '../data/TimetableStore';

const genTimeBlock = (day, hour, minute, date = null) => {
    return { day: day, time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, date: date };
};

const dayMap = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const Dashboard = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [quickType, setQuickType] = useState("Activity");
    const [quickTitle, setQuickTitle] = useState("");
    const [quickDay, setQuickDay] = useState(1);

    const [quickStartTimeObj, setQuickStartTimeObj] = useState(new Date());
    const [showQuickStartPicker, setShowQuickStartPicker] = useState(false);
    const [quickStartTimeStr, setQuickStartTimeStr] = useState("");

    const [quickEndTimeObj, setQuickEndTimeObj] = useState(new Date());
    const [showQuickEndPicker, setShowQuickEndPicker] = useState(false);
    const [quickEndTimeStr, setQuickEndTimeStr] = useState("");

    const formatDisplayTime = (date) => {
        return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น.";
    };

    const onChangeQuickStartTime = (event, selectedTime) => {
        setShowQuickStartPicker(false);
        if (selectedTime) {
            setQuickStartTimeObj(selectedTime);
            setQuickStartTimeStr(formatDisplayTime(selectedTime));
        }
    };

    const onChangeQuickEndTime = (event, selectedTime) => {
        setShowQuickEndPicker(false);
        if (selectedTime) {
            setQuickEndTimeObj(selectedTime);
            setQuickEndTimeStr(formatDisplayTime(selectedTime));
        }
    };

    const resetQuickAdd = () => {
        setQuickTitle("");
        setQuickType("Activity");
        setQuickDay(1);
        setQuickStartTimeObj(new Date());
        setQuickStartTimeStr("");
        setQuickEndTimeObj(new Date());
        setQuickEndTimeStr("");
        setModalVisible(false);
    };

    const [classes, setClasses] = useState(timetableStore.getClasses());
    const [exams, setExams] = useState(timetableStore.getExams());
    const [nowMs, setNowMs] = useState(Date.now());

    const itemToSortable = (item) => {
        try {
            if (!item || !item.startTime) return 0;
            const timeStr = item.startTime.time || '00:00';
            const [hh, mm] = timeStr.split(':').map(n => parseInt(n, 10) || 0);

            if (item.startTime.date) {
                const [y, m, d] = item.startTime.date.split('-').map(n => parseInt(n, 10));
                if (y && m && d) return new Date(y, m - 1, d, hh, mm, 0, 0).getTime();
            }

            if (item.startTime.day) {
                const weekdayMap = { MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 0 };
                const target = weekdayMap[item.startTime.day.toUpperCase()];
                if (typeof target === 'number') {
                    const now = new Date(nowMs);
                    const today = now.getDay();
                    let daysUntil = (target - today + 7) % 7;
                    if (daysUntil === 0) {
                        const nowMins = now.getHours() * 60 + now.getMinutes();
                        if (hh * 60 + mm <= nowMins) daysUntil = 7;
                    }
                    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntil, hh, mm, 0, 0).getTime();
                }
            }
        } catch (e) {
            return 0;
        }
        return 0;
    };

    const sortedClasses = (classes || []).slice().sort((a, b) => itemToSortable(a) - itemToSortable(b));
    const sortedExams = (exams || []).slice().sort((a, b) => itemToSortable(a) - itemToSortable(b));

    const pickNextOrRecent = (list) => {
        const now = new Date(nowMs).getTime();
        if (!list || list.length === 0) return { next: null, recent: null };
        const mapped = list.map(item => ({ item, ts: itemToSortable(item) }));
        const upcoming = mapped.filter(m => m.ts > now).sort((x, y) => x.ts - y.ts);
        if (upcoming.length > 0) return { next: upcoming[0].item, recent: null };
        const past = mapped.filter(m => m.ts <= now).sort((x, y) => y.ts - x.ts);
        return { next: null, recent: past.length > 0 ? past[0].item : null };
    };

    const { next: nextClass, recent: recentClass } = pickNextOrRecent(sortedClasses);
    const { next: nextExam, recent: recentExam } = pickNextOrRecent(sortedExams);

    const parseTime = (timeStr) => {
        const [hh, mm] = (timeStr || '00:00').split(':').map(n => parseInt(n, 10) || 0);
        return { hh, mm };
    };

    const getDateFor = (item, which = 'start') => {
        if (!item || !item.startTime) return null;
        const timeField = which === 'start' ? item.startTime : item.endTime || {};
        const timeStr = timeField.time || '00:00';
        const { hh, mm } = parseTime(timeStr);

        if (timeField.date) {
            const [y, m, d] = timeField.date.split('-').map(n => parseInt(n, 10));
            if (y && m && d) return new Date(y, m - 1, d, hh, mm, 0, 0);
        }

        if (timeField.day) {
            const weekdayMap = { MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 0 };
            const target = weekdayMap[timeField.day.toUpperCase()];
            if (typeof target === 'number') {
                const now = new Date(nowMs);
                const today = now.getDay();
                let daysUntil = (target - today + 7) % 7;
                if (daysUntil === 0) {
                    const nowMins = now.getHours() * 60 + now.getMinutes();
                    if (hh * 60 + mm <= nowMins) daysUntil = 7;
                }
                return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntil, hh, mm, 0, 0);
            }
        }

        return null;
    };

    const formatDuration = (ms) => {
        if (ms <= 0) return '0m';
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        if (days > 0) return `Starts in ${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
        return `Starts in ${minutes}m`;
    };

    const timeUntil = (item) => {
        const now = new Date(nowMs);
        const start = getDateFor(item, 'start');
        const end = getDateFor(item, 'end');
        if (start && start.getTime() > now.getTime()) {
            return formatDuration(start.getTime() - now.getTime());
        }
        if (end && end.getTime() > now.getTime()) {
            const ms = end.getTime() - now.getTime();
            const totalMinutes = Math.floor(ms / 60000);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            if (hours > 0) return `In progress - ends in ${hours}h ${minutes}m`;
            return `In progress - ends in ${minutes}m`;
        }
        return 'Ended';
    };

    useEffect(() => {
        const unsub = timetableStore.subscribe(({ classes: nc, exams: ne }) => {
            setClasses(nc);
            setExams(ne);
        });
        return () => unsub();
    }, []);

    const handleAdd = () => {
        if (!quickTitle.trim()) {
            Alert.alert("แจ้งเตือน", "กรุณาใส่ชื่อวิชา / กิจกรรม");
            return;
        }
        if (!quickStartTimeStr || !quickEndTimeStr) {
            Alert.alert("แจ้งเตือน", "กรุณาเลือกเวลาเริ่มและเวลาสิ้นสุด");
            return;
        }

        const startTotalMinutes = quickStartTimeObj.getHours() * 60 + quickStartTimeObj.getMinutes();
        const endTotalMinutes = quickEndTimeObj.getHours() * 60 + quickEndTimeObj.getMinutes();
        if (endTotalMinutes <= startTotalMinutes) {
            Alert.alert("เวลาไม่ถูกต้อง", "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มเสมอ");
            return;
        }

        const selectedDay = dayMap[quickDay - 1];
        const newItem = {
            title: quickTitle,
            startTime: genTimeBlock(selectedDay, quickStartTimeObj.getHours(), quickStartTimeObj.getMinutes()),
            endTime: genTimeBlock(selectedDay, quickEndTimeObj.getHours(), quickEndTimeObj.getMinutes()),
            location: 'ไม่ระบุสถานที่',
            extra_descriptions: []
        };

        if (quickType === "Activity") {
            timetableStore.addClass(newItem);
        } else {
            timetableStore.addExam(newItem);
        }

        resetQuickAdd();
    };

    return (
        <View style={styles.container}>
            {/* Top Header — matches Planner & Profile */}
            <View style={styles.topHeader}>
                <View>
                    <Text style={styles.topHeaderText}>Academic Life Planner</Text>
                </View>
                <Ionicons name="home-outline" size={26} color="#fff" />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Page Title Row */}
                <View style={styles.titleRow}>
                    <Text style={styles.title}>Dashboard</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => { resetQuickAdd(); setModalVisible(true); }}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.addText}> เพิ่มด่วน</Text>
                    </TouchableOpacity>
                </View>

                {/* Next Class Card */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('Timetable', { selTable: 1 })}
                    activeOpacity={0.85}
                >
                    <View style={styles.cardHeader}>
                        <Ionicons name="book-outline" size={18} color="#ff3b3b" />
                        <Text style={styles.cardTitle}> Next Class</Text>
                    </View>

                    {nextClass || recentClass ? (
                        (() => {
                            const c = nextClass || recentClass;
                            const timeStr = timeUntil(c);
                            const isEnded = timeStr === 'Ended';
                            return (
                                <View style={{ marginTop: 6 }}>
                                    <Text style={styles.subject}>{c.title}</Text>
                                    <Text style={styles.timeText}>
                                        {c.startTime.time} – {c.endTime.time}
                                    </Text>
                                    <View style={[styles.badge, isEnded && styles.badgeEnded]}>
                                        <Text style={[styles.badgeText, isEnded && styles.badgeTextEnded]}>
                                            {timeStr}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })()
                    ) : (
                        <View style={styles.emptyRow}>
                            <Ionicons name="calendar-outline" size={32} color="#ddd" />
                            <Text style={styles.emptyText}>ไม่มีรายการ</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Upcoming Exams Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="document-text-outline" size={18} color="#ff3b3b" />
                        <Text style={styles.cardTitle}> Upcoming Exams</Text>
                    </View>

                    {nextExam || recentExam ? (
                        (() => {
                            const ex = nextExam || recentExam;
                            const timeStr = timeUntil(ex);
                            const isEnded = timeStr === 'Ended';
                            return (
                                <TouchableOpacity
                                    style={styles.examItem}
                                    onPress={() => navigation.navigate('Timetable', { selTable: 2 })}
                                    activeOpacity={0.85}
                                >
                                    <View style={{ flex: 1, marginTop: 6 }}>
                                        <Text style={styles.subject}>{ex.title}</Text>
                                        <Text style={styles.timeText}>
                                            {ex.startTime.date || ex.startTime.time}
                                        </Text>
                                    </View>
                                    <View style={[styles.badge, isEnded && styles.badgeEnded]}>
                                        <Text style={[styles.badgeText, isEnded && styles.badgeTextEnded]}>
                                            {timeStr}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })()
                    ) : (
                        <View style={styles.emptyRow}>
                            <Ionicons name="clipboard-outline" size={32} color="#ddd" />
                            <Text style={styles.emptyText}>ไม่มีรายการ</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Quick Add Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>เพิ่มด่วน</Text>

                        {/* Type Toggle */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tabButton, quickType === "Activity" && styles.activeTab]}
                                onPress={() => setQuickType("Activity")}
                            >
                                <Text style={quickType === "Activity" ? styles.activeTabText : styles.inactiveTabText}>
                                    ตารางเรียน
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabButton, quickType === "Task" && styles.activeTab]}
                                onPress={() => setQuickType("Task")}
                            >
                                <Text style={quickType === "Task" ? styles.activeTabText : styles.inactiveTabText}>
                                    ตารางสอบ
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Title */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="create-outline" size={18} color="#666" style={styles.inputIcon} />
                            <TextInput
                                placeholder="ชื่อวิชา / กิจกรรม"
                                style={styles.input}
                                value={quickTitle}
                                onChangeText={setQuickTitle}
                            />
                        </View>

                        {/* Day Selector */}
                        <Text style={styles.quickLabel}>เลือกวัน:</Text>
                        <View style={styles.quickDayRow}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, index) => {
                                const dayNumber = index + 1;
                                return (
                                    <TouchableOpacity
                                        key={dayNumber}
                                        style={[styles.quickDayButton, quickDay === dayNumber && styles.quickDayButtonActive]}
                                        onPress={() => setQuickDay(dayNumber)}
                                    >
                                        <Text style={[styles.quickDayText, quickDay === dayNumber && styles.quickDayTextActive]}>
                                            {dayName}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Time Pickers */}
                        <Text style={styles.quickLabel}>เลือกเวลา:</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                            <TouchableOpacity
                                style={[styles.inputWrapper, { flex: 1, marginRight: 6 }]}
                                onPress={() => setShowQuickStartPicker(true)}
                            >
                                <Ionicons name="time-outline" size={18} color="#666" style={styles.inputIcon} />
                                <Text style={{ color: quickStartTimeStr ? "#000" : "#999", flex: 1, padding: 12 }}>
                                    {quickStartTimeStr || "เวลาเริ่ม"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.inputWrapper, { flex: 1, marginLeft: 6 }]}
                                onPress={() => setShowQuickEndPicker(true)}
                            >
                                <Ionicons name="time-outline" size={18} color="#666" style={styles.inputIcon} />
                                <Text style={{ color: quickEndTimeStr ? "#000" : "#999", flex: 1, padding: 12 }}>
                                    {quickEndTimeStr || "เวลาสิ้นสุด"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#eee" }]} onPress={resetQuickAdd}>
                                <Text style={{ color: "#666", fontWeight: "bold" }}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#ff3b3b", flex: 2, marginLeft: 10 }]} onPress={handleAdd}>
                                <Text style={{ color: "#fff", fontWeight: "bold" }}>เพิ่ม</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {showQuickStartPicker && (
                <DateTimePicker
                    value={quickStartTimeObj}
                    mode="time"
                    display="default"
                    is24Hour={true}
                    onChange={onChangeQuickStartTime}
                />
            )}

            {showQuickEndPicker && (
                <DateTimePicker
                    value={quickEndTimeObj}
                    mode="time"
                    display="default"
                    is24Hour={true}
                    onChange={onChangeQuickEndTime}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FA" },

    /* ── Top Header: identical pattern to Planner & Profile ── */
    topHeader: {
        backgroundColor: "#ff3b3b",
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
    },
    topHeaderText: { color: "#fff", fontSize: 24, fontWeight: "bold" },

    scrollContent: { padding: 20, paddingBottom: 40 },

    /* ── Title Row ── */
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 25,
    },
    title: { fontSize: 32, fontWeight: "800", color: "#1a1a1a" },
    addButton: {
        flexDirection: "row",
        backgroundColor: "#ff3b3b",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    addText: { color: "#fff", fontWeight: "bold", fontSize: 13 },

    /* ── Cards: same style as Profile card ── */
    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 20,
        elevation: 2,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#E9ECEF",
    },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    cardTitle: { fontSize: 16, fontWeight: "bold", color: "#ff3b3b" },

    subject: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 4 },
    timeText: { fontSize: 14, color: "#666", marginBottom: 10 },

    badge: {
        alignSelf: "flex-start",
        backgroundColor: "#FFF0F0",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#FECDD3",
    },
    badgeText: { fontSize: 13, color: "#ff3b3b", fontWeight: "bold" },
    badgeEnded: { backgroundColor: "#F1F3F5", borderColor: "#DEE2E6" },
    badgeTextEnded: { color: "#888" },

    examItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

    emptyRow: { alignItems: "center", paddingVertical: 20, gap: 8 },
    emptyText: { color: "#aaa", fontSize: 14 },

    /* ── Modal ── */
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 25,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },
    modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "#1a1a1a" },

    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#F1F3F5",
        borderRadius: 20,
        padding: 6,
        marginBottom: 20,
    },
    tabButton: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 16 },
    activeTab: { backgroundColor: "#fff", elevation: 3, shadowOpacity: 0.1 },
    activeTabText: { color: "#ff3b3b", fontWeight: "bold" },
    inactiveTabText: { color: "#adb5bd" },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F3F5",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E9ECEF",
        marginBottom: 15,
    },
    inputIcon: { paddingLeft: 12 },
    input: { flex: 1, padding: 12, fontSize: 16, color: "#333" },

    quickLabel: { fontSize: 14, fontWeight: "600", color: "#555", marginBottom: 10 },
    quickDayRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
    quickDayButton: {
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 10,
        backgroundColor: "#F1F3F5",
        alignItems: "center",
        minWidth: 40,
    },
    quickDayButtonActive: { backgroundColor: "#ff3b3b" },
    quickDayText: { fontSize: 11, color: "#555", fontWeight: "600" },
    quickDayTextActive: { color: "#fff", fontWeight: "bold" },

    modalButtonRow: { flexDirection: "row" },
    modalButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: "center",
    },
});

export default Dashboard;
