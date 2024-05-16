const request = require("supertest");
const nock = require("nock");
const http = require("http");
const { app } = require("../src/app");
const { describe, mock } = require("@jest/globals");
const { dbConnect } = require("../src/database/database");
const { clientConfigTable } = require("../src/models/clientConfigModel");
const { url } = require("inspector");

jest.mock("../src/database/database", () => ({
  ...jest.requireActual("../src/database/database"),
  dbConnect: jest.fn(),
}));

const server = http.createServer(app);

describe("client side testing", () => {
  describe("start job Api testing ", () => {
    test("api response with 200 status code", async () => {
      console.log("testing started");
      const mockProduct = {
        userId: "2",
        productCode: "17",
        url: "http://localhost:3000",
      };
      clientConfigTable.findOne = jest.fn().mockResolvedValueOnce(null);
      clientConfigTable.create = jest.fn();
      const response = await request(server) // Pass the server instance to supertest
        .post("/client/register-client")
        .send(mockProduct)
        .expect(200);
      expect(response.status).toBe(200);
    });
    test("api response with 400 status code when a argument is missing", async () => {
      const mockProduct = {
        userId: "2",
        url: "http://localhost:3000",
      };
      clientConfigTable.findOne = jest.fn().mockResolvedValueOnce(null);
      clientConfigTable.create = jest.fn().mockResolvedValueOnce(mockProduct);
      const response = await request(server) // Pass the server instance to supertest
        .post("/client/register-client")
        .send(mockProduct)
        .expect(500);
      expect(response.status).toBe(500);
    });
  });
});
