import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';
import { Button } from '@nextui-org/react';

const ProgressInfo: React.FC = () => {
    const [saves, setSaves] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]); // State for current members
    const [timeline, setTimeline] = useState<any[]>([]);
    const [comparisonDates, setComparisonDates] = useState<{ oldDate: string; newDate: string } | null>(null);
    const [clanTag, setClanTag] = useState('%232QL0GCQGQ'); // Clan Principal
    const [selectedOldDate, setSelectedOldDate] = useState<string | null>(null);
    const [selectedNewDate, setSelectedNewDate] = useState<string | null>('current_state'); // Default to current state
    const [loading, setLoading] = useState<boolean>(true); // Loading state
    const [playerFilter, setPlayerFilter] = useState<string>('');
    const [sortLabel, setSortLabel] = useState<string>(''); // State for sorting label

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                getSaves();
            } catch (error) {
                console.error('Error fetching members:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [clanTag]);

    useEffect(() => {
        // Execute sorting logic on initial load
        setTimeline((prevTimeline) => [...prevTimeline].sort((a, b) => b.changes.length - a.changes.length));
        setSortLabel('Ordenado por mayor progreso');
    }, []);

    const getSaves = async () => {
        const dataMembers = await APIClashService.getClanMembersWithDetails();
        setMembers(dataMembers.detailedMembers || []);
        const data = await APIClashService.getSaves();
        const currentSave = {
            fileName: 'current_state',
            content: { detailedMembers: dataMembers.detailedMembers || [] }, // Add current members as the latest save
        };
        const allSaves = [...data, currentSave];
        setSaves(allSaves); // Append current state to saves

        // Set the default value for selectedOldDate to the last saved date (excluding "Estado Actual")
        const lastSavedDate = data.length > 0 ? extractDateFromFileName(data[data.length - 1].fileName) : null;
        setSelectedOldDate(lastSavedDate);

        setComparisonDates(calculateComparisonDates(allSaves));
        setTimeline(generateTimeline(allSaves));
    };

    const saveProgress = async () => {
        await APIClashService.saveClanMembersWithDetails();
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
            ...compareSpells(newMember, oldMember), // Add comparison for spells
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

    const compareSpells = (newMember: any, oldMember: any) => {
        return newMember.spells
            .map((newSpell: { name: any; level: number }) => {
                const oldSpell = oldMember.spells.find((s: { name: any }) => s.name === newSpell.name);
                return oldSpell && newSpell.level > oldSpell.level
                    ? { type: 'Hechizo', name: newSpell.name, oldLevel: oldSpell.level, newLevel: newSpell.level }
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

    const formatDateToHumanReadable = (dateString: string) => {
        if (!dateString || dateString === 'Fecha desconocida') {
            return 'Fecha actual';
        }
        try {
            const [datePart] = dateString.split(' ');
            const [year, month, day] = datePart.split(':').map(Number);
            if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
                return 'Fecha desconocida';
            }
            const months = [
                'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
            ];
            return `${day} de ${months[month - 1]} de ${year}`;
        } catch {
            return 'Fecha desconocida';
        }
    };

    const translateChanges = (timeline: any[]) => {
        const translations: { [key: string]: string } = {
            Tropa: 'Tropa',
            Héroe: 'Héroe',
            Equipamiento: 'Equipamiento',
            Hechizo: 'Hechizo',
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
            'Baby Dragon': 'Baby Dragon',
            'Mighty Yak': 'Yak Poderoso Mamut',
            'Archer': 'Arquera',
            'Healer': 'Sanadora',
            'P.E.K.K.A': 'P.E.K.K.A',
            'Hog Rider': 'Montapuercos',
            'Unicorn': 'Unicornio',
            'Ice Golem': 'Gólem de Hielo',
            'Dragon Rider': 'Jinete de Dragón',
            'Bowler': 'Lanzarrocas',
            'Root Rider': 'Monta de Raíces',
            'Diggy': 'Pangolin',
            'Thrower': 'Lancero',
            'Angry Jelly': 'Medusa Furiosa',
            'Apprentice Warden': 'Aprendiz de Centinela',
            'Frosty': 'Morsa Hielo',
            'Yeti': 'Yeti',
            'Flame Flinger': 'Lanzallamas',
            'Druid': 'Druida',
            // Traducciones de nombres de equipamientos
            'Rocket Spear': 'Lanza Cohete',
            'Spiky Ball': 'Balon punzante',
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
            'Henchmen Puppet': 'Marioneta de esbirros',
            'Seeking Shield': 'Escudo luchadora',
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

    const getTopAndBottomPlayers = (timeline: any[]) => {
        const sortedTimeline = [...timeline].sort((a, b) => b.changes.length - a.changes.length);
        const topPlayers = sortedTimeline.slice(0, 3).map(player => player.name);
        const bottomPlayers = sortedTimeline.slice(-3).map(player => player.name);
        return { topPlayers, bottomPlayers };
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
            <h1 style={{ textAlign: 'center' }} className='neonText'
            >Progreso de los jugadores</h1>
            <p>En esta ventana verás las mejoras de héroes y tropas entre dos periodos de tiempo. </p>
            <br />
            <p>Si deseas iniciar un nuevo punto de guardado, pulsa el botón "Crear guardado".</p>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ padding: '20px' }} className='ButtonNeonAnimate'>
                    <div className="grid-bg">
                        <div className="grid-line"></div>
                        <div className="grid-line"></div>
                        <div className="grid-line"></div>
                        <div className="grid-line"></div>
                        <div className="grid-line"></div>
                    </div>
                    <div className="button-container">
                        <button onClick={saveProgress} className="green-hacker-button" data-text="Guardar Progreso">
                            Guardar Progreso
                            <div className="green-neon-frame"></div>
                            <div className="circuit-traces">
                                <div className="circuit-trace"></div>
                                <div className="circuit-trace"></div>
                                <div className="circuit-trace"></div>
                                <div className="circuit-trace"></div>
                                <div className="circuit-trace"></div>
                            </div>
                            <div className="code-fragments">
                                <span className="code-fragment">GUARDAR</span>
                                <span className="code-fragment">PROGRESO</span>
                                <span className="code-fragment">JUGADORES</span>
                                <span className="code-fragment">CONTROL</span>

                            </div>
                            <div className="interference"></div>
                            <div className="scan-bars">
                                <div className="scan-bar"></div>
                                <div className="scan-bar"></div>
                                <div className="scan-bar"></div>
                            </div>
                            <div className="text-glow"></div>
                        </button>
                    </div>
                </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '50%' }}>
                    <label htmlFor="oldDateSelect" style={{ display: 'block', marginBottom: '5px' }}>Fecha inicio</label>
                    <select
                        id="oldDateSelect"
                        className='input'
                        value={selectedOldDate || ''}
                        onChange={(e) => {
                            const newOldDate = e.target.value;
                            setSelectedOldDate(newOldDate);
                            handleDateChange(newOldDate, selectedNewDate);
                        }}
                        style={{ padding: '5px', borderRadius: '5px', width: '100%' }}
                    >
                        <option value="" disabled>Fecha inicio</option>
                        {saves.map((save, index) => (
                            <option key={index} value={save.fileName === 'current_state' ? 'current_state' : extractDateFromFileName(save.fileName)}>
                                {save.fileName === 'current_state' ? 'Estado Actual' : formatDateToHumanReadable(extractDateFromFileName(save.fileName))}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ width: '50%' }}>
                    <label htmlFor="newDateSelect" style={{ display: 'block', marginBottom: '5px' }}>Fecha fin</label>
                    <select
                        id="newDateSelect"
                        className='input'
                        value={selectedNewDate || ''}
                        onChange={(e) => {
                            const newNewDate = e.target.value;
                            setSelectedNewDate(newNewDate);
                            handleDateChange(selectedOldDate, newNewDate);
                        }}
                        style={{ padding: '5px', borderRadius: '5px', width: '100%' }}
                    >
                        <option value="" disabled>Fecha fin</option>
                        {saves.map((save, index) => {
                            const saveDate = save.fileName === 'current_state' ? 'Estado Actual' : formatDateToHumanReadable(extractDateFromFileName(save.fileName));
                            const isDisabled = selectedOldDate && saveDate <= formatDateToHumanReadable(selectedOldDate);
                            return (
                                <option key={index} value={save.fileName === 'current_state' ? 'current_state' : extractDateFromFileName(save.fileName)} disabled={!!isDisabled}>
                                    {saveDate}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <input
                    className="input"
                    type="text"
                    placeholder="Filtrar por nombre de jugador"
                    value={playerFilter}
                    onChange={(e) => setPlayerFilter(e.target.value)}
                    style={{
                        padding: '5px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        width: '300px',
                    }}
                />
            </div>
          
            <div>
                {comparisonDates && (
                    <>
                        <p style={{ textAlign: 'center', fontSize: '18px', color: 'violet' }}>
                            Comparación entre: {formatDateToHumanReadable(comparisonDates.oldDate)} y {formatDateToHumanReadable(comparisonDates.newDate)}
                        </p>
                        {timeline.length > 0 && (() => {
                            const { topPlayers, bottomPlayers } = getTopAndBottomPlayers(timeline);
                            return (
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <p style={{ color: 'green', fontWeight: 'bold' }}>
                                        Jugadores con más progreso: {topPlayers.length > 0 ? topPlayers.join(', ') : 'Ninguno'}
                                    </p>
                                    <p style={{ color: 'red', fontWeight: 'bold' }}>
                                        Jugadores con menos progreso: {bottomPlayers.length > 0 ? bottomPlayers.join(', ') : 'Ninguno'}
                                    </p>
                                </div>
                            );
                        })()}
                    </>
                )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <label className="switch">
                    <input
                        type="checkbox"
                        defaultChecked={true} // Set default to checked
                        onChange={(e) => {
                            if (e.target.checked) {
                                setTimeline([...timeline].sort((a, b) => b.changes.length - a.changes.length));
                                setSortLabel('Ordenado por mayor progreso');
                            } else {
                                setTimeline([...timeline].sort((a, b) => a.changes.length - b.changes.length));
                                setSortLabel('Ordenado por menor progreso');
                            }
                        }}
                    />
                    <div className="slider">
                        <div className="slider-btn">
                            <div className="light"></div>
                            <div className="texture"></div>
                            <div className="texture"></div>
                            <div className="texture"></div>
                            <div className="light"></div>
                        </div>
                    </div>
                </label>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'violet' }}>
                    {sortLabel}
                </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {translateChanges(timeline)
                    .filter((entry) => entry.name.toLowerCase().includes(playerFilter.toLowerCase()))
                    .map((entry, index) => (
                        <div
                            className="animate__animated animate__backInLeft card"
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
