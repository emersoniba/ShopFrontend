export const environment = {
  production: false,

  apiUrl: 'http://localhost:8000/api',

  mediaUrl: 'http://localhost:8000/media',

  encryptionKey: 'DevSecretKey2024!@#$%',

  security: {
    encryptUserData: true,
    encryptTokens: true,
    logLevel: 'debug'
  }
};