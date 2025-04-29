import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';
import { Button } from '@nextui-org/react';
import { FaStar, FaTrophy, FaTimesCircle } from 'react-icons/fa';
import { Star } from 'react-feather';
import { fetchSavedAttacks } from '../utils/fetchSavedAttacks';

const heroTranslations = {
  "Barbarian King": "Rey Bárbaro",
  "Archer Queen": "Reina Arquera",
  "Grand Warden": "Gran Centinela",
  "Royal Champion": "Campeona Real",
  "Battle Machine": "Máquina Bélica",
  "Minion Prince": "Príncipe Minion",
  "Battle Copter": "Helicóptero de Batalla",
};

const getClanTag = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('clanTag') || '%232QL0GCQGQ';
};

const evaluateWarResult = (selectedWar: any) => {
  const clanTag = getClanTag().replace('%23', '#'); // Formatear el clanTag
  const isMainClan = selectedWar.content.clan.tag === clanTag;

  const mainClan = isMainClan ? selectedWar.content.clan : selectedWar.content.opponent;
  const opponentClan = isMainClan ? selectedWar.content.opponent : selectedWar.content.clan;

  if (mainClan.stars > opponentClan.stars) {
    return 'Ganamos la guerra';
  } else if (mainClan.stars < opponentClan.stars) {
    return 'Perdimos la guerra';
  } else {
    // Empate: comparar porcentaje de destrucción
    if (mainClan.destructionPercentage > opponentClan.destructionPercentage) {
      return 'Ganamos la guerra';
    } else if (mainClan.destructionPercentage < opponentClan.destructionPercentage) {
      return 'Perdimos la guerra';
    } else {
      return 'La guerra terminó en empate';
    }
  }
};

const extractTimestampFromFileName = (fileName: string): string => {
  const parts = fileName.split('_');
  return parts[2].replace('.json', ''); // Extract the timestamp part and remove the .json extension
};

const getThColor = (memberThLevel: number, thRival: number): string => {
  if (memberThLevel > thRival) return 'green';
  if (memberThLevel < thRival) return 'red';
  return 'gray';
};

const calculatePoints = (stars: number, memberThLevel: number, thRival: number, multiplier: number): number => {
  return stars * (memberThLevel / thRival) * multiplier;
};

const getPlayersWhoDidNotAttack = (members: any[], savedAttacks: any[], attacksPerMember: number) => {
  const attackCounts = savedAttacks.reduce((acc: any, attack: any) => {
    acc[attack.member] = (acc[attack.member] || 0) + 1;
    return acc;
  }, {});

  return members.map((member: any) => {
    const attacksMade = attackCounts[member.name] || 0;
    const attacksMissing = Math.max(0, attacksPerMember - attacksMade);
    return { name: member.name, attacksMissing };
  }).filter((member: any) => member.attacksMissing > 0);
};

const WarInfoPage = () => {
  const [clanTag, setClanTag] = useState('%232QL0GCQGQ');
  const [fullWarDetails, setFullWarDetails] = useState<any[] | null>(null);
  const [activeTab, setActiveTab] = useState<'currentWar' | 'warLogs'>('currentWar');
  const [warSaves, setWarSaves] = useState<any[]>([]); // State to store war saves
  const [loadingWarSaves, setLoadingWarSaves] = useState(false); // State to track loading status
  const [selectedWar, setSelectedWar] = useState<any>(null); // State to store the selected war
  const [savedAttacks, setSavedAttacks] = useState<any[]>([]);

  useEffect(() => {
    fetchSavedAttacks()
      .then((data) => setSavedAttacks(Array.isArray(data) ? data : [])) // Ensure savedAttacks is always an array
      .catch((error) => {
        console.error('Error al obtener los ataques guardados:', error);
        console.log('Hubo un error al obtener los ataques guardados.');
      })
    const loadData = async () => {
      try {
        console.log('Fetching clan war league group details for tag:', clanTag);
        const clanWarLeagueGroupDetails = await APIClashService.getClanWarLeagueGroup();
        console.log('Fetched data:', clanWarLeagueGroupDetails);

        if (clanWarLeagueGroupDetails?.clans) {
          const fullDetails = await Promise.all(
            clanWarLeagueGroupDetails.clans.map(async (clan: { members: any[]; }) => {
              const membersWithDetails = await Promise.all(
                clan.members.map(async (member: { tag: string; }) => {
                  const formattedTag = member.tag.replace('#', '%23');
                  const playerInfo = await APIClashService.getPlayerInfo(formattedTag);
                  return { ...member, playerInfo };
                })
              );
              return { ...clan, members: membersWithDetails };
            })
          );
          setFullWarDetails(fullDetails);
        } else {
          const currentWarDetails = await APIClashService.getClanCurrentWar();
          const clanDetails = await enrichMembersWithDetails(currentWarDetails.clan.members);
          const opponentDetails = await enrichMembersWithDetails(currentWarDetails.opponent.members);

          const opponentTag = currentWarDetails.opponent.tag.replace('#', '%23');
          const opponentWarLog = await APIClashService.getWarLog(opponentTag).catch(() => {
            console.error("Error al obtener el registro de guerra del clan");
            return { items: [] };
          });
          const clanWarLogSummary = getWarSummary(opponentWarLog);
          const fullDetails = [
            { ...currentWarDetails.clan, members: clanDetails },
            { ...currentWarDetails.opponent, members: opponentDetails, warLog: clanWarLogSummary },
          ];

          console.log('Full War Details (Normal War):', fullDetails);
          setFullWarDetails(fullDetails);
        }
      } catch (error) {
        console.error('Error loading war data:', error);
        setFullWarDetails(null);
      }
    };

    const enrichMembersWithDetails = async (members: any[]): Promise<any[]> => {
      return Promise.all(
        members.map(async (member: any) => {
          const formattedTag = member.tag.replace('#', '%23');
          const playerInfo = await APIClashService.getPlayerInfo(formattedTag);
          return { ...member, playerInfo };
        })
      );
    };

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

    loadData();
    fetchWarSaves();
  }, [clanTag]);

  const translateHero = (heroName: keyof typeof heroTranslations) => {
    return heroTranslations[heroName] || heroName;
  };

  const getUniqueHeroes = (members: any[]): string[] => {
    const heroSet = new Set<string>();
    members.forEach((member: { playerInfo: { heroes: any[]; }; }) => {
      if (member.playerInfo?.heroes) {
        member.playerInfo.heroes
          .filter((hero: { village: string; }) => hero.village === 'home')
          .forEach((hero: { name: any; }) => heroSet.add(hero.name));
      }
    });
    return Array.from(heroSet);
  };
  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      // Handle custom date format like "20250427T210544.000Z"
      const year = isoDate.substring(0, 4);
      const month = parseInt(isoDate.substring(4, 6), 10) - 1; // Months are 0-indexed
      const day = parseInt(isoDate.substring(6, 8), 10);
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      return `${day} de ${months[month]} de ${year}`;
    }
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${day} de ${months[month]} de ${year}`;
  };
  const getClanSummary = (members: any[]) => {
    const totalTownHallLevels = members.reduce((sum: any, member: { playerInfo: { townHallLevel: any; }; }) => sum + (member.playerInfo.townHallLevel || 0), 0);
    const averageTownHallLevel = members.length ? parseFloat((totalTownHallLevels / members.length).toFixed(2)) : 0;

    const heroAverages: { [key: string]: number } = {};
    const heroCounts: { [key: string]: number } = {};

    members.forEach((member: { playerInfo: { heroes: any[]; }; }) => {
      if (member.playerInfo?.heroes) {
        member.playerInfo.heroes
          .filter((hero: { village: string; }) => hero.village === 'home')
          .forEach((hero: { name: string | number; level: any; }) => {
            if (!heroAverages[hero.name]) {
              heroAverages[hero.name] = 0;
              heroCounts[hero.name] = 0;
            }
            heroAverages[hero.name] += hero.level;
            heroCounts[hero.name]++;
          });
      }
    });

    Object.keys(heroAverages).forEach((heroName) => {
      heroAverages[heroName] = heroCounts[heroName]
        ? parseFloat((heroAverages[heroName] / heroCounts[heroName]).toFixed(2))
        : 0;
    });

    return { averageTownHallLevel, heroAverages };
  };

  const getSortedClans = (clans: any[]) => {
    return clans.sort((a: { members: any; }, b: { members: any; }) => {
      const avgA = getClanSummary(a.members).averageTownHallLevel;
      const avgB = getClanSummary(b.members).averageTownHallLevel;
      return avgB - avgA;
    });
  };

  function parseCustomDate(dateStr: string) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(9, 11);
    const minute = dateStr.substring(11, 13);
    const second = dateStr.substring(13, 15);
    return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
  }

  const getWarSummary = (warLog: any) => {
    if (!warLog || !warLog.items) {
      return {
        totalWars: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        maxWinStreak: 0,
        maxLossStreak: 0,
        significantWins: 0,
        significantLosses: 0,
      };
    }
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 60);
    const recentWars = warLog.items.filter((war: any) => {
      const parsedDateStr = parseCustomDate(war.endTime);
      const warEndTime = new Date(parsedDateStr);
      return warEndTime > thirtyDaysAgo;
    });

    let winStreak = 0;
    let maxWinStreak = 0;
    let lossStreak = 0;
    let maxLossStreak = 0;

    const warSummaries = recentWars.map((war: any) => {
      const isWin = war.result === "win";
      const isLoss = war.result === "lose";
      const margin = Math.abs(war.clan.stars - war.opponent.stars);

      if (isWin) {
        winStreak++;
        lossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, winStreak);
      } else if (isLoss) {
        lossStreak++;
        winStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, lossStreak);
      }

      return {
        result: war.result,
        margin,
        significant: margin >= 10,
      };
    });

    return {
      totalWars: recentWars.length,
      wins: warSummaries.filter((war: any) => war.result === "win").length,
      losses: warSummaries.filter((war: any) => war.result === "lose").length,
      ties: warSummaries.filter((war: any) => war.result === "tie").length,
      maxWinStreak,
      maxLossStreak,
      significantWins: warSummaries.filter((war: any) => war.result === "win" && war.significant).length,
      significantLosses: warSummaries.filter((war: any) => war.result === "lose" && war.significant).length,
    };
  };

  const switchToMainClan = () => setClanTag('%232QL0GCQGQ');
  const switchToSecondaryClan = () => setClanTag('%232RG9R9JVP');

  const formatWarDate = (fileName: string): string => {
    const cleanFileName = fileName.replace('.json', ''); // Remove .json extension
    const parts = cleanFileName.split('_');
    const type = parts[0] === 'war' ? 'guerra' : 'liga'; // Determine type based on prefix
    const datePart = parts[2].split('T')[0]; // Extract the date part
    const [year, month, day] = datePart.split('-');
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${parseInt(day)} de ${months[parseInt(month) - 1]} ${year} (${type})`;
  };

  const handleWarChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFileName = event.target.value;
    const war = warSaves.find((w) => w.fileName === selectedFileName);
    setSelectedWar(war);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1 className="animate__animated animate__backInDown" style={{ marginBottom: '20px', color: '#ffcc00' }}>
        Información de Guerra
      </h1>
      <p style={{ marginBottom: '20px', fontSize: '16px', lineHeight: '1.5' }}>
        En esta ventana se consultarán todos los clanes de una guerra o liga, obteniendo la media del nivel de héroes y ayuntamiento de cada jugador. Se buscarán los registros de guerra del clan en los últimos 60 días y se compararán con los de nuestro clan para mostrar la diferencia de nivel.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('currentWar')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'currentWar' ? '2px solid violet' : 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'currentWar' ? 'bold' : 'normal',
          }}
        >
          Estado de Guerra Actual
        </button>
        <button
          onClick={() => setActiveTab('warLogs')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'warLogs' ? '2px solid violet' : 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'warLogs' ? 'bold' : 'normal',
          }}
        >
          Registros de Guerras Pasadas
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'currentWar' && (
        <div className="animate__animated animate__backInLeft" id="war-info-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {fullWarDetails ? (
            getSortedClans(fullWarDetails).map((clan: { tag: React.Key | null | undefined; name: string; members: any; warLog?: any; }) => (
              <div
                key={clan.tag}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '15px',
                  backgroundColor: '#333',
                  color: '#fff',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                }}
              >
                <h2 style={{ color: '#ffcc00', marginBottom: '10px' }}>
                  {clan.name}
                  {clan.tag !== clanTag.replace('%23', '#') && ' (Clan Enemigo)'}
                </h2>
                {clan.warLog && clan.warLog.totalWars > 0 && (
                  <div
                    style={{
                      marginBottom: '10px',
                      border: `2px solid ${clan.warLog.wins < clan.warLog.losses
                          ? 'green'
                          : clan.warLog.wins > clan.warLog.losses
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
                        ([hero, avgLevel]) =>
                          parseFloat(
                            (getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0
                            ).toFixed(2)) >
                          parseFloat(avgLevel.toFixed(2))
                      ).length >
                          Object.entries(getClanSummary(clan.members).heroAverages).filter(
                            ([hero, avgLevel]) =>
                              parseFloat(
                                (getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0
                                ).toFixed(2)) <
                              parseFloat(avgLevel.toFixed(2))
                          ).length
                          ? 'green'
                          : Object.entries(getClanSummary(clan.members).heroAverages).filter(
                            ([hero, avgLevel]) =>
                              parseFloat(
                                (getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0
                                ).toFixed(2)) <
                              parseFloat(avgLevel.toFixed(2))
                          ).length >
                            Object.entries(getClanSummary(clan.members).heroAverages).filter(
                              ([hero, avgLevel]) =>
                                parseFloat(
                                  (getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0
                                  ).toFixed(2)) >
                                parseFloat(avgLevel.toFixed(2))
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
                            ([hero, avgLevel]) =>
                              parseFloat(
                                (getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0
                                ).toFixed(2)) >
                              parseFloat(avgLevel.toFixed(2))
                          ).length >
                            Object.entries(getClanSummary(clan.members).heroAverages).filter(
                              ([hero, avgLevel]) =>
                                parseFloat(
                                  (getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0
                                  ).toFixed(2)) <
                                parseFloat(avgLevel.toFixed(2))
                            ).length
                            ? 'green'
                            : Object.entries(getClanSummary(clan.members).heroAverages).filter(
                              ([hero, avgLevel]) =>
                                parseFloat(
                                  (getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0
                                  ).toFixed(2)) <
                                parseFloat(avgLevel.toFixed(2))
                            ).length >
                              Object.entries(getClanSummary(clan.members).heroAverages).filter(
                                ([hero, avgLevel]) =>
                                  parseFloat(
                                    (getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0
                                    ).toFixed(2)) >
                                  parseFloat(avgLevel.toFixed(2))
                              ).length
                              ? 'red'
                              : 'violet',
                      }}
                    >
                      Resumen de diferencias de nivel de héroes y ayuntamiento
                    </h5>
                    {Object.entries(getClanSummary(clan.members).heroAverages).map(([hero, avgLevel]) => {
                      const mainClanHeroLevel = parseFloat((getClanSummary(fullWarDetails?.find(c => c.tag === clanTag.replace('%23', '#'))?.members || []).heroAverages[hero] || 0).toFixed(2));
                      const roundedAvgLevel = parseFloat(avgLevel.toFixed(2));
                      const levelDifference = parseFloat((mainClanHeroLevel - roundedAvgLevel).toFixed(2));
                      let comparisonText = '';
                      let comparisonColor = '';

                      if (levelDifference > 0) {
                        comparisonText = `Nuestro clan tiene un nivel superior en ${translateHero(hero as keyof typeof heroTranslations)} por ${Math.abs(levelDifference)}`;
                        comparisonColor = 'green';
                      } else if (levelDifference < 0) {
                        comparisonText = `Nuestro clan tiene un nivel inferior en ${translateHero(hero as keyof typeof heroTranslations)} por ${Math.abs(levelDifference)}`;
                        comparisonColor = 'red';
                      } else {
                        comparisonText = `Nuestro clan tiene el mismo nivel en ${translateHero(hero as keyof typeof heroTranslations)}`;
                        comparisonColor = 'gray';
                      }

                      return (
                        <p key={hero} style={{ color: comparisonColor, margin: '5px 0' }}>
                          {comparisonText}
                        </p>
                      );
                    })}
                    {(() => {
                      const mainClanTHLevel = parseFloat(getClanSummary(fullWarDetails?.find(c => c.name === clanTag.replace('%23', '#'))?.members || []).averageTownHallLevel.toFixed(2));
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
                        {translateHero(hero as keyof typeof heroTranslations)}: {getClanSummary(clan.members).heroAverages[hero] || 'N/A'}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#ff0000', fontWeight: 'bold' }}>No hay guerra activa en este momento.</p>
          )}
        </div>
      )}

      {activeTab === 'warLogs' && (
        <div style={{ marginTop: '20px' }}>
          <h2>Registros de Guerras Pasadas</h2>
          <p>Selecciona un registro de guerra para ver los detalles.</p>
          {loadingWarSaves ? (
            <p>Cargando registros de guerras...</p>
          ) : (
            <select
              id="war-select"
              value={selectedWar?.fileName || ''}
              onChange={handleWarChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '16px',
                marginBottom: '20px',
              }}
            >
              <option value="" disabled>
                Seleccione una guerra
              </option>
              {warSaves.map((war, index) => (
                <option key={index} value={war.fileName}>
                  {formatWarDate(war.fileName)}
                </option>
              ))}
            </select>
          )}
          {selectedWar && (
            <div style={{ marginTop: '20px', textAlign: 'left', width: '100%' }}>
              <h3>Detalles del Registro Seleccionado</h3>
              <p><strong>Fecha:</strong> {formatDate(selectedWar.content.startTime)}</p>
              <p>
                <strong style={{ fontSize: '22px' }}>
                  {selectedWar.content.clan.name}: {selectedWar.content.clan.stars} <Star size={16} style={{ marginRight: '5px' }} /> - {selectedWar.content.clan.destructionPercentage}%
                </strong>
              </p>
              <p>
                <strong style={{ fontSize: '22px' }}>
                  {selectedWar.content.opponent.name}: {selectedWar.content.opponent.stars} <Star size={16} style={{ marginRight: '5px' }} /> - {selectedWar.content.opponent.destructionPercentage}%
                </strong>
              </p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'violet' }}>
                Resultado: {evaluateWarResult(selectedWar)}
              </p>
              <div style={{ marginTop: '20px' }}>
                <h3>Ataques Guardados</h3>
                {savedAttacks.filter((attack) => attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)).length > 0 ? (
                  <div>
                    {/* Group attacks by stars */}
                    {['1', '2', '3'].map((starCount) => (
                      <div key={starCount} style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: 'violet', fontSize: '24px', fontWeight: 'bold' }}>
                          Ataques de {starCount} Estrella{starCount === '1' ? '' : 's'}
                        </h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                          {savedAttacks
                            .filter(
                              (attack) =>
                                attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName) &&
                                attack.stars === parseInt(starCount)
                            )
                            .map((attack, index) => (
                              <div
                                key={index}
                                style={{
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  padding: '15px',
                                  backgroundColor: '#333',
                                  color: '#fff',
                                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                  width: '300px',
                                }}
                              >
                                <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>
                                  <Star size={16} style={{ marginRight: '5px' }} />
                                  {attack.member}
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                  <li style={{ marginBottom: '5px' }}>
                                    <strong>Ataque:</strong> {attack.attack}
                                  </li>
                                  <li style={{ marginBottom: '5px' }}>
                                    <strong>
                                      <Star size={16} style={{ marginRight: '5px' }} />
                                      Porcentaje:
                                    </strong>{' '}
                                    {attack.percentage}%
                                  </li>
                                  <li style={{ marginBottom: '5px' }}>
                                    <strong>
                                      <Star size={16} style={{ marginRight: '5px' }} />
                                      Estrellas:
                                    </strong>{' '}
                                    {attack.stars}
                                  </li>
                                  <li style={{ marginBottom: '5px' }}>
                                    <strong>Fecha:</strong> {new Date(attack.timestamp).toLocaleString()}
                                  </li>
                                  <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                    <strong>TH Rival:</strong> {attack.thRival}
                                  </li>
                                  <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                    <strong>TH Miembro:</strong> {attack.memberThLevel}
                                  </li>
                                  {attack.description && (
                                    <li style={{ marginBottom: '5px' }}>
                                      <strong>Descripción:</strong> {attack.description}
                                    </li>
                                  )}
                                </ul>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No hay ataques guardados disponibles para esta guerra.</p>
                )}
              </div>
              <div style={{ marginTop: '20px' }}>
                <h3>Jugadores que no atacaron</h3>
                {selectedWar.content.clan.members ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {getPlayersWhoDidNotAttack(
                      selectedWar.content.clan.members,
                      savedAttacks.filter((attack) => attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)),
                      selectedWar.content.attacksPerMember
                    ).map((member: any, index: number) => (
                      <li key={index} style={{ marginBottom: '10px', color: 'red' }}>
                        {member.name} - Faltan {member.attacksMissing} ataque(s)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay información de los miembros del clan.</p>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default WarInfoPage;
