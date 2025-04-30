import { Avatar, Card, Text } from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import { Box } from '../styles/box';

// Define the Member type
type Member = {
   name: string;
   avatarUrl?: string;
   donationsReceived: number;
   donations: number;
};
import { Flex } from '../styles/flex';
import { APIClashService } from '../../services/apiClashService';

// Define the filter type
type FilterType = 'good' | 'bad';

interface CardTransactionsProps {
   filterType: FilterType;
}

export const CardTransactions: React.FC<CardTransactionsProps> = ({ filterType }) => {
   const [clanTag, setClanTag] = useState('%232QL0GCQGQ');
   const [members, setMembers] = useState<Member[]>([]);
   const [isDescending, setIsDescending] = useState(true); // Estado para alternar el orden

   useEffect(() => {
      const fetchClanMembers = async () => {
         try {
            const data = await APIClashService.getClanMembersWithDetails();
            setMembers(data.detailedMembers as Member[] || []);
         } catch (error) {
            console.error('Error fetching clan members:', error);
         }
      };

      fetchClanMembers();
   }, [clanTag]);

   const filteredMembers = members
      .filter((member) => {
         if (filterType === 'bad') {
            return member.donations < 1000 || member.donations - member.donationsReceived < 0;
         } else {
            return member.donations >= 1000 && member.donations - member.donationsReceived >= 0;
         }
      })
      .sort((a, b) => (isDescending ? b.donations - a.donations : a.donations - b.donations)); // Ordenar según el estado

   return (
      <Card
         className="card animate__animated animate__backInRight"
         css={{
            mw: '375px',
            height: 'auto',
            bg: '$accents0',
            borderRadius: '$xl',
            justifyContent: 'start',
            px: '$6',
         }}
      >
         <Card.Body>
            <Flex css={{ gap: '$5', justifyContent: 'space-between', alignItems: 'center' }}>
               <Text h3 css={{ textAlign: 'center' }}>
                  {filterType === 'bad' ? 'Malos donadores' : 'Buenos donadores'}
               </Text>
               <button
                  onClick={() => setIsDescending(!isDescending)}
                  style={{
                     background: 'transparent',
                     border: 'none',
                     cursor: 'pointer',
                     fontSize: '18px',
                     display: 'flex',
                     alignItems: 'center',
                  }}
               >
                  {isDescending ? <i className="bi bi-sort-down"></i>
                     : <i className="bi bi-sort-up"></i>
                  }
               </button>
            </Flex>
            <Flex css={{ gap: '$6', py: '$4' }} direction={'column'}>
               {filteredMembers.length === 0 ? (
                  <Text h4 css={{ textAlign: 'center', color: '$gray600' }}>
                     No hay miembros.
                  </Text>
               ) : (
                  filteredMembers.map((member, index) => {
                     const difference = member.donations - member.donationsReceived;
                     return (
                        <Flex key={index} css={{ gap: '$6' }} align={'center'} justify="between">
                           {/* <Avatar
                              size="lg"
                              pointer
                              src={member.avatarUrl || 'https://i.pravatar.cc/150?u=default'}
                              bordered
                              color="gradient"
                              stacked
                           /> */}
                           <Text
                              span
                              size={'$base'}
                              weight={'semibold'}
                              css={{
                                 color: filterType === 'bad' && member.donations < 1000 ? 'orange' : 'inherit',
                              }}
                           >
                              {index + 1}. {member.name}
                           </Text>
                           <Text span css={{ color: '$green600' }} size={'$xs'}>
                              {member.donations}
                           </Text>
                           /
                           <Text span css={{ color: 'violet' }} size={'$xs'}>
                              {member.donationsReceived}
                           </Text>
                           <Text
                              span
                              css={{
                                 color: difference < 0 ? '$red600' : '$green600',
                              }}
                              size={'$xs'}
                           >
                              | Dif: {difference}
                           </Text>
                        </Flex>
                     );
                  })
               )}
            </Flex>
         </Card.Body>
      </Card>
   );
};
