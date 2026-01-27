import { User } from "@/types/user";

export const mockUsers: User[] = [
  {
    id: 1,
    email: "admin@igreja.com",
    role: "admin",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    email: "joao.silva@email.com",
    role: "member",
    createdAt: new Date("2024-02-20"),
    member: {
      name: "João Silva",
      photoUrl: "https://i.pravatar.cc/150?u=joao",
    },
  },
  {
    id: 3,
    email: "maria.santos@email.com",
    role: "member",
    createdAt: new Date("2024-03-10"),
    member: {
      name: "Maria Santos",
      photoUrl: "https://i.pravatar.cc/150?u=maria",
    },
  },
  {
    id: 4,
    email: "pedro.oliveira@email.com",
    role: "admin",
    createdAt: new Date("2024-04-05"),
    member: {
      name: "Pedro Oliveira",
      photoUrl: "https://i.pravatar.cc/150?u=pedro",
    },
  },
  {
    id: 5,
    email: "ana.costa@email.com",
    role: "member",
    createdAt: new Date("2024-05-12"),
  },
];
