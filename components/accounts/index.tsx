import { Button, Input, Text } from '@nextui-org/react';
import Link from 'next/link';
import React from 'react';
import { Breadcrumbs, Crumb, CrumbLink } from '../breadcrumb/breadcrumb.styled';
import { DotsIcon } from '../icons/accounts/dots-icon';
import { ExportIcon } from '../icons/accounts/export-icon';
import { InfoIcon } from '../icons/accounts/info-icon';
import { TrashIcon } from '../icons/accounts/trash-icon';
import { HouseIcon } from '../icons/breadcrumb/house-icon';
import { UsersIcon } from '../icons/breadcrumb/users-icon';
import { SettingsIcon } from '../icons/sidebar/settings-icon';
import { Flex } from '../styles/flex';
import { TableWrapper } from '../table/table';
import { AddUser } from './add-user';

export const Accounts = () => {
   return (
      <Flex
         css={{
            'mt': '$5',
            'px': '$6',
            '@sm': {
               mt: '$10',
               px: '$16',
            },
         }}
         justify={'center'}
         direction={'column'}
      >


         <Text h3>Requisitos mínimos para liga</Text>
         <Text h5>Aquí puedes establecer el nivel mínimo que debe tener cada héroe.</Text>


         <Text h5>Los jugadores se dividirán en dos tablas: los que cumplen y los que no cumplen con los requisitos.
         </Text>
         <Text h5>⚠️ Esto es solo una guía orientativa para ayudarte a organizar ligas o guerras. No es obligatorio ni definitivo.</Text>



         <Flex
            css={{ gap: '$8' }}
            align={'center'}
            justify={'between'}
            wrap={'wrap'}
         >
            <Flex
               css={{
                  'gap': '$6',
                  'flexWrap': 'wrap',
                  '@sm': { flexWrap: 'nowrap' },
               }}
               align={'center'}
            >
            </Flex>
         </Flex>

         <TableWrapper />
      </Flex>
   );
};
