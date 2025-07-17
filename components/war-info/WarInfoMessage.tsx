import React, { useState } from 'react';

// Componente para la generación y visualización de mensajes de guerra
const WarInfoMessage = ({
  generateFilteredWarMessage = (fullWarDetails: {}) => '',
  fullWarDetails = {},
  predictMessage = '',
  includeThreeStars = true,
  setIncludeThreeStars = (value: boolean) => {},
  includeTwoStars = true,
  setIncludeTwoStars = (value: boolean) => {},
  includeOneStar = true,
  setIncludeOneStar = (value: boolean) => {},
  includeMissingAttacks = false,
  setIncludeMissingAttacks = (value: boolean) => {},
  includeOneMissingAttack = false,
  setIncludeOneMissingAttack = (value: boolean) => {},
  includeTwoMissingAttacks = false,
  setIncludeTwoMissingAttacks = (value: boolean) => {}
}) => {

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      // fallback para navegadores antiguos
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  // Puedes filtrar los datos de guerra aquí según los checkboxes
  // y pasar los filtros a generateFilteredWarMessage si lo necesitas

  return (
    <div
      className="animate__animated animate__fadeIn bgblue card"
      style={{ marginTop: '20px', textAlign: 'left' }}
    >
      <h2>Mensaje de Guerra</h2>
      <div style={{ marginBottom: '10px' }}>
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={includeThreeStars}
            onChange={(e) => setIncludeThreeStars(e.target.checked)}
          />
          <span className="checkmark">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
            </svg>
          </span>
          <span className="label">Incluir ataques de 3 estrellas</span>
        </label>
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={includeTwoStars}
            onChange={(e) => setIncludeTwoStars(e.target.checked)}
          />
          <span className="checkmark">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
            </svg>
          </span>
          <span className="label">Incluir ataques de 2 estrellas</span>
        </label>
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={includeOneStar}
            onChange={(e) => setIncludeOneStar(e.target.checked)}
          />
          <span className="checkmark">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
            </svg>
          </span>
          <span className="label">Incluir ataques de 1 estrella</span>
        </label>
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={includeMissingAttacks}
            onChange={(e) => {
              const isChecked = e.target.checked;
              setIncludeMissingAttacks(isChecked);
              if (!isChecked) {
                setIncludeOneMissingAttack(false);
                setIncludeTwoMissingAttacks(false);
              }
            }}
          />
          <span className="checkmark">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
            </svg>
          </span>
          <span className="label">Incluir ataques faltantes</span>
        </label>
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={includeOneMissingAttack}
            disabled={!includeMissingAttacks}
            onChange={(e) => {
              setIncludeOneMissingAttack(e.target.checked);
              if (e.target.checked) {
                setIncludeTwoMissingAttacks(false);
              }
            }}
          />
          <span className="checkmark">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
            </svg>
          </span>
          <span className="label">Solo jugadores con 1 ataque faltante</span>
        </label>
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={includeTwoMissingAttacks}
            disabled={!includeMissingAttacks}
            onChange={(e) => {
              setIncludeTwoMissingAttacks(e.target.checked);
              if (e.target.checked) {
                setIncludeOneMissingAttack(false);
              }
            }}
          />
          <span className="checkmark">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
            </svg>
          </span>
          <span className="label">Solo jugadores con 2 ataques faltantes</span>
        </label>
      </div>
      <pre
        style={{
          backgroundColor: '#333',
          padding: '10px',
          borderRadius: '5px',
          overflowX: 'auto',
          fontSize: '14px',
        }}
      >
        {generateFilteredWarMessage(fullWarDetails)}
      </pre>
      <div className='ButtonNeonAnimate'>
        <div className="grid-bg">
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
        </div>
        <div className="button-container">
          <button onClick={() => copyToClipboard(generateFilteredWarMessage(fullWarDetails))} className="hacker-button" data-text=" Copiar Mensaje">
            Copiar Mensaje
            <div className="neon-frame"></div>
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
      <pre
        style={{
          backgroundColor: '#333',
          padding: '10px',
          borderRadius: '5px',
          overflowX: 'auto',
          fontSize: '14px',
        }}
      >
        {predictMessage}
      </pre>
      <div className='ButtonNeonAnimate'>
        <div className="grid-bg">
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
        </div>
        <div className="button-container">
          <button onClick={() => copyToClipboard(predictMessage)} className="hacker-button" data-text=" Copiar Predicción">
            Copiar Predicción
            <div className="neon-frame"></div>
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
    </div>
  );
};

export default WarInfoMessage;
