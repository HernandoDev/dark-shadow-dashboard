import React from 'react';

interface CurrentWarProps {
  fullWarDetails: any[] | null;
  clanTag: string;
  getSortedClans: (clans: any[]) => any[];
  getClanSummary: (members: any[]) => any;
  translateHero: (heroName: string) => string;
  getUniqueHeroes: (members: any[]) => string[];
}

const CurrentWar: React.FC<CurrentWarProps> = ({
  fullWarDetails,
  clanTag,
  getSortedClans,
  getClanSummary,
  translateHero,
  getUniqueHeroes,
}) => {
  return (
    <div className="animate__animated animate__backInLeft" id="war-info-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {fullWarDetails ? (
        getSortedClans(fullWarDetails).map((clan: { tag: React.Key | null | undefined; name: string; members: any; warLog?: any; }) => (
          <div
            className="bgblue"
            style={{ marginBottom: '10px' }}
            key={clan.tag as string}
          >
            <div className="card" style={{ textAlign: 'center' }}>
              <h2 style={{ color: '#ffcc00', marginBottom: '10px' }}>
                {clan.name}
                {clan.tag !== clanTag.replace('%23', '#') && ' (Clan Enemigo)'}
              </h2>
              {clan.warLog && clan.warLog.totalWars > 0 && (
                <div>
                  <h5
                    style={{
                      color:
                        clan.warLog.wins < clan.warLog.losses
                          ? 'green'
                          : clan.warLog.wins > clan.warLog.losses
                            ? 'red'
                            : 'violet',
                    }}
                  >
                    Resumen del registro de Guerra (Últimos 60 Días)
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <p>Total Guerras: {clan.warLog.totalWars}</p>
                    <p>Victorias: {clan.warLog.wins}</p>
                    <p>Derrotas: {clan.warLog.losses}</p>
                    <p>Empates: {clan.warLog.ties}</p>
                    <p>Racha Máxima de Victorias: {clan.warLog.maxWinStreak}</p>
                    <p>Racha Máxima de Derrotas: {clan.warLog.maxLossStreak}</p>
                    <p>Victorias Significativas: {clan.warLog.significantWins}</p>
                    <p>Derrotas Significativas: {clan.warLog.significantLosses}</p>
                  </div>
                </div>
              )}
              {clan.tag !== '#2QL0GCQGQ' && clan.tag !== '#2RG9R9JVP' && (
                <div
                  style={{
                    marginBottom: '10px',
                    border: `2px solid ${Object.entries(getClanSummary(clan.members).heroAverages).filter(
                      ([hero, avgLevel]) => {
                        const avg = typeof avgLevel === 'number' ? avgLevel : parseFloat(avgLevel as string);
                        return parseFloat((getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0).toFixed(2)) > avg;
                      }
                    ).length >
                      Object.entries(getClanSummary(clan.members).heroAverages).filter(
                        ([hero, avgLevel]) => {
                          const avg = typeof avgLevel === 'number' ? avgLevel : parseFloat(avgLevel as string);
                          return parseFloat((getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0).toFixed(2)) < avg;
                        }
                      ).length
                      ? 'green'
                      : Object.entries(getClanSummary(clan.members).heroAverages).filter(
                        ([hero, avgLevel]) => {
                          const avg = typeof avgLevel === 'number' ? avgLevel : parseFloat(avgLevel as string);
                          return parseFloat((getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0).toFixed(2)) < avg;
                        }
                      ).length >
                        Object.entries(getClanSummary(clan.members).heroAverages).filter(
                          ([hero, avgLevel]) => {
                            const avg = typeof avgLevel === 'number' ? avgLevel : parseFloat(avgLevel as string);
                            return parseFloat((getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0).toFixed(2)) > avg;
                          }
                        ).length
                        ? 'red'
                        : 'violet'
                    }`,
                    borderRadius: '8px',
                    padding: '10px',
                  }}
                >
                  <h5
                    style={{
                      color:
                        Object.entries(getClanSummary(clan.members).heroAverages).filter(
                          ([hero, avgLevel]) => {
                            const avg = typeof avgLevel === 'number' ? avgLevel : parseFloat(avgLevel as string);
                            return parseFloat((getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0).toFixed(2)) > avg;
                          }
                        ).length >
                          Object.entries(getClanSummary(clan.members).heroAverages).filter(
                            ([hero, avgLevel]) => {
                              const avg = typeof avgLevel === 'number' ? avgLevel : parseFloat(avgLevel as string);
                              return parseFloat((getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0).toFixed(2)) < avg;
                            }
                          ).length
                          ? 'green'
                          : Object.entries(getClanSummary(clan.members).heroAverages).filter(
                            ([hero, avgLevel]) => {
                              const avg = typeof avgLevel === 'number' ? avgLevel : parseFloat(avgLevel as string);
                              return parseFloat((getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0).toFixed(2)) < avg;
                            }
                          ).length >
                            Object.entries(getClanSummary(clan.members).heroAverages).filter(
                              ([hero, avgLevel]) => {
                                const avg = typeof avgLevel === 'number' ? avgLevel : parseFloat(avgLevel as string);
                                return parseFloat((getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0).toFixed(2)) > avg;
                              }
                            ).length
                            ? 'red'
                            : 'violet',
                    }}
                  >
                    Resumen de diferencias de nivel de héroes y ayuntamiento
                  </h5>
                  {Object.entries(getClanSummary(clan.members).heroAverages).map(([hero, avgLevel]) => {
                    const avg = typeof avgLevel === 'number' ? avgLevel : parseFloat(avgLevel as string);
                    const mainClanHeroLevel = parseFloat((getClanSummary(fullWarDetails?.find(c => c.tag === clanTag.replace('%23', '#'))?.members || []).heroAverages[hero] || 0).toFixed(2));
                    const roundedAvgLevel = parseFloat(avg.toFixed(2));
                    const levelDifference = parseFloat((mainClanHeroLevel - roundedAvgLevel).toFixed(2));
                    let comparisonText = '';
                    let comparisonColor = '';

                    if (levelDifference > 0) {
                      comparisonText = `Nuestro clan tiene un nivel superior en ${translateHero(hero)} por ${Math.abs(levelDifference)}`;
                      comparisonColor = 'green';
                    } else if (levelDifference < 0) {
                      comparisonText = `Nuestro clan tiene un nivel inferior en ${translateHero(hero)} por ${Math.abs(levelDifference)}`;
                      comparisonColor = 'red';
                    } else {
                      comparisonText = `Nuestro clan tiene el mismo nivel en ${translateHero(hero)}`;
                      comparisonColor = 'gray';
                    }

                    return (
                      <p key={hero} style={{ color: comparisonColor, margin: '5px 0' }}>
                        {comparisonText}
                      </p>
                    );
                  })}
                  {(() => {
                    const mainClanHeroLevel2 = getClanSummary(fullWarDetails?.find(c => c.tag === clanTag.replace('%23', '#'))?.members || []);
                    const mainClanTHLevel = mainClanHeroLevel2.averageTownHallLevel;
                    const opponentTHLevel = parseFloat(getClanSummary(clan.members).averageTownHallLevel.toFixed(2));
                    const levelDifference = parseFloat((mainClanTHLevel - opponentTHLevel).toFixed(2));
                    let comparisonText = '';
                    let comparisonColor = '';

                    if (levelDifference > 0) {
                      comparisonText = `Nuestro clan tiene un nivel superior en ayuntamiento por ${Math.abs(levelDifference)}`;
                      comparisonColor = 'green';
                    } else if (levelDifference < 0) {
                      comparisonText = `Nuestro clan tiene un nivel inferior en ayuntamiento por ${Math.abs(levelDifference)}`;
                      comparisonColor = 'red';
                    } else {
                      comparisonText = 'Nuestro clan tiene el mismo nivel en ayuntamiento';
                      comparisonColor = 'gray';
                    }

                    return (
                      <p style={{ color: comparisonColor, margin: '5px 0' }}>
                        {comparisonText}
                      </p>
                    );
                  })()}
                </div>
              )}
              <div
                style={{
                  border: `3px solid ${getClanSummary(clan.members).averageTownHallLevel >
                    getClanSummary(fullWarDetails?.[0]?.members || []).averageTownHallLevel
                    ? 'green'
                    : getClanSummary(clan.members).averageTownHallLevel <
                      getClanSummary(fullWarDetails?.[0]?.members || []).averageTownHallLevel
                      ? 'red'
                      : 'violet'
                  }`,
                  borderRadius: '8px',
                  padding: '10px',
                }}
              >
                <h5
                  style={{
                    color:
                      getClanSummary(clan.members).averageTownHallLevel >
                        getClanSummary(fullWarDetails?.[0]?.members || []).averageTownHallLevel
                        ? 'green'
                        : getClanSummary(clan.members).averageTownHallLevel <
                          getClanSummary(fullWarDetails?.[0]?.members || []).averageTownHallLevel
                          ? 'red'
                          : 'violet',
                    marginBottom: '10px',
                  }}
                >
                  Media de Nivel de TH y Héroes
                </h5>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '5px' }}>Nivel Ayuntamiento: {getClanSummary(clan.members).averageTownHallLevel}</li>
                  {getUniqueHeroes(clan.members).map((hero) => (
                    <li key={hero} style={{ marginBottom: '5px' }}>
                      {translateHero(hero)}: {getClanSummary(clan.members).heroAverages[hero] || 'N/A'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: '#ff0000', fontWeight: 'bold' }}>No hay guerra activa en este momento.</p>
      )}
    </div>
  );
};

export default CurrentWar;
