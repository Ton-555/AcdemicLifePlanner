import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function Autithentication() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoginMode, setIsLoginMode] = useState(true);

    const handleAuthen = async () => {
        if (!email || !password) {
            Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลและรหัสผ่านให้ครบทุกช่อง");
            return;
        }

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
                // Alert is handled by effect in App.js or we can leave it implicit. 
                // App.js will naturally swap out this screen
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                // Alert is handled by App.js or implicit by state change.
            }
        } catch (error) {
            let msg = error.message;
            if (error.code === 'auth/invalid-credential') msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
            if (error.code === 'auth/email-already-in-use') msg = "อีเมลนี้มีผู้ใช้งานแล้ว";
            Alert.alert("ผิดพลาด", msg);
        }
    }

    return (
        <View style={styles.authContainerWrapper}>
            <Text style={styles.hearderText}>Academic Life Planner</Text>
            <Text style={[styles.buttonText, { fontSize: 24, alignSelf: "center", marginBottom: 20 }]}>
                {isLoginMode ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </Text>

            <View style={styles.inputContainer}>
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
        backgroundColor: 'lightsalmon',
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
        shadowRadius: 3.84,
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
        backgroundColor: '#ff3b3b',
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
    }
});
