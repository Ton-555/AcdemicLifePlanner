import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from "@expo/vector-icons";

export default function Autithentication() {
    // ข้อมูลผู้ใช้งาน
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoginMode, setIsLoginMode] = useState(true); // เข้าสู่ระบบ สมัครสมาชิก

    // ฟังก์ชันจัดการการเข้าสู่ระบบและลงทะเบียน
    const handleAuthen = async () => {
        if (!isLoginMode && (!firstName || !lastName || !email || !password)) {
            Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
            return;
        }
        if (isLoginMode && (!email || !password)) {
            Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลและรหัสผ่านให้ครบทุกช่อง");
            return;
        }

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const docRef = doc(db, 'users', user.uid);
                await setDoc(docRef, {
                    name: `${firstName} ${lastName}`,
                    email: email,
                    createdAt: new Date()
                }, { merge: true });
            }
        } catch (error) {
            let msg = error.message;
            if (error.code === 'auth/invalid-credential') msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
            if (error.code === 'auth/email-already-in-use') msg = "อีเมลนี้มีผู้ใช้งานแล้ว";
            Alert.alert("ผิดพลาด", msg);
        }
    }

    return (
        <View style={{ paddingTop: 50 }}>
            <View style={styles.topHeader}>
                <Text style={styles.topHeaderText}>Academic Life Planner</Text>
                <Ionicons name="home-outline" size={26} color="#fff" />
            </View>

            <View style={{ paddingTop: 20 }} />

            <Text style={[styles.buttonText, { fontSize: 24, alignSelf: "center", marginBottom: 20 }]}>
                {isLoginMode ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </Text>

            <View style={styles.inputContainer}>
                {!isLoginMode && (
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 5 }]}
                            placeholder="ชื่อ"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1, marginLeft: 5 }]}
                            placeholder="นามสกุล"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />

                <TouchableOpacity style={styles.button} onPress={handleAuthen}>
                    <Text style={styles.buttonTextWhite}>{isLoginMode ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setIsLoginMode(!isLoginMode)}>
                    <Text style={{ color: "#007BFF", textAlign: "center", fontSize: 16 }}>
                        {isLoginMode ? "ยังไม่มีบัญชีใช่ไหม? สมัครเลย" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    authContainerWrapper: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    hearderText: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'white',
        textAlign: 'center'
    },
    inputContainer: {
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.85,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#f1f3f5',
        borderRadius: 10,
        padding: 10,
        marginVertical: 10,
        fontSize: 16
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#007BFF',
        borderRadius: 10,
        padding: 10,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    buttonTextWhite: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
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
        width: "100%"
    },
    topHeaderText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold"
    },
});
