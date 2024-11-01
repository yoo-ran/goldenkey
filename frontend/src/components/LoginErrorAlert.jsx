import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginErrorAlert() {
  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <div className='absolute  h-1/2 bg-red-200'>
      <p>alert</p>
    </div>
  );
}

export default LoginErrorAlert;
