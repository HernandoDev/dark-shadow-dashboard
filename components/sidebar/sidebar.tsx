import React, { useState } from 'react';
import { Box } from '../styles/box';
import { Sidebar } from './sidebar.styles';
import { Avatar, Tooltip } from '@nextui-org/react';
import { Flex } from '../styles/flex';
import { CompaniesDropdown } from './companies-dropdown';
import { HomeIcon } from '../icons/sidebar/home-icon';
import { PaymentsIcon } from '../icons/sidebar/payments-icon';
import { BalanceIcon } from '../icons/sidebar/balance-icon';
import { AccountsIcon } from '../icons/sidebar/accounts-icon';
import { CustomersIcon } from '../icons/sidebar/customers-icon';
import { ProductsIcon } from '../icons/sidebar/products-icon';
import { ReportsIcon } from '../icons/sidebar/reports-icon';
import { DevIcon } from '../icons/sidebar/dev-icon';
import { ViewIcon } from '../icons/sidebar/view-icon';
import { SettingsIcon } from '../icons/sidebar/settings-icon';
import { CollapseItems } from './collapse-items';
import { SidebarItem } from './sidebar-item';
import { SidebarMenu } from './sidebar-menu';
import { FilterIcon } from '../icons/sidebar/filter-icon';
import { useSidebarContext } from '../layout/layout-context';
import { ChangeLogIcon } from '../icons/sidebar/changelog-icon';
import { useRouter } from 'next/router';

export const SidebarWrapper = () => {
   const router = useRouter();
   const { collapsed, setCollapsed } = useSidebarContext();

   return (
      <Box
         as="aside"
         css={{
            height: '100vh',
            zIndex: 202,
            position: 'sticky',
            top: '0',
         }}
      >
         {collapsed ? <Sidebar.Overlay onClick={setCollapsed} /> : null}

         <Sidebar collapsed={collapsed}>
            <Sidebar.Header>
            </Sidebar.Header>
            <Flex
               direction={'column'}
               justify={'between'}
               css={{ height: '100%' }}
            >
               <Sidebar.Body className="body sidebar">

                  <SidebarMenu title="Main Menu">
                     <SidebarItem
                        isActive={router.pathname === '/accounts'}
                        title="Requisitos minimos"
                        icon={<AccountsIcon />}
                        href="accounts"
                     />
                     <SidebarItem
                        isActive={router.pathname === '/league-points'}
                        title="Clasificación Liga"
                        icon={<PaymentsIcon />}
                        href="league-points"
                     />

                     <SidebarItem
                        isActive={router.pathname === '/war-info'}
                        title="Info de Guerra/Liga"
                        icon={<ViewIcon />}
                        href="war-info"
                     />
                       <SidebarItem
                        isActive={router.pathname === '/progress-info'}
                        title="Progreso de Jugadores"
                        icon={<ReportsIcon />}
                        href="progress-info"
                     />
                               <SidebarItem
                        isActive={router.pathname === '/attack-log'}
                        title="Registro de ataques"
                        icon={<ReportsIcon />}
                        href="attack-log"
                     />
                  </SidebarMenu>

               </Sidebar.Body>

            </Flex>
         </Sidebar>
      </Box>
   );
};
