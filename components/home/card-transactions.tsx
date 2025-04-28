import {Avatar, Card, Text} from '@nextui-org/react';
import React, {useState, useEffect} from 'react';
import {Box} from '../styles/box';

// Define the Member type
type Member = {
   name: string;
   avatarUrl?: string;
   donationsReceived: number;
   donations: number;
};
import {Flex} from '../styles/flex';
import {APIClashService} from '../../services/apiClashService';

export const CardTransactions = () => {
   const [clanTag, setClanTag] = useState('%232QL0GCQGQ');
   const [members, setMembers] = useState<Member[]>([]);

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

   return (
      <Card
      className="animate__animated animate__backInRight"
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
            <Flex css={{gap: '$5'}} justify={'center'}>
               <Text h3 css={{textAlign: 'center'}}>
                  Malos donadores
               </Text>
            </Flex>
            <Flex css={{gap: '$6', py: '$4'}} direction={'column'}>
               {members
                  .filter(
                     (member) =>
                        member.donations < 1000 || member.donations - member.donationsReceived < 0
                  )
                  .map((member, index) => {
                     const difference = member.donations - member.donationsReceived;
                     return (
                        <Flex key={index} css={{gap: '$6'}} align={'center'} justify="between">
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
                                 color: member.donations < 1000 ? 'orange' : 'inherit',
                              }}
                           >
                              {member.name}
                           </Text>
                           <Text span css={{color: '$green600'}} size={'$xs'}>
                              {member.donations} 
                           </Text>
                           /
                           <Text span css={{color: 'violet'}} size={'$xs'}>
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
                  })}
            </Flex>
         </Card.Body>
      </Card>
   );
};
