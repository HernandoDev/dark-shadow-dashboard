import React, { useEffect, useState } from 'react';
import { CardTransactions } from '../components/home/card-transactions';
import { APIClashService } from '../services/apiClashService'; // Import API service

const DonacionesCapital = () => {
    const [saves, setSaves] = useState<any[]>([]); // State to store saves
    const [aggregatedDonations, setAggregatedDonations] = useState<any[]>([]); // Aggregated donations per player

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
            <h1>Donaciones</h1>
            <p>Un buen donador es un miembro que ha realizado al menos 1000 donaciones y cuya diferencia entre donaciones realizadas y recibidas es mayor o igual a 0.
            Un mal donador es un miembro que ha realizado menos de 1000 donaciones o cuya diferencia entre donaciones realizadas y recibidas es menor a 0.</p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <CardTransactions filterType="bad" />
                <CardTransactions filterType="good" />
            </div>
          
            <div style={{ marginTop: '20px' }}>
                <h2>Donaciones Totales por Jugador</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Jugador</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Donaciones Totales</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Donaciones Recibidas Totales</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aggregatedDonations.map((player, index) => (
                            <tr key={index}>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{player.name}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{player.totalDonations}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{player.totalDonationsReceived}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DonacionesCapital;
