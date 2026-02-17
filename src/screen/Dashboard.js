import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Dashboard = () => {
    return (
        <View style={styles.containner}>
            <Text>Dashboard Screen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    containner:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#fff"
    }
})

export default Dashboard;