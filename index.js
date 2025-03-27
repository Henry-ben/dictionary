async function fetchData(word) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (!response.ok) {
                reject("Word not found.");
                return;
            }
            const data = await response.json();
            if (!data || !data.length) {
                reject("Word not found.");
                return;
            }
            resolve(data);
        } catch (error) {
            reject("Failed to fetch data. Check your internet connection.");
        }
    });
}

async function search() {
    let word = document.getElementById("wordInput").value.trim();
    let output = document.getElementById("output");
    let searchButton = document.querySelector(".search-bar button");
    if (!word) {
        alert("Please enter a valid word.");
        return;
    }

    output.innerHTML = `<div class="loader"></div>`;


    searchButton.disabled = true;


    try {
        const data = await fetchData(word);
        const wordText = data[0].word;
        const phonetic = data[0].phonetic || "No phonetic available";
        const meanings = data[0].meanings.map(m => `
            <h3>${m.partOfSpeech}</h3>
            <ul>${m.definitions.map(d => `<li>${d.definition}</li>`).join('')}</ul>
        `).join('');
        const synonyms = data[0].meanings.flatMap(m => m.synonyms).slice(0, 5).join(", ") || "No synonyms available.";
        const phonetics = data[0].phonetics.find(p => p.audio);
        const audioSrc = phonetics ? phonetics.audio : null;
        
        let resultHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <h3 style="font-size: 280%; margin: 0; padding-top: 30px;">${wordText}</h3>
                ${audioSrc ? `<button id="playButton" onclick="playAudio('${audioSrc}')" style="background: none; border: none;">
                  <img src = "image/icon-play.svg">
                </button>` : ''}
                <div class="audio-container">
                    <button id="mouthButton" onclick="playPronunciation() , playImage.style.display = 'none'">
                        <img src = "image/circle-play-regular.svg" id = "playImage">
                        <div class="mouth"></div>
                    </button>
                    <audio id="audioPlayer"></audio>
                </div>
                <label class="speed-switch">
                    <input type="checkbox" id="speed" onchange="updateSpeedLabel()">
                    <span class="adjust">
                        <span id="speedLabel"></span>
                    </span>
               </label>

            </div>
            <p><span style="color: rgb(193, 15, 193); font-size: 180%;">${phonetic}</span></p>
            ${meanings}
            <p><strong>Synonyms:</strong> <span style="color: rgb(193, 15, 193);">${synonyms}</span></p>
        `;

        output.innerHTML = resultHTML;
        if (audioSrc) {
            document.getElementById("audioPlayer").src = audioSrc;
        }
    } catch (error) {
        document.getElementById("output").innerHTML = `<p class="error" style="color:red;">${error}</p>`;
    }

    finally {
        searchButton.disabled = false;
    }
}

function playAudio(audioSrc) {
    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.src = audioSrc;
    audioPlayer.play();
    playPronunciation();
}

document.getElementById("themeToggle").addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
});

document.getElementById("fontSelect").addEventListener("change", function() {
    document.body.style.fontFamily = this.value;
});


document.getElementById("wordInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        search();
    }
});


function updateSpeedLabel() {
    let speedLabel = document.getElementById("speedLabel");
    let speedToggle = document.getElementById("speed");
    
    if (speedToggle.checked) {
        speedLabel.textContent = "Slow";
    } else {
        speedLabel.textContent = "Normal";
    }
}

async function playPronunciation() {
    let word = document.getElementById("wordInput").value.trim();
    if (!word) {
        alert("Please enter a word first.");
        return;
    }

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = await response.json();
        
        if (!data || !data.length) {
            alert("Pronunciation not available.");
            return;
        }

        const phonetics = data[0].phonetics.find(p => p.audio);
        if (!phonetics || !phonetics.audio) {
            alert("Audio not available.");
            return;
        }

        const audioPlayer = document.getElementById("audioPlayer");
        audioPlayer.src = phonetics.audio;

        // Set speed based on toggle
        const speedToggle = document.getElementById("speed");
        audioPlayer.playbackRate = speedToggle.checked ? 0.5 : 1.0; // slow or normal

        audioPlayer.play();

        // Adjust mouth animation speed
        const mouth = document.querySelector(".mouth");
        mouth.style.animation = `talk ${speedToggle.checked ? '0.5s' : '0.3s'} infinite alternate`;

        // Stop animation when audio ends
        audioPlayer.onended = () => {
            mouth.style.animation = "none";
            playImage.style.display = 'block';
        };
    } catch (error) {
        alert("Error fetching pronunciation.");
    }
    

}
