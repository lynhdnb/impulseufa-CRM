import { Client, Teacher, Session, Subscription, SessionType, Task } from './types';

export const mockTeachers: Teacher[] = [
    { id: 't1', name: 'DJ Syntax', color: 'bg-blue-500', textColor: 'text-white' },
    { id: 't2', name: 'MC Flow', color: 'bg-pink-500', textColor: 'text-white' },
    { id: 't3', name: 'Vinyl Vinnie', color: 'bg-green-500', textColor: 'text-white' },
];

export const mockSubscriptions: Subscription[] = [
    { id: 'sub1', name: 'Beginner Beats', price: 200, sessions: 4 },
    { id: 'sub2', name: 'Advanced Scratching', price: 350, sessions: 8 },
    { id: 'sub3', name: 'Full Producer Course', price: 1000, sessions: 20 },
];

const getFutureDate = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

export const mockClients: Client[] = [
    {
        id: 'c1',
        name: 'Alice Johnson',
        phone: '555-0101',
        email: 'alice@example.com',
        joinDate: new Date(2023, 10, 15),
        activeSubscriptionId: 'sub2',
        communicationHistory: [
            { id: 'comm1', date: new Date(2023, 11, 1), type: 'Call', summary: 'Обсудили прогресс и новые техники.' },
            { id: 'comm2', date: new Date(2023, 10, 14), type: 'Email', summary: 'Проведен онбординг, назначен первый урок.' },
        ],
        bookingHistoryIds: ['s1', 's3'],
        tasks: [
            { id: 't1', text: 'Связаться по поводу интереса к продвинутому курсу', dueDate: getFutureDate(3), isCompleted: false },
            { id: 't2', text: 'Отправить скидочный код на день рождения', dueDate: new Date(2024, 7, 20), isCompleted: true },
        ]
    },
    {
        id: 'c2',
        name: 'Bob Williams',
        phone: '555-0102',
        email: 'bob@example.com',
        joinDate: new Date(2024, 0, 20),
        activeSubscriptionId: 'sub1',
        communicationHistory: [
            { id: 'comm3', date: new Date(2024, 0, 19), type: 'Message', summary: 'Подтвержден пробный урок.' },
        ],
        bookingHistoryIds: ['s2'],
        tasks: [
            { id: 't3', text: 'Уточнить впечатления после первых 2 уроков', dueDate: getFutureDate(7), isCompleted: false },
        ]
    },
    {
        id: 'c3',
        name: 'Charlie Brown',
        phone: '555-0103',
        email: 'charlie@example.com',
        joinDate: new Date(2023, 8, 5),
        communicationHistory: [],
        bookingHistoryIds: [],
        tasks: [
            { id: 't4', text: 'Звонок для возобновления работы - предложить пробный урок', dueDate: null, isCompleted: false },
        ]
    },
];

const today = new Date();
const getTodayAt = (hour: number, minute: number = 0) => {
    const d = new Date(today);
    d.setHours(hour, minute, 0, 0);
    return d;
}

export const mockSessions: Session[] = [
    {
        id: 's1',
        clientId: 'c1',
        teacherId: 't1',
        startTime: getTodayAt(14, 0),
        endTime: getTodayAt(16, 0),
        type: SessionType.LESSON_PRACTICE,
    },
    {
        id: 's2',
        clientId: 'c2',
        teacherId: 't2',
        startTime: getTodayAt(16, 0),
        endTime: getTodayAt(17, 0),
        type: SessionType.LESSON,
    },
    {
        id: 's3',
        clientId: 'c1',
        teacherId: 't3',
        startTime: new Date(new Date().setDate(today.getDate() + 2)),
        endTime: new Date(new Date(new Date().setDate(today.getDate() + 2)).setHours(19)),
        type: SessionType.PRACTICE_PRACTICE,
    },
];

mockSessions[2].startTime.setHours(17)
mockSessions[2].endTime.setHours(19)