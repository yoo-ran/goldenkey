import React, { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import * as XLSX from 'xlsx';
import axios from 'axios';

import AlertComponent from './AlertComponent';

const ImportExcel = ({ onDataUpdate }) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const gridRef = useRef();
  const [rowData, setRowData] = useState([]);
  const [dbRowData, setDbRowData] = useState([]);
  const [dbProperties, setDbProperties] = useState([]);

  const [alertVisible, setAlertVisible] = useState(false);
  const [pendingResolve, setPendingResolve] = useState(null);
  const [alertData, setAlertData] = useState({
    매물ID: 0,
    columnName: '',
    dbValue: '',
    excelValue: '',
  });

  const [searchParams, setSearchParams] = useState({
    시군구: '',
    읍면: '',
    리명: '',
    지번본번: '',
    지번부번: '',
  });

  const generateRandomId = () => {
    return Math.floor(10000 + Math.random() * 90000);
  };

  // First, fetch the existing property data (like property IDs) from your backend
  const fetchDbProperties = async () => {
    try {
      const response = await axios.get(`${apiUrl}/listing`, {
        withCredentials: true,
      });
      setDbProperties(response.data);
    } catch (error) {
      console.error('Error fetching existing properties:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchDbProperties();
  }, []);

  const [columnDefs, setColumnDefs] = useState([
    { field: '순번', headerName: '순번', minWidth: 60 },
    { field: '등록일자', headerName: '등록일자' },
    { field: '사용승인일자', headerName: '사용승인일자' },
    { field: '부동산구분', headerName: '부동산 구분', minWidth: 150 },
    { field: '거래방식', headerName: '거래 방식' },
    { field: '거래완료여부', headerName: '거래 완료 여부', minWidth: 130 },
    { field: '거래완료일자', headerName: '거래 완료 일자', minWidth: 100 },
    { field: '담당자', headerName: '담당자' },
    {
      headerName: '구주소',
      children: [
        { field: '시군구', headerName: '시군구' },
        { field: '읍면동', headerName: '읍 / 면 / 동' },
        { field: '리명', headerName: '리명' },
        { field: '지번본번', headerName: '지번본번' },
        { field: '지번부번', headerName: '지번부번' },
      ],
    },
    {
      headerName: '신 주소',
      children: [
        { field: '시군구', headerName: '시군구' },
        { field: '읍면', headerName: '읍면' },
        { field: '도로명', headerName: '도로명' },
      ],
    },
    { field: '상세주소', headerName: '상세주소' },
    { field: '건물명', headerName: '건물명' },
    { field: '동', headerName: '동' },
    { field: '호수', headerName: '호수' },
    {
      headerName: '금액',
      children: [
        { field: '보증금', headerName: '보증금' },
        { field: '월세', headerName: '월세' },
        { field: '관리비', headerName: '관리비' },
      ],
    },
    {
      headerName: '면적(m2)',
      children: [
        { field: '전체m2', headerName: '전체' },
        { field: '전용m2', headerName: '전용' },
      ],
    },
    {
      headerName: '면적(평)',
      children: [
        { field: '전체평', headerName: '전체' },
        { field: '전용평', headerName: '전용' },
      ],
    },
    { field: 'EV유무', headerName: 'E/V 유무' },
    { field: '화장실개수', headerName: '화장실 개수' },
    { field: '층수', headerName: '층 수' },
    { field: '주차가능대수', headerName: '주차 가능 대수' },
    { field: '비밀번호', headerName: '비밀번호' },
    {
      headerName: '매도인(임대인) 정보',
      children: [
        { field: '이름', headerName: '이름' },
        { field: '휴대폰번호', headerName: '휴대폰 번호' },
      ],
    },
    {
      headerName: '매수인(임차인) 정보',
      children: [
        { field: '이름', headerName: '이름' },
        { field: '휴대폰번호', headerName: '휴대폰 번호' },
      ],
    },
    {
      headerName: '부동산 정보',
      children: [
        { field: '이름', headerName: '이름' },
        { field: '휴대폰번호', headerName: '휴대폰 번호' },
      ],
    },
    { field: '메모', headerName: '메모' },
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
      A: '매물ID',
      B: '등록일자',
      C: '사용승인일자',
      D: '부동산구분',
      E: '거래방식',
      F: '거래완료여부',
      G: '거래완료일자',
      H: '담당자',
      I: '시군구',
      J: '읍면동',
      K: '리명',
      L: '지번본번',
      M: '지번부번',
      N: '시군구',
      O: '읍면',
      P: '도로명',
      Q: '상세주소',
      R: '건물명',
      S: '동',
      T: '호수',
      U: '보증금',
      V: '월세',
      W: '관리비',
      X: '전체m2',
      Y: '전용m2',
      Z: '전체평',
      AA: '전용평',
      AB: 'EV유무',
      AC: '화장실개수',
      AD: '층수',
      AE: '주차가능대수',
      AF: '비밀번호',
      AG: '이름',
      AH: '휴대폰번호',
      AI: '이름',
      AJ: '휴대폰번호',
      AK: '이름',
      AL: '휴대폰번호',
      AM: '메모',
    };

    const excludedColumns = [
      '시군구',
      '읍면동',
      '리명',
      '지번본번',
      '지번부번',
      '시군구',
      '읍면',
      '도로명',
    ];
    const rowData = [];
    const dbRowData = [];
    let rowIndex = 4;

    while (worksheet['A' + rowIndex]) {
      const row = {};
      const dbRow = {};
      let propertyId = worksheet['A' + rowIndex]?.v;
      console.log(propertyId);
      // If property ID is missing or already exists in the database, generate a new one
      const contacts = {}; // Object to hold contact information
      let rolesMapping = null; // Initialize outside of the column loop
      let addressParams = {}; // Temporary object to hold one address at a time

      // Process each column in the row
      Object.keys(columns).forEach((column) => {
        let cellValue = worksheet[column + rowIndex]
          ? worksheet[column + rowIndex].v
          : '';

        // Assign values to rows only for other columns (skip 매물ID as it's already set)
        if (columns[column] === '매물ID') {
          cellValue = propertyId;
          row[columns[column]] = propertyId;
          dbRow[columns[column]] = propertyId;
        }
        // Check if the column is '등록일자' or '거래완료일자' to convert serial to date
        if (
          columns[column] === '등록일자' ||
          columns[column] === '거래완료일자' ||
          (columns[column] === '사용승인일자' && !isNaN(cellValue))
        ) {
          cellValue = excelDateToJSDate(cellValue);
        }

        if (
          ['시군구', '읍면동', '리명', '지번본번', '지번부번'].includes(
            columns[column]
          )
        ) {
          addressParams[columns[column]] = cellValue;
        }

        // Set rolesMapping when processing the '거래방식' column
        if (columns[column] === '거래방식') {
          if (cellValue === '매매') {
            rolesMapping = {
              AG: { role: '매도인', field: '이름' },
              AH: { role: '매도인', field: '전화번호' },
              AI: { role: '매수인', field: '이름' },
              AJ: { role: '매수인', field: '전화번호' },
              AK: { role: '부동산', field: '이름' },
              AL: { role: '부동산', field: '전화번호' },
            };
          } else if (cellValue === '월세') {
            rolesMapping = {
              AG: { role: '임대인', field: '이름' },
              AH: { role: '임대인', field: '전화번호' },
              AI: { role: '임차인', field: '이름' },
              AJ: { role: '임차인', field: '전화번호' },
              AK: { role: '부동산', field: '이름' },
              AL: { role: '부동산', field: '전화번호' },
            };
          } else if (cellValue === '전세') {
            rolesMapping = {
              AG: { role: '전대인', field: '이름' },
              AH: { role: '전대인', field: '전화번호' },
              AI: { role: '전차인', field: '이름' },
              AJ: { role: '전차인', field: '전화번호' },
              AK: { role: '부동산', field: '이름' },
              AL: { role: '부동산', field: '전화번호' },
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
          dbRow['연락처'] = JSON.stringify(contacts);
        }

        // Skip '이름' and '휴대폰번호' from being added to rowData and dbRowData
        if (columns[column] === '이름' || columns[column] === '휴대폰번호') {
          return; // Skip processing these fields outside 연락처
        }

        // Format data for display
        if (
          columns[column] === '보증금' ||
          columns[column] === '월세' ||
          columns[column] === '관리비'
        ) {
          row[columns[column]] = cellValue.toLocaleString(); // Display formatted value
        } else {
          row[columns[column]] = cellValue; // Normal value
        }

        // Skip certain columns in dbRowData
        if (!excludedColumns.includes(columns[column])) {
          if (columns[column] === 'EV유무') {
            dbRow[columns[column]] = cellValue === '있음' ? 1 : 0;
          } else if (
            columns[column] === '보증금' ||
            columns[column] === '월세' ||
            columns[column] === '관리비'
          ) {
            dbRow[columns[column]] = cellValue
              ? parseFloat(cellValue.toString().replace(/,/g, ''))
              : 0; // Convert to number and ensure no null value
          } else {
            dbRow[columns[column]] = cellValue;
          }
        }
      });

      // Fetch addressId based on the concatenated address fields
      try {
        const response = await axios.get(`${apiUrl}/address-excel`, {
          params: addressParams,
        }); // Pass the collected address components as search parameters
        const { addressIds } = response.data;
        if (addressIds.length > 0) {
          // Convert addressIds[0] to a number before assigning it
          dbRow['address_id'] = BigInt(addressIds[0]).toString(); // Convert BigInt to a string
        } else {
          dbRow['address_id'] = ''; // No address found
        }
      } catch (error) {
        console.error('Error fetching address ID:', error);
        dbRow['address_id'] = null; // Handle error by setting address_id to null
      }

      rowData.push(row);
      dbRowData.push(dbRow);
      rowIndex++;
    }
    return { dbRowData }; // Return both rowData and dbRowData as an object if needed
  };
  console.log(rowData);

  const convertToDateOnly = (isoString) => {
    const date = new Date(isoString);

    const dateOnly = date.toISOString().slice(0, 10);

    return dateOnly;
  };

  const compareAndUpdateColumns = async (dbProperties, excelProperties) => {
    const updatedRows = [];

    for (const excelRow of excelProperties) {
      const dbRow = dbProperties.find(
        (dbRow) => dbRow.매물ID === excelRow.매물ID
      );

      if (!dbRow) continue;

      let rowUpdated = false;
      const updatedRow = { ...dbRow }; // Create a shallow copy to avoid reference issues

      for (const key in excelRow) {
        if (!excelRow.hasOwnProperty(key) || !dbRow.hasOwnProperty(key))
          continue;

        let dbValue = dbRow[key];
        let excelValue = excelRow[key];

        // Normalize dates
        if (['등록일자', '거래완료일자', '사용승인일자'].includes(key)) {
          dbValue = convertToDateOnly(dbValue);
          excelValue = convertToDateOnly(excelValue);
        }

        // Handle 연락처 comparison separately
        if (key === '연락처') {
          let contactUpdated = false;

          const dbContact =
            typeof dbValue === 'string' ? JSON.parse(dbValue) : dbValue;
          const excelContact =
            typeof excelValue === 'string'
              ? JSON.parse(excelValue)
              : excelValue;

          for (const contactType in dbContact) {
            if (
              !dbContact.hasOwnProperty(contactType) ||
              !excelContact.hasOwnProperty(contactType)
            )
              continue;

            const { 이름: dbName, 전화번호: dbPhone } = dbContact[contactType];
            const { 이름: excelName, 전화번호: excelPhone } =
              excelContact[contactType];

            if (dbName !== excelName || dbPhone !== excelPhone) {
              const userWantsToUpdate = await askUserForColumnUpdate(
                excelRow.매물ID,
                `${key} - ${contactType}`,
                `이름: ${dbName}, 전화번호: ${dbPhone}`,
                `이름: ${excelName}, 전화번호: ${excelPhone}`
              );

              if (userWantsToUpdate) {
                // Update with the new contact info
                updatedRow[key] = excelContact;
                contactUpdated = true;
              }
            }
          }

          if (contactUpdated) {
            updatedRow[key] = JSON.stringify(excelContact); // Ensure 연락처 is stringified
            rowUpdated = true;
          }
          continue; // Move to the next key as 연락처 is fully handled
        }

        // Skip comparison if both values are empty
        if (
          (dbValue == null || dbValue === '') &&
          (excelValue == null || excelValue === '')
        )
          continue;

        // Normalize numbers for comparison
        if (!isNaN(dbValue) && !isNaN(excelValue)) {
          dbValue = parseFloat(dbValue);
          excelValue = parseFloat(excelValue);
        }

        // If values are different, prompt for update
        if (dbValue !== excelValue) {
          const userWantsToUpdate = await askUserForColumnUpdate(
            excelRow.매물ID,
            key,
            dbValue,
            excelValue
          );
          if (userWantsToUpdate) {
            updatedRow[key] = excelValue;
            rowUpdated = true;
          }
        }
      }

      if (rowUpdated) updatedRows.push(updatedRow);
    }

    return updatedRows;
  };

  const askUserForColumnUpdate = (
    propertyId,
    columnName,
    dbValue,
    excelValue
  ) => {
    return new Promise((resolve) => {
      setAlertData({ propertyId, columnName, dbValue, excelValue });
      setAlertVisible(true);
      setPendingResolve(() => resolve); // Store the resolve function for later
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
      await fetchDbProperties(); // Ensure this updates dbProperties

      // Fetch the Excel file
      const response = await fetch(
        'https://docs.google.com/spreadsheets/d/1cE9XxIZLY52PFsJZJdTY6AQE6Qhs7T_cWhU9nh2c5KE/export?format=xlsx'
      );
      const data = await response.arrayBuffer();

      // Convert data to workbook and process it
      const workbook = convertDataToWorkbook(data);
      console.log('workbook', workbook);

      // Properly await the populated data
      const excelRow = await populateGrid(workbook, dbProperties);
      const excelRowData = excelRow.dbRowData;
      console.log('excelRowData', excelRowData);

      if (!Array.isArray(excelRowData)) {
        throw new Error('Invalid Excel data format.');
      }

      // Compare each row in the Excel data with the database data
      const updatedRows = await compareAndUpdateColumns(
        dbProperties,
        excelRowData
      );

      // Identify new records in the Excel data that don't exist in the database
      const newRecords = excelRowData.filter(
        (excelRow) =>
          !dbProperties.some((dbRow) => dbRow.매물ID === excelRow.매물ID)
      );
      // Combine both new and updated records into one dataset
      const finalData = [...newRecords, ...updatedRows];
      console.log('finalData', finalData);

      // Normalize dates
      finalData.forEach((row) => {
        row.등록일자 = row.등록일자 ? convertToDateOnly(row.등록일자) : null;
        row.거래완료일자 = row.거래완료일자
          ? convertToDateOnly(row.거래완료일자)
          : null;
        row.사용승인일자 = row.사용승인일자
          ? convertToDateOnly(row.사용승인일자)
          : null;
      });

      // Now finalData contains the '정산금액' key with the calculated values
      if (finalData.length > 0) {
        // Send all data (new and updated records) to the backend
        const result = await axios.post(`${apiUrl}/import-csv`, finalData, {
          withCredentials: true,
        });
        console.log(result);
        downloadUpdatedExcel(finalData);
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

  const downloadUpdatedExcel = (data) => {
    if (data.length === 0) {
      alert('No data available to download.');
      return;
    }

    // Extract headers from the first object in the data array
    const headers = Object.keys(data[0]);

    // Map the data to an array format suitable for aoa_to_sheet
    const excelData = [
      headers, // First row with headers
      ...data.map((row) => headers.map((header) => row[header])), // Map each row of data
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData); // Use array of arrays (AOA) format
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'UpdatedData');

    // Generate a buffer for the workbook
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Create a Blob from the buffer and initiate download
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UpdatedData.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  return (
    <div className='flexCol gap-y-4'>
      {alertVisible && (
        <AlertComponent
          propertyId={alertData.propertyId}
          columnName={alertData.columnName}
          dbValue={alertData.dbValue}
          excelValue={alertData.excelValue}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      <div className='ag-theme-quartz' style={{ height: 400, width: '90vw' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
        />
      </div>
      <button
        onClick={importExcel}
        className='bg-primary-yellow text-white rounded-lg px-4 py-2'
      >
        엑셀 불러오기
      </button>
    </div>
  );
};

export default ImportExcel;
