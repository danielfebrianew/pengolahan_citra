const filterOptions = document.querySelectorAll(".filter button");
const flip = document.querySelectorAll(".rotate button");
const resetFilterBtn = document.querySelector(".reset-filter");
const downloadBtn = document.getElementById("downloadBtn");


// Ambil id kanvas dan membuat obj image
const cvs = document.getElementById("kanvas"),
    ctx = cvs.getContext("2d"),
    myImg = new Image();

$(myImg).attr("src", "image-preview.png");

const readURL = input => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            $(myImg).attr("src", e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
        $('.ascii-box').remove();
        $(cvs).show();
    }
};

// ganti gambar saat ada perubahan
$(imgFile).change(function () {
    readURL(this);
});


$(myImg).load(function () {
    const imgData = setImage()
    console.log(imgData)
});

// Mengganti fitur operasi citra
filterOptions.forEach(option => {
    option.addEventListener("click", () => {
        document.querySelector(".active").classList.remove("active");
        option.classList.add("active");

        let imgData;
        imgData = setImage();

        if(option.id === "inverse") {
            imgInverse(imgData);
        } else if(option.id === "grayscale") {
            imgGrayscale(imgData);
        } else if(option.id === "binary") {
            imgBinary(imgData);
        } else if(option.id === "not") {
            imgBinaryNot(imgData);
        } else if(option.id === "gausialFilter") {
            filterGaussian();
        }else if(option.id === "sobel") {
            tepiSobel(imgData);
        }
    });
});

const setImage = () => {
    const aspectRatio = myImg.naturalWidth / myImg.naturalHeight;

    // Memberi dimensi ke canva
    const canvasWidth = 437;
    const canvasHeight = 316;

    // Menghitung dimensi untuk memenuhi canva sesuai rasio yang ada
    let newWidth, newHeight;
    if (aspectRatio > canvasWidth / canvasHeight) {
        newWidth = canvasWidth;
        newHeight = canvasWidth / aspectRatio;
    } else {
        newWidth = canvasHeight * aspectRatio;
        newHeight = canvasHeight;
    }

    // Atur kembali canva sesuai dimensi yang udah diperbarui
    $(kanvas).attr("width", canvasWidth);
    $(kanvas).attr("height", canvasHeight);

    const x = (canvasWidth - newWidth) / 2;
    const y = (canvasHeight - newHeight) / 2;

    // gambar image ke canva
    ctx.drawImage(myImg, x, y, newWidth, newHeight);

    return imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
}

// Citra Negatif
const imgInverse = (imgData) => {
    for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 255 - imgData.data[i] | 0;
        imgData.data[i + 1] = 255 - imgData.data[i + 1] | 0;
        imgData.data[i + 2] = 255 - imgData.data[i + 2] | 0;
    }

    // Memperbarui data image
    ctx.putImageData(imgData, 0, 0);

    // Ganti judul operasi
    $(".imgtitle span").text("Citra Negatif");
};

// Citra Grayscale
const imgGrayscale = (imgData) => {
    for (let i = 0; i < imgData.data.length; i += 4) {
        let gr = imgData.data[i] * 0.299 + imgData.data[i + 1] * 0.587 + imgData.data[i + 2] * 0.114;
        if (gr < 0) gr = 0;
        if (gr > 255) gr = 255;
        imgData.data[i] = gr;
        imgData.data[i + 1] = gr;
        imgData.data[i + 2] = gr;
    }

    // Memperbarui data image
    ctx.putImageData(imgData, 0, 0);

    // Ganti judul operasi
    $(".imgtitle span").text("Citra Keabuan");
};

// Citra Biner
const imgBinary = (imgData) => {
    for (let i = 0; i < imgData.data.length; i += 4) {
        let gr = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
        if (gr <= 128) gr = 0;
        if (gr > 128) gr = 255;
        imgData.data[i] = gr;
        imgData.data[i + 1] = gr;
        imgData.data[i + 2] = gr;
    }

    // Memperbarui data image
    ctx.putImageData(imgData, 0, 0);

    // Ganti judul operasi
    $(".imgtitle span").text("Citra Biner");
};

// Operasi Sobel
const tepiSobel = (imgData) => {
    let p, i, j, temp;
    const tempR = temp = imgData.data;
    const iWidth = imgData.width, iHeight = imgData.height;

    // Lakukan operasi citra
    for (i = 0; i < (iHeight - 1); i++) {
        for (j = 0; j < (iWidth - 1); j++) {

            for (p = 0; p < 3; p++) { // p adalah penentu pixel r, g b

                const sx =
                    (temp[((iWidth * (i - 1)) + (j - 1)) * 4 + p] * (-1)) +
                    (temp[((iWidth * (i + 0)) + (j - 1)) * 4 + p] * (-2)) +
                    (temp[((iWidth * (i + 1)) + (j - 1)) * 4 + p] * (-1)) +

                    (temp[((iWidth * (i - 1)) + (j + 1)) * 4 + p] * (1)) +
                    (temp[((iWidth * (i + 0)) + (j + 1)) * 4 + p] * (2)) +
                    (temp[((iWidth * (i + 1)) + (j + 1)) * 4 + p] * (1));

                const sy =
                    (temp[((iWidth * (i - 1)) + (j - 1)) * 4 + p] * (1)) +
                    (temp[((iWidth * (i - 1)) + (j + 0)) * 4 + p] * (2)) +
                    (temp[((iWidth * (i - 1)) + (j + 1)) * 4 + p] * (1)) +

                    (temp[((iWidth * (i + 1)) + (j - 1)) * 4 + p] * (-1)) +
                    (temp[((iWidth * (i + 1)) + (j + 0)) * 4 + p] * (-2)) +
                    (temp[((iWidth * (i + 1)) + (j + 1)) * 4 + p] * (-1));

                const hit = 255 - (Math.abs(sx) + Math.abs(sy));
                tempR[((iWidth * i) + j) * 4 + p] = hit;
            }
        }
    }
    imgData.data = tempR;

    // Memperbarui data image
    ctx.putImageData(imgData, 0, 0);

    // Ganti judul operasi
    $(".imgtitle span").text("Deteksi Tepi Sobel");

};

const filterGaussian = () => {
    radius = 15;
    if (typeof radius !== 'number') {
        console.log('radius must be a number');
        return;
    }
    if (radius < 1) {
        console.log('radius must be greater than 0');
        return;
    }

    const r = radius,
        rs = Math.ceil(r * 2.57);

    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    const temp = imgData.data,
        iWidth = imgData.width,
        iHeight = imgData.height;

    const weights = new Array(rs * 2 + 1);
    let wsum = 0;

    for (let i = -rs; i <= rs; i++) {
        weights[i + rs] = Math.exp(-(i * i) / (2 * r * r)) / (Math.PI * 2 * r * r);
        wsum += weights[i + rs];
    }

    for (let y = 0; y < iHeight; y++) {
        for (let x = 0; x < iWidth; x++) {
            let red = 0,
                green = 0,
                blue = 0,
                alpha = 0;

            for (let i = -rs; i <= rs; i++) {
                let iy = Math.min(iHeight - 1, Math.max(0, y + i));
                let idx = (iy * iWidth + x) << 2;

                red += temp[idx] * weights[i + rs];
                green += temp[idx + 1] * weights[i + rs];
                blue += temp[idx + 2] * weights[i + rs];
                alpha += temp[idx + 3] * weights[i + rs];
            }

            let idx = (y * iWidth + x) << 2;
            temp[idx] = Math.round(red / wsum);
            temp[idx + 1] = Math.round(green / wsum);
            temp[idx + 2] = Math.round(blue / wsum);
            temp[idx + 3] = Math.round(alpha / wsum);
        }
    }

    imgData.data = temp;
    ctx.putImageData(imgData, 0, 0);
    $('.imgtitle span').text('Gaussian Blur');
};


// filter dan rotate
flip.forEach(option => {
    option.addEventListener("click", () => {
        if(option.id === "vertical") {
            flipVertikal();
        } else if(option.id === "horizontal") {
            flipHorizontal();
        } else if(option.id === "left") {
            rotate("left");
        } else if(option.id === "right") {
            rotate("right");
        }
    });
});

// Flip Vertikal
const flipVertikal = () => {
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    let x, y, i, j,
        iWidth = imgData.width,
        iHeight = imgData.height;

    // Lakukan operasi citra
    for (y = 0; y < (iHeight / 2); y++) {
        i = iHeight - 1 - y;
        for (x = 0; x < iWidth; x++) {
            const pixel = ((iWidth * y) + x) * 4,
                mirror = ((iWidth * i) + x) * 4;

            for (let p = 0; p < 4; p++) {
                const temporary = imgData.data[pixel + p];
                imgData.data[pixel + p] = imgData.data[mirror + p];
                imgData.data[mirror + p] = temporary;
            }
        }
    }

    // Memperbarui data image
    ctx.putImageData(imgData, 0, 0);
}

// Flip Horizontal
const flipHorizontal = () => {
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    let x, y, i, j,
        iWidth = imgData.width,
        iHeight = imgData.height;

    // Lakukan operasi citra
    for (y = 0; y < iHeight; y++) {
        for (x = 0; x < (iWidth / 2); x++) {
            j = iWidth - 1 - x;
            const pixel = ((iWidth * y) + x) * 4,
                mirror = ((iWidth * y) + j) * 4;

            for (let p = 0; p < 4; p++) {
                const temporary = imgData.data[pixel + p];
                imgData.data[pixel + p] = imgData.data[mirror + p];
                imgData.data[mirror + p] = temporary;
            }
        }
    }

    // Memperbarui data image
    ctx.putImageData(imgData, 0, 0);
}

const rotate = (direction) => {
    const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    const iWidth = imgData.width;
    const iHeight = imgData.height;

    const newImgData = ctx.createImageData(iHeight, iWidth);

    for (let y = 0; y < iHeight; y++) {
        for (let x = 0; x < iWidth; x++) {
            const sourcePixel = ((iWidth * y) + x) * 4;
            let destPixel;

            if (direction === 'left') {
                destPixel = ((x * iHeight) + (iHeight - y - 1)) * 4;
            } else if (direction === 'right') {
                destPixel = ((iHeight * (iWidth - x - 1)) + y) * 4;
            }

            for (let p = 0; p < 4; p++) {
                newImgData.data[destPixel + p] = imgData.data[sourcePixel + p];
            }
        }
    }

    cvs.width = iHeight;
    cvs.height = iWidth;

    // Memperbarui data image
    ctx.putImageData(newImgData, 0, 0);
};

//  Reset
const imgReset = () => {
    setImage();
    $("#inp-brightness").val(0);
    $("#inp-contrast").val(100);
    $(cvs).show();
};

downloadBtn.addEventListener("click", function () {
    const dataUrl = cvs.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "downloaded_image.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

resetFilterBtn.addEventListener("click", imgReset);