import { useState, useEffect } from 'react';

import ImportExcel from '../components/excelImport/ImportExcel';
import ListForOwner from '../components/excelImport/ListForOwner';

const ImportExcelPage = () => {

  // Define the shared state
  const [updateData, setUpdateData] = useState(false);

  // Function to update the shared state
  const handleDataUpdate = (onDataUpdate) => {
    setUpdateData(onDataUpdate);
  };





  return (
    <main className='flexCol gap-y-20 my-10'>
      <section>
        <p className='mobile_1_bold mb-4'>엑셀 데이터</p>
        <ImportExcel onDataUpdate={handleDataUpdate} />
      </section>

      <section className='w-full'>
        <p className='mobile_1_bold mb-4'>데이터베이스 데이터</p>
        <ListForOwner updateData={!updateData} />
      </section>
    </main>
  );
};

export default ImportExcelPage;
