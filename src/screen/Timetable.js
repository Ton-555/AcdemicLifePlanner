import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native'

const genTimeBlock = (day, hour, minute) => {
  return { day: day, time: `${hour}:${minute === 0 ? '00' : minute}` };
};

// ข้อมูลเริ่มต้น (Initial Data)
const initial_class_data = [
  { title: 'Math', startTime: genTimeBlock('MON', 9, 0), endTime: genTimeBlock('MON', 10, 50), location: 'Classroom 403', extra_descriptions: ['Kim', 'Lee'] },
  { title: 'Mandarin', startTime: genTimeBlock('TUE', 9, 0), endTime: genTimeBlock('TUE', 10, 50), location: 'Language Center', extra_descriptions: ['Chen'] },
];

const initial_exam_data = [
  { title: 'สอบกลางภาค: Math', startTime: genTimeBlock('MON', 9, 0), endTime: genTimeBlock('MON', 11, 0), location: 'ห้องสอบ A101', extra_descriptions: ['ห้ามนำเครื่องคิดเลขเข้าห้องสอบ'] },
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
  const [startHr, setStartHr] = useState('');
  const [startMin, setStartMin] = useState('00');
  const [endHr, setEndHr] = useState('');
  const [endMin, setEndMin] = useState('00');

  // กระบวนการกรองข้อมูล (Filter)
  const currentDataList = selTable === 1 ? classes : exams;
  const selectedDayString = dayMap[selDay - 1];
  const displayData = currentDataList.filter(item => item.startTime.day === selectedDayString);

  // ฟังก์ชันสำหรับบันทึกข้อมูลใหม่
  const handleSaveData = () => {
    if (!newTitle || !startHr || !endHr) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อวิชา เวลาเริ่ม และเวลาสิ้นสุด");
      return;
    }

    const selectedDay = dayMap[newDay - 1];
    // สร้าง Object ข้อมูลใหม่ตามรูปแบบเดิม
    const newItem = {
      title: newTitle,
      startTime: genTimeBlock(selectedDay, parseInt(startHr), parseInt(startMin)),
      endTime: genTimeBlock(selectedDay, parseInt(endHr), parseInt(endMin)),
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
    setStartHr('');
    setStartMin('00');
    setEndHr('');
    setEndMin('00');
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
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* หน้าต่างป๊อปอัป (Modal) สำหรับกรอกข้อมูล */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>เพิ่มรายการใหม่ ({dayMap[newDay - 1]})</Text>

            <TextInput style={styles.input} placeholder="ชื่อวิชา / กิจกรรม" value={newTitle} onChangeText={setNewTitle} />
            <TextInput style={styles.input} placeholder="สถานที่" value={newLocation} onChangeText={setNewLocation} />

            {/* เลือกวัน */}
            <Text style={styles.inputLabel}>เลือกวัน:</Text>
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

            {/* เวลาเริ่มเรียน */}
            <Text style={styles.inputLabel}>เวลาเริ่ม:</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TextInput style={[styles.input, { width: '48%' }]} placeholder="ชั่วโมง (เช่น 09)" keyboardType="numeric" value={startHr} onChangeText={setStartHr} maxLength={2} />
              <TextInput style={[styles.input, { width: '48%' }]} placeholder="นาที (เช่น 00, 30)" keyboardType="numeric" value={startMin} onChangeText={setStartMin} maxLength={2} />
            </View>

            {/* เวลาสิ้นสุด */}
            <Text style={styles.inputLabel}>เวลาสิ้นสุด:</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TextInput style={[styles.input, { width: '48%' }]} placeholder="ชั่วโมง (เช่น 10)" keyboardType="numeric" value={endHr} onChangeText={setEndHr} maxLength={2} />
              <TextInput style={[styles.input, { width: '48%' }]} placeholder="นาที (เช่น 00, 50)" keyboardType="numeric" value={endMin} onChangeText={setEndMin} maxLength={2} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={() => setModalVisible(false)}>
                <Text>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#007AFF' }]} onPress={handleSaveData}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalButton: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 10, marginHorizontal: 5 }
});

export default Timetable;