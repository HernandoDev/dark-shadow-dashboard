import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';
import { Button } from '@nextui-org/react';
import { FaStar, FaTrophy, FaTimesCircle } from 'react-icons/fa';
import { Calendar, Info, Percent, Shield, Star, Target, User } from 'react-feather';
import { fetchSavedAttacks } from '../utils/fetchSavedAttacks';
import WarInfoHeader from '../components/war-info/WarInfoHeader';
import WarInfoTabs from '../components/war-info/WarInfoTabs';
import WarInfoSummary from '../components/war-info/WarInfoSummary';
import WarInfoFilters from '../components/war-info/WarInfoFilters';
import WarInfoMessage from '../components/war-info/WarInfoMessage';
import WarLogs from '../components/war-info/WarLogs';
import CurrentWar from '../components/war-info/CurrentWar';
// import * as WarInfoHelpers from '../components/war-info/WarInfoHelpers';

const heroTranslations = {
  "Barbarian King": "Rey Bárbaro",
  "Archer Queen": "Reina Arquera",
  "Grand Warden": "Gran Centinela",
  "Royal Champion": "Campeona Real",
  "Battle Machine": "Máquina Bélica",
  "Minion Prince": "Príncipe Minion",
  "Battle Copter": "Helicóptero de Batalla",
};
var predictMessage = '';
const getClanTag = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('clanTag') || '%232QL0GCQGQ';
};

const evaluateWarResult = (selectedWar: any) => {
  const state = selectedWar.content.state;

  if (state === "preparation") {
    return "La guerra está en preparación. No se pueden realizar cálulos.";
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

const getMyClan = (warDetails: WarDetails, clanTag: string): Clan | undefined =>
  warDetails.clan.tag === clanTag ? warDetails.clan : warDetails.opponent;

const getTargetClan = (warDetails: WarDetails, clanTag: string): Clan | undefined =>
  warDetails.clan.tag === clanTag ? warDetails.opponent : warDetails.clan;

const getComparisonEmoji = (myPos: number, enemyPos: number) =>
  myPos < enemyPos
    ? '⬇️(num. Inferior)'
    : myPos > enemyPos
      ? '⬆️(num. Superior)'
      : '🪞(Espejo)';

const buildAttackMessage = (member: Member, playerEnemy: Member) => {
  const ownInfo = `*${member.mapPosition}. ${member.name} (TH${member.townhallLevel})`;
  const enemyInfo = `${playerEnemy.mapPosition}. ${playerEnemy.name} (TH${playerEnemy.townhallLevel})`;
  const warning = member.townhallLevel < playerEnemy.townhallLevel ? ' ⚠️ TH superior' : '';
  const emoji = getComparisonEmoji(member.mapPosition, playerEnemy.mapPosition);
  return `${ownInfo} VERSUS→ ${enemyInfo} | El rival era ${emoji} ${warning}`;
};

const getStarsGroup = (
  members: Member[],
  targetClan: Clan | undefined
): { [key: number]: string[] } => {
  const starsGroup: { [key: number]: string[] } = { 3: [], 2: [], 1: [] };
  members.forEach((member) => {
    if (member.attacks && member.attacks.length > 0) {
      member.attacks.forEach((attack) => {
        const stars = (attack.stars || 0) as 1 | 2 | 3;
        const playerEnemy = targetClan?.members.find((m) => m.tag === attack.defenderTag);
        if (playerEnemy) {
          starsGroup[stars]?.push(buildAttackMessage(member, playerEnemy));
        }
      });
    }
  });
  return starsGroup;
};

const getNoAttackList = (
  members: Member[],
  attacksPerMember: number = 1
): string[] => {
  const noAttack: string[] = [];
  members.forEach((member) => {
    const attacksDone = member.attacks?.length || 0;
    const attacksMissing = attacksPerMember - attacksDone;
    if (attacksMissing > 0) {
      noAttack.push(`* ${member.mapPosition}. ${member.name} → ${attacksMissing} ataque(s)`);
    }
  });
  return noAttack;
};

const generateWarMessage = (warDetails: WarDetails) => {
  if (!warDetails) return '';

  const clanTag = getClanTag().replace('%23', '#');
  const myClan = getMyClan(warDetails, clanTag);
  const targetClan = getTargetClan(warDetails, clanTag);

  if (!myClan) return 'No se encontró información de tu clan.';

  const attacksPerMember = warDetails.attacksPerMember || 1;
  const starsGroup = getStarsGroup(myClan.members, targetClan);
  const noAttack = getNoAttackList(myClan.members, attacksPerMember);

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
interface Member {
  mapPosition: number;
  name: string;
  townhallLevel: number;
  attacks?: Attack[];
  tag: string;
}

interface Attack {
  stars: number;
  defenderTag: string;
}

interface Clan {
  tag: string;
  name: string;
  status?: string;
  members: Member[];
}

interface WarDetails {
  clan: Clan;
  opponent: Clan;
  attacksPerMember?: number;
}

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
  const [messagePrediction, setmessagePrediction] = useState<string>(''); // State to store war saves

  const [loadingWarSaves, setLoadingWarSaves] = useState(false); // State to track loading status
  const [selectedWar, setSelectedWar] = useState<any>(null); // State to store the selected war
  const [savedAttacks, setSavedAttacks] = useState<any[]>([]);
  const [customMessage, setCustomMessage] = useState<string>(''); // State for the custom message
  const [includeThreeStars, setIncludeThreeStars] = useState(false);
  const [includeTwoStars, setIncludeTwoStars] = useState(false);
  const [includeOneStar, setIncludeOneStar] = useState(false);
  const [includeMissingAttacks, setIncludeMissingAttacks] = useState(true);
  const [includeOneMissingAttack, setIncludeOneMissingAttack] = useState(false);
  const [includeTwoMissingAttacks, setIncludeTwoMissingAttacks] = useState(false);
  const [filterPlayerName, setFilterPlayerName] = useState<string>(''); // State for filtering attacks by player name
  const [currentWarDetails, setcurrentWarDetails] = useState<any>({}); // State for filtering attacks by player name
  const [warLeageSaves, setWarLeageSaves] = useState<any[]>([]); // State to store war saves

  const [LeageGroupsSaves, setLeageGroupsSaves] = useState<any[]>([]); // State to store war saves
  const [showSavedAttacks, setShowSavedAttacks] = useState(false); // State for collapsible saved attacks section
  const [showWarMap, setShowWarMap] = useState(false); // State for collapsible war map section

  const enrichMembersWithDetails = async (members: any[]): Promise<any[]> => {
    return Promise.all(
      members.map(async (member: any) => {
        const formattedTag = member.tag.replace('#', '%23');
        const playerInfo = await APIClashService.getPlayerInfo(formattedTag);
        return { ...member, playerInfo };
      })
    );
  };

  // Helper: fetch and process league group details
  const fetchLeagueGroupDetails = async (setFullWarDetails: (details: any) => void) => {
    const clanWarLeagueGroupDetails = await APIClashService.getClanWarLeagueGroup();
    if (clanWarLeagueGroupDetails?.clans) {
      const fullDetails = await Promise.all(
        clanWarLeagueGroupDetails.clans.map(async (clan: { members: any[] }) => {
          const membersWithDetails = await enrichMembersWithDetails(clan.members);
          return { ...clan, members: membersWithDetails };
        })
      );
      setFullWarDetails(fullDetails);
    }
  };

  // Helper: fetch and process current war details
  const fetchCurrentWarDetails = async (
    setcurrentWarDetails: (details: any) => void,
    setFullWarDetails: (details: any) => void,
    getWarSummary: (log: any) => any
  ) => {
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
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        if (activeTab === 'currentWar') {
          await fetchLeagueGroupDetails(setFullWarDetails);
        } else {
          await fetchCurrentWarDetails(setcurrentWarDetails, setFullWarDetails, getWarSummary);
        }
      } catch (error) {
        console.error('Error loading war data:', error);
        setFullWarDetails(null);
      }
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
        setIncludeThreeStars(false);
        setIncludeTwoStars(false);
        setIncludeOneStar(false);
        setIncludeMissingAttacks(true);
        setIncludeTwoMissingAttacks(true);
        setIncludeOneMissingAttack(false);
      } else {
        // Select all except "Incluir jugadores con 2 ataques faltantes"
        setIncludeThreeStars(false);
        setIncludeTwoStars(false);
        setIncludeOneStar(false);
        setIncludeMissingAttacks(true);
        setIncludeOneMissingAttack(false);
        setIncludeTwoMissingAttacks(false);
      }
    }
  }, [warSaves]);

  const translateHero = (heroName: string) => {
    return heroTranslations[heroName as keyof typeof heroTranslations] || heroName;
  };

  const getUniqueHeroes = (members: any[]): string[] => {
    const heroSet = new Set<string>();
    members?.forEach((member: { playerInfo: { heroes: any[]; }; }) => {
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
      // Prevent error if isoDate is undefined or not a string
      if (!isoDate || typeof isoDate !== 'string' || isoDate.length < 8) {
        return 'Fecha no válida';
      }
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

    members?.forEach((member: { playerInfo: { heroes: any[]; }; }) => {
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

  const filterRecentWars = (warLog: any, days: number, parseDate: (dateStr: string) => string) => {
    if (!warLog || !warLog.items) return [];
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - days);
    return warLog.items.filter((war: any) => {
      const parsedDateStr = parseDate(war.endTime);
      const warEndTime = new Date(parsedDateStr);
      return warEndTime > cutoff;
    });
  };

  // SRP: Calcula las rachas de victorias y derrotas
  const calculateStreaks = (wars: any[]) => {
    let winStreak = 0, maxWinStreak = 0, lossStreak = 0, maxLossStreak = 0;
    wars.forEach((war: any) => {
      if (war.result === "win") {
        winStreak++;
        lossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, winStreak);
      } else if (war.result === "lose") {
        lossStreak++;
        winStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, lossStreak);
      }
    });
    return { maxWinStreak, maxLossStreak };
  };

  // SRP: Resume los resultados de guerra
  const summarizeWars = (wars: any[]) => {
    let wins = 0, losses = 0, ties = 0, significantWins = 0, significantLosses = 0;
    wars.forEach((war: any) => {
      const margin = Math.abs(war.clan.stars - war.opponent.stars);
      if (war.result === "win") {
        wins++;
        if (margin >= 10) significantWins++;
      } else if (war.result === "lose") {
        losses++;
        if (margin >= 10) significantLosses++;
      } else if (war.result === "tie") {
        ties++;
      }
    });
    return { wins, losses, ties, significantWins, significantLosses };
  };

  // OCP: Función principal, fácil de extender
  const getWarSummary = (warLog: any) => {
    const recentWars = filterRecentWars(warLog, 60, parseCustomDate);
    const { maxWinStreak, maxLossStreak } = calculateStreaks(recentWars);
    const { wins, losses, ties, significantWins, significantLosses } = summarizeWars(recentWars);

    return {
      totalWars: recentWars.length,
      wins,
      losses,
      ties,
      maxWinStreak,
      maxLossStreak,
      significantWins,
      significantLosses,
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
  function getTimeLeft(endTime: string): string {
    if (!endTime) return "Desconocido";
    const year = endTime.substring(0, 4);
    const month = endTime.substring(4, 6);
    const day = endTime.substring(6, 8);
    const hour = endTime.substring(9, 11);
    const minute = endTime.substring(11, 13);
    const second = endTime.substring(13, 15);
    const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
    const end = new Date(isoString);
    const now = new Date();
    let diff = end.getTime() - now.getTime();
    if (diff <= 0) return "¡La guerra ha terminado!";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    return `${hours} horas y ${minutes} minutos`;
  }

  function getAttacksDone(clan: any): number {
    return clan.members.reduce((acc: number, m: any) => acc + (m.attacks ? m.attacks.length : 0), 0);
  }

  function getAttacksLeft(clan: any, teamSize: number, attacksPerMember: number): number {
    return teamSize * attacksPerMember - getAttacksDone(clan);
  }

  // O: Open/Closed Principle - getMaxStars es fácil de extender para nuevas reglas
  function getMaxStars(clan: any, isLeague: boolean, teamSize: number, attacksPerMember: number): number {
    if (isLeague) {
      return (clan.stars || 0) + getAttacksLeft(clan, teamSize, attacksPerMember) * 3;
    }
    const baseBestStars: { [defenderTag: string]: number } = {};
    for (const member of clan.members) {
      if (member.attacks) {
        for (const attack of member.attacks) {
          if (!baseBestStars[attack.defenderTag] || attack.stars > baseBestStars[attack.defenderTag]) {
            baseBestStars[attack.defenderTag] = attack.stars;
          }
        }
      }
    }
    let attacksLeft = getAttacksLeft(clan, teamSize, attacksPerMember);
    const bases = Object.keys(baseBestStars).map(tag => ({
      tag,
      stars: baseBestStars[tag]
    }));
    for (const member of clan.members) {
      if (!baseBestStars[member.tag]) {
        bases.push({ tag: member.tag, stars: 0 });
      }
    }
    bases.sort((a, b) => a.stars - b.stars);

    let possibleStars = 0;
    for (const base of bases) {
      let starsToAdd = 3 - base.stars;
      if (starsToAdd > 0 && attacksLeft > 0) {
        const usedAttacks = Math.min(1, attacksLeft);
        possibleStars += base.stars + (usedAttacks > 0 ? starsToAdd : 0);
        attacksLeft -= usedAttacks;
      } else {
        possibleStars += base.stars;
      }
    }
    if (attacksLeft > 0) {
      possibleStars += attacksLeft * 3;
    }
    return Math.min(possibleStars, teamSize * 3);
  }

  // L: Liskov Substitution Principle - Las funciones no rompen contratos al extenderse
  // I: Interface Segregation Principle - No aplica directamente aquí por ser funciones utilitarias
  // D: Dependency Inversion Principle - Las dependencias (funciones) se inyectan por parámetros si se requiere

  function getDynamicTitle(ourStars: number, enemyStars: number, ourMaxStars: number, enemyMaxStars: number, ourAttacksLeft: number, enemyMax: number): string {
    if (ourStars > enemyMaxStars) {
      return '🏆🎉 ¡FELICIDADES CLAN! ¡VICTORIA ASEGURADA! 🎉🏆\n';
    } else if (enemyStars > ourMaxStars) {
      return '💀❌ DERROTA MATEMÁTICA ❌💀\nYa no podemos remontar \n';
    } else if (ourStars > enemyStars) {
      if (enemyMax >= ourStars + ourAttacksLeft * 3) {
        return '⚠️ ATENCIÓN CLAN: ¡Aún nos pueden remontar! ⚠️\n\n';
      } else {
        return '🎉 ¡Vamos ganando! ¡Sigamos así para asegurar la victoria! 🎉\n';
      }
    } else if (ourStars < enemyStars) {
      return '🚨 ATENCIÓN CLAN: ¡TENEMOS QUE REMONTAR! 🚨\n⚠️¡A darlo todo en los ataques restantes!\n';
    } else {
      return '🤝⚠️ EMPATE ¡Cada ataque cuenta!⚠️🤝\n';
    }
  }

  // S: Single Responsibility Principle - Combinaciones de ataques
  function getAttackCombinations(attacksLeft: number, starsNeeded: number, prefix: string): string[] {
    let combinaciones: string[] = [];
    for (let three = attacksLeft; three >= 0; three--) {
      for (let two = attacksLeft - three; two >= 0; two--) {
        let one = attacksLeft - three - two;
        let total = three * 3 + two * 2 + one * 1;
        if (total >= starsNeeded) {
          if (one === 0 && two === 0 && three > 0) {
            combinaciones.push(`✅ ${prefix} todos los ataques de 3⭐ para ${total} estrellas`);
          } else if (three === 0 && two > 0 && one === 0) {
            combinaciones.push(`✅ ${prefix} ${two} ataque${two > 1 ? 's' : ''} de 2⭐ para ${total} estrellas`);
          } else if (three === 0 && two === 0 && one > 0) {
            combinaciones.push(`✅ ${prefix} ${one} ataque${one > 1 ? 's' : ''} de 1⭐ para ${total} estrellas`);
          } else if (three > 0 && one === 0 && two > 0) {
            combinaciones.push(`✅ ${prefix} ${three} ataques de 3⭐ y ${two} de 2⭐ para ${total} estrellas`);
          } else if (three > 0 && two === 0 && one > 0) {
            combinaciones.push(`✅ ${prefix} ${three} ataques de 3⭐ y ${one} de 1⭐ para ${total} estrellas`);
          } else if (three > 0 && two > 0 && one > 0) {
            combinaciones.push(`✅ ${prefix} ${three} ataques de 3⭐, ${two} de 2⭐ y ${one} de 1⭐ para ${total} estrellas`);
          }
        }
      }
    }
    return combinaciones;
  }

  // Función principal refactorizada
  function predictWarOutcome(latestSave: any, mainClan: any, opponentClan: any): string {
    if (!latestSave || !mainClan || !opponentClan) return "No hay datos suficientes para predecir.";
    const isLeague = !!latestSave.season;
    const attacksPerMember = isLeague ? 1 : 2;
    const teamSize = latestSave.teamSize || mainClan.members.length;

    const ourStars = mainClan.stars || 0;
    const ourDestruction = mainClan.destructionPercentage || 0;
    const enemyStars = opponentClan.stars || 0;
    const enemyDestruction = opponentClan.destructionPercentage || 0;

    const ourAttacksLeft = getAttacksLeft(mainClan, teamSize, attacksPerMember);
    const enemyAttacksLeft = getAttacksLeft(opponentClan, teamSize, attacksPerMember);

    const ourMaxStars = isLeague
      ? ourStars + ourAttacksLeft * 3
      : getMaxStars(mainClan, isLeague, teamSize, attacksPerMember);
    const enemyMaxStars = isLeague
      ? enemyStars + enemyAttacksLeft * 3
      : getMaxStars(opponentClan, isLeague, teamSize, attacksPerMember);

    const timeLeft = getTimeLeft(latestSave.endTime);

    const title = getDynamicTitle(ourStars, enemyStars, ourMaxStars, enemyMaxStars, ourAttacksLeft, enemyMaxStars);

    let result = `${title}⏳ Tiempo restante de guerra: ${timeLeft}\n\n`;
    result += `Estado actual de la guerra ⚔️:\n`;
    result += `Nosotros: ${ourStars}⭐ (${ourDestruction.toFixed(1)}%)\n`;
    result += `Ellos: ${enemyStars}⭐ (${enemyDestruction.toFixed(1)}%)\n\n`;
    result += `---------------------\n\n`;

    result += `Ataques restantes:\n`;
    result += `Nosotros: ${ourAttacksLeft} ataque(s)⚔️\n`;
    result += `Ellos: ${enemyAttacksLeft} ataque(s)⚔️\n\n`;
    result += `---------------------\n`;

    result += `Máximo de estrellas posibles con nuestros ataques disponibles:\n`;
    result += `Nosotros: ${ourMaxStars}⭐\n`;
    result += `Ellos: ${enemyMaxStars}⭐\n\n`;
    result += `---------------------\n`;

    if (ourStars > enemyMaxStars) {
      result += `🎉¡Ya ganamos la guerra! Aunque el rival haga todos sus ataques con 3 estrellas, no nos puede alcanzar.🎉\n`;
      return result;
    }
    if (enemyStars > ourMaxStars) {
      result += `❌❌¡Ya perdimos la guerra! Aunque hagamos todos nuestros ataques con 3 estrellas, no podemos alcanzar al rival.❌❌\n`;
      return result;
    }

    if (ourStars < enemyStars) {
      const starsToTie = enemyStars - ourStars;
      const starsToWin = enemyStars - ourStars + 1;
      result += `❌Estamos perdiendo por ${starsToTie} estrellas.\n`;
      result += `⚠️Necesitamos al menos ${starsToWin} estrellas más que ellos para ganar (o empatar y superar en % de destrucción).\n`;
    } else if (ourStars > enemyStars) {
      const starsToTie = ourStars - enemyStars;
      result += `🎉Vamos ganando por ${starsToTie}⭐.\n`;

      const starsNeeded = ourStars - enemyStars + 1;
      if (enemyAttacksLeft > 0) {
        result += `\n⚔️El rival necesita sumar al menos ${starsNeeded}⭐ en sus ${enemyAttacksLeft} ataques restantes para superarnos en ⭐.\n`;
        const enemyMaxIfPerfect = enemyMaxStars;
        const starsToSecureWin = enemyMaxIfPerfect - ourStars + 1;
        if (ourAttacksLeft > 0) {
          if (starsToSecureWin <= 0) {
            result += `¡Ya tenemos la victoria matemática asegurada! El rival no puede alcanzarnos aunque haga todos sus ataques con 3 estrellas.\n`;
          } else if (ourMaxStars < enemyMaxStars) {
            const starsRivalToBeUnreachable = ourMaxStars - enemyStars + 1;
            result += `\n---------------------\n`;
            result += `\n⚠️Con los ataques restantes, no es posible asegurar la victoria matemática.\n`;
            result += `Nuestro máximo posible es ${ourMaxStars}⭐ y el del rival es ${enemyMaxStars}⭐.\n`;
            result += `Para que el rival sea inalcanzable, necesita  sumar al menos ${starsRivalToBeUnreachable}⭐ en sus ataques (es decir,  superar nuestro máximo posible).\n`;
            result += `Para nosotros ser inalcanzables, necesitaríamos que el rival falle ataques.\n`;
            result += `\n---------------------\n`;

            const combinaciones = getAttackCombinations(enemyAttacksLeft, starsRivalToBeUnreachable, "Tienen que hacer");
            if (combinaciones.length > 0) {
              result += `\n📝Combinaciones posibles de ataques para que el rival sea inalcanzable\n⚠️Necesitan ${starsRivalToBeUnreachable}⭐ | ${enemyAttacksLeft} ataque(s)⚔️:\n`;
              result += combinaciones.join('\n');
            } else {
              result += "❌No hay combinación posible, el rival no puede ser inalcanzable con los ataques que le quedan.❌\n";
            }
          } else {
            result += `\n---------------------\n`;
            result += `\n⚔️Si sumamos al menos ${starsToSecureWin} estrellas ⭐ más en nuestros ataques restantes.\n🎉El rival NO podrá alcanzarnos aunque haga todos sus ataques perfectos.🎉\n`;

            const combinaciones = getAttackCombinations(ourAttacksLeft, starsToSecureWin, "Tenemos que hacer");
            if (combinaciones.length > 0) {
              result += `\n📝Combinaciones posibles de ataques para ser inalcanzables:\n`;
              result += combinaciones.join('\n');
            } else {
              result += "❌No hay combinación posible, necesitamos más ataques o estrellas para ser inalcanzables.❌\n";
            }
          }
        }
      }
    } else {
      if (ourDestruction > enemyDestruction) {
        result += `Empate en estrellas, pero vamos ganando por destrucción (${(ourDestruction - enemyDestruction).toFixed(1)}%).\n`;
      } else if (ourDestruction < enemyDestruction) {
        result += `Empate en estrellas, pero vamos perdiendo por destrucción (${(enemyDestruction - ourDestruction).toFixed(1)}%).\n`;
      } else {
        result += `Empate total en estrellas y destrucción. ¡La guerra está muy pareja!\n`;
      }
      result += `Cada ataque puede definir la guerra, ¡hay que aprovecharlos al máximo!\n`;
    }
    return result;
  }
// SOLID refactor for generateFilteredWarMessage

// S: Single Responsibility Principle - Each helper does one thing
function getLatestWarSave(currentWarDetails: any, warLeageSaves: any[], warSaves: any[]) {
  if (currentWarDetails && Object.keys(currentWarDetails).length > 0 && currentWarDetails.state !== "notInWar") {
    return currentWarDetails;
  }
  if (warLeageSaves.length === 0) {
    return null;
  }
  const inWarSaves = warLeageSaves
    .filter((save: any) => save.content?.state === "inWar")
    .sort((a: any, b: any) => {
      const aTime = a.content?.warStartTime || a.content?.startTime || "";
      const bTime = b.content?.warStartTime || b.content?.startTime || "";
      return bTime.localeCompare(aTime); // descendente
    });
  if (inWarSaves.length > 0) {
    return inWarSaves[0].content;
  }
  if (warSaves.length > 0) {
    return warSaves[warSaves.length - 1]?.content;
  }
  return null;
}

// O: Open/Closed Principle - Additional info logic is easy to extend
function getAdditionalInfo(state: string, latestSave: any, mainClan: any, opponentClan: any, now: Date) {
  if (state === "preparation") {
    const preparationEndTime = new Date(
      `${latestSave.startTime.substring(0, 4)}-${latestSave.startTime.substring(4, 6)}-${latestSave.startTime.substring(6, 8)}T${latestSave.startTime.substring(9, 11)}:${latestSave.startTime.substring(11, 13)}:${latestSave.startTime.substring(13, 15)}.000Z`
    );
    const timeRemaining = Math.max(0, preparationEndTime.getTime() - now.getTime());
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    return `La guerra está en preparación. Tiempo restante: ${hours} horas y ${minutes} minutos.`;
  }
  if (state === "inWar") {
    const battleEndTime = new Date(
      `${latestSave.endTime.substring(0, 4)}-${latestSave.endTime.substring(4, 6)}-${latestSave.endTime.substring(6, 8)}T${latestSave.endTime.substring(9, 11)}:${latestSave.endTime.substring(11, 13)}:${latestSave.endTime.substring(13, 15)}.000Z`
    );
    const timeRemaining = Math.max(0, battleEndTime.getTime() - now.getTime());
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    if (mainClan.stars > opponentClan.stars) {
      return `🎉 ¡Vamos ganando la guerra! 🏆\n\nNuestro clan tiene más estrellas (${mainClan.stars}🌟) que el oponente (${opponentClan.stars}🌟).\n\n⏳ Tiempo restante: ${hours} horas y ${minutes} minutos.`;
    } else if (mainClan.stars < opponentClan.stars) {
      return `😔 Vamos perdiendo la guerra. 💔\nEl clan oponente tiene más estrellas (${opponentClan.stars}🌟) que nosotros (${mainClan.stars}🌟).\n\n⏳ Tiempo restante: ${hours} horas y ${minutes} minutos.`;
    } else if (mainClan.destructionPercentage > opponentClan.destructionPercentage) {
      return `⚔️ ¡Empate en estrellas, pero vamos ganando por porcentaje! 🎯\n\nNuestro porcentaje de destrucción (${mainClan.destructionPercentage}%) es mayor que el del oponente (${opponentClan.destructionPercentage}%).\n\n⏳ Tiempo restante: ${hours} horas y ${minutes} minutos.`;
    } else if (mainClan.destructionPercentage < opponentClan.destructionPercentage) {
      return `⚔️ ¡Empate en estrellas, pero vamos perdiendo por porcentaje! 😓\n\nEl porcentaje de destrucción del oponente (${opponentClan.destructionPercentage}%) es mayor que el nuestro (${mainClan.destructionPercentage}%).\n\n⏳ Tiempo restante: ${hours} horas y ${minutes} minutos.`;
    } else {
      return `🤝 La guerra está completamente empatada. 😮\n\nAmbos clanes tienen las mismas estrellas (${mainClan.stars}🌟) y el mismo porcentaje de destrucción (${mainClan.destructionPercentage}%).\n\n⏳ Tiempo restante: ${hours} horas y ${minutes} minutos.`;
    }
  }
  return '';
}

// I: Interface Segregation Principle - Only the needed props are passed to helpers

// D: Dependency Inversion Principle - All dependencies are injected as parameters

const generateFilteredWarMessage = (warDetails: any) => {
  // S: Use helper for latest save selection
  const latestSave = getLatestWarSave(currentWarDetails, warLeageSaves, warSaves);

  if (!latestSave) {
    return "No hay información disponible para generar el mensaje.";
  }

  const state = latestSave.state;
  const now = new Date();

  // O: Use helper for additional info
  let additionalInfo = '';
  let mainClan = null;
  let opponentClan = null;
  if (state === "inWar") {
    const clanTag = getClanTag().replace('%23', '#');
    const isMainClan = latestSave.clan.tag === clanTag;
    mainClan = isMainClan ? latestSave.clan : latestSave.opponent;
    opponentClan = isMainClan ? latestSave.opponent : latestSave.clan;
    predictMessage = predictWarOutcome(latestSave, mainClan, opponentClan);
  } else {
    mainClan = latestSave.clan;
    opponentClan = latestSave.opponent;
  }
  additionalInfo = getAdditionalInfo(state, latestSave, mainClan, opponentClan, now);

  // S: Section extraction logic
  const fullMessage = generateWarMessage(latestSave);
  const sections = fullMessage.split('🌟🌟🌟');
  const threeStarsSection = sections[1]?.split('🌟🌟')[0]?.trim() || '';
  const twoStarsSection = sections[1]?.split('🌟🌟')[1]?.split('🌟')[0]?.trim() || '';
  const oneStarSection = sections[1]?.split('🌟🌟')[1]?.split('🌟')[1]?.split('❌')[0]?.trim() || '';
  const missingAttacksSection = sections[1]?.split('🌟🌟')[1]?.split('🌟')[1]?.split('❌')[1]?.trim() || '';

  // S: Filtering logic for missing attacks
  let filteredMissingAttacksSection = missingAttacksSection;
  if (includeOneMissingAttack) {
    filteredMissingAttacksSection = filteredMissingAttacksSection
      .split('\n')
      .filter((line) => line.includes('1 ataque(s)'))
      .join('\n');
  }
  if (includeTwoMissingAttacks) {
    filteredMissingAttacksSection = filteredMissingAttacksSection
      .split('\n')
      .filter((line) => line.includes('2 ataque(s)'))
      .join('\n');
  }

  // S: Calculation logic for totals
  const totalPlayersWithMissingAttacks = (filteredMissingAttacksSection.match(/\n/g) || []).length;

  // L: Liskov - All helpers can be extended without breaking contract

  // Compose final message
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
        <CurrentWar
          fullWarDetails={fullWarDetails}
          clanTag={clanTag}
          getSortedClans={getSortedClans}
          getClanSummary={getClanSummary}
          translateHero={translateHero}
          getUniqueHeroes={getUniqueHeroes}
        />
      )}

      {activeTab === 'MensajeGuerra' && (
        <WarInfoMessage
          generateFilteredWarMessage={generateFilteredWarMessage}
          predictMessage={predictMessage}
        />
      )}

      {activeTab === 'warLogs' && (
        <WarLogs
          warSaves={warSaves}
          warLeageSaves={warLeageSaves}
          savedAttacks={savedAttacks}
          loadingWarSaves={loadingWarSaves}
          formatWarDate={formatWarDate}
          formatDate={formatDate}
          evaluateWarResult={evaluateWarResult}
          getClanTag={getClanTag}
          extractTimestampFromFileName={extractTimestampFromFileName}
          getThColor={getThColor}
          getPlayersWhoDidNotAttack={(members, attacks, attacksPerMember) =>
            getPlayersWhoDidNotAttack(members, attacks, attacksPerMember ?? 1).map((m) => {
              const original = members.find((mem) => mem.name === m.name) || {
                mapPosition: 0,
                townhallLevel: 0,
                tag: '',
                name: m.name,
                attacks: [],
              };
              return {
                ...original,
                ...m,
              };
            })
          }
          deleteAttack={(id) => { if (id) deleteAttack(id); }}
        />
      )}
    </div>
  );
};

export default WarInfoPage;
