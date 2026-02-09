##PerfDog API Automation – Playwright

This project contains API automated tests for the PerfDog Pet Store, using Playwright with JavaScript, validating core functionalities of the Swagger Petstore API.


#Tech Stack

Node.js

Playwright Test

JavaScript

Swagger Petstore API

#API Under Test

Swagger Petstore (public demo API):
👉 https://petstore.swagger.io

#Base URL used:

https://petstore.swagger.io/v2

#Scenarios Covered
🔹 Part 1 – Pet Management

Create 10 pets:

5 with status available

4 with status pending

1 with status sold

Retrieve and validate the details of the sold pet

🔹 Part 2 – Orders

Retrieve all pets with status available

Store 5 available pets in a data structure

Create one order per pet (5 orders total)

Validate each order creation

Test Strategy & Best Practices

Uses Playwright APIRequestContext (API-only testing)

Unique IDs generated to avoid conflicts in the shared public environment


#How to Run the Tests
🔹 Prerequisites

Node.js (LTS version recommended)

Internet access (Swagger Petstore is public)

🔹 Install dependencies
npm install

🔹 Install Playwright (if needed)
npx playwright install

🔹 Run all tests
npx playwright test

🔹 View test report
npx playwright show-report
