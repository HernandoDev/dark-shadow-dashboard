import { APIClashService } from '../services/apiClashService';

export const fetchSavedAttacks = async () => {
    try {
        let attacks = await APIClashService.getAttackLogs();
        attacks = attacks;
        return attacks
    } catch (error) {
        console.error('Error al obtener los ataques guardados:', error);
        throw error;
    }
};
