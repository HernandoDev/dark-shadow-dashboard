import React, { useState, useEffect } from 'react';
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
   const [clanTag, setClanTag] = useState('');

   useEffect(() => {
      const storedClanTag = localStorage.getItem('clanTag');
      if (storedClanTag) {
         setClanTag(storedClanTag);
      }
   }, []);

   const handleClanChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedClanTag = event.target.value;
      setClanTag(selectedClanTag);
      localStorage.setItem('clanTag', selectedClanTag);
      window.location.reload(); // Reload the page to apply the new clan tag
   };

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

         <Sidebar style={{marginTop:'40px'}} collapsed={collapsed}>
        
            <Flex
               direction={'column'}
               justify={'between'}
               css={{ height: '100%' }}
            >
               <Sidebar.Body className="body sidebar">

                  <SidebarMenu title="Main Menu">
                     <SidebarItem
                        isActive={router.pathname === '/'}
                        title="Inicio"
                        icon={<HomeIcon />}
                        href="/"
                     />
                     <SidebarItem
                        isActive={router.pathname === '/accounts'}
                        title="Requisitos minimos"
                        icon={<AccountsIcon />}
                        href="accounts"
                     />
                     <SidebarItem
                        isActive={router.pathname === '/league-points'}
                        title="Clasificación Liga"
                        icon={<BalanceIcon />}
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
                        icon={<DevIcon />}
                        href="attack-log"
                     />
                       <SidebarItem
                        isActive={router.pathname === '/donaciones'}
                        title="Registro de donaciones"
                        icon={<AccountsIcon />}
                        href="donaciones"
                     />
                  </SidebarMenu>
                  <select
                     value={clanTag}
                     onChange={handleClanChange}
                     style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '10px',
                        backgroundColor: '#1e293b', // Dark background
                        color: '#ffffff', // White text
                        border: '1px solid #4b5563', // Gray border
                        borderRadius: '8px', // Rounded corners
                        fontSize: '14px', // Adjust font size
                        outline: 'none', // Remove outline
                        appearance: 'none', // Remove default dropdown arrow
                        cursor: 'pointer', // Pointer cursor
                     }}
                  >
                     <option value="" disabled>
                        Select Clan
                     </option>
                     <option value="%232QL0GCQGQ">Principal</option>
                     <option value="%232RG9R9JVP">Cantera</option>
                  </select>
               </Sidebar.Body>

            </Flex>
         </Sidebar>
      </Box>
   );
};
