import React, { useState } from 'react';
import { Star, User, Target, Percent, Calendar, Shield, Info } from 'react-feather';

// Tipos e interfaces para los datos
interface Attack {
  stars: number;
  destructionPercentage: number;
  defenderTag: string;
  timestamp?: number;
  attack?: string;
  percentage?: number;
  member?: string;
  memberThLevel?: number;
  thRival?: number;
  description?: string;
  warTimestamp?: string;
  id?: string;
}

interface ClanMember {
  mapPosition: number;
  name: string;
  townhallLevel: number;
  tag: string;
  attacks?: Attack[];
  attacksMissing?: number;
}

interface WarContent {
  startTime: string;
  clan: {
    name: string;
    stars: number;
    destructionPercentage: number;
    tag: string;
    members: ClanMember[];
    attacks?: number;
  };
  opponent: {
    name: string;
    stars: number;
    destructionPercentage: number;
    tag: string;
    members: ClanMember[];
    attacks?: number;
  };
  state?: string;
  attacksPerMember?: number;
}

interface WarSave {
  fileName: string;
  content: WarContent;
}

interface SavedAttack extends Attack {}

interface WarLogsProps {
  warSaves?: WarSave[];
  warLeageSaves?: WarSave[];
  savedAttacks?: SavedAttack[];
  loadingWarSaves?: boolean;
  formatWarDate?: (date: string) => string;
  formatDate?: (date: string) => string;
  evaluateWarResult?: (war: WarSave) => string;
  getClanTag?: () => string;
  extractTimestampFromFileName?: (fileName: string) => string;
  getThColor?: (memberTh: number, rivalTh: number) => string;
  getPlayersWhoDidNotAttack?: (
    members: ClanMember[],
    attacks: SavedAttack[],
    attacksPerMember?: number
  ) => ClanMember[];
  deleteAttack?: (id?: string) => void;
}

const WarLogs: React.FC<WarLogsProps> = ({
  warSaves = [],
  warLeageSaves = [],
  savedAttacks = [],
  loadingWarSaves = false,
  formatWarDate = (date: string) => date,
  formatDate = (date: string) => date,
  evaluateWarResult = () => '',
  getClanTag = () => '',
  extractTimestampFromFileName = () => '',
  getThColor = () => '',
  getPlayersWhoDidNotAttack = () => [],
  deleteAttack = () => {},
}) => {
  const [selectedWar, setSelectedWar] = useState<WarSave | null>(null);
  const [showWarMap, setShowWarMap] = useState(false);
  const [showSavedAttacks, setShowSavedAttacks] = useState(false);
  const [filterPlayerName, setFilterPlayerName] = useState('');
  const [includeThreeStars, setIncludeThreeStars] = useState(true);
  const [includeTwoStars, setIncludeTwoStars] = useState(true);
  const [includeOneStar, setIncludeOneStar] = useState(true);
  const [includeMissingAttacks, setIncludeMissingAttacks] = useState(false);

  const handleWarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fileName = e.target.value;
    const war =
      warSaves.concat(warLeageSaves).find((w) => w.fileName === fileName) || null;
    setSelectedWar(war);
    setShowWarMap(false);
    setShowSavedAttacks(false);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Registros de Guerras Pasadas</h2>
      <p>Selecciona un registro de guerra para ver los detalles.</p>
      {loadingWarSaves ? (
        <p>Cargando registros de guerras...</p>
      ) : (
        <select
          className='input'
          id="war-select"
          value={selectedWar?.fileName || ''}
          onChange={handleWarChange}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '16px',
            marginBottom: '20px',
          }}
        >
          <option value="" disabled>
            Seleccione una guerra
          </option>
          {warSaves
            .filter(war => war.content?.state !== 'preparation')
            .slice(-10)
            .reverse()
            .map((war, index) => (
              <option key={index} value={war.fileName}>
                {formatWarDate(war.fileName)}
              </option>
            ))}
          {warLeageSaves
            .filter(war => war.content?.state !== 'notInWar' && war.content?.state !== 'preparation')
            .slice(-15)
            .reverse()
            .map((war, index) => (
              <option key={index} value={war.fileName}>
                {formatWarDate(war.fileName)} - {war.content?.state}
              </option>
            ))}
        </select>
      )}
      {selectedWar && (
        <div style={{ marginTop: '20px', textAlign: 'center', width: '100%' }}>
          <h3>Detalles del Registro Seleccionado</h3>
          <p><strong>Fecha:</strong> {formatDate(selectedWar.content.startTime)}</p>
          <p>
            <strong style={{ fontSize: '22px' }}>
              {selectedWar.content.clan.name}: {selectedWar.content.clan.stars} <Star size={16} style={{ marginRight: '5px' }} /> - {selectedWar.content.clan.destructionPercentage.toFixed(2)}%
            </strong>
          </p>
          <p>
            <strong style={{ fontSize: '22px' }}>
              {selectedWar.content.opponent.name}: {selectedWar.content.opponent.stars} <Star size={16} style={{ marginRight: '5px' }} /> - {selectedWar.content.opponent.destructionPercentage.toFixed(2)}%
            </strong>
          </p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'violet' }}>
            Resultado: {evaluateWarResult(selectedWar)}
          </p>

          {/* Collapsible War Map Section */}
          <div style={{ marginTop: '20px' }}>
            <h3 onClick={() => setShowWarMap(!showWarMap)} style={{ cursor: 'pointer' }}>
              Ataques resumidos {showWarMap ? '▲' : '▼'}
            </h3>
            {showWarMap && (
              <div>
                <div style={{ marginBottom: '10px' }}>
                  <button
                    onClick={() => {
                      const clanTag = getClanTag().replace('%23', '#');
                      const isMainClan = selectedWar.content.clan.tag === clanTag;
                      const mainClan = isMainClan ? selectedWar.content.clan : selectedWar.content.opponent;
                      mainClan.members.sort((a, b) => {
                        const aStars = a.attacks?.reduce((sum, attack) => sum + attack.stars, 0) || 0;
                        const bStars = b.attacks?.reduce((sum, attack) => sum + attack.stars, 0) || 0;
                        return bStars - aStars;
                      });
                      setShowWarMap(false);
                      setTimeout(() => setShowWarMap(true), 0);
                    }}
                    style={{ marginRight: '10px' }}
                  >
                    Ordenar por mejores ataques
                  </button>
                  <button
                    onClick={() => {
                      const clanTag = getClanTag().replace('%23', '#');
                      const isMainClan = selectedWar.content.clan.tag === clanTag;
                      const mainClan = isMainClan ? selectedWar.content.clan : selectedWar.content.opponent;
                      mainClan.members.sort((a, b) => {
                        const aStars = a.attacks?.reduce((sum, attack) => sum + attack.stars, 0) || 0;
                        const bStars = b.attacks?.reduce((sum, attack) => sum + attack.stars, 0) || 0;
                        return aStars - bStars;
                      });
                      setShowWarMap(false);
                      setTimeout(() => setShowWarMap(true), 0);
                    }}
                  >
                    Ordenar por peores ataques
                  </button>
                </div>
                {(() => {
                  const clanTag = getClanTag().replace('%23', '#');
                  const isMainClan = selectedWar.content.clan.tag === clanTag;
                  const mainClan = isMainClan ? selectedWar.content.clan : selectedWar.content.opponent;
                  const opponentClan = isMainClan ? selectedWar.content.opponent : selectedWar.content.clan;

                  return (mainClan.attacks ?? 0) > 0 ? (
                    <div>
                      {mainClan.members.map((member, index) => (
                        <div key={index} className="bgblue" style={{ marginBottom: '10px' }}>
                          <div className="card">
                            <h4 style={{ color: '#4caf50', marginBottom: '10px' }}>
                              {member.mapPosition}. {member.name} (TH{member.townhallLevel})
                            </h4>
                            {member.attacks && member.attacks.length > 0 ? (
                              <ul style={{ listStyle: 'none', padding: 0 }}>
                                {member.attacks.map((attack, attackIndex) => {
                                  const defender = opponentClan.members?.find((opponent) => opponent.tag === attack.defenderTag);
                                  return (
                                    <li key={attackIndex} style={{ marginBottom: '10px' }}>
                                      <p>
                                        <strong>Defensor:</strong>{' '}
                                        {defender?.name || 'Desconocido'}
                                      </p>
                                      <p>
                                        <strong>Estrellas:</strong>{' '}
                                        <span style={{ color: attack.stars === 3 ? 'green' : attack.stars === 2 ? 'orange' : 'red' }}>
                                          {attack.stars}
                                        </span>
                                      </p>
                                      <p>
                                        <strong>Porcentaje:</strong> {attack.destructionPercentage}%
                                      </p>
                                      <p>
                                        <strong>TH Rival:</strong>{' '}
                                        <span
                                          style={{
                                            color:
                                              member.townhallLevel < (defender?.townhallLevel ?? 0)
                                                ? 'red'
                                                : 'green',
                                          }}
                                        >
                                          {defender?.townhallLevel ?? 'Desconocido'}
                                        </span>
                                      </p>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <p style={{ color: 'red' }}>No realizó ataques.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No hay combates aún.</p>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Collapsible Saved Attacks Section */}
          <div style={{ marginTop: '20px' }}>
            <h3 onClick={() => setShowSavedAttacks(!showSavedAttacks)} style={{ cursor: 'pointer' }}>
              Ataques Guardados con Ejercito y observaciones {showSavedAttacks ? '▲' : '▼'}
            </h3>
            {showSavedAttacks && (
              <div>
                {savedAttacks.filter((attack) => attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)).length > 0 ? (
                  <div>
                    <input
                      className="input"
                      type="text"
                      placeholder="Filtrar por nombre de jugador"
                      value={filterPlayerName}
                      onChange={(e) => setFilterPlayerName(e.target.value)}
                      style={{
                        marginBottom: '20px',
                        padding: '10px',
                        borderRadius: '5px',
                        width: '100%',
                        fontSize: '16px',
                      }}
                    />
                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>Filtros de Ataques</h3>
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
                        <span className="label">Mostrar ataques de 3 estrellas</span>
                      </label>
                      <label className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={includeTwoStars}
                          onChange={(e) => setIncludeTwoStars(e.target.checked)}
                        />
                        <span className="checkmark">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 24" fill="currentColor">
                            <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                          </svg>
                        </span>
                        <span className="label">Mostrar ataques de 2 estrellas</span>
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
                        <span className="label">Mostrar ataques de 1 estrella</span>
                      </label>
                      <label className="checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={includeMissingAttacks}
                          onChange={(e) => setIncludeMissingAttacks(e.target.checked)}
                        />
                        <span className="checkmark">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                          </svg>
                        </span>
                        <span className="label">Mostrar jugadores no atacados</span>
                      </label>
                    </div>
                    {includeThreeStars &&
                      savedAttacks.some((attack) => attack.stars === 3 && attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)) && (
                        <div>
                          <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>Ataques de 3 Estrellas</h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                            {savedAttacks
                              .filter((attack) => attack.stars === 3 && attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName))
                              .map((attack, index) => (
                                <div key={index} className="bgblue" style={{ width: '100%' }}>
                                  <div className="card">
                                    <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '20px' }}>
                                      <User size={16} style={{ marginRight: '5px' }} />
                                      {attack.member}
                                    </h3>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                      <li style={{ marginBottom: '5px' }}>
                                        <strong>
                                          <Target size={16} style={{ marginRight: '5px' }} />
                                          Ataque:
                                        </strong>{' '}
                                        {attack.attack}
                                      </li>
                                      <li style={{ marginBottom: '5px' }}>
                                        <strong>
                                          <Percent size={16} style={{ marginRight: '5px' }} />
                                          Porcentaje:
                                        </strong>{' '}
                                        {attack.percentage}%
                                      </li>
                                      <li style={{ marginBottom: '5px' }}>
                                        <strong>
                                          <Star size={16} style={{ marginRight: '5px' }} />
                                          Estrellas:
                                        </strong>{' '}
                                        {attack.stars}
                                      </li>
                                      {attack.timestamp !== undefined ? (
                                        <li style={{ marginBottom: '5px' }}>
                                          <strong>
                                            <Calendar size={16} style={{ marginRight: '5px' }} />
                                            Fecha:
                                          </strong>{' '}
                                          {new Date(attack.timestamp).toLocaleString()}
                                        </li>
                                      ) : null}
                                      <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel ?? 0, attack.thRival ?? 0) }}>
                                        <strong>
                                          <Shield size={16} style={{ marginRight: '5px' }} />
                                          TH Rival:
                                        </strong>{' '}
                                        {attack.thRival}
                                      </li>
                                      <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel ?? 0, attack.thRival ?? 0) }}>
                                        <strong>
                                          <Shield size={16} style={{ marginRight: '5px' }} />
                                          TH Miembro:
                                        </strong>{' '}
                                        {attack.memberThLevel}
                                      </li>
                                      {attack.description && (
                                        <li style={{ marginBottom: '5px' }}>
                                          <strong>
                                            <Info size={16} style={{ marginRight: '5px' }} />
                                            Descripción:
                                          </strong>{' '}
                                          {attack.description}
                                        </li>
                                      )}
                                    </ul>
                                    <i
                                      style={{ textAlign: 'right', color: 'red', cursor: 'pointer' }}
                                      className="bi bi-trash"
                                      onDoubleClick={() => deleteAttack(attack.id)}
                                    ></i>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    {includeTwoStars &&
                      savedAttacks.some((attack) => attack.stars === 2 && attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)) && (
                        <div>
                          <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>Ataques de 2 Estrellas</h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                            {savedAttacks
                              .filter((attack) => attack.stars === 2 && attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName))
                              .map((attack, index) => (
                                <div key={index} className="bgblue" style={{ width: '100%' }}>
                                  <div className="card">
                                    <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '20px' }}>
                                      <User size={16} style={{ marginRight: '5px' }} />
                                      {attack.member}
                                    </h3>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                      <li style={{ marginBottom: '5px' }}>
                                        <strong>
                                          <Target size={16} style={{ marginRight: '5px' }} />
                                          Ataque:
                                        </strong>{' '}
                                        {attack.attack}
                                      </li>
                                      <li style={{ marginBottom: '5px' }}>
                                        <strong>
                                          <Percent size={16} style={{ marginRight: '5px' }} />
                                          Porcentaje:
                                        </strong>{' '}
                                        {attack.percentage}%
                                      </li>
                                      <li style={{ marginBottom: '5px' }}>
                                        <strong>
                                          <Star size={16} style={{ marginRight: '5px' }} />
                                          Estrellas:
                                        </strong>{' '}
                                        {attack.stars}
                                      </li>
                                      {attack.timestamp !== undefined ? (
                                        <li style={{ marginBottom: '5px' }}>
                                          <strong>
                                            <Calendar size={16} style={{ marginRight: '5px' }} />
                                            Fecha:
                                          </strong>{' '}
                                          {new Date(attack.timestamp).toLocaleString()}
                                        </li>
                                      ) : null}
                                      <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel ?? 0, attack.thRival ?? 0) }}>
                                        <strong>
                                          <Shield size={16} style={{ marginRight: '5px' }} />
                                          TH Rival:
                                        </strong>{' '}
                                        {attack.thRival}
                                      </li>
                                      <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel ?? 0, attack.thRival ?? 0) }}>
                                        <strong>
                                          <Shield size={16} style={{ marginRight: '5px' }} />
                                          TH Miembro:
                                        </strong>{' '}
                                        {attack.memberThLevel}
                                      </li>
                                      {attack.description && (
                                        <li style={{ marginBottom: '5px' }}>
                                          <strong>
                                            <Info size={16} style={{ marginRight: '5px' }} />
                                            Descripción:
                                          </strong>{' '}
                                          {attack.description}
                                        </li>
                                      )}
                                    </ul>
                                    <i
                                      style={{ textAlign: 'right', color: 'red', cursor: 'pointer' }}
                                      className="bi bi-trash"
                                      onDoubleClick={() => deleteAttack(attack.id)}
                                    ></i>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    {includeOneStar &&
                      savedAttacks.some((attack) => attack.stars === 1 && attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)) && (
                        <div>
                          <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>Ataques de 1 Estrella</h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                            {savedAttacks
                              .filter((attack) => attack.stars === 1 && attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName))
                              .map((attack, index) => (
                                <div key={index} className="bgblue" style={{ width: '100%' }}>
                                  <div className="card">
                                    <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '20px' }}>
                                      <User size={16} style={{ marginRight: '5px' }} />
                                      {attack.member}
                                    </h3>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                      <li style={{ marginBottom: '5px' }}>
                                        <strong>
                                          <Target size={16} style={{ marginRight: '5px' }} />
                                          Ataque:
                                        </strong>{' '}
                                        {attack.attack}
                                      </li>
                                      <li style={{ marginBottom: '5px' }}>
                                        <strong>
                                          <Percent size={16} style={{ marginRight: '5px' }} />
                                          Porcentaje:
                                        </strong>{' '}
                                        {attack.percentage}%
                                      </li>
                                      <li style={{ marginBottom: '5px' }}>
                                        <strong>
                                          <Star size={16} style={{ marginRight: '5px' }} />
                                          Estrellas:
                                        </strong>{' '}
                                        {attack.stars}
                                      </li>
                                      {attack.timestamp !== undefined ? (
                                        <li style={{ marginBottom: '5px' }}>
                                          <strong>
                                            <Calendar size={16} style={{ marginRight: '5px' }} />
                                            Fecha:
                                          </strong>{' '}
                                          {new Date(attack.timestamp).toLocaleString()}
                                        </li>
                                      ) : null}
                                      <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel ?? 0, attack.thRival ?? 0) }}>
                                        <strong>
                                          <Shield size={16} style={{ marginRight: '5px' }} />
                                          TH Rival:
                                        </strong>{' '}
                                        {attack.thRival}
                                      </li>
                                      <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel ?? 0, attack.thRival ?? 0) }}>
                                        <strong>
                                          <Shield size={16} style={{ marginRight: '5px' }} />
                                          TH Miembro:
                                        </strong>{' '}
                                        {attack.memberThLevel}
                                      </li>
                                      {attack.description && (
                                        <li style={{ marginBottom: '5px' }}>
                                          <strong>
                                            <Info size={16} style={{ marginRight: '5px' }} />
                                            Descripción:
                                          </strong>{' '}
                                          {attack.description}
                                        </li>
                                      )}
                                    </ul>
                                    <i
                                      style={{ textAlign: 'right', color: 'red', cursor: 'pointer' }}
                                      className="bi bi-trash"
                                      onDoubleClick={() => deleteAttack(attack.id)}
                                    ></i>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    {includeMissingAttacks &&
                      getPlayersWhoDidNotAttack(
                        selectedWar.content.clan.members,
                        savedAttacks.filter((attack) => attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)),
                        selectedWar.content.attacksPerMember
                      ).length > 0 && (
                        <div>
                          <h3 style={{ textAlign: 'center', color: 'red', marginBottom: '10px' }}>Jugadores No Atacaron</h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                            {getPlayersWhoDidNotAttack(
                              selectedWar.content.clan.members,
                              savedAttacks.filter((attack) => attack.warTimestamp === extractTimestampFromFileName(selectedWar.fileName)),
                              selectedWar.content.attacksPerMember
                            ).map((member, index) => (
                              <div key={index} className="bgblue" style={{ width: '100%' }}>
                                <div className="card">
                                  <h3 style={{ textAlign: 'center', color: 'red', marginBottom: '10px' }}>
                                    {member.name} - No atacó
                                  </h3>
                                  <p>Faltan {member.attacksMissing} ataque(s)</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <p>No hay ataques guardados disponibles para esta guerra.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WarLogs;