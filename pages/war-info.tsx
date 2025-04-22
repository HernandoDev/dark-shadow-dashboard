import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';

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

          const fullDetails = [
            { ...currentWarDetails.clan, members: clanDetails },
            { ...currentWarDetails.opponent, members: opponentDetails },
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
    const heroTranslations = {
      "Barbarian King": "Rey Bárbaro",
      "Archer Queen": "Reina Arquera",
      "Grand Warden": "Gran Centinela",
      "Royal Champion": "Campeona Real",
      "Battle Machine": "Máquina Bélica",
      "Minion Prince": "Príncipe Minion",
      "Battle Copter": "Helicóptero de Batalla",
    };
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

  const switchToMainClan = () => setClanTag('%232QL0GCQGQ');
  const switchToSecondaryClan = () => setClanTag('%232RG9R9JVP');

  return (
    <div>
      <h1>Información de Guerra</h1>
      <div className="flex items-center gap-4">
        <button onClick={switchToMainClan}>Clan Principal</button>
        <button onClick={switchToSecondaryClan}>Clan Cantera</button>
      </div>
      <div id="war-info-container">
        {fullWarDetails ? (
          getSortedClans(fullWarDetails).map((clan: { tag: React.Key | null | undefined; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; members: any; }) => (
            <div key={clan.tag}>
              <h2>{clan.name}</h2>
              <table>
                <thead>
                  <tr>
                    <th>Media Nivel Ayuntamiento</th>
                    {getUniqueHeroes(clan.members).map((hero) => (
                      <th key={hero}>Media {translateHero(hero as "Barbarian King" | "Archer Queen" | "Grand Warden" | "Royal Champion" | "Battle Machine" | "Minion Prince" | "Battle Copter")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{getClanSummary(clan.members).averageTownHallLevel}</td>
                    {getUniqueHeroes(clan.members).map((hero) => (
                      <td key={hero}>{getClanSummary(clan.members).heroAverages[hero] || 'N/A'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
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
