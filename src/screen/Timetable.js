import React, { useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Platform } from 'react-native'
import DateTimePicker from "@react-native-community/datetimepicker";
const genTimeBlock = (day, hour, minute, date = null) => {
  return { day: day, time: `${hour}:${minute === 0 ? '00' : minute}`, date: date };
};

// ข้อมูลเริ่มต้น (Initial Data)
const initial_class_data = [
  { title: 'Math', startTime: genTimeBlock('MON', 9, 0, '2025-02-24'), endTime: genTimeBlock('MON', 10, 50, '2025-02-24'), location: 'Classroom 403', extra_descriptions: ['Kim', 'Lee'] },
  { title: 'Mandarin', startTime: genTimeBlock('TUE', 9, 0, '2025-02-25'), endTime: genTimeBlock('TUE', 10, 50, '2025-02-25'), location: 'Language Center', extra_descriptions: ['Chen'] },
];

const initial_exam_data = [
  { title: 'สอบกลางภาค: Math', startTime: genTimeBlock('MON', 9, 0, '2025-02-24'), endTime: genTimeBlock('MON', 11, 0, '2025-02-24'), location: 'ห้องสอบ A101', extra_descriptions: ['ห้ามนำเครื่องคิดเลขเข้าห้องสอบ'] },
];

const dayMap = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const Timetable = () => {
  const [selTable, setSelTable] = useState(1);
  const [selDay, setDay] = useState(1);

  // 1. เปลี่ยนข้อมูลให้เป็น State เพื่อให้เพิ่มข้อมูลใหม่ได้
  const [classes, setClasses] = useState(initial_class_data);
  const [exams, setExams] = useState(initial_exam_data);

  // 2. State สำหรับควบคุมหน้าต่างเพิ่มข้อมูล
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDay, setNewDay] = useState(selDay); // วันที่เลือก

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activityDateStr, setActivityDateStr] = useState("");

  // เวลาเริ่มต้นและเวลาสิ้นสุด
  const [startTimeObj, setStartTimeObj] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [startTimeStr, setStartTimeStr] = useState("");

  const [endTimeObj, setEndTimeObj] = useState(new Date());
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [endTimeStr, setEndTimeStr] = useState("");

  // ฟังก์ชันแปลง Date เป็น YYYY-MM-DD สำหรับบันทึก
  const formatDateToString = (dateObj) => {
    return dateObj.toISOString().split('T')[0];
  };

  // ฟังก์ชันสไตล์ Planner.js สำหรับแสดงผล (แสดงในปุ่ม)
  const formatDisplayTime = (date) => {
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น.";
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Handler วันที่
  const onChangeDate = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
      setActivityDateStr(formatDisplayDate(selected));
    }
  };

  // Handler เวลา
  const onChangeStartTime = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setStartTimeObj(selectedTime);
      setStartTimeStr(formatDisplayTime(selectedTime));
    }
  };

  const onChangeEndTime = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setEndTimeObj(selectedTime);
      setEndTimeStr(formatDisplayTime(selectedTime));
    }
  };

  // กระบวนการกรองข้อมูล (Filter)
  const currentDataList = selTable === 1 ? classes : exams;
  const selectedDayString = dayMap[selDay - 1];
  const displayData = currentDataList.filter(item => item.startTime.day === selectedDayString);

  // ฟังก์ชันสำหรับบันทึกข้อมูลใหม่
  const handleSaveData = () => {
    if (!newTitle || !startTimeStr || !endTimeStr) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อวิชา เวลาเริ่ม และเวลาสิ้นสุด");
      return;
    }

    const selectedDay = dayMap[newDay - 1];
    const dateString = formatDateToString(selectedDate);

    // สร้าง Object ข้อมูลใหม่ตามรูปแบบเดิม
    const newItem = {
      title: newTitle,
      startTime: genTimeBlock(selectedDay, startTimeObj.getHours(), startTimeObj.getMinutes(), dateString),
      endTime: genTimeBlock(selectedDay, endTimeObj.getHours(), endTimeObj.getMinutes(), dateString),
      location: newLocation || 'ไม่ระบุสถานที่',
      extra_descriptions: [] // ปล่อยว่างไว้ก่อน
    };

    // ตรวจสอบว่ากำลังอยู่หน้าไหน แล้วเพิ่มข้อมูลลงตารางนั้น
    if (selTable === 1) {
      setClasses([...classes, newItem]);
    } else {
      setExams([...exams, newItem]);
    }

    // ล้างค่าฟอร์มและปิด Modal
    setNewTitle('');
    setNewLocation('');
    setNewDay(selDay);
    setSelectedDate(new Date());
    setActivityDateStr("");
    setStartTimeObj(new Date());
    setStartTimeStr("");
    setEndTimeObj(new Date());
    setEndTimeStr("");
    setModalVisible(false);
  };

  return (
    <View style={styles.containner}>
      <Text style={styles.hearderText}>Table</Text>

      {/* โซนปุ่มเลือกตารางเรียน/สอบ */}
      <View style={styles.toggleButton}>
        <TouchableOpacity style={[styles.selTableButton, selTable === 1 && styles.activeSelTableButton]} onPress={() => setSelTable(1)}>
          <Text style={selTable === 1 ? styles.activeText : styles.inActiveText}>ตารางเรียน</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.selTableButton, selTable === 2 && styles.activeSelTableButton]} onPress={() => setSelTable(2)}>
          <Text style={selTable === 2 ? styles.activeText : styles.inActiveText}>ตารางสอบ</Text>
        </TouchableOpacity>
      </View>
      <View style={{ padding: 10 }} />

      {/* โซนปุ่มเลือกวัน */}
      <View style={styles.toggleDayButton}>
        {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map((dayName, index) => {
          const dayNumber = index + 1;
          return (
            <TouchableOpacity key={dayNumber} style={[styles.selDayButton, selDay === dayNumber && styles.activeSelDayButton]} onPress={() => setDay(dayNumber)}>
              <Text style={selDay === dayNumber ? styles.fontDayActive : styles.fontDayInActive}>{dayName}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* โซนแสดงผลข้อมูล */}
      <ScrollView style={styles.listContainer}>
        {displayData.length > 0 ? (
          displayData.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.startTime.date && (
                <Text style={styles.cardDate}>วันที่: {item.startTime.date}</Text>
              )}
              <Text style={styles.cardTime}>เวลา: {item.startTime.time} - {item.endTime.time}</Text>
              <Text style={styles.cardLocation}>สถานที่: {item.location}</Text>
              {item.extra_descriptions && item.extra_descriptions.length > 0 && (
                <Text style={styles.cardExtra}>หมายเหตุ: {item.extra_descriptions.join(', ')}</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>ไม่มีรายการในวันนี้ครับ 🎉</Text>
        )}
      </ScrollView>

      {/* ปุ่มบวก (+) ขวาล่างสำหรับเพิ่มข้อมูล */}
      <TouchableOpacity style={styles.fab} onPress={() => { setSelectedDate(new Date()); setActivityDateStr(""); setStartTimeObj(new Date()); setStartTimeStr(""); setEndTimeObj(new Date()); setEndTimeStr(""); setModalVisible(true); }}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* หน้าต่างป๊อปอัป (Modal) สำหรับกรอกข้อมูล */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>เพิ่มรายการใหม่ ({dayMap[newDay - 1]})</Text>

            <TextInput style={styles.input} placeholder="ชื่อวิชา / กิจกรรม" value={newTitle} onChangeText={setNewTitle} />
            <TextInput style={styles.input} placeholder="สถานที่" value={newLocation} onChangeText={setNewLocation} />

            {/* เลือกวันที่ (ถ้าเป็นตารางสอบ) */}
            {selTable === 2 && (
              <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={{ color: activityDateStr ? "#000" : "#999" }}>
                  {activityDateStr || "วันที่สอบ"}
                </Text>
              </TouchableOpacity>
            )}

            {/* เลือกวัน */}
            <Text style={styles.inputLabel}>เลือกวันทำการ:</Text>
            <View style={styles.daySelectContainer}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, index) => {
                const dayNumber = index + 1;
                return (
                  <TouchableOpacity
                    key={dayNumber}
                    style={[styles.daySelectButton, newDay === dayNumber && styles.activeSelectDayButton]}
                    onPress={() => setNewDay(dayNumber)}
                  >
                    <Text style={[styles.daySelectText, newDay === dayNumber && styles.activeSelectDayText]}>{dayName}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* เวลาเริ่มเรียน และ เวลาสิ้นสุด */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={[styles.input, { flex: 1, marginRight: 5 }]} onPress={() => setShowStartTimePicker(true)}>
                <Text style={{ color: startTimeStr ? "#000" : "#999" }}>
                  {startTimeStr || "เวลาเริ่ม"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.input, { flex: 1, marginLeft: 5 }]} onPress={() => setShowEndTimePicker(true)}>
                <Text style={{ color: endTimeStr ? "#000" : "#999" }}>
                  {endTimeStr || "เวลาสิ้นสุด"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <TouchableOpacity style={[styles.modalButton, { flex: 1, backgroundColor: "#ccc", marginRight: 10 }]} onPress={() => setModalVisible(false)}>
                <Text style={{ fontWeight: 'bold' }}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { flex: 2, backgroundColor: '#007AFF' }]} onPress={handleSaveData}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>บันทึกรายการ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date/Time Pickers (ซ่อนอยู่และจะแสดงเมื่อถูกเรียก) */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={startTimeObj}
          mode="time"
          display="default"
          onChange={onChangeStartTime}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTimeObj}
          mode="time"
          display="default"
          onChange={onChangeEndTime}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  containner: { flex: 1, backgroundColor: '#FFF0F6', alignItems: 'center' },
  hearderText: { fontSize: 24, fontWeight: 'bold', paddingTop: 10, paddingBottom: 10 },
  toggleButton: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: 220, paddingVertical: 5, backgroundColor: 'white', borderRadius: 10 },
  selTableButton: { width: 100, height: 45, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderRadius: 10, margin: 5 },
  activeSelTableButton: { backgroundColor: 'lightblue' },
  activeText: { color: 'black' },
  inActiveText: { color: 'grey' },
  toggleDayButton: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '95%', paddingVertical: 5, backgroundColor: 'white', borderRadius: 10 },
  selDayButton: { width: 40, height: 45, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderRadius: 10, margin: 2 },
  fontDayActive: { fontSize: 12, color: 'black', fontWeight: 'bold' },
  fontDayInActive: { fontSize: 10, color: 'grey' },
  activeSelDayButton: { width: 50, height: 50, backgroundColor: 'lightblue', justifyContent: 'center', alignItems: 'center', borderRadius: 10, margin: 5 },

  listContainer: { width: '90%', marginTop: 20 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  cardDate: { fontSize: 13, color: '#e74c3c', marginBottom: 5, fontWeight: '500' },
  cardTime: { fontSize: 14, color: '#007AFF', marginBottom: 5 },
  cardLocation: { fontSize: 14, color: '#666' },
  cardExtra: { fontSize: 12, color: '#d9534f', marginTop: 8, fontStyle: 'italic' },
  noDataText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },

  // สไตล์เพิ่มเติมสำหรับปุ่มเพิ่มข้อมูลและ Modal
  fab: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 20, backgroundColor: '#007AFF', borderRadius: 30, elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 } },
  fabText: { fontSize: 30, color: 'white', fontWeight: 'bold', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxHeight: '90%', backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 5 },
  modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 5, color: '#333' },
  daySelectContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginBottom: 15 },
  daySelectButton: { width: '13%', paddingVertical: 8, paddingHorizontal: 3, backgroundColor: '#f0f0f0', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  activeSelectDayButton: { backgroundColor: '#007AFF' },
  daySelectText: { fontSize: 11, color: '#333', fontWeight: '600' },
  activeSelectDayText: { color: 'white', fontWeight: 'bold' },
  modalButton: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 10, marginHorizontal: 5 },
  dateDisplayButton: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 2, borderColor: '#007AFF', alignItems: 'center' },
  dateDisplayButtonText: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginBottom: 5 },
  dateDisplayButtonSubtext: { fontSize: 12, color: '#666' },
  datePickerModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  datePickerModalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 30 },
  datePickerModalHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  datePickerScrollRow: { flexDirection: 'row', justifyContent: 'space-around', height: 200, marginBottom: 20 },
  datePickerColumn: { flex: 1, alignItems: 'center' },
  datePickerColumnLabel: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 10 },
  datePickerScroll: { flex: 1, width: '100%' },
  datePickerItem: { height: 40, justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
  datePickerItemText: { fontSize: 16, color: '#666' },
  datePickerItemActive: { backgroundColor: '#007AFF', borderRadius: 8 },
  datePickerItemActiveText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  datePickerButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  datePickerButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10, marginHorizontal: 5 },
  datePickerButtonText: { fontSize: 16, fontWeight: '600' }
});

export default Timetable;