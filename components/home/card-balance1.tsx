import {Card, Text} from '@nextui-org/react';
import React from 'react';
import {Flex} from '../styles/flex';

type PlayerCombined = {
   tag: string;
   name: string;
   townhallLevel: number;
   avgStars: number;
   avgDestruction: number;
   totalAttacks: number;
   score: number;
   totalStarsLiga: number;
   totalAttacksLiga: number;
   totalStarsWar: number;
   totalAttacksWar: number;
   topArmies?: string[];
};

type CardBalance1Props = {
   player: PlayerCombined;
   position: number;
};

export const CardBalance1 = ({player, position}: CardBalance1Props) => {
   const backgroundColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#4B9CD3', '#7CFC00'];
   const bgColor = backgroundColors[position - 1] || '#fc4503';

   return (
      <Card 
         className="animate__animated animate__backInLeft card"
         css={{
            mw: '320px',
            bg: bgColor,
            border: '1px solid '+bgColor,
            borderRadius: '$xl',
            px: '$6',
            py: '$4',
         }}
      >
         <Card.Body style={{color: 'white'}}>
            <Flex direction={'column'} align={'center'} css={{gap: '$4'}}>
               <Text span css={{color: bgColor, textAlign: 'center'}} weight={'bold'} size={'$lg'}>
                  #{position} - {player.name}
               </Text>
               {/* Mostrar topArmies si existen */}
               {player.topArmies && player.topArmies.length > 0 && (
                  <Flex direction={'column'} css={{width: '100%', gap: '$1'}}>
                     <Text span css={{color: 'white'}} size={'$md'} weight={'bold'}>
                        Ejércitos más usados:
                     </Text>
                     {player.topArmies.map((army, idx) => (
                        <Text key={idx} span css={{color: 'white'}} size={'$sm'}>
                           {idx + 1}. {army}
                        </Text>
                     ))}
                  </Flex>
               )}
               <hr style={{ width: '100%', borderColor: 'yellow', opacity: 0.6 }} />
               <Flex direction={'row'} justify={'between'} css={{width: '100%', gap: '$2'}}>
                  <Text span css={{color: 'white'}} size={'$md'}>
                     Media Estrellas:
                  </Text>
                  <Text span css={{color: 'white'}} size={'$md'} weight={'bold'}>
                     {player.avgStars?.toFixed(2)}
                  </Text>
               </Flex>
               <Flex direction={'row'} justify={'between'} css={{width: '100%', gap: '$2'}}>
                  <Text span css={{color: 'white'}} size={'$md'}>
                     Media Destrucción:
                  </Text>
                  <Text span css={{color: 'white'}} size={'$md'} weight={'bold'}>
                     {player.avgDestruction?.toFixed(2)}%
                  </Text>
               </Flex>
               <Flex direction={'row'} justify={'between'} css={{width: '100%', gap: '$2'}}>
                  <Text span css={{color: 'white'}} size={'$md'}>
                     Ataques Totales:
                  </Text>
                  <Text span css={{color: 'white'}} size={'$md'} weight={'bold'}>
                     {player.totalAttacks}
                  </Text>
               </Flex>
               <Flex direction={'row'} justify={'between'} css={{width: '100%', gap: '$2'}}>
                  <Text span css={{color: 'white'}} size={'$md'}>
                     Score:
                  </Text>
                  <Text span css={{color: 'white'}} size={'$md'} weight={'bold'}>
                     {player.score?.toFixed(2)}
                  </Text>
               </Flex>
                              <hr style={{ width: '100%', borderColor: 'yellow', opacity: 0.6 }} />

               <Flex direction={'row'} justify={'between'} css={{width: '100%', gap: '$2'}}>
                  <Text span css={{color: 'white'}} size={'$md'}>
                     Estrellas Liga:
                  </Text>
                  <Text span css={{color: 'white'}} size={'$md'} weight={'bold'}>
                     {player.totalStarsLiga?.toFixed(2)}
                  </Text>
               </Flex>
               <Flex direction={'row'} justify={'between'} css={{width: '100%', gap: '$2'}}>
                  <Text span css={{color: 'white'}} size={'$md'}>
                     Ataques Liga:
                  </Text>
                  <Text span css={{color: 'white'}} size={'$md'} weight={'bold'}>
                     {player.totalAttacksLiga}
                  </Text>
               </Flex>
                              <hr style={{ width: '100%', borderColor: 'yellow', opacity: 0.6 }} />

               <Flex direction={'row'} justify={'between'} css={{width: '100%', gap: '$2'}}>
                  <Text span css={{color: 'white'}} size={'$md'}>
                     Estrellas Guerra:
                  </Text>
                  <Text span css={{color: 'white'}} size={'$md'} weight={'bold'}>
                     {player.totalStarsWar?.toFixed(2)}
                  </Text>
               </Flex>
               <Flex direction={'row'} justify={'between'} css={{width: '100%', gap: '$2'}}>
                  <Text span css={{color: 'white'}} size={'$md'}>
                     Ataques Guerra:
                  </Text>
                  <Text span css={{color: 'white'}} size={'$md'} weight={'bold'}>
                     {player.totalAttacksWar}
                  </Text>
               </Flex>
                             <hr style={{ width: '100%', borderColor: 'yellow', opacity: 0.6 }} />


               <Flex direction={'row'} justify={'between'} css={{width: '100%', gap: '$2'}}>
                  <Text span css={{color: 'white'}} size={'$md'}>
                     TH:
                  </Text>
                  <Text span css={{color: 'white'}} size={'$md'} weight={'bold'}>
                     {player.townhallLevel}
                  </Text>
               </Flex>
            </Flex>
         </Card.Body>
      </Card>
   );
};
