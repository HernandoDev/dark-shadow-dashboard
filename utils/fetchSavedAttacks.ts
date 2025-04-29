import { APIClashService } from '../services/apiClashService';

export const fetchSavedAttacks = async () => {
    try {
        debugger

        let attacks = await APIClashService.getAttackLogs();
        attacks = attacks[0].content;
        return attacks
    } catch (error) {
        console.error('Error al obtener los ataques guardados:', error);
        throw error;
    }
};
