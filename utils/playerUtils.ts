export const calculatePlayerSummary = (playerWarRecords: any[], leagueWarRecords: any[], selectedPlayer: string) => {
    const calculateSummary = (records: any[]) => {
        let totalWars = 0;
        let totalStars = 0;
        let totalDestruction = 0;
        let totalAttacks = 0;
        let missedAttacks = 0;

        records.forEach((record) => {
            const playerData =
                record.content.clan.members.find((member: any) => member.name === selectedPlayer) ||
                record.content.opponent.members.find((member: any) => member.name === selectedPlayer);

            if (playerData) {
                totalWars++;
                totalStars += playerData.attacks?.reduce((sum: number, attack: any) => sum + attack.stars, 0) || 0;
                totalDestruction += playerData.attacks?.reduce((sum: number, attack: any) => sum + attack.destructionPercentage, 0) || 0;
                totalAttacks += playerData.attacks?.length || 0;
                missedAttacks += Math.max(0, record.content.attacksPerMember - (playerData.attacks?.length || 0));
            }
        });

        const averageStars = totalAttacks > 0 ? (totalStars / totalAttacks).toFixed(2) : '0';
        const averageDestruction = totalAttacks > 0 ? (totalDestruction / totalAttacks).toFixed(2) : '0';

        return {
            totalWars,
            averageStars,
            averageDestruction,
            missedAttacks,
        };
    };

    const normalWarSummary = calculateSummary(playerWarRecords);
    const leagueWarSummary = calculateSummary(leagueWarRecords);

    return {
        normalWarSummary,
        leagueWarSummary,
        combinedSummary: {
            totalWars: normalWarSummary.totalWars + leagueWarSummary.totalWars,
            averageStars: (
                (parseFloat(normalWarSummary.averageStars) * normalWarSummary.totalWars +
                    parseFloat(leagueWarSummary.averageStars) * leagueWarSummary.totalWars) /
                (normalWarSummary.totalWars + leagueWarSummary.totalWars || 1)
            ).toFixed(2),
            averageDestruction: (
                (parseFloat(normalWarSummary.averageDestruction) * normalWarSummary.totalWars +
                    parseFloat(leagueWarSummary.averageDestruction) * leagueWarSummary.totalWars) /
                (normalWarSummary.totalWars + leagueWarSummary.totalWars || 1)
            ).toFixed(2),
            missedAttacks: normalWarSummary.missedAttacks + leagueWarSummary.missedAttacks,
        },
    };
};

export const filterWarRecords = (warSaves: any[], playerName: string) => {
    return warSaves.filter((war) =>
        war.content.clan.members.some((member: any) => member.name === playerName) ||
        war.content.opponent.members.some((member: any) => member.name === playerName)
    );
};

export const calculateAttackPerformance = (savedAttacks: any[], selectedPlayer: string) => {
    const playerAttacks = savedAttacks.filter((attack) => attack.member === selectedPlayer);

    if (!playerAttacks.length) return [];

    const attackPerformance: Record<string, { count: number; totalStars: number; totalDestruction: number; higherThCount: number; equalThCount: number; lowerThCount: number }> = {};

    playerAttacks.forEach((attack) => {
        if (!attackPerformance[attack.attack]) {
            attackPerformance[attack.attack] = { 
                count: 0, 
                totalStars: 0, 
                totalDestruction: 0,
                higherThCount: 0,
                equalThCount: 0,
                lowerThCount: 0 
            };
        }

        attackPerformance[attack.attack].count++;
        attackPerformance[attack.attack].totalStars += attack.stars;
        attackPerformance[attack.attack].totalDestruction += attack.destructionPercentage;

        if (attack.thLevel > attack.targetThLevel) {
            attackPerformance[attack.attack].higherThCount++;
        } else if (attack.thLevel === attack.targetThLevel) {
            attackPerformance[attack.attack].equalThCount++;
        } else {
            attackPerformance[attack.attack].lowerThCount++;
        }
    });

    return Object.entries(attackPerformance).map(([attackType, data]) => ({
        attackType,
        ...data,
        averageStars: (data.totalStars / data.count).toFixed(2),
        averageDestruction: (data.totalDestruction / data.count).toFixed(2),
    }));
};