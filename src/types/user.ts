export interface User {
  id: number;
  email: string;
  role: 'admin' | 'member';
  createdAt: Date;
  member?: {
    name: string;
    photoUrl: string;
  };
}
