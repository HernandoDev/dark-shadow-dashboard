import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';
import { Button } from '@nextui-org/react';

const ProgressInfo: React.FC = () => {
    const [saves, setSaves] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]); // New state for current members
    const [timeline, setTimeline] = useState<any[]>([]);
    const [comparisonDates, setComparisonDates] = useState<{ oldDate: string; newDate: string } | null>(null);
    const [clanTag, setClanTag] = useState('%232QL0GCQGQ'); // Clan Principal
    const [selectedOldDate, setSelectedOldDate] = useState<string | null>(null);
    const [selectedNewDate, setSelectedNewDate] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Loading state for fetching members

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const data = await APIClashService.getClanMembersWithDetails(clanTag);
                setMembers(data.detailedMembers || []); // Store current members
            } catch (error) {
                console.error('Error fetching members:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
        getSaves();
    }, [clanTag]);

    const switchToMainClan = () => setClanTag('%232QL0GCQGQ'); // Clan Principal
    const switchToSecondaryClan = () => setClanTag('%232RG9R9JVP'); // Clan Cantera

    const getSaves = async () => {
        const data = await APIClashService.getSaves(clanTag);
        const currentSave = {
            fileName: 'current_state',
            content: { detailedMembers: members }, // Add current members as the latest save
        };
        setSaves([...data, currentSave]); // Append current state to saves
        setComparisonDates(calculateComparisonDates([...data, currentSave]));
        setTimeline(generateTimeline([...data, currentSave]));
    };

    const saveProgress = async () => {
        await APIClashService.saveClanMembersWithDetails(clanTag);
        getSaves();
    };

    const calculateComparisonDates = (saves: any[]) => {
        if (saves.length < 2) return null;
        return {
            oldDate: extractDateFromFileName(saves[saves.length - 2].fileName),
            newDate: extractDateFromFileName(saves[saves.length - 1].fileName),
        };
    };

    const generateTimeline = (saves: any[]) => {
        if (saves.length < 2) return [];
        const [oldSave, newSave] = saves.slice(-2).map(save => save.content.detailedMembers);
        return newSave
            .map((newMember: any) => compareMemberProgress(newMember, oldSave))
            .filter((entry: null) => entry !== null);
    };

    const compareMemberProgress = (newMember: any, oldSave: any[]) => {
        const oldMember = oldSave.find(m => m.tag === newMember.tag);
        if (!oldMember) return null;

        const changes = [
            ...compareTroops(newMember, oldMember),
            ...compareHeroes(newMember, oldMember),
            ...compareHeroEquipment(newMember, oldMember),
        ];

        return changes.length > 0 ? { name: newMember.name, changes } : null;
    };

    const compareTroops = (newMember: any, oldMember: any) => {
        return newMember.troops
            .filter((troop: { village: string }) => troop.village === 'home')
            .map((newTroop: { name: any; level: number }) => {
                const oldTroop = oldMember.troops.find((t: { name: any; village: string }) => t.name === newTroop.name && t.village === 'home');
                return oldTroop && newTroop.level > oldTroop.level
                    ? { type: 'Tropa', name: newTroop.name, oldLevel: oldTroop.level, newLevel: newTroop.level }
                    : null;
            })
            .filter((change: null) => change !== null);
    };

    const compareHeroes = (newMember: any, oldMember: any) => {
        return newMember.heroes
            .map((newHero: { name: any; level: number }) => {
                const oldHero = oldMember.heroes.find((h: { name: any }) => h.name === newHero.name);
                return oldHero && newHero.level > oldHero.level
                    ? { type: 'Héroe', name: newHero.name, oldLevel: oldHero.level, newLevel: newHero.level }
                    : null;
            })
            .filter((change: null) => change !== null);
    };

    const compareHeroEquipment = (newMember: any, oldMember: any) => {
        return newMember.heroEquipment
            .map((newEquipment: { name: any; level: number }) => {
                const oldEquipment = oldMember.heroEquipment.find((e: { name: any }) => e.name === newEquipment.name);
                return oldEquipment && newEquipment.level > oldEquipment.level
                    ? { type: 'Equipamiento', name: newEquipment.name, oldLevel: oldEquipment.level, newLevel: newEquipment.level }
                    : null;
            })
            .filter((change: null) => change !== null);
    };

    const extractDateFromFileName = (fileName: string) => {
        const match = fileName.match(/_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
        return match ? match[1].replace(/-/g, ':').replace('T', ' ') : 'Fecha desconocida';
    };

    const translateChanges = (timeline: any[]) => {
        const translations: { [key: string]: string } = {
            Tropa: 'Tropa',
            Héroe: 'Héroe',
            Equipamiento: 'Equipamiento',
            // Traducciones de nombres de tropas
            'Barbarian': 'Bárbaro',
            'Wall Breaker': 'Rompe Muros',
            'Minion': 'Esbirro',
            'Electro Owl': 'Búho Eléctrico',
            'Wizard': 'Mago',
            'Phoenix': 'Fénix',
            'Poison Lizard': 'Lagarto Venenoso',
            'Electro Dragon': 'Dragón Eléctrico',
            'Furnace': 'Horno',
            'Spirit Fox': 'Zorro Espiritual',
            'Dragon': 'Dragón',
            'Baby Dragon': 'Dragón Bebé',
            'Mighty Yak': 'Yak Poderoso',
            'Archer': 'Arquera',
            'Healer': 'Sanadora',
            'P.E.K.K.A': 'P.E.K.K.A',
            'Hog Rider': 'Montapuercos',
            'Unicorn': 'Unicornio',
            'Ice Golem': 'Gólem de Hielo',
            'Dragon Rider': 'Jinete de Dragón',
            'Bowler': 'Lanzarrocas',
            'Root Rider': 'Jinete de Raíces',
            'Diggy': 'Excavador',
            'Thrower': 'Lanzador',
            'Angry Jelly': 'Gelatina Furiosa',
            'Apprentice Warden': 'Aprendiz de Centinela',
            'Frosty': 'Escarchado',
            'Yeti': 'Yeti',
            'Flame Flinger': 'Lanzallamas',
            'Druid': 'Druida',
            // Traducciones de nombres de equipamientos
            'Rocket Spear': 'Lanza Cohete',
            'Spiky Ball': 'Bola Espinosa',
            'Fireball': 'Bola de Fuego',
            'Magic Mirror': 'Espejo Mágico',
            'Electro Boots': 'Botas Eléctricas',
            'Metal Pants': 'Pantalones Metálicos',
            'Healing Tome': 'Tomo de Curación',
            'Giant Arrow': 'Flecha Gigante',
            'Eternal Tome': 'Tomo Eterno',
            'Earthquake Boots': 'Botas de Terremoto',
            'Haste Vial': 'Frasco de Prisa',
            'Healer Puppet': 'Marioneta Sanadora',
            'Hog Rider Puppet': 'Marioneta Montapuercos',
            'Noble Iron': 'Hierro Noble',
            'Dark Orb': 'Orbe Oscuro',
            'Rage Gem': 'Gema de Furia',
            'Giant Gauntlet': 'Guantelete Gigante',
            'Henchmen Puppet': 'Marioneta de Secuaces',
            'Seeking Shield': 'Escudo Buscador',
            'Royal Gem': 'Gema Real',
        };

        return timeline.map(entry => ({
            ...entry,
            name: entry.name, // Si los nombres de los jugadores necesitan traducción, agregar lógica aquí
            changes: entry.changes.map((change: any) => ({
                ...change,
                type: translations[change.type] || change.type,
                name: translations[change.name] || change.name,
            })),
        }));
    };

    const handleDateChange = (oldDate: string | null, newDate: string | null) => {
        if (oldDate && newDate) {
            const filteredSaves = saves.filter(save =>
                [oldDate, newDate].includes(save.fileName === 'current_state' ? 'current_state' : extractDateFromFileName(save.fileName))
            );
            setComparisonDates(calculateComparisonDates(filteredSaves));
            setTimeline(generateTimeline(filteredSaves));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Informacion de progreso de los jugadores</h1>
            <p>En esta ventana verás las mejoras de héroes y tropas entre dos periodos de tiempo. Si deseas iniciar un nuevo punto de guardado, pulsa el botón "Crear guardado".</p>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Button bordered color="success" onClick={saveProgress}>
                    Guardar Progreso
                </Button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <Button
                    bordered
                    css={{
                        backgroundColor: clanTag === '%232QL0GCQGQ' ? 'violet' : 'inherit',
                        color: clanTag === '%232QL0GCQGQ' ? 'black' : 'inherit',
                    }}
                    onClick={() => switchToMainClan()}
                >
                    Clan Principal
                </Button>
                <Button
                    bordered
                    css={{
                        backgroundColor: clanTag === '%232RG9R9JVP' ? 'violet' : 'inherit',
                        color: clanTag === '%232RG9R9JVP' ? 'black' : 'inherit',
                    }}
                    onClick={() => switchToSecondaryClan()}
                >
                    Clan Cantera
                </Button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <select
                    value={selectedOldDate || ''}
                    onChange={(e) => {
                        const newOldDate = e.target.value;
                        setSelectedOldDate(newOldDate);
                        handleDateChange(newOldDate, selectedNewDate);
                    }}
                    style={{ padding: '5px', borderRadius: '5px' }}
                >
                    <option value="" disabled>Selecciona la fecha antigua</option>
                    {saves.map((save, index) => (
                        <option key={index} value={save.fileName === 'current_state' ? 'current_state' : extractDateFromFileName(save.fileName)}>
                            {save.fileName === 'current_state' ? 'Estado Actual' : extractDateFromFileName(save.fileName)}
                        </option>
                    ))}
                </select>
                <select
                    value={selectedNewDate || ''}
                    onChange={(e) => {
                        const newNewDate = e.target.value;
                        setSelectedNewDate(newNewDate);
                        handleDateChange(selectedOldDate, newNewDate);
                    }}
                    style={{ padding: '5px', borderRadius: '5px' }}
                >
                    <option value="" disabled>Selecciona la fecha nueva</option>
                    {saves.map((save, index) => {
                        const saveDate = save.fileName === 'current_state' ? 'Estado Actual' : extractDateFromFileName(save.fileName);
                        const isDisabled = selectedOldDate && saveDate <= selectedOldDate;
                        return (
                            <option key={index} value={save.fileName === 'current_state' ? 'current_state' : extractDateFromFileName(save.fileName)} disabled={!!isDisabled}>
                                {saveDate}
                            </option>
                        );
                    })}
                </select>
            </div>
            <div>
                {comparisonDates && (
                    <p>
                        Comparación entre: {comparisonDates.oldDate} y {comparisonDates.newDate}
                    </p>
                )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {translateChanges(timeline).map((entry, index) => (
                    <div
                        key={index}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '10px',
                            padding: '15px',
                            backgroundColor: '#333',
                            color: '#fff',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            width: '300px',
                        }}
                    >
                        <h2 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>{entry.name}</h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {entry.changes.map((change: any, idx: number) => (
                                <li key={idx} style={{ marginBottom: '5px' }}>
                                    {change.type}: {change.name} (De nivel {change.oldLevel} a nivel {change.newLevel})
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressInfo;
