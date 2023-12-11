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
  - [Managers/Admins](#managers/admins)
  - [Non-Users](#non-users)
  - [Shopping Carts](#shopping-carts)
  - [Wish Lists](#wish-lists)
  - [Discount Codes](#discount-codes)
  - [Promotions](#promotions)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)
- [Contribution](#contribution)
  - [Contributing Guidelines](./CONTRIBUTING.md)
- [Web Service](#web-service)
- [License](#license)
- [Authors](#authors)

## Project Overview

TechDot's E-Commerce API is meticulously crafted to facilitate seamless online shopping experiences, providing a comprehensive set of robust features to efficiently manage a wide array of electronic devices. From computer components to diverse electronic gadgets, this API serves as the foundation for empowering sophisticated e-commerce platforms. Whether you're establishing a specialized platform or a broad marketplace, TechDot's API offers unparalleled versatility and functionality for various electronic devices, ensuring a smooth and user-friendly shopping experience.

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
The categories segment electronic products into distinct sections, simplifying the user's exploration of computer peripherals, household appliances, etc.

### Subcategories
Subcategories provide more detailed classification within each main category. For example, in the computer components category, we have motherboard, graphics card, processor, etc.

### Products
This feature represents individual product available for purchase. Each product contains comprehensive information such as name, description, compatibility details, specifications, images, and prices.

### Users

The user feature manages customer accounts, enabling profile creation and management, purchase history viewing, payment information management, and delivery address storage. Additionally, users can:

- Add items to their wishlists for future consideration.
- View all categories available.
- Access all subcategories within each category.
- Browse products listed under each subcategory and category.

### Managers/Admins

Managers/admins possess elevated privileges within the system, enabling them to perform the following tasks:

- **Category Management**:
  - Creation, modification, and deletion of categories.
  - Ability to modify category names.
  - Access to a dedicated dashboard for efficient category management.

- **Product Management**:
  - Creation, modification, and deletion of products.
  - Creation, modification, and deletion of subcategories.

### Non-Users

Non-users have limited access within the system, allowing them to:

- View products, categories, and subcategories.

### Shopping Carts
Shopping carts enable customers to collect and temporarily store their chosen computer components for purchase. They can add, remove, or modify items in their cart before finalizing their order.

### Wish Lists
Wish lists allow registered users to save desired products for future consideration, providing a convenient way to track favorite items without immediately adding them to the cart.

### Discount Codes
Discount codes offer customers the opportunity to receive special discounts on their purchases, whether through percentage-based discounts or fixed monetary discounts.

### Promotions
Promotions encompass special offers or marketing campaigns that may include seasonal discounts, limited-time sales, bundled deals, or offers tied to specific computer component categories or periods.

### Contribution
We welcome contributions to enhance and refine the functionality of this API. If you have ideas, bug reports, or feature requests, please feel free to open an issue or submit a pull request.

## Web Service
The getUserCountry function within this project utilizes the IP Geolocation API to retrieve the country name based on the provided IP address. This functionality is particularly useful for determining the user's location for language customization within the application.

Setting Up API Access
To use this functionality, you'll need an API key from [IP Geolocation](https://ipgeolocation.io/). Follow these steps to obtain your API key:

#### 1. Create an Account:

Sign up for an account on IP Geolocation.

After registration, access your dashboard and locate your unique API key.

#### 2. Environment Configuration:

In the project's environment variables or configuration file (src/config or .env), set the IPGEOAPI variable to your API key.

Example: IPGEOAPI=YOUR_API_KEY

#### API Location in the Project

The API functionality is contained within the `src/api/services/geolocation.ts` file. Here, you'll find the getUserCountry function utilizing Axios to interact with the IP Geolocation API, fetching the country name based on the provided IP.

## License
This project is licensed under the [GPL-3.0 License](./LICENSE).

## Authors

[@samusafe](https://github.com/samusafe)

[@ZeB4la](https://github.com/ZeB4la)

[@GuilhermeCanha](https://github.com/GuilhermeCanha)

[@duartezao](https://github.com/duartezao)

[@cynlik](https://github.com/cynlik)
