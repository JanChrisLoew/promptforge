import { AppSettings } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
    namingSchema: {
        enabled: true,
        fields: [
            { id: 'project', label: 'Project', type: 'text', maxLength: 3 },
            { id: 'zone', label: 'Zone', type: 'select', options: ['Z01', 'Z02', 'ALL'] },
            { id: 'role', label: 'Role', type: 'select', options: ['ARC', 'STR', 'MEP'] }
        ],
        separator: '_',
        hasFreeTextSuffix: true,
        folderNamingType: 'labelAndValue'
    },
    userName: 'User',
    manualCategories: ['General', 'Drafts', 'Archive']
};

export const STORAGE_KEY = 'promptforge_settings';
