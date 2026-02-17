import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Planner = () => {
    return (
        <View style={styles.containner}>
            <Text>Planner Screen</Text>
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

export default Planner;