// src/components/Home.jsx
import { useNavigate } from 'react-router-dom';

import apartmentImg from '../assets/home/apartment.jpg';
import houseImg from '../assets/home/house.jpg';
import officeTellImg from '../assets/home/officetell.jpg';
import oneroomImg from '../assets/home/oneroom.jpg';

const propertyType = [
  { type: '원룸 / 투룸', typeDescrp: '주택, 빌라, 오피스텔', img: oneroomImg },
  { type: '오피스텔', typeDescrp: '오피스텔 정보', img: officeTellImg },
  {
    type: '아파트',
    typeDescrp: '아파트 단지 정보, 실거래가',
    img: apartmentImg,
  },
  { type: '주택, 빌라', typeDescrp: '주택, 빌라, 다세대', img: houseImg },
];

const recommendTag = [
  '무거동 전세',
  '대공원 호반베르디움',
  '두왕동매매',
  '선암동매매',
  '야음동전세',
  '옥동매매',
  '쌍용 스윗닷홈',
  '신정2동 아파트',
];

const Home = () => {
  const navigate = useNavigate(); // Hook for navigation

  const handleFilterPropertyType = (type) => {
    navigate('/search', { state: type });
  };

  return (
    <main className='w-full  lg:w-8/12 gap-y-10 z-30'>
      {/* 추천태그 */}
      <section className='w-11/12 lg:w-10/12 flexCol gap-y-4'>
        <h2 className='w-full'>추천태그</h2>
        <article className='w-full flexRow flex-wrap gap-3 mobile_5_bold text-primary'>
          {recommendTag.map((tag, index) => (
            <button
              key={index}
              className='bg-secondary-blue rounded px-3 py-2 hover:bg-secondary-yellow hover:text-primary-orange'
            >
              {tag}
            </button>
          ))}
        </article>
      </section>

      {/* Property Type */}
      <section className='w-11/12 lg:w-10/12'>
        <article className='grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-6'>
          {propertyType.map((item, id) => (
            <button
              key={id}
              style={{ backgroundImage: `url(${item.img})` }}
              onClick={() => handleFilterPropertyType(item.type)}
              className='relative overflow-hidden flexCol w-full lg: bg-cover bg-center rounded-3xl px-2 py-14 lg:py-20'
            >
              <p className='absolute bg-black w-full h-full bg-opacity-50'></p>
              <div className='border-l-8 pl-2 border-primary-yellow w-10/12 z-40 flexCol items-start gap-y-2 mobile_3_bold pl-8'>
                <p className='text-primary-yellow '>{item.type}</p>
                <span className='text-white'>{item.typeDescrp}</span>
              </div>
            </button>
          ))}
        </article>
      </section>

      {/* 최근 검색한 매물 */}
      {/* <section className='w-11/12 flexCol gap-y-4'>
        <h2 className='flexRow gap-x-4 w-full'>
          최근 검색한 매물
          <FontAwesomeIcon icon={faChevronRight} />
        </h2>
        <article className='w-full grid grid-cols-3 lg:grid-cols-4 gap-x-3 lg:gap-x-5'>
          {properties.slice(0, 3).map((item, id) => {
            const { 매물ID: propertyId } = item; // Assuming '순번' is the unique property ID
            const images = propertyImages[propertyId] || []; // Get images for this property
            return (
              <div
                key={id}
                style={{ backgroundImage: `url(${apiUrl}${images[id]})` }}
                className='w-full aspect-square bg-cover bg-center rounded-2xl '
              >
                <div className='w-full aspect-square flexRow items-start justify-end mobile_3_bold text-white '>
                  <div className='bg-secondary-light p-2 m-2 aspect-square rounded-full'>
                    <FontAwesomeIcon icon={faHeart} className='text-primary' />
                  </div>
                </div>
              </div>
            );
          })}
        </article>
      </section> */}
    </main>
  );
};

export default Home;
