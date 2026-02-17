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

    const [activities, setActivities] = useState([]);
    const [studyPlans, setStudyPlans] = useState([]);

    const [activityModal, setActivityModal] = useState(false);
    const [taskModal, setTaskModal] = useState(false);

    const [activityTitle, setActivityTitle] = useState("");
    const [activityType, setActivityType] = useState("");
    const [activityDate, setActivityDate] = useState("");
    const [activityTime, setActivityTime] = useState("");
    const [activityDetail, setActivityDetail] = useState("");

    const [taskTitle, setTaskTitle] = useState("");
    const [taskDate, setTaskDate] = useState("");

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());

    // ===== Reset =====
    const resetActivityForm = () => {
        setActivityTitle("");
        setActivityType("");
        setActivityDate("");
        setActivityTime("");
        setActivityDetail("");
    };

    const resetTaskForm = () => {
        setTaskTitle("");
        setTaskDate("");
    };

    // ===== Format เวลา =====
    const formatTime = (date) => {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes} น.`;
    };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // ===== Date Picker =====
    const onChangeDate = (event, selected) => {
        setShowDatePicker(false);
        if (selected) {
            setSelectedDate(selected);
            setActivityDate(formatDate(selected));
        }
    };

    const onChangeTime = (event, selected) => {
        setShowTimePicker(false);
        if (selected) {
            setSelectedDate(selected);
            setActivityTime(formatTime(selected));
        }
    };

    // ===== Add Activity =====
    const addActivity = () => {
        if (!activityTitle.trim()) {
            Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อกิจกรรม");
            return;
        }

        const newActivity = {
            id: Date.now().toString(),
            title: activityTitle,
            type: activityType,
            date: activityDate,
            time: activityTime,
            detail: activityDetail,
        };

        setActivities([...activities, newActivity]);
        setActivityModal(false);
        resetActivityForm();
    };

    const deleteActivity = (id) => {
        Alert.alert("ลบกิจกรรม", "ต้องการลบใช่หรือไม่?", [
            { text: "ยกเลิก" },
            {
                text: "ลบ",
                style: "destructive",
                onPress: () =>
                    setActivities(activities.filter((item) => item.id !== id)),
            },
        ]);
    };

    // ===== Add Task =====
    const addTask = () => {
        if (!taskTitle.trim()) {
            Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อ Task");
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            title: taskTitle,
            date: taskDate,
            done: false,
        };

        setStudyPlans([...studyPlans, newTask]);
        setTaskModal(false);
        resetTaskForm();
    };

    const deleteTask = (id) => {
        Alert.alert("ลบ Task", "ต้องการลบใช่หรือไม่?", [
            { text: "ยกเลิก" },
            {
                text: "ลบ",
                style: "destructive",
                onPress: () =>
                    setStudyPlans(studyPlans.filter((item) => item.id !== id)),
            },
        ]);
    };

    const toggleDone = (id) => {
        setStudyPlans(
            studyPlans.map((item) =>
                item.id === id ? { ...item, done: !item.done } : item
            )
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.topHeader}>
                <Text style={styles.topHeaderText}>
                    Academic Life Planner
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.title}>Activity & Planner</Text>
                <Text style={styles.subtitle}>กิจกรรมและแผนการเรียน</Text>

                {/* Toggle */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "activity" && styles.activeTab]}
                        onPress={() => setActiveTab("activity")}
                    >
                        <Text style={activeTab === "activity" ? styles.activeText : styles.inactiveText}>
                            กิจกรรม
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "study" && styles.activeTab]}
                        onPress={() => setActiveTab("study")}
                    >
                        <Text style={activeTab === "study" ? styles.activeText : styles.inactiveText}>
                            แผนการเรียน
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Add Button */}
                <View style={{ alignItems: "flex-end", marginBottom: 15 }}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() =>
                            activeTab === "activity"
                                ? setActivityModal(true)
                                : setTaskModal(true)
                        }
                    >
                        <Ionicons name="add" size={18} color="#fff" />
                        <Text style={styles.addText}> เพิ่ม</Text>
                    </TouchableOpacity>
                </View>

                {/* Activity List */}
                {activeTab === "activity" &&
                    activities.map((item) => (
                        <View key={item.id} style={styles.card}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.date}>
                                    {item.date} {item.time}
                                </Text>
                            </View>

                            <TouchableOpacity onPress={() => deleteActivity(item.id)}>
                                <Ionicons name="trash" size={22} color="red" />
                            </TouchableOpacity>
                        </View>
                    ))}

                {/* Study List */}
                {activeTab === "study" &&
                    studyPlans.map((item) => (
                        <View key={item.id} style={styles.card}>
                            <TouchableOpacity onPress={() => toggleDone(item.id)}>
                                <Ionicons
                                    name={item.done ? "checkbox-outline" : "square-outline"}
                                    size={22}
                                    color={item.done ? "green" : "black"}
                                />
                            </TouchableOpacity>

                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text
                                    style={[
                                        styles.itemTitle,
                                        item.done && { textDecorationLine: "line-through" },
                                    ]}
                                >
                                    {item.title}
                                </Text>
                                <Text style={styles.date}>{item.date}</Text>
                            </View>

                            <TouchableOpacity onPress={() => deleteTask(item.id)}>
                                <Ionicons name="trash" size={22} color="red" />
                            </TouchableOpacity>
                        </View>
                    ))}
            </ScrollView>

            {/* ================= Activity Modal ================= */}
            <Modal visible={activityModal} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => {
                        setActivityModal(false);
                        resetActivityForm();
                    }}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.modalBox}>
                        <TouchableOpacity
                            style={styles.closeIcon}
                            onPress={() => {
                                setActivityModal(false);
                                resetActivityForm();
                            }}
                        >
                            <Ionicons name="close" size={22} />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>เพิ่มกิจกรรม</Text>

                        <TextInput
                            placeholder="ชื่อกิจกรรม"
                            style={styles.modalInput}
                            value={activityTitle}
                            onChangeText={setActivityTitle}
                        />

                        <TextInput
                            placeholder="ประเภท"
                            style={styles.modalInput}
                            value={activityType}
                            onChangeText={setActivityType}
                        />

                        {/* Date Button */}
                        <TouchableOpacity
                            style={styles.modalInput}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text>
                                {activityDate ? activityDate : "เลือกวันที่"}
                            </Text>
                        </TouchableOpacity>

                        {/* Time Button */}
                        <TouchableOpacity
                            style={styles.modalInput}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text>
                                {activityTime ? activityTime : "เลือกเวลา"}
                            </Text>
                        </TouchableOpacity>

                        <TextInput
                            placeholder="รายละเอียด"
                            style={styles.modalInput}
                            value={activityDetail}
                            onChangeText={setActivityDetail}
                        />

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={addActivity}
                        >
                            <Text style={styles.modalButtonText}>เพิ่ม</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
            {/* ================= Task Modal ================= */}
            <Modal visible={taskModal} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => {
                        setTaskModal(false);
                        resetTaskForm();
                    }}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.modalBox}>
                        <TouchableOpacity
                            style={styles.closeIcon}
                            onPress={() => {
                                setTaskModal(false);
                                resetTaskForm();
                            }}
                        >
                            <Ionicons name="close" size={22} />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>เพิ่มแผนการเรียน</Text>

                        <TextInput
                            placeholder="ชื่อแผน / วิชา"
                            style={styles.modalInput}
                            value={taskTitle}
                            onChangeText={setTaskTitle}
                        />

                        {/* เลือกวันที่ */}
                        <TouchableOpacity
                            style={styles.modalInput}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text>
                                {taskDate ? taskDate : "เลือกวันที่"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={addTask}
                        >
                            <Text style={styles.modalButtonText}>เพิ่ม</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>


            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                />
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    display="default"
                    onChange={onChangeTime}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#EDEDED" },
    topHeader: { backgroundColor: "#ff1e1e", padding: 15, paddingTop: 50 },
    topHeaderText: { color: "#fff", fontWeight: "bold", fontSize: 20 },
    title: { fontSize: 24, fontWeight: "bold" },
    subtitle: { color: "red", marginBottom: 15 },
    tabContainer: {
        flexDirection: "row",
        borderRadius: 25,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "red",
        marginBottom: 20,
    },
    tabButton: { flex: 1, padding: 10, alignItems: "center" },
    activeTab: { backgroundColor: "red" },
    activeText: { color: "#fff", fontWeight: "bold" },
    inactiveText: { color: "black" },
    addButton: {
        flexDirection: "row",
        backgroundColor: "#ff3b3b",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignItems: "center",
    },
    addText: { color: "#fff", fontWeight: "bold" },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    itemTitle: { fontWeight: "bold" },
    date: { fontSize: 12, color: "#555" },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
    },
    closeIcon: { position: "absolute", right: 15, top: 15 },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#ff3b3b",
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
    },
    modalButton: {
        backgroundColor: "#ff3b3b",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    modalButtonText: { color: "#fff", fontWeight: "bold" },
});
