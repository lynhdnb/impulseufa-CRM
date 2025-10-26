export enum SessionType {
  LESSON_PRACTICE = 'Урок + Практика (2ч)',
  PRACTICE_PRACTICE = 'Практика + Практика (2ч)',
  PRACTICE = 'Практика (1ч)',
  LESSON = 'Урок (1ч)',
}

export interface Communication {
  id: string;
  date: Date;
  type: 'Call' | 'Message' | 'Email' | 'Note';
  summary: string;
}

export interface Subscription {
    id: string;
    name: string;
    price: number;
    sessions: number;
}

export interface Task {
  id: string;
  text: string;
  dueDate: Date | null;
  isCompleted: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinDate: Date;
  activeSubscriptionId?: string;
  communicationHistory: Communication[];
  bookingHistoryIds: string[];
  tasks: Task[];
}

export interface Teacher {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

export interface Session {
  id: string;
  clientId: string;
  teacherId: string;
  startTime: Date;
  endTime: Date;
  type: SessionType;
}

export type View = 'calendar' | 'clients' | 'sales' | 'knowledge' | 'settings';