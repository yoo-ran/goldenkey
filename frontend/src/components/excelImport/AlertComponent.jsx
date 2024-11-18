import React from 'react';

const AlertComponent = ({
  propertyId,
  columnName,
  dbValue,
  excelValue,
  onConfirm,
  onCancel,
}) => {
  console.log('AlertComponent', propertyId);
  return (
    <div className='absolute z-50 flexCol gap-y-8 bg-white border border-primary-yellow rounded-lg p-6'>
      <h1>업데이트 확인 필요</h1>
      <div className='w-full flexCol items-start gap-y-12 bg-secondary-yellow p-4 rounded-lg'>
        <p>
          매물번호 <strong>{propertyId}</strong> 의{' '}
          <strong>{columnName}</strong> 값이 다릅니다
        </p>
        <div className='flexCol items-start gap-y-6'>
          <p>
            <strong>데이터베이스 값:</strong> {JSON.stringify(dbValue)}
          </p>
          <p>
            <strong>엑셀 값:</strong> {JSON.stringify(excelValue)}
          </p>
        </div>
      </div>
      <p>데이터베이스 값을 Excel 값으로 덮어쓰시겠습니까?</p>

      <div className='w-full flexRow justify-end gap-x-4'>
        <button
          onClick={onCancel}
          className='bg-secondary-light px-4 py-3 rounded-lg mobile_3'
        >
          유지하기
        </button>
        <button
          onClick={onConfirm}
          className='bg-primary text-primary-yellow px-4 py-3 rounded-lg mobile_3'
        >
          덮어쓰기
        </button>
      </div>
    </div>
  );
};

export default AlertComponent;
