import '../styles/globals.css';
import '../styles/login.css'; // Mueve la importación aquí
import '../styles/checkbox.css';
import '../styles/war-info.css';
import 'animate.css';
import '../styles/loader.css'; // Import the new loader styles
import '../styles/custom-input.css'; // Add this line
import type { AppProps } from 'next/app';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Layout } from '../components/layout/layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const lightTheme = createTheme({
   type: 'light',
   theme: {
      colors: {},
   },
});

const darkTheme = createTheme({
   type: 'dark',
   theme: {
      colors: {},
   },
});

function MyApp({ Component, pageProps }: AppProps) {
   const router = useRouter();
   const [isMobile, setIsMobile] = useState(false);
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [activeRequests, setActiveRequests] = useState(0); // Track active requests

   useEffect(() => {
      const handleResize = () => {
         setIsMobile(window.innerWidth <= 768); // Define móvil como ancho <= 768px
      };
      handleResize(); // Ejecuta al cargar
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   useEffect(() => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(authStatus);
      if (!authStatus && router.pathname !== '/login') {
         router.push('/login');
      }
   }, [router]);

   useEffect(() => {
      const handleRequestStart = () => setActiveRequests((prev) => prev + 1);
      const handleRequestEnd = () => setActiveRequests((prev) => Math.max(prev - 1, 0));

      // Listen to global fetch events
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
         handleRequestStart();
         try {
            const response = await originalFetch(...args);
            return response;
         } finally {
            handleRequestEnd();
         }
      };

      return () => {
         window.fetch = originalFetch; // Restore original fetch on cleanup
      };
   }, []);

   return (
      <NextThemesProvider
         defaultTheme="system"
         attribute="class"
         value={{
            light: lightTheme.className,
            dark: darkTheme.className,
         }}
      >
         <NextUIProvider>
            {activeRequests > 0 && (
               <div
                  style={{
                     position: 'fixed',
                     top: 0,
                     left: 0,
                     width: '100%',
                     height: '100%',
                     backgroundColor: 'rgba(0, 0, 0, 0.5)',
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                     gap: '15px',
                     zIndex: 9999,
                  }}
               >
                  <div className="loader">
                     <svg viewBox="0 0 80 80">
                        <circle r="32" cy="40" cx="40"></circle>
                     </svg>
                  </div>
                  <div className="loader triangle">
                     <svg viewBox="0 0 86 80">
                        <polygon points="43 8 79 72 7 72"></polygon>
                     </svg>
                  </div>
                  <div className="loader">
                     <svg viewBox="0 0 80 80">
                        <rect height="64" width="64" y="8" x="8"></rect>
                     </svg>
                  </div>
               </div>
            )}
            {router.pathname !== '/login' && (
               <div
                  style={{
                     backgroundImage: "url('/logo-fondo-removebg-preview.png')",
                     backgroundRepeat: 'no-repeat',
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     backgroundPositionX: isMobile ? 'center' : '7vw',
                     position: 'fixed',
                     top: 0,
                     left: 0,
                     width: '100%',
                     height: '100%',
                     opacity: 0.15,
                     zIndex: 0,
                  }}
               />
            )}
            {isAuthenticated ? (
               <Layout>
                  <div style={{ marginTop: isMobile ? '20%' : '6%' }}>
                     <Component {...pageProps} />
                  </div>
               </Layout>
            ) : (
               <Component {...pageProps} />
            )}
         </NextUIProvider>
      </NextThemesProvider>
   );
}

export default MyApp;
