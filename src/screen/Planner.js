import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Planner() {
  const [activeTab, setActiveTab] = useState("activity");

  const [activities, setActivities] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);

  const [activityModal, setActivityModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);

  // ===== Activity Form =====
  const [activityTitle, setActivityTitle] = useState("");
  const [activityType, setActivityType] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [activityDetail, setActivityDetail] = useState("");

  // ===== Task Form =====
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");

  // =========================
  // Close + Reset
  // =========================
  const closeActivityModal = () => {
    setActivityModal(false);
    setActivityTitle("");
    setActivityType("");
    setActivityDate("");
    setActivityTime("");
    setActivityDetail("");
  };

  const closeTaskModal = () => {
    setTaskModal(false);
    setTaskTitle("");
    setTaskDate("");
  };

  // =========================
  // Add Activity
  // =========================
  const addActivity = () => {
    if (!activityTitle.trim()) return;

    const newActivity = {
      id: Date.now().toString(),
      title: activityTitle,
      type: activityType,
      date: activityDate,
      time: activityTime,
      detail: activityDetail,
    };

    setActivities([...activities, newActivity]);
    closeActivityModal();
  };

  // =========================
  // Add Task
  // =========================
  const addTask = () => {
    if (!taskTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: taskTitle,
      date: taskDate,
      done: false,
    };

    setStudyPlans([...studyPlans, newTask]);
    closeTaskModal();
  };

  // =========================
  // Toggle Done
  // =========================
  const toggleDone = (id) => {
    setStudyPlans(
      studyPlans.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderText}>
          Academic Life Planner
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Activity & Planner</Text>
        <Text style={styles.subtitle}>
          กิจกรรมและแผนการเรียน
        </Text>

        {/* Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "activity" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("activity")}
          >
            <Text
              style={
                activeTab === "activity"
                  ? styles.activeText
                  : styles.inactiveText
              }
            >
              กิจกรรม
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "study" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("study")}
          >
            <Text
              style={
                activeTab === "study"
                  ? styles.activeText
                  : styles.inactiveText
              }
            >
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
            <Text style={styles.addText}>
              {activeTab === "activity"
                ? " เพิ่มกิจกรรม"
                : " เพิ่ม Task"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Activity List */}
        {activeTab === "activity" &&
          activities.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.itemTitle}>
                {item.title}
              </Text>
              <Text style={styles.date}>
                {item.date} {item.time}
              </Text>
            </View>
          ))}

        {/* Study Plan List */}
        {activeTab === "study" &&
          studyPlans.map((item) => (
            <View key={item.id} style={styles.card}>
              <TouchableOpacity
                onPress={() => toggleDone(item.id)}
              >
                <Ionicons
                  name={
                    item.done
                      ? "checkbox-outline"
                      : "square-outline"
                  }
                  size={22}
                  color={item.done ? "green" : "black"}
                />
              </TouchableOpacity>

              <View style={{ marginLeft: 10 }}>
                <Text
                  style={[
                    styles.itemTitle,
                    item.done && {
                      textDecorationLine:
                        "line-through",
                    },
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={styles.date}>
                  {item.date}
                </Text>
              </View>
            </View>
          ))}
      </ScrollView>

      {/* ================= Activity Modal ================= */}
      <Modal
        visible={activityModal}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeActivityModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalBox}
          >
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={closeActivityModal}
            >
              <Ionicons name="close" size={22} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              เพิ่มกิจกรรม
            </Text>

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
            <TextInput
              placeholder="วันที่"
              style={styles.modalInput}
              value={activityDate}
              onChangeText={setActivityDate}
            />
            <TextInput
              placeholder="เวลา"
              style={styles.modalInput}
              value={activityTime}
              onChangeText={setActivityTime}
            />
            <TextInput
              placeholder="รายละเอียดเพิ่มเติม"
              style={styles.modalInput}
              value={activityDetail}
              onChangeText={setActivityDetail}
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={addActivity}
            >
              <Text style={styles.modalButtonText}>
                เพิ่ม
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeActivityModal}
            >
              <Text style={styles.cancelText}>
                ยกเลิก
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ================= Task Modal ================= */}
      <Modal
        visible={taskModal}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeTaskModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalBox}
          >
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={closeTaskModal}
            >
              <Ionicons name="close" size={22} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              เพิ่ม Task
            </Text>

            <TextInput
              placeholder="ชื่อ Task"
              style={styles.modalInput}
              value={taskTitle}
              onChangeText={setTaskTitle}
            />
            <TextInput
              placeholder="กำหนดส่ง"
              style={styles.modalInput}
              value={taskDate}
              onChangeText={setTaskDate}
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={addTask}
            >
              <Text style={styles.modalButtonText}>
                เพิ่ม
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeTaskModal}
            >
              <Text style={styles.cancelText}>
                ยกเลิก
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDEDED" },

  topHeader: {
    backgroundColor: "#ff1e1e",
    padding: 15,
  },
  topHeaderText: {
    color: "#fff",
    fontWeight: "bold",
  },

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
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
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

  closeIcon: {
    position: "absolute",
    right: 15,
    top: 15,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#ff69b4",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },

  modalButton: {
    backgroundColor: "#ff3b8d",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  cancelButton: {
    marginTop: 10,
    alignItems: "center",
  },

  cancelText: {
    color: "red",
    fontWeight: "bold",
  },
});
