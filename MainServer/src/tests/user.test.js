const request = require("supertest");
const { app } = require("../App");
const { userTable } = require("../model/userModel");
const { sequelize } = require("../databases/db");
const http = require("http"); // Import the built-in `http` module

jest.mock("../databases/db", () => ({
  ...jest.requireActual("../databases/db"),
  dbConnect: jest.fn(),
}));
const server = http.createServer(app);

describe("User Routes", () => {
  test("should create a new user", async () => {
    const mockUser = {
      user_name: "testuser",
      user_mail: "test@example.com",
      user_password: "hashedPassword",
      user_age: "25",
      user_gender: "male",
    };
    userTable.findOne = jest.fn().mockResolvedValueOnce(null);
    userTable.create = jest.fn().mockResolvedValueOnce(mockUser);

    const newUser = {
      userName: "testuser",
      mailId: "test@example.com",
      password: "password123",
      age: 25,
      gender: "male",
    };
    const response = await request(server) // Pass the server instance to supertest
      .post("/api/signup")
      .send(newUser)
      .expect(200);
    expect(response.status).toBe(200);
    expect(userTable.findOne).toHaveBeenCalled();
  });
  test("throw an error when data is missing", async () => {
    const mockUser = {
      user_name: "testuser",
      user_mail: "test@example.com",
      user_password: "hashedPassword",
      user_age: "25",
      user_gender: "male",
    };
    userTable.findOne = jest.fn().mockResolvedValueOnce(null);
    userTable.create = jest.fn().mockResolvedValueOnce(mockUser);
    const newUser = {
      userName: "testuser",
      mailId: "test@example.com",
      age: 25,
      gender: "male",
    };
    const response = await request(server) // Pass the server instance to supertest
      .post("/api/signup")
      .send(newUser)
      .expect(400);

    expect(response.status).toBe(400);
  });
  test("throw an error if email id already exist", async () => {
    const mockUser = {
        user_name: "testuser",
        user_mail: "test@example.com",
        user_password: "hashedPassword",
        user_age: "25",
        user_gender: "male",
      };
      userTable.findOne = jest.fn().mockResolvedValueOnce(null);
      userTable.create = jest.fn().mockResolvedValueOnce(mockUser);
      const newUser = {
        userName: "testuser",
        mailId: "test@example.com",
        age: 25,
        gender: "male",
      };
  })
});

afterAll(() => {
  server.close();
});
