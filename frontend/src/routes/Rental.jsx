import { useState } from "react";
import ImportExcel from '../components/feature/ImportExcel';
import ListForOwner from '../components/feature/ListForOwner';

const Rental = () => {
    // Define the shared state
    const [updateData, setUpdateData] = useState(null);

    // Function to update the shared state
    const handleDataUpdate = (bool) => {
        setUpdateData(bool);
    };

    return (
        <main className='flexCol gap-y-20'>
            Room Rental

            <ImportExcel onDataUpdate={handleDataUpdate} />
            <ListForOwner updateData={updateData} />
        </main>
    );
};

export default Rental;
