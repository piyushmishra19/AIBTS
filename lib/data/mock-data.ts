import type { User, Bus, Route, Trip, Booking, Stop, BusType } from '@/lib/types'
import { allOperators } from './operators'

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'passenger-1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 98765 43210',
    role: 'passenger',
  },
  {
    id: 'passenger-2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '+91 98765 43211',
    role: 'passenger',
  },
  {
    id: 'driver-1',
    name: 'Suresh Kumar',
    email: 'suresh@aibts.com',
    phone: '+91 98765 43212',
    role: 'driver',
  },
  {
    id: 'driver-2',
    name: 'Ramesh Singh',
    email: 'ramesh@aibts.com',
    phone: '+91 98765 43213',
    role: 'driver',
  },
  {
    id: 'driver-3',
    name: 'Vijay Yadav',
    email: 'vijay@aibts.com',
    phone: '+91 98765 43214',
    role: 'driver',
  },
  {
    id: 'driver-4',
    name: 'Gurpreet Singh',
    email: 'gurpreet@aibts.com',
    phone: '+91 98765 43216',
    role: 'driver',
  },
  {
    id: 'driver-5',
    name: 'Harinder Kaur',
    email: 'harinder@aibts.com',
    phone: '+91 98765 43217',
    role: 'driver',
  },
  {
    id: 'admin-1',
    name: 'Amit Verma',
    email: 'admin@aibts.com',
    phone: '+91 98765 43215',
    role: 'admin',
  },
]

// Fare multipliers for different bus types
export const fareMultipliers: Record<BusType, number> = {
  'ordinary': 1,
  'express': 1.2,
  'deluxe': 1.5,
  'semi-sleeper': 1.8,
  'ac-sleeper': 2.2,
  'volvo': 2.5,
  'super-deluxe': 2.0,
}

// Mock Buses - Expanded with operators
export const mockBuses: Bus[] = [
  // Punjab Roadways Buses
  {
    id: 'bus-prtc-1',
    operatorId: 'prtc',
    registrationNumber: 'PB 01 AB 1234',
    model: 'Ashok Leyland Viking',
    busType: 'ordinary',
    capacity: 52,
    amenities: ['Water Bottle'],
    status: 'active',
  },
  {
    id: 'bus-prtc-2',
    operatorId: 'prtc',
    registrationNumber: 'PB 02 CD 5678',
    model: 'Tata Starbus Ultra',
    busType: 'deluxe',
    capacity: 45,
    amenities: ['AC', 'Water Bottle', 'Charging Points'],
    status: 'active',
  },
  {
    id: 'bus-punbus-1',
    operatorId: 'punbus',
    registrationNumber: 'PB 03 EF 9012',
    model: 'Volvo B7R',
    busType: 'volvo',
    capacity: 40,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Water Bottle', 'Entertainment'],
    status: 'active',
  },
  {
    id: 'bus-prtc-3',
    operatorId: 'prtc',
    registrationNumber: 'PB 11 MN 4321',
    model: 'Ashok Leyland Janbus',
    busType: 'express',
    capacity: 48,
    amenities: ['Water Bottle', 'Charging Points'],
    status: 'active',
  },
  {
    id: 'bus-punbus-2',
    operatorId: 'punbus',
    registrationNumber: 'PB 12 QR 7788',
    model: 'Volvo 9400 B8R',
    busType: 'volvo',
    capacity: 41,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Water Bottle', 'Entertainment'],
    status: 'active',
  },
  // Haryana Roadways Buses
  {
    id: 'bus-hrtc-1',
    operatorId: 'hrtc',
    registrationNumber: 'HR 01 GH 3456',
    model: 'Ashok Leyland',
    busType: 'ordinary',
    capacity: 54,
    amenities: ['Water Bottle'],
    status: 'active',
  },
  {
    id: 'bus-hrtc-2',
    operatorId: 'hrtc',
    registrationNumber: 'HR 02 IJ 7890',
    model: 'Tata Starbus',
    busType: 'express',
    capacity: 50,
    amenities: ['AC', 'Water Bottle'],
    status: 'active',
  },
  {
    id: 'bus-hrtc-3',
    operatorId: 'hrtc',
    registrationNumber: 'HR 55 KL 2345',
    model: 'Volvo 9400',
    busType: 'volvo',
    capacity: 40,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Water Bottle', 'Blanket'],
    status: 'active',
  },
  // UPSRTC Buses
  {
    id: 'bus-upsrtc-1',
    operatorId: 'upsrtc',
    registrationNumber: 'UP 32 MN 6789',
    model: 'Ashok Leyland',
    busType: 'ordinary',
    capacity: 56,
    amenities: ['Water Bottle'],
    status: 'active',
  },
  {
    id: 'bus-upsrtc-2',
    operatorId: 'upsrtc',
    registrationNumber: 'UP 78 OP 0123',
    model: 'Scania Metrolink',
    busType: 'volvo',
    capacity: 42,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Water Bottle', 'Blanket', 'Entertainment'],
    status: 'active',
  },
  // RSRTC Buses
  {
    id: 'bus-rsrtc-1',
    operatorId: 'rsrtc',
    registrationNumber: 'RJ 01 QR 4567',
    model: 'Tata Starbus',
    busType: 'express',
    capacity: 50,
    amenities: ['Water Bottle'],
    status: 'active',
  },
  {
    id: 'bus-rsrtc-2',
    operatorId: 'rsrtc',
    registrationNumber: 'RJ 14 ST 8901',
    model: 'Volvo B11R',
    busType: 'volvo',
    capacity: 44,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Water Bottle', 'Blanket'],
    status: 'active',
  },
  // DTC Buses
  {
    id: 'bus-dtc-1',
    operatorId: 'dtc',
    registrationNumber: 'DL 01 UV 2345',
    model: 'Ashok Leyland CNG',
    busType: 'ordinary',
    capacity: 40,
    amenities: [],
    status: 'active',
  },
  // MSRTC Buses
  {
    id: 'bus-msrtc-1',
    operatorId: 'msrtc',
    registrationNumber: 'MH 01 WX 6789',
    model: 'Shivneri Volvo',
    busType: 'volvo',
    capacity: 43,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Water Bottle', 'Snacks'],
    status: 'active',
  },
  {
    id: 'bus-msrtc-2',
    operatorId: 'msrtc',
    registrationNumber: 'MH 12 YZ 0123',
    model: 'Ashok Leyland',
    busType: 'express',
    capacity: 50,
    amenities: ['Water Bottle'],
    status: 'active',
  },
  // KSRTC Buses
  {
    id: 'bus-ksrtc-1',
    operatorId: 'ksrtc',
    registrationNumber: 'KA 01 AA 4567',
    model: 'Volvo Multi-Axle',
    busType: 'volvo',
    capacity: 44,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Entertainment', 'Blanket'],
    status: 'active',
  },
  {
    id: 'bus-ksrtc-2',
    operatorId: 'ksrtc',
    registrationNumber: 'KA 19 BB 8901',
    model: 'Airavat Club Class',
    busType: 'super-deluxe',
    capacity: 38,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Entertainment', 'Blanket', 'Water Bottle', 'Snacks'],
    status: 'active',
  },
  // TNSTC Buses
  {
    id: 'bus-tnstc-1',
    operatorId: 'tnstc',
    registrationNumber: 'TN 01 CC 2345',
    model: 'Ashok Leyland',
    busType: 'express',
    capacity: 52,
    amenities: ['Water Bottle'],
    status: 'active',
  },
  // APSRTC Buses
  {
    id: 'bus-apsrtc-1',
    operatorId: 'apsrtc',
    registrationNumber: 'AP 39 DD 6789',
    model: 'Garuda Plus',
    busType: 'volvo',
    capacity: 44,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Entertainment', 'Blanket'],
    status: 'active',
  },
  // TSRTC Buses
  {
    id: 'bus-tsrtc-1',
    operatorId: 'tsrtc',
    registrationNumber: 'TS 01 EE 0123',
    model: 'Super Luxury',
    busType: 'deluxe',
    capacity: 45,
    amenities: ['AC', 'Charging Points', 'Water Bottle'],
    status: 'active',
  },
  // GSRTC Buses
  {
    id: 'bus-gsrtc-1',
    operatorId: 'gsrtc',
    registrationNumber: 'GJ 01 FF 4567',
    model: 'Volvo B9R',
    busType: 'volvo',
    capacity: 40,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Water Bottle'],
    status: 'active',
  },
  // Private Operators
  {
    id: 'bus-vrl-1',
    operatorId: 'vrl',
    registrationNumber: 'KA 25 GG 8901',
    model: 'Volvo Multi-Axle Sleeper',
    busType: 'ac-sleeper',
    capacity: 36,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Blanket', 'Water Bottle', 'Entertainment'],
    status: 'active',
  },
  {
    id: 'bus-hans-1',
    operatorId: 'hans',
    registrationNumber: 'PB 10 HH 2345',
    model: 'Volvo B11R',
    busType: 'volvo',
    capacity: 40,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Water Bottle', 'Snacks'],
    status: 'active',
  },
  {
    id: 'bus-hans-2',
    operatorId: 'hans',
    registrationNumber: 'PB 10 HT 7788',
    model: 'Bharat Benz Sleeper',
    busType: 'semi-sleeper',
    capacity: 36,
    amenities: ['AC', 'Charging Points', 'Water Bottle', 'Blanket'],
    status: 'active',
  },
  {
    id: 'bus-zingbus-1',
    operatorId: 'zingbus',
    registrationNumber: 'DL 02 II 6789',
    model: 'Volvo 9600',
    busType: 'volvo',
    capacity: 41,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Entertainment', 'Blanket', 'Snacks'],
    status: 'active',
  },
  {
    id: 'bus-intrcity-1',
    operatorId: 'intrcity',
    registrationNumber: 'HR 26 JJ 0123',
    model: 'Mercedes Benz Multi-Axle',
    busType: 'super-deluxe',
    capacity: 38,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Entertainment', 'Blanket', 'Water Bottle', 'Snacks'],
    status: 'active',
  },
  {
    id: 'bus-neeta-1',
    operatorId: 'neeta',
    registrationNumber: 'MH 04 KK 4567',
    model: 'Volvo B11R Sleeper',
    busType: 'ac-sleeper',
    capacity: 30,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Blanket', 'Water Bottle'],
    status: 'active',
  },
  {
    id: 'bus-orange-1',
    operatorId: 'orange',
    registrationNumber: 'TS 07 LL 8901',
    model: 'Scania Multi-Axle',
    busType: 'ac-sleeper',
    capacity: 32,
    amenities: ['AC', 'WiFi', 'Charging Points', 'Entertainment', 'Blanket'],
    status: 'active',
  },
]

// ============= ROUTE STOPS =============

// Punjab Routes
const chandigarhAmritsarStops: Stop[] = [
  { id: 'chdamr-1', name: 'Chandigarh ISBT Sector 43', lat: 30.7046, lng: 76.8010, arrivalOffset: 0 },
  { id: 'chdamr-2', name: 'Mohali Phase 8', lat: 30.7137, lng: 76.7041, arrivalOffset: 15 },
  { id: 'chdamr-3', name: 'Kharar', lat: 30.7464, lng: 76.6460, arrivalOffset: 30 },
  { id: 'chdamr-4', name: 'Ludhiana', lat: 30.9010, lng: 75.8573, arrivalOffset: 90 },
  { id: 'chdamr-5', name: 'Jalandhar', lat: 31.3260, lng: 75.5762, arrivalOffset: 150 },
  { id: 'chdamr-6', name: 'Amritsar ISBT', lat: 31.6340, lng: 74.8723, arrivalOffset: 240 },
]

const delhiChandigarhStops: Stop[] = [
  { id: 'delchd-1', name: 'Delhi ISBT Kashmere Gate', lat: 28.6675, lng: 77.2284, arrivalOffset: 0 },
  { id: 'delchd-2', name: 'Karnal', lat: 29.6857, lng: 76.9905, arrivalOffset: 90 },
  { id: 'delchd-3', name: 'Kurukshetra', lat: 29.9695, lng: 76.8783, arrivalOffset: 120 },
  { id: 'delchd-4', name: 'Ambala', lat: 30.3782, lng: 76.7767, arrivalOffset: 165 },
  { id: 'delchd-5', name: 'Zirakpur', lat: 30.6441, lng: 76.8205, arrivalOffset: 210 },
  { id: 'delchd-6', name: 'Chandigarh ISBT Sector 43', lat: 30.7046, lng: 76.8010, arrivalOffset: 240 },
]

const delhiAmritsarStops: Stop[] = [
  { id: 'delamr-1', name: 'Delhi ISBT Kashmere Gate', lat: 28.6675, lng: 77.2284, arrivalOffset: 0 },
  { id: 'delamr-2', name: 'Panipat', lat: 29.3909, lng: 76.9635, arrivalOffset: 75 },
  { id: 'delamr-3', name: 'Karnal', lat: 29.6857, lng: 76.9905, arrivalOffset: 110 },
  { id: 'delamr-4', name: 'Ambala', lat: 30.3782, lng: 76.7767, arrivalOffset: 180 },
  { id: 'delamr-5', name: 'Ludhiana', lat: 30.9010, lng: 75.8573, arrivalOffset: 300 },
  { id: 'delamr-6', name: 'Jalandhar', lat: 31.3260, lng: 75.5762, arrivalOffset: 360 },
  { id: 'delamr-7', name: 'Amritsar ISBT', lat: 31.6340, lng: 74.8723, arrivalOffset: 450 },
]

const ludhianaDelhiStops: Stop[] = [
  { id: 'luddel-1', name: 'Ludhiana Bus Stand', lat: 30.9010, lng: 75.8573, arrivalOffset: 0 },
  { id: 'luddel-2', name: 'Khanna', lat: 30.6980, lng: 76.2235, arrivalOffset: 30 },
  { id: 'luddel-3', name: 'Ambala', lat: 30.3782, lng: 76.7767, arrivalOffset: 90 },
  { id: 'luddel-4', name: 'Karnal', lat: 29.6857, lng: 76.9905, arrivalOffset: 150 },
  { id: 'luddel-5', name: 'Panipat', lat: 29.3909, lng: 76.9635, arrivalOffset: 180 },
  { id: 'luddel-6', name: 'Delhi ISBT Kashmere Gate', lat: 28.6675, lng: 77.2284, arrivalOffset: 270 },
]

const amritsarJalandharStops: Stop[] = [
  { id: 'amrjal-1', name: 'Amritsar ISBT', lat: 31.6340, lng: 74.8723, arrivalOffset: 0 },
  { id: 'amrjal-2', name: 'Beas', lat: 31.5167, lng: 75.2833, arrivalOffset: 35 },
  { id: 'amrjal-3', name: 'Kartarpur', lat: 31.4427, lng: 75.4986, arrivalOffset: 65 },
  { id: 'amrjal-4', name: 'Jalandhar Bus Stand', lat: 31.3260, lng: 75.5762, arrivalOffset: 90 },
]

const jalandharAmritsarStops: Stop[] = [
  { id: 'jalamr-1', name: 'Jalandhar Bus Stand', lat: 31.3260, lng: 75.5762, arrivalOffset: 0 },
  { id: 'jalamr-2', name: 'Kartarpur', lat: 31.4427, lng: 75.4986, arrivalOffset: 20 },
  { id: 'jalamr-3', name: 'Beas', lat: 31.5167, lng: 75.2833, arrivalOffset: 50 },
  { id: 'jalamr-4', name: 'Amritsar ISBT', lat: 31.6340, lng: 74.8723, arrivalOffset: 90 },
]

// Haryana Routes
const hisarDelhiStops: Stop[] = [
  { id: 'hisdel-1', name: 'Hisar Bus Stand', lat: 29.1492, lng: 75.7217, arrivalOffset: 0 },
  { id: 'hisdel-2', name: 'Hansi', lat: 29.0981, lng: 75.9630, arrivalOffset: 25 },
  { id: 'hisdel-3', name: 'Jind', lat: 29.3166, lng: 76.3171, arrivalOffset: 75 },
  { id: 'hisdel-4', name: 'Rohtak', lat: 28.8955, lng: 76.6066, arrivalOffset: 120 },
  { id: 'hisdel-5', name: 'Delhi Tikri Border', lat: 28.6870, lng: 76.9330, arrivalOffset: 165 },
  { id: 'hisdel-6', name: 'Delhi ISBT Kashmere Gate', lat: 28.6675, lng: 77.2284, arrivalOffset: 195 },
]

const rewariDelhiStops: Stop[] = [
  { id: 'rewdel-1', name: 'Rewari Bus Stand', lat: 28.1953, lng: 76.6194, arrivalOffset: 0 },
  { id: 'rewdel-2', name: 'Dharuhera', lat: 28.2059, lng: 76.7979, arrivalOffset: 20 },
  { id: 'rewdel-3', name: 'Manesar', lat: 28.3595, lng: 76.9387, arrivalOffset: 45 },
  { id: 'rewdel-4', name: 'Gurugram IFFCO Chowk', lat: 28.4725, lng: 77.0720, arrivalOffset: 70 },
  { id: 'rewdel-5', name: 'Delhi ISBT Kashmere Gate', lat: 28.6675, lng: 77.2284, arrivalOffset: 105 },
]

// UP Routes
const lucknowDelhiStops: Stop[] = [
  { id: 'lucdel-1', name: 'Lucknow Alambagh ISBT', lat: 26.8199, lng: 80.9022, arrivalOffset: 0 },
  { id: 'lucdel-2', name: 'Kanpur', lat: 26.4499, lng: 80.3319, arrivalOffset: 90 },
  { id: 'lucdel-3', name: 'Etawah', lat: 26.7855, lng: 79.0158, arrivalOffset: 180 },
  { id: 'lucdel-4', name: 'Agra ISBT', lat: 27.1767, lng: 78.0081, arrivalOffset: 280 },
  { id: 'lucdel-5', name: 'Mathura', lat: 27.4924, lng: 77.6737, arrivalOffset: 330 },
  { id: 'lucdel-6', name: 'Delhi ISBT Kashmere Gate', lat: 28.6675, lng: 77.2284, arrivalOffset: 420 },
]

const varanasiLucknowStops: Stop[] = [
  { id: 'varluc-1', name: 'Varanasi Cantt', lat: 25.3176, lng: 82.9739, arrivalOffset: 0 },
  { id: 'varluc-2', name: 'Jaunpur', lat: 25.7484, lng: 82.6844, arrivalOffset: 60 },
  { id: 'varluc-3', name: 'Sultanpur', lat: 26.2648, lng: 82.0729, arrivalOffset: 120 },
  { id: 'varluc-4', name: 'Pratapgarh', lat: 25.8971, lng: 81.9420, arrivalOffset: 165 },
  { id: 'varluc-5', name: 'Lucknow Alambagh ISBT', lat: 26.8199, lng: 80.9022, arrivalOffset: 270 },
]

const agraJaipurStops: Stop[] = [
  { id: 'agrjai-1', name: 'Agra ISBT Idgah', lat: 27.1767, lng: 78.0081, arrivalOffset: 0 },
  { id: 'agrjai-2', name: 'Fatehpur Sikri', lat: 27.0945, lng: 77.6679, arrivalOffset: 45 },
  { id: 'agrjai-3', name: 'Bharatpur', lat: 27.2152, lng: 77.4890, arrivalOffset: 75 },
  { id: 'agrjai-4', name: 'Dausa', lat: 26.8843, lng: 76.3378, arrivalOffset: 150 },
  { id: 'agrjai-5', name: 'Jaipur Sindhi Camp', lat: 26.9124, lng: 75.7873, arrivalOffset: 210 },
]

// Rajasthan Routes
const jaipurUdaipurStops: Stop[] = [
  { id: 'jaiuda-1', name: 'Jaipur Sindhi Camp', lat: 26.9124, lng: 75.7873, arrivalOffset: 0 },
  { id: 'jaiuda-2', name: 'Ajmer', lat: 26.4499, lng: 74.6399, arrivalOffset: 120 },
  { id: 'jaiuda-3', name: 'Bhilwara', lat: 25.3474, lng: 74.6344, arrivalOffset: 210 },
  { id: 'jaiuda-4', name: 'Chittorgarh', lat: 24.8887, lng: 74.6269, arrivalOffset: 270 },
  { id: 'jaiuda-5', name: 'Udaipur UIT Circle', lat: 24.5854, lng: 73.7125, arrivalOffset: 390 },
]

const jaipurJodhpurStops: Stop[] = [
  { id: 'jaijod-1', name: 'Jaipur Sindhi Camp', lat: 26.9124, lng: 75.7873, arrivalOffset: 0 },
  { id: 'jaijod-2', name: 'Ajmer', lat: 26.4499, lng: 74.6399, arrivalOffset: 120 },
  { id: 'jaijod-3', name: 'Beawar', lat: 26.1013, lng: 74.3200, arrivalOffset: 160 },
  { id: 'jaijod-4', name: 'Pali', lat: 25.7711, lng: 73.3234, arrivalOffset: 240 },
  { id: 'jaijod-5', name: 'Jodhpur Raika Bagh', lat: 26.2389, lng: 73.0243, arrivalOffset: 330 },
]

// Delhi to Jaipur (keeping existing)
const delhiJaipurStops: Stop[] = [
  { id: 'stop-1', name: 'Delhi ISBT Kashmere Gate', lat: 28.6692, lng: 77.2299, arrivalOffset: 0 },
  { id: 'stop-2', name: 'Gurugram IFFCO Chowk', lat: 28.4595, lng: 77.0266, arrivalOffset: 40 },
  { id: 'stop-3', name: 'Manesar', lat: 28.3595, lng: 76.9387, arrivalOffset: 55 },
  { id: 'stop-4', name: 'Dharuhera', lat: 28.2059, lng: 76.7979, arrivalOffset: 80 },
  { id: 'stop-5', name: 'Behror', lat: 27.8896, lng: 76.2837, arrivalOffset: 135 },
  { id: 'stop-6', name: 'Kotputli', lat: 27.7029, lng: 76.1997, arrivalOffset: 165 },
  { id: 'stop-7', name: 'Jaipur Sindhi Camp', lat: 26.9124, lng: 75.7873, arrivalOffset: 280 },
]

// Mumbai Routes
const mumbaiPuneStops: Stop[] = [
  { id: 'stop-8', name: 'Mumbai Dadar', lat: 19.0178, lng: 72.8478, arrivalOffset: 0 },
  { id: 'stop-9', name: 'Vashi', lat: 19.0728, lng: 73.0169, arrivalOffset: 25 },
  { id: 'stop-10', name: 'Panvel', lat: 18.9894, lng: 73.1175, arrivalOffset: 45 },
  { id: 'stop-11', name: 'Lonavala', lat: 18.7546, lng: 73.4062, arrivalOffset: 95 },
  { id: 'stop-12', name: 'Pune Shivajinagar', lat: 18.5308, lng: 73.8475, arrivalOffset: 165 },
]

const mumbaiAhmedabadStops: Stop[] = [
  { id: 'mumahm-1', name: 'Mumbai Central Bus Station', lat: 18.9696, lng: 72.8194, arrivalOffset: 0 },
  { id: 'mumahm-2', name: 'Vapi', lat: 20.3893, lng: 72.9106, arrivalOffset: 120 },
  { id: 'mumahm-3', name: 'Surat', lat: 21.1702, lng: 72.8311, arrivalOffset: 210 },
  { id: 'mumahm-4', name: 'Vadodara', lat: 22.3072, lng: 73.1812, arrivalOffset: 330 },
  { id: 'mumahm-5', name: 'Anand', lat: 22.5645, lng: 72.9289, arrivalOffset: 390 },
  { id: 'mumahm-6', name: 'Ahmedabad Paldi', lat: 23.0225, lng: 72.5714, arrivalOffset: 480 },
]

// Karnataka Routes
const bangaloreMysoreStops: Stop[] = [
  { id: 'stop-13', name: 'Bangalore Majestic', lat: 12.9767, lng: 77.5713, arrivalOffset: 0 },
  { id: 'stop-14', name: 'Ramanagara', lat: 12.7167, lng: 77.2833, arrivalOffset: 40 },
  { id: 'stop-15', name: 'Channapatna', lat: 12.6517, lng: 77.2067, arrivalOffset: 55 },
  { id: 'stop-16', name: 'Mandya', lat: 12.5218, lng: 76.8952, arrivalOffset: 85 },
  { id: 'stop-17', name: 'Srirangapatna', lat: 12.4181, lng: 76.6947, arrivalOffset: 105 },
  { id: 'stop-18', name: 'Mysore KSRTC', lat: 12.2958, lng: 76.6394, arrivalOffset: 145 },
]

const bangaloreHyderabadStops: Stop[] = [
  { id: 'banhyd-1', name: 'Bangalore Majestic', lat: 12.9767, lng: 77.5713, arrivalOffset: 0 },
  { id: 'banhyd-2', name: 'Kurnool', lat: 15.8281, lng: 78.0373, arrivalOffset: 240 },
  { id: 'banhyd-3', name: 'Mahbubnagar', lat: 16.7488, lng: 77.9850, arrivalOffset: 360 },
  { id: 'banhyd-4', name: 'Hyderabad MGBS', lat: 17.3780, lng: 78.4837, arrivalOffset: 450 },
]

// Tamil Nadu Routes
const chennaiPondicherryStops: Stop[] = [
  { id: 'stop-19', name: 'Chennai CMBT', lat: 13.0694, lng: 80.1948, arrivalOffset: 0 },
  { id: 'stop-20', name: 'Mahabalipuram', lat: 12.6269, lng: 80.1927, arrivalOffset: 60 },
  { id: 'stop-21', name: 'Tindivanam', lat: 12.2341, lng: 79.6536, arrivalOffset: 100 },
  { id: 'stop-22', name: 'Pondicherry Bus Stand', lat: 11.9344, lng: 79.8297, arrivalOffset: 160 },
]

const chennaiBangaloreStops: Stop[] = [
  { id: 'cheban-1', name: 'Chennai CMBT', lat: 13.0694, lng: 80.1948, arrivalOffset: 0 },
  { id: 'cheban-2', name: 'Vellore', lat: 12.9165, lng: 79.1325, arrivalOffset: 90 },
  { id: 'cheban-3', name: 'Krishnagiri', lat: 12.5266, lng: 78.2141, arrivalOffset: 150 },
  { id: 'cheban-4', name: 'Hosur', lat: 12.7409, lng: 77.8253, arrivalOffset: 180 },
  { id: 'cheban-5', name: 'Bangalore Majestic', lat: 12.9767, lng: 77.5713, arrivalOffset: 240 },
]

// Andhra/Telangana Routes
const hyderabadVijayawadaStops: Stop[] = [
  { id: 'stop-23', name: 'Hyderabad MGBS', lat: 17.3780, lng: 78.4837, arrivalOffset: 0 },
  { id: 'stop-24', name: 'Nalgonda', lat: 17.0575, lng: 79.2690, arrivalOffset: 70 },
  { id: 'stop-25', name: 'Suryapet', lat: 17.1399, lng: 79.6249, arrivalOffset: 105 },
  { id: 'stop-26', name: 'Khammam', lat: 17.2473, lng: 80.1514, arrivalOffset: 165 },
  { id: 'stop-27', name: 'Vijayawada Bus Stand', lat: 16.5193, lng: 80.6305, arrivalOffset: 290 },
]

// Gujarat Routes
const ahmedabadSuratStops: Stop[] = [
  { id: 'ahmsur-1', name: 'Ahmedabad Paldi', lat: 23.0225, lng: 72.5714, arrivalOffset: 0 },
  { id: 'ahmsur-2', name: 'Nadiad', lat: 22.6916, lng: 72.8634, arrivalOffset: 45 },
  { id: 'ahmsur-3', name: 'Anand', lat: 22.5645, lng: 72.9289, arrivalOffset: 60 },
  { id: 'ahmsur-4', name: 'Vadodara', lat: 22.3072, lng: 73.1812, arrivalOffset: 105 },
  { id: 'ahmsur-5', name: 'Bharuch', lat: 21.7051, lng: 72.9959, arrivalOffset: 165 },
  { id: 'ahmsur-6', name: 'Surat', lat: 21.1702, lng: 72.8311, arrivalOffset: 240 },
]

// Kerala Routes
const kochiThiruvananthapuramStops: Stop[] = [
  { id: 'koctvm-1', name: 'Kochi Ernakulam KSRTC', lat: 9.9816, lng: 76.2999, arrivalOffset: 0 },
  { id: 'koctvm-2', name: 'Alappuzha', lat: 9.4981, lng: 76.3388, arrivalOffset: 75 },
  { id: 'koctvm-3', name: 'Kollam', lat: 8.8932, lng: 76.6141, arrivalOffset: 150 },
  { id: 'koctvm-4', name: 'Thiruvananthapuram KSRTC', lat: 8.4875, lng: 76.9525, arrivalOffset: 240 },
]

// Mock Routes - Expanded with all operators
export const mockRoutes: Route[] = [
  // Punjab Roadways Routes
  {
    id: 'route-prtc-1',
    operatorId: 'prtc',
    name: 'Chandigarh to Amritsar',
    origin: { name: 'Chandigarh', lat: 30.7046, lng: 76.8010 },
    destination: { name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
    stops: chandigarhAmritsarStops,
    distance: 230,
    estimatedDuration: 240,
    baseFare: 280,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-punbus-1',
    operatorId: 'punbus',
    name: 'Delhi to Chandigarh (Volvo)',
    origin: { name: 'Delhi', lat: 28.6675, lng: 77.2284 },
    destination: { name: 'Chandigarh', lat: 30.7046, lng: 76.8010 },
    stops: delhiChandigarhStops,
    distance: 250,
    estimatedDuration: 240,
    baseFare: 320,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-prtc-2',
    operatorId: 'prtc',
    name: 'Ludhiana to Delhi',
    origin: { name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
    destination: { name: 'Delhi', lat: 28.6675, lng: 77.2284 },
    stops: ludhianaDelhiStops,
    distance: 310,
    estimatedDuration: 270,
    baseFare: 350,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-prtc-3',
    operatorId: 'prtc',
    name: 'Amritsar to Jalandhar',
    origin: { name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
    destination: { name: 'Jalandhar', lat: 31.3260, lng: 75.5762 },
    stops: amritsarJalandharStops,
    distance: 85,
    estimatedDuration: 90,
    baseFare: 120,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-punbus-2',
    operatorId: 'punbus',
    name: 'Jalandhar to Amritsar (Volvo)',
    origin: { name: 'Jalandhar', lat: 31.3260, lng: 75.5762 },
    destination: { name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
    stops: jalandharAmritsarStops,
    distance: 85,
    estimatedDuration: 90,
    baseFare: 150,
    fareMultiplier: fareMultipliers,
  },
  // Haryana Roadways Routes
  {
    id: 'route-hrtc-1',
    operatorId: 'hrtc',
    name: 'Hisar to Delhi',
    origin: { name: 'Hisar', lat: 29.1492, lng: 75.7217 },
    destination: { name: 'Delhi', lat: 28.6675, lng: 77.2284 },
    stops: hisarDelhiStops,
    distance: 175,
    estimatedDuration: 195,
    baseFare: 200,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-hrtc-2',
    operatorId: 'hrtc',
    name: 'Rewari to Delhi',
    origin: { name: 'Rewari', lat: 28.1953, lng: 76.6194 },
    destination: { name: 'Delhi', lat: 28.6675, lng: 77.2284 },
    stops: rewariDelhiStops,
    distance: 85,
    estimatedDuration: 105,
    baseFare: 120,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-hrtc-3',
    operatorId: 'hrtc',
    name: 'Delhi to Chandigarh',
    origin: { name: 'Delhi', lat: 28.6675, lng: 77.2284 },
    destination: { name: 'Chandigarh', lat: 30.7046, lng: 76.8010 },
    stops: delhiChandigarhStops,
    distance: 250,
    estimatedDuration: 240,
    baseFare: 280,
    fareMultiplier: fareMultipliers,
  },
  // UPSRTC Routes
  {
    id: 'route-upsrtc-1',
    operatorId: 'upsrtc',
    name: 'Lucknow to Delhi',
    origin: { name: 'Lucknow', lat: 26.8199, lng: 80.9022 },
    destination: { name: 'Delhi', lat: 28.6675, lng: 77.2284 },
    stops: lucknowDelhiStops,
    distance: 500,
    estimatedDuration: 420,
    baseFare: 500,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-upsrtc-2',
    operatorId: 'upsrtc',
    name: 'Varanasi to Lucknow',
    origin: { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
    destination: { name: 'Lucknow', lat: 26.8199, lng: 80.9022 },
    stops: varanasiLucknowStops,
    distance: 320,
    estimatedDuration: 270,
    baseFare: 350,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-upsrtc-3',
    operatorId: 'upsrtc',
    name: 'Agra to Jaipur',
    origin: { name: 'Agra', lat: 27.1767, lng: 78.0081 },
    destination: { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    stops: agraJaipurStops,
    distance: 240,
    estimatedDuration: 210,
    baseFare: 280,
    fareMultiplier: fareMultipliers,
  },
  // RSRTC Routes
  {
    id: 'route-rsrtc-1',
    operatorId: 'rsrtc',
    name: 'Delhi to Jaipur',
    origin: { name: 'Delhi', lat: 28.6692, lng: 77.2299 },
    destination: { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    stops: delhiJaipurStops,
    distance: 280,
    estimatedDuration: 280,
    baseFare: 350,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-rsrtc-2',
    operatorId: 'rsrtc',
    name: 'Jaipur to Udaipur',
    origin: { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    destination: { name: 'Udaipur', lat: 24.5854, lng: 73.7125 },
    stops: jaipurUdaipurStops,
    distance: 400,
    estimatedDuration: 390,
    baseFare: 450,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-rsrtc-3',
    operatorId: 'rsrtc',
    name: 'Jaipur to Jodhpur',
    origin: { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    destination: { name: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
    stops: jaipurJodhpurStops,
    distance: 340,
    estimatedDuration: 330,
    baseFare: 380,
    fareMultiplier: fareMultipliers,
  },
  // MSRTC Routes
  {
    id: 'route-msrtc-1',
    operatorId: 'msrtc',
    name: 'Mumbai to Pune',
    origin: { name: 'Mumbai', lat: 19.0178, lng: 72.8478 },
    destination: { name: 'Pune', lat: 18.5308, lng: 73.8475 },
    stops: mumbaiPuneStops,
    distance: 150,
    estimatedDuration: 165,
    baseFare: 350,
    fareMultiplier: fareMultipliers,
  },
  // GSRTC Routes
  {
    id: 'route-gsrtc-1',
    operatorId: 'gsrtc',
    name: 'Mumbai to Ahmedabad',
    origin: { name: 'Mumbai', lat: 18.9696, lng: 72.8194 },
    destination: { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    stops: mumbaiAhmedabadStops,
    distance: 530,
    estimatedDuration: 480,
    baseFare: 550,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-gsrtc-2',
    operatorId: 'gsrtc',
    name: 'Ahmedabad to Surat',
    origin: { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    destination: { name: 'Surat', lat: 21.1702, lng: 72.8311 },
    stops: ahmedabadSuratStops,
    distance: 270,
    estimatedDuration: 240,
    baseFare: 280,
    fareMultiplier: fareMultipliers,
  },
  // KSRTC Routes
  {
    id: 'route-ksrtc-1',
    operatorId: 'ksrtc',
    name: 'Bangalore to Mysore',
    origin: { name: 'Bangalore', lat: 12.9767, lng: 77.5713 },
    destination: { name: 'Mysore', lat: 12.2958, lng: 76.6394 },
    stops: bangaloreMysoreStops,
    distance: 150,
    estimatedDuration: 145,
    baseFare: 200,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-ksrtc-2',
    operatorId: 'ksrtc',
    name: 'Bangalore to Hyderabad',
    origin: { name: 'Bangalore', lat: 12.9767, lng: 77.5713 },
    destination: { name: 'Hyderabad', lat: 17.3780, lng: 78.4837 },
    stops: bangaloreHyderabadStops,
    distance: 570,
    estimatedDuration: 450,
    baseFare: 600,
    fareMultiplier: fareMultipliers,
  },
  // TNSTC Routes
  {
    id: 'route-tnstc-1',
    operatorId: 'tnstc',
    name: 'Chennai to Pondicherry',
    origin: { name: 'Chennai', lat: 13.0694, lng: 80.1948 },
    destination: { name: 'Pondicherry', lat: 11.9344, lng: 79.8297 },
    stops: chennaiPondicherryStops,
    distance: 160,
    estimatedDuration: 160,
    baseFare: 220,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-tnstc-2',
    operatorId: 'tnstc',
    name: 'Chennai to Bangalore',
    origin: { name: 'Chennai', lat: 13.0694, lng: 80.1948 },
    destination: { name: 'Bangalore', lat: 12.9767, lng: 77.5713 },
    stops: chennaiBangaloreStops,
    distance: 350,
    estimatedDuration: 240,
    baseFare: 380,
    fareMultiplier: fareMultipliers,
  },
  // APSRTC/TSRTC Routes
  {
    id: 'route-tsrtc-1',
    operatorId: 'tsrtc',
    name: 'Hyderabad to Vijayawada',
    origin: { name: 'Hyderabad', lat: 17.3780, lng: 78.4837 },
    destination: { name: 'Vijayawada', lat: 16.5193, lng: 80.6305 },
    stops: hyderabadVijayawadaStops,
    distance: 275,
    estimatedDuration: 290,
    baseFare: 320,
    fareMultiplier: fareMultipliers,
  },
  // Kerala Routes
  {
    id: 'route-ktcl-1',
    operatorId: 'ktcl',
    name: 'Kochi to Thiruvananthapuram',
    origin: { name: 'Kochi', lat: 9.9816, lng: 76.2999 },
    destination: { name: 'Thiruvananthapuram', lat: 8.4875, lng: 76.9525 },
    stops: kochiThiruvananthapuramStops,
    distance: 220,
    estimatedDuration: 240,
    baseFare: 280,
    fareMultiplier: fareMultipliers,
  },
  // Private Operators Routes
  {
    id: 'route-hans-1',
    operatorId: 'hans',
    name: 'Delhi to Amritsar (Volvo)',
    origin: { name: 'Delhi', lat: 28.6675, lng: 77.2284 },
    destination: { name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
    stops: delhiAmritsarStops,
    distance: 450,
    estimatedDuration: 450,
    baseFare: 550,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-hans-2',
    operatorId: 'hans',
    name: 'Amritsar to Jalandhar (Premium)',
    origin: { name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
    destination: { name: 'Jalandhar', lat: 31.3260, lng: 75.5762 },
    stops: amritsarJalandharStops,
    distance: 85,
    estimatedDuration: 80,
    baseFare: 220,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-zingbus-1',
    operatorId: 'zingbus',
    name: 'Delhi to Chandigarh (Premium)',
    origin: { name: 'Delhi', lat: 28.6675, lng: 77.2284 },
    destination: { name: 'Chandigarh', lat: 30.7046, lng: 76.8010 },
    stops: delhiChandigarhStops,
    distance: 250,
    estimatedDuration: 240,
    baseFare: 400,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-intrcity-1',
    operatorId: 'intrcity',
    name: 'Delhi to Jaipur (SmartBus)',
    origin: { name: 'Delhi', lat: 28.6692, lng: 77.2299 },
    destination: { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    stops: delhiJaipurStops,
    distance: 280,
    estimatedDuration: 280,
    baseFare: 450,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-vrl-1',
    operatorId: 'vrl',
    name: 'Bangalore to Hyderabad (Sleeper)',
    origin: { name: 'Bangalore', lat: 12.9767, lng: 77.5713 },
    destination: { name: 'Hyderabad', lat: 17.3780, lng: 78.4837 },
    stops: bangaloreHyderabadStops,
    distance: 570,
    estimatedDuration: 450,
    baseFare: 800,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-neeta-1',
    operatorId: 'neeta',
    name: 'Mumbai to Ahmedabad (AC Sleeper)',
    origin: { name: 'Mumbai', lat: 18.9696, lng: 72.8194 },
    destination: { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    stops: mumbaiAhmedabadStops,
    distance: 530,
    estimatedDuration: 480,
    baseFare: 700,
    fareMultiplier: fareMultipliers,
  },
  {
    id: 'route-orange-1',
    operatorId: 'orange',
    name: 'Hyderabad to Bangalore (Multi-Axle)',
    origin: { name: 'Hyderabad', lat: 17.3780, lng: 78.4837 },
    destination: { name: 'Bangalore', lat: 12.9767, lng: 77.5713 },
    stops: [...bangaloreHyderabadStops].reverse().map((s, i) => ({ ...s, arrivalOffset: i * 90 })),
    distance: 570,
    estimatedDuration: 450,
    baseFare: 850,
    fareMultiplier: fareMultipliers,
  },
]

// Generate trips for today and tomorrow
function generateTrips(): Trip[] {
  const today = new Date()
  const trips: Trip[] = []

  // Generate trips for each route with varying schedules
  mockRoutes.forEach((route, routeIndex) => {
    const operatorBuses = mockBuses.filter((b) => b.operatorId === route.operatorId)
    const bus = operatorBuses[routeIndex % operatorBuses.length] || mockBuses[0]
    const driver = mockUsers.find(u => u.role === 'driver') || mockUsers[2]
    
    // Different departure patterns for different route types
    let departures: number[] = []
    
    if (route.operatorId.includes('prtc') || route.operatorId.includes('hrtc') || route.operatorId.includes('upsrtc')) {
      // Government buses - more frequent
      departures = [5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22]
    } else if (route.operatorId.includes('rsrtc') || route.operatorId.includes('msrtc') || route.operatorId.includes('ksrtc')) {
      // State transport - regular intervals
      departures = [6, 8, 10, 12, 14, 17, 20, 22]
    } else {
      // Private - peak hours focus
      departures = [6, 9, 14, 18, 21, 23]
    }

    departures.forEach((hour, index) => {
      const departureTime = new Date(today)
      departureTime.setHours(hour, 0, 0, 0)
      const arrivalTime = new Date(departureTime)
      arrivalTime.setMinutes(arrivalTime.getMinutes() + route.estimatedDuration)

      const currentHour = today.getHours()
      let status: 'scheduled' | 'in-progress' | 'completed' = 'scheduled'
      let currentStopIndex = 0
      let currentLocation: { lat: number; lng: number } | undefined

      if (hour < currentHour - 2) {
        status = 'completed'
        currentStopIndex = route.stops.length - 1
      } else if (hour <= currentHour && hour > currentHour - 2) {
        status = 'in-progress'
        currentStopIndex = Math.floor((route.stops.length - 1) / 2)
        const stop = route.stops[currentStopIndex]
        currentLocation = { lat: stop.lat, lng: stop.lng }
      }

      trips.push({
        id: `trip-${route.id}-${index + 1}`,
        routeId: route.id,
        busId: bus.id,
        driverId: driver.id,
        departureTime,
        arrivalTime,
        status,
        currentStopIndex,
        currentLocation,
        passengers: status === 'completed' ? ['passenger-1', 'passenger-2'] : [],
      })
    })
  })

  return trips
}

export const mockTrips: Trip[] = generateTrips()

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    passengerId: 'passenger-1',
    tripId: 'trip-route-rsrtc-1-3',
    seatNumbers: [12, 13],
    status: 'confirmed',
    totalFare: 700,
    bookedAt: new Date(Date.now() - 86400000),
    boardingStop: 'Delhi ISBT Kashmere Gate',
    droppingStop: 'Jaipur Sindhi Camp',
    passengerName: 'Rahul Sharma',
    passengerPhone: '+91 98765 43210',
  },
  {
    id: 'booking-2',
    passengerId: 'passenger-2',
    tripId: 'trip-route-ksrtc-1-2',
    seatNumbers: [5],
    status: 'confirmed',
    totalFare: 350,
    bookedAt: new Date(Date.now() - 172800000),
    boardingStop: 'Bangalore Majestic',
    droppingStop: 'Mysore KSRTC',
    passengerName: 'Priya Patel',
    passengerPhone: '+91 98765 43211',
  },
  {
    id: 'booking-3',
    passengerId: 'passenger-1',
    tripId: 'trip-route-prtc-1-1',
    seatNumbers: [22],
    status: 'completed',
    totalFare: 280,
    bookedAt: new Date(Date.now() - 604800000),
    boardingStop: 'Chandigarh ISBT Sector 43',
    droppingStop: 'Amritsar ISBT',
    passengerName: 'Rahul Sharma',
    passengerPhone: '+91 98765 43210',
  },
  {
    id: 'booking-4',
    passengerId: 'passenger-2',
    tripId: 'trip-route-hrtc-1-2',
    seatNumbers: [8, 9],
    status: 'cancelled',
    totalFare: 400,
    bookedAt: new Date(Date.now() - 259200000),
    boardingStop: 'Hisar Bus Stand',
    droppingStop: 'Delhi ISBT Kashmere Gate',
    passengerName: 'Priya Patel',
    passengerPhone: '+91 98765 43211',
  },
]

// Indian Cities for search autocomplete - Expanded
export const indianCities = [
  // North India
  'Delhi', 'Chandigarh', 'Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda',
  'Karnal', 'Ambala', 'Hisar', 'Rohtak', 'Panipat', 'Rewari', 'Gurugram', 'Faridabad',
  'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad', 'Meerut', 'Noida', 'Ghaziabad',
  'Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Bikaner', 'Kota', 'Alwar',
  'Shimla', 'Manali', 'Dharamshala', 'Dehradun', 'Haridwar', 'Rishikesh',
  // West India
  'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Kolhapur',
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar',
  // South India
  'Bangalore', 'Mysore', 'Mangalore', 'Hubli',
  'Chennai', 'Coimbatore', 'Madurai', 'Pondicherry', 'Salem',
  'Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Tirupati',
  'Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur',
  // East India
  'Kolkata', 'Patna', 'Ranchi', 'Bhubaneswar', 'Guwahati',
]

// Amenity icons mapping
export const amenityIcons: Record<string, string> = {
  'WiFi': 'wifi',
  'AC': 'snowflake',
  'Charging Points': 'plug',
  'Water Bottle': 'droplet',
  'Blanket': 'bed',
  'Entertainment': 'monitor',
  'Snacks': 'cookie',
}

// Bus type display names
export const busTypeLabels: Record<BusType, string> = {
  'ordinary': 'Ordinary',
  'express': 'Express',
  'deluxe': 'Deluxe',
  'semi-sleeper': 'Semi Sleeper',
  'ac-sleeper': 'AC Sleeper',
  'volvo': 'Volvo AC',
  'super-deluxe': 'Super Deluxe',
}

// Get fare for a route based on bus type
export function getRouteFare(route: Route, busType: BusType): number {
  const multiplier = route.fareMultiplier?.[busType] || fareMultipliers[busType] || 1
  return Math.round(route.baseFare * multiplier)
}
