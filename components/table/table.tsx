'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { Table, Input, Button, Pagination, Modal, useModal, Text } from '@nextui-org/react';
import { Box } from '../styles/box';
import { APIClashService } from '../../services/apiClashService';
import { useMediaQuery } from 'react-responsive'; // Import useMediaQuery for responsiveness
import Card from '../card/Card'; // Import the Card component
import { fetchSavedAttacks } from '../../utils/fetchSavedAttacks'; // Adjust the path as needed

interface Member {
   tag: string;
   name: string;
   townHallLevel: number;
   heroes?: { level: number, equipment?: { name: string, level: number, maxLevel: number, village: string }[] }[];
   role?: string;
   donations?: number;
   donationsReceived?: number;
   troops?: { name: string, level: number, maxLevel: number, village: string }[];
   heroEquipment?: { name: string, level: number, maxLevel: number, village: string }[];
}

interface AttackLog {
   id: number;
   member: string;
   attack: string;
   percentage: number;
   stars: number;
   timestamp: string;
}

// Define the type for requisitosPorAyuntamiento
type RequisitosPorAyuntamiento = {
   [key: string]: {
      casaMascotas: { nivelMaximo: number };
      mascotas: { [key: string]: number };
      tropas: { [key: string]: number };
      equipamento: {
         comun: number;
         epica: number;
         recomendadoComun: number;
         recomendadoEpica: number;
      };
   };
};

const requisitosPorAyuntamiento: RequisitosPorAyuntamiento = {
   TH14: {
      casaMascotas: { nivelMaximo: 4 },
      mascotas: { 'L.A.S.S.I': 10, 'Electro Owl': 10, 'Mighty Yak': 10, Unicorn: 10 },
      tropas: {},
      equipamento: { comun: 15, epica: 21, recomendadoComun: 18, recomendadoEpica: 24 },
   },
   TH15: {
      casaMascotas: { nivelMaximo: 8 },
      mascotas: {
         'L.A.S.S.I': 15, 'Electro Owl': 15, 'Mighty Yak': 15, Unicorn: 10,
         Frosty: 10, Diggy: 10, 'Poison Lizard': 10, Phoenix: 10,
         'Spirit Fox': 10, 'Angry Jelly': 10
      },
      tropas: {
         Barbarian: 11, Archer: 11, Giant: 11, Goblin: 11, "Wall Breaker": 11,
         Balloon: 10, Wizard: 11, Healer: 8, Dragon: 10, 'P.E.K.K.A': 10,
         'Baby Dragon': 9, Miner: 9, 'Electro Dragon': 6, Yeti: 5,
         'Dragon Rider': 3, 'Electro Titan': 4, Minion: 12, 'Hog Rider': 13,
         Valkyrie: 10, Golem: 12, Witch: 6, 'Lava Hound': 8,
         Bowler: 7, 'Ice Golem': 7,
      },
      equipamento: { comun: 15, epica: 21, recomendadoComun: 18, recomendadoEpica: 24 },
   },
   TH16: {
      casaMascotas: { nivelMaximo: 10 },
      mascotas: {
         'L.A.S.S.I': 15, 'Electro Owl': 15, 'Mighty Yak': 15, Unicorn: 10,
         Frosty: 10, Diggy: 10, 'Poison Lizard': 10, Phoenix: 10,
         'Spirit Fox': 10, 'Angry Jelly': 10,
      },
      tropas: {
         Barbarian: 12, Archer: 12, Giant: 12, Goblin: 12, "Wall Breaker": 12,
         Balloon: 12, Wizard: 12, Healer: 9, Dragon: 11, 'P.E.K.K.A': 11,
         'Baby Dragon': 10, Miner: 10, 'Electro Dragon': 7, Yeti: 6,
         'Dragon Rider': 4, 'Electro Titan': 4, Minion: 12, 'Hog Rider': 13,
         Valkyrie: 11, Golem: 13, Witch: 7, 'Lava Hound': 8,
         Bowler: 8, 'Ice Golem': 8,
      },
      equipamento: { comun: 15, epica: 21, recomendadoComun: 18, recomendadoEpica: 24 },
   },
   TH17: {
      casaMascotas: { nivelMaximo: 10 },
      mascotas: {
         'L.A.S.S.I': 15, 'Electro Owl': 15, 'Mighty Yak': 15, Unicorn: 15,
         Frosty: 10, Diggy: 10, 'Poison Lizard': 10, Phoenix: 10,
         'Spirit Fox': 10, 'Angry Jelly': 10,
      },
      tropas: {
         Barbarian: 12, Archer: 12, Giant: 12, Goblin: 12, "Wall Breaker": 12,
         Balloon: 12, Wizard: 12, Healer: 9, Dragon: 11, 'P.E.K.K.A': 11,
         'Baby Dragon': 10, Miner: 10, 'Electro Dragon': 7, Yeti: 6,
         'Dragon Rider': 5, 'Electro Titan': 4, Minion: 12, 'Hog Rider': 13,
         Valkyrie: 11, Golem: 13, Witch: 7, 'Lava Hound': 8,
         Bowler: 8, 'Ice Golem': 8,
      },
      equipamento: { comun: 15, epica: 21, recomendadoComun: 18, recomendadoEpica: 24 },
   },
};

const renderValidatedList = (
   items: { name: string; level: number; maxLevel: number }[],
   requirements: { [key: string]: number },
   translateName: (name: string) => string,
   isEquipment: boolean = false // Add a flag to differentiate equipment logic
) => {
   const excludedTroops = [
      'Super Barbarian', 'Super Archer', 'Super Wall Breaker', 'Super Giant', 'Sneaky Goblin',
      'Super Miner', 'Rocket Balloon', 'Inferno Dragon', 'Super Valkyrie', 'Super Witch',
      'Ice Hound', 'Super Bowler', 'Super Dragon', 'Super Wizard', 'Super Minion',
      'Super Hog Rider', 'Root Rider', 'Druid', 'Thrower', 'Troop Launcher', 'Furnace'
   ];

   return items
      .filter(({ name }) => !excludedTroops.includes(name)) // Exclude "super" troops
      .map(({ name, level, maxLevel }, index) => {
         const requiredLevel = requirements[name] || maxLevel; // Default to maxLevel if no requirement is defined
         let color = '#16a34a'; // Default to green

         if (isEquipment) {
            // Custom logic for equipment
            if (level <= 14) {
               color = '#dc2626'; // Red
            } else if (level >= 15 && level <= 17) {
               color = '#f59e0b'; // Yellow
            } else if (level >= 18) {
               color = '#16a34a'; // Green
            }
         } else {
            // Default logic for troops
            const difference = requiredLevel - level;
            if (difference === 1 || difference === 2) {
               color = '#f59e0b'; // Yellow/Warning
            } else if (difference >= 3) {
               color = '#dc2626'; // Red
            }
         }

         return (
            <li key={index} style={{ color: '#1e293b' }}>
               {translateName(name)}: <span style={{ color }}>{`Nivel ${level}`}</span> / {requiredLevel}
            </li>
         );
      });
};

export const TableWrapper = () => {
   const [members, setMembers] = useState<Member[]>([]);
   const [loading, setLoading] = useState(true);
   const [attackLogs, setAttackLogs] = useState<AttackLog[]>([]); // Explicitly type attackLogs
   const [minLevels, setMinLevels] = useState({
      th: '15',
      rey: '85',
      reina: '85',
      centinela: '60',
      luchadora: '35',
      principe: '55',
   });

   const [clanTag, setClanTag] = useState('%232QL0GCQGQ'); // Updated to use state
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedMember, setSelectedMember] = useState<Member | null>(null);
   const { setVisible, bindings } = useModal(); // Modal control
   const isMobile = useMediaQuery({ query: '(max-width: 768px)' }); // Check if the screen is mobile size

   const translateName = (name: string): string => {
      const translations: { [key: string]: string } = {
         // Tropas
         "Barbarian": "Bárbaro",
         "Archer": "Arquera",
         "Goblin": "Duende",
         "Giant": "Gigante",
         "Wall Breaker": "Rompe Muros",
         "Balloon": "Globo",
         "Wizard": "Mago",
         "Healer": "Sanadora",
         "Dragon": "Dragón",
         "P.E.K.K.A": "P.E.K.K.A",
         "Minion": "Esbirro",
         "Hog Rider": "Montapuercos",
         "Valkyrie": "Valquiria",
         "Golem": "Gólem",
         "Witch": "Bruja",
         "Lava Hound": "Sabueso de Lava",
         "Bowler": "Lanzarrocas",
         "Baby Dragon": "Baby Dragon",
         "Miner": "Minero",
         "Super Barbarian": "Súper Bárbaro",
         "Super Archer": "Súper Arquera",
         "Super Wall Breaker": "Súper Rompe Muros",
         "Super Giant": "Súper Gigante",
         "Wall Wrecker": "Demoledor de Muros (ASEDIO)",
         "Battle Blimp": "Dirigible de Batalla",
         "Yeti": "Yeti",
         "Sneaky Goblin": "Super Duende",
         "Super Miner": "Súper Minero",
         "Rocket Balloon": "Super Globo",
         "Ice Golem": "Gólem de Hielo",
         "Electro Dragon": "Dragón Eléctrico",
         "Stone Slammer": "Stone Slammer",
         "Inferno Dragon": "Dragón Infernal",
         "Super Valkyrie": "Súper Valquiria",
         "Dragon Rider": "Jinete de Dragón",
         "Super Witch": "Súper Bruja",
         "Siege Barracks": "Cuarteles de Asedio",
         "Ice Hound": "Sabueso de Hielo",
         "Super Bowler": "Súper Lanzarrocas",
         "Super Dragon": "Súper Dragón",
         "Headhunter": "Cazadora",
         "Super Wizard": "Súper Mago",
         "Super Minion": "Súper Esbirro",
         "Log Launcher": "Lanza troncos",
         "Flame Flinger": "Lanzallamas",
         "Battle Drill": "Taladro de Batalla",
         "Electro Titan": "Titánide",
         "Apprentice Warden": "Aprendiz Centinela ",
         "Super Hog Rider": "Súper Montapuercos",
         "Root Rider": "Druidas Salvajes",
         "Druid": "Druida",
         "Thrower": "Lancero",
         // Mascotas
         "L.A.S.S.I": "L.A.S.S.I",
         "Mighty Yak": "Yak Mamut",
         "Electro Owl": "Búho Eléctrico",
         "Unicorn": "Unicornio",
         "Phoenix": "Fénix",
         "Poison Lizard": "Lagarto Venenoso",
         "Diggy": "Pangolin",
         "Frosty": "Morsa de hielo",
         "Spirit Fox": "Zorro Espiritual",
         "Angry Jelly": "Medusa Furiosa",
         "Sneezy": "Achus",
         // Equipamiento de Héroes
         "Giant Gauntlet": "Guantelete Gigante",
         "Rocket Spear": "Lanza Cohete",
         "Frozen Arrow": "Flecha Congelada",
         "Fireball": "Bola de Fuego",
         "Magic Mirror": "Espejo Mágico",
         "Electro Boots": "Botas Eléctricas",
         "Lavaloon Puppet": "Marioneta Lavaloon",
         "Action Figure": "Figura de Acción",
         "Barbarian Puppet": "Marioneta Bárbara",
         "Rage Vial": "Frasco de Furia",
         "Archer Puppet": "Marioneta Arquera",
         "Invisibility Vial": "Frasco de Invisibilidad",
         "Eternal Tome": "Tomo Eterno",
         "Life Gem": "Gema de Vida",
         "Seeking Shield": "Escudo Luchadora",
         "Royal Gem": "Gema Real Luchadora",
         "Earthquake Boots": "Botas de Terremoto",
         "Hog Rider Puppet": "Marioneta Montapuercos",
         "Vampstache": "Bigote Vampírico",
         "Haste Vial": "Frasco de Prisa",
         "Giant Arrow": "Flecha Gigante",
         "Healer Puppet": "Marioneta Sanadora",
         "Rage Gem": "Gema de Furia",
         "Healing Tome": "Tomo de Curación",
         "Henchmen Puppet": "Marioneta de Secuaces",
         "Dark Orb": "Orbe Oscuro",
         "Metal Pants": "Pantalones Metálicos",
         "Noble Iron": "Hierro Noble",
      };
      return translations[name] || name;
   };

   const calculateHeroAverage = (heroes: { level: number }[] = []) => {
      const totalLevels = heroes.reduce((sum, hero) => sum + hero.level, 0);
      return heroes.length > 0 ? totalLevels / heroes.length : 0;
   };

   const sortMembers = (members: Member[]) => {
      return [...members].sort((a, b) => {
         const avgA = calculateHeroAverage(a.heroes);
         const avgB = calculateHeroAverage(b.heroes);
         if (avgB === avgA) {
            return b.townHallLevel - a.townHallLevel; // Sort by Town Hall level if hero averages are equal
         }
         return avgB - avgA; // Sort by hero average
      });
   };

   const getTopUsedArmies = (memberName: string) => {
      const memberAttacks = attackLogs.filter((attack) => attack.member === memberName);
      const armyUsageCount: { [key: string]: number } = {};

      memberAttacks.forEach((attack) => {
         armyUsageCount[attack.attack] = (armyUsageCount[attack.attack] || 0) + 1;
      });

      const sortedArmies = Object.entries(armyUsageCount)
         .sort(([, countA], [, countB]) => countB - countA)
         .map(([army]) => army);

      return sortedArmies.slice(0, 2); // Return top 1 or 2 armies
   };

   useEffect(() => {
      const fetchMembers = async () => {
         try {
            const data = await APIClashService.getClanMembersWithDetails();
            setMembers(data.detailedMembers as Member[] || []);
         } catch (error) {
            console.error('Error fetching members:', error);
         } finally {
            setLoading(false);
         }
      };

      const fetchAttacks = async () => {
         try {
            const attacks = await fetchSavedAttacks(); // Fetch saved attacks
            setAttackLogs(attacks);
         } catch (error) {
            console.error('Error fetching attack logs:', error);
         }
      };

      fetchMembers();
      fetchAttacks(); // Fetch attack logs on component mount
   }, [clanTag]);

   const openModal = (member: any) => {
      setSelectedMember(member);
      setVisible(true);
   };
   // Función para determinar el color basado en la diferencia de niveles
   const getColorByLevelDifference = (currentLevel: number, requiredLevel: number) => {
      const difference = requiredLevel - currentLevel;
      if (difference <= 3) {
         return '#16a34a'; // Verde
      } else if (difference <= 4) {
         return '#f59e0b'; // Amarillo/Naranja
      }
      return '#dc2626'; // Rojo
   };

   const filterMembers = (members: any[], meetsRequirements: boolean) => {
      return members
         .filter((member) =>
            member.name?.toLowerCase().includes(searchQuery.toLowerCase())
         )
         .filter((member) => {
            const meets = {
               th: member.townHallLevel >= (parseInt(minLevels.th) || 0),
               rey: member.heroes?.[0]?.level >= (parseInt(minLevels.rey) || 0),
               reina: member.heroes?.[1]?.level >= (parseInt(minLevels.reina) || 0),
               centinela: member.heroes?.[2]?.level >= (parseInt(minLevels.centinela) || 0),
               luchadora: member.heroes?.[4]?.level >= (parseInt(minLevels.luchadora) || 0),
               principe: member.heroes?.[6]?.level >= (parseInt(minLevels.principe) || 0),
            };
            return meetsRequirements
               ? Object.values(meets).every(Boolean)
               : Object.values(meets).some((value) => !value);
         });
   };

   const membersMeetingRequirements = filterMembers(members, true);
   const membersNotMeetingRequirements = filterMembers(members, false);

   const sortedMeetingRequirements = sortMembers(membersMeetingRequirements);
   const sortedNotMeetingRequirements = sortMembers(membersNotMeetingRequirements);

   return (
      <Box css={{ padding: '20px' }}>
  

         <div
            style={{
               marginTop: '40px',
               display: 'grid',
               gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
               gap: '10px',
            }}
         >
            {(Object.keys(minLevels) as Array<keyof typeof minLevels>).map((key) => (
               <Input
                  key={key}
                  label={`Nivel Minimo ${key.toUpperCase()}`}
                  type="number"
                  value={minLevels[key]}
                  onChange={(e) => setMinLevels({ ...minLevels, [key]: e.target.value })}
                  css={{
                     width: '100%',
                  }}
               />
            ))}
         </div>

         <div
            style={{
               marginTop: '30px',
               display: 'flex',
               flexDirection: isMobile ? 'column' : 'row',
               gap: '10px',
            }}
         >
            <Input
               clearable
               placeholder="Buscar jugador"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               css={{
                  width: '100%',
               }}
            />
         </div>

         {isMobile ? (
            <div>
               <h1 style={{ color: 'greenyellow', fontSize: '24px' }}>Miembros que cumplen los requisitos mínimos</h1>
               {sortedMeetingRequirements.map((member, index) => {
                  const topArmies = getTopUsedArmies(member.name);
                  return (
                     <div className="animate__animated animate__backInLeft" style={{ padding: '15px' }} key={member.tag}>
                        <Card
                           position={index + 1}
                           name={member.name}
                           townHallLevel={member.townHallLevel}
                           heroes={member.heroes || []}
                           onViewDetails={() => openModal(member)}
                           minLevels={{
                              th: parseInt(minLevels.th),
                              rey: parseInt(minLevels.rey),
                              reina: parseInt(minLevels.reina),
                              centinela: parseInt(minLevels.centinela),
                              luchadora: parseInt(minLevels.luchadora),
                              principe: parseInt(minLevels.principe),
                           }}
                           topArmies={topArmies} // Pass topArmies prop
                           tag={member.tag} // Pass tag prop
                        />
                     </div>
                  );
               })}

               <h2 style={{ color: 'red', fontSize: '24px', marginTop: '20px' }}>Miembros que no cumplen los requisitos mínimos</h2>
               {sortedNotMeetingRequirements.map((member, index) => {
                  const topArmies = getTopUsedArmies(member.name);
                  return (
                     <div style={{ padding: '15px' }} key={member.tag}>
                        <Card
                           position={index + 1}
                           name={member.name}
                           townHallLevel={member.townHallLevel}
                           heroes={member.heroes || []}
                           onViewDetails={() => openModal(member)}
                           minLevels={{
                              th: parseInt(minLevels.th),
                              rey: parseInt(minLevels.rey),
                              reina: parseInt(minLevels.reina),
                              centinela: parseInt(minLevels.centinela),
                              luchadora: parseInt(minLevels.luchadora),
                              principe: parseInt(minLevels.principe),
                           }}
                           topArmies={topArmies} // Pass topArmies prop
                           tag={member.tag} // Pass tag prop
                           borderColor="#dc2626" // Add red border for non-compliant members
                        />
                     </div>
                  );
               })}
            </div>
         ) : (
            <>
               <h1 style={{ color: 'greenyellow', fontSize: '32px' }}>Miembros que cumplen los requisitos mínimos</h1>
               <Table
                  aria-label="Members meeting requirements"
                  css={{ height: 'auto', minWidth: '100%' }}
               >
                  <Table.Header>
                     <Table.Column>#</Table.Column>
                     <Table.Column>Jugador</Table.Column>
                     <Table.Column>Nivel TH</Table.Column>
                     <Table.Column>Rey</Table.Column>
                     <Table.Column>Reina</Table.Column>
                     <Table.Column>Centinela</Table.Column>
                     <Table.Column>Luchadora</Table.Column>
                     <Table.Column>Principe</Table.Column>
                     <Table.Column>Ejércitos más usados</Table.Column>
                     <Table.Column>Acciones</Table.Column>
                  </Table.Header>
                  <Table.Body>
                     {sortedMeetingRequirements.map((member, index) => {
                        const topArmies = getTopUsedArmies(member.name); // Get top armies
                        return (
                           <Table.Row key={member.tag}>
                              <Table.Cell>{index + 1}</Table.Cell>
                              <Table.Cell>{` ${member.name || 'N/A'}`}</Table.Cell>
                              <Table.Cell>{`TH ${member.townHallLevel || 'N/A'}`}</Table.Cell>
                              <Table.Cell>{`Rey ${member.heroes?.[0]?.level || 'N/A'}`}</Table.Cell>
                              <Table.Cell>{`Reina ${member.heroes?.[1]?.level || 'N/A'}`}</Table.Cell>
                              <Table.Cell>{`Centinela ${member.heroes?.[2]?.level || 'N/A'}`}</Table.Cell>
                              <Table.Cell>{`Luchadora ${member.heroes?.[4]?.level || 'N/A'}`}</Table.Cell>
                              <Table.Cell>{`Principe ${member.heroes?.[6]?.level || 'N/A'}`}</Table.Cell>
                              <Table.Cell>{topArmies.join(', ') || 'N/A'}</Table.Cell>
                              <Table.Cell>
                                 <Button auto flat onClick={() => openModal(member)}>
                                    👁️
                                 </Button>
                              </Table.Cell>
                           </Table.Row>
                        );
                     })}
                  </Table.Body>
               </Table>

               <h2 style={{ color: 'red', fontSize: '32px', marginTop: '20px' }}>Miembros que no cumplen los requisitos mínimos</h2>
               <Table
                  aria-label="Members not meeting requirements"
                  css={{ height: 'auto', minWidth: '100%' }}
               >
                  <Table.Header>
                     <Table.Column>#</Table.Column>
                     <Table.Column>Jugador</Table.Column>
                     <Table.Column>Nivel TH</Table.Column>
                     <Table.Column>Rey</Table.Column>
                     <Table.Column>Reina</Table.Column>
                     <Table.Column>Centinela</Table.Column>
                     <Table.Column>Luchadora</Table.Column>
                     <Table.Column>Principe</Table.Column>
                     <Table.Column>Ejércitos más usados</Table.Column>
                     <Table.Column>Acciones</Table.Column>
                  </Table.Header>
                  <Table.Body>
                     {sortedNotMeetingRequirements.map((member, index) => {
                        const topArmies = getTopUsedArmies(member.name); // Get top armies
                        return (
                           <Table.Row key={member.tag}>
                              <Table.Cell>{index + 1}</Table.Cell>
                              <Table.Cell>{` ${member.name || 'N/A'}`}</Table.Cell>
                              <Table.Cell css={{ color: member.townHallLevel < parseInt(minLevels.th) ? 'red' : 'inherit' }}>
                                 {`TH ${member.townHallLevel || 'N/A'}`}
                              </Table.Cell>
                              <Table.Cell css={{ color: (member.heroes?.[0]?.level ?? 0) < parseInt(minLevels.rey) ? 'red' : 'inherit' }}>
                                 {`Rey ${member.heroes?.[0]?.level || 'N/A'}`}
                              </Table.Cell>
                              <Table.Cell css={{ color: (member.heroes?.[1]?.level ?? 0) < parseInt(minLevels.reina) ? 'red' : 'inherit' }}>
                                 {`Reina ${member.heroes?.[1]?.level || 'N/A'}`}
                              </Table.Cell>
                              <Table.Cell css={{ color: (member.heroes?.[2]?.level ?? 0) < parseInt(minLevels.centinela) ? 'red' : 'inherit' }}>
                                 {`Centinela ${member.heroes?.[2]?.level || 'N/A'}`}
                              </Table.Cell>
                              <Table.Cell css={{ color: (member.heroes?.[4]?.level ?? 0) < parseInt(minLevels.luchadora) ? 'red' : 'inherit' }}>
                                 {`Luchadora ${member.heroes?.[4]?.level || 'N/A'}`}
                              </Table.Cell>
                              <Table.Cell css={{ color: (member.heroes?.[6]?.level ?? 0) < parseInt(minLevels.principe) ? 'red' : 'inherit' }}>
                                 {`Principe ${member.heroes?.[6]?.level || 'N/A'}`}
                              </Table.Cell>
                              <Table.Cell>{topArmies.join(', ') || 'N/A'}</Table.Cell>
                              <Table.Cell>
                                 <Button auto flat onClick={() => openModal(member)}>
                                    👁️
                                 </Button>
                              </Table.Cell>
                           </Table.Row>
                        );
                     })}
                  </Table.Body>
               </Table>
            </>
         )}

         <Modal {...bindings}>
            <Modal.Header css={{ backgroundColor: '#1e293b', color: 'white' }}>
               <Text h4>{selectedMember?.name || 'Información del jugador'}</Text>
            </Modal.Header>
            <Modal.Body css={{ padding: '20px' }}>
               {selectedMember && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     <div style={{ backgroundColor: '#e2e8f0', padding: '10px', borderRadius: '8px' }}>
                        <p style={{ color: 'black' }}>
                           <strong style={{ color: '#1e40af' }}>TH:</strong> {selectedMember.townHallLevel}
                        </p>
                        <p style={{ color: 'black' }}>
                           <strong style={{ color: '#1e40af' }}>Rol:</strong> {selectedMember.role || 'N/A'}
                        </p>
                        <p style={{ color: 'black' }}>
                           <strong style={{ color: '#1e40af' }}>Donaciones:</strong>
                           <span style={{ color: '#16a34a' }}> {selectedMember.donations || 'N/A'}</span> /
                           <span style={{ color: '#dc2626' }}> {selectedMember.donationsReceived || 'N/A'}</span>
                        </p>
                     </div>

                     <div style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '8px' }}>
                        <h5 style={{ color: '#b45309' }}><strong>Tropas:</strong></h5>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                           {renderValidatedList(
                              selectedMember.troops?.filter((troop) => troop.village === 'home') || [],
                              requisitosPorAyuntamiento[`TH${selectedMember.townHallLevel}`]?.tropas || {},
                              translateName
                           )}
                        </ul>
                     </div>

                     <div style={{ backgroundColor: '#d1fae5', padding: '10px', borderRadius: '8px' }}>
                        <h5 style={{ color: '#047857' }}><strong>Mascotas:</strong></h5>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                           {renderValidatedList(
                              selectedMember.troops?.filter((troop) =>
                                 ['L.A.S.S.I', 'Mighty Yak', 'Electro Owl', 'Unicorn', 'Phoenix', 'Poison Lizard', 'Diggy', 'Frosty', 'Spirit Fox', 'Angry Jelly'].includes(troop.name)
                              ) || [],
                              requisitosPorAyuntamiento[`TH${selectedMember.townHallLevel}`]?.mascotas || {},
                              translateName
                           )}
                        </ul>
                     </div>

                     <div style={{ backgroundColor: '#e0f2fe', padding: '10px', borderRadius: '8px' }}>
                        <h5 style={{ color: '#0369a1' }}><strong>Equipamiento de Héroes:</strong></h5>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                           {renderValidatedList(
                              selectedMember.heroEquipment || [],
                              requisitosPorAyuntamiento[`TH${selectedMember.townHallLevel}`]?.equipamento || {},
                              translateName,
                              true // Pass true to apply equipment-specific logic
                           )}
                        </ul>
                     </div>
                  </div>
               )}
            </Modal.Body>
            <Modal.Footer css={{ backgroundColor: '#1e293b' }}>
               <Button auto flat onClick={() => setVisible(false)} css={{ color: 'white', backgroundColor: '#dc2626' }}>
                  Cerrar
               </Button>
            </Modal.Footer>
         </Modal>
      </Box>
   );
};
