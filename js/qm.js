const BASE = "http://127.0.0.1:3007";
let str = [];
//处理svg
let lines = []; //用于储存svg内的所有line标签
let length = 50;
let current_str = 0;

let lbStr = [];
let lbStr_lines = [];
let lbStr_length = 50;
let current_lbStr = 0;

// 获取文件及请求
function handleFiles(files) {
  //获取图片
  if (files.length) {
    let file = files[0];
    let img = document.getElementById("picture");
    let reader = new FileReader();
    reader.onload = function (e) {
      if (e.target.readyState === 2) {
        img.src = e.target.result;
      }
    };

    reader.readAsDataURL(file);
    handle_svg(file, false);
  } else {
    console.log("no files selected");
  }
}

//处理svg
function handle_svg(file, flag) {
  //上传至后端
  let formData = new FormData();
  formData.append("file", file);
  fetch(BASE + "/qm/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      str.push(data.data);

      function init() {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${length} ${length}`);
        for (let i = 1; i <= length; i++) {
          let line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          line.setAttribute("x1", 0);
          line.setAttribute("y1", i);
          line.setAttribute("x2", length);
          line.setAttribute("y2", i);
          line.setAttribute("stroke", "#000000");
          line.setAttribute("stroke-width", "1");
          svg.appendChild(line);
          lines.push(line);
        }

        let svgContainer = document.querySelector(".container");
        svgContainer.appendChild(svg);
        draw(str[current_str]);
      }

      function draw(string) {
        lines.forEach((line, index) => {
          let str_data = string
            .slice(index * length, index * length + length)
            .split("");
          let dasharray = "0";
          str_data.forEach((nums) => {
            // 如果当前点为1,即存在颜色点,该点为背景色,则设置dasharray长度为1的实线
            if (parseInt(nums)) dasharray += " 0 1";
            // 如果当前点为0,即不存在颜色点,该点为前景色,则设置dasharray长度为1的空白间隙
            else dasharray += " 1 0";
          });
          line.style.transitionDelay = `${Math.random()}s`;
          line.style.strokeDasharray = dasharray;
        });
      }
      init();
    })
    .catch((err) => {
      alert("上传失败");
      console.log(err);
    });
}

//刷新
function flushed() {
  window.location.reload();
}

//清空数据库
function clearData() {
  fetch(BASE + "/qm/clearData", { method: "POST" })
    .then((res) => res.json())
    .then((data) => {
      if (data.code === 200) alert("清空成功");
    });
}

//连播
function lb() {
  fetch(BASE + "/qm/svgBinary", {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      data.forEach((item) => lbStr.push(item));
      console.log(lbStr);
      function initLb() {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${lbStr_length} ${lbStr_length}`);
        for (let i = 1; i <= lbStr_length; i++) {
          let lbStr_line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          lbStr_line.setAttribute("x1", 0);
          lbStr_line.setAttribute("y1", i);
          lbStr_line.setAttribute("x2", length);
          lbStr_line.setAttribute("y2", i);
          lbStr_line.setAttribute("stroke", "#000000");
          lbStr_line.setAttribute("stroke-width", "1");
          svg.appendChild(lbStr_line);
          lbStr_lines.push(lbStr_line);
        }

        let svgContainer = document.querySelector(".container");
        svgContainer.appendChild(svg);
        console.log(lbStr[current_lbStr]);
        draw(lbStr[current_lbStr]);
        // 每2秒钟改变一次line元素的stroke-dasharray,更新视图上的点阵内容,并循环执行
        setInterval(() => {
          current_lbStr = (current_lbStr + 1) % lbStr.length;
          draw(lbStr[current_lbStr]);
        }, 2000);
      }

      function draw(string) {
        console.log(string);
        lbStr_lines.forEach((line, index) => {
          let lbStr_data = string
            .slice(index * lbStr_length, index * lbStr_length + lbStr_length)
            .split("");

          console.log(lbStr_data);
          let dasharray = "0";
          lbStr_data.forEach((nums) => {
            // 如果当前点为1,即存在颜色点,该点为背景色,则设置dasharray长度为1的实线
            if (parseInt(nums)) dasharray += " 0 1";
            // 如果当前点为0,即不存在颜色点,该点为前景色,则设置dasharray长度为1的空白间隙
            else dasharray += " 1 0";
          });
          line.style.transitionDelay = `${Math.random()}s`;
          line.style.strokeDasharray = dasharray;
        });
      }
      initLb();
    })
    .catch((err) => {
      alert("上传失败");
      console.log(err);
    });
}
