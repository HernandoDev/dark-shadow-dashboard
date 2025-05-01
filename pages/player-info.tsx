import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';
import { Star } from 'react-feather';
import { fetchSavedAttacks } from '../utils/fetchSavedAttacks'; // Adjust the path as needed

// Utility functions
const calculatePlayerSummary = (playerWarRecords: any[], selectedPlayer: string) => {
    if (!playerWarRecords.length) return null;

    let totalWars = 0;
    let totalStars = 0;
    let totalDestruction = 0;
    let totalAttacks = 0;
    let missedAttacks = 0;

    playerWarRecords.forEach((record) => {
        const playerData =
            record.content.clan.members.find((member: any) => member.name === selectedPlayer) ||
            record.content.opponent.members.find((member: any) => member.name === selectedPlayer);

        if (playerData) {
            totalWars++;
            totalStars += playerData.attacks?.reduce((sum: number, attack: any) => sum + attack.stars, 0) || 0;
            totalDestruction += playerData.attacks?.reduce((sum: number, attack: any) => sum + attack.destructionPercentage, 0) || 0;
            totalAttacks += playerData.attacks?.length || 0;
            missedAttacks += Math.max(0, record.content.attacksPerMember - (playerData.attacks?.length || 0));
        }
    });

    const averageStars = totalAttacks > 0 ? (totalStars / totalAttacks).toFixed(2) : '0';
    const averageDestruction = totalAttacks > 0 ? (totalDestruction / totalAttacks).toFixed(2) : '0';

    return {
        totalWars,
        averageStars,
        averageDestruction,
        missedAttacks,
    };
};

const filterWarRecords = (warSaves: any[], playerName: string) => {
    return warSaves.filter((war) =>
        war.content.clan.members.some((member: any) => member.name === playerName) ||
        war.content.opponent.members.some((member: any) => member.name === playerName)
    );
};

const calculateAttackPerformance = (savedAttacks: any[], selectedPlayer: string) => {
    const playerAttacks = savedAttacks.filter((attack) => attack.member === selectedPlayer);

    if (!playerAttacks.length) return [];

    const attackPerformance: Record<string, { count: number; totalStars: number; totalDestruction: number; higherThCount: number; equalThCount: number; lowerThCount: number }> = {};

    playerAttacks.forEach((attack) => {
        if (!attackPerformance[attack.attack]) {
            attackPerformance[attack.attack] = { 
                count: 0, 
                totalStars: 0, 
                totalDestruction: 0,
                higherThCount: 0,
                equalThCount: 0,
                lowerThCount: 0 
            };
        }
        attackPerformance[attack.attack].count++;
        attackPerformance[attack.attack].totalStars += attack.stars;
        attackPerformance[attack.attack].totalDestruction += attack.percentage;

        const memberThLevel = parseInt(attack.memberThLevel.replace('TH', ''), 10);
        const thRival = parseInt(attack.thRival.replace('TH', ''), 10);

        if (thRival > memberThLevel) {
            attackPerformance[attack.attack].higherThCount++;
        } else if (thRival === memberThLevel) {
            attackPerformance[attack.attack].equalThCount++;
        } else {
            attackPerformance[attack.attack].lowerThCount++;
        }
    });

    return Object.entries(attackPerformance).map(([attackType, stats]) => ({
        attackType,
        count: stats.count,
        averageStars: (stats.totalStars / stats.count).toFixed(2),
        averageDestruction: (stats.totalDestruction / stats.count).toFixed(2),
        higherThCount: stats.higherThCount,
        equalThCount: stats.equalThCount,
        lowerThCount: stats.lowerThCount,
    }));
};

// Main Component
const PlayerInfo = () => {
    const [warSaves, setWarSaves] = useState<any[]>([]);
    const [clanMembers, setClanMembers] = useState<string[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<string[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<string>('');
    const [playerWarRecords, setPlayerWarRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingWarSaves, setLoadingWarSaves] = useState(false);
    const [savedAttacks, setSavedAttacks] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'resumen' | 'donaciones'>('resumen'); // State for active tab

    // Fetch data
    const fetchWarSaves = async () => {
        setLoadingWarSaves(true);
        try {
            const response = await APIClashService.getWarSaves();
            setWarSaves(response);
        } catch (error) {
            console.error('Error fetching war saves:', error);
        } finally {
            setLoadingWarSaves(false);
        }
    };

    const fetchClanMembers = async () => {
        setLoading(true);
        try {
            const response = await APIClashService.getClanMembers(); // Clan Principal
            const memberNames = response.items.map((member: { name: string }) => member.name);
            setClanMembers(memberNames);
            setFilteredMembers(memberNames);
        } catch (error) {
            console.error('Error fetching clan members:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedAttacksData = async () => {
        try {
            const data = await fetchSavedAttacks();
            setSavedAttacks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching saved attacks:', error);
        }
    };

    // Handlers
    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const filterText = event.target.value.toLowerCase();
        setFilteredMembers(clanMembers.filter((name) => name.toLowerCase().includes(filterText)));
    };

    const handlePlayerSelection = (playerName: string) => {
        setSelectedPlayer(playerName);
        const records = filterWarRecords(warSaves, playerName);
        setPlayerWarRecords(records);
    };

    // Effects
    useEffect(() => {
        fetchWarSaves();
        fetchClanMembers();
        fetchSavedAttacksData();
    }, []);

    const playerSummary = calculatePlayerSummary(playerWarRecords, selectedPlayer);
    const attackPerformance = calculateAttackPerformance(savedAttacks, selectedPlayer);

    return (
        <div style={{ padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <h1 className="animate__animated animate__backInDown neonText" style={{ textAlign: 'center', marginBottom: '20px' }}>
                Player Info
            </h1>
            <p>En esta ventana podrás buscar a los jugadores del clan para obtener un resumen completo de cada uno. Aquí encontrarás toda su información, incluyendo datos de la capital del clan, historial de donaciones, registro de guerras, estadísticas de ataque y reportes asociados al jugador.</p>
            <h2>Buscar Jugador</h2>
            <input
                className="input"
                type="text"
                placeholder="Search for a player..."
                onChange={handleFilterChange}
                style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    borderRadius: '5px',
                }}
            />
            <select
                className="input"
                value={selectedPlayer}
                onChange={(e) => handlePlayerSelection(e.target.value)}
                style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '20px',
                    borderRadius: '5px',
                }}
            >
                <option value="" disabled>
                    Select a player
                </option>
                {filteredMembers.map((member, index) => (
                    <option key={index} value={member}>
                        {member}
                    </option>
                ))}
            </select>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
                <button
                    className={`tabButton ${activeTab === 'resumen' ? 'active' : ''}`}
                    onClick={() => setActiveTab('resumen')}
                >
                    <span>Resumen Ataques</span>
                    <div className="top"></div>
                    <div className="left"></div>
                    <div className="bottom"></div>
                    <div className="right"></div>
                </button>
                <button
                    className={`tabButton ${activeTab === 'donaciones' ? 'active' : ''}`}
                    onClick={() => setActiveTab('donaciones')}
                >
                    <span>Donaciones</span>
                    <div className="top"></div>
                    <div className="left"></div>
                    <div className="bottom"></div>
                    <div className="right"></div>
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'resumen' && (
                <div>
                    {selectedPlayer && playerSummary ? (
                        <div className="bgblue">
                            <div className="card">
                                <h2>Resumen de guerra {selectedPlayer}</h2>
                                <p><strong>Total de Guerras Jugadas:</strong> {playerSummary.totalWars}</p>
                                <p><strong>Media de estrellas:</strong> {playerSummary.averageStars} <Star size={16} style={{ marginRight: '5px' }} /></p>
                                <p><strong>Media de destrucción:</strong> {playerSummary.averageDestruction}%</p>
                                <p><strong>Ataques no realizados:</strong> {playerSummary.missedAttacks}</p>
                            </div>
                        </div>
                    ) : (
                        selectedPlayer && (
                            <div className="bgblue">
                                <div className="card">
                                    <h2>No se encontraron datos para {selectedPlayer}</h2>
                                    <p>Por favor, verifica que el jugador seleccionado tenga registros disponibles.</p>
                                </div>
                            </div>
                        )
                    )}

                    {selectedPlayer && attackPerformance.length > 0 ? (
                        <div>
                            <h2>Resumen de Rendimiento por Tipo de Ataque</h2>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {attackPerformance.map((performance, index) => (
                                    <div className='bgblue'>
                                        <div className='card'>
                                            <li key={index} style={{ marginBottom: '10px' }}>
                                                <span style={{ color: 'gold' }}> <strong>Ejército:</strong> {performance.attackType} <br /></span>
                                                <strong>Veces Usado:</strong> {performance.count} <br />
                                                <strong>Media de Estrellas:</strong>
                                                <span style={{
                                                    color: parseFloat(performance.averageStars) < 2 ? 'red' :
                                                        parseFloat(performance.averageStars) <= 2.2 ? 'yellow' : 'green'
                                                }}>
                                                    {performance.averageStars}
                                                </span> <br />
                                                <strong>Media de Destrucción:</strong>
                                                <span style={{
                                                    color: parseFloat(performance.averageDestruction) < 55 ? 'red' :
                                                        parseFloat(performance.averageDestruction) <= 60 ? 'yellow' : 'green'
                                                }}>
                                                    {performance.averageDestruction}%
                                                </span> <br />
                                                <strong>Ataques contra TH superior:</strong> {performance.higherThCount} <br />
                                                <strong>Ataques contra TH igual:</strong> {performance.equalThCount} <br />
                                                <strong>Ataques contra TH inferior:</strong> {performance.lowerThCount} <br />
                                            </li>
                                        </div>
                                    </div>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        selectedPlayer && (
                            <div className="bgblue">
                                <div className="card">
                                    <h2>No se encontraron datos  para {selectedPlayer}</h2>
                                    <p>Por favor, verifica que el jugador tenga ataques registrados.</p>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            {activeTab === 'donaciones' && (
                <div>
                    <h2>Donaciones</h2>
                    <p>¡Hola! Aquí se mostrarán las donaciones en el futuro.</p>
                </div>
            )}
        </div>
    );
};

export default PlayerInfo;
