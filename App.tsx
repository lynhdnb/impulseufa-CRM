import React, { useState, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { View, Client, Session, Teacher, Subscription, Communication, Task } from './types';
import { mockTeachers, mockSubscriptions } from './data';
import Header from './components/Header';
import CalendarView from './components/CalendarView';
import ClientsView from './components/ClientsView';
import SalesView from './components/SalesView';
import KnowledgeBaseView from './components/KnowledgeBaseView';
import SettingsView from './components/SettingsView';
import { db, populateDatabase, clearAndRepopulateDatabase, exportDatabase, importDatabase } from './db';
import { initClient, signIn, signOut, uploadToDrive, importFromDrive } from './services/googleDriveService';

const App: React.FC = () => {
    const [view, setView] = useState<View>('calendar');
    const [initialSelectedClientId, setInitialSelectedClientId] = useState<string | null>(null);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [googleUser, setGoogleUser] = useState<any>(null);
    const [isGoogleDriveReady, setIsGoogleDriveReady] = useState(false);


    // Populate database with mock data if it's empty & init GAPI
    useEffect(() => {
        populateDatabase();
        
        const handleAuthChange = (user: any) => {
            if (user && user.name) {
                setIsSignedIn(true);
                setGoogleUser(user);
            } else {
                setIsSignedIn(false);
                setGoogleUser(null);
            }
        };

        const initializeGoogleClient = async () => {
            const success = await initClient(handleAuthChange);
            setIsGoogleDriveReady(success);
        };
        
        initializeGoogleClient();

    }, []);

    const clients = useLiveQuery(() => db.clients.toArray());
    const sessions = useLiveQuery(() => db.sessions.toArray());
    
    // For now, teachers and subscriptions are static. They could be moved to DB as well.
    const [teachers] = useState<Teacher[]>(mockTeachers);
    const [subscriptions] = useState<Subscription[]>(mockSubscriptions);

    const navigateToClient = useCallback((clientId: string) => {
        setInitialSelectedClientId(clientId);
        setView('clients');
    }, []);

    const addSession = useCallback(async (newSession: Omit<Session, 'id'>) => {
        const newId = `s${Date.now()}`;
        const sessionWithId = { ...newSession, id: newId };
        await db.sessions.add(sessionWithId);
        // Also update client's booking history
        await db.clients.where('id').equals(newSession.clientId).modify(client => {
            client.bookingHistoryIds.push(newId);
        });
    }, []);
    
    const updateSession = useCallback(async (sessionId: string, newStartTime: Date, newEndTime: Date) => {
        await db.sessions.update(sessionId, { startTime: newStartTime, endTime: newEndTime });
    }, []);

    const updateClientSubscription = useCallback(async (clientId: string, subscriptionId: string) => {
        await db.clients.update(clientId, { activeSubscriptionId: subscriptionId });
    }, []);

    const addClientCommunication = useCallback(async (clientId: string, communication: Omit<Communication, 'id' | 'date'>) => {
        const newComm: Communication = { ...communication, id: `comm${Date.now()}`, date: new Date() };
        await db.clients.where('id').equals(clientId).modify(client => {
            client.communicationHistory.unshift(newComm);
        });
    }, []);
    
    const addClient = useCallback(async (name: string, phone: string, email: string) => {
        const newClient: Client = {
            id: `c${Date.now()}`,
            name,
            phone,
            email,
            joinDate: new Date(),
            communicationHistory: [],
            bookingHistoryIds: [],
            tasks: [],
        };
        await db.clients.add(newClient);
    }, []);

    const addTask = useCallback(async (clientId: string, taskText: string, dueDate: Date | null) => {
        const newTask: Task = {
            id: `task${Date.now()}`,
            text: taskText,
            dueDate,
            isCompleted: false
        };
        await db.clients.where('id').equals(clientId).modify(client => {
            client.tasks.unshift(newTask);
        });
    }, []);

    const toggleTask = useCallback(async (clientId: string, taskId: string) => {
        await db.clients.where('id').equals(clientId).modify(client => {
            const task = client.tasks.find(t => t.id === taskId);
            if (task) {
                task.isCompleted = !task.isCompleted;
            }
        });
    }, []);
    
    const handleResetDatabase = useCallback(async () => {
        await clearAndRepopulateDatabase();
    }, []);

    // Google Drive Handlers
    const handleGoogleSignIn = () => signIn();
    const handleGoogleSignOut = () => {
        signOut(() => {
            setIsSignedIn(false);
            setGoogleUser(null);
        });
    };
    
    const handleGoogleExport = async () => {
        const jsonString = await exportDatabase();
        await uploadToDrive(jsonString);
    };

    const handleGoogleImport = async () => {
        const jsonString = await importFromDrive();
        await importDatabase(jsonString);
    };


    const headerSetView = (newView: View) => {
        if (newView === 'clients') {
            setInitialSelectedClientId(null);
        }
        setView(newView);
    };

    const renderView = () => {
        if (!clients || !sessions) {
            return (
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-purple"></div>
                </div>
            );
        }

        switch (view) {
            case 'calendar':
                return <CalendarView sessions={sessions} clients={clients} teachers={teachers} addSession={addSession} navigateToClient={navigateToClient} updateSession={updateSession} />;
            case 'clients':
                return <ClientsView 
                            clients={clients} 
                            sessions={sessions} 
                            subscriptions={subscriptions} 
                            addClientCommunication={addClientCommunication} 
                            addTask={addTask}
                            toggleTask={toggleTask}
                            addClient={addClient}
                            initialSelectedClientId={initialSelectedClientId} />;
            case 'sales':
                return <SalesView 
                            subscriptions={subscriptions} 
                            clients={clients} 
                            updateClientSubscription={updateClientSubscription} 
                            />;
            case 'knowledge':
                return <KnowledgeBaseView />;
            case 'settings':
                return <SettingsView 
                            handleResetDatabase={handleResetDatabase}
                            isSignedIn={isSignedIn}
                            googleUser={googleUser}
                            isGoogleDriveReady={isGoogleDriveReady}
                            handleGoogleSignIn={handleGoogleSignIn}
                            handleGoogleSignOut={handleGoogleSignOut}
                            handleGoogleExport={handleGoogleExport}
                            handleGoogleImport={handleGoogleImport}
                            />;
            default:
                return <CalendarView sessions={sessions} clients={clients} teachers={teachers} addSession={addSession} navigateToClient={navigateToClient} updateSession={updateSession} />;
        }
    };

    return (
        <div className="flex flex-col h-screen font-sans">
            <Header currentView={view} setView={headerSetView} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
                {renderView()}
            </main>
        </div>
    );
};

export default App;