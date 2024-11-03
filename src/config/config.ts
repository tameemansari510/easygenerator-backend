export default () => ({
  database: {
    connectionstring: process.env.CONNECTION_STRING,
  },
  port: process.env.PORT,
  jwt: {
    secret: process.env.JWT_SECRET,
  },
});
