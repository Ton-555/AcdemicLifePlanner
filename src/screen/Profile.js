import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image, // เพิ่ม Image สำหรับแสดงรูปที่เลือก
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker'; // ต้องติดตั้งเพิ่ม: npx expo install expo-image-picker

export default function Profile() {
  const [name, setName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("");
  const [image, setImage] = useState(null); // State สำหรับเก็บรูปโปรไฟล์

  // ฟังก์ชันเลือกรูปภาพ
  const pickImage = async () => {
    // ขออนุญาตเข้าถึงอัลบั้มภาพ
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("ขออภัย", "เราจำเป็นต้องขออนุญาตเข้าถึงรูปภาพเพื่อเปลี่ยนโปรไฟล์");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // ให้ตัดรูปได้ (Crop)
      aspect: [1, 1], // บังคับเป็นสี่เหลี่ยมจัตุรัส
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกชื่ออย่างน้อยหนึ่งช่อง");
      return;
    }
    Alert.alert("บันทึกสำเร็จ", "ข้อมูลนิสิตและรูปภาพถูกอัปเดตเรียบร้อยแล้ว");
  };

  const handleClear = () => {
    Alert.alert(
      "ยืนยันการลบข้อมูล",
      "ข้อมูลทั้งหมดรวมถึงรูปโปรไฟล์จะถูกล้างค่าเริ่มต้น",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบทั้งหมด",
          style: "destructive",
          onPress: () => {
            setName("");
            setFaculty("");
            setYear("");
            setImage(null); // ล้างรูปภาพ
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.brandText}>StudySync</Text>
          <Text style={styles.topHeaderText}>Academic Life Planner</Text>
        </View>
        <Ionicons name="settings-outline" size={26} color="#fff" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Setting</Text>
          <Text style={styles.subtitle}>จัดการข้อมูลและการตั้งค่าบัญชี</Text>
        </View>

        {/* ================= Avatar Section (คลิกเพื่อเปลี่ยนรูป) ================= */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View style={styles.avatarCircle}>
              {image ? (
                <Image source={{ uri: image }} style={styles.profileImage} />
              ) : (
                <Ionicons name="person" size={50} color="#ff3b3b" />
              )}
              {/* ปุ่มไอคอนกล้องเล็กๆ มุมขวาล่างของรูป */}
              <View style={styles.cameraIconBadge}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarName}>{name || "ชื่อผู้ใช้งาน"}</Text>
          <Text style={styles.avatarSubText}>{faculty || "ยังไม่ได้ระบุคณะ"}</Text>
        </View>

        {/* ข้อมูลนิสิต Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="id-card-outline" size={20} color="#ff3b3b" />
            <Text style={styles.sectionTitle}> ข้อมูลนิสิต / นักศึกษา</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชื่อ-นามสกุล</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="กรอกชื่อ-นามสกุล"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>คณะ/สาขา</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="school-outline" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="เช่น วิศวกรรมศาสตร์"
                value={faculty}
                onChangeText={setFaculty}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชั้นปี</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="layers-outline" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="เช่น 1"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}> บันทึกข้อมูล</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.warningCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="alert-circle" size={22} color="red" />
            <Text style={[styles.warningTitle, { marginLeft: 5 }]}>Danger Zone</Text>
          </View>
          <Text style={styles.warningText}>
            การกดปุ่มด้านล่างจะทำให้ข้อมูลทั้งหมดรวมถึงรูปภาพถูกลบออก
          </Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleClear}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}> ลบข้อมูลทั้งหมด</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>StudySync v1.1.0</Text>
      </ScrollView>
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
  topHeaderText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  titleSection: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "800", color: "#1a1a1a" },
  subtitle: { color: "#ff3b3b", fontSize: 14, fontWeight: "600" },
  
  /* Avatar Styles */
  avatarSection: { alignItems: "center", marginBottom: 25 },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    borderWidth: 3,
    borderColor: "#ff3b3b",
    marginBottom: 10,
    position: 'relative', // เพื่อวาง Badge กล้อง
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#333',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  avatarSubText: { color: "#666", fontSize: 13 },

  /* Card & Inputs */
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "600", color: "#555", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  inputIcon: { paddingLeft: 12 },
  input: { flex: 1, padding: 12, fontSize: 16, color: "#333" },
  saveButton: {
    backgroundColor: "#ff3b3b",
    flexDirection: "row",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  warningCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#FFE3E3",
    marginBottom: 20,
  },
  warningTitle: { color: "red", fontWeight: "bold", fontSize: 16 },
  warningText: { color: "#666", fontSize: 13, marginBottom: 15 },
  deleteButton: {
    backgroundColor: "#333",
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  versionText: { textAlign: "center", color: "#ADB5BD", fontSize: 12, marginTop: 10 },
});