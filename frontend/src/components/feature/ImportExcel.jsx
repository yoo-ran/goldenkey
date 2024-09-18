import React, { useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import * as XLSX from 'xlsx';
import axios from 'axios';



const ImportExcel = ({onDataUpdate}) =>{
  const gridRef = useRef();
  const [rowData, setRowData] = useState([]);
  const [dbRowData, setDbRowData] = useState([])
  const [dbProperties, setDbProperties] = useState([]);

  const ImageRenderer = (props) => {
    const imageUrl = props.value;
    console.log(imageUrl);
    return (
      <div>
        {imageUrl ? <img src={imageUrl} alt="Property" style={{ width: '100px', height: '10vh' }} /> : 'No image'}
      </div>
    );
  };

  const [columnDefs, setColumnDefs] = useState([
    { field: "순번", headerName: "순번", minWidth: 90 },
    { field: "등록일자", headerName: "등록일자" },
    { field: "부동산구분", headerName: "부동산 구분", minWidth: 150 },
    { field: "거래방식", headerName: "거래 방식" },
    { field: "거래완료여부", headerName: "거래 완료 여부", minWidth: 130 },
    { field: "거래완료일자", headerName: "거래 완료 일자", minWidth: 100 },
    { field: "담당자", headerName: "담당자" },
    {
      headerName: "주소",
      children: [
        { field: "구", headerName: "구" },
        { field: "읍면동", headerName: "읍 / 면 / 동" },
        { field: "구상세주소", headerName: "상세주소" }
      ],
    },
    {
      headerName: "신 주소",
      children: [
        { field: "도로명", headerName: "도로명" },
        { field: "신상세주소", headerName: "상세주소" },
      ],
    },
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
    { field: "주차가능대수", headerName: "주차 가능 대수" },
    { field: "비밀번호", headerName: "비밀번호" },
    {
      headerName: "소유자 정보",
      children: [
        { field: "이름", headerName: "이름" },
        { field: "휴대폰번호", headerName: "휴대폰 번호" },
      ],
    },
    { field: "기타특이사항", headerName: "기타 특이사항" },
    {
      headerName: "정산금액",
      children: [
        { field: "총수수료", headerName: "총 수수료" },
        { field: "소장", headerName: "소장" },
        { field: "직원1", headerName: "직원1" },
        { field: "직원2", headerName: "직원2" },
      ],
    },
    { field: "메모", headerName: "메모" },
    { field: "img_path", headerName: "Image", cellRendererFramework: ImageRenderer },
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
  const populateGrid = (workbook, dbProperties) => {
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const columns = {
        A: '순번',
        B: '등록일자',
        C: '부동산구분',
        D: '거래방식',
        E: '거래완료여부',
        F: '거래완료일자',
        G: '담당자',
        H: '구',
        I: '읍면동',
        J: '구상세주소',
        K: '도로명',
        L: '신상세주소',
        M: '건물명',
        N: '동',
        O: '호수',
        P: '보증금',
        Q: '월세',
        R: '관리비',
        S: '전체m2',
        T: '전용m2',
        U: '전체평',
        V: '전용평',
        W: 'EV유무',
        X: '화장실개수',
        Y: '주차가능대수',
        Z: '비밀번호',
        AA: '이름',
        AB: '휴대폰번호',
        AC: '기타특이사항',
        AD: '총수수료',
        AE: '소장',
        AF: '직원1',
        AG: '직원2',
        AH: '메모',
    };

    const rowData = [];
    const dbRowData = [];
    let rowIndex = 4;

    while (worksheet['A' + rowIndex]) {
        const row = {};
        const dbRow = {};
        const propertyId = worksheet['A' + rowIndex].v; // Assuming '순번' (column A) is the unique property ID

        // Check if the property ID already exists in the database
        if (dbProperties.some(property => property.propertyId === propertyId)) {
            console.log(`Skipping property with ID: ${propertyId} (already exists in database)`);
            rowIndex++; // Skip this row and move to the next one
            continue;
        }

        Object.keys(columns).forEach((column) => {
            let cellValue = worksheet[column + rowIndex] ? worksheet[column + rowIndex].v : '';

            // Check if the column is '등록일자' or '거래완료일자' to convert serial to date
            if ((columns[column] === '등록일자' || columns[column] === '거래완료일자') && !isNaN(cellValue)) {
                cellValue = excelDateToJSDate(cellValue);
            }

            // Handle specific columns formatting
            if (columns[column] === '총수수료' || columns[column] === '소장' || columns[column] === '직원1' || columns[column] === '직원2') {
              cellValue = cellValue === null ? 0 : cellValue; // Default to 0 if empty
            }

            // Format data for display
            if (columns[column] === '보증금' || columns[column] === '월세' || columns[column] === '관리비' || columns[column] === '총수수료' || columns[column] === '소장' || columns[column] === '직원1' || columns[column] === '직원2') {
                row[columns[column]] = cellValue.toLocaleString(); // Display formatted value
            } else {
                row[columns[column]] = cellValue; // Normal value
            }

            // Prepare data for DB without commas
            if (columns[column] === 'EV유무') {
              dbRow[columns[column]] = cellValue === '있음' ? 1 : 0;
          } else if (columns[column] === '보증금' || columns[column] === '월세' || columns[column] === '관리비' || columns[column] === '총수수료' || columns[column] === '소장' || columns[column] === '직원') {
              dbRow[columns[column]] = cellValue ? cellValue.toString().replace(/,/g, '') : ''; // Ensure no null value
          } else {
              dbRow[columns[column]] = cellValue;
          }
        });

        rowData.push(row);
        dbRowData.push(dbRow);
        rowIndex++;
    }

    setRowData(rowData);
    setDbRowData(dbRowData);
    return dbRowData
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


  // Calculate Total for 정산금액 (소장금액, 직원금액, 총수수료)
  const calculateTotal = (row) => {
    const 소장 = parseFloat(row.소장) || 0;
    const 직원1 = parseFloat(row.직원1) || 0;
    const 직원2 = parseFloat(row.직원2) || 0;
    return 소장 + 직원1 + 직원2;
}

const createTotalasJSON = (row) => {
  console.log(row);
  row.정산금액 = {
      "소장": parseFloat(row.소장) || 0,
      "직원": [
          { "name": "직원1", "money": parseFloat(row.직원1) || 0},
          { "name": "직원2", "money": parseFloat(row.직원2)|| 0},
      ],
  };
  row.정산금액.총수수료 = calculateTotal(row);

};

const convertToDateOnly = (isoString) => {
  const date = new Date(isoString);
  
  const dateOnly = date.toISOString().slice(0, 10);
  
  return dateOnly;
};




const compareAndUpdateColumns = async (dbProperties, excelProperties) => {
  const updatedRows = [];

  for (const excelRow of excelProperties) {
      createTotalasJSON(excelRow);
      console.log(excelRow);
      const dbRow = dbProperties.find(dbRow => dbRow.순번 === excelRow.순번);
      console.log(dbRow);
      if (dbRow) {
        let rowUpdated = false;
        const updatedRow = dbRow;  // Deep copy of dbRow to prevent reference issues
        console.log(updatedRow);
        
        // Ensure both dates are in YYYY-MM-DD format
        if (dbRow.등록일자) dbRow.등록일자 = convertToDateOnly(dbRow.등록일자);
        if (dbRow.거래완료일자) dbRow.거래완료일자 = convertToDateOnly(dbRow.거래완료일자);
    
        // Compare each column and prompt user
        for (let key in excelRow) {
            if (excelRow.hasOwnProperty(key) && dbRow.hasOwnProperty(key)) {
                // Handle '정산금액' JSON in both dbRow and excelRow
                if (key === '정산금액') {
                    // Parse '정산금액' JSON in both dbRow and excelRow
                    let dbValue = JSON.parse(dbRow['정산금액'] || '{}');
                    let excelValue = excelRow['정산금액'] || '{}';
                    let updateValue = JSON.parse(updatedRow['정산금액'] || '{}');  // Work on updating this
                    
                    // Compare the nested values inside 정산금액
                    for (const key in dbValue) {
                        console.log(key);
                        if (key === "직원") {
                            for (let i = 0; i < excelValue[key].length; i++) {
                                let dbEmployeeMoney = dbValue[key][i].money;
                                let excelEmployeeMoney = excelValue[key][i].money;
                                
                                if (dbEmployeeMoney !== excelEmployeeMoney) {
                                    const userWantsToUpdate = await askUserForColumnUpdate(excelValue[key][i].name, dbEmployeeMoney, excelEmployeeMoney);
                                    if (userWantsToUpdate) {
                                        updateValue[key][i].money = excelEmployeeMoney;  // Update the value in updateValue
                                        console.log(updateValue[key][i].money);
                                        rowUpdated = true;  // Mark that the row has been updated
                                    }
                                }
                            }
                        } else {
                            if (dbValue[key] !== excelValue[key]) {
                              console.log(dbValue[key]);
                                const userWantsToUpdate = await askUserForColumnUpdate(key, dbValue[key], excelValue[key]);
                                if (userWantsToUpdate) {
                                    updateValue[key] = excelValue[key];  // Update other fields in 정산금액
                                    rowUpdated = true;  // Mark that the row has been updated
                                }
                            }
                        }
                    }
    
                    // After updating, assign the new 정산금액 back to updatedRow
                    updatedRow['정산금액'] = JSON.stringify(updateValue);  // Ensure this is stringified
                    console.log('Updated 정산금액:', JSON.stringify(updatedRow['정산금액']));
                } else {
                    // Handle other fields with string/number normalization
                    let dbValue = dbRow[key];
                    let excelValue = excelRow[key];
    
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
                            const userWantsToUpdate = await askUserForColumnUpdate(key, dbValue, excelValue);
                            if (userWantsToUpdate) {
                                updatedRow[key] = excelRow[key];  // Update the column value
                                rowUpdated = true;  // Mark that the row has been updated
                            }
                        }
                    }
                }
            }
        }


          if (rowUpdated) {
              updatedRows.push(updatedRow);  // Only push the row if it was updated
              console.log(JSON.stringify(updatedRows[0].정산금액));

          }
      }
  }
  return updatedRows;  // Return only the updated rows
};





const askUserForColumnUpdate = (columnName, dbValue, excelValue) => {
  return new Promise((resolve) => {
      const userResponse = window.confirm(
          `The column "${columnName}" has different values:\n\nDatabase Value: ${JSON.stringify(dbValue)}\nExcel Value: ${JSON.stringify(excelValue)}\n\nDo you want to overwrite the database value with the Excel value?`
      );
      resolve(userResponse);  // Resolve with true for Yes, false for No
  });
};




  // Function to import the Excel file
  const importExcel = async () => {
    try {
        // Fetch existing property data from the database
        await fetchDbProperties();  // <-- add await here

        // Fetch the Excel file
        const response = await fetch('https://docs.google.com/spreadsheets/d/1cE9XxIZLY52PFsJZJdTY6AQE6Qhs7T_cWhU9nh2c5KE/export?format=xlsx');
        const data = await response.arrayBuffer();

        // Convert data to workbook and process it
        const workbook = convertDataToWorkbook(data);
        const excelRowData = populateGrid(workbook, dbProperties);

        
        // Compare each row in the Excel data with the database data
        const updatedRows = await compareAndUpdateColumns(dbProperties, excelRowData);
        console.log(updatedRows);
        // Find new records that don't exist in the database
        const newRecords = excelRowData.filter(excelRow => !dbProperties.find(dbRow => dbRow.순번 === excelRow.순번));
        
        // Combine both new and updated records into one dataset
        const finalData = [...newRecords, ...updatedRows];

        console.log(finalData);
        // Apply createTotalasJSON to each row in finalData
        finalData.forEach(row => {
            console.log(row.정산금액);
            row.등록일자 = convertToDateOnly(row.등록일자)
            row.거래완료일자 = convertToDateOnly(row.거래완료일자)
            // row.정산금액 = JSON.stringify(row.정산금액)
        });

        console.log(finalData);

        // Now finalData contains the '정산금액' key with the calculated values
        if (finalData.length > 0) {
            // Send all data (new and updated records) to the backend
            const result = await axios.post('http://localhost:8000/import-csv', finalData, { withCredentials: true });
            console.log(result);
            onDataUpdate(true)
            alert('Data imported successfully!');
        } else {
            alert('No changes made to the database.');
        }

    } catch (error) {
        // Handle error response
        alert('Error importing data.');
        console.error(error);
    }
};



  

  return (
    <div className='flexCol gap-y-4'>
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
