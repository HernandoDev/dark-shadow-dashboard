import React, { useEffect, useState } from 'react';
import { APIClashService } from '../../services/apiClashService';

const DonationsTab = ({ selectedPlayer }: { selectedPlayer: string }) => {
    const [playerDonations, setPlayerDonations] = useState<any>(null);

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

        if (selectedPlayer) {
            fetchPlayerDonations();
        }
    }, [selectedPlayer]);

    if (!selectedPlayer) {
        return (
            <div>
                <h2>Donaciones</h2>
                <p>Por favor, selecciona un jugador para ver sus donaciones.</p>
            </div>
        );
    }

    if (!playerDonations) {
        return (
            <div>
                <h2>Donaciones</h2>
                <p>No se encontraron datos de donaciones para {selectedPlayer}.</p>
            </div>
        );
    }

    const donationDifference = playerDonations.totalDonations - playerDonations.totalDonationsReceived;

    return (
        <div>
            <div className='bgblue' >
                <div className='card'>RESUMEN DE CAPITAL EN PROGRESO</div>
            </div>
            <div className="bgblue" style={{ width: '100%', margin: '0 auto' ,marginTop: '10px'}}>
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
        </div>
    );
};

export default DonationsTab;
