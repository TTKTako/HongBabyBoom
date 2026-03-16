export type ComfortScore = "Comfortable" | "Moderate" | "Uncomfortable";

export interface SensorReading {
  temperature: number;
  humidity: number;
  light: number;
  motion: boolean;
  comfortScore: ComfortScore;
  confidence: number;
  timestamp: string;
}

export interface Board {
  id: string;
  name: string;
  room: string;
  lat: number;
  lng: number;
  online: boolean;
  lastUpdated: string;
  current: SensorReading;
  history: SensorReading[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "Admin" | "Staff" | "User";
}

const now = new Date();
const timeStr = (minutesAgo: number) => {
  const d = new Date(now.getTime() - minutesAgo * 60 * 1000);
  return d.toISOString();
};

const makeHistory = (
  baseTemp: number,
  baseHumidity: number,
  count = 24
): SensorReading[] =>
  Array.from({ length: count }, (_, i) => {
    const temp = +(baseTemp + (Math.random() - 0.5) * 4).toFixed(1);
    const humidity = +(baseHumidity + (Math.random() - 0.5) * 10).toFixed(1);
    const light = Math.floor(Math.random() * 800 + 100);
    const motion = Math.random() > 0.5;
    let comfortScore: ComfortScore = "Comfortable";
    if (temp > 28 || humidity > 70) comfortScore = "Uncomfortable";
    else if (temp > 26 || humidity > 60) comfortScore = "Moderate";
    return {
      temperature: temp,
      humidity,
      light,
      motion,
      comfortScore,
      confidence: +(Math.random() * 0.2 + 0.8).toFixed(2),
      timestamp: timeStr((count - i) * 5),
    };
  });

export const MOCK_BOARDS: Board[] = [
  {
    id: "board-001",
    name: "KidBright #1",
    room: "Living Room",
    lat: 13.848,
    lng: 100.569,
    online: true,
    lastUpdated: timeStr(0.5),
    current: {
      temperature: 26.4,
      humidity: 58.2,
      light: 620,
      motion: true,
      comfortScore: "Comfortable",
      confidence: 0.94,
      timestamp: timeStr(0.5),
    },
    history: makeHistory(26.4, 58.2),
  },
  {
    id: "board-002",
    name: "KidBright #2",
    room: "Bedroom",
    lat: 13.85,
    lng: 100.572,
    online: true,
    lastUpdated: timeStr(1),
    current: {
      temperature: 24.1,
      humidity: 62.5,
      light: 230,
      motion: false,
      comfortScore: "Comfortable",
      confidence: 0.91,
      timestamp: timeStr(1),
    },
    history: makeHistory(24.1, 62.5),
  },
  {
    id: "board-003",
    name: "KidBright #3",
    room: "Kitchen",
    lat: 13.847,
    lng: 100.574,
    online: true,
    lastUpdated: timeStr(2),
    current: {
      temperature: 31.8,
      humidity: 72.0,
      light: 850,
      motion: true,
      comfortScore: "Uncomfortable",
      confidence: 0.97,
      timestamp: timeStr(2),
    },
    history: makeHistory(31.8, 72.0),
  },
  {
    id: "board-004",
    name: "KidBright #4",
    room: "Study Room",
    lat: 13.852,
    lng: 100.567,
    online: false,
    lastUpdated: timeStr(35),
    current: {
      temperature: 25.0,
      humidity: 55.0,
      light: 410,
      motion: false,
      comfortScore: "Comfortable",
      confidence: 0.88,
      timestamp: timeStr(35),
    },
    history: makeHistory(25.0, 55.0),
  },
  {
    id: "board-005",
    name: "KidBright #5",
    room: "Bathroom",
    lat: 13.8485,
    lng: 100.5705,
    online: true,
    lastUpdated: timeStr(1.5),
    current: {
      temperature: 28.5,
      humidity: 80.3,
      light: 180,
      motion: false,
      comfortScore: "Moderate",
      confidence: 0.82,
      timestamp: timeStr(1.5),
    },
    history: makeHistory(28.5, 80.3),
  },
  {
    id: "board-006",
    name: "KidBright #6",
    room: "Guest Room",
    lat: 13.846,
    lng: 100.571,
    online: true,
    lastUpdated: timeStr(0.8),
    current: {
      temperature: 25.9,
      humidity: 57.4,
      light: 310,
      motion: false,
      comfortScore: "Comfortable",
      confidence: 0.93,
      timestamp: timeStr(0.8),
    },
    history: makeHistory(25.9, 57.4),
  },
];

export const MOCK_USER: User = {
  id: "user-001",
  username: "test",
  email: "test@nestsense.io",
  role: "User",
};

export const STATS = {
  total: MOCK_BOARDS.length,
  online: MOCK_BOARDS.filter((b) => b.online).length,
  offline: MOCK_BOARDS.filter((b) => !b.online).length,
  comfortable: MOCK_BOARDS.filter(
    (b) => b.current.comfortScore === "Comfortable"
  ).length,
};
