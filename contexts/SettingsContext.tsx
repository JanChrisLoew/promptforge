import React, { useState, ReactNode } from 'react';
import { AppSettings, NamingSchema } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEY } from '../constants/settings.constants';
import { SettingsContext } from './SettingsContextDefinition';

export { SettingsContext };

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Lazy initialization to avoid useEffect and double render
    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.warn('Failed to load settings', e);
        }
        return DEFAULT_SETTINGS;
    });

    // Save to storage
    const save = (newSettings: AppSettings) => {
        setSettings(newSettings);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch (e) {
            console.warn('Failed to save settings', e);
        }
    };

    const updateNamingSchema = (schema: NamingSchema) => {
        save({ ...settings, namingSchema: schema });
    };

    const updateUserName = (name: string) => {
        save({ ...settings, userName: name });
    };

    const updateManualCategories = (categories: string[]) => {
        save({ ...settings, manualCategories: categories });
    };

    const resetSettings = () => {
        save(DEFAULT_SETTINGS);
    };

    return (
        <SettingsContext.Provider value={{ settings, updateNamingSchema, updateUserName, updateManualCategories, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
