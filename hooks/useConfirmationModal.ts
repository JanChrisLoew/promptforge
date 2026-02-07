import { useState, useCallback } from 'react';
import { ConfirmationType } from '../components/ConfirmationModal';

interface ConfirmConfig {
    isOpen: boolean;
    type: ConfirmationType;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
}

const DEFAULT_CONFIG: ConfirmConfig = {
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => { },
};

export const useConfirmationModal = () => {
    const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>(DEFAULT_CONFIG);

    const showConfirm = useCallback((config: Omit<ConfirmConfig, 'isOpen'>) => {
        setConfirmConfig({ ...config, isOpen: true });
    }, []);

    const closeConfirm = useCallback(() => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    }, []);

    return {
        confirmConfig,
        showConfirm,
        closeConfirm
    };
};
