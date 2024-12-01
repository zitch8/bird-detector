const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const previewContainer = document.getElementById("preview-container");
const previewImage = document.getElementById("preview-image");
const placeholderText = document.getElementById("placeholder-text");
const closeBtn = document.getElementById("close-btn");
const resultDisplay = document.getElementById("result-display");
resultDisplay.style.display = "none";
const anchor = document.getElementById('anchor');

let jsonData = null;
let currentAbortController = null;

// Drag-and-Drop Events
dropZone.addEventListener("dragover", (event) => {
    if (!dropZone.classList.contains("disabled")) {
        event.preventDefault();
        dropZone.classList.add("bg-light");
    }
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("bg-light");
});

dropZone.addEventListener("drop", (event) => {
    if (!dropZone.classList.contains("disabled")) {
        event.preventDefault();
        dropZone.classList.remove("bg-light");
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleFileUpload(file);
        } else {
            alert("Please drop a valid image file!");
        }
    }
});

// File Input Click Trigger
dropZone.addEventListener("click", (event) => {
    if (!dropZone.classList.contains("disabled") && event.target.id !== "close-btn") {
        fileInput.click();
    }
});

// File Input Change Event
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file && file.type.startsWith("image/")) {
        handleFileUpload(file);
    }
});

// Handle File Upload
function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = () => {
        previewImage.src = reader.result;
        placeholderText.style.display = "none";
        previewContainer.style.display = "block";
        dropZone.classList.add("disabled");
    };
    reader.readAsDataURL(file);
}

// Handle File Send
function sendFile() {
    
    if (currentAbortController) {
        currentAbortController.abort();
        
    }

    currentAbortController = new AbortController();

    if (jsonData != null){
        clearResults();
    }
    const file = fileInput.files[0]; // fileInput is the file input element
    console.log("file", file)
    if (!file) {
        alert("Please upload an image before clicking detect.");
        return;
    }
    resultDisplay.style.display = "block"
    const spinner = document.getElementById("loading-spinner");
    console.log('spinner', spinner)
    spinner.style.display = "block";

    anchor.scrollIntoView({
        behavior: "smooth",
        block: "end",
    });

    const formData = new FormData();
    formData.append("image", file);

    // Send the file to the Flask API
    fetch("http://127.0.0.1:8080/", {
        method: "POST",
        body: formData,
        signal: currentAbortController.signal,
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("File upload failed!");
            }
        })
        .then((data) => {
            console.log("Predictions:", data);

            // Handle and display the predictions here
            const resultContent = document.getElementById('result-content')
            resultContent.style.display = "block";
            const file = fileInput.files[0];
            if (file && file.type.startsWith("image/")) {
                displayImage(file)
            }
            jsonData = data;
            spinner.style.display = "none";
            renderResults();
            anchor.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
            
            
        })
        .catch((error) => {
            if (error.name === "AbortError") {
                console.log("Fetch request was aborted");
                alert("Fetch request was aborted")
            } else {
                console.error("Error:", error);
                alert("An error occurred while sending the file.");
            }
            spinner.style.display = "none";
            resultDisplay.style.display = "none";
        })
        .finally(()=>{
            currentAbortController = null;
        })
}

// Handle Close Button Click
closeBtn.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent triggering click on the drop area
    previewImage.src = "";
    previewContainer.style.display = "none";
    placeholderText.style.display = "block";
    fileInput.value = "";
    dropZone.classList.remove("disabled");
});


// Image Preview

const preview = document.getElementById('preview');

function displayImage(file) {
    const reader = new FileReader();
    reader.onload = () => {
        preview.src = reader.result;
        preview.hidden = false;
    };
    reader.readAsDataURL(file);
}



// Circle progress bar
function renderResults() {
    if (!jsonData) {
        console.error("No data to render!");
        return;
    }

    // const previewImage = document.getElementById("preview");
    // const displayImage = document.querySelector(".img-fluid");
    // previewImage.src = ""; // Clear the preview image
    // displayImage.src = ""; // Clear the display image

    const progressValueElement = document.getElementById("progress-value");
    const progressCircle = document.querySelector(".progress-circle");
    const confidenceFirst = document.getElementById("confidence-first");

    function updateProgress(value) {
        const percentage = Math.min(Math.max(value, 0), 100);
        progressCircle.style.background = `conic-gradient(#38966D 0% ${percentage}%, transparent ${percentage}% 100%)`;
        progressValueElement.textContent = `${percentage}%`;
    }

    const confidencePercentage = (jsonData[0].confidence * 100).toFixed(2);
    updateProgress(confidencePercentage);

    const h2Element = document.createElement("h2");
    const h3Element = document.createElement("h3");
    h2Element.textContent = `${jsonData[0].class}`;
    h3Element.textContent = `${confidencePercentage}% Probability`;

    confidenceFirst.appendChild(h2Element);
    confidenceFirst.appendChild(h3Element);

    const container = document.getElementById("confidence-container");

    for (let i = 1; i < jsonData.length; i++) {
        if (jsonData[i].confidence * 100 === 0) {
            break;
        }

        const h5Element = document.createElement("h5");
        h5Element.classList.add("card-title");
        const h6Element = document.createElement("h6");
        h6Element.classList.add("card-");
        const div = document.createElement("div");
        div.classList.add("col-md-5", "card", "p-3", "m-2");

        h5Element.textContent = `${jsonData[i].class}`;
        h6Element.textContent = `${(jsonData[i].confidence * 100).toFixed(2)}% Probability`;

        div.appendChild(h5Element);
        div.appendChild(h6Element);
        container.appendChild(div);
    }
}

// Clear the Results

function clearResults() {
    // Reset preview and display images
    // const previewImage = document.getElementById("preview");
    // const displayImage = document.querySelector(".img-fluid");
    // previewImage.src = "";
    // displayImage.src = "";
    
    const resultContent = document.getElementById('result-content')
    resultContent.style.display = "none";

    // Clear confidence-first container
    const confidenceFirst = document.getElementById("confidence-first");
    while (confidenceFirst.firstChild) {
        confidenceFirst.removeChild(confidenceFirst.firstChild);
    }

    // Clear confidence-container (all dynamically added cards)
    const confidenceContainer = document.getElementById("confidence-container");
    while (confidenceContainer.firstChild) {
        confidenceContainer.removeChild(confidenceContainer.firstChild);
    }

    // Optionally reset any other UI elements modified by renderResults
    const resultDisplay = document.getElementById("result-display");
    resultDisplay.style.display = "none";

    // Clear jsonData if required
    jsonData = null;
    console.log("Results cleared, jsonData reset to null.");
}


// document.addEventListener('DOMContentLoaded', () => {
//     console.log('jsonData', jsonData)
//     const previewImage = document.getElementById("preview");
//     const displayImage = document.querySelector(".img-fluid");
//     previewImage.src = ""; // Clear the preview image
//     displayImage.src = ""; // Clear the display image

//     const progressValueElement = document.getElementById('progress-value');
//     const progressCircle = document.querySelector('.progress-circle');
//     const confidenceFirst = document.getElementById('confidence-first');
    
//     function updateProgress(value) {
//         const percentage = Math.min(Math.max(value, 0), 100); // Clamp between 0 and 100
//         progressCircle.style.background = `conic-gradient(#38966D 0% ${percentage}%, transparent ${percentage}% 100%)`;
//         progressValueElement.textContent = `${percentage}%`;
//     }

//     // Compute for confidence scores
//     const confidencePercentage = (jsonData[0].confidence * 100).toFixed(2);
//     updateProgress(confidencePercentage);
//     const h2Element = document.createElement('h2');
//     const h3Element = document.createElement('h3');
//     h2Element.textContent= `${(jsonData[0].class)}`
//     h3Element.textContent = `${confidencePercentage}% Probability`

//     confidenceFirst.appendChild(h2Element);
//     confidenceFirst.appendChild(h3Element);
    

//     const container = document.getElementById('confidence-container') // Replace with a specific container if needed

//     for (let i = 1; i < jsonData.length; i++) {
//         if ((jsonData[i].confidence * 100) == 0){
//             break;
//         }

//         // Create a new <h5> <h6> element
//         const h5Element = document.createElement('h5');
//         h5Element.classList.add('card-title')
//         const h6Element = document.createElement('h6');
//         h6Element.classList.add('card-')
//         const div = document.createElement('div');
//         div.classList.add('col-md-5')
//         div.classList.add('card')
//         div.classList.add('p-3')
//         div.classList.add('m-2')
        
//         // Set the content of the <h5> <h6>
//         h5Element.textContent = `${(jsonData[i].class)}`;
//         h6Element.textContent = `${(jsonData[i].confidence * 100).toFixed(2)}% Probability`
        
//         // Append the <h5> <h6> element to the container
//         div.appendChild(h5Element);
//         div.appendChild(h6Element);
//         container.appendChild(div);
//     }
// });





// // Example: Update progress value dynamically
// let progress = 0;
// const interval = setInterval(() => {
//     progress += 10;
//     updateProgress(progress);
//     if (progress >= 100) clearInterval(interval);
// }, 1000);
