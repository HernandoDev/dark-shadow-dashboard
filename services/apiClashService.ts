// services/apiClashService.ts

const baseUrl = 'https://dark-shadows.ddns.net';
// const baseUrl = 'http://localhost:3100';

const isAuthenticated = () => {
   return typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true';
};

export const APIClashService = {
  getClanInfo: async (clanTag: string) => {
    if (!isAuthenticated()) throw new Error('User not authenticated');
    const res = await fetch(`${baseUrl}/clans/${clanTag}`);
    return res.json();
  },

  getClanMembersWithDetails: async (clanTag: string) => {
    if (!isAuthenticated()) throw new Error('User not authenticated');
    const res = await fetch(`${baseUrl}/clans/${clanTag}/members/details`);
    return res.json();
  },

  saveClanMembersWithDetails: async (clanTag: string) => {
    if (!isAuthenticated()) throw new Error('User not authenticated');
    const res = await fetch(`${baseUrl}/clans/${clanTag}/members/details/save`);
    return res.json();
  },

  getClanWarLeagueGroup: async (clanTag: string) => {
    const res = await fetch(`${baseUrl}/clans/${clanTag}/currentwar/leaguegroup`);
    return res.json();
  },

  getClanWarLeagueGroupDetails: async (clanTag: string) => {
    const res = await fetch(`${baseUrl}/clans/${clanTag}/currentwar/leaguegroup/details`);
    return res.json();
  },

  getClanCurrentWar: async (clanTag: string) => {
    const res = await fetch(`${baseUrl}/clans/${clanTag}/currentwar`);
    return res.json();
  },

  getWarLog: async (clanTag: string) => {
    const res = await fetch(`${baseUrl}/clans/${clanTag}/warlog`);
    return res.json();
  },

  searchClans: async (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${baseUrl}/clans?${query}`);
    return res.json();
  },

  getPlayerInfo: async (playerTag: string) => {
    const res = await fetch(`${baseUrl}/players/${playerTag}`);
    return res.json();
  },

  verifyPlayerToken: async (playerTag: string) => {
    const res = await fetch(`${baseUrl}/players/${playerTag}/verifytoken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    return res.json();
  },

  getCapitalRaidSeasons: async (clanTag: string) => {
    const res = await fetch(`${baseUrl}/clans/${clanTag}/capitalraidseasons`);
    return res.json();
  },

  getClanMembers: async (clanTag: string) => {
    const res = await fetch(`${baseUrl}/clans/${clanTag}/members`);
    return res.json();
  },

  getWarDetails: async (warTag: string) => {
    const res = await fetch(`${baseUrl}/clanwarleagues/wars/${warTag}`);
    return res.json();
  },

  getSaves: async (clanTag?: string) => {
    const url = clanTag ? `${baseUrl}/saves/${clanTag}` : `${baseUrl}/saves`;
    const res = await fetch(url);
    return res.json();
  },

  saveProgress: async (clanTag: string) => {
    return APIClashService.saveClanMembersWithDetails(clanTag);
  },

  saveAttackLog: async (attackData: { member: string; attack: string; percentage: number; stars: number; thRival: string; description: string; memberThLevel: string }) => {
    const res = await fetch(`${baseUrl}/attack-log/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attackData),
    });
    if (!res.ok) {
        throw new Error('Error al guardar el ataque');
    }
    return res.json();
  },

  getAttackLogs: async () => {
    if (!isAuthenticated()) throw new Error('User not authenticated');
    const res = await fetch(`${baseUrl}/attack-log`);
    if (!res.ok) {
        throw new Error('Error al obtener los ataques guardados');
    }
    return res.json();
  }
};
