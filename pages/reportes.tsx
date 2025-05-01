import React from 'react';

const ReportesPage = () => {
    return (
        <div>
            <h1 className="animate__animated animate__backInDown neonText" style={{ textAlign: 'center', marginBottom: '20px' }}>
               Reportes de Jugadores
            </h1>      
            <div className="button-container">
                  <button   className="green-hacker-button" data-text="Agregar Reporte">
                    Agregar Reporte
                    <div className="green-neon-frame"></div>
                    <div className="circuit-traces">
                      <div className="circuit-trace"></div>
                      <div className="circuit-trace"></div>
                      <div className="circuit-trace"></div>
                      <div className="circuit-trace"></div>
                      <div className="circuit-trace"></div>
                    </div>
                    <div className="code-fragments">
                      <span className="code-fragment">GUERRA!!</span>
                      <span className="code-fragment">LIGA!!</span>
                      <span className="code-fragment">ATAQUES!!</span>
                      <span className="code-fragment">EJERCITOS</span>
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
                <br />
            <p style={{textAlign:'center'}}>En esta ventana podras filtrar jugadores y ver algun reporte realizado por algun colider</p>

        </div>
    );
};

export default ReportesPage;
