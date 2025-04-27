import {Card, Text} from '@nextui-org/react';
import React from 'react';
import {Flex} from '../styles/flex';

type Player = {
   member: string;
   stars: number;
   percentage: number;
   army: string; // Add army property
   points: number; // Add points property
};

type CardBalance1Props = {
   player: Player;
   position: number;
};

export const CardBalance1 = ({player, position}: CardBalance1Props) => {
   const backgroundColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
   const bgColor = backgroundColors[position - 1] || '#fc4503';

   return (
      <Card 
      className="animate__animated animate__backInLeft"
         css={{
            mw: '300px', // Reduced width from 375px to 300px
            bg: bgColor,
            borderRadius: '$xl',
            px: '$6',
            py: '$4',
         }}
      >
         <Card.Body>
            <Flex direction={'column'} align={'center'} css={{gap: '$4'}}>
               <Text span css={{color: 'black', textAlign: 'center'}} weight={'bold'} size={'$lg'}>
                  #{position} - {player.member}
               </Text>
               <Flex direction={'row'} justify={'between'} css={{width: '100%', gap: '$2'}}>
                  <Text span css={{color: 'black'}} size={'$md'}>
                     Estrellas:
                  </Text>
                  <Text span css={{color: 'black'}} size={'$md'} weight={'bold'}>
                     {player.stars}
                  </Text>
               </Flex>
               <Flex direction={'row'} justify={'between'} css={{width: '100%', gap: '$2'}}>
                  <Text span css={{color: 'black'}} size={'$md'}>
                     Destrucción %:
                  </Text>
                  <Text span css={{color: 'black'}} size={'$md'} weight={'bold'}>
                     {player.percentage}%
                  </Text>
               </Flex>
               <Flex direction={'row'} justify={'between'} css={{width: '100%', gap: '$2'}}>
                  <Text span css={{color: 'black'}} size={'$md'}>
                     Ejército:
                  </Text>
                  <Text span css={{color: 'black'}} size={'$md'} weight={'bold'}>
                     {player.army}
                  </Text>
               </Flex>
               <Flex direction={'row'} justify={'between'} css={{width: '100%', gap: '$2'}}>
                  <Text span css={{color: 'black'}} size={'$md'}>
                     Puntos:
                  </Text>
                  <Text span css={{color: 'black'}} size={'$md'} weight={'bold'}>
                     {player.points.toFixed(2)}
                  </Text>
               </Flex>
            </Flex>
         </Card.Body>
      </Card>
   );
};
