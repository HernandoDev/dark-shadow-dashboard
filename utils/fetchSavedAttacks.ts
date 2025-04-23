import { APIClashService } from '../services/apiClashService';

export const fetchSavedAttacks = async () => {
    try {
        const attacks = await APIClashService.getAttackLogs();
        return attacks;
    } catch (error) {
        console.error('Error al obtener los ataques guardados:', error);
        throw error;
    }
};
