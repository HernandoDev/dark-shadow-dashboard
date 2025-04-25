import React, { useState, useEffect } from 'react';
import { Button, Modal, Text, Loading, Input, FormElement } from '@nextui-org/react';
import { Plus } from 'react-feather';
import { APIClashService } from '../services/apiClashService';
import { fetchSavedAttacks } from '../utils/fetchSavedAttacks'; // Adjust the path as needed

const AttackLog: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clanMembers, setClanMembers] = useState<string[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [members, setMembers] = useState<any[]>([]); // Store members for later use

    const [attacks, setAttacks] = useState<string[]>([
        'Spam Dragones + 11 invisibilidades',
        'Druidas y Valquirias',
        'Hydra Blimp',
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

    const [isSaving, setIsSaving] = useState(false); // New state to track saving status

    const openModal = async () => {
        setIsModalOpen(true);
        setLoading(true);
        try {
            const response = await APIClashService.getClanMembers('%232QL0GCQGQ'); // Clan Principal
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
        const filteredAttacks = savedAttacks.filter((attack) =>
            attack.member.toLowerCase().includes(value)
        );
        setFilteredPlayerAttacks(filteredAttacks);
    };

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

    const getAttackCardBorderColor = (rank: number, total: number): string => {
        if (rank <= 3) return 'green'; // Top 3 attacks
        if (rank === 4) return 'yellow'; // 4th best attack
        if (rank > total - 3) return 'red'; // Bottom 3 attacks
        return '#ccc'; // Default border color
    };

    const calculatePoints = (stars: number, memberThLevel: string, thRival: string): number => {
        const memberLevel = parseInt(memberThLevel.replace('TH', ''), 10);
        const rivalLevel = parseInt(thRival.replace('TH', ''), 10);
        let points = stars;

        if (memberLevel > rivalLevel) {
            points -= 0.5; // Subtract 0.5 points if attacking a lower TH
        } else if (memberLevel < rivalLevel) {
            points += stars === 3 ? 0.5 : 0.25; // Add 0.5 for 3 stars, 0.25 otherwise
        }

        return points;
    };

    const handleSave = async () => {
        if (!selectedMember || !selectedAttack || !percentage || !stars || !thRival) {
            console.log('Por favor, complete todos los campos antes de guardar.');
            return;
        }
        debugger
        const memberThLevel = getMemberThLevel(selectedMember);
        if (!memberThLevel) {
            console.log('No se pudo determinar el TH del miembro seleccionado.');
            return;
        }

        setIsSaving(true); // Disable the button during save
        const attackData = {
            member: selectedMember,
            attack: selectedAttack,
            percentage: parseInt(percentage, 10),
            stars: parseInt(stars, 10),
            thRival,
            description,
            memberThLevel, // Include the member's TH level
        };

        try {
            await APIClashService.saveAttackLog(attackData);
            console.log('Ataque guardado exitosamente.');
            closeModal();
            fetchSavedAttacks().then(setSavedAttacks).catch((error) => {
                console.error('Error al obtener los ataques guardados:', error);
                console.log('Hubo un error al obtener los ataques guardados.');
            }).finally(() => setLoadingSavedAttacks(false));
        } catch (error) {
            console.error('Error al guardar el ataque:', error);
            console.log('Hubo un error al guardar el ataque.');
        } finally {
            setIsSaving(false); // Re-enable the button after save
        }
    };

    const getAttackSummary = () => {
        const attackSummary: {
            [key: string]: {
                oneStar: number;
                twoStars: number;
                threeStars: number;
                averagePercentage: number;
                players: Set<string>;
                totalPoints: number; // New field for total points
            };
        } = {};

        savedAttacks.forEach((attack) => {
            if (!attackSummary[attack.attack]) {
                attackSummary[attack.attack] = {
                    oneStar: 0,
                    twoStars: 0,
                    threeStars: 0,
                    averagePercentage: 0,
                    players: new Set(),
                    totalPoints: 0, // Initialize total points
                };
            }

            const summary = attackSummary[attack.attack];
            summary.players.add(attack.member);

            if (attack.stars === 1) summary.oneStar++;
            if (attack.stars === 2) summary.twoStars++;
            if (attack.stars === 3) summary.threeStars++;

            summary.averagePercentage += attack.percentage;
            summary.totalPoints += calculatePoints(attack.stars, attack.memberThLevel, attack.thRival); // Add points
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
        fetchSavedAttacks().then(setSavedAttacks).catch((error) => {
            console.error('Error al obtener los ataques guardados:', error);
            console.log('Hubo un error al obtener los ataques guardados.');
        }).finally(() => setLoadingSavedAttacks(false));
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Registro de Ataques</h1>
            <p>Esta ventana muestra los ataques más usados en el clan y su rendimiento. Verás una lista con los ataques, sus resultados y los jugadores que los usan. Usa la barra de búsqueda para ver los ataques de un jugador específico y el botón "Agregar" para guardar nuevos ataques.</p>
<br />
            <p>El sistema de puntos asigna 1 punto por cada estrella obtenida en un ataque, y ajusta el puntaje según la diferencia de niveles de Ayuntamiento (TH): se resta 0.5 puntos si el atacante tiene un TH superior al del rival, y se suman 0.5 o 0.25 puntos extra si el atacante tiene un TH inferior, según logre 3 estrellas o menos. Así, se premian los ataques más desafiantes y se penalizan los más fáciles.            </p>

            <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '20px' }}>
                <Button auto color="success" icon={<Plus />} onClick={openModal}>
                    Agregar Ataque
                </Button>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <Input
                    clearable
                    bordered
                    placeholder="Buscar jugador"
                    value={playerSearchTerm}
                    onChange={handlePlayerSearch}
                    css={{ marginBottom: '10px', width: '100%' }}
                />
                {playerSearchTerm && (
                    <div style={{ marginTop: '20px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Ataques de {playerSearchTerm}</h2>
                        {filteredPlayerAttacks.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                                {filteredPlayerAttacks.map((attack, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            border: '1px solid #ccc',
                                            borderRadius: '10px',
                                            padding: '15px',
                                            backgroundColor: '#333', // Dark background for better contrast
                                            color: '#fff', // White text for readability
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            width: '300px',
                                        }}
                                    >
                                        <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>{attack.member}</h3>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            <li style={{ marginBottom: '5px' }}>
                                                <strong>Ataque:</strong> {attack.attack}
                                            </li>
                                            <li style={{ marginBottom: '5px' }}>
                                                <strong>Porcentaje:</strong> {attack.percentage}%
                                            </li>
                                            <li style={{ marginBottom: '5px' }}>
                                                <strong>Estrellas:</strong> {attack.stars}
                                            </li>
                                            <li style={{ marginBottom: '5px' }}>
                                                <strong>Fecha:</strong> {new Date(attack.timestamp).toLocaleString()}
                                            </li>
                                            <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                                <strong>TH Rival:</strong> {attack.thRival}
                                            </li>
                                            <li style={{ marginBottom: '5px', color: getThColor(attack.memberThLevel, attack.thRival) }}>
                                                <strong>TH Miembro:</strong> {attack.memberThLevel}
                                            </li>
                                            <li style={{ marginBottom: '5px' }}>
                                                <strong>Puntaje:</strong> {calculatePoints(attack.stars, attack.memberThLevel, attack.thRival).toFixed(2)}
                                            </li>
                                            {attack.description && (
                                                <li style={{ marginBottom: '5px' }}>
                                                    <strong>Descripción:</strong> {attack.description}
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#666' }}>No se encontraron ataques para este jugador.</p>
                        )}
                    </div>
                )}
            </div>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Resumen del clan</h2>


                {loadingSavedAttacks ? (
                    <Loading>Obteniendo ataques guardados...</Loading>
                ) : savedAttacks.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                        {Object.entries(getAttackSummary())
                            .sort(([, a], [, b]) => b.totalPoints - a.totalPoints) // Sort by total points descending
                            .map(([attackName, summary], index, sortedArray) => (
                                <div
                                    key={index}
                                    style={{
                                        border: `2px solid ${getAttackCardBorderColor(index + 1, sortedArray.length)}`,
                                        borderRadius: '10px',
                                        padding: '15px',
                                        backgroundColor: '#333', // Dark background for better contrast
                                        color: '#fff', // White text for readability
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        width: '300px',
                                    }}
                                >
                                    <h3 style={{ textAlign: 'center', color: 'violet', marginBottom: '10px' }}>{attackName}</h3>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        <li style={{ marginBottom: '5px' }}>
                                            <strong>1 Estrella:</strong> {summary.oneStar}
                                        </li>
                                        <li style={{ marginBottom: '5px' }}>
                                            <strong>2 Estrellas:</strong> {summary.twoStars}
                                        </li>
                                        <li style={{ marginBottom: '5px' }}>
                                            <strong>3 Estrellas:</strong> {summary.threeStars}
                                        </li>
                                        <li style={{ marginBottom: '5px' }}>
                                            <strong>Media de %:</strong> {summary.averagePercentage}%
                                        </li>
                                        <li style={{ marginBottom: '5px' }}>
                                            <strong>Puntos Totales:</strong> {summary.totalPoints.toFixed(2)}
                                        </li>
                                        <li style={{ marginBottom: '5px' }}>
                                            <strong>Jugadores:</strong> {Array.from(summary.players).join(', ')}
                                        </li>
                                    </ul>
                                </div>
                            ))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#666' }}>No se encontraron ataques guardados.</p>
                )}
            </div>

            <Modal closeButton open={isModalOpen} onClose={closeModal}>
                <Modal.Header>
                    <Text h3>Agregar Nuevo Ataque</Text>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <Loading>Obteniendo jugadores...</Loading>
                    ) : (
                        <div>
                            <Input
                                clearable
                                bordered
                                placeholder="Buscar miembro"
                                value={searchTerm}
                                onChange={handleSearch}
                                css={{ marginBottom: '10px', width: '100%' }}
                            />
                            <select
                                id="member-select"
                                value={selectedMember}
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

                            <Input
                                clearable
                                bordered
                                placeholder="Buscar ataque"
                                value={attackSearchTerm}
                                onChange={handleAttackSearch}
                                css={{ marginBottom: '10px', width: '100%' }}
                            />
                            <select
                                id="attack-select"
                                value={selectedAttack}
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

                            <Input
                                bordered
                                type="number"
                                placeholder="Porcentaje realizado (%)"
                                value={percentage}
                                onChange={(e) => setPercentage(e.target.value)}
                                css={{ marginBottom: '10px', width: '100%' }}
                            />

                            <select
                                id="stars-select"
                                value={stars}
                                onChange={(e) => handleStarsChange(e.target.value)} // Use the new handler
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    marginBottom: '10px',
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
                                onChange={(e) => setThRival(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    marginBottom: '10px',
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
                                placeholder="Descripción del ataque"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    marginBottom: '10px',
                                    resize: 'none',
                                    height: '100px',
                                }}
                            />
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
                        disabled={isSaving || !selectedMember || !selectedAttack || !percentage || !stars || !thRival} // Disable button conditionally
                    >
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AttackLog;