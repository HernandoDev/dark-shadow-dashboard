import React from 'react';
import { Star } from 'react-feather';

const AttackSummaryTab = ({ selectedPlayer, playerSummary, normalWarSummary, leagueWarSummary, attackPerformance }: any) => {
    if (!selectedPlayer) {
        return (
            <div className="bgblue">
                <div className="card">
                    <h2>No hay jugador seleccionado</h2>
                    <p>Por favor, selecciona un jugador para ver su información.</p>
                </div>
            </div>
        );
    }

    const renderSummary = (title: string, summary: any) => (
        <div style={{marginTop:'35px'}} className="bgblue">
            <div className="card">
                <h2>{title}</h2>
                <p><strong>Total de Guerras Jugadas:</strong> {summary.totalWars}</p>
                <p><strong>Media de estrellas:</strong> {summary.averageStars} <Star size={16} style={{ marginRight: '5px' }} /></p>
                <p><strong>Media de destrucción:</strong> {summary.averageDestruction}%</p>
                <p><strong>Ataques no realizados:</strong> {summary.missedAttacks}</p>
            </div>
        </div>
    );

    return (
        <div>
            {renderSummary(`Resumen Combinado de ${selectedPlayer}`, playerSummary)}
            {renderSummary(`Resumen de Guerras Normales de ${selectedPlayer}`, normalWarSummary)}
            {renderSummary(`Resumen de Guerras de Liga de ${selectedPlayer}`, leagueWarSummary)}

            {attackPerformance.length > 0 ? (
                <div>
                    <h2>Resumen de Rendimiento por Tipo de Ataque</h2>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {attackPerformance.map((performance: any, index: number) => (
                            <div className='bgblue' key={index}>
                                <div className='card'>
                                    <li style={{ marginBottom: '10px' }}>
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
                <div style={{marginTop:'30px'}} className="bgblue">
                    <div className="card">
                        <h2>No se encontraron datos para {selectedPlayer}</h2>
                        <p>Por favor, verifica que el jugador tenga ataques registrados.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttackSummaryTab;
