import React, { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Platform } from 'react-native'
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';
import timetableStore from '../data/TimetableStore'


// สร้าง Object เวลาและวันที่มาตรฐาน
const genTimeBlock = (day, hour, minute, date = null) => {
  return { day: day, time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, date: date };
};

// ชื่อย่อวัน
const dayMap = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function Timetable() {
  // สถานะ ตารางเรียนหรือตารางสอบ
  const [selTable, setSelTable] = useState(1);
  // สถานะเลือกดูวันไหน
  const [selDay, setDay] = useState(1);
  const [selExamDay, setExamDay] = useState(1);
  const [classes, setClasses] = useState(timetableStore.getClasses());
  const [exams, setExams] = useState(timetableStore.getExams());
 
  useEffect(() => {
    const unsub = timetableStore.subscribe(({ classes: nc, exams: ne }) => {
      setClasses(nc);
      setExams(ne);
    });
    return () => unsub();
  }, []);

  // สร้างรายชื่อวิชาที่ไม่ซ้ำกันสำหรับใช้เป็นตัวเลือก
  const uniqueClassTitles = [...new Set(classes.map(c => c.title))];

  // สถานะการแก้ไข/เพิ่มข้อมูล 
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDay, setNewDay] = useState(selDay);
  const [newExtraDescriptions, setNewExtraDescriptions] = useState('');

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activityDateStr, setActivityDateStr] = useState("");

  const [startTimeObj, setStartTimeObj] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [startTimeStr, setStartTimeStr] = useState("");

  const [endTimeObj, setEndTimeObj] = useState(new Date());
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [endTimeStr, setEndTimeStr] = useState("");

  // แปลงจาก Object เป็น String YYYY-MM-DD
  const formatDateToString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // หาวันในสัปดาห์ MON-SUN จากวันที่เลือก
  const getDayFromDate = (dateObj) => {
    const dayOfWeek = dateObj.getDay();
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return dayMap[dayIndex];
  };

  const formatDisplayTime = (date) => {
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น.";
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const onChangeDate = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
      setActivityDateStr(formatDisplayDate(selected));
    }
  };

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

  // กรองข้อมูล เรียน หรือ สอบ ตามวันที่ถูกกดเลือก และจัดเรียงเวลาจากเช้าไปเย็น
  const currentDataList = selTable === 1 ? classes : exams;
  const selectedDayString = selTable === 1 ? dayMap[selDay - 1] : dayMap[selExamDay - 1];
  const displayData = currentDataList
    .filter(item => item.startTime.day === selectedDayString)
    .sort((a, b) => {
      if (a.startTime.date && b.startTime.date) {
        const dateCompare = a.startTime.date.localeCompare(b.startTime.date);
        if (dateCompare !== 0) {
          return dateCompare;
        }
      }

      const [aHr, aMin] = a.startTime.time.split(':').map(Number);
      const [bHr, bMin] = b.startTime.time.split(':').map(Number);

      const aTotalMinutes = aHr * 60 + aMin;
      const bTotalMinutes = bHr * 60 + bMin;

      return aTotalMinutes - bTotalMinutes;
    });

  //ป้องกันตารางซ้อนกัน
  const checkTimeOverlap = (newItem, currentList, excludeIndex = null) => {
    return currentList.some((existingItem, index) => {
      if (excludeIndex !== null && index === excludeIndex) {
        return false;
      }

      const isSameDay = existingItem.startTime.day === newItem.startTime.day;
      const isSameDate = existingItem.startTime.date === newItem.startTime.date;
      const isSameDayOrDate = selTable === 1 ? isSameDay : isSameDate;

      if (!isSameDayOrDate) {
        return false;
      }

      const [existingStartHr, existingStartMin] = existingItem.startTime.time.split(':').map(Number);
      const [existingEndHr, existingEndMin] = existingItem.endTime.time.split(':').map(Number);
      const [newStartHr, newStartMin] = newItem.startTime.time.split(':').map(Number);
      const [newEndHr, newEndMin] = newItem.endTime.time.split(':').map(Number);

      const existingStartMinutes = existingStartHr * 60 + existingStartMin;
      const existingEndMinutes = existingEndHr * 60 + existingEndMin;
      const newStartMinutes = newStartHr * 60 + newStartMin;
      const newEndMinutes = newEndHr * 60 + newEndMin;


      return newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes;
    });
  };

  // ดึงข้อมูลเดิมมาเพื่อเตรียมแก้ไข
  const handleEditItem = (item) => {
    const actualIndex = (selTable === 1 ? classes : exams).indexOf(item);
    setIsEditMode(true);
    setEditIndex(actualIndex);
    setNewTitle(item.title);
    setNewLocation(item.location);
    const dayIdx = dayMap.indexOf(item.startTime.day);
    setNewDay(dayIdx + 1);
    setNewExtraDescriptions(item.extra_descriptions.join(', '));

    const [startHr, startMin] = item.startTime.time.split(':').map(Number);
    const [endHr, endMin] = item.endTime.time.split(':').map(Number);

    const sTime = new Date();
    sTime.setHours(startHr, startMin, 0, 0);
    setStartTimeObj(sTime);
    setStartTimeStr(formatDisplayTime(sTime));

    const eTime = new Date();
    eTime.setHours(endHr, endMin, 0, 0);
    setEndTimeObj(eTime);
    setEndTimeStr(formatDisplayTime(eTime));

    if (selTable === 2 && item.startTime.date) {
      const [year, month, day] = item.startTime.date.split('-').map(Number);
      const dObj = new Date(year, month - 1, day);
      setSelectedDate(dObj);
      setActivityDateStr(formatDisplayDate(dObj));
    } else {
      setSelectedDate(new Date());
      setActivityDateStr("");
    }

    setModalVisible(true);
  };

  // บันทึกข้อมูลตารางใหม่ 
  const handleSaveData = () => {
    if (!newTitle || !startTimeStr || !endTimeStr) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อวิชา เวลาเริ่ม และเวลาสิ้นสุด");
      return;
    }

    const startTotalMinutes = startTimeObj.getHours() * 60 + startTimeObj.getMinutes();
    const endTotalMinutes = endTimeObj.getHours() * 60 + endTimeObj.getMinutes();

    if (endTotalMinutes <= startTotalMinutes) {
      Alert.alert("เวลาไม่ถูกต้อง", "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มเสมอ");
      return;
    }

    const selectedDay = selTable === 1 ? dayMap[newDay - 1] : getDayFromDate(selectedDate);
    const dateString = formatDateToString(selectedDate);
    const extraDescArray = newExtraDescriptions
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const newItem = {
      title: newTitle,
      startTime: genTimeBlock(selectedDay, startTimeObj.getHours(), startTimeObj.getMinutes(), selTable === 1 ? null : dateString),
      endTime: genTimeBlock(selectedDay, endTimeObj.getHours(), endTimeObj.getMinutes(), selTable === 1 ? null : dateString),
      location: newLocation || 'ไม่ระบุสถานที่',
      extra_descriptions: extraDescArray
    };

    const currentList = selTable === 1 ? classes : exams;
    const excludeIdx = isEditMode ? editIndex : null;

    if (checkTimeOverlap(newItem, currentList, excludeIdx)) {
      Alert.alert("เวลาทับซ้อน", "เวลาที่เลือกทับซ้อนกับ " + (selTable === 1 ? "วิชาเรียน" : "กิจกรรม") + " ที่มีอยู่แล้ว กรุณาเลือกเวลาที่ต่างออกไป");
      return;
    }

    if (selTable === 1) {
      if (isEditMode) {
        timetableStore.updateClass(editIndex, newItem);
      } else {
        timetableStore.addClass(newItem);
      }
    } else {
      if (isEditMode) {
        timetableStore.updateExam(editIndex, newItem);
      } else {
        timetableStore.addExam(newItem);
      }
    }

    setIsEditMode(false);
    setEditIndex(null);

    setNewTitle('');
    setNewLocation('');
    setNewDay(selDay);
    setNewExtraDescriptions('');
    setSelectedDate(new Date());
    setActivityDateStr("");
    setStartTimeObj(new Date());
    setStartTimeStr("");
    setEndTimeObj(new Date());
    setEndTimeStr("");
    setModalVisible(false);
  };

  const handleCancelModal = () => {
    setIsEditMode(false);
    setEditIndex(null);
    setNewTitle('');
    setNewLocation('');
    setNewDay(selDay);
    setNewExtraDescriptions('');
    setSelectedDate(new Date());
    setActivityDateStr("");
    setStartTimeObj(new Date());
    setStartTimeStr("");
    setEndTimeObj(new Date());
    setEndTimeStr("");
    setModalVisible(false);
  };

  // ลบรายวิชา หรือกิจกรรมการสอบออกจากฐานข้อมูล
  const handleDeleteItem = () => {
    Alert.alert("ลบรายการ", "คุณต้องการลบรายการนี้ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ", style: "destructive", onPress: () => {
          if (selTable === 1) {
            timetableStore.deleteClass(editIndex);
          } else {
            timetableStore.deleteExam(editIndex);
          }
          handleCancelModal();
        }
      }
    ]);
  };

  return (
    <View style={styles.containner}>
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.topHeaderText}>Academic Life Planner</Text>
        </View>
        <Ionicons name="calendar" size={26} color="#fff" />
      </View>

      <View style={{ padding: 20 }} >
        <Text style={styles.title}>Time table</Text>
        <View style={styles.toggleButton}>
          {/* สลับดู ตารางเรียน ตารางสอบ */}
          <TouchableOpacity style={[styles.selTableButton, selTable === 1 && styles.activeSelTableButton]} onPress={() => setSelTable(1)}>
            <Text style={selTable === 1 ? styles.activeText : styles.inActiveText}>ตารางเรียน</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.selTableButton, selTable === 2 && styles.activeSelTableButton]} onPress={() => setSelTable(2)}>
            <Text style={selTable === 2 ? styles.activeText : styles.inActiveText}>ตารางสอบ</Text>
          </TouchableOpacity>
        </View>


        <View style={{ padding: 10 }} />

        {/* แถบเลือกวันจันทร์ - อาทิตย์ */}
        <View style={styles.toggleDayButton}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, index) => {
            const dayNumber = index + 1;
            const isActive = selTable === 1 ? (selDay === dayNumber) : (selExamDay === dayNumber);
            return (
              <TouchableOpacity
                key={dayNumber}
                style={[styles.selDayButton, isActive && styles.activeSelDayButton]}
                onPress={() => {
                  if (selTable === 1) {
                    setDay(dayNumber);
                  } else {
                    setExamDay(dayNumber);
                  }
                }}
              >
                <Text style={isActive ? styles.fontDayActive : styles.fontDayInActive}>{dayName}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <ScrollView style={styles.listContainer}>
        {displayData.length > 0 ? (
          displayData.map((item, index) => (
            <TouchableOpacity key={index} style={styles.card} onPress={() => handleEditItem(item)}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.startTime.date && (
                <Text style={styles.cardDate}>วันที่: {item.startTime.date}</Text>
              )}
              <Text style={styles.cardTime}>เวลา: {item.startTime.time} - {item.endTime.time}</Text>
              <Text style={styles.cardLocation}>สถานที่: {item.location}</Text>
              {item.extra_descriptions && item.extra_descriptions.length > 0 && (
                <Text style={styles.cardExtra}>หมายเหตุ: {item.extra_descriptions.join(', ')}</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noDataText}>ไม่มีรายการ</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => { 
        if (selTable === 2 && uniqueClassTitles.length === 0) {
          Alert.alert("ไม่สามารถเพิ่มได้", "ยังไม่มีตารางเรียน กรุณาเพิ่มตารางเรียนก่อนจึงจะสามารถเพิ่มตารางสอบได้");
          return;
        }
        setIsEditMode(false); 
        setEditIndex(null); 
        setNewTitle(selTable === 2 && uniqueClassTitles.length > 0 ? uniqueClassTitles[0] : ''); 
        setNewLocation(''); 
        setNewDay(selDay); 
        setNewExtraDescriptions(''); 
        setSelectedDate(new Date()); 
        setActivityDateStr(""); 
        setStartTimeObj(new Date()); 
        setStartTimeStr(""); 
        setEndTimeObj(new Date()); 
        setEndTimeStr(""); 
        setModalVisible(true); 
      }}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>{isEditMode ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</Text>

            {selTable === 1 ? (
              <TextInput style={styles.input} placeholder="ชื่อวิชา" value={newTitle} onChangeText={setNewTitle} />
            ) : (
              <View style={[styles.input, { padding: 0 }]}>
                <Picker
                  selectedValue={newTitle}
                  onValueChange={(itemValue) => setNewTitle(itemValue)}
                  style={{ height: 50, width: '100%', color: '#333' }}
                >
                  {uniqueClassTitles.map((title, idx) => (
                    <Picker.Item key={idx} label={title} value={title} />
                  ))}
                </Picker>
              </View>
            )}
            <TextInput style={styles.input} placeholder="สถานที่" value={newLocation} onChangeText={setNewLocation} />

            {selTable === 1 && (
              <>
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

                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="หมายเหตุเพิ่มเติม (เช่น ต้องเตรียม A4 สีขาว)"
                  value={newExtraDescriptions}
                  onChangeText={setNewExtraDescriptions}
                  multiline={true}
                />
              </>
            )}

            {selTable === 2 && (
              <>
                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                  <Text style={{ color: activityDateStr ? "#000" : "#999" }}>
                    {activityDateStr || "วันที่สอบ"}
                  </Text>
                </TouchableOpacity>

                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="หมายเหตุเพิ่มเติม (เช่น ห้ามนำเครื่องคิดเลข)"
                  value={newExtraDescriptions}
                  onChangeText={setNewExtraDescriptions}
                  multiline={true}
                />
              </>
            )}

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
              {isEditMode && (
                <TouchableOpacity style={[styles.modalButton, { flex: 1, backgroundColor: "#FF3B30", marginRight: 5 }]} onPress={handleDeleteItem}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>ลบ</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.modalButton, { flex: 1, backgroundColor: "#ccc", marginHorizontal: isEditMode ? 5 : 0, marginRight: !isEditMode ? 10 : 5 }]} onPress={handleCancelModal}>
                <Text style={{ fontWeight: 'bold' }}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { flex: isEditMode ? 1.5 : 2, backgroundColor: '#007AFF', marginLeft: isEditMode ? 5 : 0 }]} onPress={handleSaveData}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{isEditMode ? 'บันทึก' : 'บันทึกรายการ'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
          is24Hour={true}
          onChange={onChangeStartTime}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTimeObj}
          mode="time"
          display="default"
          is24Hour={true}
          onChange={onChangeEndTime}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  containner: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center'
  },
  topHeader: {
    width: '100%',
    backgroundColor: "#ff3b3b",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 20
  },
  topHeaderText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 24
  },
  hearderText: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 10
  },
  toggleButton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: 220,
    paddingVertical: 5,
    backgroundColor: "#F1F3F5",
    borderRadius: 10
  },
  selTableButton: {
    width: 100,
    height: 45,
    backgroundColor: "white",
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 5,
    elevation: 3,
    shadowOpacity: 0.1
  },
  activeSelTableButton: {
    backgroundColor: "white"
  },
  activeText: {
    color: "#ff3b3b",
    fontWeight: "bold"
  },
  inActiveText: {
    color: 'grey'
  },
  toggleDayButton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '95%',
    paddingVertical: 5,
    backgroundColor: '#F1F3F5',
    borderRadius: 10
  },
  selDayButton: {
    width: 40,
    height: 45,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 2
  },
  fontDayActive: {
    fontSize: 12,
    color: "#ff3b3b",
    fontWeight: 'bold'
  },
  fontDayInActive: {
    fontSize: 10,
    color: 'grey'
  },
  activeSelDayButton: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 5
  },
  listContainer: {
    width: '90%',
    marginTop: 20
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  cardDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500'
  },
  cardTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  cardLocation: {
    fontSize: 14,
    color: '#666'
  },
  cardExtra: {
    fontSize: 12,
    color: '#d9534f',
    marginTop: 8,
    fontStyle: 'italic'
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#3d3d3dff'
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: "#ff3b3b",
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 }
  },
  fabText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    marginTop: -2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '85%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 16
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 5,
    color: '#333'
  },
  daySelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 15
  },
  daySelectButton: {
    width: '13%',
    paddingVertical: 8,
    paddingHorizontal: 3,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  activeSelectDayButton: {
    backgroundColor: '#007AFF'
  },
  daySelectText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '600'
  },
  activeSelectDayText: {
    color: 'white',
    fontWeight: 'bold'
  },
  modalButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 5
  },
  dateDisplayButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center'
  },
  dateDisplayButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5
  },
  dateDisplayButtonSubtext: {
    fontSize: 12,
    color: '#666'
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  datePickerModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30
  },
  datePickerModalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  datePickerScrollRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 200,
    marginBottom: 20
  },
  datePickerColumn: {
    flex: 1,
    alignItems: 'center'
  },
  datePickerColumnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10
  },
  datePickerScroll: {
    flex: 1,
    width: '100%'
  },
  datePickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8
  },
  datePickerItemText: {
    fontSize: 16,
    color: '#666'
  },
  datePickerItemActive: {
    backgroundColor: '#007AFF',
    borderRadius: 8
  },
  datePickerItemActiveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18
  },
  datePickerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 5
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: '600'
  }
});