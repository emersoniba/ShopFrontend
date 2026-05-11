import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class EncryptionService {
    // Clave secreta - En producción, debería venir del backend o variables de entorno
    // Esta clave debe ser única y guardada en environment.ts
    private secretKey: string;

    constructor() {
        // Usar una clave combinada con información del navegador para mayor seguridad
        // Esta clave debe ser la misma en environment.ts
        this.secretKey = 'TuClaveSecretaMuySegura2024!@#$%';
    }

    /**
     * Encriptar datos antes de guardar en localStorage
     */
    encrypt(data: any): string {
        try {
            const jsonString = JSON.stringify(data);
            const encrypted = CryptoJS.AES.encrypt(jsonString, this.secretKey).toString();
            return encrypted;
        } catch (error) {
            console.error('Error al encriptar:', error);
            return '';
        }
    }

    /**
     * Desencriptar datos obtenidos de localStorage
     */
    decrypt(encryptedData: string): any {
        try {
            if (!encryptedData) return null;
            const decrypted = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
            const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
            if (!jsonString) return null;
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Error al desencriptar:', error);
            return null;
        }
    }

    /**
     * Encriptar solo campos sensibles (alternativa más ligera)
     */
    encryptSensitive(data: any, fieldsToEncrypt: string[]): any {
        const encryptedData = { ...data };
        fieldsToEncrypt.forEach(field => {
            if (encryptedData[field]) {
                encryptedData[field] = this.encrypt(encryptedData[field]);
            }
        });
        return encryptedData;
    }
}