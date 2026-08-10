import { Injectable } from '@angular/core';
// @ts-ignore
import SecureStorage from "secure-web-storage";
import * as CryptoJS from 'crypto-js';
const SECRET_KEY: any = "MS&lS%22";

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    constructor() { }
    public secureStorage = new SecureStorage(localStorage, {
        hash: function hash(key: any): any {
            key = CryptoJS.SHA256(key, SECRET_KEY);
            return key.toString();
        },
        // Encrypt the localstorage data
        encrypt: function encrypt(data: any) {
            data = CryptoJS.AES.encrypt(data, SECRET_KEY);
            data = data.toString();
            return data;
        },
        // Decrypt the encrypted data
        decrypt: function decrypt(data: any) {
            data = CryptoJS.AES.decrypt(data, SECRET_KEY);
            data = data.toString(CryptoJS.enc.Utf8);
            return data;
        }
    });
}