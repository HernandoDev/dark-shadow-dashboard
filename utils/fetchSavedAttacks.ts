import { APIClashService } from '../services/apiClashService';

export const fetchSavedAttacks = async () => {
    try {
        const clanTag= '%232QL0GCQGQ' // Clan Principal

        let attacks = await APIClashService.getAttackLogs(clanTag);
        attacks = attacks[0].content;
        debugger
        return attacks
    } catch (error) {
        console.error('Error al obtener los ataques guardados:', error);
        throw error;
    }
};
