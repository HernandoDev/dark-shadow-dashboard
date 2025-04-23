import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';
import { Button } from '@nextui-org/react';

// Move heroTranslations to the top level
const heroTranslations = {
  "Barbarian King": "Rey Bárbaro",
  "Archer Queen": "Reina Arquera",
  "Grand Warden": "Gran Centinela",
  "Royal Champion": "Campeona Real",
  "Battle Machine": "Máquina Bélica",
  "Minion Prince": "Príncipe Minion",
  "Battle Copter": "Helicóptero de Batalla",
};

const WarInfoPage = () => {
  const [clanTag, setClanTag] = useState('%232QL0GCQGQ');
  const [fullWarDetails, setFullWarDetails] = useState<any[] | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching clan war league group details for tag:', clanTag);
        const clanWarLeagueGroupDetails = await APIClashService.getClanWarLeagueGroup(clanTag);
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
          // Handle normal war scenario
          const currentWarDetails = await APIClashService.getClanCurrentWar(clanTag);
          const clanDetails = await enrichMembersWithDetails(currentWarDetails.clan.members);
          const opponentDetails = await enrichMembersWithDetails(currentWarDetails.opponent.members);

          const opponentTag = currentWarDetails.opponent.tag.replace('#', '%23');
          const opponentWarLog = await APIClashService.getWarLog(opponentTag);
          const clanWarLogSummary = getWarSummary(opponentWarLog)
          const fullDetails = [
            { ...currentWarDetails.clan, members: clanDetails },
            { ...currentWarDetails.opponent, members: opponentDetails, warLog: clanWarLogSummary },
          ];

          console.log('Full War Details (Normal War):', fullDetails);
          setFullWarDetails(fullDetails);
        }
      } catch (error) {
        console.error('Error loading war data:', error);
        setFullWarDetails([]);
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
      return avgB - avgA; // Sort in descending order
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
        significant: margin >= 10, // Define significant as a margin of 10 or more stars
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

  return (
    <div style={{ padding: '20px', }}>
      <h1>Información de Guerra</h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button
          bordered
          css={{
            backgroundColor: clanTag === '%232QL0GCQGQ' ? 'violet' : 'inherit',
            color: clanTag === '%232QL0GCQGQ' ? 'black' : 'inherit',
          }}
          onClick={() => switchToMainClan()}
        >
          Clan Principal
        </Button>
        <Button
          bordered
          css={{
            backgroundColor: clanTag === '%232RG9R9JVP' ? 'violet' : 'inherit',
            color: clanTag === '%232RG9R9JVP' ? 'black' : 'inherit',
          }}
          onClick={() => switchToSecondaryClan()}
        >
          Clan Cantera
        </Button>
      </div>

      <div id="war-info-container">
        {fullWarDetails ? (
          getSortedClans(fullWarDetails).map((clan: { tag: React.Key | null | undefined; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; members: any; warLog?: any; }) => (
            <div key={clan.tag}>
              <h2>{clan.name}</h2>
              {clan.warLog && (
                <div style={{ marginBottom: '10px' }}>
                  <h5 style={{ color: 'yellowgreen' }}>Resumen de Guerra ultimos 60 dias</h5>
                  <p>Total Guerras: {clan.warLog.totalWars}</p>
                  <p>Victorias: {clan.warLog.wins}</p>
                  <p>Derrotas: {clan.warLog.losses}</p>
                  <p>Empates: {clan.warLog.ties}</p>
                  <p>Racha Máxima de Victorias: {clan.warLog.maxWinStreak}</p>
                  <p>Racha Máxima de Derrotas: {clan.warLog.maxLossStreak}</p>
                  <p>Victorias Significativas: {clan.warLog.significantWins}</p>
                  <p>Derrotas Significativas: {clan.warLog.significantLosses}</p>
                </div>
              )}
              {clan.tag !== '#2QL0GCQGQ' && clan.tag !== '#2RG9R9JVP' && (
                <div>
                  {Object.entries(getClanSummary(clan.members).heroAverages).map(([hero, avgLevel]) => {
                    const mainClanHeroLevel = getClanSummary(fullWarDetails?.[0]?.members || []).heroAverages[hero] || 0;
                    let comparisonText = '';
                    let comparisonColor = '';

                    if (mainClanHeroLevel > avgLevel) {
                      comparisonText = `NUESTRO CLAN ES MEJOR EN NIVEL DE ${translateHero(hero as keyof typeof heroTranslations)}`;
                      comparisonColor = 'green';
                    } else if (mainClanHeroLevel < avgLevel) {
                      comparisonText = `NUESTRO CLAN ES PEOR EN NIVEL DE ${translateHero(hero as keyof typeof heroTranslations)}`;
                      comparisonColor = 'red';
                    } else {
                      comparisonText = `NUESTRO CLAN TIENE EL MISMO NIVEL DE ${translateHero(hero as keyof typeof heroTranslations)}`;
                      comparisonColor = 'gray';
                    }

                    return (
                      <p key={hero} style={{ color: comparisonColor }}>
                        {comparisonText}
                      </p>
                    );
                  })}
                  {(() => {
                    const mainClanTHLevel = getClanSummary(fullWarDetails?.[0]?.members || []).averageTownHallLevel;
                    let comparisonText = '';
                    let comparisonColor = '';

                    if (mainClanTHLevel > getClanSummary(clan.members).averageTownHallLevel) {
                      comparisonText = 'NUESTRO CLAN ES MEJOR EN NIVEL DE AYUNTAMIENTO';
                      comparisonColor = 'green';
                    } else if (mainClanTHLevel < getClanSummary(clan.members).averageTownHallLevel) {
                      comparisonText = 'NUESTRO CLAN ES PEOR EN NIVEL DE AYUNTAMIENTO';
                      comparisonColor = 'red';
                    } else {
                      comparisonText = 'NUESTRO CLAN TIENE EL MISMO NIVEL DE AYUNTAMIENTO';
                      comparisonColor = 'gray';
                    }

                    return (
                      <p style={{ color: comparisonColor }}>
                        {comparisonText}
                      </p>
                    );
                  })()}
                </div>
              )}
              <h5 style={{ color: 'yellowgreen' }}>Media de nivel de TH y Heroes</h5>
              <ul>
                <li>Nivel Ayuntamiento : {getClanSummary(clan.members).averageTownHallLevel}</li>
                {getUniqueHeroes(clan.members).map((hero) => (
                  <li key={hero}>
                    {translateHero(hero as keyof typeof heroTranslations)}: {getClanSummary(clan.members).heroAverages[hero] || 'N/A'}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>Cargando datos...</p>
        )}
      </div>
    </div>
  );
};

export default WarInfoPage;
