export interface UserInterface {
  firebaseUid: string;
  fullname: string;
  email: string;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
}