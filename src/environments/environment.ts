export const environment = {
    production: false,
    apiUrl: 'http://127.0.0.1:8000/api',
 
    // Clave de encriptación - Diferente para cada entorno
    encryptionKey: 'DevSecretKey2024!@#$%',
    // Configuración de seguridad
    security: {
        encryptUserData: true,  // Encriptar datos del usuario
        encryptTokens: true,    // Encriptar tokens
        logLevel: 'debug'
    }

};
