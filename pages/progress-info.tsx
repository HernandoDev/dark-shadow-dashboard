import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';
import { Button } from '@nextui-org/react';

const ProgressInfo: React.FC = () => {
    const [saves, setSaves] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [comparisonDates, setComparisonDates] = useState<{ oldDate: string; newDate: string } | null>(null);
    const [clanTag, setClanTag] = useState('%232QL0GCQGQ'); // Clan Principal

    useEffect(() => {
        getSaves();
    }, [clanTag]);

    const switchToMainClan = () => setClanTag('%232QL0GCQGQ'); // Clan Principal
    const switchToSecondaryClan = () => setClanTag('%232RG9R9JVP'); // Clan Cantera

    const getSaves = async () => {
        const data = await APIClashService.getSaves(clanTag);
        setSaves(data);
        setComparisonDates(calculateComparisonDates(data));
        setTimeline(generateTimeline(data));
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

    return (
        <div style={{padding:'20px'}}>
                
            <h1>Progress Info</h1>
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
       
            <div>
                {comparisonDates && (
                    <p>
                        Comparación entre: {comparisonDates.oldDate} y {comparisonDates.newDate}
                    </p>
                )}
            </div>
            <ul>
                {translateChanges(timeline).map((entry, index) => (
                    <li key={index}>
                        <strong>{entry.name}</strong>
                        <ul>
                            {entry.changes.map((change: any, idx: number) => (
                                <li key={idx}>
                                    {change.type}: {change.name} (De nivel {change.oldLevel} a nivel {change.newLevel})
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProgressInfo;
