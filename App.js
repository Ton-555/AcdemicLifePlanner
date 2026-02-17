import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Dashboard from "./src/screen/Dashboard";
import Timetable from "./src/screen/Timetable";
import Planner from "./src/screen/Planner";
import Profile from "./src/screen/Profile";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
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
          tabBarActiveTintColor: "#5e91ff",
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
    </NavigationContainer>
  );
}
