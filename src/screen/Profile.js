import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';

export default function Profile() {
  const [name, setName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("");
  const [image, setImage] = useState(null);

  const COLUDINARY_URL = 'https://api.cloudinary.com/v1_1/dvyf9nd9s/image/upload';
  const UPLOAD_PRESET = 'y9zcvfzw';

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("ผิดพลาด", "ไม่สามารถออกจากระบบได้");
    }
  };

  const fetchUser = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || "");
        setFaculty(data.faculty || "");
        setYear(data.year ? data.year.toString() : "");
        setImage(data.profilePicture || null);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดการดึงข้อมูล", error);
    }
  };

  const uploadToCloudinary = async (uri) => {
    const data = new FormData();
    data.append('file', {
      uri: uri,
      type: 'image/jpeg',
      name: 'profile_image.jpg'
    });

    data.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(COLUDINARY_URL, {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Cloudinary Error:", result.error.message);
        Alert.alert("อัปโหลดรูปไม่สำเร็จ", result.error.message);
        return null;
      }

      return result.secure_url;
    } catch (error) {
      console.error("upload รูปไม่สำเร็จ (Network Error):", error);
      return null;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert("ขออภัย", "เราจำเป็นต้องขออนุญาตเข้าถึงรูปภาพเพื่อเปลี่ยนโปรไฟล์");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !faculty.trim() || !year.trim()) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("ข้อผิดพลาด", "ไม่พบข้อมูลผู้ใช้งาน");
        return;
      }

      let imageUrl = image;

      if (image && !image.startsWith('http')) {
        Alert.alert("กำลังโหลด...", "กำลังบันทึกข้อมูลและอัปโหลดกรุณารอสักครู่");
        imageUrl = await uploadToCloudinary(image);
        if (imageUrl) {
          setImage(imageUrl);
        }
      } else {
        Alert.alert("กำลังโหลด...", "กำลังบันทึกข้อมูลกรุณารอสักครู่");
      }

      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        name: name,
        faculty: faculty,
        year: parseInt(year) || 0,
        profilePicture: imageUrl,
        updateAt: new Date()
      }, { merge: true });

      await fetchUser();
      Alert.alert("บันทึกสำเร็จ", "ข้อมูลนิสิตและรูปภาพถูกอัปเดตเรียบร้อยแล้ว");
    } catch (error) {
      console.error("บันทึกไม่สำเร็จ", error);
      Alert.alert("ผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
    }
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
            setImage(null);
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
          <Text style={styles.topHeaderText}>Academic Life Planner</Text>
        </View>
        <Ionicons name="person-outline" size={26} color="#fff" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Setting</Text>
        </View>

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

        <View style={styles.card}>
          <View style={styles.cardHeader}>
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
            <Text style={styles.buttonText}> บันทึกข้อมูล</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.warningCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.warningTitle, { marginLeft: 5 }]}>Danger Zone</Text>
          </View>
          <Text style={styles.warningText}>
            ออกจากระบบ หรือลบข้อมูลทั้งหมดรวมถึงรูปภาพถูกลบออก
          </Text>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}> ออกจากระบบ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleClear}>
            <Ionicons name="trash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}> ลบข้อมูลทั้งหมด</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
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
  topHeaderText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  titleSection: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: "800", color: "#1a1a1a" },
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
    position: 'relative',
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
  logoutButton: {
    backgroundColor: "#ff9500",
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
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
