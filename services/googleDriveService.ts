// Fix: Add type declarations for gapi and google to resolve TypeScript errors.
declare namespace google {
    namespace accounts {
        namespace oauth2 {
            function initTokenClient(config: TokenClientConfig): TokenClient;
            function revoke(token: string, callback: () => void): void;
            interface TokenClient {
                requestAccessToken: (options: { prompt: string }) => void;
            }
            interface TokenClientConfig {
                client_id: string;
                scope: string;
                callback: (response: TokenResponse) => void;
            }
            interface TokenResponse {
                access_token: string;
                error?: any;
            }
        }
    }
}

declare namespace gapi {
    function load(apiName: string, callback: () => void): void;
    namespace client {
        function init(args: any): Promise<void>;
        function getToken(): any;
        function setToken(token: any): void;
        function request(args: any): Promise<any>;
        namespace drive {
            namespace files {
                function list(args: any): Promise<any>;
                function create(args: any): Promise<any>;
                function get(args: any): Promise<any>;
            }
        }
    }
}

// This service handles all interactions with the Google Drive API.

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
// This scope allows the app to create files and see only the files it created.
const SCOPES = "https://www.googleapis.com/auth/drive.file";

const FOLDER_NAME = 'DJ_CRM_Backups';
const FILE_NAME = 'dj_crm_backup.json';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;

export const initClient = (onAuthChange: (user: any) => void): Promise<boolean> => {
    return new Promise((resolve) => {
        // Re-introduce reading from localStorage first, then fallback to environment variables.
        const CLIENT_ID = localStorage.getItem('googleClientId') || process.env.GOOGLE_CLIENT_ID;
        const API_KEY = localStorage.getItem('googleApiKey') || process.env.GOOGLE_API_KEY;


        if (!CLIENT_ID || !API_KEY) {
            console.warn("Google API credentials are not set. Google Drive features will not be available.");
            resolve(false);
            return;
        }

        gapi.load('client', async () => {
            try {
                // Fix: Pass clientId and scope to gapi.client.init. The error "API discovery response
                // missing required fields" can occur when the GAPI client is initialized for an
                // API that requires OAuth (like Google Drive) without providing the necessary
                // OAuth credentials (clientId and scope) during initialization. This ensures
                // the client library is properly configured for authenticated requests from the outset.
                await gapi.client.init({
                    apiKey: API_KEY,
                    clientId: CLIENT_ID,
                    scope: SCOPES,
                    discoveryDocs: DISCOVERY_DOCS,
                });
                
                tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: CLIENT_ID,
                    scope: SCOPES,
                    callback: async (resp) => {
                        if (resp.error) {
                            console.error("Auth Error:", resp.error);
                            onAuthChange(null);
                            return;
                        }
                        gapi.client.setToken({ access_token: resp.access_token });
                        
                        try {
                            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                headers: { 'Authorization': `Bearer ${resp.access_token}` }
                            });
                            const user = await res.json();
                            onAuthChange(user);
                        } catch (e) {
                            console.error("Error fetching user info:", e);
                            onAuthChange(null);
                        }
                    },
                });
                resolve(true);
            } catch (error) {
                console.error("Failed to initialize GAPI client:", error);
                resolve(false);
            }
        });
    });
};


export const signIn = () => {
    if (!tokenClient) {
        console.error("GSI client not initialized.");
        return;
    }
    // Using prompt: '' will not force consent every time, improving UX.
    tokenClient.requestAccessToken({ prompt: '' });
};

export const signOut = (callback: () => void) => {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken(null);
            callback();
        });
    } else {
        callback();
    }
};

async function findOrCreateFolder(): Promise<string> {
    // 1. Search for the folder.
    let response = await gapi.client.drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
        fields: 'files(id, name)',
    });

    if (response.result.files && response.result.files.length > 0) {
        // Folder found, return its ID.
        return response.result.files[0].id!;
    } else {
        // 2. Folder not found, create it.
        const fileMetadata = {
            'name': FOLDER_NAME,
            'mimeType': 'application/vnd.google-apps.folder'
        };
        response = await gapi.client.drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        });
        return response.result.id!;
    }
}

async function findFileInFolder(folderId: string): Promise<string | null> {
    const response = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents and name='${FILE_NAME}' and trashed=false`,
        fields: 'files(id)',
    });

    if (response.result.files && response.result.files.length > 0) {
        return response.result.files[0].id!;
    }
    return null;
}

export const uploadToDrive = async (content: string): Promise<void> => {
    const folderId = await findOrCreateFolder();
    const fileId = await findFileInFolder(folderId);

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = 'application/json';

    const metadata = {
        name: FILE_NAME,
        mimeType: contentType,
        parents: [folderId]
    };
    
    let multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n\r\n' +
        content +
        close_delim;

    const path = '/upload/drive/v3/files' + (fileId ? `/${fileId}` : '');
    const method = fileId ? 'PATCH' : 'POST';

    const request = gapi.client.request({
        'path': path,
        'method': method,
        'params': {'uploadType': 'multipart'},
        'headers': { 'Content-Type': 'multipart/related; boundary="' + boundary + '"'},
        'body': multipartRequestBody
    });

    await request;
};

export const importFromDrive = async (): Promise<string> => {
    const folderId = await findOrCreateFolder();
    const fileId = await findFileInFolder(folderId);
    if (!fileId) {
        throw new Error(`Файл резервной копии '${FILE_NAME}' не найден в папке '${FOLDER_NAME}'. Пожалуйста, сначала экспортируйте данные.`);
    }

    const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
    });
    
    return response.body;
};