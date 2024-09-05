// src/components/User.jsx
import {useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import ImportExcel from '../components/feature/ImportExcel';
import ListForOwner from '../components/feature/ListForOwner';

const Rental = () => {

    return (
        <main className='flexCol gap-y-20'>
            Room Rental

            <ImportExcel/>
            <ListForOwner/>

        </main>
    );
};

export default Rental;
