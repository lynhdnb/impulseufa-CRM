import React, { useState, useMemo, useEffect } from 'react';
import { Client, Session, Subscription, Communication, Task } from '../types';
import { SearchIcon, UserCircleIcon, PhoneIcon, MailIcon, CalendarIcon, PlusIcon, ClipboardCheckIcon, ArrowLeftIcon, XIcon } from './Icons';

interface ClientsViewProps {
    clients: Client[];
    sessions: Session[];
    subscriptions: Subscription[];
    addClientCommunication: (clientId: string, communication: Omit<Communication, 'id' | 'date'>) => void;
    addTask: (clientId: string, taskText: string, dueDate: Date | null) => void;
    toggleTask: (clientId: string, taskId: string) => void;
    addClient: (name: string, phone: string, email: string) => void;
    initialSelectedClientId: string | null;
}

const NewClientModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    addClient: (name: string, phone: string, email: string) => void;
}> = ({ isOpen, onClose, addClient }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove all non-digit characters
        let input = e.target.value.replace(/\D/g, '');

        // Russian numbers can start with 7 or 8, we strip them to get the core 10 digits
        if (input.startsWith('7') || input.startsWith('8')) {
            input = input.substring(1);
        }
        
        // We only care about the first 10 digits
        const phoneNumber = input.substring(0, 10);

        let formatted = '';
        if (phoneNumber.length > 0) {
            formatted = `+7 (${phoneNumber.substring(0, 3)}`;
        }
        if (phoneNumber.length >= 4) {
            formatted += `) ${phoneNumber.substring(3, 6)}`;
        }
        if (phoneNumber.length >= 7) {
            formatted += `-${phoneNumber.substring(6, 8)}`;
        }
        if (phoneNumber.length >= 9) {
            formatted += `-${phoneNumber.substring(8, 10)}`;
        }
        setPhone(formatted);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length !== 18) {
            alert('Пожалуйста, введите полный номер телефона в формате +7 (XXX) XXX-XX-XX.');
            return;
        }
        if (name.trim() && email.trim()) {
            addClient(name, phone, email);
            onClose();
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            setName('');
            setPhone('');
            setEmail('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">Создать нового клиента</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Имя</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Телефон</label>
                        <input 
                            type="tel" 
                            id="phone" 
                            value={phone} 
                            onChange={handlePhoneChange} 
                            required 
                            placeholder="+7 (XXX) XXX-XX-XX"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500">Отмена</button>
                        <button type="submit" className="px-4 py-2 bg-brand-purple text-white rounded-md text-sm font-medium hover:bg-brand-purple/90">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ClientDetailView: React.FC<{ 
    client: Client;
    clientSessions: Session[];
    subscriptions: Subscription[];
    addClientCommunication: (clientId: string, communication: Omit<Communication, 'id' | 'date'>) => void;
    addTask: (clientId: string, taskText: string, dueDate: Date | null) => void;
    toggleTask: (clientId: string, taskId: string) => void;
    onBack: () => void;
}> = ({ client, clientSessions, subscriptions, addClientCommunication, addTask, toggleTask, onBack }) => {
    
    const [commType, setCommType] = useState<'Call' | 'Message' | 'Email' | 'Note'>('Note');
    const [commSummary, setCommSummary] = useState('');
    const [taskText, setTaskText] = useState('');
    const [taskDueDate, setTaskDueDate] = useState('');

    const activeSubscription = subscriptions.find(s => s.id === client.activeSubscriptionId);
    
    const handleAddCommunication = (e: React.FormEvent) => {
        e.preventDefault();
        if (commSummary.trim()) {
            addClientCommunication(client.id, { type: commType, summary: commSummary });
            setCommSummary('');
        }
    };
    
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if(taskText.trim()) {
            const dueDate = taskDueDate ? new Date(taskDueDate) : null;
            addTask(client.id, taskText, dueDate);
            setTaskText('');
            setTaskDueDate('');
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex flex-col">
            <div className="p-4 border-b dark:border-gray-700">
                 <button onClick={onBack} className="flex items-center space-x-2 text-sm text-brand-purple hover:underline mb-4">
                    <ArrowLeftIcon />
                    <span>Все клиенты</span>
                </button>
                <div className="flex items-center space-x-4">
                    <UserCircleIcon className="w-16 h-16 text-gray-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Клиент с {client.joinDate.toLocaleDateString('ru-RU')}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto">
                {/* Left Column */}
                <div className="space-y-6">
                    <div>
                         <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-gray-700">Контактная информация</h3>
                         <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2"><PhoneIcon /><span className="text-gray-600 dark:text-gray-300">{client.phone}</span></div>
                            <div className="flex items-center space-x-2"><MailIcon /><span className="text-gray-600 dark:text-gray-300">{client.email}</span></div>
                             <div className="flex items-center space-x-2 pt-2"><CalendarIcon /><span className={`font-semibold px-2 py-1 rounded-full text-xs ${activeSubscription ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>{activeSubscription?.name || 'Нет активного абонемента'}</span></div>
                         </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-gray-700">История записей</h3>
                        <ul className="space-y-3 max-h-72 overflow-y-auto pr-2">
                            {clientSessions.length > 0 ? clientSessions.map(session => (
                                <li key={session.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm">
                                    <p className="font-semibold">{session.type}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{session.startTime.toLocaleString('ru-RU')}</p>
                                </li>
                            )) : <p className="text-sm text-gray-400 italic">Записей пока нет.</p>}
                        </ul>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                     <div>
                        <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-gray-700">История коммуникаций</h3>
                        <form onSubmit={handleAddCommunication} className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <textarea value={commSummary} onChange={e => setCommSummary(e.target.value)} placeholder="Добавить новую запись..." rows={2} className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-600 dark:border-gray-500 focus:ring-brand-purple focus:border-brand-purple text-sm"></textarea>
                            <div className="flex items-center justify-between mt-2">
                                 <select value={commType} onChange={e => setCommType(e.target.value as any)} className="border border-gray-300 rounded-md bg-white dark:bg-gray-600 dark:border-gray-500 text-sm p-2">
                                    <option value="Note">Заметка</option><option value="Call">Звонок</option><option value="Message">Сообщение</option><option value="Email">Email</option>
                                </select>
                                <button type="submit" className="flex items-center space-x-2 bg-brand-purple text-white px-3 py-2 rounded-md text-sm hover:bg-brand-purple/90"><PlusIcon className="w-4 h-4" /><span>Добавить</span></button>
                            </div>
                        </form>
                        <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
                           {client.communicationHistory.length > 0 ? client.communicationHistory.map(comm => (
                                 <li key={comm.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{comm.summary}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>{comm.type}</span>
                                        <span>{comm.date.toLocaleString('ru-RU')}</span>
                                    </div>
                                </li>
                            )) : <p className="text-sm text-gray-400 italic">Нет истории коммуникаций.</p>}
                        </ul>
                    </div>

                     <div>
                        <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-gray-700 flex items-center space-x-2"><ClipboardCheckIcon /> <span>Задачи менеджера</span></h3>
                         <form onSubmit={handleAddTask} className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <input value={taskText} onChange={e => setTaskText(e.target.value)} placeholder="Новая задача..." className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-600 dark:border-gray-500 focus:ring-brand-purple focus:border-brand-purple text-sm" />
                            <div className="flex items-center justify-between mt-2">
                                <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} className="border border-gray-300 rounded-md bg-white dark:bg-gray-600 dark:border-gray-500 text-sm p-2 dark:[color-scheme:dark]" />
                                <button type="submit" className="flex items-center space-x-2 bg-brand-purple text-white px-3 py-2 rounded-md text-sm hover:bg-brand-purple/90"><PlusIcon className="w-4 h-4" /><span>Добавить задачу</span></button>
                            </div>
                        </form>
                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {client.tasks.length > 0 ? client.tasks.map(task => (
                                <li key={task.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <input type="checkbox" checked={task.isCompleted} onChange={() => toggleTask(client.id, task.id)} className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple" />
                                    <div className="flex-1 text-sm">
                                        <p className={`${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{task.text}</p>
                                        {task.dueDate && <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(task.dueDate).toLocaleDateString('ru-RU')}</p>}
                                    </div>
                                </li>
                            )) : <p className="text-sm text-gray-400 italic">Нет задач по этому клиенту.</p>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClientListView: React.FC<{
    clients: Client[];
    onClientSelect: (clientId: string) => void;
    addClient: (name: string, phone: string, email: string) => void;
}> = ({ clients, onClientSelect, addClient }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const filteredClients = useMemo(() => {
        return clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col h-full">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Клиенты</h2>
                 <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-brand-purple text-white px-3 py-2 rounded-md hover:bg-brand-purple/90 transition-colors text-sm font-medium">
                    <PlusIcon />
                    <span>Создать клиента</span>
                </button>
            </div>
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Поиск клиентов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-brand-purple focus:border-brand-purple"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <ul className="space-y-2 overflow-y-auto flex-1">
                {filteredClients.map(client => (
                    <li key={client.id}>
                        <button onClick={() => onClientSelect(client.id)} className="w-full text-left p-3 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple">
                            <p className="font-semibold">{client.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{client.email}</p>
                        </button>
                    </li>
                ))}
            </ul>
             <NewClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} addClient={addClient} />
        </div>
    );
};

const ClientsView: React.FC<ClientsViewProps> = (props) => {
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

    useEffect(() => {
        if (props.initialSelectedClientId) {
            setSelectedClientId(props.initialSelectedClientId);
        }
    }, [props.initialSelectedClientId]);

    const selectedClient = useMemo(() => {
        return props.clients.find(c => c.id === selectedClientId);
    }, [props.clients, selectedClientId]);

    const clientSessions = useMemo(() => {
        if (!selectedClient) return [];
        return props.sessions.filter(s => s.clientId === selectedClient.id)
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    }, [props.sessions, selectedClient]);

    if (selectedClient) {
        return <ClientDetailView 
            client={selectedClient}
            clientSessions={clientSessions}
            subscriptions={props.subscriptions}
            addClientCommunication={props.addClientCommunication}
            addTask={props.addTask}
            toggleTask={props.toggleTask}
            onBack={() => setSelectedClientId(null)}
        />
    }

    return <ClientListView clients={props.clients} onClientSelect={setSelectedClientId} addClient={props.addClient} />
};

export default ClientsView;