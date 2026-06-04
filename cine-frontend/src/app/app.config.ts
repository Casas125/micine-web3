import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Importaciones de Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // 1. Inicializamos tu proyecto con las llaves que me pasaste
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyDysbW2ZLlB2103K-LDosx9RA0OirQFn2U",
      authDomain: "cineweb3.firebaseapp.com",
      projectId: "cineweb3",
      storageBucket: "cineweb3.firebasestorage.app",
      messagingSenderId: "1075728350652",
      appId: "1:1075728350652:web:127dbdfb834cba3db0bfb9"
    })),
    // 2. Encendemos el servicio de base de datos
    provideFirestore(() => getFirestore())
  ]
};