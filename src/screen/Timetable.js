import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
} from 'react-native';
import { genTimeBlock } from 'react-native-timetable';

// ─────────────────────────────────────────────
//  CONFIG: สีประจำแต่ละวัน
// ─────────────────────────────────────────────
const DAY_COLORS = {
  MON: { bg: '#FFD6D6', border: '#FF8A8A', header: '#FF6B6B', text: '#9B2335', pill: '#FFECEC' },
  TUE: { bg: '#FFE8CC', border: '#FFA94D', header: '#FF8C00', text: '#7A4100', pill: '#FFF3E0' },
  WED: { bg: '#D4F1C0', border: '#74C948', header: '#52A820', text: '#2A5C10', pill: '#EAFAD8' },
  THU: { bg: '#CCE8FF', border: '#4DA6FF', header: '#1A7FCC', text: '#0A3D6B', pill: '#E0F2FF' },
  FRI: { bg: '#E8D4FF', border: '#A64DFF', header: '#7B2FBE', text: '#3D0070', pill: '#F3E8FF' },
};

const DAY_CONFIG = [
  { key: 'MON', label: 'จันทร์',    short: 'จ' },
  { key: 'TUE', label: 'อังคาร',   short: 'อ' },
  { key: 'WED', label: 'พุธ',      short: 'พ' },
  { key: 'THU', label: 'พฤหัสบดี', short: 'พฤ' },
  { key: 'FRI', label: 'ศุกร์',    short: 'ศ' },
];

// ─────────────────────────────────────────────
//  DATA: ตารางเรียน
// ─────────────────────────────────────────────
const class_data = [
  {
    title: 'Math',
    startTime: genTimeBlock('MON', 9, 0),
    endTime: genTimeBlock('MON', 10, 50),
    location: 'Classroom 403',
    extra_descriptions: ['Kim', 'Lee'],
  },
  {
    title: 'Math',
    startTime: genTimeBlock('WED', 9, 0),
    endTime: genTimeBlock('WED', 10, 50),
    location: 'Classroom 403',
    extra_descriptions: ['Kim', 'Lee'],
  },
  {
    title: 'Physics',
    startTime: genTimeBlock('MON', 11, 0),
    endTime: genTimeBlock('MON', 11, 50),
    location: 'Lab 404',
    extra_descriptions: ['Einstein'],
  },
  {
    title: 'Physics',
    startTime: genTimeBlock('WED', 11, 0),
    endTime: genTimeBlock('WED', 12, 30),
    location: 'Lab 404',
    extra_descriptions: ['Einstein'],
  },
  {
    title: 'Mandarin',
    startTime: genTimeBlock('TUE', 9, 0),
    endTime: genTimeBlock('TUE', 10, 50),
    location: 'Language Center',
    extra_descriptions: ['Chen'],
  },
  {
    title: 'Japanese',
    startTime: genTimeBlock('FRI', 9, 0),
    endTime: genTimeBlock('FRI', 10, 50),
    location: 'Language Center',
    extra_descriptions: ['Nakamura'],
  },
  {
    title: 'Club Activity',
    startTime: genTimeBlock('THU', 9, 0),
    endTime: genTimeBlock('THU', 10, 50),
    location: 'Activity Center',
  },
  {
    title: 'Club Activity',
    startTime: genTimeBlock('FRI', 13, 30),
    endTime: genTimeBlock('FRI', 14, 50),
    location: 'Activity Center',
  },
];

// ─────────────────────────────────────────────
//  DATA: ตารางสอบ (ข้อมูลจำลอง)
// ─────────────────────────────────────────────
const exam_data = [
  {
    title: 'สอบกลางภาค: Math',
    startTime: genTimeBlock('MON', 9, 0),
    endTime: genTimeBlock('MON', 11, 0),
    location: 'ห้องสอบ A101',
    extra_descriptions: ['ห้ามนำเครื่องคิดเลขเข้าห้องสอบ'],
    examType: 'midterm',
  },
  {
    title: 'สอบกลางภาค: Physics',
    startTime: genTimeBlock('TUE', 13, 0),
    endTime: genTimeBlock('TUE', 15, 0),
    location: 'ห้องสอบ B202',
    extra_descriptions: ['อนุญาตให้ดูสูตรได้ 1 แผ่น'],
    examType: 'midterm',
  },
  {
    title: 'สอบกลางภาค: Mandarin',
    startTime: genTimeBlock('WED', 10, 0),
    endTime: genTimeBlock('WED', 12, 0),
    location: 'ห้องสอบ C303',
    extra_descriptions: ['ทดสอบการพูดและเขียน'],
    examType: 'midterm',
  },
  {
    title: 'สอบปลายภาค: Math',
    startTime: genTimeBlock('THU', 9, 0),
    endTime: genTimeBlock('THU', 12, 0),
    location: 'ห้องสอบ A101',
    extra_descriptions: ['ครอบคลุมเนื้อหาทั้งหมด'],
    examType: 'final',
  },
  {
    title: 'สอบปลายภาค: Japanese',
    startTime: genTimeBlock('THU', 13, 0),
    endTime: genTimeBlock('THU', 15, 0),
    location: 'ห้องสอบ D404',
    extra_descriptions: ['ทดสอบ Kanji + ไวยากรณ์'],
    examType: 'final',
  },
  {
    title: 'สอบปลายภาค: Physics',
    startTime: genTimeBlock('FRI', 9, 0),
    endTime: genTimeBlock('FRI', 12, 0),
    location: 'ห้องสอบ B202',
    extra_descriptions: ['Closed book'],
    examType: 'final',
  },
  {
    title: 'สอบย่อย: Club Project',
    startTime: genTimeBlock('FRI', 13, 0),
    endTime: genTimeBlock('FRI', 14, 0),
    location: 'Activity Center',
    extra_descriptions: ['นำเสนอโปรเจกต์กลุ่ม'],
    examType: 'quiz',
  },
  {
    title: 'Quiz: Mandarin',
    startTime: genTimeBlock('MON', 13, 0),
    endTime: genTimeBlock('MON', 13, 50),
    location: 'Language Center',
    extra_descriptions: ['บทที่ 1-5'],
    examType: 'quiz',
  },
];

// สีสำหรับ exam type badge
const EXAM_TYPE_CONFIG = {
  midterm: { label: 'กลางภาค', color: '#E67E22', bg: '#FEF0E7' },
  final:   { label: 'ปลายภาค', color: '#C0392B', bg: '#FDEDEC' },
  quiz:    { label: 'Quiz',    color: '#2980B9', bg: '#EBF5FB' },
};

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const getDayKey = (dateObj) => {
  const day = dateObj.getDay();
  const map = { 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI' };
  return map[day] || null;
};

const formatTime = (dateObj) => {
  const h = dateObj.getHours();
  const m = dateObj.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const getDurationMinutes = (start, end) => Math.round((end - start) / 60000);

const groupEventsByDay = (events) => {
  const grouped = { MON: [], TUE: [], WED: [], THU: [], FRI: [] };
  events.forEach((evt) => {
    const key = getDayKey(evt.startTime);
    if (key && grouped[key]) grouped[key].push(evt);
  });
  Object.keys(grouped).forEach((day) => {
    grouped[day].sort((a, b) => a.startTime - b.startTime);
  });
  return grouped;
};

// ─────────────────────────────────────────────
//  TYPE SWITCHER (ตารางเรียน / ตารางสอบ)
// ─────────────────────────────────────────────
const TypeSwitcher = ({ activeType, onSelect }) => {
  const tabs = [
    { key: 'class', label: 'ตารางเรียน' },
    { key: 'exam',  label: 'ตารางสอบ' },
  ];
  return (
    <View style={styles.switcherWrapper}>
      <View style={styles.switcherTrack}>
        {tabs.map((tab) => {
          const isActive = activeType === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              onPress={() => onSelect(tab.key)}
              style={[styles.switcherTab, isActive && styles.switcherTabActive]}
            >
              <Text style={styles.switcherIcon}>{tab.icon}</Text>
              <Text style={[styles.switcherLabel, isActive && styles.switcherLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────
//  DAY TAB BAR
// ─────────────────────────────────────────────
const DayTabBar = ({ selectedDay, onSelect }) => {
  return (
    <View style={styles.tabBarWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBarContent}
      >
        {DAY_CONFIG.map((day) => {
          const isActive = selectedDay === day.key;
          const colors = DAY_COLORS[day.key];
          return (
            <TouchableOpacity
              key={day.key}
              activeOpacity={0.7}
              onPress={() => onSelect(day.key)}
              style={[
                styles.tab,
                isActive
                  ? { backgroundColor: colors.header, borderColor: colors.header }
                  : { backgroundColor: colors.pill, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.tabText, { color: isActive ? '#FFFFFF' : colors.text }]}>
                {day.label}
              </Text>
              {isActive && <View style={styles.tabActiveDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────
//  EVENT CARD (ตารางเรียน)
// ─────────────────────────────────────────────
const ClassCard = ({ event, dayKey, onPress }) => {
  const colors = DAY_COLORS[dayKey];
  const duration = getDurationMinutes(event.startTime, event.endTime);
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(event, dayKey)}
      style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}
    >
      <View style={[styles.cardAccent, { backgroundColor: colors.header }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={[styles.durationBadge, { backgroundColor: colors.header }]}>
            <Text style={styles.durationText}>{duration}m</Text>
          </View>
        </View>
        <View style={styles.cardTimeRow}>
          <View style={[styles.timeDot, { backgroundColor: colors.header }]} />
          <Text style={[styles.cardTime, { color: colors.text }]}>
            {formatTime(event.startTime)} – {formatTime(event.endTime)}
          </Text>
        </View>
        <Text style={[styles.cardLocation, { color: colors.text }]} numberOfLines={1}>
          📍 {event.location}
        </Text>
        {event.extra_descriptions && event.extra_descriptions.length > 0 && (
          <Text style={[styles.cardTeacher, { color: colors.text }]} numberOfLines={1}>
            👤 {event.extra_descriptions.join(', ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────
//  EXAM CARD (ตารางสอบ)
// ─────────────────────────────────────────────
const ExamCard = ({ event, dayKey, onPress }) => {
  const colors = DAY_COLORS[dayKey];
  const duration = getDurationMinutes(event.startTime, event.endTime);
  const examCfg = EXAM_TYPE_CONFIG[event.examType] || EXAM_TYPE_CONFIG.quiz;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(event, dayKey)}
      style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: examCfg.color }]}
    >
      <View style={[styles.cardAccent, { backgroundColor: examCfg.color }]} />
      <View style={styles.cardBody}>
        {/* exam type badge + duration */}
        <View style={styles.cardTopRow}>
          <View style={[styles.examTypeBadge, { backgroundColor: examCfg.bg }]}>
            <Text style={[styles.examTypeText, { color: examCfg.color }]}>{examCfg.label}</Text>
          </View>
          <View style={[styles.durationBadge, { backgroundColor: examCfg.color }]}>
            <Text style={styles.durationText}>{duration}m</Text>
          </View>
        </View>

        {/* title */}
        <Text style={[styles.cardTitle, { color: '#1A1A2E', marginTop: 4 }]} numberOfLines={2}>
          {event.title}
        </Text>

        {/* เวลา */}
        <View style={styles.cardTimeRow}>
          <View style={[styles.timeDot, { backgroundColor: examCfg.color }]} />
          <Text style={[styles.cardTime, { color: '#444' }]}>
            {formatTime(event.startTime)} – {formatTime(event.endTime)}
          </Text>
        </View>

        {/* ห้อง */}
        <Text style={[styles.cardLocation, { color: '#555' }]} numberOfLines={1}>
          📍 {event.location}
        </Text>

        {/* หมายเหตุ */}
        {event.extra_descriptions && event.extra_descriptions.length > 0 && (
          <Text style={[styles.cardNote, { color: examCfg.color }]} numberOfLines={2}>
            ⚠️ {event.extra_descriptions.join(' · ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────
//  DETAIL MODAL
// ─────────────────────────────────────────────
const DetailModal = ({ visible, event, dayKey, activeType, onClose }) => {
  if (!event || !dayKey) return null;
  const colors = DAY_COLORS[dayKey];
  const dayLabel = DAY_CONFIG.find((d) => d.key === dayKey)?.label;
  const duration = getDurationMinutes(event.startTime, event.endTime);
  const isExam = activeType === 'exam';
  const examCfg = isExam ? (EXAM_TYPE_CONFIG[event.examType] || EXAM_TYPE_CONFIG.quiz) : null;
  const accentColor = isExam ? examCfg.color : colors.header;
  const bgColor = isExam ? examCfg.bg : colors.bg;
  const textColor = isExam ? examCfg.color : colors.text;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.modalCard, { borderTopColor: accentColor, borderTopWidth: 5 }]}>
          <View style={[styles.modalTitleRow, { backgroundColor: bgColor }]}>
            <Text style={[styles.modalTitle, { color: isExam ? '#1A1A2E' : colors.text }]} numberOfLines={2}>
              {event.title}
            </Text>
            <View style={[styles.modalDayBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.modalDayBadgeText}>{dayLabel}</Text>
            </View>
          </View>

          <View style={styles.modalContent}>
            {/* exam type row */}
            {isExam && (
              <View style={styles.modalRow}>
                <Text style={styles.modalIcon}>📋</Text>
                <View>
                  <Text style={styles.modalLabel}>ประเภทการสอบ</Text>
                  <View style={[styles.examTypeBadge, { backgroundColor: examCfg.bg, alignSelf: 'flex-start' }]}>
                    <Text style={[styles.examTypeText, { color: examCfg.color }]}>{examCfg.label}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.modalRow}>
              <Text style={styles.modalIcon}>🕐</Text>
              <View>
                <Text style={styles.modalLabel}>เวลา</Text>
                <Text style={styles.modalValue}>
                  {formatTime(event.startTime)} – {formatTime(event.endTime)}
                </Text>
                <Text style={[styles.modalSub, { color: accentColor }]}>{duration} นาที</Text>
              </View>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.modalIcon}>📍</Text>
              <View>
                <Text style={styles.modalLabel}>{isExam ? 'ห้องสอบ' : 'ห้องเรียน'}</Text>
                <Text style={styles.modalValue}>{event.location}</Text>
              </View>
            </View>

            {event.extra_descriptions && event.extra_descriptions.length > 0 && (
              <View style={styles.modalRow}>
                <Text style={styles.modalIcon}>{isExam ? '⚠️' : '👤'}</Text>
                <View>
                  <Text style={styles.modalLabel}>{isExam ? 'หมายเหตุ' : 'ผู้สอน'}</Text>
                  <Text style={styles.modalValue}>{event.extra_descriptions.join(', ')}</Text>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.modalCloseBtn, { backgroundColor: accentColor }]}
            onPress={onClose}
          >
            <Text style={styles.modalCloseBtnText}>ปิด</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ─────────────────────────────────────────────
//  EMPTY STATE
// ─────────────────────────────────────────────
const EmptyState = ({ dayKey, activeType }) => {
  const colors = DAY_COLORS[dayKey];
  const dayLabel = DAY_CONFIG.find((d) => d.key === dayKey)?.label;
  const isExam = activeType === 'exam';
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{isExam ? '✅' : '📭'}</Text>
      <Text style={styles.emptyTitle}>{isExam ? 'ไม่มีการสอบ' : 'ไม่มีคลาสเรียน'}</Text>
      <Text style={[styles.emptySubtitle, { color: colors.header }]}>วัน{dayLabel}ว่างทั้งวัน</Text>
    </View>
  );
};

// ─────────────────────────────────────────────
//  MAIN SCREEN
// ─────────────────────────────────────────────
const Table = () => {
  const [activeType, setActiveType] = useState('class'); // 'class' | 'exam'
  const [activeDay, setActiveDay]   = useState('MON');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDay, setSelectedDay]     = useState(null);
  const [modalVisible, setModalVisible]   = useState(false);

  const sourceData      = activeType === 'class' ? class_data : exam_data;
  const groupedEvents   = groupEventsByDay(sourceData);
  const currentEvents   = groupedEvents[activeDay] || [];
  const colors          = DAY_COLORS[activeDay];
  const dayLabel        = DAY_CONFIG.find((d) => d.key === activeDay)?.label;
  const isExam          = activeType === 'exam';

  const handleEventPress = (event, dayKey) => {
    setSelectedEvent(event);
    setSelectedDay(dayKey);
    setModalVisible(true);
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    setActiveDay('MON');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF0F6" />

      <View style ={{paddingTop:30}}/>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderTitle}> Table</Text>
      </View>

      {/* Type Switcher */}
      <TypeSwitcher activeType={activeType} onSelect={handleTypeChange} />

      {/* Day Tab Bar */}
      <DayTabBar selectedDay={activeDay} onSelect={setActiveDay} />

      {/* Active Day Bar */}
      <View style={[
        styles.activeDayBar,
        {
          backgroundColor: isExam ? '#FFF8F0' : colors.pill,
          borderBottomColor: isExam ? '#E67E22' : colors.border,
        },
      ]}>
        <View style={[styles.activeDayDot, { backgroundColor: isExam ? '#E67E22' : colors.header }]} />
        <Text style={[styles.activeDayText, { color: isExam ? '#7D3C00' : colors.text }]}>
          วัน{dayLabel}
        </Text>
        <View style={[styles.activeDayCount, { backgroundColor: isExam ? '#E67E22' : colors.header }]}>
          <Text style={styles.activeDayCountText}>
            {currentEvents.length} {isExam ? 'วิชา' : 'คลาส'}
          </Text>
        </View>
      </View>

      {/* Event List */}
      <ScrollView
        style={styles.eventList}
        contentContainerStyle={styles.eventListContent}
        showsVerticalScrollIndicator={false}
      >
        {currentEvents.length > 0 ? (
          currentEvents.map((evt, idx) =>
            isExam ? (
              <ExamCard key={idx} event={evt} dayKey={activeDay} onPress={handleEventPress} />
            ) : (
              <ClassCard key={idx} event={evt} dayKey={activeDay} onPress={handleEventPress} />
            )
          )
        ) : (
          <EmptyState dayKey={activeDay} activeType={activeType} />
        )}
      </ScrollView>

      {/* Modal */}
      <DetailModal
        visible={modalVisible}
        event={selectedEvent}
        dayKey={selectedDay}
        activeType={activeType}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF0F6' },

  // ── Top Header ──
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    backgroundColor: '#FFF0F6',
  },
  topHeaderTitle:{ 
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    
},
  // ── Type Switcher ──
  switcherWrapper: {
    backgroundColor: '#FFF0F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  switcherTrack: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderRadius: 14,
    padding: 4,
  },
  switcherTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  switcherTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  switcherIcon:  { fontSize: 16 },
  switcherLabel: { fontSize: 14, fontWeight: '600', color: '#999' },
  switcherLabelActive: { color: '#1A1A2E', fontWeight: '800' },

  // ── Day Tab Bar ──
  tabBarWrapper: {
    backgroundColor: '#FFF0F6',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabBarContent: { paddingHorizontal: 16, paddingTop: 12, gap: 8, flexDirection: 'row' },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabText:      { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  tabActiveDot: { position: 'absolute', bottom: -6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#1A1A2E' },

  // ── Active Day Bar ──
  activeDayBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  activeDayDot:       { width: 8, height: 8, borderRadius: 4 },
  activeDayText:      { fontSize: 14, fontWeight: '700', flex: 1 },
  activeDayCount:     { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  activeDayCountText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  // ── Event List ──
  eventList:        { flex: 1 },
  eventListContent: { padding: 16, gap: 12, paddingBottom: 32 },

  // ── Shared Card ──
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardAccent:  { width: 5 },
  cardBody:    { flex: 1, padding: 14, gap: 5 },
  cardTopRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  cardTitle:   { fontSize: 16, fontWeight: '800', flex: 1, letterSpacing: 0.2 },
  cardTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeDot:     { width: 6, height: 6, borderRadius: 3 },
  cardTime:    { fontSize: 12, fontWeight: '600', opacity: 0.85 },
  cardLocation:{ fontSize: 12, opacity: 0.75 },
  cardTeacher: { fontSize: 12, opacity: 0.7 },
  cardNote:    { fontSize: 12, fontWeight: '600', marginTop: 2 },
  durationBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  durationText:  { fontSize: 11, color: '#FFFFFF', fontWeight: '700' },

  // ── Exam Type Badge ──
  examTypeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  examTypeText:  { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },

  // ── Empty State ──
  emptyState:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji:    { fontSize: 48, marginBottom: 8 },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  emptySubtitle: { fontSize: 14, fontWeight: '500', opacity: 0.8 },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  modalTitle:        { fontSize: 18, fontWeight: '800', flex: 1, lineHeight: 24 },
  modalDayBadge:     { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 10 },
  modalDayBadgeText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  modalContent:      { padding: 18, gap: 16 },
  modalRow:          { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  modalIcon:         { fontSize: 20, marginTop: 2 },
  modalLabel:        { fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  modalValue:        { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  modalSub:          { fontSize: 12, fontWeight: '500', marginTop: 2 },
  modalCloseBtn:     { margin: 18, marginTop: 4, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalCloseBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
});

export default Table;