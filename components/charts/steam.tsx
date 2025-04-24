import React from 'react';
import {Box} from '../styles/box';
import Chart, {Props} from 'react-apexcharts';

const Steam = ({chartData}: {chartData: {attack: string; stars: number}[]}) => {
   const series: Props['series'] = [
      {
         name: 'Stars',
         data: chartData.map((data) => ({ x: data.attack, y: data.stars })),
      },
   ];

   const options: Props['options'] = {
      chart: {
         type: 'area',
         animations: {
            easing: 'linear',
            speed: 300,
         },
         fontFamily: 'Inter, sans-serif',
         foreColor: 'var(--nextui-colors-accents9)',
         toolbar: {
            show: false,
         },
      },
      xaxis: {
         categories: chartData.map((data) => data.attack),
         labels: {
            style: {
               colors: 'var(--nextui-colors-accents8)',
               fontSize: '14px',
               fontFamily: 'Inter, sans-serif',
            },
         },
         axisBorder: {
            color: 'var(--nextui-colors-border)',
         },
         axisTicks: {
            color: 'var(--nextui-colors-border)',
         },
      },
      yaxis: {
         labels: {
            style: {
               colors: 'var(--nextui-colors-accents8)',
               fontSize: '14px',
               fontFamily: 'Inter, sans-serif',
            },
         },
      },
      tooltip: {
         enabled: true,
         theme: '#e0e0e0', // Use dark theme for tooltip
       
         cssClass: 'custom-tooltip', // Add custom class for further styling
      },
      grid: {
         show: true,
         borderColor: 'var(--nextui-colors-border)',
      },
      stroke: {
         curve: 'smooth',
         width: 2,
      },
      dataLabels: {
         enabled: true,
         style: {
            fontSize: '16px',
         },
      },
   };

   // Add custom CSS for tooltip background
   const customTooltipStyles = `
      .custom-tooltip {
         background-color: #e0e0e0 !important; /* Gray background */
         color: #000 !important; /* Black text */
         border-radius: 5px;
         padding: 10px;
      }
   `;

   // Inject custom styles into the document
   if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = customTooltipStyles;
      document.head.appendChild(style);
   }

   return (
      <Box
         css={{
            width: '100%',
            zIndex: 5,
         }}
      >
         <div id="chart">
            <Chart options={options} series={series} type="area" height={425} />
         </div>
      </Box>
   );
};

export {Steam};
