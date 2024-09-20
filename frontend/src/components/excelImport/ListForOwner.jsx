import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";




// Main component
const ListForOwner = ({updateData}) => {
    const [propertyData, setPropertyData] = useState([]);
    const DeleteButtonRenderer = (params) => {
        const handleClick = () => {
            params.context.componentParent.handleDelete(params.data.순번);
        };
        return <button className='bg-red-500 text-white px-4 rounded' onClick={handleClick}>Delete</button>;
      };
      // Checkbox Renderer
      const CheckboxRenderer = (props) => {
          const handleChange = async () => {
              const newValue = !Boolean(props.value);
              const propertyId = props.data.순번;
      
              try {
                  await axios.put(`http://localhost:8000/update-property/${propertyId}`, {
                      EV유무: newValue
                  });
      
                  // Re-fetch the updated properties after change
                  props.context.componentParent.fetchProperties();
      
                  alert("Property updated successfully!");
              } catch (error) {
                  console.error('Error updating property:', error);
                  alert('Error updating property.');
              }
          };
      
          return (
              <input
                  type="checkbox"
                  checked={Boolean(props.value)}
                  onChange={handleChange}
              />
          );
      };
    const fetchProperties = async () => {
        try {
            const response = await axios.get('http://localhost:8000/listing');
            setPropertyData(response.data);
        } catch (error) {
            console.error('Error fetching properties:', error);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [updateData]);

    const handleDelete = async (propertyId) => {
        try {
            await axios.delete(`http://localhost:8000/delete-property/${propertyId}`);
            alert("Property deleted successfully!");

            // Fetch updated data after deletion
            fetchProperties();
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

    const [colDefs, setColDefs] = useState([
      { field: '순번', editable: false },
      { field: '등록일자', editable: true },
      {
          field: '부동산구분',
          editable: true,
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
              values: ['아파트', '오피스텔', '상가', '주택']
          }
      },
      {
          field: '거래방식',
          editable: true,
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
              values: ['매매', '전세', '월세']
          }
      },
      {
          field: '거래완료여부',
          editable: true,
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
              values: ['완료', '미완료']
          }
      },
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
      {
          field: 'EV유무', // Render checkbox for EV유무
          editable: true,
          cellRenderer: CheckboxRenderer // Use custom renderer
      },
      { field: '화장실개수', editable: true },
      { field: '주차가능대수', editable: true },
      { field: '비밀번호', editable: false },
      { field: '이름', editable: true },
      { field: '휴대폰번호', editable: true },
      { field: '기타특이사항', editable: true },
      {
        field: '총수수료',
        // valueGetter: (params) => JSON.parse(params.data.정산금액).총수수료 || '',
        valueGetter: (params) => JSON.parse(params.data.정산금액).총수수료 || 0,
        editable: false // Set this field to non-editable for now if you don't want it to be changed directly
    },
    {
        field: '소장',
        valueGetter: (params) => JSON.parse(params.data.정산금액).소장 || 0,
        editable: true
    },
    {
        field: '직원1',
        valueGetter: (params) => {
            let 정산금액 = JSON.parse(params.data.정산금액);
            if (정산금액.직원 && Array.isArray(정산금액.직원) && 정산금액.직원.length > 0) {
                return 정산금액.직원[0].money || 0;
            }
            return 0; 
        },
        editable: true
    },
    {
        field: '직원2',
        valueGetter: (params) => {
            let 정산금액 = JSON.parse(params.data.정산금액);
            if (정산금액.직원 && Array.isArray(정산금액.직원) && 정산금액.직원.length > 0) {
                return 정산금액.직원[1].money || 0;
            }
            return 0; 
        },
        editable: true
    },
    
      { field: '메모', editable: true },
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

    return (
        <div className="ag-theme-quartz" style={{ width: "100%", height: "60vh" }}>
            <AgGridReact
                rowData={propertyData}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                context={{ componentParent: { handleDelete, fetchProperties } }}
                onCellValueChanged={onCellValueChanged}
                frameworkComponents={{ checkboxRenderer: CheckboxRenderer }}
            />
        </div>
    );
};

export default ListForOwner;
