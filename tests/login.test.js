const dotenv = require("dotenv");
const {describe, expect, it, beforeAll} = require('@jest/globals');
const supertest = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

dotenv.config();
mongoose.set("strictQuery", false);

const { HOST_URI_TEST } = process.env;

describe("login", () => {
    beforeAll( async() => {
        await mongoose.connect(HOST_URI_TEST);
      });

    it("must check the user by login", async() => {
        const response = await supertest(app).post("/users/login").send(
            {
            "email": "test4@example.com",
          "password": "123456"
        });

        // console.log("response.status:", response.status);

        expect(response.status).toBe(200);

    });

    it("user or token must be verified", async() => {
        const response = await supertest(app).post("/users/login").send(
            {
            "email": "test4@example.com",
          "password": "123456"
        });

        // console.log("response.body:", response.body);
        
        expect(response.body.token).toBeDefined();

    });
});
