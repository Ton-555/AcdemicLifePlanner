import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from "react-native";

const Dashboard = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [quickType, setQuickType] = useState("Activity");
    const [quickTitle, setQuickTitle] = useState("");

    const handleAdd = () => {
        if (!quickTitle.trim()) {
            Alert.alert("กรุณาใส่ชื่อกิจกรรมหรือ Task");
            return;
        }

        // Placeholder: replace with actual save logic / navigation
        console.log("Quick Add:", { type: quickType, title: quickTitle });
        Alert.alert("Added", `${quickType}: ${quickTitle}`);

        // reset and close
        setQuickTitle("");
        setQuickType("Activity");
        setModalVisible(false);
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

                    <TouchableOpacity style={styles.headerQuickAdd} onPress={() => setModalVisible(true)}>
                        <Text style={styles.headerQuickAddText}>＋ เพิ่มด่วน</Text>
                    </TouchableOpacity>
                </View>

                {/* Next Class Card */}
                <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Timetable')}>
                    <Text style={styles.cardTitle}>📚 Next Class</Text>
                    <Text style={styles.subject}>Mathematics</Text>
                    <Text style={styles.time}>13:00 - 15:00</Text>
                    <Text style={styles.countdown}>Starts in 1h 20m</Text>
                </TouchableOpacity>

                {/* Upcoming Exams */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📝 Upcoming Exams</Text>

                    <TouchableOpacity style={styles.examItem} onPress={() => navigation.navigate('Timetable')}>
                        <Text style={styles.examText}>Physics</Text>
                        <Text style={styles.examDate}>2 days left</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.examItem} onPress={() => navigation.navigate('Timetable')}>
                        <Text style={styles.examText}>English</Text>
                        <Text style={styles.examDate}>5 days left</Text>
                    </TouchableOpacity>
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
                        <Text style={styles.modalTitle}>Quick Add</Text>

                        <View style={{ flexDirection: "row", marginBottom: 12 }}>
                            <TouchableOpacity
                                style={[styles.typeButton, quickType === "Activity" && styles.typeButtonActive]}
                                onPress={() => setQuickType("Activity")}
                            >
                                <Text style={styles.modalButtonText}>กิจกรรม</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.typeButton, quickType === "Task" && styles.typeButtonActive]}
                                onPress={() => setQuickType("Task")}
                            >
                                <Text style={styles.modalButtonText}>Task</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            placeholder={`ชื่อ ${quickType}`}
                            style={styles.input}
                            value={quickTitle}
                            onChangeText={setQuickTitle}
                        />

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                                <Text style={[styles.modalButtonText, { color: "#333" }]}>ยกเลิก</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#C3002F" }]} onPress={handleAdd}>
                                <Text style={styles.modalButtonText}>เพิ่ม</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
    }
    ,
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
