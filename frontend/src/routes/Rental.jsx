// src/components/User.jsx
import {useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import ImportExcel from '../components/feature/ImportExcel';

const Rental = () => {

    return (
        <main>
            Room Rental

            <ImportExcel/>

        </main>
    );
};

export default Rental;
