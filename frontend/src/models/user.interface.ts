export interface IUser {
  id: number;
  email: string;
  userHandle: string;
  role: string;
  password?: string;
  deleted: boolean;
}

// export const user: User = {
//   id: '',
//   email: '',
//   userHandle: '',
//   role: ''
// };
