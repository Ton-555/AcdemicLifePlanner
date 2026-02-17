import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Dashboard from "./src/screen/Dashboard";
import Timetable from "./src/screen/Timetable";
import Planner from "./src/screen/Planner";
import Profile from "./src/screen/Profile";

const Tab = createBottomTabNavigator();

const App = () => {
  return ( 
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
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
};

export default App;