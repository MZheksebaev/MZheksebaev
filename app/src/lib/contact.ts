import { Linking } from 'react-native';
import { company } from '../constants/company';

export const callCompany = () => Linking.openURL(`tel:${company.phoneRaw}`);

export const openWhatsApp = (text = '') =>
  Linking.openURL(`https://wa.me/${company.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`);

export const openEmail = (subject = '', body = '') =>
  Linking.openURL(
    `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  );

export const openMap = () => Linking.openURL(company.twoGis);

export const openWebsite = () => Linking.openURL(company.website);
