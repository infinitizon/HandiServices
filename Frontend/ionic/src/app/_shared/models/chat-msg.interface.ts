interface IChatMsg {
  id: string;
  pId: string;
  sessionId: string;
  userId: string;
  message: string;
  isDeleted: boolean;
  timestamp: Date;
}

export { IChatMsg }
