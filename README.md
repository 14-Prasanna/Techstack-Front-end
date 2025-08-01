# 🚀 TechStack – Frontend (React + TypeScript)

This is the **frontend application** for the **TechStack E-Commerce Web App**, built using **React**, **TypeScript**, and **Tailwind CSS**. It connects seamlessly with the backend powered by **Spring Boot**, offering a smooth, secure, and responsive user experience for browsing and purchasing electronic products.



## 📁 Project Folder Structure
```
src/
├── components/
│   ├── auth/
│   │   └── AuthGuard.tsx
│   ├── home/
│   │   ├── CategorySection.tsx
│   │   └── HeroSection.tsx
│   ├── layout/
│   │   └── Header.tsx
│   ├── products/
│   │   └── ProductCard.tsx
│   └── ui/
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   └── utils.ts
├── pages/
│   ├── Cart.tsx
│   ├── CheckoutPage.tsx
│   ├── Home.tsx
│   ├── Index.tsx
│   ├── LoginPage.tsx
│   ├── NotFound.tsx
│   ├── ProductDetail.tsx
│   ├── ProductListing.tsx
│   ├── ProfilePage.tsx
│   ├── SignupPage.tsx
│   └── WishlistPage.tsx
├── types/
│   ├── apiService.ts
│   └── product.ts

```


## 💡 Features

✅ Fully authenticated routes using **JWT**  
✅ Protected pages using `AuthGuard.tsx`  
✅ Dynamic **product listing** with category, brand, rating, and price range filters  
✅ Keyword-based search (`?keyword=dell`)  
✅ Add to **Cart** & **Wishlist** (only for authenticated users)  
✅ Product detail page with image, specifications, reviews  
✅ Responsive layout using **Tailwind CSS**  
✅ Clean and modular code using **functional components & hooks**  
✅ Fully integrated with **Spring Boot + MySQL** backend  
✅ API testing completed via **Postman**  
✅ Documentation and demo video available

---

## 🌐 Pages Overview

| Page               | Route              | Access       | Description                                                                 |
|--------------------|--------------------|--------------|-----------------------------------------------------------------------------|
| Home               | `/`                | Public       | Hero section + category highlights                                          |
| Product Listing    | `/products`        | Public       | All products with filters (category, brand, rating, price, sort)           |
| Product Detail     | `/products/:id`    | Public       | Detailed view with image, description, and specs                           |
| Search             | `/products?keyword=` | Public     | Search results based on keyword query                                      |
| Login              | `/login`           | Public       | User login using JWT                                                        |
| Signup             | `/signup`          | Public       | Register new users                                                          |
| Cart               | `/cart`            | Auth Required | Add/remove/update items                                                     |
| Wishlist           | `/wishlist`        | Auth Required | Saved products for later                                                   |
| Checkout           | `/checkout`        | Auth Required | Address, payment, and order placement                                       |
| Profile            | `/profile`         | Auth Required | View past orders, user details                                              |
| Not Found          | `*`                | Public       | 404 page                                                                    |

---

## 🔐 JWT Authentication Flow

- All authenticated API calls send the JWT token via request headers:  
  `Authorization: Bearer <token>`

- The token is stored in `localStorage` after successful login

- `AuthGuard.tsx` ensures protected routes are not accessible by unauthenticated users

---

## 📦 Installation & Setup

```bash
# Clone the repo
git clone https://github.com/14-Prasanna/Techstack-Front-end.git

# Install dependencies
cd Techstack-Front-end
npm install

# Start the app
npm run dev

```

📌 Backend Link
👉 Techstack Back-end GitHub Repo

📄 Documentation
✅ Full documentation (with UML, DDLs, API list, Postman testing)
✅ 12-day journey writeup + development insights
✅ Demo walkthrough available

Check the pinned post on LinkedIn - https://www.linkedin.com/in/prasanna-venkatesh-k-759756278/ -  for the full release!

🙏 Acknowledgement
Special thanks to @Fetcho Company for providing a real-world project experience that helped me explore backend, frontend, APIs, and secure full-stack deployment.

📬 Contact
Feel free to connect or message if you're interested in contributing, learning from, or using this as a base project!

🏷️ Tech Stack Tags
React TypeScript Tailwind CSS Axios JWT Spring Boot MySQL Full Stack Postman Authentication Ecommerce
Copy
Edit
