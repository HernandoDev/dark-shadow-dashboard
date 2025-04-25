import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';

const LeaguePointsPage = () => {
   const [processedResults, setProcessedResults] = useState<
      {
         name: string;
         totalAttacks: number;
         stars1: number;
         stars2: number;
         stars3: number;
         totalDestruction: number;
         minDestruction: number;
         score: number;
         avgDestruction: number;
      }[]
   >([]);
   const clanTag = '%232QL0GCQGQ';

   useEffect(() => {
      const loadData = async () => {
         try {
            const data = await APIClashService.getClanWarLeagueGroupDetails(clanTag);
            if (data) {
               const results = await processResults(data, clanTag);
               setProcessedResults(results);
            }
         } catch (error) {
            console.error('Error fetching Clan War League Group Details:', error);
         }
      };

      loadData();
   }, []);

   interface Attack {
      destructionPercentage: number;
      stars: number;
   }

   interface Member {
      tag: string;
      name: string;
      attacks?: Attack[];
   }

   interface Clan {
      tag: string;
      members: Member[];
   }

   interface War {
      clan: Clan;
      opponent: Clan;
   }

   interface ClanWarLeagueGroupDetails {
      matchingWars: War[];
   }

   interface PlayerStats {
      name: string;
      totalAttacks: number;
      stars1: number;
      stars2: number;
      stars3: number;
      totalDestruction: number;
      minDestruction: number;
      score: number;
      avgDestruction?: number;
   }

   const processResults = async (
      clanWarLeagueGroupDetails: ClanWarLeagueGroupDetails,
      clanTag: string
   ): Promise<PlayerStats[]> => {
      const playersStats: Record<string, PlayerStats> = {};

      for (const war of clanWarLeagueGroupDetails.matchingWars) {
         const isClan = war.clan.tag === clanTag.replace('%23', '#');
         const members = isClan ? war.clan.members : war.opponent.members;

         for (const member of members) {
            if (!playersStats[member.tag]) {
               playersStats[member.tag] = {
                  name: member.name,
                  totalAttacks: 0,
                  stars1: 0,
                  stars2: 0,
                  stars3: 0,
                  totalDestruction: 0,
                  minDestruction: 100,
                  score: 0,
               };
            }

            if (member.attacks) {
               for (const attack of member.attacks) {
                  playersStats[member.tag].totalAttacks++;
                  playersStats[member.tag].totalDestruction += attack.destructionPercentage;
                  playersStats[member.tag].minDestruction = Math.min(
                     playersStats[member.tag].minDestruction,
                     attack.destructionPercentage
                  );

                  if (attack.stars === 1) playersStats[member.tag].stars1++;
                  if (attack.stars === 2) playersStats[member.tag].stars2++;
                  if (attack.stars === 3) playersStats[member.tag].stars3++;

                  playersStats[member.tag].score += attack.stars; // Simplified score calculation
               }
            }
         }
      }

      return Object.values(playersStats)
         .map((player) => ({
            ...player,
            avgDestruction: player.totalAttacks
               ? player.totalDestruction / player.totalAttacks
               : 0 as number,
         }))
         .sort((a, b) => b.score - a.score);
   };

   return (
      <div>
         <h1>Puntos de Liga</h1>
         <table>
            <thead>
               <tr>
                  <th>Nombre</th>
                  <th>Media de Destrucción (%)</th>
                  <th>Min Destrucción (%)</th>
                  <th>1 Estrella</th>
                  <th>2 Estrellas</th>
                  <th>3 Estrellas</th>
                  <th>Ataques Totales</th>
                  <th>Puntuación Total</th>
               </tr>
            </thead>
            <tbody>
               {processedResults.map((player, index) => (
                  <tr key={index}>
                     <td>{player.name || 'N/A'}</td>
                     <td>{player.avgDestruction.toFixed(2)}</td>
                     <td>{player.minDestruction.toFixed(2)}</td>
                     <td>{player.stars1}</td>
                     <td>{player.stars2}</td>
                     <td>{player.stars3}</td>
                     <td>{player.totalAttacks}</td>
                     <td>{player.score}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
};

export default LeaguePointsPage;
