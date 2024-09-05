import { useEffect, useState } from "react";
import axios from 'axios';

// Theme
import { AgGridReact } from "ag-grid-react";
// React Grid Logic
import "ag-grid-community/styles/ag-grid.css";
// Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css";

// Cell Renderer Function
const DeleteButtonRenderer = (params) => {
    const handleClick = () => {
        params.context.componentParent.handleDelete(params.data.순번);
    };

    return (
        <button onClick={handleClick}>Delete</button>
    );
};

// Create new GridExample component
const ListForOwner = () => {
  // Row Data: The data to be displayed.
  const [propertyData, setPropertyData] = useState([]); 
  
  const DeleteButtonRenderer = (params) => {
    const handleClick = () => {
        params.context.componentParent.handleDelete(params.data.순번);
    };

    return (
        <button onClick={handleClick}>Delete</button>
    );
};

  // Column Definitions: Defines & controls grid columns.
  const [colDefs, setColDefs] = useState([
    { field: '순번', editable: false },
    { field: '등록일자', editable: true },
    { field: '부동산구분', editable: true },
    { field: '거래방식', editable: true },
    { field: '거래완료여부', editable: true },
    { field: '거래완료일자', editable: true },
    { field: '담당자', editable: true },
    { field: '구', editable: true },
    { field: '읍면동', editable: true },
    { field: '구상세주소', editable: true },
    { field: '도로명', editable: true },
    { field: '신상세주소', editable: true },
    { field: '건물명', editable: true },
    { field: '동', editable: true },
    { field: '호수', editable: true },
    { field: '보증금', editable: true },
    { field: '월세', editable: true },
    { field: '관리비', editable: true },
    { field: '전체m2', editable: true },
    { field: '전용m2', editable: true },
    { field: '전체평', editable: true },
    { field: '전용평', editable: true },
    { field: 'EV유무', editable: true },
    { field: '화장실개수', editable: true },
    { field: '주차가능대수', editable: true },
    { field: '비밀번호', editable: false },
    { field: '이름', editable: true },
    { field: '휴대폰번호', editable: true },
    { field: '기타특이사항', editable: true },
    { field: '총수수료', editable: true },
    { field: '소장', editable: true },
    { field: '직원', editable: true },
    {
        headerName: 'Actions',
        field: 'actions',
        cellRenderer: DeleteButtonRenderer,
    }
  ]);

  const defaultColDef = {
    minWidth: 100,
    flex: 1,
  };

  useEffect(() => {
    const fetchProperties = async () => {
        try {
            const response = await axios.get('http://localhost:8000/listing');
            setPropertyData(response.data);
        } catch (error) {
            console.error('Error fetching properties:', error);
        }
    };

    fetchProperties();
  }, []);

  const handleDelete = async (propertyId) => {
    try {
        await axios.delete(`http://localhost:8000/delete-property/${propertyId}`);
        alert("Property deleted successfully!");

        // Fetch updated data after deletion
        const response = await axios.get('http://localhost:8000/listing');
        setPropertyData(response.data);
    } catch (error) {
        console.error('Error deleting property:', error);
        alert('Error deleting property.');
    }
  };

  const onCellValueChanged = async (params) => {
    const { data, colDef, newValue } = params;
    const propertyId = data.순번;
    const field = colDef.field;

    try {
        await axios.put(`http://localhost:8000/update-property/${propertyId}`, {
            [field]: newValue
        });
        alert("Property updated successfully!");
    } catch (error) {
        console.error('Error updating property:', error);
        alert('Error updating property.');
    }
  };

  // Container: Defines the grid's theme & dimensions.
  return (
    <div
      className={
        "ag-theme-quartz"
      }
      style={{ width: "100%", height: "60vh" }}
    >
      <AgGridReact
        rowData={propertyData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        context={{ componentParent: { handleDelete } }}
        onCellValueChanged={onCellValueChanged}
        frameworkComponents={{ deleteButtonRenderer: DeleteButtonRenderer }}
      />
    </div>
  );
};

export default ListForOwner;
