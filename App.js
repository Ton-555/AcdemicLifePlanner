import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Dashboard from "./src/screen/Dashboard";
import Timetable from "./src/screen/Timetable";
import Planner from "./src/screen/Planner";
import Profile from "./src/screen/Profile";
import Autithentication from "./src/screen/Autithentication";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebaseConfig';
import timetableStore from './src/data/TimetableStore';

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Give store the UID (or null) so it fetches data
      timetableStore.setUserId(currentUser ? currentUser.uid : null);
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff3b3b" />
      </View>
    );
  }

  if (!user) {
    return <Autithentication />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'left', 'right']}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === "Dashboard") {
                  iconName = focused ? "home" : "home-outline";
                } else if (route.name === "Timetable") {
                  iconName = focused ? "calendar" : "calendar-outline";
                } else if (route.name === "Planner") {
                  iconName = focused ? "pulse" : "pulse-outline";
                } else if (route.name === "Profile") {
                  iconName = focused ? "person" : "person-outline";
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: "#ff3b3b",
              tabBarInactiveTintColor: "gray",
              headerShown: false,
              tabBarStyle: {
                height: 60,
                paddingBottom: 5,
              },
            })}
          >
            <Tab.Screen
              name="Dashboard"
              component={Dashboard}
              options={{ title: "หน้าหลัก" }}
            />
            <Tab.Screen
              name="Timetable"
              component={Timetable}
              options={{ title: "ตาราง" }}
            />
            <Tab.Screen
              name="Planner"
              component={Planner}
              options={{ title: "วางแผน" }}
            />
            <Tab.Screen
              name="Profile"
              component={Profile}
              options={{ title: "โปรไฟล์" }}
            />
          </Tab.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
