import PagePath from "../constants/PagePath.js";
import UserService from "../services/UserService.js";
import { User } from "../models/User.js";
import AdminService from "../services/AdminService.js";
import ProductService from "../services/ProductService.js";
import OrderService from "../services/OrderService.js";
import { Order } from "../models/Order.js";
import { OrderDetail } from "../models/OrderDetail.js";
import ejs from "ejs";
import { v4 as uuidv4 } from "uuid"; // Import hàm tạo UUID
import uploadImageToS3 from "../utils/uploadToS3.js"; // Hàm upload ảnh

class AdminController {
  constructor() {
    this.userService = new UserService(User);
    this.orderService = new OrderService(Order, OrderDetail);
    this.showProfilePage = this.showProfilePage.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.showUserListPage = this.showUserListPage.bind(this);
    this.actionOnUser = this.actionOnUser.bind(this);
  }
  async showProfilePage(req, res) {
    if (!req.isAuthenticated()) {
      res.redirect("/login");
      return;
    }
    const user = req.user;
    res.render(PagePath.ADMIN_ACCOUNT_PAGE_PATH, {
      user: user, 
      isLoggedIn: true,
      successMessage: req.flash("success"),
      errorMessage: req.flash("error"),
    });
  }

  async showUserListPage(req, res) {
    if (!req.isAuthenticated()) {
      res.redirect("/login");
      return;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const query = req.query.query || "";
    const sort = req.query.sort || "";

    try {
      const users = await AdminService.searchUsers(query, sort);
      const filteredUsers = users;

      const totalFilteredPages = Math.ceil(filteredUsers.length / limit);
      const paginatedUsers = filteredUsers.slice(
        (page - 1) * limit,
        page * limit
      );

      if (Object.keys(req.query).length !== 0) {
        const html = await ejs.renderFile("views/pages/admin/userList.ejs", {
          users: paginatedUsers,
          user: req.user,
        });
        const pagination = await ejs.renderFile(
          "views/layouts/pagination.ejs",
          { totalPages: totalFilteredPages, currentPage: page }
        );
        return res.json({ html, pagination });
      }

      const user = req.user;
      res.render(PagePath.USER_LIST_PAGE_PATH, {
        user,
        users: paginatedUsers,
        totalPages: totalFilteredPages,
        currentPage: page,
        selectedSort: sort,
        isLoggedIn: true,
        selectedFilters: {},
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.json({ success: false, message: error.message });
    }
  }

  async updateProfile(req, res) {
    if (req.isAuthenticated()) {
      const userData = {
        name: req.body.name,
      };
      try {
        this.userService.updateUser(req.user.user_id, userData);
        res.json({ success: true, message: "Profile updated!" });
      } catch (error) {
        res.json({ success: false, message: error.message });
      }
    } else {
      res.redirect("/login");
    }
  }

  async showAdminPage(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const query = req.query.query || ""; // Lấy từ khóa tìm kiếm
    const brandVal = req.query.manufacturers
      ? req.query.manufacturers.split(",")
      : [];
    const catVal = req.query.categories ? req.query.categories.split(",") : [];
    const sort = req.query.sort || ""; // Lấy giá trị sort
    const minPrice =
      req.query.minPrice !== undefined
        ? parseFloat(req.query.minPrice)
        : undefined;
    const maxPrice =
      req.query.maxPrice !== undefined
        ? parseFloat(req.query.maxPrice)
        : undefined;
    const status = req.query.status || undefined;

    try {
      // Lọc theo Category & Manufacturer
      const categories = await ProductService.getAllCategories(); // Lấy toàn bộ Category
      const manufacturers = await ProductService.getAllManufacturer(); // Lấy toàn bộ Manufacturer

      // Tìm kiếm theo tên sản phẩm
      const products = await ProductService.searchProducts(
        query,
        "product_name",
        sort
      );

      // Lọc sản phẩm theo các tiêu chí
      let filteredProducts = products;

      if (catVal.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
          catVal.includes(product.category_id.toString())
        );
      }

      if (brandVal.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
          brandVal.includes(product.manufacturer_id.toString())
        );
      }

      if (!isNaN(minPrice)) {
        filteredProducts = filteredProducts.filter(
          (product) => product.price >= minPrice
        );
      }

      if (!isNaN(maxPrice)) {
        filteredProducts = filteredProducts.filter(
          (product) => product.price <= maxPrice
        );
      }

      if (status !== undefined) {
        filteredProducts = filteredProducts.filter(
          (product) => product.status === status
        );
      }

      // Phân trang
      const totalFilteredPages = Math.ceil(filteredProducts.length / limit);
      const paginatedProducts = filteredProducts.slice(
        (page - 1) * limit,
        page * limit
      );

      const user = req.user;
      res.render(PagePath.ADMIN_SHOP_PATH, {
        user,
        isLoggedIn: true,
        products: paginatedProducts,
        currentPage: page,
        limit,
        totalPages: totalFilteredPages,
        query,
        categories: categories,
        manufacturers: manufacturers,
        selectedSort: sort,
        selectedFilters: {
          categories: catVal,
          manufacturers: brandVal,
          minPrice,
          maxPrice,
          status,
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      const user = req.user;
      res.render(PagePath.ADMIN_SHOP_PATH, {
        user,
        isLoggedIn: true,
        products: [],
        currentPage: 1,
        limit,
        totalPages: 1,
        query: "",
        categories: [],
        manufacturers: [],
        selectedSort: sort,
        selectedFilters: {
          categories: [],
          manufacturers: [],
          minPrice: undefined,
          maxPrice: undefined,
          status: undefined,
        },
      });
    }
  }

  async showAddProduct(req, res) {
    try {
      const user = req.user;
      const categories = await ProductService.getAllCategories();
      const manufacturers = await ProductService.getAllManufacturer();

      res.render(PagePath.ADD_PRODUCT_PATH, {
        user,
        isLoggedIn: true,
        categories,
        manufacturers,
      });
    } catch (error) {
      console.error("Error fetching category and manufacturer:", error);
      res
        .status(500)
        .send(`Error loading category and manufacturer: ${error.message}`);
    }
  }

  async addNewProduct(req, res) {
    const { product_name, category, quantity, price, manufacturer, detail } =
      req.body;
    const user = req.user;
    const categories = await ProductService.getAllCategories(); // Lấy toàn bộ Category
    const manufacturers = await ProductService.getAllManufacturer(); // Lấy toàn bộ Manufacturer

    // Kiểm tra dữ liệu đầu vào
    if (!product_name || !category || !quantity || !price || !manufacturer) {
      return res.status(400).json({ error: "Missing required fields!" });
    }

    try {
      // Kiểm tra và lấy category_id từ bảng Category
      const categoryRecord = categories.find(
        (cat) => cat.category_name === category
      );
      if (!categoryRecord) {
        throw new Error("Category không tồn tại!");
      }

      // Kiểm tra và lấy manufacturer_id từ bảng Manufacturer
      const manufacturerRecord = manufacturers.find(
        (manu) => manu.manufacturer_name === manufacturer
      );
      if (!manufacturerRecord) {
        throw new Error("Manufacturer không tồn tại!");
      }

      // Tải ảnh lên S3
      const imageUrls = [];
      for (let i = 0; i < req.files.length; i++) {
        const imageUrl = await uploadImageToS3(req.files[i]);
        imageUrls.push(imageUrl);
      }

      const product_id = uuidv4(); // Tạo UUID cho product_id
      // Tạo đối tượng sản phẩm mới
      const productImages = imageUrls.map((url) => ({
        img_id: uuidv4(),
        product_id: product_id,
        img_src: url,
      }));
      const newProduct = {
        product_id: product_id,
        product_name: product_name,
        category_id: categoryRecord.category_id, // Sử dụng ID từ category
        quantity: parseInt(quantity), // Chuyển đổi sang số nguyên
        price: parseFloat(price), // Chuyển đổi sang số thập phân
        manufacturer_id: manufacturerRecord.manufacturer_id, // Sử dụng ID từ manufacturer
        detail: detail,
      };

      // Gọi service để lưu sản phẩm
      await ProductService.createProduct(newProduct);
      
      await ProductService.createProductImages(productImages);

      // Chuyển hướng về trang quản lý sản phẩm
      res.redirect("/admin/admin_shop");
    } catch (error) {
      console.error("Error adding product:", error.message);

      // Render lại trang thêm sản phẩm với thông báo lỗi
      res.render(PagePath.ADD_PRODUCT_PATH, {
        user,
        isLoggedIn: true,
        categories,
        manufacturers,
        error: error.message || "Đã có lỗi xảy ra!",
      });
    }
  }

  async showEditProduct(req, res) {
    const productId = req.query.id;

    if (!productId) {
      console.error("No product ID provided");
      return res.redirect(PagePath.ADMIN_SHOP_PATH);
    }

    try {
      const product = await ProductService.getProductById(productId);
      const categories = await ProductService.getAllCategories();
      const manufacturers = await ProductService.getAllManufacturer();

      if (!product) {
        console.error("Product not found");
        return res.redirect(PagePath.ADMIN_SHOP_PATH);
      }

      const user = req.user;
      res.render(PagePath.EDIT_PRODUCT_PATH, {
        user,
        isLoggedIn: true,
        product,
        categories,
        manufacturers,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).send(`Error loading product: ${error.message}`);
    }
  }

  async updateProduct(req, res) {
    try {
      const productId = req.params.id;
      const updateData = req.body;

      // Gọi hàm cập nhật
      const updatedProduct = await ProductService.updateProductById(
        productId,
        updateData
      );

      res.status(200).json({
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Error updating product:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  async showAdminProduct(req, res) {
    const productId = req.query.id;
    try {
      const product = await ProductService.getProductById(productId);
      const relatedProducts = await ProductService.getRelatedProducts(
        productId
      );

      if (!product) {
        console.error("Product not found");
        return res.render(PagePath.NOT_FOUND_PAGE_PATH);
      }

      const user = req.user;
      res.render(PagePath.ADMIN_PRODUCT_PATH, {
        user,
        isLoggedIn: true,
        product,
        relatedProducts,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  }

  async actionOnUser(req, res) {
    if (req.isAuthenticated()) {
      const userActionData = {
        status: req.body.status,
      };

      try {
        this.userService.updateUser(req.body.id, userActionData);
        const action = req.body.status == "ACTIVE" ? "unbanned" : "banned";

        res.json({
          success: true,
          message: "User " + action + " successfully!",
        });
      } catch (error) {
        res.json({ success: false, message: error.message });
      }
    } else {
      res.redirect('/login');
    }
  }

  async showDashboard(req, res) {
    if (!req.isAuthenticated()) {
      res.redirect("/login");
      return;
    }

    const timeRange = req.query.timeRange || "day";

    try {
      const revenueData = await this.orderService.getOrdersByTimeRange(timeRange);

      if (Object.keys(req.query).length !== 0) {
        const html = await ejs.renderFile("views/pages/admin/dashboardReport.ejs", { revenueData, timeRange });
        const revenue= JSON.stringify(revenueData);
        return res.json({ html, revenue });
      }

      res.render(PagePath.DASHBOARD_PAGE_PATH, {
        revenueData, 
        timeRange,
        isLoggedIn: true
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.json({ success: false, message: error.message });
    }
  }
}

export default new AdminController();
