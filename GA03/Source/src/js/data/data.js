import { Product } from "../models/Product.js";

let products = [];
products.push(new Product("product1", "/src/assets/images/products/product1.jpg", "Product 1", true, "Brand A", "Sofa", "BE45VGRT", 45.00, 55.90, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos eius eum reprehenderit dolore vel mollitia optio consequatur hic asperiores inventore suscipit, velit consequuntur, voluptate doloremque iure necessitatibus adipisci magnam porro."));
products.push(new Product("product2", "/src/assets/images/products/product2.jpg", "Product 2", false, "Brand B", "Sofa", "BE46VGRT", 55.00, 65.90, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos eius eum reprehenderit dolore vel mollitia optio consequatur hic asperiores inventore suscipit, velit consequuntur, voluptate doloremque iure necessitatibus adipisci magnam porro."));
products.push(new Product("product3", "/src/assets/images/products/product3.jpg", "Product 3", true, "Brand C", "Bed", "BE47VGRT", 65.00, 75.90, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos eius eum reprehenderit dolore vel mollitia optio consequatur hic asperiores inventore suscipit, velit consequuntur, voluptate doloremque iure necessitatibus adipisci magnam porro."));
products.push(new Product("product4", "/src/assets/images/products/product4.jpg", "Product 4", false, "Brand D", "Bed", "BE48VGRT", 75.00, 85.90, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos eius eum reprehenderit dolore vel mollitia optio consequatur hic asperiores inventore suscipit, velit consequuntur, voluptate doloremque iure necessitatibus adipisci magnam porro."));
products.push(new Product("product5", "/src/assets/images/products/product5.jpg", "Product 5", true, "Brand E", "Kitchen", "BE49VGRT", 65.00, 75.90, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos eius eum reprehenderit dolore vel mollitia optio consequatur hic asperiores inventore suscipit, velit consequuntur, voluptate doloremque iure necessitatibus adipisci magnam porro."));
products.push(new Product("product6", "/src/assets/images/products/product6.jpg", "Product 6", false, "Brand F", "Chair", "BE50VGRT", 45.00, 55.90, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos eius eum reprehenderit dolore vel mollitia optio consequatur hic asperiores inventore suscipit, velit consequuntur, voluptate doloremque iure necessitatibus adipisci magnam porro."));


let topNewArrivals = [];
topNewArrivals.push(new Product("product1", "/src/assets/images/products/product1.jpg", "Product 1", true, "Brand A", "Sofa", "BE45VGRT", 45.00, 55.90, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos eius eum reprehenderit dolore vel mollitia optio consequatur hic asperiores inventore suscipit, velit consequuntur, voluptate doloremque iure necessitatibus adipisci magnam porro."));
topNewArrivals.push(new Product("product2", "/src/assets/images/products/product2.jpg", "Product 2", false, "Brand B", "Sofa", "BE46VGRT", 55.00, 65.90, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos eius eum reprehenderit dolore vel mollitia optio consequatur hic asperiores inventore suscipit, velit consequuntur, voluptate doloremque iure necessitatibus adipisci magnam porro."));
topNewArrivals.push(new Product("product3", "/src/assets/images/products/product3.jpg", "Product 3", true, "Brand C", "Bed", "BE47VGRT", 65.00, 75.90, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos eius eum reprehenderit dolore vel mollitia optio consequatur hic asperiores inventore suscipit, velit consequuntur, voluptate doloremque iure necessitatibus adipisci magnam porro."));
topNewArrivals.push(new Product("product4", "/src/assets/images/products/product4.jpg", "Product 4", false, "Brand D", "Bed", "BE48VGRT", 75.00, 85.90, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos eius eum reprehenderit dolore vel mollitia optio consequatur hic asperiores inventore suscipit, velit consequuntur, voluptate doloremque iure necessitatibus adipisci magnam porro."));

export { products, topNewArrivals };