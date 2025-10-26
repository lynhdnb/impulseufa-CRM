import React, { useState, useEffect, useRef } from 'react';
import { Session, Client, Teacher, SessionType } from '../types';
import { XIcon } from './Icons';

interface SessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: Session | null;
    clients: Client[];
    teachers: Teacher[];
    addSession: (session: Omit<Session, 'id'>) => void;
    initialTime?: Date | null;
    navigateToClient: (clientId: string) => void;
}

const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, session, clients, teachers, addSession, initialTime, navigateToClient }) => {
    const [clientId, setClientId] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [startTime, setStartTime] = useState('');
    const [type, setType] = useState<SessionType>(SessionType.LESSON);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isClientListOpen, setIsClientListOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (session) {
            const client = clients.find(c => c.id === session.clientId);
            setClientId(session.clientId);
            setSearchQuery(client?.name || '');
            setTeacherId(session.teacherId);
            setStartTime(new Date(session.startTime.getTime() - session.startTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
            setType(session.type);
        } else {
            const resetTime = initialTime ? new Date(initialTime) : new Date();
            if (!initialTime) {
                 resetTime.setMinutes(Math.ceil(resetTime.getMinutes() / 30) * 30); // Snap to next 30 mins
            }
            setStartTime(new Date(resetTime.getTime() - resetTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
            setClientId('');
            setSearchQuery('');
            setTeacherId('');
            setType(SessionType.LESSON);
        }
    }, [session, initialTime, isOpen, clients]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsClientListOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getEndTime = (start: Date, sessionType: SessionType): Date => {
        const endDate = new Date(start);
        switch (sessionType) {
            case SessionType.LESSON_PRACTICE:
            case SessionType.PRACTICE_PRACTICE:
                endDate.setHours(endDate.getHours() + 2);
                break;
            case SessionType.LESSON:
            case SessionType.PRACTICE:
            default:
                endDate.setHours(endDate.getHours() + 1);
                break;
        }
        return endDate;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId || !teacherId || !startTime) return;

        const start = new Date(startTime);
        const end = getEndTime(start, type);

        addSession({ clientId, teacherId, startTime: start, endTime: end, type });
        onClose();
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setClientId('');
        if (!isClientListOpen) setIsClientListOpen(true);
    };
    
    const handleClientSelect = (client: Client) => {
        setClientId(client.id);
        setSearchQuery(client.name);
        setIsClientListOpen(false);
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    const isViewing = !!session;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{isViewing ? 'Детали занятия' : 'Создать новое занятие'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <XIcon />
                    </button>
                </div>
                {isViewing && session ? (
                     <div className="p-6 grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 items-center">
                        <strong>Клиент:</strong>
                        <button
                            onClick={() => {
                                if (session?.clientId) {
                                    navigateToClient(session.clientId);
                                    onClose();
                                }
                            }}
                            className="text-brand-purple hover:underline focus:outline-none font-medium text-left"
                        >
                            {clients.find(c => c.id === session.clientId)?.name}
                        </button>

                        <strong>Преподаватель:</strong>
                        <span>{teachers.find(t => t.id === session.teacherId)?.name}</span>

                        <strong>Тип:</strong>
                        <span>{session.type}</span>

                        <strong>Время:</strong>
                        <span>{session.startTime.toLocaleString('ru-RU', {dateStyle: 'short', timeStyle: 'short'})} - {session.endTime.toLocaleString('ru-RU', {timeStyle: 'short'})}</span>
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="relative" ref={searchRef}>
                        <label htmlFor="client-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Клиент</label>
                        <input
                            type="text"
                            id="client-search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => setIsClientListOpen(true)}
                            placeholder="Начните вводить имя клиента..."
                            autoComplete="off"
                            required
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                        {isClientListOpen && (
                            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                {filteredClients.length > 0 ? (
                                    filteredClients.map(client => (
                                        <li
                                            key={client.id}
                                            onClick={() => handleClientSelect(client)}
                                            className="p-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500"
                                        >
                                            {client.name}
                                        </li>
                                    ))
                                ) : (
                                    <li className="p-2 text-sm text-gray-500 dark:text-gray-400 italic">Клиентов не найдено</li>
                                )}
                            </ul>
                        )}
                    </div>
                    <div>
                        <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Преподаватель</label>
                        <select id="teacher" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">
                            <option value="" disabled>Выберите преподавателя</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Тип занятия</label>
                        <select id="type" value={type} onChange={(e) => setType(e.target.value as SessionType)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">
                            {Object.values(SessionType).map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Время начала</label>
                        <input type="datetime-local" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:[color-scheme:dark]" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500">Отмена</button>
                        <button type="submit" className="px-4 py-2 bg-brand-purple text-white rounded-md text-sm font-medium hover:bg-brand-purple/90">Сохранить</button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
};

export default SessionModal;