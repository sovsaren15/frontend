import { Font } from '@react-pdf/renderer';
import { kantumruyProBase64 } from '../pages-teacher/score/KantumruyPro';

Font.register({
  family: 'Kantumruy Pro',
  src: `data:font/ttf;base64,${kantumruyProBase64}`
});