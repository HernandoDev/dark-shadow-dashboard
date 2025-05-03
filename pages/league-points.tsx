import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';

// Define the type if it doesn't exist
type ClanWarLeagueGroupDetails = {
   matchingWars: {
      clan: {
         tag: string;
         members: {
            tag: string;
            name: string;
            townhallLevel: number;
            attacks?: {
               stars: number;
               destructionPercentage: number;
               defenderTag: string;
            }[];
         }[];
      };
      opponent: {
         members: {
            tag: string;
            name: string;
            townhallLevel: number;
            attacks?: {
               stars: number;
               destructionPercentage: number;
               defenderTag: string;
            }[];
         }[];
      };
   }[];
};

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
   const [leagueSummaryResults, setLeagueSummaryResults] = useState<
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
   const [activeTab, setActiveTab] = useState<'table' | 'summary'>('table'); // State for active tab

   useEffect(() => {
      const loadData = async () => {
         try {
            const data = await APIClashService.getClanWarLeagueGroupDetails();

            const leagueSaves = await APIClashService.getLeagueGroupSaves();
            if (leagueSaves && leagueSaves.leagueSaves) {
               console.log('League Saves:', leagueSaves.leagueSaves); // Debugging output
            }

            if (data) {
               const results = await processResults(data, clanTag);
               setProcessedResults(results);
            }
         } catch (error) {
            console.error('Error fetching data:', error);
         }
      };

      loadData();
   }, []);

   useEffect(() => {
      const loadLeagueSummary = async () => {
         try {
            const leagueSaves = await APIClashService.getLeagueGroupSaves();
            if (leagueSaves && leagueSaves.leagueSaves) {
               const results = await processLeagueSummaryResults(leagueSaves.leagueSaves, clanTag);
               setLeagueSummaryResults(results);
            }
         } catch (error) {
            console.error('Error fetching league summary:', error);
         }
      };

      loadLeagueSummary();
   }, []);

   // Define the PlayerStats type
   type PlayerStats = {
      name: string;
      totalAttacks: number;
      stars1: number;
      stars2: number;
      stars3: number;
      totalDestruction: number;
      minDestruction: number;
      score: number;
      avgDestruction: number;
   };
   
   const processResults = async (
      clanWarLeagueGroupDetails: ClanWarLeagueGroupDetails, // Updated type
      clanTag: string
   ): Promise<PlayerStats[]> => {
      const playersStats: Record<string, PlayerStats> = {};

      for (const war of clanWarLeagueGroupDetails.matchingWars) {
         const isClan = war.clan.tag === clanTag.replace('%23', '#');
         const members = isClan ? war.clan.members : war.opponent.members;
         const enemies = isClan ? war.opponent.members : war.clan.members; // New variable for enemy members

         for (const member of members) {
            if (!playersStats[member.tag]) {
               playersStats[member.tag] = {
                  name: member.name,
                  totalAttacks: 0,
                  stars1: 0,
                  stars2: 0,
                  stars3: 0,
                  totalDestruction: 0,
                  minDestruction: 0,
                  score: 0,
                  avgDestruction: 0, // Initialize avgDestruction with 0
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
                  if (attack.stars === 3) {
                     playersStats[member.tag].stars3++;
                     playersStats[member.tag].score += 3; // Add 3 points for 3 stars

                     // Check if the enemy's townhallLevel is higher
                     const enemy = enemies.find((e) => e.tag === attack.defenderTag);
                     if (enemy && enemy.townhallLevel > member.townhallLevel) {
                        playersStats[member.tag].score += 0.25; // Add 0.25 points for attacking a higher-level townhall
                     }
                  } else {
                     playersStats[member.tag].score += attack.stars; // Add stars to score
                  }
               }
            }
         }
      }
      debugger

      return Object.values(playersStats)
         .map((player) => ({
            ...player,
            avgDestruction: player.totalAttacks
               ? player.totalDestruction / player.totalAttacks
               : 0, // Ensure avgDestruction is always a number
         }))
         .sort((a, b) => b.score - a.score);
   };

   const processLeagueSummaryResults = async (leagueSaves: any[], clanTag: string) => {
      const playersStats: Record<string, PlayerStats> = {};

      for (const save of leagueSaves) {
         const clan = save.content.leagueGroupData.clans.find(
            (clan: any) => clan.tag === clanTag.replace('%23', '#')
         );

         if (clan) {
            for (const member of clan.members) {
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
                     avgDestruction: 0,
                  };
               }
            
            }
         }
      }

      return Object.values(playersStats)
         .map((player) => ({
            ...player,
            avgDestruction: player.totalAttacks
               ? player.totalDestruction / player.totalAttacks
               : 0,
         }))
         .sort((a, b) => b.score - a.score);
   };

   return (
      <div className="league-points-container">
         <h1 className="neonText">Puntos de Liga</h1>

         {/* Tabs */}
         <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
            <button
               className={`tabButton ${activeTab === 'table' ? 'active' : ''}`}
               onClick={() => setActiveTab('table')}
            >
               <span>Clasificación de Liga actual</span>
               <div className="top"></div>
               <div className="left"></div>
               <div className="bottom"></div>
               <div className="right"></div>
            </button>
            <button
               className={`tabButton ${activeTab === 'summary' ? 'active' : ''}`}
               onClick={() => setActiveTab('summary')}
            >
               <span>Clasificación de Ligas global</span>
               <div className="top"></div>
               <div className="left"></div>
               <div className="bottom"></div>
               <div className="right"></div>
            </button>
         </div>

         {/* Explanatory Text */}
         <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            {activeTab === 'table' && <p><span style={{color:'violet'}}>
               En esta ventana se refleja la clasificacion de los jugadores en la Liga de Guerra actual! </span><br /><br /> Los puntos se calculan según las estrellas que gana cada jugador en sus ataques durante las guerras de clanes. Cada estrella vale 1 punto.
Si un jugador hace un ataque perfecto (3 estrellas) contra alguien con un ayuntamiento de nivel más alto, gana 0.25 puntos extra.
Esto premia a los que atacan a enemigos más difíciles y los anima a ser más estratégicos.
               </p>}
            {activeTab === 'summary' && <p><span style={{color:'violet'}}>En esta ventana se refleja una clasificacion global desde el 1 de mayo de 2025</span><br /><br /> Los puntos se calculan según las estrellas que gana cada jugador en sus ataques durante las guerras de clanes. Cada estrella vale 1 punto.
Si un jugador hace un ataque perfecto (3 estrellas) contra alguien con un ayuntamiento de nivel más alto, gana 0.25 puntos extra.
Esto premia a los que atacan a enemigos más difíciles y los anima a ser más estratégicos.</p>}
         </div>

         {/* Tab Content */}
         {activeTab === 'table' && (
            <div className="table-container" style={{ overflow: 'auto', maxHeight: '500px' }}>
               <table className="responsive-table">
                  <thead className="sticky-header">
                     <tr>
                        <th>#</th>
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
                           <td>{index + 1}</td>
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
         )}

         {activeTab === 'summary' && (
            <div className="table-container" style={{ overflow: 'auto', maxHeight: '500px' }}>
               <table className="responsive-table">
                  <thead className="sticky-header">
                     <tr>
                        <th>#</th>
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
                     {leagueSummaryResults.map((player, index) => (
                        <tr key={index}>
                           <td>{index + 1}</td>
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
         )}
      </div>
   );
};

export default LeaguePointsPage;