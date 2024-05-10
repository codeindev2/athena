import axios from 'axios';
import { cookies } from 'next/headers';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});



