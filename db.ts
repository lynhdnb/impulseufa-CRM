// Fix: Changed Dexie import to use the default export for the Dexie class. This is the correct
// syntax for Dexie v3 and resolves errors where methods like 'version' and 'transaction' were not found.
import Dexie, { type Table } from 'dexie';
import { Client, Session } from './types';
import { mockClients, mockSessions } from './data';

export class DJCRMDatabase extends Dexie {
    clients!: Table<Client, string>;
    sessions!: Table<Session, string>;

    constructor() {
        super('djCrmDatabase');
        this.version(2).stores({
            clients: '&id, name, email, phone',
            sessions: '&id, clientId, teacherId, startTime'
        });
        // Dexie will automatically handle the upgrade from version 1 if it exists.
    }
}

export const db = new DJCRMDatabase();

export async function populateDatabase() {
    const clientCount = await db.clients.count();
    if (clientCount === 0) {
        console.log("Database is empty, populating with mock data...");
        try {
            await db.clients.bulkAdd(mockClients);
            await db.sessions.bulkAdd(mockSessions);
            console.log("Population complete.");
        } catch (error) {
            console.error("Failed to populate database:", error);
        }
    }
}

export async function clearAndRepopulateDatabase() {
    console.warn("Clearing and re-populating the database!");
    try {
        await db.transaction('rw', db.clients, db.sessions, async () => {
            await db.clients.clear();
            await db.sessions.clear();
            await db.clients.bulkAdd(mockClients);
            await db.sessions.bulkAdd(mockSessions);
        });
        console.log("Database has been reset and populated.");
    } catch (error) {
        console.error("Failed to clear and re-populate database:", error);
    }
}

export async function exportDatabase(): Promise<string> {
    const clientsData = await db.clients.toArray();
    const sessionsData = await db.sessions.toArray();
    const exportData = {
        clients: clientsData,
        sessions: sessionsData,
    };
    return JSON.stringify(exportData, null, 2);
}

export async function importDatabase(jsonString: string): Promise<void> {
    const importData = JSON.parse(jsonString);

    if (!importData.clients || !importData.sessions || !Array.isArray(importData.clients) || !Array.isArray(importData.sessions)) {
        throw new Error("Invalid import file format. The file must contain 'clients' and 'sessions' arrays.");
    }

    // Dates from JSON are strings, so we need to convert them back to Date objects
    const clientsWithDates = importData.clients.map((c: any) => ({
        ...c,
        joinDate: new Date(c.joinDate),
        communicationHistory: c.communicationHistory.map((comm: any) => ({ ...comm, date: new Date(comm.date) })),
        tasks: c.tasks.map((t: any) => ({...t, dueDate: t.dueDate ? new Date(t.dueDate) : null }))
    }));

    const sessionsWithDates = importData.sessions.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: new Date(s.endTime),
    }));


    await db.transaction('rw', db.clients, db.sessions, async () => {
        await db.clients.clear();
        await db.sessions.clear();
        await db.clients.bulkAdd(clientsWithDates);
        await db.sessions.bulkAdd(sessionsWithDates);
    });
}