export const environment = {
    production: true,
    apiUrl: 'https://almacenback-0hrh.onrender.com/api',  // Tu backend en Render
    
    encryptionKey: 'ProdSecretKey2024!@#$%^&*()_+',
    security: {
        encryptUserData: true,
        encryptTokens: true,
        logLevel: 'error'
    }
};
