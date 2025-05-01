import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService'; // Ensure this import exists

const ReportesPage = () => {
    const [clanMembers, setClanMembers] = useState<string[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<string[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedPlayer, setSelectedPlayer] = useState<string>('');
    const [reportText, setReportText] = useState<string>('');
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        const fetchClanMembers = async () => {
            try {
                const response = await APIClashService.getClanMembers(); // Clan Principal
                const memberNames = response.items.map((member: { name: string }) => member.name);
                setMembers(response.items); // Save the full members list
                setClanMembers(memberNames);
                setFilteredMembers(memberNames);
            } catch (error) {
                console.error('Error fetching clan members:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchReports = async () => {
            try {
                const response = await APIClashService.getReports();
                setReports(response);
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        };

        fetchClanMembers();
        fetchReports();
    }, []);

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const filterText = event.target.value.toLowerCase();
        setFilteredMembers(clanMembers.filter((name) => name.toLowerCase().includes(filterText)));
    };

    const handleSaveReport = async () => {
        try {
            await APIClashService.saveReport({
                player: selectedPlayer,
                report: reportText,
            });
            console.log('Reporte guardado:', { jugador: selectedPlayer, reporte: reportText });
            setReports((prevReports) => [...prevReports, { player: selectedPlayer, report: reportText }]);
        } catch (error) {
            console.error('Error al guardar el reporte:', error);
        } finally {
            setIsModalOpen(false);
            setSelectedPlayer('');
            setReportText('');
        }
    };

    return (
        <div>
            <h1 className="animate__animated animate__backInDown neonText" style={{ textAlign: 'center', marginBottom: '20px' }}>
                Reportes de Jugadores
            </h1>
            <div className="button-container">
                <button
                    className="green-hacker-button"
                    data-text="Agregar Reporte"
                    onClick={() => setIsModalOpen(true)}
                >
                    Agregar Reporte
                    <div className="green-neon-frame"></div>
                    <div className="circuit-traces">
                        <div className="circuit-trace"></div>
                        <div className="circuit-trace"></div>
                        <div className="circuit-trace"></div>
                        <div className="circuit-trace"></div>
                        <div className="circuit-trace"></div>
                    </div>
                    <div className="code-fragments">
                        <span className="code-fragment">INSULTOS</span>
                        <span className="code-fragment">INACTIVIDAD</span>
                        <span className="code-fragment">TOXICO</span>
                        <span className="code-fragment">NO RESPETO</span>
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
            <br />
            <p style={{ textAlign: 'center' }}>En esta ventana podras filtrar jugadores y ver algun reporte realizado por algun colider sobre un jugador del clan</p>
            <br />

            <div style={{ margin: '20px' }}>
                <h2>Reportes Registrados</h2>
                {reports.length === 0 ? (
                    <p>No hay reportes registrados.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {reports.map((report, index) => (
                            <div className='bgblue'>
                                <div className='card'>
                                    <li key={index} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                                        <strong>Jugador:</strong> {report.player} <br />
                                        <strong>Reporte:</strong> {report.report}
                                    </li>
                                </div>
                            </div>
                        ))}
                    </ul>
                )}
            </div>

            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div className="bgblue">
                        <div
                            className="card"
                            style={{
                                padding: '20px',
                                borderRadius: '8px',
                                width: '400px',
                                textAlign: 'center',
                            }}
                        >
                            <h2>Agregar Reporte</h2>
                            <div style={{ marginBottom: '10px' }}>
                                <input
                                    className='input'
                                    type="text"
                                    placeholder="Buscar jugador..."
                                    onChange={handleFilterChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        marginBottom: '10px',
                                        borderRadius: '5px',
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <select
                                    className='input'

                                    value={selectedPlayer}
                                    onChange={(e) => setSelectedPlayer(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '5px' }}
                                >
                                    <option value="" disabled>
                                        Selecciona un jugador
                                    </option>
                                    {filteredMembers.map((member, index) => (
                                        <option key={index} value={member}>
                                            {member}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <textarea
                                    className='input'

                                    value={reportText}
                                    onChange={(e) => setReportText(e.target.value)}
                                    placeholder="Escribe el reporte aquí..."
                                    style={{ width: '100%', height: '100px', padding: '10px', borderRadius: '5px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: 'red',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveReport}
                                    disabled={!selectedPlayer || !reportText}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: !selectedPlayer || !reportText ? 'gray' : 'green',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: !selectedPlayer || !reportText ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportesPage;
