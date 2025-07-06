// Tipos e interfaces para war-info

export interface Member {
  mapPosition: number;
  name: string;
  townhallLevel: number;
  attacks?: Attack[];
  tag: string;
}

export interface Attack {
  stars: number;
  destructionPercentage: number;
  defenderTag: string;
}

export interface Clan {
  tag: string;
  name: string;
  status?: string;
  members: Member[];
}

export interface WarDetails {
  clan: Clan;
  opponent: Clan;
  attacksPerMember?: number;
}

export interface ClanMember {
  tag: string;
  name: string;
  townhallLevel: number;
  mapPosition: number;
  attacks?: Attack[];
}
