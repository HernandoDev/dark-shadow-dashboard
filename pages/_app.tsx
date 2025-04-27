import '../styles/globals.css';
import '../styles/login.css'; // Mueve la importación aquí
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

   useEffect(() => {
      const handleResize = () => {
         setIsMobile(window.innerWidth <= 768); // Define móvil como ancho <= 768px
      };
      handleResize(); // Ejecuta al cargar
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   useEffect(() => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (!isAuthenticated && router.pathname !== '/login') {
         router.push('/login');
      }
   }, [router]);

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
            {router.pathname !== '/login' && ( // Renderiza el fondo solo si no es la página de login
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
            <Layout>
               <div style={{marginTop: '18%'}}>
               < Component {...pageProps} />
               </div>
            </Layout>
         </NextUIProvider>
      </NextThemesProvider>
   );
}

export default MyApp;
