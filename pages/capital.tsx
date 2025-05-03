import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';

interface Member {
    tag: string;
    name: string;
    attacks: number;
    attackLimit: number;
    bonusAttackLimit: number;
    capitalResourcesLooted: number;
}

interface District {
    id: number;
    name: string;
    districtHallLevel: number;
    destructionPercent: number;
    stars: number;
    attackCount: number;
    totalLooted: number;
    attacks: { attacker: { tag: string } }[]; // Added attacks property
}

interface RaidAttackLog {
    defender: {
        tag: string;
        name: string;
        level: number;
        badgeUrls: {
            small: string;
            medium: string;
            large: string;
        }
    };
    attackCount: number;
    districtCount: number;
    districtsDestroyed: number;
    districts: District[];
}

interface RaidDefenseLog {
    attacker: {
        tag: string;
        name: string;
        level: number;
        badgeUrls: {
            small: string;
            medium: string;
            large: string;
        }
    };
    attackCount: number;
    districtCount: number;
    districtsDestroyed: number;
    districts: District[];
}

interface RaidSeason {
    state: 'ongoing' | 'ended';
    startTime: string;
    endTime: string;
    capitalTotalLoot: number;
    raidsCompleted: number;
    totalAttacks: number;
    enemyDistrictsDestroyed: number;
    offensiveReward?: number;
    defensiveReward?: number;
    members?: Member[];
    attackLog?: RaidAttackLog[];
    defenseLog?: RaidDefenseLog[];
}

const CapitalPage: React.FC = () => {
    const [raidSeasons, setRaidSeasons] = useState<RaidSeason[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [clanMembers, setClanMembers] = useState<{ name: string; tag: string }[]>([]); // Update type
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    useEffect(() => {
        const fetchRaidSeasons = async () => {
            try {
                const data = await APIClashService.getCapitalRaidSeasons();
                setRaidSeasons(data.items || []);
            } catch (err: any) {
                setError(err.message || 'Error fetching capital raid seasons');
            }
        };

        fetchRaidSeasons();
        fetchClanMembers()
    }, []);

    const fetchClanMembers = async () => {
        try {
            const response = await APIClashService.getClanMembers();
            setClanMembers(response.items); // Store full member objects
        } catch (error) {
            console.error('Error fetching clan members:', error);
        } finally {
        }
    };

    const formatDate = (dateString: string) => {
        try {
            // Convert "20250505T070000.000Z" to "2025-05-05T07:00:00.000Z"
            const formattedDateString = dateString.replace(
                /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3})Z$/,
                "$1-$2-$3T$4:$5:$6.$7Z"
            );
            const date = new Date(formattedDateString);
            if (isNaN(date.getTime())) {
                throw new Error("Invalid date");
            }
    
            return date.toLocaleString();
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString;
        }
    };

    const sortedData = (data: any[], key: string) => {
        if (!sortConfig) return data;
        return [...data].sort((a, b) => {
            if (a[key] < b[key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSort = (key: string) => {
        setSortConfig(prev => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const getTopContributors = (season: RaidSeason) => {
        if (!season.members || season.members.length === 0) return [];

        return [...season.members]
            .sort((a, b) => b.capitalResourcesLooted - a.capitalResourcesLooted)
            .slice(0, 5);
    };

    const getParticipationRate = (season: RaidSeason) => {
        if (!clanMembers || clanMembers.length === 0) return 0;

        const nonAttackingMembers = getNonAttackingMembers(season);
        const membersWhoAttacked = clanMembers.length - nonAttackingMembers.length;

        return Math.round((membersWhoAttacked / clanMembers.length) * 100);
    };

    const getNonAttackingMembers = (season: RaidSeason) => {
        if (!clanMembers || clanMembers.length === 0) return [];
        if (!season.attackLog || season.attackLog.length === 0) {
            return clanMembers.map(member => ({
                ...member,
                attacks: 0,
                attackLimit: 6,
            }));
        }

        const attackingMemberTags = new Set(
            season.attackLog.flatMap(log =>
                log.districts.flatMap(district =>
                    district.attacks?.map(attack => attack.attacker.tag) || []
                )
            )
        );

        return clanMembers.map(member => {
            const hasAttacked = attackingMemberTags.has(member.tag);
            const attacks = hasAttacked
                ? season.members?.find(m => m.tag === member.tag)?.attacks || 0
                : 0;

            return {
                ...member,
                attacks,
                attackLimit: 6,
            };
        }).filter(member => member.attacks < 6);
    };

    const ongoingSeasons = raidSeasons.filter(season => season.state === 'ongoing');
    const endedSeasons = raidSeasons.filter(season => season.state === 'ended');

    return (
        <div className="capital-container">
            <h1 className="neonText">Capital del Clan</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Ongoing Raids */}
            {ongoingSeasons.length > 0 && (
                <div className="raid-section">
                    {ongoingSeasons.map((season, index) => (
                        <div className='bgblue'>
                        <div key={index} className="raid-card ongoing">
                            <div className="raid-header">
                                <h3>Incursión Capital Actual</h3>
                                <p><strong>Período:</strong> {formatDate(season.startTime)} - {formatDate(season.endTime)}</p>
                                <p><strong>Estado:</strong> <span className="status-ongoing">En Progreso</span></p>
                            </div>

                            <div className="raid-stats">
                                <div className="stat-item">
                                    <span className="stat-value">{season.raidsCompleted}</span>
                                    <span className="stat-label">Incursiones Completadas</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{season.totalAttacks}</span>
                                    <span className="stat-label">Ataques Totales</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{season.enemyDistrictsDestroyed}</span>
                                    <span className="stat-label">Distritos Destruidos</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{season.capitalTotalLoot.toLocaleString()}</span>
                                    <span className="stat-label">Botín Total</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{getParticipationRate(season)}%</span>
                                    <span className="stat-label">Participación</span>
                                </div>
                            </div>

                            {season.members && season.members.length > 0 && (
                                        <div className="member-participation">
                                            <h4 style={{color:'violet'}}>Principales Contribuyentes</h4>
                                            <table className="member-table">
                                                <thead>
                                                    <tr>
                                                        <th onClick={() => handleSort('name')}>Nombre <i className="bi bi-sort-up"></i></th>
                                                        <th onClick={() => handleSort('attacks')}>Ataques <i className="bi bi-sort-up"></i></th>
                                                        <th onClick={() => handleSort('capitalResourcesLooted')}>Recursos Saqueados <i className="bi bi-sort-up"></i></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sortedData(getTopContributors(season), sortConfig?.key || '').map((member, idx) => (
                                                        <tr key={idx}>
                                                            <td>{member.name}</td>
                                                            <td>{member.attacks}/{member.attackLimit + member.bonusAttackLimit}</td>
                                                            <td>{member.capitalResourcesLooted.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                            )}

                            {getNonAttackingMembers(season).length > 0 && (
                                        <div className="non-attacking-members" style={{ padding: '10px', borderRadius: '5px' ,marginTop:'40px'}}>
                                            <h4 style={{ color: 'red' }}>Miembros Sin Ataques</h4>
                                            <table className="member-table">
                                                <thead>
                                                    <tr>
                                                        <th onClick={() => handleSort('name')}>Nombre <i className="bi bi-sort-up"></i></th>
                                                        <th onClick={() => handleSort('attacks')}>Ataques Realizados <i className="bi bi-sort-up"></i></th>
                                                        <th onClick={() => handleSort('attackLimit')}>Límite de Ataques <i className="bi bi-sort-up"></i></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sortedData(getNonAttackingMembers(season), sortConfig?.key || '').map((member, idx) => (
                                                        <tr key={idx} style={{ color: 'red' }}>
                                                            <td>{member.name}</td>
                                                            <td>{member.attacks}</td>
                                                            <td>6</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                            )}


                        </div>
                        </div>
                    ))}
                </div>
            )}
            {raidSeasons.length === 0 && !error && (
                <p>Cargando datos de las temporadas de incursión...</p>
            )}
            <style>
                {`
                    .member-table {
                        border-collapse: collapse;
                        width: 100%;
                    }

                    .member-table thead th {
                        position: sticky;
                        top: 0;
                        z-index: 2;
                        text-align: left;
                        padding: 8px;
                        border-bottom: 2px solid #ddd;
                    }

                    .member-table tbody tr:nth-child(even) {
                    }

                    .member-table tbody tr:hover {
                    }

                    .member-table tbody td {
                        padding: 8px;
                        border-bottom: 1px solid #ddd;
                    }

                    .non-attacking-members {
                        max-height: 800px; /* Set a max height for scrollable content */
                        overflow-y: auto;
                    }

                    .member-participation {
                        max-height: 300px; /* Set a max height for scrollable content */
                        overflow-y: auto;
                    }
                `}
            </style>
        </div>
    );
};

export default CapitalPage;
