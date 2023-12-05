# TechDot API

Welcome to the open-source E-Commerce API project developed by our team. This TypeScript-based Node.js API leverages the Express framework along with various technologies to provide a robust foundation for building online shopping platforms. Below, you'll find information on how to download the release and get started with running the server.

## Table of Contents
- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [How to Get Started](#how-to-get-started)
  - [Download Release](#download-release)
  - [Run the Server](#run-the-server)
- [API Features](#api-features)
  - [Categories](#categories)
  - [Subcategories](#subcategories)
  - [Products](#products)
  - [Users](#users)
  - [Shopping Carts](#shopping-carts)
  - [Wish Lists](#wish-lists)
  - [Guests](#guests)
  - [Discount Codes](#discount-codes)
  - [Promotions](#promotions)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)
- [Contribution](#contribution)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [License](#license)

## Project Overview

Our E-Commerce API is designed to power online shopping experiences, offering a wide range of features to manage categories, products, users, and more. Whether you're building a small boutique or a large-scale marketplace, this API provides the backbone for seamless e-commerce functionality.

## Technologies Used

- Node.js
- TypeScript
- Express

## How to Get Started

### Download Release

To get the latest stable release, you can visit the [Releases](https://github.com/cynlik/techdot-backend/releases) section of this GitHub repository. Download the source code or the pre-built binaries, depending on your preference.

### Run the Server

Follow these steps to set up and run the server locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/cynlik/techdot-backend.git
   cd techdot
   
2. Install dependecies:
   ```bash
   npm install
   ```
3. Configure Environment:
  After installing the dependencies, create a .env file in the src folder of the project and add the following environment variables:
  
   .env
   ```bash
   HOST=127.0.0.1
   FRONTEND_HOST=
   PORT=3000
   FRONTEND_PORT=
   DBURL=
   SECRET=
   EXPIRESIN=300000
   IPGEOAPI=
   EMAIL=
   PASSWORD=

  Replace the placeholders with your actual configuration.

4. Start your project

   ```bash
   npm start

The API will be accessible at http://localhost:3000.

### API Features
## Categories
[Description of categories feature...]

## Subcategories
[Description of subcategories feature...]

## Products
[Description of products feature...]

## Users
[Description of users feature...]

## Shopping Carts
[Description of shopping carts feature...]

## Wish Lists
[Description of wish lists feature...]

## Guests
[Description of guests feature...]

## Discount Codes
[Description of discount codes feature...]

## Promotions
[Description of promotions feature...]

## Contribution
We welcome contributions to enhance and improve the functionality of this API. If you have ideas, bug reports, or feature requests, feel free to open an issue or submit a pull request.

## License
This project is licensed under the [GPL-3.0 License](./LICENSE).
