import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import timetableStore from '../data/TimetableStore'

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

    // convert item -> timestamp for sorting
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

    // pick next upcoming or the most recent past item if none upcoming
    const pickNextOrRecent = (list) => {
        const now = new Date(nowMs).getTime();
        if (!list || list.length === 0) return { next: null, recent: null };
        const mapped = list.map(item => ({ item, ts: itemToSortable(item) }));
        const upcoming = mapped.filter(m => m.ts > now).sort((x, y) => x.ts - y.ts);
        if (upcoming.length > 0) return { next: upcoming[0].item, recent: null };
        // no upcoming: find the most recent past (largest ts <= now)
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
            // in progress
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
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Top Bar */}
                <View style={styles.topBar}>
                    <Text style={styles.topBarTitle}>Academic Life</Text>
                </View>

                {/* Header Row */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.pageTitle}>Dashboard</Text>
                        <Text style={styles.subtitle}>ตารางเรียนและตารางสอบ</Text>
                    </View>

                    <TouchableOpacity style={styles.headerQuickAdd} onPress={() => { resetQuickAdd(); setModalVisible(true); }}>
                        <Text style={styles.headerQuickAddText}>＋ เพิ่มด่วน</Text>
                    </TouchableOpacity>
                </View>

                {/* Next Class (single upcoming or most recent past) */}
                <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Timetable', { selTable: 1 })}>
                    <Text style={styles.cardTitle}>Next Class</Text>
                    {nextClass || recentClass ? (
                        (() => {
                            const c = nextClass || recentClass;
                            const timeStr = timeUntil(c);
                            const isEnded = timeStr === 'Ended';
                            return (
                                <View key={`cls-0`} style={{ marginBottom: 8 }}>
                                    <Text style={styles.subject}>{c.title}</Text>
                                    <Text style={[styles.time, isEnded && { color: '#000' }]}>{c.startTime.time} - {c.endTime.time}</Text>
                                    <Text style={[styles.countdown, isEnded && { color: '#C3002F' }]}>
                                        {timeStr}
                                    </Text>
                                </View>
                            );
                        })()
                    ) : (
                        <Text style={styles.subject}>ไม่มีรายการ</Text>
                    )}
                </TouchableOpacity>

                {/* Upcoming Exams */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Upcoming Exams</Text>

                    {nextExam || recentExam ? (
                        (() => {
                            const ex = nextExam || recentExam;
                            const timeStr = timeUntil(ex);
                            const isEnded = timeStr === 'Ended';
                            return (
                                <TouchableOpacity key={`ex-0`} style={styles.examItem} onPress={() => navigation.navigate('Timetable', { selTable: 2 })}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.examText}>{ex.title}</Text>
                                        <Text style={[styles.examDate, isEnded && { color: '#222' }]}>{ex.startTime.date || ex.startTime.time}</Text>
                                    </View>
                                    <Text style={[styles.countdown, { alignSelf: 'center' }, isEnded && { color: '#C3002F' }]}>
                                        {timeStr}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })()
                    ) : (
                        <Text style={{ color: '#666' }}>ไม่มีรายการ</Text>
                    )}
                </View>

            </ScrollView>

            {/* Removed bottom FAB (now header Quick Add) */}

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
                        <View style={{ flexDirection: "row", marginBottom: 12 }}>
                            <TouchableOpacity
                                style={[styles.typeButton, quickType === "Activity" && styles.typeButtonActive]}
                                onPress={() => setQuickType("Activity")}
                            >
                                <Text style={[styles.typeButtonText, quickType === "Activity" && styles.typeButtonTextActive]}>ตารางเรียน</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.typeButton, quickType === "Task" && styles.typeButtonActive]}
                                onPress={() => setQuickType("Task")}
                            >
                                <Text style={[styles.typeButtonText, quickType === "Task" && styles.typeButtonTextActive]}>ตารางสอบ</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Title */}
                        <TextInput
                            placeholder="ชื่อวิชา / กิจกรรม"
                            style={styles.input}
                            value={quickTitle}
                            onChangeText={setQuickTitle}
                        />

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
                                        <Text style={[styles.quickDayText, quickDay === dayNumber && styles.quickDayTextActive]}>{dayName}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Time Pickers */}
                        <Text style={styles.quickLabel}>เลือกเวลา:</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity style={[styles.input, { flex: 1, marginRight: 5 }]} onPress={() => setShowQuickStartPicker(true)}>
                                <Text style={{ color: quickStartTimeStr ? "#000" : "#999" }}>
                                    {quickStartTimeStr || "เวลาเริ่ม"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.input, { flex: 1, marginLeft: 5 }]} onPress={() => setShowQuickEndPicker(true)}>
                                <Text style={{ color: quickEndTimeStr ? "#000" : "#999" }}>
                                    {quickEndTimeStr || "เวลาสิ้นสุด"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={styles.modalButton} onPress={resetQuickAdd}>
                                <Text style={[styles.modalButtonText, { color: "#333" }]}>ยกเลิก</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#C3002F" }]} onPress={handleAdd}>
                                <Text style={styles.modalButtonText}>เพิ่ม</Text>
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
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF0F6",
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#C3002F"
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#C3002F"
    },
    subject: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 5
    },
    time: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5
    },
    countdown: {
        fontSize: 14,
        color: "#C3002F",
        fontWeight: "bold"
    },
    examItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f2f2f2"
    },
    examText: {
        fontSize: 16
    },
    examDate: {
        fontSize: 14,
        color: "#C3002F",
        fontWeight: "600"
    },
    fab: {
        position: "absolute",
        bottom: 25,
        right: 25,
        backgroundColor: "#C3002F",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
    },
    fabText: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold"
    }
    ,
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#333"
    },
    input: {
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    modalButtonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 6,
        backgroundColor: "#f2f2f2",
    },
    modalButtonText: {
        color: "#fff",
        fontWeight: "600"
    },
    typeButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
        marginRight: 8,
    },
    typeButtonActive: {
        backgroundColor: "#C3002F",
    },
    typeButtonText: {
        color: "#333",
        fontWeight: "600",
    },
    typeButtonTextActive: {
        color: "#fff",
    },
    quickLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    quickDayRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    quickDayButton: {
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 8,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
        minWidth: 40,
    },
    quickDayButtonActive: {
        backgroundColor: "#C3002F",
    },
    quickDayText: {
        fontSize: 11,
        color: "#333",
        fontWeight: "600",
    },
    quickDayTextActive: {
        color: "#fff",
        fontWeight: "bold",
    },
    topBar: {
        backgroundColor: "#C3002F",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    topBarTitle: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 18,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111",
    },
    subtitle: {
        color: "#666",
        marginTop: 4,
    },
    headerQuickAdd: {
        borderWidth: 1,
        borderColor: "#C3002F",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: "#fff",
    },
    headerQuickAddText: {
        color: "#C3002F",
        fontWeight: "700",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#FFE6EA",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
        color: "#C3002F"
    },
    examItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 0,
    },
    examText: {
        fontSize: 16,
        color: "#222"
    },
    examDate: {
        fontSize: 14,
        color: "#C3002F",
        fontWeight: "600"
    }
});

export default Dashboard;
