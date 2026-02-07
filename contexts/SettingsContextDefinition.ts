import { createContext } from 'react';
import { AppSettings, NamingSchema } from '../types';

export interface SettingsContextType {
    settings: AppSettings;
    updateNamingSchema: (schema: NamingSchema) => void;
    updateUserName: (name: string) => void;
    updateManualCategories: (categories: string[]) => void;
    resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
