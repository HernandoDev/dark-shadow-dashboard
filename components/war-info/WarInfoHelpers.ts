// Helpers y utilidades para war-info
import { Member, Clan, WarDetails, Attack, ClanMember } from './warInfoTypes';

export const heroTranslations = {
  "Barbarian King": "Rey Bárbaro",
  "Archer Queen": "Reina Arquera",
  "Grand Warden": "Gran Centinela",
  "Royal Champion": "Campeona Real",
  "Battle Machine": "Máquina Bélica",
  "Minion Prince": "Príncipe Minion",
  "Battle Copter": "Helicóptero de Batalla",
};

export const getClanTag = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('clanTag') || '%232QL0GCQGQ';
};

export const evaluateWarResult = (selectedWar: any) => {
  const state = selectedWar.content.state;
  if (state === "preparation") {
    return "La guerra está en preparación. No se pueden realizar cálulos.";
  } else {
    const clanTag = getClanTag().replace('%23', '#');
    const isMainClan = selectedWar.content.clan.tag === clanTag;
    const mainClan = isMainClan ? selectedWar.content.clan : selectedWar.content.opponent;
    const opponentClan = isMainClan ? selectedWar.content.opponent : selectedWar.content.clan;
    if (mainClan.stars > opponentClan.stars) {
      return "Ganamos la guerra";
    } else if (mainClan.stars < opponentClan.stars) {
      return "Perdimos la guerra";
    } else {
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

export const extractTimestampFromFileName = (fileName: string): string => {
  const parts = fileName.replace('.json', '').split('_');
  if (parts[0] === 'war') {
    // Formato: war_%232QL0GCQGQ_2025-04-30
    return parts[2] || '';
  } else if (parts[0] === 'liga' && parts[1] === 'war') {
    // Formato: liga_war_%232QL0GCQGQ_2025-04-30
    return parts[3] || '';
  } else {
    return '';
  }
};

export const getThColor = (memberThLevel: number, thRival: number): string => {
  if (memberThLevel > thRival) return 'green';
  if (memberThLevel < thRival) return 'red';
  return 'gray';
};

export const calculatePoints = (stars: number, memberThLevel: number, thRival: number, multiplier: number): number => {
  return stars * (memberThLevel / thRival) * multiplier;
};

export const getPlayersWhoDidNotAttack = (members: any[], savedAttacks: any[], attacksPerMember: number) => {
  const attackCounts = savedAttacks.reduce((acc: any, attack: any) => {
    acc[attack.memberTag] = (acc[attack.memberTag] || 0) + 1;
    return acc;
  }, {});
  return members.map((member: any) => ({
    ...member,
    attacksMissing: attacksPerMember - (attackCounts[member.tag] || 0),
  })).filter((member: any) => member.attacksMissing > 0);
};

export const getMyClan = (warDetails: WarDetails, clanTag: string): Clan | undefined =>
  warDetails.clan.tag === clanTag ? warDetails.clan : warDetails.opponent;

export const getTargetClan = (warDetails: WarDetails, clanTag: string): Clan | undefined =>
  warDetails.clan.tag === clanTag ? warDetails.opponent : warDetails.clan;

export const getComparisonEmoji = (myPos: number, enemyPos: number) =>
  myPos < enemyPos
    ? '⬇️(num. Inferior)'
    : myPos > enemyPos
      ? '⬆️(num. Superior)'
      : '🪞(Espejo)';

export const buildAttackMessage = (member: Member, playerEnemy: Member) => {
  const ownInfo = `*${member.mapPosition}. ${member.name} (TH${member.townhallLevel})`;
  const enemyInfo = `${playerEnemy.mapPosition}. ${playerEnemy.name} (TH${playerEnemy.townhallLevel})`;
  const warning = member.townhallLevel < playerEnemy.townhallLevel ? ' ⚠️ TH superior' : '';
  const emoji = getComparisonEmoji(member.mapPosition, playerEnemy.mapPosition);
  return `${ownInfo} VERSUS→ ${enemyInfo} | El rival era ${emoji} ${warning}`;
};

export const getStarsGroup = (
  members: Member[],
  targetClan: Clan | undefined
): { [key: number]: string[] } => {
  const starsGroup: { [key: number]: string[] } = { 3: [], 2: [], 1: [] };
  members.forEach((member) => {
    if (member.attacks && member.attacks.length > 0) {
      member.attacks.forEach((attack) => {
        if (attack.stars >= 1 && attack.stars <= 3) {
          // Buscar información del rival en el targetClan
          let rivalInfo = '';
          if (targetClan && targetClan.members) {
            const rival = targetClan.members.find(m => m.tag === attack.defenderTag);
            if (rival) {
              rivalInfo = ` 🆚 #${rival.mapPosition}.- ${rival.name} (TH${rival.townhallLevel})`;
            }
          }
          const attackInfo = ` #${member.mapPosition}.- ${member.name} (TH${member.townhallLevel})${rivalInfo} - ${attack.destructionPercentage}%`;
          starsGroup[attack.stars].push(attackInfo);
        }
      });
    }
  });
  return starsGroup;
};

export const getNoAttackList = (
  members: Member[],
  attacksPerMember: number = 1
): string[] => {
  const noAttack: string[] = [];
  members.forEach((member) => {
    const attacksDone = member.attacks ? member.attacks.length : 0;
    const attacksMissing = attacksPerMember - attacksDone;
    if (attacksMissing > 0) {
      noAttack.push(`${member.name} (TH${member.townhallLevel}) le faltan ${attacksMissing} ataque(s)`);
    }
  });
  return noAttack;
};

export const getPlayersWithMissingAttacks = (
  members: Member[],
  attacksPerMember: number = 1
): { [key: number]: string[] } => {
  const missingAttacks: { [key: number]: string[] } = { 1: [], 2: [] };
  members.forEach((member) => {
    const attacksDone = member.attacks ? member.attacks.length : 0;
    const attacksMissing = attacksPerMember - attacksDone;
    if (attacksMissing > 0 && attacksMissing <= 2) {
      missingAttacks[attacksMissing].push(`${member.name} (TH${member.townhallLevel}) le faltan ${attacksMissing} ataque(s)`);
    }
  });
  return missingAttacks;
};

// Función mejorada para generar mensajes filtrados
export const generateFilteredWarMessage = (
  warDetails: WarDetails,
  filters: {
    includeThreeStars: boolean;
    includeTwoStars: boolean;
    includeOneStar: boolean;
    includeMissingAttacks: boolean;
    includeOneMissingAttack: boolean;
    includeTwoMissingAttacks: boolean;
  }
): string => {
  if (!warDetails) return '';
  
  const clanTag = getClanTag().replace('%23', '#');
  const myClan = getMyClan(warDetails, clanTag);
  const targetClan = getTargetClan(warDetails, clanTag);
  if (!myClan) return '';
  
  const attacksPerMember = warDetails.attacksPerMember || 1;
  const starsGroup = getStarsGroup(myClan.members, targetClan);
  const noAttack = getNoAttackList(myClan.members, attacksPerMember);
  const missingAttacks = getPlayersWithMissingAttacks(myClan.members, attacksPerMember);
  
  let message = `\n📢 Estado de la guerra: ${myClan.status || 'Desconocido'}\n`;
  
  // Filtrar e incluir secciones según los filtros
  if (filters.includeThreeStars && starsGroup[3].length > 0) {
    message += `🌟🌟🌟 3 Estrellas (🎉 Felicidades 🎉)\n${starsGroup[3].join('\n')}\n\n`;
  }
  
  if (filters.includeTwoStars && starsGroup[2].length > 0) {
    message += `🌟🌟 2 Estrellas (⚔️ Aceptable ⚔️)\n${starsGroup[2].join('\n')}\n\n`;
  }
  
  if (filters.includeOneStar && starsGroup[1].length > 0) {
    message += `🌟 1 Estrella (❌No aceptable❌)\n${starsGroup[1].join('\n')}\n\n`;
  }
  
  if (filters.includeMissingAttacks && noAttack.length > 0) {
    let missingSection = '';
    
    if (filters.includeOneMissingAttack && missingAttacks[1].length > 0) {
      missingSection = missingAttacks[1].join('\n');
    } else if (filters.includeTwoMissingAttacks && missingAttacks[2].length > 0) {
      missingSection = missingAttacks[2].join('\n');
    } else if (!filters.includeOneMissingAttack && !filters.includeTwoMissingAttacks) {
      missingSection = noAttack.join('\n');
    }
    
    if (missingSection) {
      const totalMissing = filters.includeOneMissingAttack ? missingAttacks[1].length :
                          filters.includeTwoMissingAttacks ? missingAttacks[2].length :
                          noAttack.length;
      message += `❌PERSONAS QUE NO HAN ATACADO AÚN\nTotal de personas con ataques pendientes: ${totalMissing}\n\n${missingSection}\n\n`;
    }
  }
  
  return message.trim();
};

export const generateWarMessage = (warDetails: WarDetails) => {
  
  if (!warDetails) return '';
  const clanTag = getClanTag().replace('%23', '#');
  const myClan = getMyClan(warDetails, clanTag);
  const targetClan = getTargetClan(warDetails, clanTag);
  if (!myClan) return '';
  const attacksPerMember = warDetails.attacksPerMember || 1;
  const starsGroup = getStarsGroup(myClan.members, targetClan);
  const noAttack = getNoAttackList(myClan.members, attacksPerMember);
  debugger
  return `\n📢 Estado de la guerra: ${myClan.status || 'Desconocido'}\n🌟🌟🌟\n${starsGroup[3].join('\n') || 'Ningún ataque de 3 estrellas'}\n\n🌟🌟\n${starsGroup[2].join('\n') || 'Ningún ataque de 2 estrellas'}\n\n🌟\n${starsGroup[1].join('\n') || 'Ningún ataque de 1 estrella'}\n\n❌\n${noAttack.join('\n') || 'Todos atacaron'}\n  `;
};

export const copyToClipboard = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
};

export const deleteAttack = async (attackId: string) => {
  try {
    // Implementación de borrado
  } catch (error) {
    // Manejo de error
  }
};
