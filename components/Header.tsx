import React from 'react';
import { View } from '../types';
import { CalendarIcon, UsersIcon, SparklesIcon, MusicNoteIcon, CogIcon, CurrencyDollarIcon } from './Icons';

interface HeaderProps {
    currentView: View;
    setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
    const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
        { view: 'calendar', label: 'Календарь', icon: <CalendarIcon /> },
        { view: 'clients', label: 'Клиенты', icon: <UsersIcon /> },
        { view: 'sales', label: 'Продажи', icon: <CurrencyDollarIcon /> },
        { view: 'knowledge', label: 'База знаний', icon: <SparklesIcon /> },
        { view: 'settings', label: 'Настройки', icon: <CogIcon /> },
    ];

    const getNavItemClass = (view: View) => {
        const base = "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
        if (view === currentView) {
            return `${base} bg-brand-purple text-white`;
        }
        return `${base} text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`;
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 flex items-center space-x-2 text-brand-purple dark:text-gray-100">
                           <MusicNoteIcon />
                           <span className="font-bold text-xl">DJ CRM</span>
                        </div>
                    </div>
                    <nav className="hidden md:flex md:space-x-4">
                        {navItems.map(item => (
                            <button key={item.view} onClick={() => setView(item.view)} className={getNavItemClass(item.view)}>
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
             <nav className="md:hidden p-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-around">
                    {navItems.map(item => (
                        <button key={item.view} onClick={() => setView(item.view)} className={getNavItemClass(item.view) + " flex-col h-16 w-20 justify-center space-x-0 space-y-1"}>
                            {item.icon}
                            <span className="text-xs">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </header>
    );
};

export default Header;