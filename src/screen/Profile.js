<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Profile = () => {
    const [name, setName] = useState("");
    const [faculty, setFaculty] = useState("");
    const [year, setYear] = useState("");

    useEffect(() => {
        // Load data from AsyncStorage
        const loadData = async () => {
            try {
                const n = await AsyncStorage.getItem("profile_name");
                const f = await AsyncStorage.getItem("profile_faculty");
                const y = await AsyncStorage.getItem("profile_year");
                if (n) setName(n);
                if (f) setFaculty(f);
                if (y) setYear(y);
            } catch (e) {}
        };
        loadData();
    }, []);

    const saveField = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (e) {}
    };

    const handleClear = async () => {
        try {
            await AsyncStorage.multiRemove([
                "profile_name",
                "profile_faculty",
                "profile_year"
            ]);
            setName("");
            setFaculty("");
            setYear("");
            Alert.alert("ข้อมูลถูกลบแล้ว");
        } catch (e) {
            Alert.alert("เกิดข้อผิดพลาด");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>ข้อมูลผู้เรียน</Text>

            <Text style={styles.label}>ชื่อ</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={text => {
                    setName(text);
                    saveField("profile_name", text);
                }}
                placeholder="กรอกชื่อ"
            />

            <Text style={styles.label}>คณะ</Text>
            <TextInput
                style={styles.input}
                value={faculty}
                onChangeText={text => {
                    setFaculty(text);
                    saveField("profile_faculty", text);
                }}
                placeholder="กรอกคณะ"
            />

            <Text style={styles.label}>ชั้นปี</Text>
            <TextInput
                style={styles.input}
                value={year}
                onChangeText={text => {
                    setYear(text);
                    saveField("profile_year", text);
                }}
                placeholder="กรอกชั้นปี"
                keyboardType="numeric"
            />

            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                <Text style={styles.clearBtnText}>ลบข้อมูลทั้งหมด</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 24,
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 24,
        color: "#DE5C8E",
        alignSelf: "center"
    },
    label: {
        fontSize: 16,
        marginBottom: 6,
        color: "#333"
    },
    input: {
        borderWidth: 1,
        borderColor: "#DE5C8E",
        borderRadius: 8,
        padding: 10,
        marginBottom: 18,
        fontSize: 16,
        backgroundColor: "#FAF0F6"
    },
    clearBtn: {
        backgroundColor: "#DE5C8E",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20
    },
    clearBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
    }
});
=======
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

export default function Profile() {
  const [name, setName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("");

  const handleSave = () => {
    Alert.alert("บันทึกสำเร็จ", "ข้อมูลถูกบันทึกเรียบร้อยแล้ว");
  };

  const handleClear = () => {
    Alert.alert(
      "ล้างข้อมูลทั้งหมด",
      "คุณแน่ใจหรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ยืนยัน",
          style: "destructive",
          onPress: () => {
            setName("");
            setFaculty("");
            setYear("");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header แดงเหมือน Planner */}
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderText}>
          Academic Life Planner
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* จัดหัวข้อแบบ Planner */}
        <Text style={styles.title}>Setting</Text>
        <Text style={styles.subtitle}>
          จัดการข้อมูลและการตั้งค่า
        </Text>

        {/* ================= Card ข้อมูลนิสิต ================= */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            ข้อมูลนิสิต
          </Text>

          <Text style={styles.label}>
            ชื่อ-นามสกุล
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>
            คณะ/สาขา
          </Text>
          <TextInput
            style={styles.input}
            value={faculty}
            onChangeText={setFaculty}
          />

          <Text style={styles.label}>
            ชั้นปี
          </Text>
          <TextInput
            style={styles.input}
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>
              บันทึกข้อมูล
            </Text>
          </TouchableOpacity>
        </View>

        {/* ปุ่มล้างข้อมูล */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
        >
          <Text style={styles.clearText}>
            Clear All Data
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDEDED",
  },

  /* Header ด้านบน */
  topHeader: {
    backgroundColor: "#ff1e1e",
    padding: 15,
  },

  topHeaderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  /* จัดหัวข้อให้เหมือน Planner */
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    color: "red",
    marginBottom: 20,
  },
>>>>>>> dfb11e6b8390a435576332dff1ea4731d2e3e18f

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "red",
    marginBottom: 20,
  },

  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 15,
  },

  label: {
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#f08080",
    padding: 12,
    borderRadius: 10,
  },

  saveButton: {
    backgroundColor: "#ff3b3b",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  clearButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  clearText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
