import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Modal,
    Alert,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Planner() {
    const [activeTab, setActiveTab] = useState("activity");

    // States ข้อมูล
    const [activities, setActivities] = useState([]);
    const [studyPlans, setStudyPlans] = useState([]);

    // States สำหรับ Modal
    const [activityModal, setActivityModal] = useState(false);
    const [taskModal, setTaskModal] = useState(false);

    // States สำหรับ Form กิจกรรม
    const [activityTitle, setActivityTitle] = useState("");
    const [activityType, setActivityType] = useState("ทั่วไป"); // หมวดหมู่กิจกรรม
    const [activityDate, setActivityDate] = useState("");
    const [activityTime, setActivityTime] = useState("");
    const [activityDetail, setActivityDetail] = useState("");

    // States สำหรับ Form แผนการเรียน
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDate, setTaskDate] = useState("");

    // Date/Time Picker
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [pickerMode, setPickerMode] = useState("activity"); // 'activity' หรือ 'task'

    // ===== Helper Functions =====
    const resetActivityForm = () => {
        setActivityTitle("");
        setActivityType("ทั่วไป");
        setActivityDate("");
        setActivityTime("");
        setActivityDetail("");
    };

    const resetTaskForm = () => {
        setTaskTitle("");
        setTaskDate("");
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น.";
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // ===== Date/Time Picker Handlers =====
    const onDateChange = (event, selected) => {
        setShowDatePicker(false);
        if (selected) {
            setSelectedDate(selected);
            const dateStr = formatDate(selected);
            if (pickerMode === "activity") setActivityDate(dateStr);
            else setTaskDate(dateStr);
        }
    };

    const onTimeChange = (event, selected) => {
        setShowTimePicker(false);
        if (selected) {
            setSelectedDate(selected);
            setActivityTime(formatTime(selected));
        }
    };

    // ===== Logic: เพิ่ม/ลบ กิจกรรม =====
    const addActivity = () => {
        if (!activityTitle.trim() || !activityDate) {
            Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่อกิจกรรมและเลือกวันที่");
            return;
        }

        const newActivity = {
            id: Date.now().toString(),
            title: activityTitle,
            type: activityType,
            date: activityDate,
            time: activityTime,
            detail: activityDetail,
            createdAt: new Date(),
        };

        setActivities([newActivity, ...activities]);
        setActivityModal(false);
        resetActivityForm();
    };

    const deleteActivity = (id) => {
        Alert.alert("ลบกิจกรรม", "คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?", [
            { text: "ยกเลิก" },
            { text: "ลบ", style: "destructive", onPress: () => setActivities(activities.filter(a => a.id !== id)) }
        ]);
    };

    // ===== Logic: เพิ่ม/ลบ แผนการเรียน (Task) =====
    const addTask = () => {
        if (!taskTitle.trim()) {
            Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อแผนการเรียน");
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            title: taskTitle,
            date: taskDate || "ไม่ระบุวัน",
            done: false,
        };

        setStudyPlans([newTask, ...studyPlans]);
        setTaskModal(false);
        resetTaskForm();
    };

    const toggleDone = (id) => {
        setStudyPlans(studyPlans.map(item => item.id === id ? { ...item, done: !item.done } : item));
    };

    // สถิติสำหรับ Study Plan
    const pendingTasks = studyPlans.filter(t => !t.done).length;

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.topHeader}>
                <View>
                    <Text style={styles.brandText}>StudySync</Text>
                    <Text style={styles.topHeaderText}>Academic Life Planner</Text>
                </View>
                <Ionicons name="pulse-outline" size={28} color="#fff" />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.title}>Activity & Planner</Text>
                <Text style={styles.subtitle}>จัดการตารางชีวิตและเป้าหมายการเรียน</Text>

                {/* Tab Switcher */}
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

                {/* Summary Mini-Card */}
                {activeTab === "study" && studyPlans.length > 0 && (
                    <View style={styles.summaryCard}>
                        <Ionicons name="book" size={20} color="#ff3b3b" />
                        <Text style={styles.summaryText}>
                            เหลืออีก {pendingTasks} งานที่ต้องทำให้สำเร็จ!
                        </Text>
                    </View>
                )}

                {/* List Content */}
                <View style={styles.listHeader}>
                    <Text style={styles.sectionTitle}>
                        {activeTab === "activity" ? "รายการกิจกรรม" : "แผนที่วางไว้"}
                    </Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            if (activeTab === "activity") {
                                setPickerMode("activity");
                                setActivityModal(true);
                            } else {
                                setPickerMode("task");
                                setTaskModal(true);
                            }
                        }}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.addText}> เพิ่มใหม่</Text>
                    </TouchableOpacity>
                </View>

                {/* Activity Render */}
                {activeTab === "activity" && activities.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <View style={styles.typeIndicator} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <View style={styles.row}>
                                <Ionicons name="time-outline" size={14} color="#666" />
                                <Text style={styles.dateText}> {item.date} | {item.time || "ไม่ระบุเวลา"}</Text>
                            </View>
                            <Text style={styles.typeTag}>{item.type}</Text>
                        </View>
                        <TouchableOpacity onPress={() => deleteActivity(item.id)}>
                            <Ionicons name="trash-outline" size={20} color="#ff3b3b" />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Study Plan Render */}
                {activeTab === "study" && studyPlans.map((item) => (
                    <View key={item.id} style={[styles.card, item.done && { opacity: 0.6 }]}>
                        <TouchableOpacity onPress={() => toggleDone(item.id)}>
                            <Ionicons
                                name={item.done ? "checkmark-circle" : "ellipse-outline"}
                                size={26}
                                color={item.done ? "#4CAF50" : "#ff3b3b"}
                            />
                        </TouchableOpacity>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.itemTitle, item.done && { textDecorationLine: "line-through" }]}>
                                {item.title}
                            </Text>
                            <Text style={styles.dateText}>{item.date}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setStudyPlans(studyPlans.filter(t => t.id !== item.id))}>
                            <Ionicons name="close-circle-outline" size={22} color="#ccc" />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Empty State */}
                {((activeTab === "activity" && activities.length === 0) || 
                  (activeTab === "study" && studyPlans.length === 0)) && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="clipboard-outline" size={50} color="#ccc" />
                        <Text style={styles.emptyText}>ยังไม่มีข้อมูลในส่วนนี้</Text>
                    </View>
                )}
            </ScrollView>

            {/* Modal: Activity */}
            <Modal visible={activityModal} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>เพิ่มกิจกรรมใหม่</Text>
                            <TouchableOpacity onPress={() => setActivityModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            placeholder="เช่น ประชุมสโมสร, งานสัมมนา"
                            style={styles.modalInput}
                            value={activityTitle}
                            onChangeText={setActivityTitle}
                        />

                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.modalInput, { flex: 1, marginRight: 5 }]} onPress={() => setShowDatePicker(true)}>
                                <Text style={{ color: activityDate ? "#000" : "#999" }}>
                                    {activityDate || "วันที่"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalInput, { flex: 1, marginLeft: 5 }]} onPress={() => setShowTimePicker(true)}>
                                <Text style={{ color: activityTime ? "#000" : "#999" }}>
                                    {activityTime || "เวลา"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            placeholder="ประเภทกิจกรรม (เช่น งานกลุ่ม, แข่งขัน)"
                            style={styles.modalInput}
                            value={activityType}
                            onChangeText={setActivityType}
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={addActivity}>
                            <Text style={styles.saveButtonText}>บันทึกกิจกรรม</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal: Study Task */}
            <Modal visible={taskModal} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>เพิ่มแผนการเรียน / Task</Text>
                        <TextInput
                            placeholder="เช่น อ่านบทที่ 1, ทำ Lab ฟิสิกส์"
                            style={styles.modalInput}
                            value={taskTitle}
                            onChangeText={setTaskTitle}
                        />
                        <TouchableOpacity style={styles.modalInput} onPress={() => setShowDatePicker(true)}>
                            <Text style={{ color: taskDate ? "#000" : "#999" }}>
                                {taskDate || "กำหนดส่ง / วันที่ทำ"}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.saveButton, { flex: 1, backgroundColor: "#ccc", marginRight: 10 }]} onPress={() => setTaskModal(false)}>
                                <Text style={styles.saveButtonText}>ยกเลิก</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveButton, { flex: 2 }]} onPress={addTask}>
                                <Text style={styles.saveButtonText}>เพิ่มแผน</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                />
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    display="clock"
                    onChange={onTimeChange}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FA" },
    topHeader: { 
        backgroundColor: "#ff3b3b", 
        paddingHorizontal: 20, 
        paddingTop: 60, 
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
    },
    brandText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "bold", letterSpacing: 1 },
    topHeaderText: { color: "#fff", fontWeight: "bold", fontSize: 22 },
    title: { fontSize: 26, fontWeight: "800", color: "#1a1a1a", marginTop: 10 },
    subtitle: { color: "#666", fontSize: 14, marginBottom: 20 },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#E9ECEF",
        borderRadius: 15,
        padding: 5,
        marginBottom: 20,
    },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12 },
    activeTab: { backgroundColor: "#fff", elevation: 2 },
    activeTabText: { color: "#ff3b3b", fontWeight: "bold" },
    inactiveTabText: { color: "#6c757d" },
    summaryCard: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        borderLeftWidth: 5,
        borderLeftColor: "#ff3b3b",
        elevation: 2,
    },
    summaryText: { marginLeft: 10, fontWeight: "600", color: "#333" },
    listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
    addButton: {
        flexDirection: "row",
        backgroundColor: "#ff3b3b",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: "center",
        elevation: 3,
    },
    addText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
    },
    typeIndicator: { width: 4, height: 40, backgroundColor: "#ff3b3b", borderRadius: 2, marginRight: 15 },
    itemTitle: { fontSize: 16, fontWeight: "700", color: "#2d3436", marginBottom: 4 },
    row: { flexDirection: "row", alignItems: "center" },
    dateText: { fontSize: 13, color: "#636e72" },
    typeTag: { 
        backgroundColor: "#F1F3F5", 
        color: "#495057", 
        fontSize: 11, 
        paddingHorizontal: 8, 
        paddingVertical: 2, 
        borderRadius: 5,
        marginTop: 6,
        alignSelf: 'flex-start'
    },
    emptyContainer: { alignItems: "center", marginTop: 40, opacity: 0.5 },
    emptyText: { marginTop: 10, color: "#999" },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },
    modalBox: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        paddingBottom: 40,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
    modalInput: {
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#E9ECEF",
    },
    saveButton: {
        backgroundColor: "#ff3b3b",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
