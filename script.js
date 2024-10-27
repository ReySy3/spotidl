particlesJS.load('particles-js', 'particles.json', function() {
    console.log('particles.js loaded - callback');
});

function downloadTrack() {
    const spotifyUrl = document.getElementById('spotifyUrl').value;
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const downloadProgress = document.getElementById('downloadProgress');
    const progressBar = document.getElementById('progressBar');

    if (!spotifyUrl) {
        alert('Please enter a Spotify URL');
        return;
    }

    loading.style.display = 'block';
    result.style.display = 'none';
    downloadProgress.style.display = 'none';

    fetch(`/spotify?q=${encodeURIComponent(spotifyUrl)}`)
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none';
            result.style.display = 'block';
            downloadProgress.style.display = 'block';

            document.getElementById('albumArt').src = data.result.image;
            document.getElementById('title').textContent = data.result.title;
            document.getElementById('artist').textContent = data.result.artist;
            document.getElementById('duration').textContent = formatDuration(data.result.duration);

            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                progressBar.style.width = `${progress}%`;
                if (progress >= 100) {
                    clearInterval(interval);
                    initAudioPlayer(data.result.download_url);
                    downloadProgress.style.display = 'none';
                }
            }, 500);
        })
        .catch(error => {
            loading.style.display = 'none';
            alert('Error: ' + error.message);
        });
}

function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function initAudioPlayer(audioSrc) {
    const audioElement = document.getElementById('audioElement');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const progressBar = document.querySelector('.progress-bar');
    const progressContainer = document.querySelector('.progress-container');
    const progressIndicator = document.querySelector('.progress-indicator');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const volumeSlider = document.querySelector('.volume-slider');
    const downloadBtn = document.getElementById('downloadBtn');

    audioElement.src = audioSrc;

    playPauseBtn.addEventListener('click', togglePlayPause);
    muteBtn.addEventListener('click', toggleMute);
    progressContainer.addEventListener('click', seek);
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audioElement.duration);
    });
    volumeSlider.addEventListener('input', adjustVolume);
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = audioSrc;
        link.style.borderRadius = '20px';
        link.download = 'audio.mp3';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    function togglePlayPause() {
        if (audioElement.paused) {
            audioElement.play();
            playPauseBtn.textContent = '⏸️';
        } else {
            audioElement.pause();
            playPauseBtn.textContent = '▶️';
        }
    }

    function toggleMute() {
        audioElement.muted = !audioElement.muted;
        muteBtn.textContent = audioElement.muted ? '🔇' : '🔊';
        volumeSlider.value = audioElement.muted ? 0 : audioElement.volume;
    }

    function seek(e) {
        const percent = e.offsetX / progressContainer.offsetWidth;
        audioElement.currentTime = percent * audioElement.duration;
    }

    function updateProgress() {
        const percent = (audioElement.currentTime / audioElement.duration) * 100;
        progressBar.style.width = `${percent}%`;
        progressIndicator.style.left = `${percent}%`;
        currentTimeEl.textContent = formatTime(audioElement.currentTime);
    }

    function adjustVolume() {
        audioElement.volume = volumeSlider.value;
        audioElement.muted = false;
        muteBtn.textContent = '🔊';
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}