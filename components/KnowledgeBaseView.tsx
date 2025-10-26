

import React, { useState, useCallback } from 'react';
import { generateScript } from '../services/geminiService';
import { SparklesIcon } from './Icons';

const scenarios = [
    "Первый контакт с новым клиентом",
    "Связь после пробного урока",
    "Работа с возражением по цене",
    "Допродажа более длинного курса",
    "Возобновление работы с бывшим клиентом",
];

const KnowledgeBaseView: React.FC = () => {
    const [selectedScenario, setSelectedScenario] = useState<string>(scenarios[0]);
    const [context, setContext] = useState<string>('');
    const [generatedScript, setGeneratedScript] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setGeneratedScript('');
        const script = await generateScript(selectedScenario, context);
        setGeneratedScript(script);
        setIsLoading(false);
    }, [selectedScenario, context]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">AI-генератор скриптов</h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Выберите сценарий и предоставьте дополнительный контекст для создания индивидуального скрипта общения для ваших менеджеров.
                </p>
                <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div>
                        <label htmlFor="scenario" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Сценарий</label>
                        <select
                            id="scenario"
                            value={selectedScenario}
                            onChange={(e) => setSelectedScenario(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                        >
                            {scenarios.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="context" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Дополнительный контекст</label>
                        <textarea
                            id="context"
                            rows={4}
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="Например: Клиент - новичок, интересуется техно-музыкой. Его зовут Иван Петров."
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-purple focus:border-brand-purple sm:text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-purple hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon />
                        <span>{isLoading ? 'Генерация...' : 'Сгенерировать скрипт'}</span>
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Сгенерированный скрипт</h2>
                {isLoading && (
                     <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-purple"></div>
                    </div>
                )}
                {generatedScript && (
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                        // Fix: Directly render HTML from Gemini without string replacement for better formatting.
                        dangerouslySetInnerHTML={{ __html: generatedScript }}
                    />
                )}
                 {!isLoading && !generatedScript && (
                    <div className="text-center text-gray-500 dark:text-gray-400 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        Здесь появится ваш сгенерированный скрипт.
                    </div>
                 )}
            </div>
        </div>
    );
};

export default KnowledgeBaseView;