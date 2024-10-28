import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Main component
const ListForOwner = ({ updateData }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [propertyData, setPropertyData] = useState([]);

  const DeleteButtonRenderer = (params) => {
    const handleClick = () => {
      params.context.componentParent.handleDelete(params.data.매물ID);
    };
    return (
      <button
        className='bg-red-500 text-white px-4 rounded'
        onClick={handleClick}
      >
        Delete
      </button>
    );
  };
  // Checkbox Renderer
  const CheckboxRenderer = (props) => {
    const handleChange = async () => {
      const newValue = !Boolean(props.value);
      const propertyId = props.data.순번;

      try {
        await axios.put(`${apiUrl}/update-property/${propertyId}`, {
          EV유무: newValue,
        });

        // Re-fetch the updated properties after change
        props.context.componentParent.fetchProperties();

        alert('Property updated successfully!');
      } catch (error) {
        console.error('Error updating property:', error);
        alert('Error updating property.');
      }
    };

    return (
      <input
        type='checkbox'
        checked={Boolean(props.value)}
        onChange={handleChange}
      />
    );
  };

  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${apiUrl}/listing`);

      // Use Promise.all to fetch new and old addresses for all properties in parallel
      const data = await Promise.all(
        response.data.map(async (property, index) => {
          try {
            // Display New Address and Old Address
            let newAddress = {};
            let oldAddress = {};

            // Check if address_id exists before making the request
            if (property.address_id) {
              const addressResponse = await axios.get(
                `${apiUrl}/get-address/${property.address_id}`
              );

              // If the request succeeds, assign newAddress and oldAddress
              newAddress = addressResponse.data.newAddress || {};
              oldAddress = addressResponse.data.oldAddress || {};
            } else {
              // If no address_id, log a message or handle appropriately
              //   console.warn(
              //     `No address_id for property with 매물ID: ${property.매물ID}`
              //   );
            }
            // Display contact JSON
            let contacts = {};
            if (property.연락처) {
              try {
                contacts = JSON.parse(JSON.parse(property.연락처));
              } catch (error) {
                console.error('Error parsing 연락처:', error);
              }
            }

            const mappedContacts = {};
            const roles = ['매도인', '매수인', '부동산'];

            // Dynamically map the contacts based on the role (매도인, 매수인, 부동산, etc.)
            for (const role in contacts) {
              if (contacts.hasOwnProperty(role)) {
                const contactInfo = contacts[role];
                if (
                  role === '매도인' ||
                  role === '매수인' ||
                  role === '부동산'
                ) {
                  // Dynamically assign 이름 and 전화번호 to corresponding fields
                  mappedContacts[`${role}이름`] = contactInfo.이름 || '';
                  mappedContacts[`${role}전화번호`] =
                    contactInfo.전화번호 || '';
                } else {
                  roles.forEach((ro) => {
                    const contactInfo = contacts[role]; // If role is missing, default to an empty object
                    mappedContacts[`${ro}이름`] = contactInfo.이름 || '';
                    mappedContacts[`${ro}전화번호`] =
                      contactInfo.전화번호 || '';
                  });
                }
              }
            }

            return {
              순번: index + 1,
              ...property,
              ...mappedContacts, // Spread the dynamically created contact fields into the property object
              ...newAddress, // Include new address in the property object
              ...oldAddress, // Include old address in the property object
            };
          } catch (addressError) {
            console.error('Error fetching address:', addressError);
            return property; // Return property as is if address fetching fails
          }
        })
      );

      setPropertyData(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [updateData]);

  const handleDelete = async (propertyId) => {
    try {
      await axios.delete(`${apiUrl}/delete-property/${propertyId}`);
      alert('Property deleted successfully!');

      // Fetch updated data after deletion
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property.');
    }
  };

  const onCellValueChanged = async (params) => {
    const { data, colDef, newValue } = params;
    const propertyId = data.매물ID;
    const field = colDef.field;
    // If the field is part of the JSON data, update it accordingly
    if (
      [
        '매도인이름',
        '매도인전화번호',
        '매수인이름',
        '매수인전화번호',
        '부동산이름',
        '부동산전화번호',
      ].includes(field)
    ) {
      const updatedContacts = {
        ...JSON.parse(data.contacts_json),
        매도인: {
          이름: field === '매도인이름' ? newValue : data.매도인이름,
          전화번호: field === '매도인전화번호' ? newValue : data.매도인전화번호,
        },
        매수인: {
          이름: field === '매수인이름' ? newValue : data.매수인이름,
          전화번호: field === '매수인전화번호' ? newValue : data.매수인전화번호,
        },
        부동산: {
          이름: field === '부동산이름' ? newValue : data.부동산이름,
          전화번호: field === '부동산전화번호' ? newValue : data.부동산전화번호,
        },
      };

      try {
        await axios.put(`http://localhost:8000/update-property/${propertyId}`, {
          contacts_json: JSON.stringify(updatedContacts), // Update JSON in the database
        });
        alert('Property updated successfully!');
      } catch (error) {
        console.error('Error updating property:', error);
        alert('Error updating property.');
      }
    } else {
      // Handle other non-JSON fields normally
      try {
        await axios.put(`http://localhost:8000/update-property/${propertyId}`, {
          [field]: newValue,
        });
        alert('Property updated successfully!');
      } catch (error) {
        console.error('Error updating property:', error);
      }
    }
  };

  const [colDefs, setColDefs] = useState([
    { headerName: '순번', field: '순번', editable: false },
    { headerName: '등록일자', field: '등록일자', editable: true },
    { headerName: '사용승인일자', field: '사용승인일자', editable: true },
    {
      headerName: '부동산 구분',
      field: '부동산구분',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['아파트', '오피스텔', '상가', '주택'],
      },
    },
    {
      headerName: '거래 방식',
      field: '거래방식',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['매매', '전세', '월세'],
      },
    },
    {
      headerName: '거래 완료 여부',
      field: '거래완료여부',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['완료', '미완료'],
      },
    },
    { headerName: '거래 완료 일자', field: '거래완료일자', editable: true },
    { headerName: '담당자', field: '담당자', editable: true },
    {
      headerName: '구주소',
      children: [
        { field: '시군구', headerName: '시군구', editable: true },
        { field: '읍면동', headerName: '읍 / 면 / 동', editable: true },
        { field: '리명', headerName: '리명', editable: true },
        { field: '지번본번', headerName: '지번본번', editable: true },
        { field: '지번부번', headerName: '지번부번', editable: true },
      ],
    },
    {
      headerName: '신 주소',
      children: [
        { field: '시군구', headerName: '시군구', editable: true },
        { field: '읍면', headerName: '읍면', editable: true },
        { field: '도로명', headerName: '도로명', editable: true },
        { field: '건물번호본번', headerName: '건물번호본번', editable: true },
        { field: '건물번호부번', headerName: '건물번호부번', editable: true },
      ],
    },
    { headerName: '상세주소', field: '상세주소', editable: true },
    { headerName: '건물명', field: '건물명', editable: true },
    { headerName: '동', field: '동', editable: true },
    { headerName: '호수', field: '호수', editable: true },
    { headerName: '보증금', field: '보증금', editable: true },
    { headerName: '월세', field: '월세', editable: true },
    { headerName: '관리비', field: '관리비', editable: true },
    {
      headerName: '면적(m2)',
      children: [
        { field: '전체m2', headerName: '전체', editable: true },
        { field: '전용m2', headerName: '전용', editable: true },
      ],
    },
    {
      headerName: '면적(평)',
      children: [
        { field: '전체평', headerName: '전체', editable: true },
        { field: '전용평', headerName: '전용', editable: true },
      ],
    },
    {
      headerName: 'EV 유무',
      field: 'EV유무',
      editable: true,
      cellRenderer: CheckboxRenderer,
    },
    { headerName: '화장실 개수', field: '화장실개수', editable: true },
    { field: '층수', headerName: '층 수', editable: true },
    { headerName: '주차 가능 대수', field: '주차가능대수', editable: true },
    { headerName: '비밀번호', field: '비밀번호', editable: false },
    {
      headerName: '매도인(임대인) 정보',
      children: [
        { field: '매도인이름', headerName: '이름', editable: true },
        { field: '매도인전화번호', headerName: '휴대폰 번호', editable: true },
      ],
    },
    {
      headerName: '매수인(임차인) 정보',
      children: [
        { field: '매수인이름', headerName: '이름', editable: true },
        { field: '매수인전화번호', headerName: '휴대폰 번호', editable: true },
      ],
    },
    {
      headerName: '부동산 정보',
      children: [
        { field: '부동산이름', headerName: '이름', editable: true },
        { field: '부동산전화번호', headerName: '휴대폰 번호', editable: true },
      ],
    },
    { headerName: '메모', field: '메모', editable: true },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: DeleteButtonRenderer,
    },
  ]);

  const defaultColDef = {
    minWidth: 100,
    flex: 1,
  };

  return (
    <div className='ag-theme-quartz' style={{ width: '100%', height: '60vh' }}>
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
