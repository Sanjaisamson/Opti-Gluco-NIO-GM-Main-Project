const request = require("supertest");
const nock = require("nock");
const { describe, mock } = require("@jest/globals");
const { app } = require("../App");
const { productTable } = require("../model/productModel");
const { requestLogTable } = require("../model/requestLogModel");
const { deviceConfig } = require("../config/sysConfig");
const { generateTokens } = require("../services/userService");
const http = require("http"); // Import the built-in `http` module
const { ulid } = require("ulid");

jest.mock("../databases/db", () => ({
  ...jest.requireActual("../databases/db"),
  dbConnect: jest.fn(),
}));
jest.mock("../model/requestLogModel", () => ({
  requestLogTable: {
    findOne: jest.fn(),
    create: jest.fn().mockReturnValue({
      save: jest.fn().mockResolvedValue(), // Mock the save method
    }),
    save: jest.fn().mockResolvedValue(),
  },
}));
const server = http.createServer(app);

describe("product testing", () => {
  describe("product registration testing", () => {
    test("IOT - server should respond with status code 200", async () => {
      nock(`http://${deviceConfig.device_host}`)
        .persist()
        .post("/client/register-client")
        .reply(200);
      const mockProduct = {
        userId: "26",
        productCode: "OG_PR_31",
      };
      productTable.findOne = jest.fn().mockResolvedValueOnce(null);
      productTable.create = jest.fn().mockResolvedValueOnce(mockProduct);
      const userId = "26"; // Replace with the appropriate user ID
      const Tokens = await generateTokens(userId);
      const accessToken = Tokens.accessToken;
      const response = await request(server) // Pass the server instance to supertest
        .post("/product/register")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(mockProduct)
        .expect(200);
      expect(response.status).toBe(200);
    });
    test("server respond with status code 400 when a argument is missing", async () => {
      const mockProduct = {
        userId: "26",
      };
      productTable.findOne = jest.fn().mockResolvedValueOnce(null);
      productTable.create = jest.fn().mockResolvedValueOnce(mockProduct);

      const userId = "26"; // Replace with the appropriate user ID
      const Tokens = await generateTokens(userId);
      const accessToken = Tokens.accessToken;
      const response = await request(server) // Pass the server instance to supertest
        .post("/product/register")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(mockProduct)
        .expect(400);
      expect(response.status).toBe(400);
    });
  });
  describe("initiate Iot server", () => {
    test("server respond with 200 status code", async () => {
      const requestId = ulid();
      const mockRequest = {
        userId: "26",
        product_code: "OG_PR_31",
      };
      const mockResponse = {
        jobId: "32",
        jobStatus: "success",
        requestId: requestId,
      };
      nock(`http://${deviceConfig.device_host}`)
        .persist()
        .post("/client/start-job")
        .reply(200, mockResponse);
      productTable.findOne = jest.fn().mockResolvedValueOnce(mockRequest);
      productTable.create = jest.fn().mockResolvedValueOnce(mockRequest);
      requestLogTable.create = jest.fn().mockResolvedValueOnce();
      requestLogTable.findOne = jest.fn().mockResolvedValueOnce(mockResponse);
      requestLogTable.save = jest.fn().mockResolvedValueOnce();
      const userId = "26"; // Replace with the appropriate user ID
      const Tokens = await generateTokens(userId);
      const accessToken = Tokens.accessToken;
      const response = await request(server) // Pass the server instance to supertest
        .post("/product/start-job")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(response.status).toBe(200);
    });
  });
});
