let mic;
let fft;
let shapes = [];
let currentShape = 0;
let startAudio = false;

let maxStars = 7300;  
let scatteredCircles = []; 

let images = []; 
let currentImageIndex = 0; 
let lastImageChangeTime = 0;
let imageChangeInterval = 10000;
let showRandomImages = false;
let randomImageDuration = 500; 
let randomImageStartTime = 1000; 
let one, two, three;
let zoidIntroSpeech, obsdianIntroSpeech, zoidWin, byeZoid, intro;

let debugMode = true; // Set to true to enable debug mode

// Slider for sensitivity
let sensitivitySlider;
let myFont;

function preload() {
    one = loadImage('UPDATE/ObsidianPunch.png');
    two = loadImage('UPDATE/ZoidPunch.png');
    three = loadImage('UPDATE/ZoidKickpng.png');
    images[0] = loadImage('UPDATE/OBSIDIANKICK.png'); 
    images[1] = loadImage('UPDATE/ZOIDSUPERPUNCH.png'); 
    zoidIntroSpeech= loadImage('UPDATE/ZoidSpeech.gif');
    obsdianIntroSpeech= loadImage('UPDATE/ObsidianSpeech.gif');
    zoidWin= loadImage('UPDATE/ZoidWinsgif.gif');
    byeZoid= loadImage('UPDATE/BYEZOID.gif');
    intro= loadImage('UPDATE/zoid.gif');
    myFont = loadFont('FG.ttf');
}

function setup() {
    createCanvas(1600, 1000);
    
    mic = new p5.AudioIn();
    mic.start();

    fft = new p5.FFT(0.9, 128);
    fft.setInput(mic);

    shapes = [
        () => { image(one, 0, 0, width, height); },
        () => { image(two, 0, 0, width, height); },
        () => { image(three, 0, 0, width, height); }
    ];

    for (let i = 0; i < maxStars; i++) {
        let circle = {
            distance: random(120, 900),     
            offsetAngle: random(TWO_PI),   
            size: random(1, 5),            
        };
        scatteredCircles.push(circle);
    }

    // Create the sensitivity slider
    sensitivitySlider = createSlider(0, 1, 0.5, 0.01); // min, max, default, step
    sensitivitySlider.position(20, 20); // Position on the canvas
    sensitivitySlider.style('width', '200px'); // Width of the slider
}

function draw() {
    if (showRandomImages) {
        image(images[currentImageIndex], 0, 0, width, height); 

        if (millis() - randomImageStartTime > randomImageDuration) {
            showRandomImages = false; 
            lastImageChangeTime = millis(); 
        }
        return;
    }

    let gradient = drawingContext.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width
    );
    gradient.addColorStop(0, '#7343bf');
    gradient.addColorStop(1, '#3259cf');
    drawingContext.fillStyle = gradient;
    drawingContext.fillRect(0, 0, width, height);
    
    if (!startAudio) {
        let imgWidth = intro.width * 1.95; // Adjust the multiplier to change the size
        let imgHeight = intro.height * 1.95; // Adjust the multiplier to change the size
        image(intro, (width - imgWidth) / 2, (height - imgHeight) / 2, imgWidth, imgHeight);
        
    }

    if (startAudio) {
        if (millis() < 6000) {
            image(zoidIntroSpeech, 0, 0, width, height);
            return;
        } else if (millis() < 12000) {
            image(obsdianIntroSpeech, 0, 0, width, height);
            return;
        }

        fft.analyze();
        let volume = mic.getLevel();
        let bassEnergy = fft.getEnergy("bass");
        let midEnergy = fft.getEnergy("mid");
        let trebleEnergy = fft.getEnergy("treble");

        // Use the slider value to adjust sensitivity
        let sensitivity = sensitivitySlider.value();
        let numStars = int(map(volume * sensitivity, 0, 1, 0, maxStars));

        for (let i = 0; i < numStars; i++) {
            let currentAngle = scatteredCircles[i].offsetAngle;
            scatteredCircles[i].offsetAngle += 0.01;

            let x = scatteredCircles[i].distance * cos(currentAngle);
            let y = scatteredCircles[i].distance * sin(currentAngle);

            fill(255); 
            noStroke();
            ellipse(x + width / 2, y + height / 2, scatteredCircles[i].size); 
        }

        if (bassEnergy > 200) {
            currentShape = 0;
        } else if (midEnergy > 100) {
            currentShape = 1;
        } else if (trebleEnergy > 50) {
            currentShape = 2;
        }

        shapes[currentShape](); 

        if (millis() - lastImageChangeTime > imageChangeInterval) {
            currentImageIndex = floor(random(images.length)); 
            lastImageChangeTime = millis();
            showRandomImages = true;
            randomImageStartTime = millis();
        }

        // Debug information
        if (debugMode) {
            fill(255);
            textSize(.1); // Increased text size for visibility
            textAlign(LEFT, TOP);
            text(`Volume: ${nf(volume, 0, 3)}`, 10, 10);
            text(`Number of Stars: ${numStars}`, 10, 30);
            text(`Bass Energy: ${bassEnergy}`, 10, 50);
            text(`Mid Energy: ${midEnergy}`, 10, 70);
            text(`Treble Energy: ${trebleEnergy}`, 10, 90);
            text(`Current Shape: ${currentShape}`, 10, 110);
            text(`Sensitivity: ${nf(sensitivity, 0, 2)}`, 10, 130); // Display sensitivity value
        }
    }
    
}


function mousePressed() {
    getAudioContext().resume();
    if (!startAudio) {
        mic = new p5.AudioIn();
        mic.start();
        fft = new p5.FFT();
        fft.setInput(mic);
        startAudio = true;
    }
}
//I dont know why it isnt loading on the website
// Function to handle key presses
function keyPressed() {
    if (key === 'e' || key === 'E') {
        let showZoidWin = random() > 0.5;
        let startTime = millis();

        function showImage() {
            background(0); // Clear the background
            if (millis() - startTime < 10000) {
                if (showZoidWin) {
                    background(250, 246, 197);
                    image(zoidWin, 0, 0, width, height);
                    textSize(32);
                    textFont(myFont);
                    fill(230, 86, 8 );
                    text("I won, I can't wait to tell mother!", 1000, height / 2);
                } else {
                    image(byeZoid, 0, 0, width, height);
                    textSize(32);
                    textFont(myFont);
                    fill(255);
                    textAlign(CENTER, CENTER);
                    text("Tell mother I said Hi!", 1000, height / 2);

                }
            } else {
                draw = originalDraw; // Restore the original draw function
                startAudio = false;
            }
        }

        draw = showImage;
    }
}

// Store the original draw function
let originalDraw = draw;