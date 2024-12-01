const preview = document.getElementById('preview');

function displayImage(file) {
    const reader = new FileReader();
    reader.onload = () => {
        preview.src = reader.result;
        preview.hidden = false;
    };
    reader.readAsDataURL(file);
}



// circle progress bar

const jsonData = [
    {
        "class": "PHILIPPINE EAGLE",
        "class_id": 386,
        "confidence": 0.9977
    },
    {
        "class": "ORNATE HAWK EAGLE",
        "class_id": 371,
        "confidence": 0.0001
    },
    {
        "class": "RED TAILED HAWK",
        "class_id": 415,
        "confidence": 0.0001
    },
    {
        "class": "ABBOTTS BABBLER",
        "class_id": 0,
        "confidence": 0.0
    },
    {
        "class": "ABBOTTS BOOBY",
        "class_id": 1,
        "confidence": 0.0
    }
];



document.addEventListener('DOMContentLoaded', () => {
    const progressValueElement = document.getElementById('progress-value');
    const progressCircle = document.querySelector('.progress-circle');
    const confidenceFirst = document.getElementById('confidence-first');
    
    function updateProgress(value, element, circle) {
        const percentage = Math.min(Math.max(value, 0), 100); // Clamp between 0 and 100
        progressCircle.style.background = `conic-gradient(#38966D 0% ${percentage}%, transparent ${percentage}% 100%)`;
        progressValueElement.textContent = `${percentage}%`;
    }

    // Test the function with a fixed value
    const confidencePercentage = (jsonData[0].confidence * 100).toFixed(2);
    updateProgress(confidencePercentage);
    const h2Element = document.createElement('h2');
    const h3Element = document.createElement('h3');
    h2Element.textContent= `${(jsonData[0].class)}`
    h3Element.textContent = `${confidencePercentage}% Probability`

    confidenceFirst.appendChild(h2Element);
    confidenceFirst.appendChild(h3Element);
    

    const container = document.getElementById('confidence-container') // Replace with a specific container if needed

    for (let i = 1; i < jsonData.length; i++) {
        if ((jsonData[i].confidence * 100) == 0){
            break;
        }
        // Create a new <h2> element
        const h5Element = document.createElement('h5');
        h5Element.classList.add('card-title')
        const h6Element = document.createElement('h6');
        const div = document.createElement('div');
        div.classList.add('col-md-5')
        div.classList.add('card')
        div.classList.add('p-3')
        div.classList.add('m-2')
        
        // Set the content of the <h2>
        h5Element.textContent = `${(jsonData[i].class)}`;
        h6Element.textContent = `${(jsonData[i].confidence * 100).toFixed(2)}% Probability`
        
        // Append the <h2> element to the container
        div.appendChild(h5Element);
        div.appendChild(h6Element);
        container.appendChild(div);
    }
});





// // Example: Update progress value dynamically
// let progress = 0;
// const interval = setInterval(() => {
//     progress += 10;
//     updateProgress(progress);
//     if (progress >= 100) clearInterval(interval);
// }, 1000);
