import React from 'react';
import { CardTransactions } from '../components/home/card-transactions';

const DonacionesCapital = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Donaciones</h1>
            <p>Un buen donador es un miembro que ha realizado al menos 1000 donaciones y cuya diferencia entre donaciones realizadas y recibidas es mayor o igual a 0.
            Un mal donador es un miembro que ha realizado menos de 1000 donaciones o cuya diferencia entre donaciones realizadas y recibidas es menor a 0.</p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <CardTransactions filterType="bad" />
                <CardTransactions filterType="good" />
            </div>
        </div>
    );
};

export default DonacionesCapital;
