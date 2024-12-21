const db = require("../../db/index");
const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

// 设置存储引擎
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../resources/images/qm");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log(`文件上传至: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + path.extname(file.originalname);
    console.log(`生成文件名: ${fileName}`);
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制文件大小为 5MB
});

exports.uploadImage = (req, res) => {
  console.log("Received request for file upload");
  upload.single("file")(req, res, async (err) => {
    if (err) {
      console.error("文件上传失败:", err);
      return res.status(400).send({
        code: 400,
        message: err.message,
      });
    }

    if (!req.file) {
      console.error("文件未上传");
      return res.status(400).send({
        code: 400,
        message: "文件未上传",
      });
    }

    try {
      // 读取上传的图片文件
      const imageBuffer = fs.readFileSync(req.file.path);

      // 将图片转换为灰度图并调整尺寸为 50x50
      const resizedGrayImageBuffer = await sharp(imageBuffer)
        .resize(50, 50)
        .grayscale()
        .raw()
        .toBuffer();

      // 获取图像的宽度和高度
      const width = 50;
      const height = 50;

      // 遍历每个像素点，根据阈值将其转换为二进制值
      let binaryString = "";
      const threshold = 128; // 可以根据需要调整阈值

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixelIndex = y * width + x;
          const pixelValue = resizedGrayImageBuffer[pixelIndex];
          binaryString += pixelValue < threshold ? "1" : "0";
        }
      }

      // 将二进制字符串存入数据库
      const query = "INSERT INTO qm (`binary`) VALUES (?)";

      if (!binaryString || !req.file.path) {
        return res.status(400).send({
          code: 400,
          message: "缺少必要的参数",
        });
      }

      db.query(query, [binaryString], (err, result) => {
        if (err) {
          console.error("数据库插入失败:", err);
          return res.status(500).send({
            code: 500,
            message: "数据库插入失败",
          });
        }

        console.log("文件上传成功并处理完成:", req.file.path);
        return res.send({
          code: 200,
          data: binaryString,
        });
      });
    } catch (error) {
      console.error("图像处理失败:", error);
      return res.status(500).send({
        code: 500,
        message: "图像处理失败",
      });
    }
  });
};

exports.clearData = (req, res) => {
  const query = "TRUNCATE TABLE qm";

  db.query(query, (err, result) => {
    if (err) {
      console.error("清空数据失败:", err);
      return res.status(500).send({
        code: 500,
        message: "清空数据失败",
      });
    }

    console.log("数据已成功清空");
    return res.send({
      code: 200,
      message: "数据已成功清空",
    });
  });
};

exports.svgBinary = (req, res) => {
  db.query("select * from qm", (err, ressults) => {
    if (err) {
      console.error("从数据库获取数据错误:", err);
      res.status(500).json({ error: "Internal server error" });
    }

    const svgDataArray = ressults.map((row) => row.binary);
    return res.send(svgDataArray);
  });
};
