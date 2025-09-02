// Mock database for now - no SQLite dependency
export const db = {
  transaction: (callback: any) => {
    console.log('Mock database transaction');
  }
};

export const initDB = () => {
  console.log('Mock database initialized');
};
