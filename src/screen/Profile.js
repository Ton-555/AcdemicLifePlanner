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

export default Profile;