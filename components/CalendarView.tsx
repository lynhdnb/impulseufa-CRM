import React, { useState, useMemo } from 'react';
import { Session, Client, Teacher, SessionType } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from './Icons';
import SessionModal from './SessionModal';

interface CalendarViewProps {
    sessions: Session[];
    clients: Client[];
    teachers: Teacher[];
    addSession: (session: Omit<Session, 'id'>) => void;
    navigateToClient: (clientId: string) => void;
    updateSession: (sessionId: string, newStartTime: Date, newEndTime: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ sessions, clients, teachers, addSession, navigateToClient, updateSession }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [newSessionTime, setNewSessionTime] = useState<Date | null>(null);

    const startOfWeek = useMemo(() => {
        const date = new Date(currentDate);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(date.setDate(diff));
    }, [currentDate]);

    const daysOfWeek = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            days.push(date);
        }
        return days;
    }, [startOfWeek]);

    const hours = Array.from({ length: 17 }, (_, i) => i + 7); // 7 AM to 11 PM

    const handlePrevWeek = () => {
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
    };

    const handleNextWeek = () => {
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
    };
    
    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const openSessionModal = (session: Session) => {
        setSelectedSession(session);
        setIsModalOpen(true);
    };

    const openNewSessionModal = (day: Date, hour: number) => {
        const newDate = new Date(day);
        newDate.setHours(hour, 0, 0, 0);
        setNewSessionTime(newDate);
        setSelectedSession(null);
        setIsModalOpen(true);
    }
    
    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    const getSessionPosition = (session: Session) => {
        const startHour = session.startTime.getHours() + session.startTime.getMinutes() / 60;
        const endHour = session.endTime.getHours() + session.endTime.getMinutes() / 60;
        const duration = endHour - startHour;

        const top = (startHour - 7) * 4; // 4rem per hour (h-16)
        const height = duration * 4;
        
        return { top: `${top}rem`, height: `${height}rem` };
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, session: Session) => {
        e.dataTransfer.setData('sessionId', session.id);
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('opacity-50');
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: Date, hour: number) => {
        e.preventDefault();
        const sessionId = e.dataTransfer.getData('sessionId');
        if (!sessionId) return;

        const sessionToMove = sessions.find(s => s.id === sessionId);
        if (!sessionToMove) return;

        const duration = sessionToMove.endTime.getTime() - sessionToMove.startTime.getTime();
        
        const newStartTime = new Date(day);
        newStartTime.setHours(hour, 0, 0, 0);

        const newEndTime = new Date(newStartTime.getTime() + duration);
        
        updateSession(sessionId, newStartTime, newEndTime);
    };


    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                    <button onClick={handlePrevWeek} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeftIcon /></button>
                    <button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRightIcon /></button>
                    <h2 className="text-xl font-semibold capitalize">
                        {startOfWeek.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                    </h2>
                     <button onClick={handleToday} className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">Сегодня</button>
                </div>
                 <button onClick={() => openNewSessionModal(new Date(), 12)} className="flex items-center space-x-2 bg-brand-purple text-white px-4 py-2 rounded-md hover:bg-brand-purple/90 transition-colors">
                    <PlusIcon />
                    <span>Создать</span>
                </button>
            </header>
            <div className="flex-1 flex overflow-auto">
                <div className="w-16 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="h-16 border-b border-gray-200 dark:border-gray-700"></div>
                    {hours.map(hour => (
                        <div key={hour} className="h-16 -mt-2 pt-2">
                            {hour}:00
                        </div>
                    ))}
                </div>
                <div className="flex-1 grid grid-cols-7">
                    {daysOfWeek.map((day, dayIndex) => (
                        <div key={day.toString()} className="border-l border-gray-200 dark:border-gray-700 relative">
                            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-2 text-center border-b border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{day.toLocaleString('ru-RU', { weekday: 'short' })}</p>
                                <p className={`text-2xl font-bold ${isSameDay(day, new Date()) ? 'text-brand-purple' : ''}`}>{day.getDate()}</p>
                            </div>
                            <div className="h-full relative">
                                {hours.map(hour => (
                                    <div 
                                        key={hour} 
                                        onClick={() => openNewSessionModal(day, hour)} 
                                        className="h-16 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, day, hour)}
                                    ></div>
                                ))}
                                {sessions
                                    .filter(session => isSameDay(session.startTime, day))
                                    .map(session => {
                                        const client = clients.find(c => c.id === session.clientId);
                                        const teacher = teachers.find(t => t.id === session.teacherId);
                                        const {top, height} = getSessionPosition(session);
                                        return (
                                            <div
                                                key={session.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, session)}
                                                onDragEnd={handleDragEnd}
                                                onClick={() => openSessionModal(session)}
                                                className={`absolute w-full px-2 py-1 rounded-lg text-xs cursor-pointer shadow-md overflow-hidden transition-opacity ${teacher?.color || 'bg-gray-500'} ${teacher?.textColor || 'text-white'}`}
                                                style={{ top, height, left: '0.25rem', right: '0.25rem', width: 'calc(100% - 0.5rem)' }}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (client) navigateToClient(client.id);
                                                    }}
                                                    className="font-bold text-left w-full hover:underline focus:outline-none"
                                                >
                                                    {client?.name}
                                                </button>
                                                <p>{teacher?.name}</p>
                                                <p className="opacity-80">{session.type}</p>
                                                <p className="text-xxs opacity-80">
                                                    {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </p>
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {isModalOpen && (
                <SessionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    session={selectedSession}
                    clients={clients}
                    teachers={teachers}
                    addSession={addSession}
                    initialTime={newSessionTime}
                    navigateToClient={navigateToClient}
                />
            )}
        </div>
    );
};

export default CalendarView;