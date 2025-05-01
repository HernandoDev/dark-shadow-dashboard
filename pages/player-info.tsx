import React, { useEffect, useState } from 'react';
import { APIClashService } from '../services/apiClashService';
import { fetchSavedAttacks } from '../utils/fetchSavedAttacks';
import { calculatePlayerSummary, filterWarRecords, calculateAttackPerformance } from '../utils/playerUtils';
import AttackSummaryTab from '../components/player-info/AttackSummaryTab';
import DonationsTab from '../components/player-info/DonationsTab';

const PlayerInfo = () => {
  const [warSaves, setWarSaves] = useState<any[]>([]);
  const [clanMembers, setClanMembers] = useState<string[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [playerWarRecords, setPlayerWarRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingWarSaves, setLoadingWarSaves] = useState(false);
  const [savedAttacks, setSavedAttacks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'resumen' | 'donaciones'>('resumen');

  const fetchWarSaves = async () => {
    setLoadingWarSaves(true);
    try {
      const response = await APIClashService.getWarSaves();
      setWarSaves(response);
    } catch (error) {
      console.error('Error fetching war saves:', error);
    } finally {
      setLoadingWarSaves(false);
    }
  };

  const fetchClanMembers = async () => {
    setLoading(true);
    try {
      const response = await APIClashService.getClanMembers();
      const memberNames = response.items.map((member: { name: string }) => member.name);
      setClanMembers(memberNames);
      setFilteredMembers(memberNames);
    } catch (error) {
      console.error('Error fetching clan members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedAttacksData = async () => {
    try {
      const data = await fetchSavedAttacks();
      setSavedAttacks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching saved attacks:', error);
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filterText = event.target.value.toLowerCase();
    setFilteredMembers(clanMembers.filter((name) => name.toLowerCase().includes(filterText)));
  };

  const handlePlayerSelection = (playerName: string) => {
    setSelectedPlayer(playerName);
    const records = filterWarRecords(warSaves, playerName);
    setPlayerWarRecords(records);
  };

  useEffect(() => {
    fetchWarSaves();
    fetchClanMembers();
    fetchSavedAttacksData();
  }, []);

  const playerSummary = calculatePlayerSummary(playerWarRecords, selectedPlayer);
  const attackPerformance = calculateAttackPerformance(savedAttacks, selectedPlayer);

  return (
    <div style={{ padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <h1 className="animate__animated animate__backInDown neonText" style={{ textAlign: 'center', marginBottom: '20px' }}>
        Player Info
      </h1>
      <p>En esta ventana podrás buscar a los jugadores del clan para obtener un resumen completo de cada uno...</p>
      <h2>Buscar Jugador</h2>
      <input
        className="input"
        type="text"
        placeholder="Search for a player..."
        onChange={handleFilterChange}
        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}
      />
      <select
        className="input"
        value={selectedPlayer}
        onChange={(e) => handlePlayerSelection(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}
      >
        <option value="" disabled>Select a player</option>
        {filteredMembers.map((member, index) => (
          <option key={index} value={member}>{member}</option>
        ))}
      </select>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
        <button
          className={`tabButton ${activeTab === 'resumen' ? 'active' : ''}`}
          onClick={() => setActiveTab('resumen')}
        >
          <span>Resumen Ataques</span>
        </button>
        <button
          className={`tabButton ${activeTab === 'donaciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('donaciones')}
        >
          <span>Info Player</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'resumen' && (
        <AttackSummaryTab
          selectedPlayer={selectedPlayer}
          playerSummary={playerSummary}
          attackPerformance={attackPerformance}
        />
      )}
      {activeTab === 'donaciones' && <DonationsTab selectedPlayer={selectedPlayer} />}
    </div>
  );
};

export default PlayerInfo;
