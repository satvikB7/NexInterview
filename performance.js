var apiBaseUrl = "http://localhost:8000"; // Update when deploying

async function fetchPerformanceChart() {
    try {
        let track = sessionStorage.getItem("track"); // Assuming you store the selected track
        let endpoint = `${apiBaseUrl}/performance_chart/`;

        if (track == "Java") {
            endpoint = `${apiBaseUrl}/performance_chart1/`;
        }
        if (track == "Python") {
            endpoint = `${apiBaseUrl}/performance_chart2/`;
        }
        if (track == "MERN") {
            endpoint = `${apiBaseUrl}/performance_chart3/`;
        }
        if (track == "AI/ML") {
            endpoint = `${apiBaseUrl}/performance_chart4/`;
        }
        if (track == "HR") {
            endpoint = `${apiBaseUrl}/performance_chart/`;
        }


        const response = await fetch(endpoint);

        // If the response is an image, directly set the src attribute
        if (response.ok && response.headers.get("content-type").includes("image")) {
            document.getElementById("performanceMessage").style.display = "none"; 
            document.getElementById("performanceChart").src = endpoint;
            document.getElementById("performanceChartContainer").style.display = "block"; 
        } else {
            const data = await response.json(); // This should only run if JSON is expected
            if (data.message) { 
                document.getElementById("performanceMessage").innerHTML = 
                    'No performance analysis available. Answer at least 3 questions.<br>' +
                    '<span style="color: #28a745; font-weight: bold; font-size: 1.2em;">Thanks for practicing! 🎯</span>';
                document.getElementById("performanceMessage").style.display = "block";
                document.getElementById("performanceChartContainer").style.display = "none"; 
            }
        }
    } catch (error) {
        console.error("Error fetching performance chart:", error);
        alert("Error fetching performance data.");
    }
}


async function resetPerformance() {
    try {
        await fetch(`${apiBaseUrl}/reset_performance/`); 
    } catch (error) {
        console.error("Error resetting performance scores:", error);
    }
}

// Navigate back to home and reset performance scores
async function returnHome() {
    await resetPerformance();  // Ensure scores are reset before navigating
    window.location.href = "interviews.html";
}

// Load performance chart on page load
window.onload = function () {
    fetchPerformanceChart();
};

// Enlarge image when clicked, show close (X) button
document.addEventListener("DOMContentLoaded", function () {
    const chart = document.getElementById("performanceChart");

    chart.addEventListener("click", function () {
        if (this.src) {
            // Create overlay
            const overlay = document.createElement("div");
            overlay.id = "imageOverlay";
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100vw";
            overlay.style.height = "100vh";
            overlay.style.background = "rgba(0,0,0,0.8)";
            overlay.style.display = "flex";
            overlay.style.justifyContent = "center";
            overlay.style.alignItems = "center";
            overlay.style.zIndex = "1000";

            // Create enlarged image
            const img = document.createElement("img");
            img.src = this.src;
            img.style.maxWidth = "90vw";
            img.style.maxHeight = "90vh";
            img.style.borderRadius = "10px";
            img.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.5)";
            img.style.cursor = "pointer";

            // Create close button (X)
            const closeButton = document.createElement("span");
            closeButton.innerHTML = "&times;";
            closeButton.style.position = "fixed";
            closeButton.style.top = "20px";
            closeButton.style.right = "30px";
            closeButton.style.fontSize = "40px";
            closeButton.style.color = "white";
            closeButton.style.cursor = "pointer";
            closeButton.style.fontWeight = "bold";
            closeButton.style.zIndex = "1001";
            closeButton.style.background = "rgba(0,0,0,0.5)";
            closeButton.style.padding = "5px 15px";
            closeButton.style.borderRadius = "5px";

            // Function to remove overlay
            function closeOverlay() {
                document.body.removeChild(overlay);
            }

            // Close on X button click
            closeButton.addEventListener("click", closeOverlay);

            // Close when clicking outside the image
            overlay.addEventListener("click", closeOverlay);

            // Prevent closing when clicking the image itself
            img.addEventListener("click", function (event) {
                event.stopPropagation();
            });

            overlay.appendChild(img);
            overlay.appendChild(closeButton);
            document.body.appendChild(overlay);
        }
    });
});
