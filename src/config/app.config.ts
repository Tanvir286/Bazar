
export default () => ({
  jwt: {
    secret: 'your_jwt_secret',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
});