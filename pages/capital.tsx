import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';

const CapitalPage: React.FC = () => {
    const [raidSeasons, setRaidSeasons] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRaidSeasons = async () => {
            try {
                const data = await APIClashService.getCapitalRaidSeasons();
                debugger
                setRaidSeasons(data.items || []);
            } catch (err: any) {
                setError(err.message || 'Error fetching capital raid seasons');
            }
        };

        fetchRaidSeasons();
    }, []);

    return (
        <div>
            <h1 className="neonText">Capital del Clan</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {raidSeasons.map((season, index) => (
                    <li key={index}>
                        <strong>Season ID:</strong> {season.id} <br />
                        <strong>Start Time:</strong> {season.startTime} <br />
                        <strong>End Time:</strong> {season.endTime}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CapitalPage;
