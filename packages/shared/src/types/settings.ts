export interface Course {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number | null;
  isActive: boolean;
  studentsCount?: number;
  subcourses?: Subcourse[];
}

export interface Subcourse {
  id: number;
  courseId: number;
  name: string;
  materials: string | null;
  sortOrder: number;
}

export interface Room {
  id: number;
  name: string;
  capacity: number | null;
  isActive: boolean;
}

export interface Tag {
  id: number;
  name: string;
  color: string | null;
}

export interface Holiday {
  id: number;
  name: string;
  date: string;
}

export interface SmsSettings {
  provider: string;
  apiKey: string | null;
  senderName: string | null;
  isActive: boolean;
}

export interface VoipSettings {
  provider: string;
  apiKey: string | null;
  sipDomain: string | null;
  isActive: boolean;
}
