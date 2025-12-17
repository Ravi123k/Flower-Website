// main.js - Final Working Version

// 1. Select the elements
// We use a specific name 'camVideo' to avoid conflicts with existing variables
const camVideo = document.getElementById('video');
let isBloomed = false; 

// 2. Safety Check: Is the AI library loaded?
if (typeof faceapi === 'undefined') {
    console.error("ERROR: face-api.js not loaded. Check index.html script tags.");
    alert("Critical Error: AI Library not found.");
}

// 3. Load the AI Models
// These files must exist in a folder named 'models' next to your HTML file
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(() => {
    console.log("AI Models Loaded. Starting Camera...");
    startCamera();
}).catch(err => {
    console.error("MODEL LOAD ERROR:", err);
    alert("Error: Could not load models. Check if the 'models' folder exists.");
});

// 4. Start the Webcam
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            camVideo.srcObject = stream;
            console.log("Camera started successfully.");
        })
        .catch(err => {
            console.error("CAMERA ERROR:", err);
            alert("Camera failed to start. Please use 'Live Server' and allow permissions.");
        });
}

// 5. Detect Smiles Loop
camVideo.addEventListener('play', () => {
    // Create a loop that runs every 100 milliseconds
    setInterval(async () => {
        // If flowers are already blooming, stop checking (saves battery)
        if (isBloomed) return; 

        try {
            // Detect faces using the Tiny detector (faster)
            const detections = await faceapi.detectAllFaces(camVideo, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            if (detections.length > 0) {
                // Get the expressions of the first face found
                const expressions = detections[0].expressions;
                
                // Debugging: Log the happiness score to console (F12)
                // console.log("Happy Score:", expressions.happy); 

                // Check if happy score is above 0.5 (50% smile)
                if (expressions.happy > 0.5) {
                    triggerBloom();
                }
            }
        } catch (error) {
            console.error("Detection Error (Is video playing?):", error);
        }
    }, 100);
});

// 6. The Function to Bloom Flowers & Play Music
function triggerBloom() {
    if (isBloomed) return; // Stop if already running
    isBloomed = true;
    
    console.log("SMILE DETECTED! Blooming now...");

    // Remove the class that holds the animation back
    document.body.classList.remove("not-loaded");
    
    // Play the music
    const audio = document.getElementById('bg-music');
    if (audio) {
        audio.volume = 0.5;
        audio.loop = true;
        audio.play().catch(e => console.warn("Audio autoplay blocked until user interaction", e));
    }
}
