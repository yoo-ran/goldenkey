// src/components/User.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faHeart as faSolidHeart,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faRegularHeart } from '@fortawesome/free-regular-svg-icons';
import { useLocation } from 'react-router-dom';

import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

const Search = ({ searchTerm }) => {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [propertyId, setPropertyId] = useState();

  const [currentPage, setCurrentPage] = useState(1); // State to manage the current page
  const propertiesPerPage = 6; // Number of properties to display per page (adjust as needed)

  const [properties, setProperties] = useState([]);
  const [propertyImages, setPropertyImages] = useState({}); // Store images by property ID
  const [filteredProperties, setFilteredProperties] = useState([]);
  const location = useLocation(); // Retrieve the state (data) from navigation
  const rangeValues =
    location.state && location.state.transactionMethod
      ? location.state
      : {
          transactionMethod: [],
          depositRange: [], // Array of objects with {transactionMethod, min, max}
          rentRange: [], // Array of objects with {transactionMethod, min, max}
          roomSizeRange: { min: 10, max: 60 },
          approvalDate: '',
          isParking: false,
          isEV: false,
        };

  const typeFromHome =
    location.state && typeof location.state === 'string' ? location.state : '';

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get('http://localhost:8000/listing');
        const propertyList = response.data;
        setProperties(propertyList);

        // Fetch images for each property
        for (const property of propertyList) {
          const { 매물ID: propertyId } = property; // Assuming property ID is in '매물ID' field
          try {
            const imgRes = await axios.get(
              `http://localhost:8000/properties/${propertyId}/images`
            );
            // Store images for each property using its ID
            if (Array.isArray(imgRes.data.images)) {
              setPropertyImages((prev) => ({
                ...prev,
                [propertyId]: imgRes.data.images,
              }));
            } else {
              console.error('Unexpected response structure:', imgRes.data);
            }
          } catch (imageError) {
            console.error(
              `Error fetching images for property ${propertyId}:`,
              imageError
            );
          }
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    const filterProperties = () => {
      const filtered = properties.filter((property) => {
        const matchesSelectedMethod =
          !rangeValues.transactionMethod.length ||
          rangeValues.transactionMethod.includes(property.거래방식);

        const withinDepositRange =
          !rangeValues.depositRange.length ||
          rangeValues.depositRange.some((range) => {
            const method = Object.keys(range)[0];
            const { min, max } = range[method];
            return (
              rangeValues.transactionMethod.includes(method) &&
              property.보증금 / 10000 >= min &&
              property.보증금 / 10000 <= max
            );
          });

        const withinRentRange =
          !rangeValues.rentRange.length ||
          ['월세', '전세'].includes(property.거래방식)
            ? rangeValues.rentRange.some((range) => {
                const method = Object.keys(range)[0];
                const { min, max } = range[method];
                return (
                  rangeValues.transactionMethod.includes(method) &&
                  property.월세 / 10000 >= min &&
                  property.월세 / 10000 <= max
                );
              })
            : true;

        const withinRoomSizeRange =
          (!rangeValues.roomSizeRange.min && !rangeValues.roomSizeRange.max) ||
          (property.전용평 >= rangeValues.roomSizeRange.min &&
            property.전용평 <= rangeValues.roomSizeRange.max);

        const haveParking =
          rangeValues.isParking === false || property.주차가능대수 > 0;

        const haveElevator =
          rangeValues.isEV === false || property.EV유무 === 1;

        const isWithinApprovalDateRange = (() => {
          if (!rangeValues.approvalDate) return true;
          const currentYear = new Date().getFullYear();
          const approvalYear = new Date(property.사용승인일자).getFullYear();
          const yearDifference = currentYear - approvalYear;

          switch (rangeValues.approvalDate) {
            case '5년 이내':
              return yearDifference <= 5;
            case '10년 이내':
              return yearDifference <= 10;
            case '15년 이내':
              return yearDifference <= 15;
            case '15년 이상':
              return yearDifference > 15;
            default:
              return true;
          }
        })();

        return (
          matchesSelectedMethod &&
          withinDepositRange &&
          withinRentRange &&
          withinRoomSizeRange &&
          haveParking &&
          haveElevator &&
          isWithinApprovalDateRange
        );
      });

      setFilteredProperties(filtered);

      filterProperties();
    };
  }, [properties, rangeValues]);

  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;

  // Slice the properties array to get only the ones for the current page
  const currentProperties = (
    filteredProperties.length > 0 ? filteredProperties : properties
  ).slice(indexOfFirstProperty, indexOfLastProperty);

  // Determine the total number of pages
  const totalPages = Math.ceil(
    (filteredProperties.length > 0
      ? filteredProperties.length
      : properties.length) / propertiesPerPage
  );

  // Handler for changing the page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatToKoreanCurrency = (number) => {
    const adjustedNumber = Math.floor(number / 10000); // Adjust the number by trimming 4 zeros (dividing by 10,000)

    const billion = Math.floor(adjustedNumber / 10000); // Extract the 억 (billion) part
    const remainder = adjustedNumber % 10000; // The remainder after dividing by 억
    const thousand = Math.floor(remainder / 1000); // Extract the 천 (thousand) part

    let result = '';

    if (billion > 0) {
      result += `${billion}억`;
    }

    if (thousand > 0) {
      result += ` ${thousand}천`;
    }

    if (!result) {
      result = adjustedNumber.toString(); // Return the adjusted number if it's less than 1억 and 1천
    }

    return result.trim(); // Return the formatted string, removing any unnecessary spaces
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      if (searchTerm) {
        try {
          const response = await axios.get(
            `${apiUrl}/search-address?q=${searchTerm}`
          );
          const { addressIds } = response.data;
          console.log(addressIds);
          // Initialize filtered properties
          let filtered = [];

          // Case 1: Filter by addressIds if they are returned (meaning it's a 주소)
          if (addressIds.length > 0 && properties.length > 0) {
            filtered = properties.filter(
              (property) => addressIds.includes(property.address_id) // Assuming `address_id` is the correct field
            );
          }

          // Case 2: If no addressIds (meaning searchTerm might be 건물명), filter by 건물명
          if (addressIds.length === 0) {
            filtered = properties.filter(
              (property) =>
                property.건물명 && property.건물명.includes(searchTerm) // Filter by 건물명
            );
          }

          // Set filtered properties if there are matches, otherwise show all properties
          setFilteredProperties(filtered.length > 0 ? filtered : properties);
        } catch (error) {
          console.error('Error fetching addresses:', error);
        }
      }
    };

    fetchAddresses();
  }, [searchTerm]);

  useEffect(() => {
    const filtered = properties.filter((property) => {
      // Filter by 부동산구분 based on the value of typeFromHome
      const matchesTypeFromHome = (() => {
        if (typeFromHome === '원룸 / 투룸') {
          // Return true if 부동산구분 is either 원룸 or 투룸
          return (
            property.부동산구분 === '원룸' || property.부동산구분 === '투룸'
          );
        } else if (typeFromHome === '아파트') {
          // Return true if 부동산구분 is 아파트
          return property.부동산구분 === '아파트';
        } else if (typeFromHome === '주택, 빌라') {
          // Return true if 부동산구분 is 주택 or 빌라
          return (
            property.부동산구분 === '주택' || property.부동산구분 === '빌라'
          );
        } else if (typeFromHome === '오피스텔') {
          // Return true if 부동산구분 is 오피스텔
          return property.부동산구분 === '오피스텔';
        } else {
          // If typeFromHome does not match any condition, return false
          return false;
        }
      })();

      // Return true if the 부동산구분 matches the typeFromHome
      return matchesTypeFromHome;
    });

    setFilteredProperties(filtered); // Update the filtered properties state
  }, [typeFromHome]);

  const fetchFavoriteIds = async () => {
    try {
      const response = await axios.get('http://localhost:8000/get-favorites', {
        withCredentials: true,
      });
      if (response.status === 200) {
        setFavoriteIds(response.data.favorites); // Ensure 'favorites' is an array
      }
    } catch (error) {
      console.error('Error fetching favorite IDs:', error);
    }
  };

  useEffect(() => {
    fetchFavoriteIds();
  }, []);

  const heartClick = async (pId) => {
    setFavoriteIds((prevArr) => {
      let updatedFavorites;

      if (prevArr.includes(pId)) {
        // Remove the id if it exists
        updatedFavorites = prevArr.filter((id) => id !== pId);
      } else {
        // Add the id if it doesn't exist
        updatedFavorites = [...prevArr, pId];
      }

      // Send the updated favorites to the backend
      saveFavoriteIds(updatedFavorites);

      return updatedFavorites;
    });
  };

  const saveFavoriteIds = async (updatedFavorites) => {
    try {
      const response = await axios.post(
        `${apiUrl}/save-favorites`,
        {
          favorites: updatedFavorites,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        // console.log('Favorites saved successfully');
      } else {
        console.error('Failed to save favorites');
      }
    } catch (error) {
      console.error('Error saving favorite IDs:', error);
    }
  };

  return (
    <main className='w-full gap-y-16'>
      {/* 검색결과 */}
      <section className='w-11/12 flexCol gap-y-4'>
        <h2 className='w-full'>
          {filteredProperties.length > 0
            ? filteredProperties.length
            : properties.length}
          개의 검색결과
        </h2>
        <article className='w-full  grid grid-rows-6 lg:grid-rows-3 grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-8 min-h-96'>
          {(currentProperties.length > 0 ? currentProperties : properties).map(
            (property) => {
              const { 매물ID: propertyId } = property; // Assuming '매물ID' is the unique property ID
              const images = propertyImages[propertyId] || []; // Get images for this property

              return (
                <div
                  key={propertyId}
                  className='flexRow gap-x-4 lg:flexCol gap-y-4 '
                >
                  <div className='w-4/12 lg:w-full flexCol relative bg-secondary-light h-full rounded-2xl overflow-hidden'>
                    {images.length > 0 ? (
                      <img
                        src={`http://localhost:8000/${images[0]}`}
                        alt={`${property.건물명}`}
                        className='object-cover h-full'
                      />
                    ) : (
                      <p className=' flexCol text-center mobile_5 lg:min-h-48 '>
                        No images available
                      </p>
                    )}
                    <div
                      onClick={() => heartClick(propertyId)}
                      className='absolute top-1 right-1'
                    >
                      <FontAwesomeIcon
                        icon={faRegularHeart}
                        className='absolute top-0 right-0 text-primary border border-white p-1 rounded-full mobile_5'
                      />
                      {favoriteIds.includes(propertyId) ? (
                        <FontAwesomeIcon
                          icon={faSolidHeart}
                          className='absolute top-0 right-0 border border-white p-1 rounded-full mobile_5 text-primary-yellow'
                        />
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                  <div className='flexCol items-start w-8/12 gap-y-4 lg:w-11/12'>
                    {/* <p className='mobile_1_bold'>{property.거래방식}</p> */}
                    <p className='mobile_1_bold'>
                      {property.거래방식}{' '}
                      {property.거래방식 === '매매'
                        ? formatToKoreanCurrency(property.보증금)
                        : `${Math.floor(
                            property.보증금 / 10000
                          )} / ${formatToKoreanCurrency(property.월세)}`}
                    </p>
                    <div>
                      <ul className='flexRow mobile_5'>
                        <li>{property.부동산구분}</li>
                        <li>|</li>
                        <li>{property.건물명}</li>
                      </ul>
                      <ul className='flexRow gap-x-1 mobile_5'>
                        <li>
                          {property.전체m2}m<sup>2</sup>,
                        </li>
                        <li>관리비 {property.관리비}원</li>
                      </ul>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </article>
        <div className='flex justify-center mt-4'>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className='px-4 py-2 mx-1 border border-primary-yellow text-primary rounded'
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-4 py-2 mx-1 border rounded  ${
                currentPage === index + 1
                  ? 'bg-primary-yellow'
                  : 'bg-secondary-light'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='px-4 py-2 mx-1 border border-primary-yellow text-primary rounded'
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </section>

      {/* 추천물건 */}
      <section className='w-full relative bg-primary-yellow flexCol gap-y-4 py-10 px-2 overflow-hidden'>
        <h2 className='w-11/12 text-white'>추천물건</h2>

        <div className='absolute top-1/2 z-30 w-full lg:w-11/12 flexRow justify-between px-1 mobile_1_bold'>
          <div className='swiper-button-prev text-primary'>
            <FontAwesomeIcon icon={faChevronLeft} />
          </div>
          <div className='swiper-button-next  text-primary'>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Scrollbar]}
          // pagination={{ clickable: true }} // Show pagination dots
          scrollbar={{ draggable: true }} // Enable draggable scrollbar
          className='w-11/12 lg:w-10/12 '
          breakpoints={{
            // when window width is >= 640px
            0: {
              slidesPerView: 2, // 2 slides on mobile
              spaceBetween: 10, // Smaller gap on mobile
            },
            // when window width is >= 1024px
            1023: {
              slidesPerView: 4, // 4 slides on desktop
              spaceBetween: 20, // Smaller gap on mobile
            },
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
        >
          {properties.map((property) => {
            if (favoriteIds.includes(property.매물ID)) {
              const { 매물ID: propertyId } = property; // Assuming '매물ID' is the unique property ID
              const images = propertyImages[propertyId] || []; // Get images for this property

              return (
                <SwiperSlide key={propertyId}>
                  <article className='flexCol justify-between gap-y-4  bg-white rounded-3xl px-2 py-3 lg:px-3'>
                    {/* Property Images */}
                    {images.length > 0 ? (
                      <div
                        style={{
                          backgroundImage: `url(http://localhost:8000/${images[0]})`,
                        }}
                        className='w-full bg-cover bg-center rounded-2xl flex justify-end p-2 min-h-32 lg:min-h-44'
                      ></div>
                    ) : (
                      <p className='bg-secondary-light text-center py-4 rounded-lg min-h-32 lg:min-h-44 flexCol'>
                        No images available
                      </p>
                    )}
                    <div
                      onClick={() => heartClick(propertyId)}
                      className='absolute top-5 right-3'
                    >
                      <FontAwesomeIcon
                        icon={faRegularHeart}
                        className='absolute top-0 right-0 text-primary border border-white p-1 rounded-full mobile_5'
                      />
                      {favoriteIds.includes(propertyId) ? (
                        <FontAwesomeIcon
                          icon={faSolidHeart}
                          className='absolute top-0 right-0 p-1 border border-white p-1 rounded-full mobile_5 text-primary-yellow'
                        />
                      ) : (
                        ''
                      )}
                    </div>
                    {/* Property Details */}
                    <div className='flexCol items-start w-full gap-y-4'>
                      <div className='flexCol items-start gap-y-2 '>
                        <p className='mobile_1_bold'>
                          {property.거래방식} &nbsp;
                          {property.거래방식 === '매매'
                            ? formatToKoreanCurrency(property.보증금)
                            : property.보증금 / property.월세}
                        </p>
                        <p className='mobile_3'>{property.건물명}</p>
                      </div>
                      <ul className='flexRow gap-x-1 mobile_5 text-secondary'>
                        <li>{property.전체평}평형 •</li>
                        <li>{property.담당자}</li>
                      </ul>
                    </div>
                  </article>
                </SwiperSlide>
              );
            }
          })}
        </Swiper>
      </section>
    </main>
  );
};

export default Search;
