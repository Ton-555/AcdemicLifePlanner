import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image
} from "react-native";

export default function Profile() {
  const [name, setName] = useState("Paul Tesmasa");
  const [faculty, setFaculty] = useState("Computer Engineering");
  const [year, setYear] = useState("3");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleClear = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
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
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <Image
        style={styles.image}
        source={{ uri: "https://www.tnsumk.ac.th/reg/images/article/students/stu_male.jpg" }}
      />

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[styles.input, !isEditing && styles.disabled]}
          value={name}
          onChangeText={setName}
          editable={isEditing}
        />

        <Text style={styles.label}>Faculty</Text>
        <TextInput
          style={[styles.input, !isEditing && styles.disabled]}
          value={faculty}
          onChangeText={setFaculty}
          editable={isEditing}
        />

        <Text style={styles.label}>Year</Text>
        <TextInput
          style={[styles.input, !isEditing && styles.disabled]}
          value={year}
          onChangeText={setYear}
          editable={isEditing}
          keyboardType="numeric"
        />
      </View>

      {/* {!isEditing ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      )} */}

      <TouchableOpacity
        style={styles.dangerButton}
        onPress={handleClear}
      >
        <Text style={styles.dangerText}>Clear All Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  disabled: {
    backgroundColor: "#f0f0f0",
  },
  button: {
    backgroundColor: "#3A6FF7",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dangerButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 150
  },
  dangerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 10,
  }

});
