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

    const getColorByLevelDifference = (currentLevel: number, maxLevel: number): string => {
        const difference = maxLevel - currentLevel;
        if (difference === 0) return 'green'; // Max level
        if (difference <= 2) return 'green'; // Close to max level
        if (difference <= 3) return 'yellow'; // Moderate difference
        return 'red'; // Significant difference
    };

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

    if (!playerDonations) {
        return (
            <div>
                <p>No se encontraron datos de donaciones para {selectedPlayer}.</p>
            </div>
        );
    }

    const donationDifference = playerDonations.totalDonations - playerDonations.totalDonationsReceived;

    return (
        <div>
            <div className="bgblue">
                <div className="card">RESUMEN DE CAPITAL EN PROGRESO</div>
            </div>
            <div className="bgblue" style={{ width: '100%', margin: '0 auto', marginTop: '10px' }}>
                <div className="card animate__animated animate__backInLeft">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span>Donaciones Totales:</span>
                        <span style={{ color: '#4caf50' }}>{playerDonations.totalDonations}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span>Donaciones Recibidas Totales:</span>
                        <span style={{ color: '#673ab7' }}>{playerDonations.totalDonationsReceived}</span>
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
                                        .filter((troop) => troop.village === "home")
                                        .map((troop, index) => (
                                            <p key={index} style={{ color: getColorByLevelDifference(troop.level, troop.maxLevel) }}>
                                                <strong>{troop.name}:</strong> Nivel {troop.level} / {troop.maxLevel}
                                                {troop.superTroopIsActive && <span style={{ color: 'gold' }}> (Super)</span>}
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
                                                    <strong>{hero.name}:</strong> Nivel {hero.level} / {hero.maxLevel}
                                                </p>
                                                {hero.equipment && hero.equipment.length > 0 && (
                                                    <ul style={{ listStyle: 'none', paddingLeft: '10px' }}>
                                                        {hero.equipment.map((equip, equipIndex) => (
                                                            <li key={equipIndex} style={{ color: getColorByLevelDifference(equip.level, equip.maxLevel) }}>
                                                                <strong>{equip.name}:</strong> Nivel {equip.level} / {equip.maxLevel}
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
                                                <strong>{equipment.name}:</strong> Nivel {equipment.level} / {equipment.maxLevel}
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
                                                <strong>{spell.name}:</strong> Nivel {spell.level} / {spell.maxLevel}
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
