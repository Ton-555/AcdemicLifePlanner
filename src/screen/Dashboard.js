import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import timetableStore from '../data/TimetableStore';

// ─── ฟังก์ชันช่วยเหลือเรื่องเวลาและวันที่ ───
const genTimeBlock = (day, hour, minute, date = null) =>
    ({ day, time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, date });

const DAY_MAP = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const WEEKDAY_NUM = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };

// แปลงข้อมูลกิจกรรมให้กลายเป็น Object Date จริงๆ ตามวันที่อ้างอิง
const itemToDate = (item, refDate) => {
    if (!item?.startTime) return null;
    const { day, time, date } = item.startTime;
    const [hh, mm] = (time || '00:00').split(':').map(Number);

    if (date) {
        const [y, m, d] = date.split('-').map(Number);
        if (y && m && d) return new Date(y, m - 1, d, hh, mm);
    }
    if (day) {
        const target = WEEKDAY_NUM[day.toUpperCase()];
        if (typeof target === 'number') {
            const ref = new Date(refDate);
            const today = ref.getDay();
            let diff = (target - today + 7) % 7;
            if (diff === 0) {
                const nowMins = ref.getHours() * 60 + ref.getMinutes();
                if (hh * 60 + mm <= nowMins) diff = 7;
            }
            return new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + diff, hh, mm);
        }
    }
    return null;
};

// คำนวณขอบเขตเวลา (เริ่ม - จบ) ตามช่วงที่เลือก (วันนี้, สัปดาห์หน้า, เดือนหน้า)
const getRangeMs = (period) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    if (period === 'today') {
        return {
            from: startOfToday.getTime(),
            to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime(),
        };
    }
    if (period === 'week') {
        const start = new Date(startOfToday); start.setDate(start.getDate() + 1);
        const end = new Date(startOfToday); end.setDate(end.getDate() + 7); end.setHours(23, 59, 59);
        return { from: start.getTime(), to: end.getTime() };
    }
    const start = new Date(startOfToday); start.setDate(start.getDate() + 1);
    const end = new Date(startOfToday); end.setDate(end.getDate() + 30); end.setHours(23, 59, 59);
    return { from: start.getTime(), to: end.getTime() };
};

const FILTERS = [
    { key: 'today', label: 'วันนี้', icon: 'today-outline' },
    { key: 'week', label: 'สัปดาห์หน้า', icon: 'calendar-outline' },
    { key: 'month', label: 'เดือนหน้า', icon: 'calendar-clear-outline' },
];

const thaiDayShort = { MON: 'จ', TUE: 'อ', WED: 'พ', THU: 'พฤ', FRI: 'ศ', SAT: 'ส', SUN: 'อา' };

const fmtTime = (t) => t || '-';

// ─── หน้าจอ Dashboard ───
const Dashboard = ({ navigation }) => {
    // ข้อมูลจาก Store และเวลาปัจจุบัน
    const [classes, setClasses] = useState(timetableStore.getClasses());
    const [exams, setExams] = useState(timetableStore.getExams());
    const [nowMs, setNowMs] = useState(Date.now());

    // สถานะตัวกรอง (วันนี้ / สัปดาห์หน้า / เดือนหน้า)
    const [period, setPeriod] = useState('today');

    // สถานะของ Pop-up "เพิ่มด่วน"
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

    // สมัครรับการอัปเดตข้อมูลจาก Store หากมีการเปลี่ยนแปลงตาราง
    useEffect(() => {
        const unsub = timetableStore.subscribe(({ classes: nc, exams: ne }) => {
            setClasses(nc);
            setExams(ne);
        });
        // อัปเดตเวลาปัจจุบันทุกๆ 1 นาที
        const tick = setInterval(() => setNowMs(Date.now()), 60_000);
        return () => { unsub(); clearInterval(tick); };
    }, []);

    // ตัวกรองกิจกรรมตามช่วงเวลาที่เลือก
    const { filteredClasses, filteredExams } = useMemo(() => {
        const { from, to } = getRangeMs(period);
        const now = new Date(nowMs);

        // กรองวิชาเรียนให้อยู่ในช่วงเวลาที่เลือก
        const fc = (classes || []).filter(item => {
            const d = itemToDate(item, now);
            return d && d.getTime() >= from && d.getTime() <= to;
        }).sort((a, b) => (itemToDate(a, now)?.getTime() || 0) - (itemToDate(b, now)?.getTime() || 0));

        // กรองการสอบให้อยู่ในช่วงเวลาที่เลือก
        const fe = (exams || []).filter(item => {
            const d = itemToDate(item, now);
            return d && d.getTime() >= from && d.getTime() <= to;
        }).sort((a, b) => (itemToDate(a, now)?.getTime() || 0) - (itemToDate(b, now)?.getTime() || 0));

        return { filteredClasses: fc, filteredExams: fe };
    }, [classes, exams, period, nowMs]);

    const fmtDisplay = (d) =>
        d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

    // ล้างค่าฟอร์มการ "เพิ่มด่วน"
    const resetQuickAdd = () => {
        setQuickTitle(""); setQuickType("Activity"); setQuickDay(1);
        setQuickStartTimeObj(new Date()); setQuickStartTimeStr("");
        setQuickEndTimeObj(new Date()); setQuickEndTimeStr("");
        setModalVisible(false);
    };

    // ฟังก์ชันเช็คว่าเวลาของกิจกรรมใหม่ ที่จะเพิ่ม ชนกับอันเดิมที่มีอยู่ไหม
    const checkOverlap = (newItem, list) =>
        list.some(ex => {
            if (ex.startTime.day !== newItem.startTime.day) return false;
            const toMin = ([h, m]) => h * 60 + m;
            const es = toMin(ex.startTime.time.split(':').map(Number));
            const ee = toMin(ex.endTime.time.split(':').map(Number));
            const ns = toMin(newItem.startTime.time.split(':').map(Number));
            const ne = toMin(newItem.endTime.time.split(':').map(Number));
            return ns < ee && ne > es;
        });

    // ฟังก์ชันเมื่อกดยืนยันการ "เพิ่มด่วน"
    const handleAdd = () => {
        if (!quickTitle.trim()) { Alert.alert("แจ้งเตือน", "กรุณาใส่ชื่อวิชา / กิจกรรม"); return; }
        if (!quickStartTimeStr || !quickEndTimeStr) { Alert.alert("แจ้งเตือน", "กรุณาเลือกเวลาเริ่มและเวลาสิ้นสุด"); return; }
        const ss = quickStartTimeObj.getHours() * 60 + quickStartTimeObj.getMinutes();
        const es = quickEndTimeObj.getHours() * 60 + quickEndTimeObj.getMinutes();
        if (es <= ss) { Alert.alert("เวลาไม่ถูกต้อง", "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มเสมอ"); return; }
        const selDay = DAY_MAP[quickDay - 1];
        const newItem = {
            title: quickTitle,
            startTime: genTimeBlock(selDay, quickStartTimeObj.getHours(), quickStartTimeObj.getMinutes()),
            endTime: genTimeBlock(selDay, quickEndTimeObj.getHours(), quickEndTimeObj.getMinutes()),
            location: 'ไม่ระบุสถานที่',
            extra_descriptions: [],
        };
        const list = quickType === "Activity" ? classes : exams;
        if (checkOverlap(newItem, list)) {
            Alert.alert("เวลาทับซ้อน", "เวลาที่เลือกทับซ้อนกับรายการที่มีอยู่แล้ว");
            return;
        }
        quickType === "Activity" ? timetableStore.addClass(newItem) : timetableStore.addExam(newItem);
        resetQuickAdd();
    };

    const periodLabel = FILTERS.find(f => f.key === period)?.label || '';

    return (
        <View style={styles.container}>

            <View style={styles.topHeader}>
                <Text style={styles.topHeaderText}>Academic Life Planner</Text>
                <Ionicons name="home-outline" size={26} color="#fff" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <View style={styles.titleRow}>
                    <Text style={styles.title}>Dashboard</Text>
                    <TouchableOpacity style={styles.addButton} onPress={() => { resetQuickAdd(); setModalVisible(true); }}>
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.addText}> เพิ่มด่วน</Text>
                    </TouchableOpacity>
                </View>

                {/* ตัวกรองช่วงเวลา (แบบแคปซูล) */}
                <View style={styles.filterRow}>
                    {FILTERS.map(f => {
                        const active = period === f.key;
                        return (
                            <TouchableOpacity
                                key={f.key}
                                style={[styles.pill, active && styles.pillActive]}
                                onPress={() => setPeriod(f.key)}
                                activeOpacity={0.75}
                            >
                                <Ionicons name={f.icon} size={14} color={active ? '#fff' : '#888'} />
                                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                                    {' '}{f.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* การ์ดสถิติแสดงจำนวนคลาสเรียนและการสอบ */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Ionicons name="book-outline" size={24} color="#ff3b3b" />
                        <Text style={styles.statNum}>{filteredClasses.length}</Text>
                        <Text style={styles.statLabel}>คลาสเรียน</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="document-text-outline" size={24} color="#ff3b3b" />
                        <Text style={styles.statNum}>{filteredExams.length}</Text>
                        <Text style={styles.statLabel}>การสอบ</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="layers-outline" size={24} color="#ff3b3b" />
                        <Text style={styles.statNum}>{filteredClasses.length + filteredExams.length}</Text>
                        <Text style={styles.statLabel}>รวมทั้งหมด</Text>
                    </View>
                </View>

                {/* การ์ดแสดงรายการคลาสเรียน */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="book-outline" size={18} color="#ff3b3b" />
                        <Text style={styles.cardTitle}> คลาสเรียน – {periodLabel}</Text>
                    </View>

                    {filteredClasses.length === 0 ? (
                        <View style={styles.emptyRow}>
                            <Ionicons name="calendar-outline" size={36} color="#ddd" />
                            <Text style={styles.emptyText}>ไม่มีคลาสใน{periodLabel}</Text>
                        </View>
                    ) : (
                        filteredClasses.map((c, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.itemRow, i < filteredClasses.length - 1 && styles.itemRowBorder]}
                                onPress={() => navigation.navigate('Timetable', { selTable: 1 })}
                                activeOpacity={0.8}
                            >
                                <View style={styles.dayBadge}>
                                    <Text style={styles.dayBadgeText}>
                                        {thaiDayShort[c.startTime?.day] || c.startTime?.day || '-'}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemTitle}>{c.title}</Text>
                                    <Text style={styles.itemSub}>
                                        {fmtTime(c.startTime?.time)} – {fmtTime(c.endTime?.time)}
                                        {c.location ? `  ·  ${c.location}` : ''}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" size={16} color="#ccc" />
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="document-text-outline" size={18} color="#ff3b3b" />
                        <Text style={styles.cardTitle}> การสอบ – {periodLabel}</Text>
                    </View>

                    {filteredExams.length === 0 ? (
                        <View style={styles.emptyRow}>
                            <Ionicons name="clipboard-outline" size={36} color="#ddd" />
                            <Text style={styles.emptyText}>ไม่มีการสอบใน{periodLabel}</Text>
                        </View>
                    ) : (
                        filteredExams.map((ex, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.itemRow, i < filteredExams.length - 1 && styles.itemRowBorder]}
                                onPress={() => navigation.navigate('Timetable', { selTable: 2 })}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.dayBadge, { backgroundColor: '#FFF0F0' }]}>
                                    <Text style={[styles.dayBadgeText, { color: '#ff3b3b' }]}>
                                        {ex.startTime?.date
                                            ? ex.startTime.date.slice(8)
                                            : (thaiDayShort[ex.startTime?.day] || '-')}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemTitle}>{ex.title}</Text>
                                    <Text style={styles.itemSub}>
                                        {ex.startTime?.date
                                            ? `${ex.startTime.date}  ·  ${fmtTime(ex.startTime?.time)}`
                                            : fmtTime(ex.startTime?.time)}
                                        {ex.location ? `  ·  ${ex.location}` : ''}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" size={16} color="#ccc" />
                            </TouchableOpacity>
                        ))
                    )}
                </View>

            </ScrollView>

            {/* หน้าต่าง (Modal) สำหรับปุ่ม "เพิ่มด่วน" */}
            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>เพิ่มด่วน</Text>

                        <View style={styles.tabContainer}>
                            {[['Activity', 'ตารางเรียน'], ['Task', 'ตารางสอบ']].map(([k, label]) => (
                                <TouchableOpacity
                                    key={k}
                                    style={[styles.tabButton, quickType === k && styles.activeTab]}
                                    onPress={() => setQuickType(k)}
                                >
                                    <Text style={quickType === k ? styles.activeTabText : styles.inactiveTabText}>{label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.inputWrapper}>
                            <Ionicons name="create-outline" size={18} color="#666" style={styles.inputIcon} />
                            <TextInput placeholder="ชื่อวิชา / กิจกรรม" style={styles.input} value={quickTitle} onChangeText={setQuickTitle} />
                        </View>

                        <Text style={styles.quickLabel}>เลือกวัน:</Text>
                        <View style={styles.quickDayRow}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.quickDayButton, quickDay === i + 1 && styles.quickDayButtonActive]}
                                    onPress={() => setQuickDay(i + 1)}
                                >
                                    <Text style={[styles.quickDayText, quickDay === i + 1 && styles.quickDayTextActive]}>{d}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.quickLabel}>เลือกเวลา:</Text>
                        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                            <TouchableOpacity style={[styles.inputWrapper, { flex: 1, marginRight: 6 }]} onPress={() => setShowQuickStartPicker(true)}>
                                <Ionicons name="time-outline" size={18} color="#666" style={styles.inputIcon} />
                                <Text style={{ color: quickStartTimeStr ? "#000" : "#999", flex: 1, padding: 12 }}>{quickStartTimeStr || "เวลาเริ่ม"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.inputWrapper, { flex: 1, marginLeft: 6 }]} onPress={() => setShowQuickEndPicker(true)}>
                                <Ionicons name="time-outline" size={18} color="#666" style={styles.inputIcon} />
                                <Text style={{ color: quickEndTimeStr ? "#000" : "#999", flex: 1, padding: 12 }}>{quickEndTimeStr || "เวลาสิ้นสุด"}</Text>
                            </TouchableOpacity>
                        </View>

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
                <DateTimePicker value={quickStartTimeObj} mode="time" display="default" is24Hour onChange={(e, t) => { setShowQuickStartPicker(false); if (t) { setQuickStartTimeObj(t); setQuickStartTimeStr(fmtDisplay(t)); } }} />
            )}
            {showQuickEndPicker && (
                <DateTimePicker value={quickEndTimeObj} mode="time" display="default" is24Hour onChange={(e, t) => { setShowQuickEndPicker(false); if (t) { setQuickEndTimeObj(t); setQuickEndTimeStr(fmtDisplay(t)); } }} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA"
    },
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
    topHeaderText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold"
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40
    },

    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#1a1a1a"
    },
    addButton: {
        flexDirection: "row",
        backgroundColor: "#ff3b3b",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 12,
        alignItems: "center"
    },
    addText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 13
    },

    filterRow: {
        flexDirection: "row",
        marginBottom: 20,
        gap: 8
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E9ECEF",
        elevation: 1,
    },
    pillActive: {
        backgroundColor: "#ff3b3b",
        borderColor: "#ff3b3b"
    },
    pillText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#888"
    },
    pillTextActive: {
        color: "#fff"
    },
    statsCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        elevation: 2,
        borderWidth: 1,
        borderColor: "#E9ECEF",
    },
    statItem: {
        alignItems: "center",
        flex: 1
    },
    statNum: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1a1a1a",
        marginTop: 4
    },
    statLabel: {
        fontSize: 12,
        color: "#888",
        marginTop: 2
    },
    statDivider: {
        width: 1,
        height: 50,
        backgroundColor: "#E9ECEF"
    },
    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 20,
        elevation: 2,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#E9ECEF",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#ff3b3b"
    },

    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        gap: 12
    },
    itemRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#F1F3F5"
    },
    dayBadge: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#F1F3F5",
        justifyContent: "center",
        alignItems: "center",
    },
    dayBadgeText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#555"
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#222",
        marginBottom: 2
    },
    itemSub: {
        fontSize: 12,
        color: "#888"
    },

    emptyRow: {
        alignItems: "center",
        paddingVertical: 24,
        gap: 8
    },
    emptyText: {
        color: "#aaa",
        fontSize: 14
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.4)"
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 25,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#1a1a1a"
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#F1F3F5",
        borderRadius: 20,
        padding: 6,
        marginBottom: 20
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 16
    },
    activeTab: {
        backgroundColor: "#fff",
        elevation: 3
    },
    activeTabText: {
        color: "#ff3b3b",
        fontWeight: "bold"
    },
    inactiveTabText: {
        color: "#adb5bd"
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F3F5",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E9ECEF",
        marginBottom: 15
    },
    inputIcon: {
        paddingLeft: 12
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: "#333"
    },

    quickLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#555",
        marginBottom: 10
    },
    quickDayRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15
    },
    quickDayButton: {
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 10,
        backgroundColor: "#F1F3F5",
        alignItems: "center",
        minWidth: 40
    },
    quickDayButtonActive: {
        backgroundColor: "#ff3b3b"
    },
    quickDayText: {
        fontSize: 11,
        color: "#555",
        fontWeight: "600"
    },
    quickDayTextActive: {
        color: "#fff",
        fontWeight: "bold"
    },
    modalButtonRow: {
        flexDirection: "row"
    },
    modalButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: "center"
    },
});

export default Dashboard;