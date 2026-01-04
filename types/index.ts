import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
  }
}

export interface Location {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SleepEntry {
  id: string;
  userId: string;
  locationId: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
  location?: Location;
}

export interface SleepEntryWithLocation extends SleepEntry {
  location: Location;
}
