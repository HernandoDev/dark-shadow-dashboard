'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { Table, Input, Button, Pagination, Modal, useModal, Text } from '@nextui-org/react';
import { Box } from '../styles/box';
import { APIClashService } from '../../services/apiClashService';
import { useMediaQuery } from 'react-responsive'; // Import useMediaQuery for responsiveness

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

export const TableWrapper = () => {
   const [members, setMembers] = useState<Member[]>([]);
   const [loading, setLoading] = useState(true);
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
         "Baby Dragon": "Dragón Bebé",
         "Miner": "Minero",
         "Super Barbarian": "Súper Bárbaro",
         "Super Archer": "Súper Arquera",
         "Super Wall Breaker": "Súper Rompe Muros",
         "Super Giant": "Súper Gigante",
         "Wall Wrecker": "Demoledor de Muros",
         "Battle Blimp": "Dirigible de Batalla",
         "Yeti": "Yeti",
         "Sneaky Goblin": "Duende Furtivo",
         "Super Miner": "Súper Minero",
         "Rocket Balloon": "Globo Cohete",
         "Ice Golem": "Gólem de Hielo",
         "Electro Dragon": "Dragón Eléctrico",
         "Stone Slammer": "Aplastarrocas",
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
         "Log Launcher": "Lanzatrones",
         "Flame Flinger": "Lanzallamas",
         "Battle Drill": "Taladro de Batalla",
         "Electro Titan": "Titán Eléctrico",
         "Apprentice Warden": "Guardián Aprendiz",
         "Super Hog Rider": "Súper Montapuercos",
         "Root Rider": "Jinete de Raíces",
         "Druid": "Druida",
         "Thrower": "Lanzador",
         // Mascotas
         "L.A.S.S.I": "L.A.S.S.I",
         "Mighty Yak": "Yak Mamut",
         "Electro Owl": "Búho Eléctrico",
         "Unicorn": "Unicornio",
         "Phoenix": "Fénix",
         "Poison Lizard": "Lagarto Venenoso",
         "Diggy": "Cavador",
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

   useEffect(() => {
      const fetchMembers = async () => {
         try {
           const data = await APIClashService.getClanMembersWithDetails(clanTag);
           setMembers(data.detailedMembers as Member[] || []);
         } catch (error) {
           console.error('Error fetching members:', error);
         } finally {
           setLoading(false);
         }
       };

      fetchMembers();
   }, [clanTag]);

   const openModal = (member: any) => {
      setSelectedMember(member);
      setVisible(true);
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

   return (
      <Box css={{ padding: '20px' }}>
         <div style={{ display: 'flex', gap: '10px' }}>
            <Button
               bordered
               css={{
                  backgroundColor: clanTag === '%232QL0GCQGQ' ? 'violet' : 'inherit',
                  color: clanTag === '%232QL0GCQGQ' ? 'black' : 'inherit',
               }}
               onClick={() => setClanTag('%232QL0GCQGQ')}
            >
               Clan Principal
            </Button>
            <Button
               bordered
               css={{
                  backgroundColor: clanTag === '%232RG9R9JVP' ? 'violet' : 'inherit',
                  color: clanTag === '%232RG9R9JVP' ? 'black' : 'inherit',
               }}
               onClick={() => setClanTag('%232RG9R9JVP')}
            >
               Clan Cantera
            </Button>
         </div>

         <div style={{ marginTop: '40px' }} className="grid grid-cols-3 gap-4 mt-4">
            {(Object.keys(minLevels) as Array<keyof typeof minLevels>).map((key) => (
               <Input
                  key={key}
                  label={`Nivel Minimo ${key.toUpperCase()}`}
                  type="number"
                  value={minLevels[key]}
                  onChange={(e) => setMinLevels({ ...minLevels, [key]: e.target.value })}
               />
            ))}
         </div>
         <div style={{ marginTop: '30px' }} className="flex gap-4">
            <Input
               clearable
               placeholder="Buscar jugador"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
         {isMobile ? (
            <div>
               <h1 style={{ color: 'greenyellow', fontSize: '24px' }}>Miembros que cumplen los requisitos mínimos</h1>
               {membersMeetingRequirements.map((member, index) => (
                  <div key={member.tag} style={{ marginBottom: '20px', padding: '15px', border: '2px solid violet', borderRadius: '8px', backgroundColor: 'gray' }}>
                     <p><strong>{`${index + 1}. ${member.name || 'N/A'}`}</strong></p>
                     <p>TH: {member.townHallLevel || 'N/A'}</p>
                     <p>Rey: {member.heroes?.[0]?.level || 'N/A'}</p>
                     <p>Reina: {member.heroes?.[1]?.level || 'N/A'}</p>
                     <p>Centinela: {member.heroes?.[2]?.level || 'N/A'}</p>
                     <p>Luchadora: {member.heroes?.[4]?.level || 'N/A'}</p>
                     <p>Principe: {member.heroes?.[6]?.level || 'N/A'}</p>
                     <Button auto flat onClick={() => openModal(member)}>👁️</Button>
                  </div>
               ))}

               <h2 style={{ color: 'red', fontSize: '24px', marginTop: '20px' }}>Miembros que no cumplen los requisitos mínimos</h2>
               {membersNotMeetingRequirements.map((member, index) => (
                  <div key={member.tag} style={{ marginBottom: '20px', padding: '15px', border: '2px solid violet', borderRadius: '8px', backgroundColor: 'gray' }}>
                     <p><strong>{`${index + 1}. ${member.name || 'N/A'}`}</strong></p>
                     <strong> <p style={{ color: member.townHallLevel < parseInt(minLevels.th) ? '#B22222' : 'inherit' }}>TH: {member.townHallLevel || 'N/A'}</p></strong>
                     <strong><p style={{ fontWeight:'bold',fontSize:'14px',color: member.heroes?.[0]?.level < parseInt(minLevels.rey) ? '#B22222' : 'inherit' }}>Rey: {member.heroes?.[0]?.level || 'N/A'}</p></strong>
                     <p style={{ fontWeight:'bold',fontSize:'14px', color: member.heroes?.[1]?.level < parseInt(minLevels.reina) ? '#B22222' : 'inherit' }}>Reina: {member.heroes?.[1]?.level || 'N/A'}</p>
                     <p style={{  fontWeight:'bold',fontSize:'14px',color: member.heroes?.[2]?.level < parseInt(minLevels.centinela) ? '#B22222' : 'inherit' }}>Centinela: {member.heroes?.[2]?.level || 'N/A'}</p>
                     <p style={{  fontWeight:'bold',fontSize:'14px',color: member.heroes?.[4]?.level < parseInt(minLevels.luchadora) ? '#B22222' : 'inherit' }}>Luchadora: {member.heroes?.[4]?.level || 'N/A'}</p>
                     <p style={{  fontWeight:'bold',fontSize:'14px',color: member.heroes?.[6]?.level < parseInt(minLevels.principe) ? '#B22222' : 'inherit' }}>Principe: {member.heroes?.[6]?.level || 'N/A'}</p>
                     <Button auto flat onClick={() => openModal(member)}>👁️</Button>
                  </div>
               ))}
            </div>
         ) : (
            <>
               <h1 style={{ color: 'greenyellow', fontSize: '32px' }}>Miembros que cumplen los requisitos mínimos</h1>
               <Table
                  aria-label="Members meeting requirements"
                  css={{ height: 'auto', minWidth: '100%' }}
               >
                  <Table.Header>
                     <Table.Column>Jugador</Table.Column>
                     <Table.Column>Nivel TH</Table.Column>
                     <Table.Column>Rey</Table.Column>
                     <Table.Column>Reina</Table.Column>
                     <Table.Column>Centinela</Table.Column>
                     <Table.Column>Luchadora</Table.Column>
                     <Table.Column>Principe</Table.Column>
                     <Table.Column>Acciones</Table.Column>
                  </Table.Header>
                  <Table.Body>
                     {membersMeetingRequirements.map((member, index) => (
                        <Table.Row key={member.tag}>
                           <Table.Cell>{`${index + 1}. ${member.name || 'N/A'}`}</Table.Cell>
                           <Table.Cell>{`TH ${member.townHallLevel || 'N/A'}`}</Table.Cell>
                           <Table.Cell>{`Rey ${member.heroes?.[0]?.level || 'N/A'}`}</Table.Cell>
                           <Table.Cell>{`Reina ${member.heroes?.[1]?.level || 'N/A'}`}</Table.Cell>
                           <Table.Cell>{`Centinela ${member.heroes?.[2]?.level || 'N/A'}`}</Table.Cell>
                           <Table.Cell>{`Luchadora ${member.heroes?.[4]?.level || 'N/A'}`}</Table.Cell>
                           <Table.Cell>{`Principe ${member.heroes?.[6]?.level || 'N/A'}`}</Table.Cell>
                           <Table.Cell>
                              <Button auto flat onClick={() => openModal(member)}>
                                 👁️
                              </Button>
                           </Table.Cell>
                        </Table.Row>
                     ))}
                  </Table.Body>
               </Table>

               <h2 style={{ color: 'red', fontSize: '32px', marginTop: '20px' }}>Miembros que no cumplen los requisitos mínimos</h2>
               <Table
                  aria-label="Members not meeting requirements"
                  css={{ height: 'auto', minWidth: '100%' }}
               >
                  <Table.Header>
                     <Table.Column>Jugador</Table.Column>
                     <Table.Column>Nivel TH</Table.Column>
                     <Table.Column>Rey</Table.Column>
                     <Table.Column>Reina</Table.Column>
                     <Table.Column>Centinela</Table.Column>
                     <Table.Column>Luchadora</Table.Column>
                     <Table.Column>Principe</Table.Column>
                     <Table.Column>Acciones</Table.Column>
                  </Table.Header>
                  <Table.Body>
                     {membersNotMeetingRequirements.map((member, index) => (
                        <Table.Row key={member.tag}>
                           <Table.Cell>{`${index + 1}. ${member.name || 'N/A'}`}</Table.Cell>
                           <Table.Cell css={{ color: member.townHallLevel < parseInt(minLevels.th) ? 'red' : 'inherit' }}>
                              {`TH ${member.townHallLevel || 'N/A'}`}
                           </Table.Cell>
                           <Table.Cell css={{ color: member.heroes?.[0]?.level < parseInt(minLevels.rey) ? 'red' : 'inherit' }}>
                              {`Rey ${member.heroes?.[0]?.level || 'N/A'}`}
                           </Table.Cell>
                           <Table.Cell css={{ color: member.heroes?.[1]?.level < parseInt(minLevels.reina) ? 'red' : 'inherit' }}>
                              {`Reina ${member.heroes?.[1]?.level || 'N/A'}`}
                           </Table.Cell>
                           <Table.Cell css={{ color: member.heroes?.[2]?.level < parseInt(minLevels.centinela) ? 'red' : 'inherit' }}>
                              {`Centinela ${member.heroes?.[2]?.level || 'N/A'}`}
                           </Table.Cell>
                           <Table.Cell css={{ color: member.heroes?.[4]?.level < parseInt(minLevels.luchadora) ? 'red' : 'inherit' }}>
                              {`Luchadora ${member.heroes?.[4]?.level || 'N/A'}`}
                           </Table.Cell>
                           <Table.Cell css={{ color: member.heroes?.[6]?.level < parseInt(minLevels.principe) ? 'red' : 'inherit' }}>
                              {`Principe ${member.heroes?.[6]?.level || 'N/A'}`}
                           </Table.Cell>
                           <Table.Cell>
                              <Button auto flat onClick={() => openModal(member)}>
                                 👁️
                              </Button>
                           </Table.Cell>
                        </Table.Row>
                     ))}
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
                        <p style={{ color: 'black' }}><strong style={{ color: '#1e40af' }}>TH:</strong> {selectedMember.townHallLevel}</p>
                        <p style={{ color: 'black' }}><strong style={{ color: '#1e40af' }}>Rol:</strong> {selectedMember.role || 'N/A'}</p>
                        <p style={{ color: 'black' }}>
                           <strong style={{ color: '#1e40af' }}>Donaciones:</strong> 
                           <span  style={{ color: '#16a34a' }}> {selectedMember.donations || 'N/A'}</span> / 
                           <span style={{ color: '#dc2626' }}> {selectedMember.donationsReceived || 'N/A'}</span>
                        </p>
                     </div>

                     <div style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '8px' }}>
                        <h5 style={{ color: '#b45309' }}><strong>Tropas:</strong></h5>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                           {selectedMember.troops
                              ?.filter((troop) => troop.village === 'home' && ![
                                 'L.A.S.S.I', 'Mighty Yak', 'Electro Owl', 'Unicorn', 'Phoenix', 
                                 'Poison Lizard', 'Diggy', 'Frosty', 'Spirit Fox', 'Angry Jelly', 'Sneezy'
                              ].includes(troop.name))
                              .map((troop, index) => (
                                 <li key={index} style={{ color: '#1e293b' }}>
                                    {translateName(troop.name)}: <span style={{ color: '#16a34a' }}>Nivel {troop.level}</span> / {troop.maxLevel}
                                 </li>
                              ))}
                        </ul>
                     </div>

                     <div style={{ backgroundColor: '#d1fae5', padding: '10px', borderRadius: '8px' }}>
                        <h5 style={{ color: '#047857' }}><strong>Mascotas:</strong></h5>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                           {selectedMember.troops
                              ?.filter((troop) => [
                                 'L.A.S.S.I', 'Mighty Yak', 'Electro Owl', 'Unicorn', 'Phoenix', 
                                 'Poison Lizard', 'Diggy', 'Frosty', 'Spirit Fox', 'Angry Jelly', 'Sneezy'
                              ].includes(troop.name))
                              .map((pet, index) => (
                                 <li key={index} style={{ color: '#1e293b' }}>
                                    {translateName(pet.name)}: <span style={{ color: '#16a34a' }}>Nivel {pet.level}</span> / {pet.maxLevel}
                                 </li>
                              ))}
                        </ul>
                     </div>

                     <div style={{ backgroundColor: '#e0f2fe', padding: '10px', borderRadius: '8px' }}>
                        <h5 style={{ color: '#0369a1' }}><strong>Equipamiento de Héroes:</strong></h5>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                           {selectedMember.heroEquipment
                              ?.filter((equipment) => equipment.village === 'home')
                              .map((equipment, index) => (
                                 <li key={index} style={{ color: '#1e293b' }}>
                                    {translateName(equipment.name)}: <span style={{ color: '#16a34a' }}>Nivel {equipment.level}</span> / {equipment.maxLevel}
                                 </li>
                              ))}
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
