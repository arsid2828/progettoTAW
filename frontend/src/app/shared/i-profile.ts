export interface IProfile {
  email: string;
  password: string; // hashed
  nome: string;
  cognome: string;
  sesso: number; // 0=M,1=F (come nel BD)
  telefono?: string;
  nazionalita?: string;
  data_nascita: Date;
  citta_nascita: string;
}
