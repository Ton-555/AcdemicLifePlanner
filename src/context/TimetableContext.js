import React, { createContext, useState, useEffect } from 'react';

// You might want to move genTimeBlock to a utility file later, but we can redefine it here for initial data
const genTimeBlock = (day, hour, minute, date = null) => {
    return { day: day, time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, date: date };
};

const initial_class_data = [
    { title: 'Math', startTime: genTimeBlock('MON', 9, 0, '2025-02-24'), endTime: genTimeBlock('MON', 10, 50, '2025-02-24'), location: 'Classroom 403', extra_descriptions: ['Kim', 'Lee'] },
    { title: 'Mandarin', startTime: genTimeBlock('TUE', 9, 0, '2025-02-25'), endTime: genTimeBlock('TUE', 10, 50, '2025-02-25'), location: 'Language Center', extra_descriptions: ['Chen'] },
];

const initial_exam_data = [
    { title: 'สอบกลางภาค: Math', startTime: genTimeBlock('MON', 9, 0, '2025-02-24'), endTime: genTimeBlock('MON', 11, 0, '2025-02-24'), location: 'ห้องสอบ A101', extra_descriptions: ['ห้ามนำเครื่องคิดเลขเข้าห้องสอบ'] },
];

export const TimetableContext = createContext();

export const TimetableProvider = ({ children }) => {
    const [classes, setClasses] = useState(initial_class_data);
    const [exams, setExams] = useState(initial_exam_data);

    return (
        <TimetableContext.Provider value={{ classes, setClasses, exams, setExams }}>
            {children}
        </TimetableContext.Provider>
    );
};
