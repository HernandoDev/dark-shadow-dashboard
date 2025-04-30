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
               'width': '95%',
               '@md': {
                  justifyContent: 'space-between',
               },

               '& .nextui-navbar-container': {
                  'border': 'none',
                  'maxWidth': '100%',
                  'width': '92vw',

                  'gap': '$6',
                  '@md': {
                     justifyContent: 'space-between',
                  },
               },
            }}
         >
            <Navbar.Content showIn="md">
               <div style={{ display: 'flex', alignItems: 'center', gap: '50px', justifyContent: 'space-between' }}>

                  <div>
                     <BurguerButton />
                  </div>
                  <img
                     src="/logo-fondo-removebg-preview.png"
                     alt="Logo"
                     style={{ width: '100px', height: '100px' }}
                  />
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
          
            <Navbar.Content>
               {isAuthenticated && (
                  <button
                     onClick={() => {
                        localStorage.clear(); // Clear all localStorage items
                        window.location.href = '/login';
                     }}
                     style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s ease',
                     }}
                     onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                     onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                  >
                     Cerrar Sesión
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
