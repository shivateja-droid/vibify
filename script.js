console.log("Script loaded successfully");
let currentsong = new Audio();
let songs;
let currentfolder;
let plus;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currentfolder = folder;
    let res = await fetch(`./${folder}/songs.json`);
    songs = await res.json();
    let libname = document.querySelector(".libname");
    libname.innerHTML = "";
    libname.innerHTML = libname.innerHTML + `<span>${currentfolder.split("/")[1]}</span>`;

    let songslist = document.querySelector(".songslist ul");
    songslist.innerHTML = " ";
    for (let song of songs) {
        songslist.innerHTML = songslist.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                            <div class="songinfo">
                                <div>${song.split("-")[0]}</div>
                                <div>${song.split("-")[1].replace(".mp3", "")}</div>
                            </div>
                            <div class="playnow">
                                <div>play now</div>
                                <img class="invert" src="img/leftplay.svg" alt="">
                            </div></li>` ;

    }

    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML + "-" + e.querySelector(".songinfo").lastElementChild.innerHTML + ".mp3");
        })
    })

    return songs;
}
const playMusic = (track, pause = false) => {
    currentsong.src = `./${currentfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".info").innerHTML = track.split("-")[0] + " - " + track.split("-")[1].replace(".mp3", "");
    document.querySelector(".duration").innerHTML = "00:00/00:00";
}

async function displayAlbums() {
    console.log("Displaying albums");

    const folders = ["chillout", "folk", "hiphop", "pop", "rock"];
    const cardcontainer = document.querySelector(".cardcontainer");
    cardcontainer.innerHTML = "";

    for (let folder of folders) {
        try {
            const infoRes = await fetch(`./songs/${folder}/info.json`);
            const info = await infoRes.json();

            cardcontainer.innerHTML += `
                <div data-folder="${folder}" class="cards bg-greyr">
                    <div class="cover">
                        <img src="./songs/${folder}/cover.jpeg" alt="${info.title}">
                        <div class="play-button">
                            <img src="img/greenplay.svg" alt="play button">
                        </div>
                    </div>
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>
            `;
        } catch (error) {
            console.error(`Failed to load info for folder: ${folder}`, error);
        }
    }

    // Add click events for album cards
    Array.from(document.getElementsByClassName("cards")).forEach(card => {
        card.addEventListener("click", async () => {
            console.log(`Fetching songs from ${card.dataset.folder}`);
            songs = await getsongs(`songs/${card.dataset.folder}`);
        });
    });
}

async function main() {

    await getsongs("./songs/chillout");
    playMusic(songs[0], true);

    await displayAlbums();


    //event listeners for play
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    })
    //event listeners for previous and next song
    prevsong.addEventListener("click", () => {
        console.log("Previous song clicked");
        let filename = currentsong.src.split("/").pop();
        let currentIndex = songs.indexOf(filename);
        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1]);
        }
    });
    nextsong.addEventListener("click", () => {
        console.log("Next song clicked");
        let filename = currentsong.src.split("/").pop();
        let currentIndex = songs.indexOf(filename);
        if (currentIndex < songs.length - 1) {
            playMusic(songs[currentIndex + 1]);
        }
    });

    //event listeners for time update
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".duration").innerHTML = secondsToMinutesSeconds(currentsong.currentTime) + "/" + secondsToMinutesSeconds(currentsong.duration);
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
        if (currentsong.ended) {
            play.src = "img/play.svg";
            document.querySelector(".circle").style.left = "0%";
            let filename = currentsong.src.split("/").pop();
            let currentIndex = songs.indexOf(filename);
            if (currentIndex < songs.length - 1) {
                playMusic(songs[currentIndex + 1]);
            }
        }
    });

    //event listeners for seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekbar = document.querySelector(".seekbar");
        const seekbarWidth = seekbar.offsetWidth;
        const clickX = e.clientX - seekbar.getBoundingClientRect().left;
        const newTime = (clickX / seekbarWidth) * currentsong.duration;
        currentsong.currentTime = newTime;
    });
    //event listeners for hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-10px";
        document.querySelector(".library img#plus").src = "img/close.svg";
    })

    //event listeners for close
    document.querySelector(".library img#plus").addEventListener("click", () => {
        if (document.querySelector(".left").style.left === "-10px") {
            document.querySelector(".left").style.left = "-120%";
            document.querySelector(".library img#plus").src = "img/library.svg";
        }
    });


    //event listeners for volume control
    volumeslider.addEventListener("input", () => {
        currentsong.volume = volumeslider.value / 100;
        if (currentsong.volume === 0) {
            volumeicon.src = "img/mute.svg";
        } else {
            volumeicon.src = "img/volume.svg";
        }
        // Update the volume icon based on the current volume
        volumeicon.addEventListener("click", () => {
            if (currentsong.volume > 0.01) {
                currentsong.volume = 0;
                volumeslider.value = 0;
                volumeicon.src = "img/mute.svg";
                console.log("Volume muted");
            } else {
                currentsong.volume = 0.5;
                volumeslider.value = 50;
                volumeicon.src = "img/volume.svg";
            }
        });
    });


}
main();