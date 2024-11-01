import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = ({ isAuthenticated }) => {
  const location = useLocation(); // Get the current location
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`font-head w-full z-50 ${
        isAuthenticated ? 'relative' : 'hidden'
      }`}
    >
      <nav className='flexCol  relative'>
        <ul
          className={`w-full absolute md:static md:pt-4 md:flex-row  divide-y-[0.1rem] md:divide-y-0 divide-secondary flexCol text-center mobile_3_bold bg-primary transition-[all] ${
            open ? ' top-16' : '-top-64'
          }`}
        >
          <li className={`w-full`}>
            <Link
              to='/'
              className={`block w-full py-4 md:rounded-t-xl  transition-all ${
                location.pathname === '/'
                  ? 'text-primary-yellow md:text-primary bg-secondary md:bg-primary-yellow'
                  : 'text-primary-yellow'
              }`}
              onClick={() => setOpen(false)}
            >
              홈
            </Link>
          </li>
          <li className='hidden md:block border-r border-primary-yellow h-9'></li>
          <li className={`w-full`}>
            <Link
              to='/search'
              className={`block w-full py-4 flexCol md:rounded-t-xl transition-all ${
                location.pathname === '/search'
                  ? 'text-primary-yellow md:text-primary bg-secondary md:bg-primary-yellow'
                  : 'text-primary-yellow'
              }`}
              onClick={() => setOpen(false)}
            >
              매물 검색
            </Link>
          </li>
          <li className='hidden md:block border-r border-primary-yellow h-9'></li>
          <li className={`w-full`}>
            <Link
              to='/upload'
              className={`block w-full py-4 flexCol md:rounded-t-xl transition-all ${
                location.pathname === '/upload'
                  ? 'text-primary-yellow md:text-primary bg-secondary md:bg-primary-yellow'
                  : 'text-primary-yellow'
              }`}
              onClick={() => setOpen(false)}
            >
              매물 업로드
            </Link>
          </li>
          <li className='hidden md:block border-r border-primary-yellow h-9'></li>
          <li className={`w-full`}>
            <Link
              to='/importExcel'
              className={`block w-full py-4 flexCol md:rounded-t-xl transition-all ${
                location.pathname === '/importExcel'
                  ? 'text-primary-yellow md:text-primary bg-secondary md:bg-primary-yellow'
                  : 'text-primary-yellow'
              }`}
              onClick={() => setOpen(false)}
            >
              엑셀 업로드
            </Link>
          </li>
        </ul>

        {/* hamburger menu*/}
        <div className='py-5 px-5 flexRow justify-between w-full z-50 bg-white md:flex-row-reverse'>
          <div
            className='w-8/12 h-5 relative md:hidden'
            onClick={() => setOpen(!open)}
          >
            <p
              className={`bg-primary w-7 h-0.5 absolute top-0 transition-all ${
                open ? 'rotate-45 top-1/2' : ''
              }`}
            ></p>
            <p
              className={`bg-primary w-7 h-0.5 absolute top-1/2 transition-all transform -translate-y-1/2 ${
                open ? 'hidden' : ''
              }`}
            ></p>
            <p
              className={`bg-primary w-7 h-0.5 absolute bottom-0 transition-all ${
                open ? '-rotate-45 top-1/2' : ''
              }`}
            ></p>
          </div>
          <button className='hover:bg-navy transition-all bg-primary-yellow text-primary px-4 lg:py-2 rounded-lg block'>
            {isAuthenticated ? (
              <Link to='/logout'>로그아웃</Link>
            ) : (
              <Link to='/login'>로그인</Link>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
