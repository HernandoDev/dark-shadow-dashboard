import React, { useState, useEffect } from 'react';
import { Button, Modal, Text, Loading, Input, FormElement } from '@nextui-org/react';
import { Plus, Star, Percent, User, Calendar, Target, Info, Shield } from 'react-feather'; // Import icons
import { APIClashService } from '../services/apiClashService';
import { fetchSavedAttacks } from '../utils/fetchSavedAttacks'; // Adjust the path as needed

const getClanTag = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('clanTag') || '%232QL0GCQGQ';
};

const AttackLog: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'searchPlayers' | 'clanSummary'>('clanSummary'); // Tab state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clanMembers, setClanMembers] = useState<string[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [members, setMembers] = useState<any[]>([]); // Store members for later use

    const [attacks, setAttacks] = useState<string[]>([
        'Spam Dragones + 11 invisibilidades',
        'Druidas y Valquirias',
        'Hydra + Blimp/Super Arqueras / Magos',
        'Hydra Normal',
        'Spam Terrestre, Lanceros',
        'Spam Aereo + Blimp con Yetis/Globos',
        'Ataque random aereo',
        'Ataque random terrestre',
        'Combinacion erronea de un ejercito existente',
        'Laloon',
        'Tropa de Eventos',
        'Super Montapuercos',
        'Spam terrestre + bola de fuego',
        'Dragones Electricos'
    ]);
    const [filteredAttacks, setFilteredAttacks] = useState<string[]>(attacks);
    const [attackSearchTerm, setAttackSearchTerm] = useState('');

    const [selectedMember, setSelectedMember] = useState('');
    const [selectedAttack, setSelectedAttack] = useState('');
    const [percentage, setPercentage] = useState('');
    const [stars, setStars] = useState('');
    const [thRival, setThRival] = useState('');
    const [description, setDescription] = useState('');

    const [savedAttacks, setSavedAttacks] = useState<any[]>([]);
    const [loadingSavedAttacks, setLoadingSavedAttacks] = useState(false);

    const [playerSearchTerm, setPlayerSearchTerm] = useState('');
    const [filteredPlayerAttacks, setFilteredPlayerAttacks] = useState<any[]>([]);

    const [startDate, setStartDate] = useState<string>(''); // Start date for filtering
    const [endDate, setEndDate] = useState<string>(''); // End date for filtering

    const [isSaving, setIsSaving] = useState(false); // New state to track saving status

    const [warSaves, setWarSaves] = useState<any[]>([]); // State to store war saves
    const [warLeageSaves, setWarLeageSaves] = useState<any[]>([]); // State to store war saves

    const [loadingWarSaves, setLoadingWarSaves] = useState(false); // State to track loading status for war saves

    const [selectedWar, setSelectedWar] = useState<any>(null); // State to store the selected war

    const [includeThreeStars, setIncludeThreeStars] = useState(true);
    const [includeTwoStars, setIncludeTwoStars] = useState(true);
    const [includeOneStar, setIncludeOneStar] = useState(true);
    const [includeMissingAttacks, setIncludeMissingAttacks] = useState(false);

    const [includeHigherTh, setIncludeHigherTh] = useState(false);
    const [includeLowerTh, setIncludeLowerTh] = useState(false);
    const [includeEqualTh, setIncludeEqualTh] = useState(false);

    const [selectAllFilters, setSelectAllFilters] = useState(true);

    useEffect(() => {
        setIncludeThreeStars(selectAllFilters);
        setIncludeTwoStars(selectAllFilters);
        setIncludeOneStar(selectAllFilters);
        setIncludeHigherTh(selectAllFilters);
        setIncludeLowerTh(selectAllFilters);
        setIncludeEqualTh(selectAllFilters);
    }, [selectAllFilters]);

    const handleWarChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFileName = event.target.value;
        const war = warSaves.find((w) => w.fileName === selectedFileName);
        setSelectedWar(war);
    };

    const fetchWarSaves = async () => {
        setLoadingWarSaves(true);
        try {
            const response = await APIClashService.getWarSaves();
            
            setWarLeageSaves(response.leagueWars); // Assuming response contains the league wars
            setWarSaves(response.normalWars); // Assuming response contains the war saves
        } catch (error) {
            console.error('Error fetching war saves:', error);
        } finally {
            setLoadingWarSaves(false);
        }
    };

    const formatWarDate = (fileName: string): string => {
        const cleanFileName = fileName.replace('.json', ''); // Remove .json extension
        const parts = cleanFileName.split('_');
        const type = parts[0] === 'war' ? 'guerra' : 'liga'; // Determine type based on prefix
        const datePart = parts[2].split('T')[0]; // Extract the date part
        const [year, month, day] = datePart.split('-');
        const months = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        return `${parseInt(day)} de ${months[parseInt(month) - 1]} ${year} (${type})`;
    };

    useEffect(() => {
        fetchWarSaves(); // Fetch war saves on component mount
    }, []);

    const openModal = async () => {
        setIsModalOpen(true);
        setLoading(true);
        try {
            const response = await APIClashService.getClanMembers(); // Clan Principal
            const memberNames = response.items.map((member: { name: string }) => member.name);
            setMembers(response.items); // Save the full members list
            setClanMembers(memberNames);
            setFilteredMembers(memberNames);
        } catch (error) {
            console.error('Error fetching clan members:', error);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setClanMembers([]);
        setFilteredMembers([]);
        setSearchTerm('');
        setAttackSearchTerm('');
        setFilteredAttacks(attacks);
        setSelectedMember('');
        setSelectedAttack('');
        setPercentage('');
        setStars('');
        setThRival('');
        setDescription('');
    };

    const handleSearch = (event: React.ChangeEvent<FormElement>) => {
        const value = (event.target as HTMLInputElement).value.toLowerCase();
        setSearchTerm(value);
        setFilteredMembers(clanMembers.filter(name => name.toLowerCase().includes(value)));
    };

    const handleAttackSearch = (event: React.ChangeEvent<FormElement>) => {
        const value = (event.target as HTMLInputElement).value.toLowerCase();
        setAttackSearchTerm(value);
        setFilteredAttacks(attacks.filter(attack => attack.toLowerCase().includes(value)));
    };

    const handlePlayerSearch = (event: React.ChangeEvent<FormElement>) => {
        const value = (event.target as HTMLInputElement).value.toLowerCase();
        setPlayerSearchTerm(value);
    };

    const handleDateRangeFilter = () => {
        if (!startDate || !endDate) {
            setFilteredPlayerAttacks(savedAttacks.filter((attack) =>
                attack.member.toLowerCase().includes(playerSearchTerm.toLowerCase())
            ));
            return;
        }

        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        const filteredAttacks = savedAttacks.filter((attack) => {
            const attackTime = new Date(attack.timestamp).getTime();
            return (
                attack.member.toLowerCase().includes(playerSearchTerm.toLowerCase()) &&
                attackTime >= start && attackTime <= end
            );
        });

        setFilteredPlayerAttacks(filteredAttacks);
    };

    useEffect(() => {
        handleDateRangeFilter();
    }, [playerSearchTerm, startDate, endDate, savedAttacks]);

    const handleStarsChange = (value: string) => {
        setStars(value);
        if (value === "3") {
            setPercentage("100"); // Automatically set percentage to 100 for 3 stars
        }
    };

    const getMemberThLevel = (memberName: string): string | null => {
        const member = members.find((m: { name: string }) => m.name === memberName);
        return member ? member.townHallLevel : null; // Assuming `thLevel` is the property for TH level
    };

    const getThColor = (memberThLevel: string, thRival: string): string => {
        const memberLevel = parseInt(memberThLevel.replace('TH', ''), 10);
        const rivalLevel = parseInt(thRival.replace('TH', ''), 10);

        if (memberLevel === rivalLevel) return 'green';
        if (memberLevel > rivalLevel) return 'yellow';
        return 'red';
    };

    const getAttackCardBorderColor = (points: number[], index: number): string => {
        const sortedPoints = [...points].sort((a, b) => b - a); // Sort points in descending order
        const topThree = sortedPoints.slice(0, 3); // Top 3 points
        const bottomThree = sortedPoints.slice(-3); // Bottom 3 attacks
        const fourthWorst = sortedPoints[sortedPoints.length - 4]; // 4th worst point

        const currentPoint = points[index];

        if (topThree.includes(currentPoint)) return 'green'; // Top 3 attacks
        if (currentPoint === fourthWorst) return 'yellow'; // 4th worst attack
        if (bottomThree.includes(currentPoint)) return 'red'; // Bottom 3 attacks
        return '#ccc'; // Default border color
    };

    const calculatePoints = (stars: number, memberThLevel: string, thRival: string, totalUses: number): number => {
        const memberLevel = parseInt(memberThLevel.replace('TH', ''), 10);
        const rivalLevel = parseInt(thRival.replace('TH', ''), 10);
        let points = stars;

        if (memberLevel > rivalLevel) {
            points -= 0.5; // Subtract 0.5 points if attacking a lower TH
        } else if (memberLevel < rivalLevel) {
            points += stars === 3 ? 0.5 : 0.25; // Add 0.5 for 3 stars, 0.25 otherwise
        }

        // Adjust points based on the total number of uses
        points = points / totalUses;

        return points;
    };

    const handleSave = async () => {
        if (!selectedMember || !selectedAttack || !percentage || !stars || !thRival || !selectedWar) {
            console.log('Por favor, complete todos los campos antes de guardar.');
            return;
        }

        let memberThLevel = getMemberThLevel(selectedMember);
        if (!memberThLevel) {
            console.log('No se pudo determinar el TH del miembro seleccionado.');
            return;
        }

        if (typeof memberThLevel === 'number') {
            memberThLevel = `TH${memberThLevel}`;
        } else if (!memberThLevel.startsWith('TH')) {
            memberThLevel = memberThLevel;
        }

        const warTimestamp = selectedWar.fileName.split('_')[2];

        setIsSaving(true);

        const attackData = {
            member: selectedMember,
            attack: selectedAttack,
            percentage: parseInt(percentage, 10),
            stars: parseInt(stars, 10),
            description: description || "",
            thRival,
            memberThLevel,
            clanTag: getClanTag(),
            warTimestamp: warTimestamp.replace('.json', ''),
        };

        try {
            await APIClashService.saveAttackLog(attackData);
            console.log('Ataque guardado exitosamente.');
            closeModal();
            // Fetch saved attacks after saving
            fetchSavedAttacks()
                .then((data) => {
                    // console.log('Ataques guardados obtenidos:', data);
                    setSavedAttacks(data);
                })
                .catch((error) => {
                    console.error('Error al obtener los ataques guardados:', error);
                })
                .finally(() => setLoadingSavedAttacks(false));
        } catch (error) {
            console.error('Error al guardar el ataque:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const getAttackSummary = () => {
        const filteredAttacks = savedAttacks.filter((attack) => {
            if (!startDate || !endDate) return true;

            const attackTime = new Date(attack.timestamp).getTime();
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime();

            return attackTime >= start && attackTime <= end;
        });

        const attackSummary: {
            [key: string]: {
                oneStar: number;
                twoStars: number;
                threeStars: number;
                averagePercentage: number;
                players: Set<string>;
                totalPoints: number;
                usageCount: number;
                usedAgainstHigherTH: number; // Count of uses against higher TH
                usedAgainstLowerTH: number; // Count of uses against lower TH
                usedAgainstEqualTH: number; // Count of uses against equal TH
            };
        } = {};

        filteredAttacks.forEach((attack) => {
            if (!attackSummary[attack.attack]) {
                attackSummary[attack.attack] = {
                    oneStar: 0,
                    twoStars: 0,
                    threeStars: 0,
                    averagePercentage: 0,
                    players: new Set(),
                    totalPoints: 0,
                    usageCount: 0,
                    usedAgainstHigherTH: 0,
                    usedAgainstLowerTH: 0,
                    usedAgainstEqualTH: 0,
                };
            }

            const summary = attackSummary[attack.attack];
            summary.players.add(attack.member);
            summary.usageCount++;
            const memberTH = parseInt(attack.memberThLevel.replace('TH', ''), 10);
            const rivalTH = parseInt(attack.thRival.replace('TH', ''), 10);

            if (memberTH > rivalTH) summary.usedAgainstLowerTH++;
            else if (memberTH < rivalTH) summary.usedAgainstHigherTH++;
            else summary.usedAgainstEqualTH++;

            if (attack.stars === 1) summary.oneStar++;
            if (attack.stars === 2) summary.twoStars++;
            if (attack.stars === 3) summary.threeStars++;

            summary.averagePercentage += attack.percentage;
            summary.totalPoints += calculatePoints(attack.stars, attack.memberThLevel, attack.thRival, filteredAttacks.length);
        });

        Object.keys(attackSummary).forEach((attack) => {
            const summary = attackSummary[attack];
            summary.averagePercentage = parseFloat(
                (summary.averagePercentage / (summary.oneStar + summary.twoStars + summary.threeStars)).toFixed(2)
            );
        });

        return attackSummary;
    };

    useEffect(() => {
        fetchSavedAttacks()
            .then((data) => setSavedAttacks(Array.isArray(data) ? data : [])) // Ensure savedAttacks is always an array
            .catch((error) => {
                console.error('Error al obtener los ataques guardados:', error);
                console.log('Hubo un error al obtener los ataques guardados.');
            })
            .finally(() => setLoadingSavedAttacks(false));
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 className="animate__animated animate__backInDown neonText" style={{ textAlign: 'center', marginBottom: '20px' }}>
                Registro de Ataques
            </h1>
            {(typeof window !== 'undefined' &&
                    (localStorage.getItem('username') === 'nandods' ||
                        (localStorage.getItem('username') === 'gaboadmin' && localStorage.getItem('clanTag') === '%232RG9R9JVP'))) && (

            <div className="button-container">
                  <button  onClick={openModal} className="green-hacker-button" data-text="Guardar Ataque">
                    Guardar Ataque
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
                    )}
<br />
<br />
           
            {/* Tab Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>

                <button
                    className={`tabButton ${activeTab === 'clanSummary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('clanSummary')}
                >
                    <span>Resumen del Clan</span>
                    <div className="top"></div>
                    <div className="left"></div>
                    <div className="bottom"></div>
                    <div className="right"></div>
                </button>
                <button
                    className={`tabButton ${activeTab === 'searchPlayers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('searchPlayers')}
                >
                    <span>Buscar Jugadores</span>
                    <div className="top"></div>
                    <div className="left"></div>
                    <div className="bottom"></div>
                    <div className="right"></div>
                </button>
            </div>
            {activeTab === 'searchPlayers' && (
                <div>
                    {/* <p className="animate__animated animate__backInLeft">
                        <Info size={16} style={{ marginRight: '5px' }} />
                        Esta ventana muestra los ataques más usados en el clan y su rendimiento. Verás una lista con los ataques, sus resultados y los jugadores que los usan. Usa la barra de búsqueda para ver los ataques de un jugador específico y el botón "Agregar" para guardar nuevos ataques.
                    </p>
                    <br /> */}
                    <p className="animate__animated animate__backInLeft">
                        <Info size={16} style={{ marginRight: '5px' }} />
                        Usa los filtros para buscar ataques específicos por jugador. Puedes filtrar por jugador, rango de fechas o ambos.
                        Esto te permitirá analizar el rendimiento de los ataques en diferentes contextos.
                    </p>
                    <br />
                    <p className="animate__animated animate__backInRight">
                        <Shield size={16} style={{ marginRight: '5px' }} />
                        El sistema de puntos <span style={{ color: 'violet' }}>asigna 1 punto por cada estrella</span> obtenida en un ataque. Si el atacante tiene un TH superior al del rival, <span style={{ color: 'red' }}>se resta 0.5 puntos</span> . Si el atacante tiene un TH inferior, se suman puntos adicionales: <span style={{ color: 'yellow' }}> 0.5 puntos si logra 3 estrellas o 0.25 puntos si logra menos de 3 estrellas. </span>Además, el puntaje final se ajusta <span style={{ color: 'yellow' }}>dividiéndolo por el número total de veces que el ataque ha sido usado</span>, promoviendo la diversidad y premiando los ataques más efectivos.
                    </p>
                </div>
            )}

            {activeTab === 'clanSummary' && (
                <div>
                    <p className="animate__animated animate__backInLeft">
                        <Info size={16} style={{ marginRight: '5px' }} />
                        Esta ventana muestra los ataques más usados en el clan y su rendimiento. Verás una lista con los ataques, sus resultados y los jugadores que los usan. Usa la barra de búsqueda para ver los ataques de un jugador específico y el botón "Agregar" para guardar nuevos ataques.
                    </p>
                    <br />
                    <br />
                    <p className="animate__animated animate__backInRight">
                        <Shield size={16} style={{ marginRight: '5px' }} />
                        El sistema de puntos <span style={{ color: 'violet' }}>asigna 1 punto por cada estrella</span> obtenida en un ataque. Si el atacante tiene un TH superior al del rival, <span style={{ color: 'red' }}>se resta 0.5 puntos</span> . Si el atacante tiene un TH inferior, se suman puntos adicionales: <span style={{ color: 'yellow' }}> 0.5 puntos si logra 3 estrellas o 0.25 puntos si logra menos de 3 estrellas. </span>Además, el puntaje final se ajusta <span style={{ color: 'yellow' }}>dividiéndolo por el número total de veces que el ataque ha sido usado</span>, promoviendo la diversidad y premiando los ataques más efectivos.
                    </p>
                </div>
            )}

            {/* Tab Content */}
            {activeTab === 'searchPlayers' && (
                <div>
                    {/* Player Search Content */}
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            className="input"
                            placeholder="Buscar jugador"
                            value={playerSearchTerm}
                            onChange={handlePlayerSearch}
                            style={{ marginBottom: '25px', width: '100%' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ width: '50%' }}>
                                <label htmlFor="start-date" style={{ display: 'block', marginBottom: '5px' }}>
                                    <Calendar size={16} style={{ marginRight: '5px' }} />
                                    Fecha de inicio
                                </label>
                                <input
                                    className='input'
                                    id="start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ width: '50%' }}>
                                <label htmlFor="end-date" style={{ display: 'block', marginBottom: '5px' }}>
                                    <Calendar size={16} style={{ marginRight: '5px' }} />
                                    Fecha de fin
                                </label>
                                <input
                                    id="end-date"
                                    className='input'
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>Filtros de Ataques</h3>
                            <label className="checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={selectAllFilters}
                                    onChange={(e) => setSelectAllFilters(e.target.checked)}
                                />
                                <span className="checkmark">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                                    </svg>
                                </span>
                                <span className="label">Seleccionar todos los filtros</span>
                            </label>
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
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
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
                                    checked={includeHigherTh}
                                    onChange={(e) => setIncludeHigherTh(e.target.checked)}
                                />
                                <span className="checkmark">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                                    </svg>
                                </span>
                                <span className="label">Ataques contra TH Superior</span>
                            </label>
                            <label className="checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={includeLowerTh}
                                    onChange={(e) => setIncludeLowerTh(e.target.checked)}
                                />
                                <span className="checkmark">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                                    </svg>
                                </span>
                                <span className="label">Ataques contra TH Inferior</span>
                            </label>
                            <label className="checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={includeEqualTh}
                                    onChange={(e) => setIncludeEqualTh(e.target.checked)}
                                />
                                <span className="checkmark">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.285 6.707l-11.285 11.285-5.285-5.285 1.414-1.414 3.871 3.871 9.871-9.871z" />
                                    </svg>
                                </span>
                                <span className="label">Ataques contra Mismo TH</span>
                            </label>
                        </div>
                        {/* Filtered Player Attacks */}
                        {(playerSearchTerm || startDate || endDate) && playerSearchTerm ? (
                            <div className="animate__animated animate__backInLeft" style={{ marginTop: '20px' }}>
                                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <User size={20} style={{ marginRight: '10px' }} />
                                    Ataques Filtrados
                                </h2>
                                {/* Player Summary */}
                                {filteredPlayerAttacks.length > 0 && (
                                    <div className='card' style={{ marginBottom: '20px', textAlign: 'center', color: '#fff' }}>
                                        <h3 style={{ color: 'violet' }}>Jugador: {filteredPlayerAttacks[0].member}</h3>
                                        <p style={{
                                                color: (() => {
                                                    const avgStars = filteredPlayerAttacks.reduce((sum, attack) => sum + attack.stars, 0) / filteredPlayerAttacks.length;
                                                    if (avgStars > 2.2) return 'green';
                                                    if (avgStars >= 2 && avgStars <= 2.2) return 'yellow';
                                                    return 'red';
                                                })()
                                            }}>
                                            <strong>Media de Estrellas:</strong>{' '}
                                            <span >
                                                {(
                                                    filteredPlayerAttacks.reduce((sum, attack) => sum + attack.stars, 0) /
                                                    filteredPlayerAttacks.length
                                                ).toFixed(2)}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Media de Porcentaje:</strong> {(
                                                filteredPlayerAttacks.reduce((sum, attack) => sum + attack.percentage, 0) /
                                                filteredPlayerAttacks.length
                                            ).toFixed(2)}%
                                        </p>
                                        <p>
                                            <strong>Ataques contra TH Superior:</strong> {
                                                filteredPlayerAttacks.filter((attack) => {
                                                    const memberTh = parseInt(attack.memberThLevel.replace('TH', ''), 10);
                                                    const rivalTh = parseInt(attack.thRival.replace('TH', ''), 10);
                                                    return memberTh < rivalTh;
                                                }).length
                                            }
                                        </p>
                                        <p>
                                            <strong>Ataques contra TH Inferior:</strong> {
                                                filteredPlayerAttacks.filter((attack) => {
                                                    const memberTh = parseInt(attack.memberThLevel.replace('TH', ''), 10);
                                                    const rivalTh = parseInt(attack.thRival.replace('TH', ''), 10);
                                                    return memberTh > rivalTh;
                                                }).length
                                            }
                                        </p>
                                        <p>
                                            <strong>Ataques contra Mismo TH:</strong> {
                                                filteredPlayerAttacks.filter((attack) => {
                                                    const memberTh = parseInt(attack.memberThLevel.replace('TH', ''), 10);
                                                    const rivalTh = parseInt(attack.thRival.replace('TH', ''), 10);
                                                    return memberTh === rivalTh;
                                                }).length
                                            }
                                        </p>
                                        <p>
                                            <strong>Ejércitos Favoritos:</strong>
                                            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0' }}>
                                                {Object.entries(
                                                    filteredPlayerAttacks.reduce((acc, attack) => {
                                                        acc[attack.attack] = (acc[attack.attack] || 0) + 1;
                                                        return acc;
                                                    }, {} as Record<string, number>)
                                                )
                                                    .sort(([, a], [, b]) => (b as number) - (a as number))
                                                    .slice(0, 3)
                                                    .map(([army, count], index) => (
                                                        <li key={index}>
                                                            <Target size={16} style={{ marginRight: '5px' }} />
                                                            {String(army)} ({Number(count)} usos)
                                                        </li>
                                                    ))}
                                            </ul>
                                        </p>
                                    </div>
                                )}
                                {/* Section: Ataques de 3 Estrellas */}
                                {includeThreeStars && filteredPlayerAttacks.some((attack) => attack.stars === 3) && (
                                    <div>
                                        <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>Ataques de 3 Estrellas</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                                            {filteredPlayerAttacks
                                                .filter((attack) => attack.stars === 3)
                                                .map((attack, index) => (
                                                    <div className="bgblue" key={index}>
                                                        <div
                                                            className="card"
                                                            style={{
                                                                border: '1px solid #ccc',
                                                                borderRadius: '10px',
                                                                padding: '15px',
                                                                backgroundColor: '#333',
                                                                color: '#fff',
                                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                                width: '300px',
                                                            }}
                                                        >
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
                                                                <li style={{ marginBottom: '5px' }}>
                                                                    <strong>
                                                                        <Calendar size={16} style={{ marginRight: '5px' }} />
                                                                        Fecha:
                                                                    </strong>{' '}
                                                                    {new Date(attack.timestamp).toLocaleString()}
                                                                </li>
                                                                <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                                                    <strong>
                                                                        <Shield size={16} style={{ marginRight: '5px' }} />
                                                                        TH Rival:
                                                                    </strong>{' '}
                                                                    {attack.thRival}
                                                                </li>
                                                                <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
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
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Section: Ataques de 2 Estrellas */}
                                {includeTwoStars && filteredPlayerAttacks.some((attack) => attack.stars === 2) && (
                                    <div>
                                        <h3 style={{ textAlign: 'center', color: 'yellow', marginBottom: '10px' }}>Ataques de 2 Estrellas</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                                            {filteredPlayerAttacks
                                                .filter((attack) => attack.stars === 2)
                                                .map((attack, index) => (
                                                    <div className="bgblue" key={index}>
                                                        <div
                                                            className="card"
                                                            style={{
                                                                border: '1px solid #ccc',
                                                                borderRadius: '10px',
                                                                padding: '15px',
                                                                backgroundColor: '#333',
                                                                color: '#fff',
                                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                                width: '300px',
                                                            }}
                                                        >
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
                                                                <li style={{ marginBottom: '5px' }}>
                                                                    <strong>
                                                                        <Calendar size={16} style={{ marginRight: '5px' }} />
                                                                        Fecha:
                                                                    </strong>{' '}
                                                                    {new Date(attack.timestamp).toLocaleString()}
                                                                </li>
                                                                <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                                                    <strong>
                                                                        <Shield size={16} style={{ marginRight: '5px' }} />
                                                                        TH Rival:
                                                                    </strong>{' '}
                                                                    {attack.thRival}
                                                                </li>
                                                                <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
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
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Section: Ataques de 1 Estrella */}
                                {includeOneStar && filteredPlayerAttacks.some((attack) => attack.stars === 1) && (
                                    <div>
                                        <h3 style={{ textAlign: 'center', color: 'red', marginBottom: '10px' }}>Ataques de 1 Estrella</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                                            {filteredPlayerAttacks
                                                .filter((attack) => attack.stars === 1)
                                                .map((attack, index) => (
                                                    <div className="bgblue" key={index}>
                                                        <div
                                                            className="card"
                                                            style={{
                                                                border: '1px solid #ccc',
                                                                borderRadius: '10px',
                                                                padding: '15px',
                                                                backgroundColor: '#333',
                                                                color: '#fff',
                                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                                width: '300px',
                                                            }}
                                                        >
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
                                                                <li style={{ marginBottom: '5px' }}>
                                                                    <strong>
                                                                        <Calendar size={16} style={{ marginRight: '5px' }} />
                                                                        Fecha:
                                                                    </strong>{' '}
                                                                    {new Date(attack.timestamp).toLocaleString()}
                                                                </li>
                                                                <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                                                    <strong>
                                                                        <Shield size={16} style={{ marginRight: '5px' }} />
                                                                        TH Rival:
                                                                    </strong>{' '}
                                                                    {attack.thRival}
                                                                </li>
                                                                <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
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
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Section: Ataques contra TH Superior */}
                                {includeHigherTh && filteredPlayerAttacks.some((attack) => {
                                    const memberTh = parseInt(attack.memberThLevel.replace('TH', ''), 10);
                                    const rivalTh = parseInt(attack.thRival.replace('TH', ''), 10);
                                    return memberTh < rivalTh;
                                }) && (
                                    <div>
                                        <h3 style={{ textAlign: 'center', color: 'blue', marginBottom: '10px' }}>Ataques contra TH Superior</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                                            {filteredPlayerAttacks
                                                .filter((attack) => {
                                                    const memberTh = parseInt(attack.memberThLevel.replace('TH', ''), 10);
                                                    const rivalTh = parseInt(attack.thRival.replace('TH', ''), 10);
                                                    return memberTh < rivalTh;
                                                })
                                                .map((attack, index) => (
                                                    <div className="bgblue" key={index}>
                                                        <div
                                                            className="card"
                                                            style={{
                                                                border: '1px solid #ccc',
                                                                borderRadius: '10px',
                                                                padding: '15px',
                                                                backgroundColor: '#333',
                                                                color: '#fff',
                                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                                width: '300px',
                                                            }}
                                                        >
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
                                                                <li style={{ marginBottom: '5px' }}>
                                                                    <strong>
                                                                        <Calendar size={16} style={{ marginRight: '5px' }} />
                                                                        Fecha:
                                                                    </strong>{' '}
                                                                    {new Date(attack.timestamp).toLocaleString()}
                                                                </li>
                                                                <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                                                    <strong>
                                                                        <Shield size={16} style={{ marginRight: '5px' }} />
                                                                        TH Rival:
                                                                    </strong>{' '}
                                                                    {attack.thRival}
                                                                </li>
                                                                <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
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
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Section: Ataques contra TH Inferior */}
                                {includeLowerTh && filteredPlayerAttacks.some((attack) => {
                                    const memberTh = parseInt(attack.memberThLevel.replace('TH', ''), 10);
                                    const rivalTh = parseInt(attack.thRival.replace('TH', ''), 10);
                                    return memberTh > rivalTh;
                                }) && (
                                    <div>
                                        <h3 style={{ textAlign: 'center', color: 'green', marginBottom: '10px' }}>Ataques contra TH Inferior</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                                            {filteredPlayerAttacks
                                                .filter((attack) => {
                                                    const memberTh = parseInt(attack.memberThLevel.replace('TH', ''), 10);
                                                    const rivalTh = parseInt(attack.thRival.replace('TH', ''), 10);
                                                    return memberTh > rivalTh;
                                                })
                                                .map((attack, index) => (
                                                    <div className="bgblue" key={index}>
                                                        <div
                                                            className="card"
                                                            style={{
                                                                border: '1px solid #ccc',
                                                                borderRadius: '10px',
                                                                padding: '15px',
                                                                backgroundColor: '#333',
                                                                color: '#fff',
                                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                                width: '300px',
                                                            }}
                                                        >
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
                                                                <li style={{ marginBottom: '5px' }}>
                                                                    <strong>
                                                                        <Calendar size={16} style={{ marginRight: '5px' }} />
                                                                        Fecha:
                                                                    </strong>{' '}
                                                                    {new Date(attack.timestamp).toLocaleString()}
                                                                </li>
                                                                <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                                                    <strong>
                                                                        <Shield size={16} style={{ marginRight: '5px' }} />
                                                                        TH Rival:
                                                                    </strong>{' '}
                                                                    {attack.thRival}
                                                                </li>
                                                                <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
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
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Section: Ataques contra Mismo TH */}
                                {includeEqualTh && filteredPlayerAttacks.some((attack) => {
                                    const memberTh = parseInt(attack.memberThLevel.replace('TH', ''), 10);
                                    const rivalTh = parseInt(attack.thRival.replace('TH', ''), 10);
                                    return memberTh === rivalTh;
                                }) && (
                                    <div>
                                        <h3 style={{ textAlign: 'center', color: 'orange', marginBottom: '10px' }}>Ataques contra Mismo TH</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                                            {filteredPlayerAttacks
                                                .filter((attack) => {
                                                    const memberTh = parseInt(attack.memberThLevel.replace('TH', ''), 10);
                                                    const rivalTh = parseInt(attack.thRival.replace('TH', ''), 10);
                                                    return memberTh === rivalTh;
                                                })
                                                .map((attack, index) => (
                                                    <div className="bgblue" key={index}>
                                                        <div
                                                            className="card"
                                                            style={{
                                                                border: '1px solid #ccc',
                                                                borderRadius: '10px',
                                                                padding: '15px',
                                                                backgroundColor: '#333',
                                                                color: '#fff',
                                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                                width: '300px',
                                                            }}
                                                        >
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
                                                                <li style={{ marginBottom: '5px' }}>
                                                                    <strong>
                                                                        <Calendar size={16} style={{ marginRight: '5px' }} />
                                                                        Fecha:
                                                                    </strong>{' '}
                                                                    {new Date(attack.timestamp).toLocaleString()}
                                                                </li>
                                                                <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                                                    <strong>
                                                                        <Shield size={16} style={{ marginRight: '5px' }} />
                                                                        TH Rival:
                                                                    </strong>{' '}
                                                                    {attack.thRival}
                                                                </li>
                                                                <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
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
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {activeTab === 'clanSummary' && (
                <div>
                    {/* Clan Summary Content */}
                    <div style={{ marginBottom: '20px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Resumen del clan</h2>
                        
                        {/* New Date Range Filter */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ width: '50%' }}>
                                <label htmlFor="start-date-summary" style={{ display: 'block', marginBottom: '5px' }}>
                                    <Calendar size={16} style={{ marginRight: '5px' }} />
                                    Fecha de inicio
                                </label>
                                <input
                                    className='input'
                                    id="start-date-summary"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ width: '50%' }}>
                                <label htmlFor="end-date-summary" style={{ display: 'block', marginBottom: '5px' }}>
                                    <Calendar size={16} style={{ marginRight: '5px' }} />
                                    Fecha de fin
                                </label>
                                <input
                                    id="end-date-summary"
                                    className='input'
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                        {/* End of New Date Range Filter */}
                        
                        {!loadingSavedAttacks && savedAttacks && savedAttacks.length > 0 && (
                            <div className="animate__animated animate__backInLeft" style={{ marginBottom: '20px', textAlign: 'center', color: '#fff' }}>
                                {(() => {
                                    const attackSummary = getAttackSummary();
                                    const sortedAttacks = Object.entries(attackSummary).sort(([, a], [, b]) => b.totalPoints - a.totalPoints);
                                    const bestAttack = sortedAttacks[0];
                                    const worstAttack = sortedAttacks[sortedAttacks.length - 1];
                                    const intermediateAttacks = sortedAttacks.slice(1, sortedAttacks.length - 1).slice(0, 2); // Top 1 or 2 intermediate attacks

                                    return (
                                        <div>
                                            <p style={{ color: 'violet' }}>
                                                <strong>Mejor ataque:</strong> {bestAttack[0]} con un total de {bestAttack[1].totalPoints.toFixed(2)} puntos,
                                                usado {bestAttack[1].usageCount} veces y con una media de {bestAttack[1].averagePercentage}% de porcentaje.
                                            </p>
                                            <br />
                                            {intermediateAttacks.length > 0 && (
                                                <div style={{ color: 'yellow' }}>
                                                    <strong>Ataques destacados intermedios:</strong>
                                                    {intermediateAttacks.map(([attackName, summary], index) => (
                                                        <p key={index}>
                                                            {attackName} - {summary.totalPoints.toFixed(2)} puntos, usado {summary.usageCount} veces,
                                                            media de {summary.averagePercentage}% de porcentaje.
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                            <br />
                                            <p style={{ color: 'red' }}>
                                                <strong>Peor ataque:</strong> {worstAttack[0]} con un total de {worstAttack[1].totalPoints.toFixed(2)} puntos,
                                                usado {worstAttack[1].usageCount} veces y con una media de {worstAttack[1].averagePercentage}% de porcentaje.
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                        {loadingSavedAttacks ? (
                            <Loading>Obteniendo ataques guardados...</Loading>
                        ) : savedAttacks.length > 0 ? (
                            <div className="animate__animated animate__backInRight" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                                {Object.entries(getAttackSummary())
                                    .sort(([, a], [, b]) => b.totalPoints - a.totalPoints) // Sort attacks by total points descending
                                    .map(([attackName, summary], index) => (
                                        <div className="bgblue">
                                            <div
                                                className="card"
                                                key={index}
                                                style={{
                                                    border: `2px solid ${getAttackCardBorderColor(
                                                        Object.entries(getAttackSummary())
                                                            .sort(([, a], [, b]) => b.totalPoints - a.totalPoints) // Ensure consistent sorting
                                                            .map(([, s]) => s.totalPoints),
                                                        index
                                                    )}`,
                                                    borderRadius: '10px',
                                                    padding: '15px',
                                                    backgroundColor: '#333', // Dark background for better contrast
                                                    color: '#fff', // White text for readability
                                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                    width: '300px',
                                                }}
                                            >
                                                <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '20px' }}>{attackName}</h3>
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    <li style={{ marginBottom: '5px' }}>
                                                        <strong>
                                                            <Star size={16} style={{ marginRight: '5px' }} />
                                                            1 Estrella:
                                                        </strong> {summary.oneStar}
                                                    </li>
                                                    <li style={{ marginBottom: '5px' }}>
                                                        <strong>
                                                            <Star size={16} style={{ marginRight: '5px' }} />
                                                            <Star size={16} style={{ marginRight: '5px' }} />

                                                            2 Estrellas:
                                                        </strong> {summary.twoStars}
                                                    </li>
                                                    <li style={{ marginBottom: '5px' }}>
                                                        <strong>
                                                            <Star size={16} style={{ marginRight: '5px' }} />
                                                            <Star size={16} style={{ marginRight: '5px' }} />
                                                            <Star size={16} style={{ marginRight: '5px' }} />

                                                            3 Estrellas:
                                                        </strong> {summary.threeStars}
                                                    </li>
                                                    <li style={{ marginBottom: '5px' }}>
                                                        <strong>
                                                            <Percent size={16} style={{ marginRight: '5px' }} />
                                                            Media de %:
                                                        </strong> {summary.averagePercentage}%
                                                    </li>
                                                    <li style={{ marginBottom: '5px' }}>
                                                        <strong>
                                                            <Shield size={16} style={{ marginRight: '5px' }} />
                                                            Puntos Totales:
                                                        </strong> {summary.totalPoints.toFixed(2)}
                                                    </li>
                                                    <li style={{ marginBottom: '5px' }}>
                                                        <strong>
                                                            <Target size={16} style={{ marginRight: '5px' }} />
                                                            Veces Usado:
                                                        </strong> {summary.usageCount}
                                                    </li>
                                                    <li style={{ marginBottom: '5px' }}>
                                                        <strong>
                                                            <Shield size={16} style={{ marginRight: '5px' }} />
                                                            Usado contra TH Superior:
                                                        </strong> {summary.usedAgainstHigherTH}
                                                    </li>
                                                    <li style={{ marginBottom: '5px' }}>
                                                        <strong>
                                                            <Shield size={16} style={{ marginRight: '5px' }} />
                                                            Usado contra TH Inferior:
                                                        </strong> {summary.usedAgainstLowerTH}
                                                    </li>
                                                    <li style={{ marginBottom: '5px' }}>
                                                        <strong>
                                                            <Shield size={16} style={{ marginRight: '5px' }} />
                                                            Usado contra TH Igual:
                                                        </strong> {summary.usedAgainstEqualTH}
                                                    </li>
                                                    <li style={{ marginBottom: '5px' }}>
                                                        <strong>
                                                            <User size={16} style={{ marginRight: '5px' }} />
                                                            Jugadores:
                                                        </strong>
                                                        <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                                                            {Array.from(summary.players).map((player, index) => (
                                                                <li key={index} style={{ marginBottom: '5px' }}>
                                                                    <User size={12} style={{ marginRight: '5px' }} />

                                                                    {player}</li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#666' }}>No se encontraron ataques guardados.</p>
                        )}
                    </div>
                </div>
            )}
            <Modal closeButton open={isModalOpen} onClose={closeModal}>
                <Modal.Header>
                    <Text h3>Agregar Nuevo Ataque</Text>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <Loading>Obteniendo jugadores...</Loading>
                    ) : (
                        <div>
                            <input
                                className='input'
                                placeholder="Buscar miembro"
                                value={searchTerm}
                                onChange={handleSearch}
                                style={{ marginBottom: '20px', width: '100%' }}
                            />
                            <select
                                id="member-select"
                                value={selectedMember}
                                className='input'

                                onChange={(e) => setSelectedMember(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    marginBottom: '20px',
                                }}
                            >
                                <option value="" disabled>
                                    Seleccione un miembro
                                </option>
                                {filteredMembers.map((name, index) => (
                                    <option key={index} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>

                            <input
                                className='input'
                                placeholder="Buscar ataque"
                                value={attackSearchTerm}
                                onChange={handleAttackSearch}
                                style={{ marginBottom: '20px', width: '100%' }}
                            />
                            <select
                                id="attack-select"
                                value={selectedAttack}
                                className='input'

                                onChange={(e) => setSelectedAttack(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    marginBottom: '20px',
                                }}
                            >
                                <option value="" disabled>
                                    Seleccione un ataque
                                </option>
                                {filteredAttacks.map((attack, index) => (
                                    <option key={index} value={attack}>
                                        {attack}
                                    </option>
                                ))}
                            </select>

                            <input
                                className='input'
                                type="number"
                                placeholder="Porcentaje realizado (%)"
                                value={percentage}
                                onChange={(e) => setPercentage(e.target.value)}
                                style={{ marginBottom: '20px', width: '100%' }}
                            />

                            <select
                                id="stars-select"
                                className='input'

                                value={stars}
                                onChange={(e) => handleStarsChange(e.target.value)} // Use the new handler
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    marginBottom: '20px',
                                }}
                            >
                                <option value="" disabled>
                                    Seleccione estrellas
                                </option>
                                <option value="1">1 Estrella</option>
                                <option value="2">2 Estrellas</option>
                                <option value="3">3 Estrellas</option>
                            </select>

                            <select
                                id="th-rival-select"
                                value={thRival}
                                className='input'

                                onChange={(e) => setThRival(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    marginBottom: '20px',
                                }}
                            >
                                <option value="" disabled>
                                    Seleccione TH Rival
                                </option>
                                <option value="TH13">TH13</option>
                                <option value="TH14">TH14</option>
                                <option value="TH15">TH15</option>
                                <option value="TH16">TH16</option>
                                <option value="TH17">TH17</option>
                            </select>

                            <textarea
                                className='input'
                                placeholder="Descripción del ataque"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    marginBottom: '20px',
                                    resize: 'none',
                                    height: '100px',
                                }}
                            />

                            <h4 style={{ marginTop: '20px' }}>Registros de Guerras</h4>
                            {loadingWarSaves ? (
                                <Loading>Obteniendo registros de guerras...</Loading>
                            ) : (
                                <div>
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
                                        {warSaves.map((war, index) => (
                                            <option key={index} value={war.fileName}>
                                                {formatWarDate(war.fileName)}
                                            </option>
                                        ))}
                                           {warLeageSaves.map((war, index) => (
                                            <option key={index} value={war.fileName}>
                                                {formatWarDate(war.fileName)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button auto flat color="error" onClick={closeModal}>
                        Cerrar
                    </Button>
                    <Button
                        auto
                        color="success"
                        onClick={handleSave}
                        disabled={isSaving || !selectedMember || !selectedAttack || !percentage || !stars || !thRival || !selectedWar} // Disable button conditionally
                    >
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AttackLog;