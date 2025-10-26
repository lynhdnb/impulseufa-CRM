import React, { useState } from 'react';
import { Subscription, Client } from '../types';
import { CurrencyDollarIcon, CheckCircleIcon } from './Icons';

interface SalesViewProps {
    subscriptions: Subscription[];
    clients: Client[];
    updateClientSubscription: (clientId: string, subscriptionId: string) => void;
}

const SalesView: React.FC<SalesViewProps> = ({ 
    subscriptions, 
    clients, 
    updateClientSubscription, 
}) => {
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedSubId, setSelectedSubId] = useState<string>('');
    const [feedbackMessage, setFeedbackMessage] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClientId || !selectedSubId) {
            setFeedbackMessage('Пожалуйста, выберите клиента и абонемент.');
            return;
        }
        updateClientSubscription(selectedClientId, selectedSubId);
        const clientName = clients.find(c => c.id === selectedClientId)?.name;
        const subName = subscriptions.find(s => s.id === selectedSubId)?.name;
        setFeedbackMessage(`Абонемент '${subName}' успешно назначен клиенту ${clientName}!`);
        setSelectedClientId('');
        setSelectedSubId('');
        setTimeout(() => setFeedbackMessage(''), 3000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Абонементы и курсы</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subscriptions.map(sub => (
                        <div key={sub.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-brand-purple">{sub.name}</h2>
                            <p className="text-3xl font-extrabold text-gray-800 dark:text-white my-3">${sub.price}</p>
                            <p className="text-gray-600 dark:text-gray-300">Включено занятий: {sub.sessions}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg sticky top-24">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Назначить абонемент</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="client" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Клиент</label>
                            <select
                                id="client"
                                value={selectedClientId}
                                onChange={e => setSelectedClientId(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="" disabled>Выберите клиента</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="subscription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Абонемент</label>
                            <select
                                id="subscription"
                                value={selectedSubId}
                                onChange={e => setSelectedSubId(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="" disabled>Выберите абонемент</option>
                                {subscriptions.map(sub => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-purple hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple"
                        >
                           <CurrencyDollarIcon />
                           <span>Назначить</span>
                        </button>
                    </form>
                    {feedbackMessage && (
                        <div className="mt-4 p-3 rounded-md bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-200 flex items-center space-x-2">
                            <CheckCircleIcon />
                            <p className="text-sm">{feedbackMessage}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesView;