require("dotenv").config({ path: "./config/config.env" });const mongoose = require('mongoose');
const UserModel = require('./models/userModel');
const ProductModel = require('./models/productModel');
const { faker } = require('@faker-js/faker');
const axios = require('axios');
const fs = require('fs');
const { parse } = require('csv-parse');
const cloudinary=require("cloudinary");

console.log(process.env.DB_URI);

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const initCategory = async () => {
  list = [
    'Apple',
    'Avocado',
    'Banana',
    'Kiwi',
    'Lemon',
    'Lime',
    'Mango',
    'Melon',
    'Nectarine',
    'Orange',
    'Papaya',
    'Passion-Fruit',
    'Peach',
    'Pear',
    'Pineapple',
    'Plum',
    'Pomegranate',
    'Red-Grapefruit',
    'Satsumas',
    'Juice',
    'Milk',
    'Oatghurt',
    'Oat-Milk',
    'Soyghurt',
    'Soy-Milk',
    'Yoghurt',
    'Asparagus',
    'Aubergine',
    'Cabbage',
    'Carrots',
    'Cucumber',
    'Garlic',
    'Ginger',
    'Leek',
    'Mushroom',
    'Onion',
    'Pepper',
    'Potato',
    'Red-Beet',
    'Tomato',
    'Zucchini',
  ];
  for (let element of list) {
    try {
      const userDoc = await CategoryModel.create({
        name: element,
      });
      console.log(userDoc);
    } catch (error) {
      console.log(error);
    }
  }
  console.log('Added Categories!!');
};

const initSellers = async (n) => {
  axios.defaults.baseURL = 'http://localhost:4000/';

  for (i = 0; i < n; i++) {
    const name = faker.name.fullName();
    const myCloud = await cloudinary.v2.uploader.upload(faker.internet.avatar(), {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });
  console.log({
      name: name,
      email: faker.internet.email(...name.split(' ').slice(-2)),
      password: faker.internet.password(),
      avatar:{
         public_id: myCloud.public_id,
         url: myCloud.secure_url,
      },   
      role: 'seller',
    });
    // await axios.post('/register', {
    //   name: name,
    //   email: faker.internet.email(...name.split(' ').slice(-2)),
    //   password: faker.internet.password(),
    //   avatar:{
    //      public_id: myCloud.public_id,
    //      url: myCloud.secure_url,
    //   },   
    //   role: 'seller',
    // });
  }
  console.log('Added Sellers!!');
};

const getSellerId = async () => {
  const arr = [];
  try {
    const result = await UserModel.find({ role: 'seller' });
    for (let elements of result) {
      arr.push(elements._id);
    }
  } catch (err) {}
  return arr;
};

const initProducts = async () => {
  fs.readFile('./output.csv', 'utf8', (error, data) => {
    if (error) {
      console.error(error);
    } else {
      parse(
        data,
        {
          columns: true,
          skip_empty_lines: true,
        },
        async (parseError, output) => {
          if (parseError) {
            console.error(parseError);
          } else {
            const arr = await getSellerId();
            for (let elements of output) {
              try {
                const test = await CategoryModel.findOne({
                  name: elements['Coarse Class Name (str)'],
                });
                const userDoc = await ProductModel.create({
                  product_name: elements['Class Name (str)'],
                  product_desc: elements['Product Description Path (str)'],
                  images: [elements['Iconic Image Path (str)']],
                  price: Math.floor(Math.random() * (300 - 50 + 1)) + 50,
                  category_id: test._id,
                  seller_id: arr[Math.floor(Math.random() * arr.length)],
                });
                console.log(userDoc);
              } catch (err) {
                console.log(err);
              }
            }
          }
        }
      );
    }
  });
  console.log('Added Products!!');
};

// initCategory();
initSellers(10);
// initProducts();
// mongoose.connection.close()
