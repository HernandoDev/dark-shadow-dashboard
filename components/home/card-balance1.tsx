import {Card, Text} from '@nextui-org/react';
import React from 'react';
import {Flex} from '../styles/flex';

type Player = {
   member: string;
   stars: number;
   percentage: number;
   army: string; // Add army property
};

type CardBalance1Props = {
   player: Player;
   position: number;
};

export const CardBalance1 = ({player, position}: CardBalance1Props) => {
   const backgroundColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
   const bgColor = backgroundColors[position - 1] || '#FFFFFF';

   return (
      <Card
         css={{
            mw: '375px',
            bg: bgColor,
            borderRadius: '$xl',
            px: '$6',
         }}
      >
         <Card.Body >
            <Flex direction={'column'} align={'center'} css={{gap: '$5'}}>
               <Text span css={{color: 'black'}} weight={'bold'} size={'$lg'}>
                  #{position} - {player.member}
               </Text>
               <Text span css={{color: 'black'}} size={'$md'}>
                  Stars: {player.stars}
               </Text>
               <Text span css={{color: 'black'}} size={'$md'}>
                  Percentage: {player.percentage}%
               </Text>
               <Text span css={{color: 'black'}} size={'$md'}>
                  Army: {player.army}
               </Text>
            </Flex>
         </Card.Body>
      </Card>
   );
};
