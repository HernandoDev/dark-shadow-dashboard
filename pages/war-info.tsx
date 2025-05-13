import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';
import { Button } from '@nextui-org/react';
import { FaStar, FaTrophy, FaTimesCircle } from 'react-icons/fa';
import { Calendar, Info, Percent, Shield, Star, Target, User } from 'react-feather';
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
  const state = selectedWar.content.state;

  if (state === "preparation") {
    return "La guerra está en preparación. No se pueden realizar cálculos.";
  } else {
    const clanTag = getClanTag().replace('%23', '#'); // Formatear el clanTag
    const isMainClan = selectedWar.content.clan.tag === clanTag;

    const mainClan = isMainClan ? selectedWar.content.clan : selectedWar.content.opponent;
    const opponentClan = isMainClan ? selectedWar.content.opponent : selectedWar.content.clan;

    if (mainClan.stars > opponentClan.stars) {
      return "Ganamos la guerra";
    } else if (mainClan.stars < opponentClan.stars) {
      return "Perdimos la guerra";
    } else {
      // Empate: comparar porcentaje de destrucción
      if (mainClan.destructionPercentage > opponentClan.destructionPercentage) {
        return "Ganamos la guerra";
      } else if (mainClan.destructionPercentage < opponentClan.destructionPercentage) {
        return "Perdimos la guerra";
      } else {
        return "La guerra terminó en empate";
      }
    }
  }
};

const extractTimestampFromFileName = (fileName: string): string => {
  ;
  const parts = fileName.replace('.json', '').split('_'); // Remove .json and split by '_'

  if (parts[0] === 'war') {
    // Formato: war_%232QL0GCQGQ_2025-04-30
    return parts[2]; // El timestamp está en la tercera posición
  } else if (parts[0] === 'liga' && parts[1] === 'war') {
    // Formato: liga_war_%232RUU8RYCY_#8P99UYU8R_2025-05-02
    return parts[4]; // El timestamp está en la quinta posición
  } else {
    throw new Error('Formato de archivo no reconocido');
  }
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

const generateWarMessage = (warDetails: any) => {
  if (!warDetails) return '';

  const clanTag = getClanTag().replace('%23', '#'); // Get your clan's tag
  const myClan = warDetails.clan.tag === clanTag ? warDetails.clan : warDetails.opponent; // Determine your clan
  const targetClan = warDetails.clan.tag === clanTag ? warDetails.opponent : warDetails.clan; // Determine the opponent clan

  if (!myClan) return 'No se encontró información de tu clan.';

  const starsGroup: { [key: number]: string[] } = { 3: [], 2: [], 1: [] };
  const noAttack: string[] = [];

  myClan.members.forEach((member: any) => {
    if (member.attacks && member.attacks.length > 0) {
      member.attacks.forEach((attack: any) => {
        const stars = (attack.stars || 0) as 1 | 2 | 3;

        // Find the target clan and member by searching for the defenderTag
        const targetClanName = targetClan ? targetClan.name : 'Desconocido';
        const playerEnemy = targetClan?.members.find((m: any) => m.tag === attack.defenderTag);

        if (playerEnemy) {
          const comparisonEmoji =
            member.mapPosition < playerEnemy.mapPosition
              ? '⬇️(num. Inferior)' // Green arrow for higher-ranked
              : member.mapPosition > playerEnemy.mapPosition
                ? '⬆️(num. Superior)' // Red arrow for lower-ranked
                : '🪞(Espejo)'; // Equals sign for equal rank
          const ownInfo = `*${member.mapPosition}. ${member.name} (TH${member.townhallLevel})`;
          const enemyInfo = `${playerEnemy.mapPosition}. ${playerEnemy.name} (TH${playerEnemy.townhallLevel})`;
          const warning = member.townhallLevel < playerEnemy.townhallLevel ? ' ⚠️ TH superior' : '';

          const message = `${ownInfo} VERSUS→ ${enemyInfo} | El rival era ${comparisonEmoji} ${warning}`;

          starsGroup[stars]?.push(message);
        }
      });
      if (member.attacks.length === 1) {
        const attacksPerMember = warDetails.attacksPerMember || 1 // Default to 2 attacks per member if not provided
        const attacksMissing = attacksPerMember - (member.attacks?.length || 0);
        if (attacksMissing > 0) {
          noAttack.push(`* ${member.mapPosition}. ${member.name} → ${attacksMissing} ataque(s)`);
        }
      }
    } else {

      const attacksPerMember = warDetails.attacksPerMember || 1; // Default to 2 attacks per member if not provided
      const attacksMissing = attacksPerMember - (member.attacks?.length || 0);
      noAttack.push(`* ${member.mapPosition}. ${member.name} →  ${attacksMissing} ataque(s)`);
    }
  });

  return `
📢 Estado de la guerra: ${myClan.status || 'Desconocido'}
🌟🌟🌟
${starsGroup[3].join('\n') || 'Ningún ataque de 3 estrellas'}

🌟🌟
${starsGroup[2].join('\n') || 'Ningún ataque de 2 estrellas'}

🌟
${starsGroup[1].join('\n') || 'Ningún ataque de 1 estrella'}

❌
${noAttack.join('\n') || 'Todos atacaron'}
  `;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Texto copiado al portapapeles:', text);

  });
};

const deleteAttack = async (attackId: string) => {
  try {
    const result = await APIClashService.deleteAttack(attackId);
    if (result) {
      window.location.reload(); // Reload the page to reflect the changes
      console.log(`Attack with ID ${attackId} deleted successfully.`);

    } else {
      console.error(`Failed to delete attack with ID ${attackId}.`);
    }
  } catch (error) {
    console.error(`Error deleting attack with ID ${attackId}:`, error);
  }
};

interface ClanMember {
  tag: string;
  name: string;
  townhallLevel: number;
  mapPosition: number;
  attacks?: Attack[];
}

interface Attack {
  stars: number;
  destructionPercentage: number;
  defenderTag: string;
}

const WarInfoPage = () => {
  const [clanTag, setClanTag] = useState('%232QL0GCQGQ');
  const [fullWarDetails, setFullWarDetails] = useState<any[] | null>(null);
  const [activeTab, setActiveTab] = useState<'currentWar' | 'warLogs' | 'MensajeGuerra'>('MensajeGuerra');
  const [warSaves, setWarSaves] = useState<any[]>([]); // State to store war saves
  const [loadingWarSaves, setLoadingWarSaves] = useState(false); // State to track loading status
  const [selectedWar, setSelectedWar] = useState<any>(null); // State to store the selected war
  const [savedAttacks, setSavedAttacks] = useState<any[]>([]);
  const [customMessage, setCustomMessage] = useState<string>(''); // State for the custom message
  const [includeThreeStars, setIncludeThreeStars] = useState(true);
  const [includeTwoStars, setIncludeTwoStars] = useState(true);
  const [includeOneStar, setIncludeOneStar] = useState(true);
  const [includeMissingAttacks, setIncludeMissingAttacks] = useState(true);
  const [includeOneMissingAttack, setIncludeOneMissingAttack] = useState(false);
  const [includeTwoMissingAttacks, setIncludeTwoMissingAttacks] = useState(false);
  const [filterPlayerName, setFilterPlayerName] = useState<string>(''); // State for filtering attacks by player name
  const [currentWarDetails, setcurrentWarDetails] = useState<any>({}); // State for filtering attacks by player name
  const [warLeageSaves, setWarLeageSaves] = useState<any[]>([]); // State to store war saves

  const [LeageGroupsSaves, setLeageGroupsSaves] = useState<any[]>([]); // State to store war saves
  const [showSavedAttacks, setShowSavedAttacks] = useState(false); // State for collapsible saved attacks section
  const [showWarMap, setShowWarMap] = useState(false); // State for collapsible war map section

  useEffect(() => {
      const loadData = async () => {
        try {
          if (activeTab === 'currentWar') {
            const clanWarLeagueGroupDetails = await APIClashService.getClanWarLeagueGroup();
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
            }
          } else {
            const currentWarDetails = await APIClashService.getClanCurrentWar();
            setcurrentWarDetails(currentWarDetails);
            
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

      loadData();
  }, [activeTab]);

  useEffect(() => {
    fetchSavedAttacks()
      .then((data) => setSavedAttacks(Array.isArray(data) ? data : [])) // Ensure savedAttacks is always an array
      .catch((error) => {
        console.error('Error al obtener los ataques guardados:', error);
        console.log('Hubo un error al obtener los ataques guardados.');
      })
    const fetchWarSaves = async () => {
      setLoadingWarSaves(true);
      try {
        const response = await APIClashService.getWarSaves();
        setWarLeageSaves(response.leagueWars || []); // Assuming response contains the league wars
        setLeageGroupsSaves(response.leagueGroups || []); // Assuming response contains the league groups
        setWarSaves(response.normalWars || []); // Set the war saves to the state
      } catch (error) {
        console.error('Error fetching war saves:', error);
      } finally {
        setLoadingWarSaves(false);
      }
    };

    fetchWarSaves();
  }, [clanTag]);

  useEffect(() => {
    if (!warSaves || warSaves.length === 0) return;

    // Get the latest save
    const latestSave = warSaves[warSaves.length - 1];
    const state = latestSave.content.state;
    const now = new Date();

    if (state === "preparation") {
      // Deselect all checkboxes
      setIncludeThreeStars(false);
      setIncludeTwoStars(false);
      setIncludeOneStar(false);
      setIncludeMissingAttacks(false);
      setIncludeOneMissingAttack(false);
      setIncludeTwoMissingAttacks(false);
    } else if (state === "inWar") {
      const battleEndTime = new Date(
        `${latestSave.content.endTime.substring(0, 4)}-${latestSave.content.endTime.substring(4, 6)}-${latestSave.content.endTime.substring(6, 8)}T${latestSave.content.endTime.substring(9, 11)}:${latestSave.content.endTime.substring(11, 13)}:${latestSave.content.endTime.substring(13, 15)}.000Z`
      );
      const timeRemaining = Math.max(0, battleEndTime.getTime() - now.getTime());
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

      if (hoursRemaining > 12) {
        // Select all checkboxes
        setIncludeThreeStars(true);
        setIncludeTwoStars(true);
        setIncludeOneStar(true);
        setIncludeMissingAttacks(true);
        setIncludeTwoMissingAttacks(true);
        setIncludeOneMissingAttack(false);
      } else {
        // Select all except "Incluir jugadores con 2 ataques faltantes"
        setIncludeThreeStars(true);
        setIncludeTwoStars(true);
        setIncludeOneStar(true);
        setIncludeMissingAttacks(true);
        setIncludeOneMissingAttack(false);
        setIncludeTwoMissingAttacks(false);
      }
    }
  }, [warSaves]);

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


  const formatWarDate = (fileName: string): string => {
    ;
    const cleanFileName = fileName.replace('.json', ''); // Remove .json extension
    const parts = cleanFileName.split('_');

    // Determine the type based on the prefix
    let type = '';
    if (parts[0] === 'war') {
      type = 'guerra';
    } else if (parts[0] === 'liga' && parts[1] === 'war') {
      type = 'liga';
    } else {
      return 'Formato de archivo no válido';
    }

    // Handle different formats for the date part
    let datePart = parts[parts.length - 1]; // The date is always the last part
    if (datePart.includes('T')) {
      datePart = datePart.split('T')[0]; // Extract the date part if it contains a timestamp
    }

    const dateParts = datePart.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2] || '01'; // Default to the first day of the month if no day is provided

    if (!year || !month) {
      return 'Fecha no válida';
    }

    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year} (${type})`;
  };

  const handleWarChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFileName = event.target.value;
    let war = warSaves.find((w) => w.fileName === selectedFileName);
    if (!war) {
      war = warLeageSaves.find((w) => w.fileName === selectedFileName);
    }
    setSelectedWar(war);
  };

  const handleCustomMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomMessage(event.target.value);
  };

  const generateFilteredWarMessage = (warDetails: any) => {
    let latestSave;
    // Obtener el último guardado considerando el estado "preparation"
    if (currentWarDetails && Object.keys(currentWarDetails).length > 0) {
      latestSave = currentWarDetails;
    } else {
      // Obtener el más reciente desde warLeageSaves
      const lastSave = warLeageSaves[warLeageSaves.length - 1]?.content;

      // Si el estado es "preparation", buscar el archivo anterior
      if (lastSave && lastSave.state === "preparation") {
        const previousSave = warLeageSaves[warLeageSaves.length - 2]?.content;
        if (previousSave) {
          latestSave = previousSave;
        } else {
          latestSave = lastSave; // Si no hay un archivo anterior, usar el más reciente
        }
      } else {
        latestSave = lastSave;
      }
    }

    if (!latestSave) {
      return "No hay información disponible para generar el mensaje.";
    }

    const state = latestSave.state;
    const now = new Date();

    let additionalInfo = '';

    if (state === "preparation") {
      const preparationEndTime = new Date(
        `${latestSave.startTime.substring(0, 4)}-${latestSave.startTime.substring(4, 6)}-${latestSave.startTime.substring(6, 8)}T${latestSave.startTime.substring(9, 11)}:${latestSave.startTime.substring(11, 13)}:${latestSave.startTime.substring(13, 15)}.000Z`
      );
      const timeRemaining = Math.max(0, preparationEndTime.getTime() - now.getTime());
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      additionalInfo = `La guerra está en preparación. Tiempo restante: ${hours} horas y ${minutes} minutos.`;
    } else if (state === "inWar") {
      const battleEndTime = new Date(
        `${latestSave.endTime.substring(0, 4)}-${latestSave.endTime.substring(4, 6)}-${latestSave.endTime.substring(6, 8)}T${latestSave.endTime.substring(9, 11)}:${latestSave.endTime.substring(11, 13)}:${latestSave.endTime.substring(13, 15)}.000Z`
      );
      const timeRemaining = Math.max(0, battleEndTime.getTime() - now.getTime());
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

      const clanTag = getClanTag().replace('%23', '#');
      const isMainClan = latestSave.clan.tag === clanTag;

      const mainClan = isMainClan ? latestSave.clan : latestSave.opponent;
      const opponentClan = isMainClan ? latestSave.opponent : latestSave.clan;

      if (mainClan.stars > opponentClan.stars) {
        additionalInfo = `🎉 ¡Vamos ganando la guerra! 🏆\n\nNuestro clan tiene más estrellas (${mainClan.stars}🌟) que el oponente (${opponentClan.stars}🌟).\n\n⏳ Tiempo restante: ${hours} horas y ${minutes} minutos.`;
      } else if (mainClan.stars < opponentClan.stars) {
        additionalInfo = `😔 Vamos perdiendo la guerra. 💔\nEl clan oponente tiene más estrellas (${opponentClan.stars}🌟) que nosotros (${mainClan.stars}🌟).\n\n⏳ Tiempo restante: ${hours} horas y ${minutes} minutos.`;
      } else {
        if (mainClan.destructionPercentage > opponentClan.destructionPercentage) {
          additionalInfo = `⚔️ ¡Empate en estrellas, pero vamos ganando por porcentaje! 🎯\n\nNuestro porcentaje de destrucción (${mainClan.destructionPercentage}%) es mayor que el del oponente (${opponentClan.destructionPercentage}%).\n\n⏳ Tiempo restante: ${hours} horas y ${minutes} minutos.`;
        } else if (mainClan.destructionPercentage < opponentClan.destructionPercentage) {
          additionalInfo = `⚔️ ¡Empate en estrellas, pero vamos perdiendo por porcentaje! 😓\n\nEl porcentaje de destrucción del oponente (${opponentClan.destructionPercentage}%) es mayor que el nuestro (${mainClan.destructionPercentage}%).\n\n⏳ Tiempo restante: ${hours} horas y ${minutes} minutos.`;
        } else {
          additionalInfo = `🤝 La guerra está completamente empatada. 😮\n\nAmbos clanes tienen las mismas estrellas (${mainClan.stars}🌟) y el mismo porcentaje de destrucción (${mainClan.destructionPercentage}%).\n\n⏳ Tiempo restante: ${hours} horas y ${minutes} minutos.`;
        }
      }
    }

    const fullMessage = generateWarMessage(latestSave);
    const sections = fullMessage.split('🌟🌟🌟');

    const threeStarsSection = sections[1]?.split('🌟🌟')[0]?.trim() || '';
    const twoStarsSection = sections[1]?.split('🌟🌟')[1]?.split('🌟')[0]?.trim() || '';
    const oneStarSection = sections[1]?.split('🌟🌟')[1]?.split('🌟')[1]?.split('❌')[0]?.trim() || '';
    const missingAttacksSection = sections[1]?.split('🌟🌟')[1]?.split('🌟')[1]?.split('❌')[1]?.trim() || '';

    let filteredMissingAttacksSection = missingAttacksSection;
    if (includeOneMissingAttack) {
      filteredMissingAttacksSection = filteredMissingAttacksSection
        .split('\n')
        .filter((line) => line.includes('Faltan 1 ataque'))
        .join('\n');
    }

    if (includeTwoMissingAttacks) {
      filteredMissingAttacksSection = filteredMissingAttacksSection
        .split('\n')
        .filter((line) => line.includes('Faltan 2 ataque'))
        .join('\n');
    }

    const totalMissingAttacks = (filteredMissingAttacksSection.match(/Faltan \d+ ataque/g) || [])
      .map((line) => parseInt(line.match(/\d+/)?.[0] || '0'))
      .reduce((sum, count) => sum + count, 0);

    const totalPlayersWithMissingAttacks = (filteredMissingAttacksSection.match(/\n/g) || []).length;

    return `
  ${additionalInfo}
  
  ${includeThreeStars ? `🌟🌟🌟 3 Estrellas (🎉 Felicidades 🎉)\n${threeStarsSection}` : ''}
  ${includeTwoStars ? `\n🌟🌟 2 Estrellas (⚔️ Aceptable ⚔️)\n${twoStarsSection}` : ''}
  ${includeOneStar ? `\n🌟 1 Estrella  (❌No aceptable❌)\n${oneStarSection}` : ''}
  ${includeMissingAttacks ? `\n❌PERSONAS QUE NO HAN ATACADO AÚN\n Total de personas con ataques pendientes: ${totalPlayersWithMissingAttacks + 1}\n\n${filteredMissingAttacksSection}*\n\n` : ''}
    `.trim();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1 className="animate__animated animate__backInDown neonText" style={{ marginBottom: '20px' }}>
        Información de Guerra
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
        <button
          className={`tabButton ${activeTab === 'currentWar' ? 'active' : ''}`}
          onClick={() => setActiveTab('currentWar')}
        >
          <span>Comparar clanes</span>
          <div className="top"></div>
          <div className="left"></div>
          <div className="bottom"></div>
          <div className="right"></div>
        </button>
        <button
          className={`tabButton ${activeTab === 'MensajeGuerra' ? 'active' : ''}`}
          onClick={() => setActiveTab('MensajeGuerra')}
        >
          <span> Mensaje de Guerra</span>
          <div className="top"></div>
          <div className="left"></div>
          <div className="bottom"></div>
          <div className="right"></div>
        </button>
        <button
          className={`tabButton ${activeTab === 'warLogs' ? 'active' : ''}`}
          onClick={() => setActiveTab('warLogs')}
        >
          <span>  Registros de Guerras Pasadas</span>
          <div className="top"></div>
          <div className="left"></div>
          <div className="bottom"></div>
          <div className="right"></div>
        </button>
      </div>
      <br />
      {activeTab === 'currentWar' && (

        <p style={{ marginBottom: '20px', fontSize: '16px', lineHeight: '1.5' }}>
          En esta ventana se consultarán todos los clanes de una guerra o liga, obteniendo la media del nivel de héroes y ayuntamiento de cada jugador.<br />Se buscarán los registros de guerra del clan en los últimos 60 días y se compararán con los de nuestro clan para mostrar la diferencia de nivel.
        </p>
      )}
      {activeTab === 'MensajeGuerra' && (
        <p style={{ marginBottom: '20px', fontSize: '16px', lineHeight: '1.5' }}>
          En esta ventana se generará un mensaje de guerra para enviar al clan, mostrando el estado de la guerra y los ataques realizados por cada jugador. <br /> Usa los filtros para personalizar el mensaje según tus preferencias. <br /><br /> Puedes copiar el mensaje generado al portapapeles para compartirlo fácilmente.
        </p>
      )}
      {activeTab === 'warLogs' && (
        <p style={{ marginBottom: '20px', fontSize: '16px', lineHeight: '1.5' }}>
          En esta ventana se mostrarán los registros de guerra pasados, permitiendo seleccionar un registro específico para ver los detalles y los ataques.
        </p>
      )}

      {/* Clan Selection Buttons */}
      <br />


      {/* Tab Content */}
      {activeTab === 'currentWar' && (
        <div className="animate__animated animate__backInLeft" id="war-info-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {fullWarDetails ? (
            getSortedClans(fullWarDetails).map((clan: { tag: React.Key | null | undefined; name: string; members: any; warLog?: any; }) => (
              <div
                className="bgblue"
                style={{
                  marginBottom: '10px',
                }}
              >
                <div
                  className="card"
                  style={{
                    textAlign: 'center',
                  }}
                >
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
                        const mainClanHeroLevel2 = getClanSummary(fullWarDetails?.find(c => c.tag === clanTag.replace('%23', '#'))?.members || []);
                        const mainClanTHLevel = mainClanHeroLevel2.averageTownHallLevel
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
              </div>
            ))
          ) : (
            <p style={{ color: '#ff0000', fontWeight: 'bold' }}>No hay guerra activa en este momento.</p>
          )}
        </div>
      )}

      {activeTab === 'MensajeGuerra' && (
        <div
          className="animate__animated animate__fadeIn bgblue card"
          style={{ marginTop: '20px', textAlign: 'left' }}
        >
          <h2>Mensaje de Guerra</h2>
          <div style={{ marginBottom: '10px' }}>
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={includeThreeStars}
                onChange={(e) => setIncludeThreeStars(e.target.checked)}
              />
              <span className="checkmark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                </svg>
              </span>
              <span className="label">Incluir ataques de 3 estrellas</span>
            </label>
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={includeTwoStars}
                onChange={(e) => setIncludeTwoStars(e.target.checked)}
              />
              <span className="checkmark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                </svg>
              </span>
              <span className="label">Incluir ataques de 2 estrellas</span>
            </label>
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={includeOneStar}
                onChange={(e) => setIncludeOneStar(e.target.checked)}
              />
              <span className="checkmark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                </svg>
              </span>
              <span className="label">Incluir ataques de 1 estrella</span>
            </label>
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={includeMissingAttacks}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setIncludeMissingAttacks(isChecked);
                  if (!isChecked) {
                    setIncludeOneMissingAttack(false); // Deselect the second checkbox
                    setIncludeTwoMissingAttacks(false); // Deselect the third checkbox
                  }
                }}
              />
              <span className="checkmark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                </svg>
              </span>
              <span className="label">Incluir ataques faltantes</span>
            </label>
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={includeOneMissingAttack}
                disabled={!includeMissingAttacks} // Disable if the first checkbox is unchecked
                onChange={(e) => {
                  setIncludeOneMissingAttack(e.target.checked);
                  if (e.target.checked) {
                    setIncludeTwoMissingAttacks(false); // Deselect the third checkbox
                  }
                }}
              />
              <span className="checkmark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                </svg>
              </span>
              <span className="label">Solo jugadores con 1 ataque faltante</span>
            </label>
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={includeTwoMissingAttacks}
                disabled={!includeMissingAttacks} // Disable if the first checkbox is unchecked
                onChange={(e) => {
                  setIncludeTwoMissingAttacks(e.target.checked);
                  if (e.target.checked) {
                    setIncludeOneMissingAttack(false); // Deselect the second checkbox
                  }
                }}
              />
              <span className="checkmark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                </svg>
              </span>
              <span className="label">Solo jugadores con 2 ataques faltantes</span>
            </label>
          </div>
          <pre
            style={{
              backgroundColor: '#333',
              padding: '10px',
              borderRadius: '5px',
              overflowX: 'auto',
              fontSize: '14px',
            }}
          >
            {generateFilteredWarMessage(fullWarDetails)}
          </pre>
          <div className='ButtonNeonAnimate'>
            <div className="grid-bg">
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
            </div>
            <div className="button-container">
              <button onClick={() => copyToClipboard(generateFilteredWarMessage(fullWarDetails))} className="hacker-button" data-text=" Copiar Mensaje">
                Copiar Mensaje
                <div className="neon-frame"></div>
                <div className="circuit-traces">
                  <div className="circuit-trace"></div>
                  <div className="circuit-trace"></div>
                  <div className="circuit-trace"></div>
                  <div className="circuit-trace"></div>
                  <div className="circuit-trace"></div>
                </div>
                <div className="code-fragments">
                  <span className="code-fragment">COPIAR</span>
                  <span className="code-fragment">PEGAR</span>
                  <span className="code-fragment">PEGAR</span>
                  <span className="code-fragment">ENVIAR</span>

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
          </div>
          {/* <Button
            className="cyber-button"
            onClick={() => copyToClipboard(generateFilteredWarMessage(fullWarDetails))}
            style={{
              marginTop: '10px',
              backgroundColor: '#007bff',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Copiar Mensaje
          </Button> */}
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
              className='input'

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
              {warLeageSaves.map((war, index) => (
                <option key={index} value={war.fileName}>
                  {formatWarDate(war.fileName)}
                </option>
              ))}
            </select>
          )}
          {selectedWar && (
            <div style={{ marginTop: '20px', textAlign: 'center', width: '100%' }}>
              <h3>Detalles del Registro Seleccionado</h3>
              <p><strong>Fecha:</strong> {formatDate(selectedWar.content.startTime)}</p>
              <p>
                <strong style={{ fontSize: '22px' }}>
                  {selectedWar.content.clan.name}: {selectedWar.content.clan.stars} <Star size={16} style={{ marginRight: '5px' }} /> - {selectedWar.content.clan.destructionPercentage.toFixed(2)}%
                </strong>
              </p>
              <p>
                <strong style={{ fontSize: '22px' }}>
                  {selectedWar.content.opponent.name}: {selectedWar.content.opponent.stars} <Star size={16} style={{ marginRight: '5px' }} /> - {selectedWar.content.opponent.destructionPercentage.toFixed(2)}%
                </strong>
              </p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'violet' }}>
                Resultado: {evaluateWarResult(selectedWar)}
              </p>

              {/* Collapsible War Map Section */}
              <div style={{ marginTop: '20px' }}>
                <h3 onClick={() => setShowWarMap(!showWarMap)} style={{ cursor: 'pointer' }}>
                  Ataques resumidos {showWarMap ? '▲' : '▼'}
                </h3>
                {showWarMap && (
                  <div>
                    <div style={{ marginBottom: '10px' }}>
                      <button
                        onClick={() => {
                          const clanTag = getClanTag().replace('%23', '#');
                          const isMainClan = selectedWar.content.clan.tag === clanTag;
                          const mainClan = isMainClan ? selectedWar.content.clan : selectedWar.content.opponent;
                          mainClan.members.sort((a: ClanMember, b: ClanMember) => {
                            const aStars: number = a.attacks?.reduce((sum: number, attack: Attack) => sum + attack.stars, 0) || 0;
                            const bStars: number = b.attacks?.reduce((sum: number, attack: Attack) => sum + attack.stars, 0) || 0;
                            return bStars - aStars; // Sort by best attacks
                          });
                          setShowWarMap(false); // Force re-render
                          setTimeout(() => setShowWarMap(true), 0);
                        }}
                        style={{ marginRight: '10px' }}
                      >
                        Ordenar por mejores ataques
                      </button>
                      <button
                        onClick={() => {
                          const clanTag = getClanTag().replace('%23', '#');
                          const isMainClan = selectedWar.content.clan.tag === clanTag;
                          const mainClan = isMainClan ? selectedWar.content.clan : selectedWar.content.opponent;
                          mainClan.members.sort((a: ClanMember, b: ClanMember) => {
                            const aStars: number = a.attacks?.reduce((sum: number, attack: Attack) => sum + attack.stars, 0) || 0;
                            const bStars: number = b.attacks?.reduce((sum: number, attack: Attack) => sum + attack.stars, 0) || 0;
                            return aStars - bStars; // Sort by worst attacks
                          });
                          setShowWarMap(false); // Force re-render
                          setTimeout(() => setShowWarMap(true), 0);
                        }}
                      >
                        Ordenar por peores ataques
                      </button>
                    </div>
                    {(() => {
                      const clanTag = getClanTag().replace('%23', '#');
                      const isMainClan = selectedWar.content.clan.tag === clanTag;
                      const mainClan = isMainClan ? selectedWar.content.clan : selectedWar.content.opponent;
                      const opponentClan = isMainClan ? selectedWar.content.opponent : selectedWar.content.clan;

                      return mainClan.attacks > 0 ? (
                        <div>
                          {mainClan.members.map((member: ClanMember, index: number) => (
                            <div key={index} className="bgblue" style={{ marginBottom: '10px' }}>
                              <div className="card">
                                <h4 style={{ color: '#4caf50', marginBottom: '10px' }}>
                                  {member.mapPosition}. {member.name} (TH{member.townhallLevel})
                                </h4>
                                {member.attacks && member.attacks.length > 0 ? (
                                  <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {member.attacks.map((attack: Attack, attackIndex: number) => (
                                      <li key={attackIndex} style={{ marginBottom: '10px' }}>
                                        <p>
                                          <strong>Defensor:</strong>{' '}
                                          {opponentClan.members.find((opponent: ClanMember) => opponent.tag === attack.defenderTag)?.name || 'Desconocido'}
                                        </p>
                                        <p>
                                          <strong>Estrellas:</strong>{' '}
                                          <span style={{ color: attack.stars === 3 ? 'green' : attack.stars === 2 ? 'orange' : 'red' }}>
                                            {attack.stars}
                                          </span>
                                        </p>
                                        <p>
                                          <strong>Porcentaje:</strong> {attack.destructionPercentage}%
                                        </p>
                                        <p>
                                          <strong>TH Rival:</strong>{' '}
                                          <span
                                            style={{
                                              color:
                                                member.townhallLevel <
                                                  opponentClan.members.find((opponent: ClanMember) => opponent.tag === attack.defenderTag)?.townhallLevel
                                                  ? 'red'
                                                  : 'green',
                                            }}
                                          >
                                            {opponentClan.members.find((opponent: ClanMember) => opponent.tag === attack.defenderTag)?.townhallLevel || 'Desconocido'}
                                          </span>
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p style={{ color: 'red' }}>No realizó ataques.</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No hay combates aún.</p>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Collapsible Saved Attacks Section */}
              <div style={{ marginTop: '20px' }}>
                <h3 onClick={() => setShowSavedAttacks(!showSavedAttacks)} style={{ cursor: 'pointer' }}>
                  Ataques Guardados con Ejercito y observaciones {showSavedAttacks ? '▲' : '▼'}
                </h3>
                {showSavedAttacks && (
                  <div>
                    {savedAttacks.filter((attack) => attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)).length > 0 ? (
                      <div>
                        <input
                          className="input"
                          type="text"
                          placeholder="Filtrar por nombre de jugador"
                          value={filterPlayerName}
                          onChange={(e) => setFilterPlayerName(e.target.value)}
                          style={{
                            marginBottom: '20px',
                            padding: '10px',
                            borderRadius: '5px',
                            width: '100%',
                            fontSize: '16px',
                          }}
                        />
                        <div style={{ marginBottom: '20px' }}>
                          <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>Filtros de Ataques</h3>
                          <label className="checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={includeThreeStars}
                              onChange={(e) => setIncludeThreeStars(e.target.checked)}
                            />
                            <span className="checkmark">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                              </svg>
                            </span>
                            <span className="label">Mostrar ataques de 3 estrellas</span>
                          </label>
                          <label className="checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={includeTwoStars}
                              onChange={(e) => setIncludeTwoStars(e.target.checked)}
                            />
                            <span className="checkmark">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                              </svg>
                            </span>
                            <span className="label">Mostrar ataques de 2 estrellas</span>
                          </label>
                          <label className="checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={includeOneStar}
                              onChange={(e) => setIncludeOneStar(e.target.checked)}
                            />
                            <span className="checkmark">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                              </svg>
                            </span>
                            <span className="label">Mostrar ataques de 1 estrella</span>
                          </label>
                          <label className="checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={includeMissingAttacks}
                              onChange={(e) => setIncludeMissingAttacks(e.target.checked)}
                            />
                            <span className="checkmark">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                              </svg>
                            </span>
                            <span className="label">Mostrar jugadores no atacados</span>
                          </label>
                        </div>
                        {includeThreeStars &&
                          savedAttacks.some((attack) => attack.stars === 3 && attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)) && (
                            <div>

                              <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>Ataques de 3 Estrellas</h3>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                {savedAttacks
                                  .filter((attack) => attack.stars === 3 && attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName))
                                  .map((attack, index) => (
                                    <div key={index} className="bgblue" style={{ width: '100%' }}>
                                      <div className="card">

                                        <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '20px' }}>
                                          <User size={16} style={{ marginRight: '5px' }} />
                                          {attack.member}
                                        </h3>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                          <li style={{ marginBottom: '5px' }}>
                                            <strong>
                                              <Target size={16} style={{ marginRight: '5px' }} />
                                              Ataque:
                                            </strong>{' '}
                                            {attack.attack}
                                          </li>
                                          <li style={{ marginBottom: '5px' }}>
                                            <strong>
                                              <Percent size={16} style={{ marginRight: '5px' }} />
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
                                            <strong>
                                              <Calendar size={16} style={{ marginRight: '5px' }} />
                                              Fecha:
                                            </strong>{' '}
                                            {new Date(attack.timestamp).toLocaleString()}
                                          </li>
                                          <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                            <strong>
                                              <Shield size={16} style={{ marginRight: '5px' }} />
                                              TH Rival:
                                            </strong>{' '}
                                            {attack.thRival}
                                          </li>
                                          <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                            <strong>
                                              <Shield size={16} style={{ marginRight: '5px' }} />
                                              TH Miembro:
                                            </strong>{' '}
                                            {attack.memberThLevel}
                                          </li>

                                          {attack.description && (
                                            <li style={{ marginBottom: '5px' }}>
                                              <strong>
                                                <Info size={16} style={{ marginRight: '5px' }} />
                                                Descripción:
                                              </strong>{' '}
                                              {attack.description}
                                            </li>
                                          )}
                                        </ul>
                                        <i
                                          style={{ textAlign: 'right', color: 'red', cursor: 'pointer' }}
                                          className="bi bi-trash"
                                          onDoubleClick={() => deleteAttack(attack.id)}
                                        ></i>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        {includeTwoStars &&
                          savedAttacks.some((attack) => attack.stars === 2 && attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)) && (
                            <div>
                              <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>Ataques de 2 Estrellas</h3>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                {savedAttacks
                                  .filter((attack) => attack.stars === 2 && attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName))
                                  .map((attack, index) => (
                                    <div key={index} className="bgblue" style={{ width: '100%' }}>
                                      <div className="card">
                                        <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '20px' }}>
                                          <User size={16} style={{ marginRight: '5px' }} />
                                          {attack.member}
                                        </h3>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                          <li style={{ marginBottom: '5px' }}>
                                            <strong>
                                              <Target size={16} style={{ marginRight: '5px' }} />
                                              Ataque:
                                            </strong>{' '}
                                            {attack.attack}
                                          </li>
                                          <li style={{ marginBottom: '5px' }}>
                                            <strong>
                                              <Percent size={16} style={{ marginRight: '5px' }} />
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
                                            <strong>
                                              <Calendar size={16} style={{ marginRight: '5px' }} />
                                              Fecha:
                                            </strong>{' '}
                                            {new Date(attack.timestamp).toLocaleString()}
                                          </li>
                                          <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                            <strong>
                                              <Shield size={16} style={{ marginRight: '5px' }} />
                                              TH Rival:
                                            </strong>{' '}
                                            {attack.thRival}
                                          </li>
                                          <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                            <strong>
                                              <Shield size={16} style={{ marginRight: '5px' }} />
                                              TH Miembro:
                                            </strong>{' '}
                                            {attack.memberThLevel}
                                          </li>

                                          {attack.description && (
                                            <li style={{ marginBottom: '5px' }}>
                                              <strong>
                                                <Info size={16} style={{ marginRight: '5px' }} />
                                                Descripción:
                                              </strong>{' '}
                                              {attack.description}
                                            </li>
                                          )}
                                        </ul>
                                        <i
                                          style={{ textAlign: 'right', color: 'red', cursor: 'pointer' }}
                                          className="bi bi-trash"
                                          onDoubleClick={() => deleteAttack(attack.id)}
                                        ></i>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        {includeOneStar &&
                          savedAttacks.some((attack) => attack.stars === 1 && attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)) && (
                            <div>
                              <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>Ataques de 1 Estrella</h3>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                {savedAttacks
                                  .filter((attack) => attack.stars === 1 && attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName))
                                  .map((attack, index) => (
                                    <div key={index} className="bgblue" style={{ width: '100%' }}>
                                      <div className="card">
                                        <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '20px' }}>
                                          <User size={16} style={{ marginRight: '5px' }} />
                                          {attack.member}
                                        </h3>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                          <li style={{ marginBottom: '5px' }}>
                                            <strong>
                                              <Target size={16} style={{ marginRight: '5px' }} />
                                              Ataque:
                                            </strong>{' '}
                                            {attack.attack}
                                          </li>
                                          <li style={{ marginBottom: '5px' }}>
                                            <strong>
                                              <Percent size={16} style={{ marginRight: '5px' }} />
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
                                            <strong>
                                              <Calendar size={16} style={{ marginRight: '5px' }} />
                                              Fecha:
                                            </strong>{' '}
                                            {new Date(attack.timestamp).toLocaleString()}
                                          </li>
                                          <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                            <strong>
                                              <Shield size={16} style={{ marginRight: '5px' }} />
                                              TH Rival:
                                            </strong>{' '}
                                            {attack.thRival}
                                          </li>
                                          <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                            <strong>
                                              <Shield size={16} style={{ marginRight: '5px' }} />
                                              TH Miembro:
                                            </strong>{' '}
                                            {attack.memberThLevel}
                                          </li>

                                          {attack.description && (
                                            <li style={{ marginBottom: '5px' }}>
                                              <strong>
                                                <Info size={16} style={{ marginRight: '5px' }} />
                                                Descripción:
                                              </strong>{' '}
                                              {attack.description}
                                            </li>
                                          )}
                                        </ul>
                                        <i
                                          style={{ textAlign: 'right', color: 'red', cursor: 'pointer' }}
                                          className="bi bi-trash"
                                          onDoubleClick={() => deleteAttack(attack.id)}
                                        ></i>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        {includeMissingAttacks &&
                          getPlayersWhoDidNotAttack(
                            selectedWar.content.clan.members,
                            savedAttacks.filter((attack) => attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)),
                            selectedWar.content.attacksPerMember
                          ).length > 0 && (
                            <div>
                              <h3 style={{ textAlign: 'center', color: 'red', marginBottom: '10px' }}>Jugadores No Atacaron</h3>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                {getPlayersWhoDidNotAttack(
                                  selectedWar.content.clan.members,
                                  savedAttacks.filter((attack) => attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)),
                                  selectedWar.content.attacksPerMember
                                ).map((member, index) => (
                                  <div key={index} className="bgblue" style={{ width: '100%' }}>
                                    <div className="card">
                                      <h3 style={{ textAlign: 'center', color: 'red', marginBottom: '10px' }}>
                                        {member.name} - No atacó
                                      </h3>
                                      <p>Faltan {member.attacksMissing} ataque(s)</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      <p>No hay ataques guardados disponibles para esta guerra.</p>
                    )}
                  </div>
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
