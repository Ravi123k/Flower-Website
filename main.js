// main.js - Final Version with Permission Button & Smile Prompt

const camVideo = document.getElementById('video');
const enableBtn = document.getElementById('btn-enable');
const permissionModal = document.getElementById('permission-modal');
const smilePrompt = document.getElementById('smile-prompt'); 
const audio = document.getElementById('bg-music');
let isBloomed = false; 

// 1. Safety Check: Is the library loaded?
if (typeof faceapi === 'undefined') {
    console.error("Critical Error: face-api.js not loaded.");
    alert("Error: face-api.js library missing. Check index.html");
}

// 2. Load AI Models in the background immediately
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(() => {
    console.log("AI Models Loaded. Waiting for user permission...");
}).catch(err => {
    console.error("MODEL ERROR:", err);
    alert("Error loading AI models. Check 'models' folder.");
});

// 3. Button Click Event: The "Key" to unlock everything
enableBtn.addEventListener('click', () => {
    console.log("User clicked Enable.");

    // A. Unlock Audio Engine (Crucial for Android/iPhone)
    // We play silence for a split second to get browser permission
    audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
    }).catch(e => console.log("Audio permission interaction captured"));

    // B. Hide the Permission Modal
    permissionModal.style.opacity = '0';
    setTimeout(() => {
        permissionModal.style.display = 'none';
    }, 500);

    // C. Show the "Smile to Bloom" Prompt after a small delay
    setTimeout(() => {
        if (!isBloomed) {
            smilePrompt.style.opacity = '1'; 
        }
    }, 600);

    // D. Start the Camera
    startCamera();
});

// 4. Start Webcam Function
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            camVideo.srcObject = stream;
            console.log("Camera started.");
        })
        .catch(err => {
            console.error("Camera Error:", err);
            alert("Please allow camera access to see the magic!");
        });
}

// 5. Detection Loop (Runs when camera is playing)
camVideo.addEventListener('play', () => {
    // Run the detection code every 100 milliseconds
    setInterval(async () => {
        // If already bloomed, stop checking to save battery
        if (isBloomed) return; 

        try {
            // Detect faces using the Tiny detector (fast & lightweight)
            const detections = await faceapi.detectAllFaces(camVideo, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            if (detections.length > 0) {
                const expressions = detections[0].expressions;
                
                // Debug: Uncomment this line to see your smile score in the console (F12)
                // console.log("Happy Score:", expressions.happy);

                // Check if happiness score is above 0.5 (50%)
                if (expressions.happy > 0.5) {
                    triggerBloom();
                }
            }
        } catch (error) {
            // Ignore small errors while camera is initializing
            // console.warn("Detection Loop Warning:", error);
        }
    }, 100);
});

// 6. The Bloom Function
function triggerBloom() {
    if (isBloomed) return; // Prevent double triggering
    isBloomed = true;

    console.log("SMILE DETECTED! Blooming...");

    // Hide the "Smile to Bloom" text immediately
    smilePrompt.style.opacity = '0';
    setTimeout(() => { smilePrompt.style.display = 'none'; }, 500);

    // Remove the class that holds the flower animation back
    document.body.classList.remove("not-loaded");
    
    // Play the Music (This works now because we unlocked it in Step 3)
    audio.volume = 0.5;
    audio.loop = true;
    audio.play(); 
}
