// services/apiClashService.ts

const baseUrl = 'http://34.57.116.166:3000';

export const APIClashService = {
  getClanInfo: async (clanTag: string) => {
    const res = await fetch(`${baseUrl}/clans/${clanTag}`);
    return res.json();
  },

  getClanMembersWithDetails: async (clanTag: string) => {
    const res = await fetch(`${baseUrl}/clans/${clanTag}/members/details`);
    return res.json();
  },

  saveClanMembersWithDetails: async (clanTag: string) => {
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
  }
};
