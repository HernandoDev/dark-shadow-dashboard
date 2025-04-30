import React, { useEffect, useState } from 'react';
import { CardTransactions } from '../components/home/card-transactions';
import { APIClashService } from '../services/apiClashService'; // Import API service

const DonacionesCapital = () => {
    const [saves, setSaves] = useState<any[]>([]); // State to store saves
    const [aggregatedDonations, setAggregatedDonations] = useState<any[]>([]); // Aggregated donations per player
    const [activeTab, setActiveTab] = useState<'transactions' | 'totals'>('transactions'); // State for active tab
    const [nameFilter, setNameFilter] = useState(''); // State for name filter

    useEffect(() => {
        const fetchSaves = async () => {
            try {
                const dataMembers = await APIClashService.getClanMembersWithDetails();
                const data = await APIClashService.getSaves();
                const currentSave = {
                    fileName: 'current_state',
                    content: { detailedMembers: dataMembers.detailedMembers || [] },
                };
                const allSaves = [...data, currentSave];
                setSaves(allSaves);
                aggregateDonations(allSaves); // Aggregate donations after fetching saves
            } catch (error) {
                console.error('Error fetching saves:', error);
            }
        };

        fetchSaves();
    }, []);

    const aggregateDonations = (saves: any[]) => {
        const latestSavesByMonth: { [month: string]: any } = {};

        // Filter saves to keep only the latest save for each month
        saves.forEach(save => {
            const match = save.fileName.match(/(\d{4}-\d{2})-\d{2}T/); // Extract year-month from filename
            if (match) {
                const month = match[1];
                if (!latestSavesByMonth[month] || new Date(save.fileName) > new Date(latestSavesByMonth[month].fileName)) {
                    latestSavesByMonth[month] = save;
                }
            }
        });

        const filteredSaves = Object.values(latestSavesByMonth);

        const playerDonations: { [tag: string]: { name: string; totalDonations: number; totalDonationsReceived: number } } = {};

        filteredSaves.forEach(save => {
            save.content.detailedMembers.forEach((member: any) => {
                if (!playerDonations[member.tag]) {
                    playerDonations[member.tag] = {
                        name: member.name,
                        totalDonations: 0,
                        totalDonationsReceived: 0,
                    };
                }
                playerDonations[member.tag].totalDonations += member.donations || 0;
                playerDonations[member.tag].totalDonationsReceived += member.donationsReceived || 0;
            });
        });

        const aggregated = Object.values(playerDonations).sort((a, b) => b.totalDonations - a.totalDonations);
        setAggregatedDonations(aggregated);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 className='neonText'>Donaciones</h1>
            <p>Un buen donador es un miembro que ha realizado al menos 1000 donaciones y cuya diferencia entre donaciones realizadas y recibidas es mayor o igual a 0.
                Un mal donador es un miembro que ha realizado menos de 1000 donaciones o cuya diferencia entre donaciones realizadas y recibidas es menor a 0.</p>
            <br />
            <br />
            {/* Tabs */}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    className={`tabButton ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}

                >
                    <span>Malos y Buenos Donadores</span>
                    <div className="top"></div>
                    <div className="left"></div>
                    <div className="bottom"></div>
                    <div className="right"></div>
                </button>
                <button
                    className={`tabButton ${activeTab === 'totals' ? 'active' : ''}`}

                    onClick={() => setActiveTab('totals')}

                >
                    <span>Donaciones Totales por Jugador</span>
                    <div className="top"></div>
                    <div className="left"></div>
                    <div className="bottom"></div>
                    <div className="right"></div>

                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'transactions' && (
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <CardTransactions filterType="bad" />
                    <CardTransactions filterType="good" />
                </div>
            )}

            {activeTab === 'totals' && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Donaciones Totales por Jugador</h2>
                    <input
                        type="text"
                        placeholder="Filtrar por nombre"
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="input"
                        style={{
                            marginBottom: '10px',
                            padding: '8px',
                            borderRadius: '4px',
                            width: '100%',
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {aggregatedDonations
                            .filter((player) =>
                                player.name.toLowerCase().includes(nameFilter.toLowerCase())
                            )
                            .sort((a, b) => b.totalDonations - a.totalDonations) // Sort by highest total donations
                            .map((player, index) => {
                                const donationDifference = player.totalDonations - player.totalDonationsReceived;
                                return (
                                    <div className='bgblue' style={{ width: '100%', margin: '0 auto' }}>
                                        <div
                                            key={index}
                                            className='card animate__animated animate__backInLeft'
                                        >
                                            <strong
                                                style={{
                                                    fontSize: '16px',
                                                    marginBottom: '5px',
                                                    color: 'violet',
                                                }}
                                            >
                                                {index + 1}. {player.name}
                                            </strong>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                <span>Donaciones Totales:</span>
                                                <span style={{ color: '#4caf50' }}>{player.totalDonations}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                <span>Donaciones Recibidas Totales:</span>
                                                <span style={{ color: '#673ab7' }}>{player.totalDonationsReceived}</span>
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
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonacionesCapital;
