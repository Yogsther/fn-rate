var socket = io.connect("213.66.254.63:25565");

var skins;
var thisRating = 0;
var currentSkin = 0;
var amountOfSkins = 0; // Disregards default outfits.
var myAccount;
var userRequested = false;
var firstLoad = true;
var colorSort = "rarity";
var sortMode = "rating";

socket.on("skins", data => {
    skins = data;
    justSort(sortMode);
    amountOfSkins = 0;
    document.getElementById("sort").value = sortMode;
    /* Load skins */
    for (let i = 0; i < skins.length; i++) {
        skins[i].img = new Image();
        skins[i].secondImg = new Image();
        skins[i].secondImg.id = "secondary";
        skins[i].thirdImg = new Image();
        skins[i].thirdImg.id = "third";
        try{
            skins[i].thirdImg.src = "img/featured/" + skins[i].code + ".png";
        } catch(e){}
        try {
            /* Supress error for skins without secondary image */
            skins[i].secondImg.src = "img/full/" + skins[i].code + ".png";
        } catch (e) {}
        skins[i].hasSecondImage = false;
        skins[i].hasThirdImage = false;
        skins[i].secondImg.onload = () => {
            skins[i].hasSecondImage = true
            if(currentSkin == i) inspect(i);
        };
        skins[i].thirdImg.onload = () => {
            skins[i].hasThirdImage = true;
            if(currentSkin == i) inspect(i);
        }
        skins[i].img.src = skins[i].src;
        var rarityColors = ["legendary", "#aa5228", "epic", "#6b41a8", "rare", "#007dbc", "uncommon", "#488c2c", "common", "#9d9d9d"]
        var color = 1;
        for (let j = 0; j < rarityColors.length; j++)
            if (skins[i].rarity == rarityColors[j]) color = j + 1;
        color = rarityColors[color];
        if (colorSort == "rating") {
            var percent = 1.2 - skins[i].rating / 5;
            var hue = ((1 - percent) * 120).toString(10);
            color = ["hsl(", hue, ",100%,50%)"].join("");
        }
        skins[i].img.style = 'background-color:' + color;
        skins[i].color = color;
        skins[i].img.draggable = 'false'
        if (skins[i].code != undefined && skins[i].code != "RECRUIT") amountOfSkins++;
        skins[i].img.addEventListener("click", () => {
            inspect(i);
        })
        skins[i].img.className = 'preview'
    }
    if (userRequested) {
        populateCollection();
        userRequested = false;
    }
    inspect(currentSkin);
});

socket.on("account", acc => {
    myAccount = acc;
    thisRating = myAccount.account[skins[currentSkin].code];
    updateStars(thisRating);
    updateStats();
    if (firstLoad) {
        populateCollection()
        firstLoad = false;
    }
    inspect(currentSkin);
    //console.log("Recived account: ", myAccount);
})

function updateStats() {
    var length = 0;
    var totalRate = 0;
    Object.keys(myAccount.account).forEach(function (key) {
        length++;
        totalRate += myAccount.account[key];
    });
    var average = Math.round((totalRate / length) * 100) / 100;
    if (length >= amountOfSkins) document.title = "FN Rate 🌟"
    document.getElementById("stats").innerHTML = "<i>Your stats:<br></i>Rated skins: " + length + "/" + amountOfSkins + "<br>Average rating: " + average;
}

var rarities = ["common", "uncommon", "rare", "epic", "legendary"];

function raritySort(a, b) {
    if (rarities.indexOf(a.rarity) > rarities.indexOf(b.rarity))
        return -1;
    if (rarities.indexOf(a.rarity) < rarities.indexOf(b.rarity))
        return 1;
    return 0;
}

function rateSort(a, b) {
    if (a.rating > b.rating)
        return -1;
    if (a.rating < b.rating)
        return 1;
    return 0;
}

function votes(a, b) {
    if (a.stars.reduce(add, 0) > b.stars.reduce(add, 0))
        return -1;
    if (a.stars.reduce(add, 0) < b.stars.reduce(add, 0))
        return 1;
    return 0;
}

function add(a, b) {
    return a + b;
}

function personalRating(a, b) {
    if (myAccount.account[a.code] > myAccount.account[b.code] || myAccount.account[a.code] == undefined)
        return -1;
    if (myAccount.account[a.code] < myAccount.account[b.code] || myAccount.account[b.code] == undefined)
        return 1;
    return 0;
}

function justSort /*lol*/ (val) {
    if (val == "rating") skins.sort(rateSort);
    if (val == "rarity") skins.sort(raritySort);
    if (val == "myrating") skins.sort(personalRating)
    if (val == "votes") skins.sort(votes);
    sortMode = val;
}

function sortBy(val) {
    if (val == "rating") skins.sort(rateSort);
    if (val == "rarity") skins.sort(raritySort);
    if (val == "myrating") skins.sort(personalRating)
    if (val == "votes") skins.sort(votes);
    sortMode = val;
    populateCollection();
    var i = 0;
    while (skins[i].code == "RECRUIT") i++;
    inspect(i)
}

var cosmeticFilter = "all";
function filter(val){
    cosmeticFilter = val;
    populateCollection();
    inspect(i); 
}

function populateCollection() {
    var search = document.getElementById("search").value;
    document.getElementById("collection").innerHTML = "";


    for (let i = 0; i < skins.length; i++) {
        var skip = false;
        if(cosmeticFilter != "all"){
            if(skins[i].type != cosmeticFilter) skip = true; 
        }
        if(!skip){
        var skin = skins[i];
        var skip = false;
        var searches = search.toLowerCase().split(" ");
        searches.forEach(s => {
            if (skin.name.toLowerCase().indexOf(s) == -1) skip = true;
        });

        if ((!skip || search == false) && skin.code != undefined && skin.code !== "RECRUIT") {
            var rating = skin.rating;
            //var myRating??
            var warn = "";
            if (myAccount !== undefined) {
                if (myAccount.account[skin.code] == undefined) warn = "!";
            }
            document.getElementById("collection").innerHTML += "<span title='" + skins[i].name + "' id='img_" + i + "' onclick='inspect(" + i + ")' class='container'><span class='preivew-rating'> " + rating + " </span><span class='my-rating'>" + warn + "</span></span>"
            document.getElementById("img_" + i).appendChild(skin.img)
        }
    }
    }
}


function setColor(val) {
    if (val == "rarity") colorSort = "rarity";
    if (val == "rating") colorSort = "rating";
    get();
}

function inspect(skinIndex) {
    currentSkin = skinIndex;
    try {
        thisRating = myAccount.account[skins[currentSkin].code];
        if (thisRating == undefined) thisRating = 0;
        updateStars(thisRating);
    } catch (e) {}
    var rating = thisRating;
    
    hideConfirm();
    
    document.getElementById("stars").innerHTML = "";
    document.getElementById("title").innerHTML = skins[skinIndex].name;
    document.getElementById("full").src = skins[skinIndex].src;

    if(!skins[skinIndex].hasSecondImage){
        document.getElementById("secondary-insert").innerHTML = ""
    } else {
        document.getElementById("secondary-insert").innerHTML = '';
        document.getElementById("secondary-insert").appendChild(skins[skinIndex].secondImg);
    }

    if(!skins[skinIndex].hasThirdImage){
        document.getElementById("third-insert").innerHTML = ""
    } else {
        document.getElementById("third-insert").innerHTML = '';
        document.getElementById("third-insert").appendChild(skins[skinIndex].thirdImg);
    }

    document.getElementById("image-wrap").style.background = skins[skinIndex].color;
    document.getElementById("rating").innerHTML = skins[skinIndex].rating;
    var bars = document.getElementsByClassName("bar");
    var maxStars = 0;
    //var skinVotes = skins[currentSkin].votesArr.slice();
    var totalVotes = 0;
    var votes = skins[currentSkin].stars;
    /* for (let i = 0; i < skinVotes.length; i++) {
        votes[skinVotes[i] - 1]++;
    } */
    votes.forEach(vote => totalVotes += vote)
    for (let i = 0; i < votes.length; i++) {
        if (votes[i] > votes[maxStars]) maxStars = i;
    }
    var part = 100 / votes[maxStars];
    for (let i = 0; i < bars.length; i++) {
        var width = (votes[i] * part);
        if (isNaN(width)) width = 0;
        bars[4 - i].style.width = width + "%";
        bars[4 - i].innerHTML = votes[i]
    }
    updateStars(rating);
    document.getElementById("amount").innerHTML = totalVotes;
}

var starsRating = undefined;

function updateStars(rating) {
    if (starsRating == rating && document.getElementById("stars").innerHTML != "") return;
    starsRating = rating;
    document.getElementById("stars").innerHTML = "";
    for (let i = 0; i < 5; i++) {
        var texture = "img/star_gold.png";
        if (i + 1 > rating) texture = "img/star_grey.png";
        document.getElementById("stars").innerHTML += "<img src=" + texture + " class='star' onmouseout='resetStars()' onclick='rate(" + (i + 1) + ")' onmouseover='updateStars(" + (i + 1) + ")' >"
    }
}

document.addEventListener("mousemove", e => {
    found = false;
    e.path.forEach(path => {
        if(path.id == "stars"){
            found = true;
        }
    })
    if(!found) resetStars();
})

socket.on("confirmedVote", pack => {
    if(skins[currentSkin].code == pack.skin && pack.rating == thisRating){
        confirmVote();
    }
})

function confirmVote(){
    document.getElementById("check").title = "Vote has been recorded."
    document.getElementById("check").src = "oh_hi_mark.png"
    document.getElementById("check").style.transform = "scale(1)";
}

function pendingVote(){
    document.getElementById("check").title = "Vote has been sent."
    document.getElementById("check").src = "unconfirmed.png"
    document.getElementById("img_" + currentSkin).children[1].innerHTML = "";
    document.getElementById("check").style.transform = "scale(1)";
}

function hideConfirm(){
    document.getElementById("check").style.transform = "scale(0)";
}


function updateAccount(rating){
    myAccount.account[skins[currentSkin].code] = rating;
    thisRating = rating;
    updateStars(rating);
}


function rate(rating) {
    if(rating === thisRating) return;
    rateUpdate = true;
    socket.emit("rate", {
        skin: skins[currentSkin].code,
        rating: rating
    });
    pendingVote();
    updateAccount(rating);
}

function get() {
    userRequested = true;
    socket.emit("get");
}

function resetStars() {
    updateStars(thisRating);
}

var rateUpdate = false;







/* Basic listener
socket.on("name", function(package){
    // Do something
}); */

/* Emit to server (example) */
/* var package = new Object();
socket.emit("name", package); */