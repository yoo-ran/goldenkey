import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation to the login page
import axios from 'axios';

import ImportExcel from '../components/excelImport/ImportExcel';
import ListForOwner from '../components/excelImport/ListForOwner';

const ImportExcelPage = () => {
  // Define the shared state
  const [updateData, setUpdateData] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
  const navigate = useNavigate(); // Hook for navigation

  // Function to update the shared state
  const handleDataUpdate = (onDataUpdate) => {
    setUpdateData(onDataUpdate);
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Make a request to the server to verify the user's token (stored in HTTP-only cookie)
        const response = await axios.get('http://localhost:8000/check-auth', {
          withCredentials: true,
        });
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          navigate('/login'); // Redirect to login if authentication fails
        }
      } catch (error) {
        console.error('User is not authenticated:', error);
        navigate('/login'); // Redirect to login if authentication fails
      }
    };

    checkAuthentication();
  }, [navigate]); // Dependency on `navigate`

  if (!isAuthenticated) {
    return <div>Loading...</div>; // Optionally show a loading indicator while checking authentication
  }

  return (
    <main className='flexCol gap-y-20'>
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
