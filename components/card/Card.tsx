import { Button } from '@nextui-org/react';
import React from 'react';
import styled from 'styled-components';

interface CardProps {
  name: string;
  townHallLevel: number;
  heroes: { level: number }[];
  averageStars: string;
  onViewDetails: () => void;
  minLevels: {
    th: number;
    rey: number;
    reina: number;
    centinela: number;
    luchadora: number;
    principe: number;
  };
  position: number; // Add position prop
  topArmies?: string[]; // Add topArmies prop
  borderColor?: string; // Add borderColor prop
  tag: string; // Add tag prop
  missingAttacks?: number; // Add missingAttacks prop
}

const Card: React.FC<CardProps> = ({ name, townHallLevel, heroes, averageStars, onViewDetails, minLevels, position, topArmies, borderColor, tag, missingAttacks }) => {
  const openInGameProfile = () => {
    const url = `https://link.clashofclans.com/es?action=OpenPlayerProfile&tag=${encodeURIComponent(tag)}`;
    window.open(url, '_blank');
  };

  return (
    <StyledWrapper borderColor={borderColor}>
      <div className='card animate__animated animate__backInLeft bgblue'>
        <div className="card">
          <div className="bottom-section">
            <span className="title">{`${position}. ${name || 'N/A'}`}</span> {/* Display position */}
            <div className="row row1">
              <div style={{ color: townHallLevel < minLevels.th ? '#B22222' : 'inherit' }} className="item">
                <span className="big-text">TH</span>
                <span className="regular-text">{townHallLevel || 'N/A'}</span>
              </div>
              <div style={{ color: heroes?.[0]?.level < minLevels.rey ? '#B22222' : 'inherit' }} className="item">
                <span className="big-text">Rey</span>
                <span className="regular-text">{heroes?.[0]?.level || 'N/A'}</span>
              </div>
              <div style={{ color: heroes?.[1]?.level < minLevels.reina ? '#B22222' : 'inherit' }} className="item">
                <span className="big-text">Reina</span>
                <span className="regular-text">{heroes?.[1]?.level || 'N/A'}</span>
              </div>
            </div>
            <div className="row row1">
              <div style={{ color: heroes?.[2]?.level < minLevels.centinela ? '#B22222' : 'inherit' }} className="item">
                <span className="big-text">Centinela</span>
                <span className="regular-text">{heroes?.[2]?.level || 'N/A'}</span>
              </div>
              <div style={{ color: heroes?.[4]?.level < minLevels.luchadora ? '#B22222' : 'inherit' }} className="item">
                <span className="big-text">Luchadora</span>
                <span className="regular-text">{heroes?.[4]?.level || 'N/A'}</span>
              </div>
              <div style={{ color: heroes?.[6]?.level < minLevels.principe ? '#B22222' : 'inherit' }} className="item">
                <span className="big-text">Principe</span>
                <span className="regular-text">{heroes?.[6]?.level || 'N/A'}</span>
              </div>
            </div>
            {topArmies && topArmies.length > 0 && (
              <div style={{ color: 'white', fontSize: '15px' }} className="top-armies">
                Ejércitos más usados: <br />
                {topArmies.join(', ')}
              </div>
            )}
            {averageStars && (
              <div style={{ textAlign: 'center', marginTop: '10px', color: 'white', fontSize: '15px' }}>
                Promedio de estrellas: {averageStars}
              </div>
            )}
            {missingAttacks !== null && missingAttacks !== undefined && missingAttacks > 0 && (
              <div style={{ textAlign: 'center', marginTop: '10px', color: 'red', fontSize: '15px' }}>
                Ataques faltantes en 45 días: {missingAttacks}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <div className='ButtonNeonAnimate'>
                <div className="grid-bg">
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                </div>
                <div className="button-container">
                  <button onClick={onViewDetails} className="blue-hacker-button" data-text="👁️ Ver Detalles">
                    👁️ Ver Detalles
                    <div className="blue-neon-frame"></div>
                    <div className="circuit-traces">
                      <div className="circuit-trace"></div>
                      <div className="circuit-trace"></div>
                      <div className="circuit-trace"></div>
                      <div className="circuit-trace"></div>
                      <div className="circuit-trace"></div>
                    </div>
                    <div className="code-fragments">
                      <span className="code-fragment">COPIAR</span>
                      <span className="code-fragment">PEGAR</span>
                      <span className="code-fragment">PEGAR</span>
                      <span className="code-fragment">ENVIAR</span>

                    </div>
                    <div className="interference"></div>
                    <div className="scan-bars">
                      <div className="scan-bar"></div>
                      <div className="scan-bar"></div>
                      <div className="scan-bar"></div>
                    </div>
                    <div className="text-glow"></div>
                  </button>
                </div>
              </div>
              {/* <Button onClick={onViewDetails}>👁️ Ver Detalles</Button> */}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <div style={{ padding: '20px' }} className='ButtonNeonAnimate'>
                <div className="grid-bg">
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                </div>
                <div className="button-container">
                  <button onClick={openInGameProfile} className="green-hacker-button" data-text="Abrir en el juego">
                    Abrir en el juego
                    <div className="green-neon-frame"></div>
                    <div className="circuit-traces">
                      <div className="circuit-trace"></div>
                      <div className="circuit-trace"></div>
                      <div className="circuit-trace"></div>
                      <div className="circuit-trace"></div>
                      <div className="circuit-trace"></div>
                    </div>
                    <div className="code-fragments">
                      <span className="code-fragment">GUARDAR</span>
                      <span className="code-fragment">PROGRESO</span>
                      <span className="code-fragment">JUAGORES</span>
                      <span className="code-fragment">CONTROL</span>

                    </div>
                    <div className="interference"></div>
                    <div className="scan-bars">
                      <div className="scan-bar"></div>
                      <div className="scan-bar"></div>
                      <div className="scan-bar"></div>
                    </div>
                    <div className="text-glow"></div>
                  </button>
                </div>
              </div>
              {/* <Button onClick={openInGameProfile}>Abrir jugador en el juego</Button> */}
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ borderColor?: string }>`
.bgblue {
  background: linear-gradient(135deg, #ffffff00, #593a8a7d, #ffffff00);
  padding: 1px;
  border-radius: 1.2rem;
  box-shadow: 0px 1rem 1.5rem -0.9rem #000000e1;
}
  .card {
    border-radius: 20px;
  background: linear-gradient(135deg, #0d112078 0%, rgba(106, 76, 166, 0.383) 43%, #0d1120 100%);
    padding: 5px;
    overflow: hidden;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 20px 0px;
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 2px solid ${({ borderColor }) => borderColor || 'transparent'}; /* Apply dynamic border color */
  }

  .card .top-section {
    height: 150px;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    background: linear-gradient(45deg, rgb(4, 159, 187) 0%, rgb(80, 246, 255) 100%);
    position: relative;
  }

  .card .top-section .border {
    border-bottom-right-radius: 10px;
    height: 30px;
    width: 130px;
    background: white;
    background: #1b233d;
    position: relative;
    transform: skew(-40deg);
    box-shadow: -10px -10px 0 0 #1b233d;
  }

  .card .top-section .border::before {
    content: "";
    position: absolute;
    width: 15px;
    height: 15px;
    top: 0;
    right: -15px;
    background: rgba(255, 255, 255, 0);
    border-top-left-radius: 10px;
    box-shadow: -5px -5px 0 2px #1b233d;
  }

  .card .top-section::before {
    content: "";
    position: absolute;
    top: 30px;
    left: 0;
    background: rgba(255, 255, 255, 0);
    height: 15px;
    width: 15px;
    border-top-left-radius: 15px;
    box-shadow: -5px -5px 0 2px #1b233d;
  }

  .card .top-section .icons {
    position: absolute;
    top: 0;
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: space-between;
  }

  .card .top-section .icons .logo {
    height: 100%;
    aspect-ratio: 1;
    padding: 7px 0 7px 15px;
  }

  .card .top-section .icons .logo .top-section {
    height: 100%;
  }

  .card .top-section .icons .social-media {
    height: 100%;
    padding: 8px 15px;
    display: flex;
    gap: 7px;
  }

  .card .top-section .icons .social-media .svg {
    height: 100%;
    fill: #1b233d;
  }

  .card .top-section .icons .social-media .svg:hover {
    fill: white;
  }

  .card .bottom-section {
    margin-top: 15px;
    padding: 10px 5px;
  }

  .card .bottom-section .title {
    display: block;
    font-size: 17px;
    font-weight: bolder;
    color: white;
    text-align: center;
    letter-spacing: 2px;
  }

  .card .bottom-section .row {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }

  .card .bottom-section .row .item {
    flex: 30%;
    text-align: center;
    padding: 5px;
    color: rgba(170, 222, 243, 0.721);
  }

  .card .bottom-section .row .item .big-text {
    font-size: 15px;
    display: block;
  }

  .card .bottom-section .row .item .regular-text {
    font-size: 11px;
  }

  .card .bottom-section .row .item:nth-child(2) {
    border-left: 1px solid rgba(255, 255, 255, 0.126);
    border-right: 1px solid rgba(255, 255, 255, 0.126);
  }

  .card .bottom-section .top-armies {
    margin-top: 15px;
    text-align: center;
    color: #1e293b;
    font-size: 14px;
  }
`;

export default Card;
