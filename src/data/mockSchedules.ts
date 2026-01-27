import { Schedule } from "@/types/schedule";

export const mockSchedules: Schedule[] = [
  {
    id: "1",
    type: "worship",
    date: new Date("2024-04-07"),
    minister: "João Silva",
    selectedWorships: ["1", "3"],
    notes: "Culto de adoração especial",
    createdAt: new Date("2024-03-20"),
    updatedAt: new Date("2024-03-20"),
  },
  {
    id: "2",
    type: "preaching",
    date: new Date("2024-04-14"),
    preacher: "Pastor Carlos",
    theme: "A Fé que Move Montanhas",
    keyVerse: "Mateus 17:20 - Se vocês tiverem fé do tamanho de um grão de mostarda, poderão dizer a este monte: Vá daqui para lá, e ele irá.",
    outline: "<h2>Introdução</h2><p>O que é fé?</p><h2>Desenvolvimento</h2><ul><li>A fé como confiança em Deus</li><li>Exemplos bíblicos de fé</li></ul><h2>Conclusão</h2><p>Aplicação prática da fé</p>",
    createdAt: new Date("2024-03-25"),
    updatedAt: new Date("2024-03-25"),
  },
  {
    id: "3",
    type: "worship",
    date: new Date("2024-04-21"),
    minister: "Maria Santos",
    selectedWorships: ["2", "4"],
    createdAt: new Date("2024-03-28"),
    updatedAt: new Date("2024-03-28"),
  },
];
