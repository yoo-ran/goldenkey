// constants.js

// 부동산구분 (Property Types)
const PROPERTY_TYPES = ['아파트', '빌라', '오피스텔', '주택', '원룸'];

// 거래방식
const TRANSACTION_METHOD = ['매매', '월세', '전세'];

// 거래 상태
const TRANSACTION_STATUS = ['거래 중', '거래 완료'];


// Export the constants so they can be imported into other files
module.exports = {
    PROPERTY_TYPES,
    TRANSACTION_METHOD,
    TRANSACTION_STATUS,
};
