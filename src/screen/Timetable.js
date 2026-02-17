import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Timetable = () => {
    return (
        <View style={styles.containner}>
            <Text>Timetable Screen</Text>
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

export default Timetable;