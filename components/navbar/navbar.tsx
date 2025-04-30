import { Input, Link, Navbar, Text } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { FeedbackIcon } from '../icons/navbar/feedback-icon';
import { GithubIcon } from '../icons/navbar/github-icon';
import { SupportIcon } from '../icons/navbar/support-icon';
import { SearchIcon } from '../icons/searchicon';
import { Box } from '../styles/box';
import { Flex } from '../styles/flex';
import { BurguerButton } from './burguer-button';
import { NotificationsDropdown } from './notifications-dropdown';
import { UserDropdown } from './user-dropdown';

interface Props {
   children: React.ReactNode;
}

export const NavbarWrapper = ({ children }: Props) => {
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [clanTag, setClanTag] = useState('');

   useEffect(() => {
      if (typeof window !== 'undefined') {
         setIsAuthenticated(!!localStorage.getItem('isAuthenticated'));
         const storedClanTag = localStorage.getItem('clanTag');
         if (storedClanTag) {
            setClanTag(storedClanTag);
         }
      }
   }, []);

   const handleClanChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedClanTag = event.target.value;
      setClanTag(selectedClanTag);
      localStorage.setItem('clanTag', selectedClanTag);
      window.location.reload(); // Reload the page to apply the new clan tag
   };

   const getClanTag = () => {
      if (typeof window === 'undefined') return '';
      return localStorage.getItem('clanTag') || '%232QL0GCQGQ';
   };

   const clanName = getClanTag() === '%232QL0GCQGQ' ? 'Dark Shadows' : getClanTag() === '%232RG9R9JVP' ? 'Dark Shadows II' : 'Unknown Clan';

   const collapseItems = [
      'Profile',
      'Dashboard',
      'Activity',
      'Analytics',
      'System',
      'Deployments',
      'My Settings',
      'Team Settings',
      'Help & Feedback',
      'Log Out',
   ];
   return (
      <Box
         css={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            overflowY: 'auto',
            overflowX: 'hidden',
         }}
      >
         <Navbar
            isBordered
            css={{
               'position': 'fixed', // Make the navbar fixed
               'top': 0, // Position it at the top
               'zIndex': 1000, // Ensure it stays above other elements
               'borderBottom': '1px solid $border',
               'justifyContent': 'space-between',
               'width': '100%',
               '@md': {
                  justifyContent: 'space-between',
               },

               '& .nextui-navbar-container': {
                  'border': 'none',
                  'maxWidth': '100%',
                  'width': '100dvw',

                  'gap': '$6',
                  '@md': {
                     justifyContent: 'space-between',
                  },
               },
            }}
         >
            <Navbar.Content showIn="md">
               <div style={{ display: 'flex', alignItems: 'center', gap: '30px', justifyContent: 'space-between' }}>

                  <div>
                  </div>
                  <BurguerButton />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{clanName}</span>
                  <img
                     src="/logo-fondo-removebg-preview.png"
                     alt="Logo"
                     style={{ width: '100px', height: '100px' }}
                  />
                  </div>
               </div>
            </Navbar.Content>
            <Navbar.Content hideIn={'md'}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                     src="/logo-fondo-removebg-preview.png"
                     alt="Logo"
                     style={{ width: '100px', height: '100px' }}
                  />
                  <span>{clanName}</span>
               </div>
            </Navbar.Content>
          
            <Navbar.Content
               css={{
                  justifyContent: 'flex-end', // Align the button to the right
                  '@md': {
                     justifyContent: 'center', // Center the button on larger screens
                  },
               }}
            >
               {isAuthenticated && (
                  <button
                     onClick={() => {
                        localStorage.clear(); // Clear all localStorage items
                        window.location.href = '/login';
                     }}
                     className="Btn"
                     style={{
                        ...(typeof window !== 'undefined' && window.innerWidth > 768
                           ? { left: '-17dvw' } // Apply only for web version
                           : {}),
                     }}
                  >
                     <div className="sign">
                        <svg viewBox="0 0 512 512">
                           <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                        </svg>
                     </div>
                     <div className="text">Cerrar Sesión</div>
                  </button>
               )}
            </Navbar.Content>
            <Navbar.Collapse>
        
               {collapseItems.map((item, index) => (
                  <Navbar.CollapseItem
                     key={item}
                     activeColor="secondary"
                     css={{
                        color:
                           index === collapseItems.length - 1 ? '$error' : '',
                     }}
                     isActive={index === 2}
                  >
                     <Link
                        color="inherit"
                        css={{
                           minWidth: '100%',
                        }}
                        href="#"
                     >
                        {item}
                     </Link>
                  </Navbar.CollapseItem>
               ))}
            </Navbar.Collapse>

         </Navbar>
         {children}
      </Box>
   );
};
