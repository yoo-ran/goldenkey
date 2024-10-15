import React, { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import * as XLSX from 'xlsx';
import axios from 'axios';

import AlertComponent from './AlertComponent';



const ImportExcel = ({onDataUpdate}) =>{
  const gridRef = useRef();
  const [rowData, setRowData] = useState([]);
  const [dbRowData, setDbRowData] = useState([])
  const [dbProperties, setDbProperties] = useState([]);

  const [alertVisible, setAlertVisible] = useState(false);
  const [pendingResolve, setPendingResolve] = useState(null);
  const [alertData, setAlertData] = useState({ columnName: '', dbValue: '', excelValue: '' });

  const [searchParams, setSearchParams] = useState({
    시군구: '',
    읍면: '',
    리명: '',
    지번본번: '',
    지번부번: ''
  });


  const [columnDefs, setColumnDefs] = useState([
    { field: "순번", headerName: "순번", minWidth: 90 },
    { field: "매물 아이디", headerName: "매물 아이디", minWidth: 90 },
    { field: "등록일자", headerName: "등록일자" },
    { field: "사용승인일자", headerName: "사용승인일자" },
    { field: "부동산구분", headerName: "부동산 구분", minWidth: 150 },
    { field: "거래방식", headerName: "거래 방식" },
    { field: "거래완료여부", headerName: "거래 완료 여부", minWidth: 130 },
    { field: "거래완료일자", headerName: "거래 완료 일자", minWidth: 100 },
    { field: "담당자", headerName: "담당자" },
    {
      headerName: "구주소",
      children: [
        { field: "시군구", headerName: "시군구" },
        { field: "읍면동", headerName: "읍 / 면 / 동" },
        { field: "리명", headerName: "리명" },
        { field: "지번본번", headerName: "지번본번" },
        { field: "지번부번", headerName: "지번부번" }
      ],
    },
    {
      headerName: "신 주소",
      children: [
        { field: "시군구", headerName: "시군구" },
        { field: "읍면", headerName: "읍면" },
        { field: "도로명", headerName: "도로명" }
      ],
    },
    { field: "상세주소", headerName: "상세주소" },
    { field: "건물명", headerName: "건물명" },
    { field: "동", headerName: "동" },
    { field: "호수", headerName: "호수" },
    {
      headerName: "금액",
      children: [
        { field: "보증금", headerName: "보증금" },
        { field: "월세", headerName: "월세" },
        { field: "관리비", headerName: "관리비" },
      ],
    },
    {
      headerName: "면적(m2)",
      children: [
        { field: "전체m2", headerName: "전체" },
        { field: "전용m2", headerName: "전용" },
      ],
    },
    {
      headerName: "면적(평)",
      children: [
        { field: "전체평", headerName: "전체" },
        { field: "전용평", headerName: "전용" },
      ],
    },
    { field: "EV유무", headerName: "E/V 유무" },
    { field: "화장실개수", headerName: "화장실 개수" },
    { field: "층수", headerName: "층 수" },
    { field: "주차가능대수", headerName: "주차 가능 대수" },
    { field: "비밀번호", headerName: "비밀번호" },
    {
      headerName: "매도인(임대인) 정보",
      children: [
        { field: "이름", headerName: "이름" },
        { field: "휴대폰번호", headerName: "휴대폰 번호" },
      ],
    },
    {
      headerName: "매수인(임차인) 정보",
      children: [
        { field: "이름", headerName: "이름" },
        { field: "휴대폰번호", headerName: "휴대폰 번호" },
      ],
    },
    {
      headerName: "부동산 정보",
      children: [
        { field: "이름", headerName: "이름" },
        { field: "휴대폰번호", headerName: "휴대폰 번호" },
      ],
    },
    { field: "메모", headerName: "메모" }
]);

  
  

  const defaultColDef = {
    minWidth: 80,
    flex: 1,
  };

  // Function to convert the data to a workbook
  const convertDataToWorkbook = (dataRows) => {
    const data = new Uint8Array(dataRows);
    const arr = [];

    for (let i = 0; i !== data.length; ++i) {
      arr[i] = String.fromCharCode(data[i]);
    }

    const bstr = arr.join('');
    return XLSX.read(bstr, { type: 'binary' });
  };

      // Helper function to convert Excel serial date to JavaScript Date object
  const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400; // 86400 seconds in a day
    const date_info = new Date(utc_value * 1000);

    // Set time to 00:00:00 UTC
    const fractional_day = serial - Math.floor(serial) + 0.00001;
    let total_seconds = Math.floor(86400 * fractional_day);

    let seconds = total_seconds % 60;
    total_seconds -= seconds;

    let hours = Math.floor(total_seconds / (60 * 60));
    let minutes = Math.floor(total_seconds / 60) % 60;

    date_info.setHours(hours, minutes, seconds);

    return date_info.toISOString().split('T')[0]; // returns 'YYYY-MM-DD' format
  };



  // Function to populate the grid with data from the workbook
  const populateGrid = async (workbook, dbProperties) => {
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const columns = {
        A: '순번',
        B: '매물ID',
        C: '등록일자',
        D: '사용승인일자',
        E: '부동산구분',
        F: '거래방식',
        G: '거래완료여부',
        H: '거래완료일자',
        I: '담당자',
        J: '시군구',
        K: '읍면동',
        L: '리명',
        M: '지번본번',
        N: '지번부번',
        O: '시군구',
        P: '읍면',
        Q: '도로명',
        R: '상세주소',
        S: '건물명',
        T: '동',
        U: '호수',
        V: '보증금',
        W: '월세',
        X: '관리비',
        Y: '전체m2',
        Z: '전용m2',
        AA: '전체평',
        AB: '전용평',
        AC: 'EV유무',
        AD: '화장실개수',
        AE: '층수',
        AF: '주차가능대수',
        AG: '비밀번호',
        AH: '이름',
        AI: '휴대폰번호',
        AJ: '이름',
        AK: '휴대폰번호',
        AL: '이름',
        AM: '휴대폰번호',
        AN: '메모',
    };

    const excludedColumns = ['시군구', '읍면동', '리명', '지번본번', '지번부번', '시군구', '읍면', '도로명'];
    const rowData = [];
    const dbRowData = [];
    let rowIndex = 4;

    while (worksheet['A' + rowIndex]) {
        const row = {};
        const dbRow = {};
        const propertyId = worksheet['B' + rowIndex].v; 
        console.log(propertyId);
        // Check if the property ID already exists in the database
        if (dbProperties.some(property => property.propertyId === propertyId)) {
            console.log(`Skipping property with ID: ${propertyId} (already exists in database)`);
            rowIndex++; // Skip this row and move to the next one
            continue;
        }

        const contacts = {}; // Object to hold contact information
        let rolesMapping = null; // Initialize outside of the column loop
        let addressParams = {}; // Temporary object to hold one address at a time

        // Process each column in the row
        Object.keys(columns).forEach((column) => {
            let cellValue = worksheet[column + rowIndex] ? worksheet[column + rowIndex].v : '';

            // Check if the column is '등록일자' or '거래완료일자' to convert serial to date
            if ((columns[column] === '등록일자' || columns[column] === '거래완료일자') || (columns[column] === '사용승인일자' && !isNaN(cellValue))) {
                cellValue = excelDateToJSDate(cellValue);
            }


            if (['시군구', '읍면동', '리명', '지번본번', '지번부번'].includes(columns[column])) {
              addressParams[columns[column]] = cellValue;
            }


            // Set rolesMapping when processing the '거래방식' column
            if (columns[column] === "거래방식") {
                if (cellValue === '매매') {
                    rolesMapping = {
                        AH: { role: '매도인', field: '이름' },
                        AI: { role: '매도인', field: '전화번호' },
                        AJ: { role: '매수인', field: '이름' },
                        AK: { role: '매수인', field: '전화번호' },
                        AL: { role: '부동산', field: '이름' },
                        AM: { role: '부동산', field: '전화번호' }
                    };
                } else if (cellValue === '월세') {
                    rolesMapping = {
                        AH: { role: '임대인', field: '이름' },
                        AI: { role: '임대인', field: '전화번호' },
                        AJ: { role: '임차인', field: '이름' },
                        AK: { role: '임차인', field: '전화번호' },
                        AL: { role: '부동산', field: '이름' },
                        AM: { role: '부동산', field: '전화번호' }
                    };
                } else if (cellValue === '전세') {
                    rolesMapping = {
                        AH: { role: '전대인', field: '이름' },
                        AI: { role: '전대인', field: '전화번호' },
                        AJ: { role: '전차인', field: '이름' },
                        AK: { role: '전차인', field: '전화번호' },
                        AL: { role: '부동산', field: '이름' },
                        AM: { role: '부동산', field: '전화번호' }
                    };
                }
            }

            // Only process rolesMapping for relevant columns
            if (rolesMapping && rolesMapping[column]) {
                const { role, field } = rolesMapping[column];

                // Ensure the role exists in the contacts object
                if (!contacts[role]) {
                    contacts[role] = {};
                }

                // Set the field value (e.g., '이름' or '전화번호')
                contacts[role][field] = cellValue;

                // Save the contacts object in dbRow["연락처"]
                dbRow["연락처"] = JSON.stringify(contacts);
            }

            // Skip '이름' and '휴대폰번호' from being added to rowData and dbRowData
            if (columns[column] === '이름' || columns[column] === '휴대폰번호') {
                return; // Skip processing these fields outside 연락처
            }

            // Format data for display
            if (columns[column] === '보증금' || columns[column] === '월세' || columns[column] === '관리비') {
                row[columns[column]] = cellValue.toLocaleString(); // Display formatted value
            } else {
                row[columns[column]] = cellValue; // Normal value
            }

            // Skip certain columns in dbRowData
            if (!excludedColumns.includes(columns[column])) {
                if (columns[column] === 'EV유무') {
                    dbRow[columns[column]] = cellValue === '있음' ? 1 : 0;
                } else if (columns[column] === '보증금' || columns[column] === '월세' || columns[column] === '관리비') {
                  dbRow[columns[column]] = cellValue ? parseFloat(cellValue.toString().replace(/,/g, '')) : 0; // Convert to number and ensure no null value
                } else {
                    dbRow[columns[column]] = cellValue;
                }
            }
        });

        // Fetch addressId based on the concatenated address fields
        try {
          console.log(addressParams);
          const response = await axios.get('http://localhost:8000/address-excel', { params: addressParams }); // Pass the collected address components as search parameters
          const { addressIds } = response.data;
            console.log(addressIds);
            if (addressIds.length > 0) {
              // Convert addressIds[0] to a number before assigning it
              dbRow['address_id'] = BigInt(addressIds[0]).toString(); // Convert BigInt to a string
            } else {
                dbRow['address_id'] = 0; // No address found
            }
        } catch (error) {
            console.error('Error fetching address ID:', error);
            dbRow['address_id'] = null; // Handle error by setting address_id to null
        }

        rowData.push(row);
        dbRowData.push(dbRow);
        rowIndex++;
    }

    console.log("rowData", rowData);
    console.log("dbRowData", dbRowData);

    // Return the row data explicitly
    return dbRowData;
};



// First, fetch the existing property data (like property IDs) from your backend
const fetchDbProperties = async () => {
  try {
      const response = await axios.get('http://localhost:8000/listing', { withCredentials: true });
      setDbProperties(response.data); 

  } catch (error) {
      console.error('Error fetching existing properties:', error);
      return []
  }
};

useEffect(()=>{
  fetchDbProperties()
},[])



const convertToDateOnly = (isoString) => {
  const date = new Date(isoString);
  
  const dateOnly = date.toISOString().slice(0, 10);
  
  return dateOnly;
};



const compareAndUpdateColumns = async (dbProperties, excelProperties) => {
  const updatedRows = [];

  for (const excelRow of excelProperties) {

      // Find the corresponding row in the DB
      const dbRow = dbProperties.find(dbRow => dbRow.매물ID === excelRow.매물ID);

      if (dbRow) {
        let rowUpdated = false;

        // Create a deep copy of dbRow to avoid reference issues
        const updatedRow = JSON.parse(JSON.stringify(dbRow));

        // Normalize date fields (convert to 'YYYY-MM-DD')
        const db등록일자 = dbRow.등록일자 ? convertToDateOnly(dbRow.등록일자) : null;
        const db거래완료일자 = dbRow.거래완료일자 ? convertToDateOnly(dbRow.거래완료일자) : null;

        // Compare each column and prompt user for update
        for (let key in excelRow) {
            if (excelRow.hasOwnProperty(key) && dbRow.hasOwnProperty(key)) {

                // Handle other fields with string/number normalization
                let dbValue = dbRow[key];
                let excelValue = excelRow[key];

                // Normalize dates in excelRow if applicable
                if (key === '등록일자' || key === '거래완료일자' || key === "사용승인일자") {
                    dbValue = convertToDateOnly(excelValue);
                }

                // Skip if both values are empty (null, undefined, "")
                if ((dbValue == null || dbValue === '') && (excelValue == null || excelValue === '')) {
                    continue; // Skip comparison if both are empty
                } else {
                    // Normalize number comparisons (convert stringified numbers to actual numbers)
                    if (!isNaN(dbValue) && !isNaN(excelValue)) {
                        dbValue = parseFloat(dbValue);
                        excelValue = parseFloat(excelValue);
                    }

                    // Perform the comparison
                    if (dbValue !== excelValue) {
                        const userWantsToUpdate = await askUserForColumnUpdate(excelRow["매물ID"], key, dbValue, excelValue);
                        if (userWantsToUpdate) {
                            updatedRow[key] = excelRow[key];  // Update the column value
                            rowUpdated = true;  // Mark that the row has been updated
                        }
                    }
                }
            }
        }

        // Only push the row to updatedRows if it was modified
        if (rowUpdated) {
            updatedRows.push(updatedRow);
        }
      }
  }
  
  return updatedRows;  // Return only the updated rows
};



const askUserForColumnUpdate = (propertyId, columnName, dbValue, excelValue) => {
  return new Promise((resolve) => {
    setAlertData({propertyId, columnName, dbValue, excelValue });
    setAlertVisible(true);
    setPendingResolve(() => resolve);  // Store the resolve function for later
  });
};

const handleConfirm = () => {
  if (pendingResolve) pendingResolve(true);
  setAlertVisible(false);
};

const handleCancel = () => {
  if (pendingResolve) pendingResolve(false);
  setAlertVisible(false);
};



  // Function to import the Excel file
  const importExcel = async () => {
    try {
        // Fetch existing property data from the database
        await fetchDbProperties();  // Ensure this updates dbProperties

        // Fetch the Excel file
        const response = await fetch('https://docs.google.com/spreadsheets/d/1cE9XxIZLY52PFsJZJdTY6AQE6Qhs7T_cWhU9nh2c5KE/export?format=xlsx');
        const data = await response.arrayBuffer();
        // Convert data to workbook and process it
        const workbook = convertDataToWorkbook(data);
        console.log(workbook);

        // Properly await the populated data
        const excelRowData = await populateGrid(workbook, dbProperties);

        if (!Array.isArray(excelRowData)) {
            throw new Error("Invalid Excel data format.");
        }

        console.log(excelRowData);

        // Compare each row in the Excel data with the database data
        const updatedRows = await compareAndUpdateColumns(dbProperties, excelRowData);
        console.log(updatedRows);

        // Find new records that don't exist in the database
        const newRecords = excelRowData.filter(excelRow => !dbProperties.find(dbRow => dbRow.매물ID === excelRow.매물ID));

        // Combine both new and updated records into one dataset
        const finalData = [...newRecords, ...updatedRows];

        // Normalize dates
        finalData.forEach(row => {
            row.등록일자 = row.등록일자 ? convertToDateOnly(row.등록일자) : null;
            row.거래완료일자 = row.거래완료일자 ? convertToDateOnly(row.거래완료일자) : null;
            row.사용승인일자 = row.사용승인일자 ? convertToDateOnly(row.사용승인일자) : null;
        });

        // Get object length from the first row (if available)
        const objectLength = finalData.length > 0 ? Object.keys(finalData[0]).length : 0;

        console.log(objectLength);
        console.log("finalData", finalData);

        if (finalData.length > 0) {
            const result = await axios.post('http://localhost:8000/import-csv', finalData, { withCredentials: true });
            console.log(result);
            onDataUpdate(true);
            alert('Data imported successfully!');
        } else {
            alert('No changes made to the database.');
        }

    } catch (error) {
        alert('Error importing data.');
        console.error(error);
    }
};





  

  return (
    <div className='flexCol gap-y-4'>
            {alertVisible && (
              <AlertComponent
                propertyId={alertData.매물ID}
                columnName={alertData.columnName}
                dbValue={alertData.dbValue}
                excelValue={alertData.excelValue}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            )}

      <div className="ag-theme-quartz" style={{ height: 400, width: '90vw' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
        />
      </div>
      <button onClick={importExcel}
        className='bg-primary-yellow text-white rounded-full px-4'
      
      >Import Excel Data</button>
    </div>
  );
}

export default ImportExcel;
