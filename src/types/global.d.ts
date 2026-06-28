declare module 'lucide-react';

declare module 'firebase/app' {
  export function initializeApp(config: any): any;
  export function getApps(): any[];
  export function getApp(): any;
}

declare module 'firebase/firestore' {
  export function getFirestore(app?: any): any;
  export function collection(firestore: any, ...paths: string[]): any;
  export function doc(firestore: any, ...paths: string[]): any;
  export function getDoc(ref: any): Promise<any>;
  export function getDocs(query: any): Promise<any>;
  export function setDoc(ref: any, data: any, options?: any): Promise<any>;
  export function updateDoc(ref: any, data: any): Promise<any>;
  export function query(collection: any, ...constraints: any[]): any;
  export function where(field: string, op: string, value: any): any;
  export function orderBy(field: string, direction?: string): any;
  export interface DocumentData {
    [key: string]: any;
  }
}

declare module 'firebase/auth' {
  export function onAuthStateChanged(auth: any, next: (user: any) => void, ...args: any[]): any;
  export function getAuth(app?: any): any;
  export function signInWithEmailAndPassword(auth: any, email: any, password: any): Promise<any>;
  export function createUserWithEmailAndPassword(auth: any, email: any, password: any): Promise<any>;
  export function signInWithPopup(auth: any, provider: any): Promise<any>;
  export class GoogleAuthProvider {
    constructor();
  }
  export function signOut(auth: any): Promise<any>;
  export interface User {
    getIdToken(forceRefresh?: boolean): Promise<string>;
    email: string | null;
    displayName: string | null;
    uid: string;
  }
}
