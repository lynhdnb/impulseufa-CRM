import React, { useState, useEffect } from 'react';
import { CogIcon, QuestionMarkCircleIcon } from './Icons';

interface SettingsViewProps {
    handleResetDatabase: () => void;
    isSignedIn: boolean;
    googleUser: any;
    isGoogleDriveReady: boolean;
    handleGoogleSignIn: () => void;
    handleGoogleSignOut: () => void;
    handleGoogleExport: () => Promise<void>;
    handleGoogleImport: () => Promise<void>;
}

const SettingsView: React.FC<SettingsViewProps> = ({
    handleResetDatabase,
    isSignedIn,
    googleUser,
    isGoogleDriveReady,
    handleGoogleSignIn,
    handleGoogleSignOut,
    handleGoogleExport,
    handleGoogleImport
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [cloudFeedback, setCloudFeedback] = useState('');
    const [clientId, setClientId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [keysSaved, setKeysSaved] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        setClientId(localStorage.getItem('googleClientId') || '');
        setApiKey(localStorage.getItem('googleApiKey') || '');
    }, []);

    const handleSaveKeys = () => {
        localStorage.setItem('googleClientId', clientId);
        localStorage.setItem('googleApiKey', apiKey);
        setKeysSaved(true);
    };

    const onResetClick = () => {
        if (window.confirm("Вы уверены, что хотите сбросить все данные? Это действие удалит всех клиентов и записи, восстановив демонстрационные данные. Это действие нельзя отменить.")) {
            handleResetDatabase();
        }
    };

    const onExportClick = async () => {
        setIsLoading(true);
        setCloudFeedback('Экспорт данных...');
        try {
            await handleGoogleExport();
            setCloudFeedback('Данные успешно экспортированы в Google Drive!');
        } catch(e) {
            console.error(e);
            setCloudFeedback(`Ошибка экспорта: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setIsLoading(false);
            setTimeout(() => setCloudFeedback(''), 5000);
        }
    }

    const onImportClick = async () => {
        if (!window.confirm("Импорт данных заменит всю текущую информацию в CRM. Вы уверены, что хотите продолжить?")) {
            return;
        }
        setIsLoading(true);
        setCloudFeedback('Импорт данных...');
        try {
            await handleGoogleImport();
            setCloudFeedback('Данные успешно импортированы из Google Drive!');
        } catch(e) {
            console.error(e);
            setCloudFeedback(`Ошибка импорта: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setIsLoading(false);
            setTimeout(() => setCloudFeedback(''), 5000);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Настройки</h1>

            {/* API Key Management */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                 <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Настройка Google API</h2>
                    <button 
                        onClick={() => setShowInstructions(!showInstructions)} 
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-brand-purple dark:text-gray-400 dark:hover:text-brand-purple"
                    >
                        <QuestionMarkCircleIcon />
                        <span>Как получить ключи?</span>
                    </button>
                 </div>
                 
                {showInstructions && (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                        <h4>Пошаговая инструкция</h4>
                        <ol>
                            <li>Перейдите в <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-brand-purple hover:underline">Google Cloud Console</a> и создайте новый проект (или выберите существующий).</li>
                            <li>В меню навигации выберите <strong>"API и сервисы" &rarr; "Библиотека"</strong>.</li>
                            <li>Найдите и включите <strong>"Google Drive API"</strong>.</li>
                            <li>Перейдите в <strong>"API и сервисы" &rarr; "Учетные данные"</strong>.</li>
                            <li>
                                Нажмите <strong>"+ Создать учетные данные"</strong> и выберите <strong>"Ключ API"</strong>.
                                <ul className="list-disc pl-5">
                                    <li>Скопируйте полученный ключ и вставьте его в поле <strong>"Google API Key"</strong> ниже.</li>
                                    <li><strong>Важно:</strong> Нажмите на созданный ключ и в разделе "Ограничения для приложений" выберите "Веб-сайты", затем добавьте URL-адрес этого приложения, чтобы защитить ключ.</li>
                                </ul>
                            </li>
                             <li>
                                Снова нажмите <strong>"+ Создать учетные данные"</strong> и выберите <strong>"Идентификатор клиента OAuth"</strong>.
                                <ul className="list-disc pl-5">
                                    <li>Выберите тип приложения "Веб-приложение".</li>
                                    <li>В разделе "Разрешенные источники JavaScript" добавьте URL этого приложения.</li>
                                    <li>В разделе "Разрешенные URI перенаправления" также добавьте URL этого приложения.</li>
                                    <li>Нажмите "Создать", скопируйте полученный <strong>"Идентификатор клиента"</strong> и вставьте его в поле <strong>"Google Client ID"</strong> ниже.</li>
                                </ul>
                            </li>
                        </ol>
                    </div>
                )}
                 
                 <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Чтобы использовать синхронизацию с Google Drive, вам необходимо предоставить свои ключи API. Ключи сохраняются только в вашем браузере.
                 </p>
                 <div className="space-y-4">
                     <div>
                        <label htmlFor="clientId" className="block text-sm font-medium">Google Client ID</label>
                        <input 
                            type="text" 
                            id="clientId"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                     </div>
                      <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium">Google API Key</label>
                        <input 
                            type="text" 
                            id="apiKey"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                     </div>
                     <button onClick={handleSaveKeys} className="px-4 py-2 bg-brand-purple text-white rounded-md text-sm font-medium hover:bg-brand-purple/90">
                        Сохранить ключи
                     </button>
                     {keysSaved && <p className="text-sm text-green-600 dark:text-green-400">Ключи сохранены. Пожалуйста, перезагрузите страницу, чтобы применить изменения.</p>}
                 </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2"><CogIcon/> <span>Управление данными</span></h2>
                <div className="space-y-4">
                    {isGoogleDriveReady ? (
                         isSignedIn ? (
                            <div className="p-4 border dark:border-gray-600 rounded-lg space-y-4">
                                <div className="flex items-center space-x-3">
                                    <img src={googleUser?.picture} alt="user" className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold">{googleUser?.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{googleUser?.email}</p>
                                    </div>
                                    <button onClick={handleGoogleSignOut} className="ml-auto px-3 py-1 text-xs border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Выйти</button>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Ваши данные будут сохранены в папку <code className="bg-gray-200 dark:bg-gray-700 p-1 rounded text-xs">DJ_CRM_Backups</code> на вашем Google Диске.
                                </p>
                                <div className="flex space-x-4">
                                    <button onClick={onExportClick} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">Экспорт в Google Drive</button>
                                    <button onClick={onImportClick} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">Импорт из Google Drive</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    Войдите в свой аккаунт Google, чтобы сохранять и загружать резервные копии данных.
                                </p>
                                <button onClick={handleGoogleSignIn} className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                                    <span>Войти через Google</span>
                                </button>
                            </div>
                        )
                    ) : (
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                Функция синхронизации с Google Drive недоступна. Пожалуйста, введите и сохраните ваши ключи API выше.
                            </p>
                        </div>
                    )}
                     {cloudFeedback && <p className="text-sm text-center mt-4">{cloudFeedback}</p>}
                    <div className="pt-4 mt-4 border-t dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            Если вам нужно вернуться к исходному состоянию, вы можете сбросить базу данных.
                        </p>
                        <button
                            onClick={onResetClick}
                            className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-red-500 rounded-md shadow-sm text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <span>Сбросить демонстрационные данные</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;