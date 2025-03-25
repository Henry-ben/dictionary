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
    if (!word) {
        alert("Please enter a valid word.");
        return;
    }
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
            <div style="display: flex; align-items: center; gap: 400px;">
                <h3 style="font-size: 280%; margin: 0; padding-top: 30px;">${wordText}</h3>
                ${audioSrc ? `<button id="playButton" onclick="playAudio('${audioSrc}')" style="background: none; border: none;">
                    <img src="image/icon-play.svg" alt="Play" style="width: 60px; height: 60px;">
                </button>` : ''}
            </div>
            <p><span style="color: rgb(193, 15, 193); font-size: 180%;">${phonetic}</span></p>
            ${meanings}
            <p><strong>Synonyms:</strong> <span style="color: rgb(193, 15, 193);">${synonyms}</span></p>
        `;

        document.getElementById("output").innerHTML = resultHTML;
        if (audioSrc) {
            document.getElementById("audioPlayer").src = audioSrc;
        }
    } catch (error) {
        document.getElementById("output").innerHTML = `<p class="error" style="color:red;">${error}</p>`;
    }
}

function playAudio(audioSrc) {
    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.src = audioSrc;
    audioPlayer.play();
}

document.getElementById("themeToggle").addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
});

document.getElementById("fontSelect").addEventListener("change", function() {
    document.body.style.fontFamily = this.value;
});
