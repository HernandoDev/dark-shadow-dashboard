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

    const [savedAttacks, setSavedAttacks] = useState<any[]>([]);
    const [loadingSavedAttacks, setLoadingSavedAttacks] = useState(false);

    const [playerSearchTerm, setPlayerSearchTerm] = useState('');
    const [filteredPlayerAttacks, setFilteredPlayerAttacks] = useState<any[]>([]);

    const openModal = async () => {
        setIsModalOpen(true);
        setLoading(true);
        try {
            const members = await APIClashService.getClanMembers('%232QL0GCQGQ'); // Clan Principal
            const memberNames = members.items.map((member: { name: string }) => member.name);
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

    const handleSave = async () => {
        if (!selectedMember || !selectedAttack || !percentage || !stars) {
            console.log('Por favor, complete todos los campos antes de guardar.');
            return;
        }

        const attackData = {
            member: selectedMember,
            attack: selectedAttack,
            percentage: parseInt(percentage, 10),
            stars: parseInt(stars, 10),
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
                };
            }

            const summary = attackSummary[attack.attack];
            summary.players.add(attack.member);

            if (attack.stars === 1) summary.oneStar++;
            if (attack.stars === 2) summary.twoStars++;
            if (attack.stars === 3) summary.threeStars++;

            summary.averagePercentage += attack.percentage;
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
                        {Object.entries(getAttackSummary()).map(([attackName, summary], index) => (
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
                                onChange={(e) => setStars(e.target.value)}
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
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button auto flat color="error" onClick={closeModal}>
                        Cerrar
                    </Button>
                    <Button auto color="success" onClick={handleSave}>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AttackLog;