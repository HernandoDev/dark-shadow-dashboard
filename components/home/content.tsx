import React, { useState } from 'react';
import { Text, Link } from '@nextui-org/react';
import { Box } from '../styles/box';
import dynamic from 'next/dynamic';
import { Flex } from '../styles/flex';
import { TableWrapper } from '../table/table';
import NextLink from 'next/link';
import { CardBalance1 } from './card-balance1';
import { CardBalance2 } from './card-balance2';
import { CardBalance3 } from './card-balance3';
import { CardAgents } from './card-agents';
import { APIClashService } from '../../services/apiClashService';

import { CardTransactions } from './card-transactions';
import { Star } from 'react-feather';

const Chart = dynamic(
   () => import('../charts/steam').then((mod) => mod.Steam),
   {
      ssr: false,
   }
);

type Player = {
   member: string;
   stars: number;
   percentage: number;
   army: string;
   points: number; // Add points property
};

export const Content = () => {
   const [attackLogs, setAttackLogs] = React.useState<any[] | null>(null);
   const [topPlayers, setTopPlayers] = React.useState<Player[]>([]);
   const [chartData, setChartData] = React.useState<{ attack: string; stars: number }[]>([]);
   const [warStatus, setWarStatus] = React.useState<any | null>(null); // State to store the latest war status
   const [warSaves, setWarSaves] = useState<any[]>([]); // State to store war saves
   const [warLeageSaves, setWarLeageSaves] = useState<any[]>([]); // State to store war saves
   const [LeageGroupsSaves, setLeageGroupsSaves] = useState<any[]>([]); // State to store war saves
   const [summaryLiga, setSummaryLiga] = useState<any[]>([]); // Nuevo estado para el resumen de liga
   const [summaryWar, setSummaryWar] = useState<any[]>([]); // Nuevo estado para resumen de guerra normal
   const [summaryCombined, setSummaryCombined] = useState<any[]>([]); // Nuevo estado para resumen combinado
   const [members, setMembers] = useState<any[]>([]); // Store members for later use

   const calculatePoints = (stars: number, memberThLevel: string, thRival: string): number => {
      const memberLevel = parseInt(memberThLevel.replace('TH', ''), 10);
      const rivalLevel = parseInt(thRival.replace('TH', ''), 10);
      let points = stars;

      if (memberLevel > rivalLevel) {
         points -= 0.5; // Subtract 0.5 points if attacking a lower TH
      } else if (memberLevel < rivalLevel) {
         points += stars === 3 ? 0.5 : 0.25; // Add 0.5 for 3 stars, 0.25 otherwise
      }

      return points;
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

   React.useEffect(() => {
      const fetchAttackLogs = async () => {
         const response = await APIClashService.getWarSaves();
         setWarSaves(response.normalWars);
         setWarLeageSaves(response.leagueWars);
         setLeageGroupsSaves(response.leagueGroups);
         let data = await APIClashService.getAttackLogs();
         setAttackLogs(data);
         const response2 = await APIClashService.getClanMembers(); // Clan Principal
         const memberNames = response2.items.map((member: { tag: string }) => member.tag);
         // Define the type for playerStats
         setMembers(memberNames); 

         // Group attacks by player and calculate total stars, average percentage, and most used army
         interface Attack {
            member: string;
            stars: number;
            percentage: number;
            attack: string;
            memberThLevel: string;
            thRival: string;
         }

         interface PlayerStats {
            stars: number;
            percentage: number;
            attacks: number;
            army: string;
            points: number;
         }

         const playerStats: Record<string, PlayerStats> = data.reduce((acc: Record<string, PlayerStats>, attack: Attack) => {
            if (!acc[attack.member]) {
               acc[attack.member] = { stars: 0, percentage: 0, attacks: 0, army: attack.attack, points: 0 };
            }
            acc[attack.member].stars += attack.stars;
            acc[attack.member].percentage += attack.percentage;
            acc[attack.member].attacks += 1;
            acc[attack.member].points += calculatePoints(attack.stars, attack.memberThLevel, attack.thRival); // Calculate points
            return acc;
         }, {} as Record<string, PlayerStats>);

         // Calculate average percentage and sort players by total points, stars, and average percentage
         const sortedPlayers = Object.entries(playerStats)
            .map(([member, stats]: [string, PlayerStats]) => ({ // Explicitly type stats as PlayerStats
               member,
               stars: stats.stars,
               percentage: stats.percentage / stats.attacks,
               army: stats.army,
               points: stats.points, // Include points
            }))
            .sort((a, b) => b.points - a.points || b.stars - a.stars || b.percentage - a.percentage)

         setTopPlayers(sortedPlayers);

         // Calculate average stars for each type of attack
         const attackStats = data.reduce((acc: Record<string, { totalStars: number; count: number }>, log: { attack: string; stars: number }) => {
            if (!acc[log.attack]) {
               acc[log.attack] = { totalStars: 0, count: 0 };
            }
            acc[log.attack].totalStars += log.stars;
            acc[log.attack].count += 1;
            return acc;
         }, {} as Record<string, { totalStars: number; count: number }>);

         const formattedData = Object.entries(attackStats as Record<string, { totalStars: number; count: number }>).map(
            ([attack, stats]: [string, { totalStars: number; count: number }]) => ({
               attack,
               stars: parseFloat((stats.totalStars / stats.count).toFixed(2)), // Calculate average and format to 2 decimals
            })
         );

         setChartData(formattedData);
      };
      fetchAttackLogs();
   }, []);

   React.useEffect(() => {
      const fetchWarStatus = async () => {
         try {
            const warSaves = await APIClashService.getWarSaves();

            if (warSaves.normalWars.length > 0) {
               const latestWar = warSaves.normalWars[0]; // Get the latest war save
               setWarStatus(latestWar.content); // Set the war status
            }
         } catch (error) {
            console.error('Error fetching war status:', error);
         }
      };

      fetchWarStatus();
   }, []);

   // Helper para obtener el clanTag seleccionado
   const getClanTag = () => {
      if (typeof window === 'undefined') return '';
      return localStorage.getItem('clanTag') || '%232QL0GCQGQ';
   };

   // Nuevo useEffect para calcular el resumen de liga
   React.useEffect(() => {
      
      if (!warLeageSaves || warLeageSaves.length === 0 || !members.length) return;

      const clanTag = getClanTag().replace('%23', '#');
      const memberTags = new Set(members);
      const playerMap: Record<string, {
         tag: string;
         name: string;
         townhallLevel: number;
         totalStars: number;
         totalDestruction: number;
         totalAttacks: number;
      }> = {};

      warLeageSaves.forEach((war: any) => {
         let warMembers: any[] = [];
         if (war.content?.clan?.tag === clanTag) {
            warMembers = war.content.clan.members || [];
         } else if (war.content?.opponent?.tag === clanTag) {
            warMembers = war.content.opponent.members || [];
         }

         warMembers.forEach((member: any) => {
            if (!memberTags.has(member.tag)) return; // Solo miembros actuales

            if (Array.isArray(member.attacks)) {
               member.attacks.forEach((attack: any) => {
                  if (!playerMap[member.tag]) {
                     playerMap[member.tag] = {
                        tag: member.tag,
                        name: member.name,
                        townhallLevel: member.townhallLevel,
                        totalStars: 0,
                        totalDestruction: 0,
                        totalAttacks: 0,
                     };
                  }
                  playerMap[member.tag].totalStars += attack.stars;
                  playerMap[member.tag].totalDestruction += attack.destructionPercentage;
                  playerMap[member.tag].totalAttacks += 1;
               });
            }
         });
      });

      const summaryArr = Object.values(playerMap)
         .filter(p => p.totalAttacks > 0)
         .map(p => {
            const avgStars = p.totalStars / p.totalAttacks;
            const avgDestruction = p.totalDestruction / p.totalAttacks;
            const score = avgStars * (1 + Math.log(p.totalAttacks));
            return {
               tag: p.tag,
               name: p.name,
               townhallLevel: p.townhallLevel,
               avgStars,
               avgDestruction,
               totalAttacks: p.totalAttacks,
               score,
            };
         })
         .sort((a, b) =>
            b.score - a.score ||
            b.avgDestruction - a.avgDestruction
         );

      setSummaryLiga(summaryArr);

   }, [warLeageSaves, members]);

   // Nuevo useEffect para calcular el resumen de guerras normales
   React.useEffect(() => {
      if (!warSaves || warSaves.length === 0 || !members.length) return;

      const clanTag = getClanTag().replace('%23', '#');
      const memberTags = new Set(members);

      const playerMap: Record<string, {
         tag: string;
         name: string;
         townhallLevel: number;
         totalStars: number;
         totalDestruction: number;
         totalAttacks: number;
      }> = {};

      warSaves.forEach((war: any) => {
         let warMembers: any[] = [];
         if (war.content?.clan?.tag === clanTag) {
            warMembers = war.content.clan.members || [];
         } else if (war.content?.opponent?.tag === clanTag) {
            warMembers = war.content.opponent.members || [];
         }
         warMembers.forEach((member: any) => {
            if (!memberTags.has(member.tag)) return; // Solo miembros actuales
            if (Array.isArray(member.attacks)) {
               member.attacks.forEach((attack: any) => {
                  if (!playerMap[member.tag]) {
                     playerMap[member.tag] = {
                        tag: member.tag,
                        name: member.name,
                        townhallLevel: member.townhallLevel,
                        totalStars: 0,
                        totalDestruction: 0,
                        totalAttacks: 0,
                     };
                  }
                  playerMap[member.tag].totalStars += attack.stars;
                  playerMap[member.tag].totalDestruction += attack.destructionPercentage;
                  playerMap[member.tag].totalAttacks += 1;
               });
            }
         });
      });

      const summaryArr = Object.values(playerMap)
         .filter(p => p.totalAttacks > 0)
         .map(p => {
            const avgStars = p.totalStars / p.totalAttacks;
            const avgDestruction = p.totalDestruction / p.totalAttacks;
            const score = avgStars * (1 + Math.log(p.totalAttacks));
            return {
               tag: p.tag,
               name: p.name,
               townhallLevel: p.townhallLevel,
               avgStars,
               avgDestruction,
               totalAttacks: p.totalAttacks,
               score,
            };
         })
         .sort((a, b) =>
            b.score - a.score ||
            b.avgDestruction - a.avgDestruction
         );

      setSummaryWar(summaryArr);
   }, [warSaves, members]);

   // Nuevo useEffect para calcular el resumen combinado
   React.useEffect(() => {
      if ((!summaryLiga.length && !summaryWar.length) || !members.length) return;

      const memberTags = new Set(members);
      const LIGA_FACTOR = 1.5;

      const combinedMap: Record<string, {
         tag: string;
         name: string;
         townhallLevel: number;
         totalStars: number;
         totalDestruction: number;
         totalAttacks: number;
         totalStarsLiga: number;
         totalDestructionLiga: number;
         totalAttacksLiga: number;
         totalStarsWar: number;
         totalDestructionWar: number;
         totalAttacksWar: number;
      }> = {};

      summaryWar.forEach((p: any) => {
         if (!memberTags.has(p.tag)) return;
         combinedMap[p.tag] = {
            tag: p.tag,
            name: p.name,
            townhallLevel: p.townhallLevel,
            totalStars: p.avgStars * p.totalAttacks,
            totalDestruction: p.avgDestruction * p.totalAttacks,
            totalAttacks: p.totalAttacks,
            totalStarsLiga: 0,
            totalDestructionLiga: 0,
            totalAttacksLiga: 0,
            totalStarsWar: p.avgStars * p.totalAttacks,
            totalDestructionWar: p.avgDestruction * p.totalAttacks,
            totalAttacksWar: p.totalAttacks,
         };
      });

      summaryLiga.forEach((p: any) => {
         if (!memberTags.has(p.tag)) return;
         if (!combinedMap[p.tag]) {
            combinedMap[p.tag] = {
               tag: p.tag,
               name: p.name,
               townhallLevel: p.townhallLevel,
               totalStars: 0,
               totalDestruction: 0,
               totalAttacks: 0,
               totalStarsLiga: 0,
               totalDestructionLiga: 0,
               totalAttacksLiga: 0,
               totalStarsWar: 0,
               totalDestructionWar: 0,
               totalAttacksWar: 0,
            };
         }
         combinedMap[p.tag].totalStars += p.avgStars * p.totalAttacks * LIGA_FACTOR;
         combinedMap[p.tag].totalDestruction += p.avgDestruction * p.totalAttacks * LIGA_FACTOR;
         combinedMap[p.tag].totalAttacks += p.totalAttacks * LIGA_FACTOR;
         combinedMap[p.tag].totalStarsLiga = p.avgStars * p.totalAttacks;
         combinedMap[p.tag].totalDestructionLiga = p.avgDestruction * p.totalAttacks;
         combinedMap[p.tag].totalAttacksLiga = p.totalAttacks;
      });

      const combinedArr = Object.values(combinedMap)
         .filter(p => p.totalAttacks > 0)
         .map(p => {
            const avgStars = p.totalStars / p.totalAttacks;
            const avgDestruction = p.totalDestruction / p.totalAttacks;
            const score = avgStars * (1 + Math.log(p.totalAttacks));
            return {
               tag: p.tag,
               name: p.name,
               townhallLevel: p.townhallLevel,
               avgStars,
               avgDestruction,
               totalAttacks: p.totalAttacks,
               score,
               totalStarsLiga: p.totalStarsLiga,
               totalAttacksLiga: p.totalAttacksLiga,
               totalStarsWar: p.totalStarsWar,
               totalAttacksWar: p.totalAttacksWar,
            };
         })
         .sort((a, b) =>
            b.score - a.score ||
            b.avgDestruction - a.avgDestruction
         );

      setSummaryCombined(combinedArr);
   }, [summaryLiga, summaryWar, members]);

   return (
      <Box css={{ overflow: 'hidden', height: '100%' }}>
         <Flex
            css={{
               'gap': '$8',
               'pt': '$5',
               'height': 'fit-content',
               'flexWrap': 'wrap',
               '@lg': {
                  flexWrap: 'nowrap',
               },
               '@sm': {
                  pt: '$10',
               },
            }}
            justify={'center'}
         >
            <Flex
               css={{
                  'px': '$12',
                  'mt': '$8',
                  '@xsMax': { px: '$10' },
                  'gap': '$12',
               }}
               direction={'column'}
            >
               <Box className='animate__animated animate__backInRight card'>
                  <Text
                     h3
                     css={{
                        'textAlign': 'center',
                        '@sm': {
                           textAlign: 'inherit',
                        },
                     }}
                  >
                     Estado de la Guerra del Clan
                  </Text>
                  {warStatus ? (
                     <Box

                     >
                        <Text>
                           <strong>Fecha:</strong> {formatDate(warStatus.startTime)}
                        </Text>
                        <Text >
                           <strong>Estado:</strong> {warStatus.state || 'Desconocido'}
                        </Text>
                        <Text
                           css={{
                              color:
                                 warStatus.clan.stars > warStatus.opponent.stars ||
                                    (warStatus.clan.stars === warStatus.opponent.stars &&
                                       warStatus.clan.destructionPercentage > warStatus.opponent.destructionPercentage)
                                    ? 'green'
                                    : 'red',
                           }}
                        >
                           <strong>{warStatus.clan.name}:</strong> {warStatus.clan.stars}
                           <Star size={16} style={{ marginRight: '5px' }} /> - {warStatus.clan.destructionPercentage.toFixed(2)}%
                        </Text>
                        <Text
                           css={{
                              color:
                                 warStatus.opponent.stars > warStatus.clan.stars ||
                                    (warStatus.opponent.stars === warStatus.clan.stars &&
                                       warStatus.opponent.destructionPercentage > warStatus.clan.destructionPercentage)
                                    ? 'green'
                                    : 'red',
                           }}
                        >
                           <strong>{warStatus.opponent.name}:</strong> {warStatus.opponent.stars}
                           <Star size={16} style={{ marginRight: '5px' }} /> - {warStatus.opponent.destructionPercentage.toFixed(2)}%
                        </Text>
                     </Box>
                  ) : (
                     <Text css={{ textAlign: 'center', color: 'red' }}>
                        No se encontró información sobre la guerra.
                     </Text>
                  )}
               </Box>
               {/* Card Section Top */}
               <Box>
                  <Text
                     h3
                     css={{
                        'textAlign': 'center',
                        '@sm': {
                           textAlign: 'inherit',
                        },
                     }}
                  >
                     Top 5 Jugadores Combinados
                  </Text>
                  <Flex
                     css={{
                        'gap': '$10',
                        'flexWrap': 'wrap',
                        'justifyContent': 'center',
                        '@sm': {
                           flexWrap: 'nowrap',
                        },
                     }}
                     direction={'row'}
                  >
                     {summaryCombined.slice(0, 5).map((player, index) => (
                        <CardBalance1 key={player.tag} player={player} position={index + 1} />
                     ))}
                  </Flex>
               </Box>

               <Box>
                  <Text
                     h3
                     css={{
                        'textAlign': 'center',
                        'color': 'red',
                        '@sm': {
                           textAlign: 'inherit',
                        },
                     }}
                  >
                     Peores 5 Jugadores Combinados
                  </Text>
                  <Flex
                     css={{
                        'gap': '$10',
                        'flexWrap': 'wrap',
                        'justifyContent': 'center',
                        '@sm': {
                           flexWrap: 'nowrap',
                        },
                     }}
                     direction={'row'}
                  >
                     {summaryCombined.slice(-5).reverse().map((player, index) => (
                        <CardBalance1
                           key={player.tag}
                           player={player}
                           position={summaryCombined.length - 4 + index}
                        />
                     ))}
                  </Flex>
               </Box>



               {/* Chart */}
               <Box>

               </Box>

               <Box>
                  <Text
                     h3
                     css={{
                        'textAlign': 'center',
                        '@lg': {
                           textAlign: 'inherit',
                        },
                     }}
                  >
                     Rendimiento en Estrellas por Tipo de Ataque
                  </Text>
                  <Box
                     css={{
                        width: '100%',
                        backgroundColor: '$accents0',
                        boxShadow: '$lg',
                        borderRadius: '$2xl',
                        px: '$10',
                        py: '$10',
                     }}
                  >
                     <Chart chartData={chartData} />
                  </Box>
               </Box>
            </Flex>

            {/* Left Section */}
            <Box
               css={{
                  'px': '$12',
                  'mt': '$8',
                  'height': 'fit-content',
                  '@xsMax': { px: '$10' },
                  'gap': '$6',
                  'overflow': 'hidden',
               }}
            >
               {/* <Text
                  h3
                  css={{
                     'textAlign': 'center',
                     '@lg': {
                        textAlign: 'inherit',
                     },
                  }}
               >
                  Top Jugadores Liga 
               </Text> */}
               <Flex
                  direction={'column'}
                  justify={'center'}
                  css={{
                     'gap': '$8',
                     'flexDirection': 'row',
                     'flexWrap': 'wrap',
                     '@sm': {
                        flexWrap: 'nowrap',
                     },
                     '@lg': {
                        flexWrap: 'nowrap',
                        flexDirection: 'column',
                     },
                  }}
               >
                  {/* <CardAgents /> */}
                  <CardTransactions filterType="bad" />
               </Flex>
            </Box>
         </Flex>

         {/* Table Latest Users */}
         <Flex
            direction={'column'}
            justify={'center'}
            css={{
               'width': '100%',
               'py': '$10',
               'px': '$10',
               'mt': '$8',
               '@sm': { px: '$20' },
            }}
         >

         </Flex>


      </Box>
   );
};
