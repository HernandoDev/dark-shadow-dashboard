import React, { useEffect, useState } from 'react';
import { APIClashService } from '../../services/apiClashService';

// Define the PlayerInfo interface
interface PlayerInfo {
    tag: string;
    name: string;
    townHallLevel: number;
    donations: number;
    donationsReceived: number;
    clanCapitalContributions: number;
    troops: {
        name: string;
        level: number;
        maxLevel: number;
        village: string;
        superTroopIsActive?: boolean;
    }[];
    heroes: {
        name: string;
        level: number;
        maxLevel: number;
        village: string;
        equipment?: {
            name: string;
            level: number;
            maxLevel: number;
            village: string;
        }[];
    }[];
    heroEquipment: {
        name: string;
        level: number;
        maxLevel: number;
        village: string;
    }[];
    spells: {
        name: string;
        level: number;
        maxLevel: number;
        village: string;
    }[];
}

const DonationsTab = ({ selectedPlayer, selectedPlayerTag }: { selectedPlayer: string; selectedPlayerTag: string }) => {
    const [playerDonations, setPlayerDonations] = useState<any>(null);
    const [playerReports, setPlayerReports] = useState<any[]>([]);
    const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null); // Use PlayerInfo interface

    // States for collapsible sections
    const [showTroops, setShowTroops] = useState(false);
    const [showHeroes, setShowHeroes] = useState(false);
    const [showHeroEquipment, setShowHeroEquipment] = useState(false);
    const [showSpells, setShowSpells] = useState(false);
    const [showPets, setShowPets] = useState(false); // New state for pets section

    const getColorByLevelDifference = (currentLevel: number, maxLevel: number): string => {
        const difference = maxLevel - currentLevel;
        if (difference === 0) return 'green'; // Max level
        if (difference <= 2) return 'green'; // Close to max level
        if (difference <= 3) return 'yellow'; // Moderate difference
        return 'red'; // Significant difference
    };

    const petNames = [
        'L.A.S.S.I', 'Mighty Yak', 'Electro Owl', 'Unicorn', 'Phoenix',
        'Poison Lizard', 'Diggy', 'Frosty', 'Spirit Fox', 'Angry Jelly', 'Sneezy'
    ];

    const translationMap: Record<string, string> = {
        // Troops
        'Barbarian': 'Bárbaro',
        'Archer': 'Arquera',
        'Goblin': 'Duende',
        'Giant': 'Gigante',
        'Wall Breaker': 'Rompemuros',
        'Balloon': 'Globo',
        'Wizard': 'Mago',
        'Healer': 'Sanadora',
        'Dragon': 'Dragón',
        'P.E.K.K.A': 'P.E.K.K.A',
        'Minion': 'Esbirro',
        'Hog Rider': 'Montapuercos',
        'Valkyrie': 'Valquiria',
        'Golem': 'Gólem',
        'Witch': 'Bruja',
        'Lava Hound': 'Sabueso de Lava',
        'Bowler': 'Lanzarrocas',
        'Baby Dragon': 'Dragón Bebé',
        'Miner': 'Minero',
        'Super Barbarian': 'Súper Bárbaro',
        'Super Archer': 'Súper Arquera',
        'Super Wall Breaker': 'Súper Rompemuros',
        'Super Giant': 'Súper Gigante',
        'Wall Wrecker': 'Demoledor de Muros',
        'Battle Blimp': 'Dirigible de Batalla',
        'Yeti': 'Yeti',
        'Sneaky Goblin': 'SuperDuende Furtivo',
        'Super Miner': 'Súper Minero',
        'Rocket Balloon': 'Globo Cohete',
        'Ice Golem': 'Gólem de Hielo',
        'Electro Dragon': 'Dragón Eléctrico',
        'Stone Slammer': 'Aplastamuros',
        'Inferno Dragon': 'Dragón Infernal',
        'Super Valkyrie': 'Súper Valquiria',
        'Dragon Rider': 'Jinete de Dragón',
        'Super Witch': 'Súper Bruja',
        'Siege Barracks': 'Cuartel de Asedio',
        'Ice Hound': 'Sabueso de Hielo',
        'Super Bowler': 'Súper Lanzarrocas',
        'Super Dragon': 'Súper Dragón',
        'Headhunter': 'Cazadora',
        'Super Wizard': 'Súper Mago',
        'Super Minion': 'Súper Esbirro',
        'Log Launcher': 'Lanzatrones',
        'Flame Flinger': 'Lanzallamas',
        'Battle Drill': 'Taladro de Batalla',
        'Electro Titan': 'Titán Eléctrico',
        'Apprentice Warden': 'Guardián Aprendiz',
        'Super Hog Rider': 'Súper Montapuercos',
        'Root Rider': 'Jinete de Raíz',
        'Druid': 'Druida',
        'Thrower': 'Lanzador',
        'Furnace': 'Horno',

        // Pets
        'L.A.S.S.I': 'L.A.S.S.I',
        'Mighty Yak': 'Yak Mamut',
        'Electro Owl': 'Búho Eléctrico',
        'Unicorn': 'Unicornio',
        'Phoenix': 'Fénix',
        'Poison Lizard': 'Lagarto Venenoso',
        'Diggy': 'Pangolin',
        'Frosty': 'Morsa de Hielo',
        'Spirit Fox': 'Zorro Espiritual',
        'Angry Jelly': 'Medusa Furiosa',
        'Sneezy': 'Achuss',

        // Spells
        'Lightning Spell': 'Hechizo de Rayo',
        'Healing Spell': 'Hechizo de Curación',
        'Rage Spell': 'Hechizo de Furia',
        'Jump Spell': 'Hechizo de Salto',
        'Freeze Spell': 'Hechizo de Hielo',
        'Poison Spell': 'Hechizo de Veneno',
        'Earthquake Spell': 'Hechizo de Terremoto',
        'Haste Spell': 'Hechizo de Aceleración',
        'Clone Spell': 'Hechizo de Clonación',
        'Skeleton Spell': 'Hechizo de Esqueletos',
        'Bat Spell': 'Hechizo de Murciélagos',
        'Invisibility Spell': 'Hechizo de Invisibilidad',
        'Recall Spell': 'Hechizo de Invocacion',
        'Overgrowth Spell': 'Hechizo de Crecimiento',
        'Revive Spell': 'Hechizo de Resurrección',

        // Heroes
        'Barbarian King': 'Rey Bárbaro',
        'Archer Queen': 'Reina Arquera',
        'Grand Warden': 'Gran Centinela',
        'Royal Champion': 'Campeona Real',
        'Minion Prince': 'Príncipe Esbirro',
    };

    const translate = (name: string): string => translationMap[name] || name;

    useEffect(() => {
        const fetchPlayerDonations = async () => {
            try {
                const dataMembers = await APIClashService.getClanMembersWithDetails();
                const player = dataMembers.detailedMembers.find((member: any) => member.name === selectedPlayer);
                if (player) {
                    setPlayerDonations({
                        name: player.name,
                        totalDonations: player.donations || 0,
                        totalDonationsReceived: player.donationsReceived || 0,
                    });
                } else {
                    setPlayerDonations(null);
                }
            } catch (error) {
                console.error('Error fetching player donations:', error);
            }
        };

        const fetchPlayerReports = async () => {
            try {
                const reports = await APIClashService.getReports();
                const filteredReports = reports.filter((report: any) => report.player === selectedPlayer);
                setPlayerReports(filteredReports);
            } catch (error) {
                console.error('Error fetching player reports:', error);
            }
        };

        const fetchPlayerInfo = async () => {
            try {
                const playerTag = selectedPlayerTag; // Assume the tag is already encoded
                const info: PlayerInfo = await APIClashService.getPlayerInfo(playerTag);
                setPlayerInfo(info);
            } catch (error) {
                console.error('Error fetching player info:', error);
            }
        };

        if (selectedPlayer) {
            fetchPlayerDonations();
            fetchPlayerReports();
            fetchPlayerInfo();
        }
    }, [selectedPlayer, selectedPlayerTag]);

    if (!selectedPlayer) {
        return (
            <div>
                <p>Por favor, selecciona un jugador para ver sus donaciones, reportes e información.</p>
            </div>
        );
    }
    let donationDifference;
    if (!playerDonations) {
        donationDifference = 0

    }else{
         donationDifference = playerDonations.totalDonations - playerDonations.totalDonationsReceived;
    }


    return (
        <div>
            <div className="bgblue">
                <div className="card">RESUMEN DE CAPITAL EN PROGRESO</div>
            </div>
            <div className="bgblue" style={{ width: '100%', margin: '0 auto', marginTop: '10px' }}>
                <div className="card animate__animated animate__backInLeft">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span>Donaciones Totales:</span>
                        <span style={{ color: '#4caf50' }}>{playerDonations?.totalDonations}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span>Donaciones Recibidas Totales:</span>
                        <span style={{ color: '#673ab7' }}>{playerDonations?.totalDonationsReceived}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                        <span>Diferencia:</span>
                        <span
                            style={{
                                color: donationDifference < 0 ? 'red' : 'green',
                            }}
                        >
                            {donationDifference}
                        </span>
                    </div>
                </div>
            </div>

          

            {/* Player Info Section */}
            {playerInfo && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Información de {playerInfo.name}</h2>
                    <div className="bgblue">
                        <div className="card">
                            <p><strong>Tag:</strong> {playerInfo.tag}</p>
                            <p><strong>Nivel del Ayuntamiento:</strong> {playerInfo.townHallLevel}</p>
                            <p><strong>Donaciones:</strong> {playerInfo.donations}</p>
                            <p><strong>Donaciones Recibidas:</strong> {playerInfo.donationsReceived}</p>
                            <p><strong>Contribuciones al Capital del Clan:</strong> {playerInfo.clanCapitalContributions}</p>
                        </div>
                    </div>

                    {/* Troops Section */}
                    <div style={{ marginTop: '20px' }}>
                        <h3 onClick={() => setShowTroops(!showTroops)} style={{ cursor: 'pointer' }}>
                            Tropas {showTroops ? '▲' : '▼'}
                        </h3>
                        {showTroops && (
                            <div className="bgblue">
                                <div className="card">
                                    {playerInfo.troops
                                        .filter((troop) => troop.village === "home" && !petNames.includes(troop.name))
                                        .map((troop, index) => (
                                            <p key={index} style={{ color: getColorByLevelDifference(troop.level, troop.maxLevel) }}>
                                                <strong>{translate(troop.name)}:</strong> Nivel {troop.level} / {troop.maxLevel}
                                                {troop.superTroopIsActive && <span style={{ color: 'gold' }}> (Super)</span>}
                                            </p>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pets Section */}
                    <div style={{ marginTop: '20px' }}>
                        <h3 onClick={() => setShowPets(!showPets)} style={{ cursor: 'pointer' }}>
                            Mascotas {showPets ? '▲' : '▼'}
                        </h3>
                        {showPets && (
                            <div className="bgblue">
                                <div className="card">
                                    {playerInfo.troops
                                        .filter((troop) => petNames.includes(troop.name))
                                        .map((pet, index) => (
                                            <p key={index} style={{ color: getColorByLevelDifference(pet.level, pet.maxLevel) }}>
                                                <strong>{translate(pet.name)}:</strong> Nivel {pet.level} / {pet.maxLevel}
                                            </p>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Heroes Section */}
                    <div style={{ marginTop: '20px' }}>
                        <h3 onClick={() => setShowHeroes(!showHeroes)} style={{ cursor: 'pointer' }}>
                            Héroes {showHeroes ? '▲' : '▼'}
                        </h3>
                        {showHeroes && (
                            <div className="bgblue">
                                <div className="card">
                                    {playerInfo.heroes
                                        .filter((hero) => hero.village === "home")
                                        .map((hero, index) => (
                                            <div key={index} style={{ marginBottom: '10px' }}>
                                                <p style={{ color: getColorByLevelDifference(hero.level, hero.maxLevel) }}>
                                                    <strong>{translate(hero.name)}:</strong> Nivel {hero.level} / {hero.maxLevel}
                                                </p>
                                                {hero.equipment && hero.equipment.length > 0 && (
                                                    <ul style={{ listStyle: 'none', paddingLeft: '10px' }}>
                                                        {hero.equipment.map((equip, equipIndex) => (
                                                            <li key={equipIndex} style={{ color: getColorByLevelDifference(equip.level, equip.maxLevel) }}>
                                                                <strong>{translate(equip.name)}:</strong> Nivel {equip.level} / {equip.maxLevel}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Hero Equipment Section */}
                    <div style={{ marginTop: '20px' }}>
                        <h3 onClick={() => setShowHeroEquipment(!showHeroEquipment)} style={{ cursor: 'pointer' }}>
                            Equipamientos de Héroes {showHeroEquipment ? '▲' : '▼'}
                        </h3>
                        {showHeroEquipment && (
                            <div className="bgblue">
                                <div className="card">
                                    {playerInfo.heroEquipment
                                        .filter((equipment) => equipment.village === "home")
                                        .map((equipment, index) => (
                                            <p key={index} style={{ color: getColorByLevelDifference(equipment.level, equipment.maxLevel) }}>
                                                <strong>{translate(equipment.name)}:</strong> Nivel {equipment.level} / {equipment.maxLevel}
                                            </p>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Spells Section */}
                    <div style={{ marginTop: '20px' }}>
                        <h3 onClick={() => setShowSpells(!showSpells)} style={{ cursor: 'pointer' }}>
                            Hechizos {showSpells ? '▲' : '▼'}
                        </h3>
                        {showSpells && (
                            <div className="bgblue">
                                <div className="card">
                                    {playerInfo.spells
                                        .filter((spell) => spell.village === "home")
                                        .map((spell, index) => (
                                            <p key={index} style={{ color: getColorByLevelDifference(spell.level, spell.maxLevel) }}>
                                                <strong>{translate(spell.name)}:</strong> Nivel {spell.level} / {spell.maxLevel}
                                            </p>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
              {/* Player Reports Section */}
              <div style={{ marginTop: '20px' }}>
                <h2>Reportes de {selectedPlayer}</h2>
                {playerReports.length === 0 ? (
                    <p>No se encontraron reportes para {selectedPlayer}.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {playerReports.map((report, index) => (
                            <div className="bgblue" key={index}>
                                <div className="card">
                                    <li
                                        style={{
                                            marginBottom: '10px',
                                            border: '1px solid #ccc',
                                            padding: '10px',
                                            borderRadius: '5px',
                                        }}
                                    >
                                        <strong>Reporte:</strong> {report.report}
                                    </li>
                                </div>
                            </div>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DonationsTab;
