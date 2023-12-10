# TechDot API

Welcome to TechDot's open-source E-Commerce API project developed by our dedicated team. This TypeScript-based Node.js API leverages the Express framework alongside cutting-edge technologies to offer a robust foundation for crafting seamless online shopping experiences. Below, you'll find detailed information on obtaining the release and initiating the server.

## Table of Contents
- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Downloading the Release](#downloading-the-release)
  - [Running the Server](#running-the-server)
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
- [Authors](#authors)

## Project Overview

TechDot's E-Commerce API is meticulously designed to empower sophisticated online shopping experiences, offering an array of robust features to efficiently manage computer components. Whether building a boutique platform or a comprehensive marketplace, this API serves as the backbone for seamless e-commerce functionality.

## Technologies Used

- Node.js
- TypeScript
- Express

## Getting Started

### Downloading the Release

For the latest stable release, visit the [Releases](https://github.com/cynlik/techdot-backend/releases) section of this GitHub repository. Choose either the source code or pre-built binaries based on your preference.

### Running the Server

To set up and run the server locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/cynlik/techdot-backend.git
   cd techdot-backend
2. Install dependecies:
   ```bash
   npm install
   ```
3. Configure Environment:
  After installing the dependencies, create a .env file in the root folder of the project and add the following environment variables:
  
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

## API Features
### Categories
Categories segment computer components into distinct sections, simplifying user exploration for specific parts like motherboards, CPUs, RAM, graphics cards, and more.

### Subcategories
Subcategories offer a more detailed classification within each main category. For instance, within the graphics cards category, subcategories might include gaming GPUs, professional GPUs, budget GPUs, etc.

### Products
This feature represents individual computer components available for purchase. Each product contains comprehensive information such as name, description, compatibility details, specifications, images, and prices.

### Users
The user feature manages customer accounts, enabling profile creation and management, purchase history viewing, payment information management, and delivery address storage.

### Shopping Carts
Shopping carts enable customers to collect and temporarily store their chosen computer components for purchase. They can add, remove, or modify items in their cart before finalizing their order.

### Wish Lists
Wish lists enable users to save desired computer components for future consideration. It's a convenient way to track favorite items without immediately adding them to the cart

### Guests
Functionality for visitors without registered accounts, allowing them to browse computer components, add items to their cart, and create temporary wish lists without needing an account.

### Discount Codes
Discount codes offer customers the opportunity to receive special discounts on their purchases, whether through percentage-based discounts or fixed monetary discounts.

### Promotions
Promotions encompass special offers or marketing campaigns that may include seasonal discounts, limited-time sales, bundled deals, or offers tied to specific computer component categories or periods.

### Contribution
We welcome contributions to enhance and refine the functionality of this API. If you have ideas, bug reports, or feature requests, please feel free to open an issue or submit a pull request.

### License
This project is licensed under the [GPL-3.0 License](./LICENSE).

### Authors

[@samusafe](https://github.com/samusafe)

[@ZeB4la](https://github.com/ZeB4la)

[@GuilhermeCanha](https://github.com/GuilhermeCanha)

[@duartezao](https://github.com/duartezao)

[@cynlik](https://github.com/cynlik)
