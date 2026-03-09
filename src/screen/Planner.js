import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Alert, Image, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Planner() {
    const [activeTab, setActiveTab] = useState("activity");
    const initialActivities = [
        {
            id: "1",
            title: "Job Fair 2026",
            date: "20 ก.พ. 2026",
            time: "09:00 - 16:00 น.",
            location: "ห้องคอนเวนชั่น มก.กำแพงแสน",
            image: "https://kps.ku.ac.th/v8/images/Satang/2569/Feb/613324.jpg",
        },
        {
            id: "2",
            title: "Lib Learn Life",
            date: "3 ก.พ. 2026",
            time: "10:00 - 20:00 น.",
            location: "สวนด้านหน้าสำนักงานบริหารจัดการการเรียนรู้",
            image: "https://scontent.fkdt2-1.fna.fbcdn.net/v/t39.30808-6/619260339_1478488657612149_5296629279182397039_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=13d280&_nc_ohc=qR7mPQGZClMQ7kNvwEL92rU&_nc_oc=AdnJBDo4a61UNuFLUHbLTwC2SYj3GWHzPiPTEod5IoW-Zef6-6qsCOVDkxcL1yWBi3Q&_nc_zt=23&_nc_ht=scontent.fkdt2-1.fna&_nc_gid=tHQ8DPCH0jEyNAkT2etBTw&oh=00_Afuq72HN_dDhdD8d6KI9D5ZXmuEhk_GuVFDv58VvA8N_xA&oe=699FA1F4",
        },
        {
            id: "3",
            title: "Music In The Garden",
            date: "10 มี.ค. 2026",
            time: "11:00 - 18:00 น.",
            location: "สนามกีฬาหลักและลานอเนกประสงค์กลาง",
            image: "https://scontent.fkdt2-1.fna.fbcdn.net/v/t39.30808-6/637807135_1231482309166679_4376201818258179145_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=13d280&_nc_ohc=pA5JcaCdhP8Q7kNvwEcnPR3&_nc_oc=AdkU2731yA-yO_oua-sPLFU5jGgeWNgKgOuDdcHIgvAkW7IHobascF_18z15ENQtLKE&_nc_zt=23&_nc_ht=scontent.fkdt2-1.fna&_nc_gid=kVL4f4vCTsn1UbtfGDSWQA&oh=00_AfuVsaad4mr_m2XAKO0x7sFs1UyHVGKkmNN-r0MRB9jLhg&oe=699FA8CA",
        },
    ];

    // State สำหรับจัดการแผนการเรียน (Study Plans)
    const [studyPlans, setStudyPlans] = useState([]);
    // State สำหรับควบคุมการแสดง Modal เพิ่มแผนการเรียน
    const [taskModal, setTaskModal] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // สำหรับรีเซ็ตฟอร์มเพิ่มแผนการเรียน
    const resetTaskForm = () => { setTaskTitle(""); setTaskDate(""); };
    const formatDate = (date) => {
        return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const parseThaiDate = (dateStr) => {
        if (dateStr === "ไม่ระบุวัน") {
            return new Date(9999, 0, 0); 
        }
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]) - 543, parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date(9999, 0, 0);
    };

    // การเลือกวันที่จาก DatePicker
    const onDateChange = (event, selected) => {
        setShowDatePicker(false);
        if (selected) {
            setSelectedDate(selected);
            setTaskDate(formatDate(selected));
        }
    };

    // เพิ่มแผนการเรียนใหม่
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

    // สลับสถานะ 'เสร็จสิ้น' ของแผนการเรียน
    const toggleDone = (id) => {
        setStudyPlans(studyPlans.map(item => item.id === id ? { ...item, done: !item.done } : item));
    };

    // ลบแผนการเรียน
    const handleDeleteTask = (id) => {
        Alert.alert("ลบ Task", "ยืนยันการลบ?", [
            { text: "ยกเลิก" },
            { text: "ลบ", onPress: () => setStudyPlans(prev => prev.filter(t => t.id !== id)), style: "destructive" }
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.topHeader}>
                <View>
                    <Text style={styles.topHeaderText}>Academic Life Planner</Text>
                </View>
                <Ionicons name="pulse-outline" size={28} color="#fff" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                <View style={{ padding: 20 }}>
                    <Text style={styles.title}>Activity & Planner</Text>
                    {/* ปุ่มสลับแท็บกิจกรรมเสริม/เช็คลิสต์การเรียน */}
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

                    <View style={styles.listHeader}>
                        <Text style={styles.sectionTitle}>
                            {activeTab === "activity" ? "กิจกรรมแนะนำสำหรับคุณ" : "แผนการเรียนของฉัน"}
                        </Text>
                        {/* ปุ่มเพิ่มแผนการเรียนเฉพาะในแท็บเช็คลิสต์การเรียน*/}
                        {activeTab === "study" && (
                            <TouchableOpacity style={styles.addButton} onPress={() => setTaskModal(true)}>
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text style={styles.addText}> เพิ่มแผน</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {activeTab === "activity" && initialActivities.map((item) => (
                        <View key={item.id} style={styles.largeCard}>
                            <Image
                                source={{ uri: item.image }}
                                style={styles.cardImage}
                                resizeMode="cover"
                            />
                            <View style={styles.cardContent}>
                                <Text style={styles.largeCardTitle}>{item.title}</Text>

                                <View style={styles.locationContainer}>
                                    <Ionicons name="location-outline" size={16} color="#666" />
                                    <Text style={styles.locationText}>{item.location}</Text>
                                </View>

                                <View style={styles.cardFooter}>
                                    <View style={styles.footerItem}>
                                        <Ionicons name="calendar-outline" size={14} color="#ff3b3b" />
                                        <Text style={styles.footerText}> {item.date}</Text>
                                    </View>
                                    <View style={styles.footerItem}>
                                        <Ionicons name="time-outline" size={14} color="#ff3b3b" />
                                        <Text style={styles.footerText}> {item.time}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}


                    {activeTab === "study" && studyPlans.slice().sort((a, b) => {
                        if (a.done !== b.done) {
                            return a.done - b.done;
                        }
                        const dateA = parseThaiDate(a.date);
                        const dateB = parseThaiDate(b.date);
                        return dateA - dateB;
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
                                <Text style={[styles.taskTitle, item.done && { textDecorationLine: "line-through" }]}>
                                    {item.title}
                                </Text>
                                <Text style={styles.taskDate}>{item.date}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setStudyPlans(studyPlans.filter(t => t.id !== item.id))}>
                                <Ionicons name="trash-outline" size={18} color="#ccc" />
                            </TouchableOpacity>
                        </View>
                    ))}

                    {activeTab === "study" && studyPlans.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={60} color="#ddd" />
                            <Text style={styles.emptyText}>ยังไม่มีแผนการเรียน กดปุ่ม 'เพิ่มแผน' ได้เลย</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* หน้าต่าง (Modal) สำหรับปุ่ม "เพิ่ม Task" */}
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
                            <Text style={{ color: taskDate ? "#000" : "#999" }}>
                                {taskDate || "ระบุวันที่"}
                            </Text>
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

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FDFDFD"
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
        fontWeight: "bold",
        fontSize: 24
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#1a1a1a",
        marginBottom: 20
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#F1F3F5",
        borderRadius: 20,
        padding: 6,
        marginBottom: 25,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 16
    },
    activeTab: {
        backgroundColor: "#fff",
        elevation: 3,
        shadowOpacity: 0.1
    },
    activeTabText: {
        color: "#ff3b3b",
        fontWeight: "bold"
    },
    inactiveTabText: {
        color: "#adb5bd"
    },
    listHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
    },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#444" },
    addButton: {
        flexDirection: "row",
        backgroundColor: "#ff3b3b",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    addText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 13
    },
    largeCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        marginBottom: 25,
        width: '100%',
        overflow: "hidden",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
    },
    cardImage: {
        width: '100%',
        aspectRatio: 16 / 9,
    },
    cardContent: {
        padding: 20
    },
    largeCardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#222",
        marginBottom: 8
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    locationText: {
        fontSize: 14,
        color: "#666",
        marginLeft: 4,
        flex: 1
    },
    cardFooter: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "#F1F1F1",
        paddingTop: 15
    },
    footerItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 20
    },
    footerText: {
        fontSize: 13,
        color: "#444",
        fontWeight: "500"
    },

    taskCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#F1F1F1",
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333"
    },
    taskDate: {
        fontSize: 12,
        color: "#999",
        marginTop: 2
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 50
    },
    emptyText: {
        color: "#999",
        marginTop: 15,
        textAlign: "center"
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20
    },
    modalBox: {
        backgroundColor: "#fff",
        borderRadius: 25,
        padding: 25
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center"
    },
    modalInput: {
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#EEE"
    },
    row: {
        flexDirection: "row"
    },
    btn: {
        flex: 1,
        padding: 15,
        borderRadius: 12,
        alignItems: "center"
    },
});
