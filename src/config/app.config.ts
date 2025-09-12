
export default () => ({
  JWT_SECRET: process.env.JWT_SECRET || '',
  database: {
    url: process.env.DATABASE_URL,
  },
});