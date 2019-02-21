/**
 * FN Rate, Olle Kaiser 2018
 */

var admin = false;
var options = {};
var overwriteInspect = false;
var currentSkin = undefined;
var onMobile = mobilecheck();

var seasonRatings = [];

/* Get URL before connecting to the server to make sure the right skin gets inspected. */
getULR();

var socket = io.connect('flip.livfor.it:3074');

/**
 * Declare global variables
 */

var skins;
var thisRating = 0;
var amountOfSkins = 0; // Disregards default outfits.
var myAccount;
var userRequested = false;
var firstLoad = true;
var colorSort = "rarity";
var sortMode = "rating";
var accountWorth = "?";

var errorMessages = [
    "Can't reach the server!",
    "Oh no!",
    "Something went wrong!",
    "I'm not getting a response!",
    "It's taking longer than usual!",
]

var statusCheck = setTimeout(() => {
    document.getElementById("loading-main").innerHTML = errorMessages[Math.floor(Math.random() * errorMessages.length)]
    document.getElementById("loading-tips").innerHTML = "Most likley I am doing maintenance, come back in an hour. If it's still not up by then, please contact me on Reddit! (u/Yogsther)"
}, 10000 /* Ten seconds */  ); 

socket.on("connect", () => {
    document.getElementById("loading-main").innerHTML = "Downloading content..."
    document.getElementById("loading-tips").innerHTML = "Server is online, downloading skin-data."

    clearTimeout(statusCheck);
})


var tips = [
    "You can change your username at the top of the page!",
    "You can upvote or downvote comments.",
    "Keep your comments civil, we delete overly-toxic comments and can suspend disruptive users.",
    'Under "Your stats" you can find your commenting karma.',
    "You can search for skins in the top left corner.",
    "If you find any bugs or want to give a suggestion regarding the website, please contact me on Reddit (u/Yogsther) or Github @ Yogsther",
    "Sorting by your own rating is a good way to find skins you haven't rated on yet."
]

document.getElementById("loading-tips").innerText = tips[Math.floor(Math.random() * tips.length)]


window.onload = () => {
    updateCanvas();
    renderCanvas();
    applyThemeColor();
    changeOverlay("news")
    if (lastVisit < news[0].date) {
        toggleOverlay();
    }
}

function mobilecheck() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};


var dontPush = true;

window.onpopstate = () => {
    getULR();
    dontPush = true;
    if (!overwriteInspect) return;
    for (let i = 0; i < skins.length; i++) {
        if (skins[i].code.toLowerCase() == options.skin.toLowerCase() && skins[i].type.toLowerCase() == options.type.toLowerCase()) {
            inspect(i);
        }
    }
}

window.onresize = () => {
    updateCanvas();
    graphCanvas.width = canvas.width;
    resetGraph();
};


/**
 * Get URL options. If it directly links to a specific skin, inspect that skin.
 */

function getULR() {
    var url = window.location.href;
    var urlOptions = url.substr(url.indexOf("?") + 1, url.length).split("&");

    if (urlOptions.length > 1) {
        overwriteInspect = true;
    } else {
        currentSkin = 0;
    }

    urlOptions.forEach(option => {
        option = option.split("=");
        options[option[0]] = option[1];
    })
}



function applyAdmin() {
    document.getElementById("username").style.boxShadow = "5px 0px 0px #cf2445";
    //document.getElementById("admin-deck-insert").innerHTML = " <a href=\"admin.html\" target=\"_blank\" style='color:#ff6262; margin-left:25px;' title=\"Only for moderators.\">Admin deck<\/a> ";
}


function applyThemeColor() {
    //newColor = themeColor;

    var bars = document.getElementsByClassName("bar")
    for (let el of bars) el.style.background = newColor;

    document.getElementById("header").style.boxShadow = "0px 5px 0px " + newColor
}


var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function updateCanvas() {
    canvas.width = document.getElementById("image-wrap").offsetWidth;
    canvas.height = document.getElementById("image-wrap").offsetHeight + 5;
    initGraphDisplay();
}


var overlayOpen = false;



/* TODO: Have news serverside. */
var news = [{
    date: 1550358000000,
    title: "Check out my new website, <a href='http://flip.livfor.it'>flip.livfor.it</a>",
    image: "img/news/flip.png",
    message: "<b><a href='http://flip.livfor.it'>Click here to visit it!</a></b> I created a new website where you can create and share animations.<br> It works on mobile and PC. Creating a new account just takes a few seconds and no email is required! You can like others flip notes and follow users.<br><br>If you wish to apply as a moderator, please PM me on Reddit (u/Yogsther) or Github (@Yogsther). <br><br>I will still keep this website updated, all the latest skins have also been added." 
},,{
    date: 1548088426670,
    title: "New skins added!",
    image: "img/news/new-skins-21-01-2019.png",
    message: "Latest skins added. Sorry for the late addition and server instabilities, the website should be running more stable from now on and skins will be added faster!" 
},{
    date: 1546624857877,
    title: "New skins, and S7 umbrella added!",
    image: "img/news/snowfall.png",
    message: "Latest skins added. Thanks to FinalPlayer who reminded me to add S7 umbrella!" 
},{
    date: 1546551535686,
    title: "Introducing the Suggestion Box!",
    image: "img/news/suggestion-box.png",
    message: "Do you have a suggestion for the site or maybe a question you would like answered? Send it via the Suggestion Box! The suggestion box is located above this post, between NEWS and OPTIONS." 
},{
    date: 1546182316830,
    title: "New skins!",
    image: "img/news/even-more-new-skins.png",
    message: "The latest skins have been added to the site. Sorry for not updating the site in a while, I was away on the holiday!" 
},{
    date: 1545400769600,
    title: "New skins!",
    image: "img/news/more-skins-12-21.png",
    message: "The latest skins have been added to the site." 
},{
    date: 1544369059117,
    title: "Season 7!",
    image: "img/news/season-7.png",
    message: "All skins and the new wraps have been added - Also, there have now been 100,000 unique visitors to the site, thanks for using FN Rate!" 
},{
    date: 1543753782334,
    title: "Winter is here!",
    image: "img/news/winter-is-here.png",
    message: "The latest fortnite skins have been added." 
},{
    date: 1542980165952,
    title: "Bundles and Tender Defender!",
    image: "img/news/bundle.png",
    message: "Bundles can be found under the 'bundle' filter." 
},{
    date: 1542220837345,
    title: "1000+ items in Fortnite!",
    image: "img/news/1000-items.png",
    message: "It's official, Fortnite now has more than 1000 cosmetic items (1020)!" 
},{
    date: 1541775745770,
    title: "We have updated our privacy policy!",
    image: "img/news/privacy-update.png",
    message: 'The header "Used in research" has been added. Please review it here: <a href="/privacy">rate.livfor.it/privacy</a>' 
},{
    date: 1541536946358,
    title: "Fortnite x NFL!",
    image: "img/news/nfl-update.png",
    message: "All news cosmetic items from v.6.22 have been added, including the new NFL special's"
},{
    date: 1541437555524,
    title: "6.21 skins added!",
    image: "img/news/621-new-skins.png",
    message: "All skins from v.6.21 are here! :)"
},{
    date: 1540403020909,
    title: "New skins!",
    image: "img/news/week-43-news.png",
    message: "All skins from v.6.20 are here!"
},{
    date: 1539177428925,
    title: "Halloween skins are in!",
    image: "img/news/halloween.png",
    message: "The very anticipated halloween skins are finally here!"
},{
    date: 1538600152179,
    title: "v.6.01 and bug fixes!",
    image: "img/news/601-and-bug-fixes.jpg",
    message: "All new skins from v.6.01 and season 6 music kits are here. TOYS are no longer broken! (All votes were counted but not displayed)"
},{
    date: 1538140956901,
    title: "Season 6",
    image: "img/news/season-6.png",
    message: "All season 6 skins, items and new pets have been added!"
}, {
    date: 1537303890417,
    title: "v.5.41 is here!",
    image: "img/news/5.41_is_here.png",
    message: "Fortnite's v.5.41 skins have been added to the database. A new rarity (Dark colour, Unknown) has been added to FN Rate, this is for skins that doesn't have a known rarity. New filter options: Filter by gender. Some major improvements have been made to the comment loader, this means the website will feel much quicker now!"
}, {
    date: 1537129069087,
    title: "New full screen feature!",
    image: "img/news/fullscreen.png",
    message: "Take a closer look at skins with the new full screen feature. Click the full screen button in the bottom right corner of a skin to view a bigger version of the image(s)."
}, {
    date: 1536233456999,
    title: "v.5.40 Skins are here!",
    image: "img/news/5.4_is_here.png",
    message: "All skins from v.5.40 are here, and all outfits should now display an alternative, featured image. Some skins did this before, but now all skins should do this."
}, {
    date: 1535980623727,
    title: "Introducing Season Filters!",
    image: "img/news/season-filters.png",
    message: "You can now filter through the different battle pass seasons of Fortnite, accessed right from the 'Filter' option. The number for each season is the average rating for that season. This was a user submitted suggestion, if you have any suggestions - please do send them to me on reddit /u/Yogsther!",
}, {
    date: 1535708555388,
    title: "Introducing Comment Stream!",
    image: "img/news/comment-stream.png",
    message: "<b>Update: You can now search comments and usernames!<br></b>Browse and vote on all comments with comment stream, sort by top voted, newest, oldest or most downvoted. Clicking on a skin will link you to that skin-page. <a href='comments'>Click here to check it out!</a>"
}]

var lastVisit = localStorage.getItem("lastVisit");
localStorage.setItem("lastVisit", Date.now());
if (isNaN(lastVisit)) lastVisit = 0;


function submitSuggestion(){
    socket.emit("suggestion", {
        name: document.getElementById("suggestion-username").value,
        text: document.getElementById("suggestion-text").value
    })
    document.getElementById("suggestion-status").innerHTML = "Sent!";
    document.getElementById("suggestion-username").value = "";
    document.getElementById("suggestion-text").value = "";
}


function changeOverlay(type) {

    if (type == "options") {
        document.getElementById("overlay-contents").innerHTML = "<div id=\"header-items\"> <div class=\"header-item\"> <span style='color:white; margin-left:2em;'>Sort by:<\/span> <select oninput=\"sortBy(this.value)\" id=\"sort\"> <option value=\"rating\">Global rating<\/option> <option value=\"myrating\">Your rating<\/option> <option value=\"votes\">Amount of votes<\/option> <option value=\"comments\">Amount of comments<\/option> <option value=\"rarity\">Rarity<\/option> <\/select> <\/div> <!-- <div class=\"header-item\"> <span style='color:white; margin-left:2em;'>Color:<\/span> <select oninput=\"setColor(this.value)\" id=\"sort\"> <option value=\"rarity\">Rarity<\/option> <option value=\"rating\">Rating<\/option> <\/select> <\/div> --> <div class=\"header-item\"> <span style='color:white; margin-left:2em;'>Username:<\/span> <input maxlength=\"12\" type=\"text\" id=\"username\" value=\"Anonymous\" oninput=\"updateUsername(this.value)\"> <\/div> <\/button> <div class=\"header-item\"> <a href=\"https:\/\/www.reddit.com\/u\/Yogsther\" target=\"_blank\" style='margin-left:2em;' title=\"Report a bug or submit a suggestion\">Contact me<\/a> <\/div> <div class=\"header-item\"> <a href=\"\/privacy.html\" target=\"_blank\" style='margin-left:2em;' title=\"Privacy Policy\">Privacy Policy<\/a> <\/div> <\/div> <div id=\"stats\"> <span style='font-size: 20px;'>Your stats: <\/span> <br> Rated skins: ?\/? <br> Average rating: ? <br> <\/div>";

        if (localStorage.getItem("token") !== null) {
            admin = true;
            applyAdmin()
        }
        updateStats();

        document.getElementById("username").value = username;
    }
    if (type == "news") {
        var newsPrint = "";
        news.forEach(update => {
            newsPrint += "<span class='news-insert'><img src='" + update.image + "' class='news-image'></span>" +
                "<span class='news-title'>" + update.title + "</span><span class='news-message'>" + update.message + "</span>"
        })

        document.getElementById("overlay-contents").innerHTML = newsPrint;
    }

    if(type == "suggestionbox"){
        document.getElementById("overlay-contents").innerHTML = '<div id="suggestion-box-wrap"> <h2 style="color:white;"> Send in a suggestion for the website or ask a question!</h2> <textarea name="" id="suggestion-text" style="width:100%;height:20vh;" placeholder="Suggestion or Question"></textarea> <span style="color:white;">Optionally, you can enter your name or alias if you would like credit for your suggestion or want me to be able to respond to any question via ex. Reddit.</span> <input type="text" id="suggestion-username" placeholder="Username (Reddit, FN-Rate or other)" style="width:100%;height:40px;margin-top:10px;position:relative;"> <button style="width:90px;height:40px;margin-top:10px;position:relative;" onclick="submitSuggestion()">Send in!</button> <span id="suggestion-status" style="color:white;"></span>';
    }


}

function fullscreen() {
    document.getElementById("fullscreen-block").style.visibility = "visible";
    var skin = skins[currentSkin];
    if (skin.type == "outfit") {
        // Two image, split
        document.getElementById("fullscreen-container").innerHTML = '<div class="fullscreen-viewer-split ' + skin.rarity + '-block"> <img src="' + skin.src + '" alt="" class="fullscreen-img"> </div> <div class="fullscreen-viewer-split  ' + skin.rarity + '-block"> <img src="' + "img/featured/" + skin.code + ".png" + '" alt="" class="fullscreen-img"> </div>';
    } else {
        document.getElementById("fullscreen-container").innerHTML = '<div class="fullscreen-viewer ' + skin.rarity + '-block"> <img src="' + skin.src + '" alt="" class="fullscreen-img"> </div>';
    }
}

function exitFullscreen() {
    document.getElementById("fullscreen-block").style.visibility = "hidden";
}



function toggleOverlay() {

    var action = "visible";
    var topHeight = "0vh";
    if (overlayOpen) {
        action = "hidden";
        topHeight = "-200vh";
    }

    //document.getElementById("overlay-master").style.visibility = action; // Change style
    document.getElementById("overlay-master").style.top = topHeight; // Change style
    overlayOpen = !overlayOpen; // Toggle 
}

var canvasProgress = 0;
var colorProgress = 0;
var oldColor = "black";
var newColor = "#303030";
var transitionOffset = 150;
var transitionSpeed = 5;

function renderCanvas() {
    ctx.fillStyle = oldColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (oldColor !== newColor) {
        ctx.fillStyle = newColor;
        ctx.fillRect(0, 0, colorProgress, canvas.height);
        colorProgress += transitionSpeed;
        transitionSpeed += 5;
        if (colorProgress > canvas.width + transitionOffset) {
            oldColor = newColor;
            colorProgress = 0;
            transitionSpeed = 5;
        }
    }
    // Black overlay to darken color
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var spacing = .005;
    var heightOffset = 30;
    var speed = .05;
    canvasProgress -= speed;
    for (let i = 0; i < canvas.width; i++) {
        //ctx.fillStyle = "rgba(0,0,0,.25)";
        //ctx.fillRect(i, canvas.height, 1,( Math.sin(canvasProgress + 0.5 + spacing * i) * heightOffset - canvas.height / 2)-10);

        var height = Math.sin(canvasProgress + spacing * i) * heightOffset;
        ctx.fillStyle = newColor;
        if (i > colorProgress + transitionOffset) ctx.fillStyle = oldColor;
        ctx.fillRect(i, canvas.height, 1, height - canvas.height / 2);
        var increase = .5 / canvas.width;
        ctx.fillStyle = "rgba(0,0,0," + i * increase + ")";
        //ctx.fillStyle = "rgba(0,0,0,.5)"
        ctx.fillRect(i, canvas.height, 1, (height - canvas.height / 2));

    }
    requestAnimationFrame(renderCanvas);
}


function getProjection(history, rating) {
    projection = {
        standing: "stable",
        percentage: 0
    }
    if (history === undefined || history.length == 0) return projection;
    historyEvents = 5;
    if (history.length < historyEvents) historyEvents = history.length;
    var totalScore = 0;

    for (let i = 0; i < historyEvents; i++) {
        // Loop backwards through history amount of historyEvents, typically 5.
        totalScore += history[(history.length - (i + 1))].rating;
    }
    var averageRatingHistory = totalScore / historyEvents;

    var change = Math.abs(rating - averageRatingHistory);
    projection.percentage = (Math.round((change / averageRatingHistory) * 1000) / 1000) * 100;

    if (averageRatingHistory > rating) projection.standing = "down";
    if (averageRatingHistory < rating) projection.standing = "up";
    if (averageRatingHistory == rating || projection.percentage == 0) projection.standing = "stable";

    return projection;
}


/**
 * When receiving all the skin data from the server
 */
socket.on("skins", data => {
    // Save skins locally
    skins = data;

    calculateLockerValue();

    // Sort skins
    justSort(sortMode);
    // Initiate counter
    amountOfSkins = 0;
    /* Load skins */
    for (let i = 0; i < skins.length; i++) {
        if (skins[i].code === undefined && skins[i].name === undefined) {
            console.warn("Removed skin: ", skins[i])
            skins.splice(i, 1);
        } else {
            if (skins[i].code === undefined) {
                skins[i].code = skins[i].name.toUpperCase().split(" ").join("_");
            }

            skins[i].thumb = new Image();
            /* Supper hashtags, (%23 doesn't work with Github pages for some reason. ) */
            // TODO, TEMPORARY WILL BE FIXED ONCE SKINS ARE RENEWED
            skins[i].codeSource = skins[i].code.split("/").join("_").split("#").join("ESC_HASH_");
            skins[i].src = skins[i].src.split("#").join("ESC_HASH_").split("%23").join("ESC_HASH_");
            if(skins[i].type == "outfit") skins[i].src = "img/" + skins[i].src.substr(skins[i].src.lastIndexOf("/"))

            if (skins[i].type == "glider" || skins[i].type == "umbrella") skins[i].codeSource = skins[i].codeSource.split("'").join("");
            skins[i].thumb.src = "img/thumbnails/" + skins[i].type + "/" + skins[i].codeSource + ".png";
            var rarityColors = ["legendary", "#aa5228", "epic", "#6b41a8", "rare", "#007dbc", "uncommon", "#488c2c", "common", "#9d9d9d", "unknown", "#303030"]
            var color = 1;
            for (let j = 0; j < rarityColors.length; j++)
                if (skins[i].rarity == rarityColors[j]) color = j + 1;
            color = rarityColors[color];
            if (colorSort == "rating") {
                var percent = 1.2 - skins[i].rating / 5;
                var hue = ((1 - percent) * 120).toString(10);
                color = ["hsl(", hue, ",100%,50%)"].join("");
            }
            skins[i].thumb.style = 'background-color:' + color;
            skins[i].color = color;

            skins[i].projection = getProjection(skins[i].history, skins[i].rating);


            skins[i].thumb.draggable = 'false'
            if (skins[i].code != undefined && skins[i].code != "RECRUIT") amountOfSkins++;
            skins[i].thumb.addEventListener("click", () => {
                inspect(i);
            })
            skins[i].thumb.className = 'preview'
            if (overwriteInspect) {
                if (skins[i].code.toLowerCase() == options.skin.toLowerCase() && skins[i].type.toLowerCase() == options.type.toLowerCase()) {
                    currentSkin = i;
                }
            }
        }
    }
    /* if (userRequested) {
        populateCollection();
        userRequested = false;
    } */

});

document.addEventListener("click", e => {
    var stop = false;
    var found = false;
    e.path.forEach(el => {
        if (el.id == "fullscreen-block") found = true;
        if (el.id == "full-icon-button") stop = true;
    })
    if (stop) return;
    if (!found) exitFullscreen();
})

document.addEventListener("click", (e) => {
    //fullscreen-block
    if (!overlayOpen) return;
    var found = false;
    var stop = false;

    e.path.forEach(el => {
        if (el.id == "overlay-master") found = true;
        if (el.id == "ignore") stop = true;
    })

    if (stop) return;
    if (!found) {
        document.getElementById("overlay-master").style.top = "-200vh";
        overlayOpen = false;
    }
})


socket.on("account", acc => {
    myAccount = acc;
    skins.forEach(skin => {
        if (skin.price.split(" ")[0].toLowerCase() == "tier" || skin.price.split(" ")[0].toLowerCase() == "level") {
            var season = Number(skin.price.split(" ")[2][2]);
            if (seasonRatings[season] == undefined) seasonRatings[season] = new Array();
            seasonRatings[season].push(skin.rating);
        }
        if (skin.type == "outfit") {
            if (males.indexOf(skin.code.toLowerCase()) != -1) skin.sex = "male";
            else skin.sex = "female";
        }


        if (skin.comments !== undefined) skin.comments.forEach(comment => {
            comment.upvotes++;
            comment.karma = (comment.upvotes - comment.downvotes);
            comment.percentage = (1 + comment.upvotes) / (comment.upvotes + comment.downvotes + 1);
            if (myAccount.upvotes.indexOf(comment.id) !== -1) comment.action = "upvote";
            if (myAccount.downvotes.indexOf(comment.id) !== -1) comment.action = "downvote";
        })
    })

    for (let i = 1; i < seasonRatings.length; i++) {
        var totalRating = 0;
        try {
            seasonRatings[i].forEach(rating => {
                totalRating += rating;
            })
            seasonRatings[i] = Math.round((totalRating / seasonRatings[i].length) * 100) / 100;

            document.getElementById("filter-options").innerHTML += '<option value="s' + (i) + '">Season ' + (i) + ' (' + seasonRatings[i] + ')</option>'
        } catch (e) {
            throw e
        }
    }

    if (localStorage.getItem("filter") !== null) {
        cosmeticFilter = localStorage.getItem("filter")
        document.getElementById("filter-options").value = cosmeticFilter;
    }


    thisRating = myAccount.account[skins[currentSkin].code];
    updateStars(thisRating);
    if (firstLoad) {
        populateCollection()
        firstLoad = false;
    }

    firstInspect();
    /* inspect(currentSkin); */
    /* if (!overwriteInspect) inspect(currentSkin); */
})

function firstInspect() {
    if (currentSkin === undefined) {
        setTimeout(() => {
            firstInspect();
        }, 150); // Wait 150ms, then check again
    } else {
        inspect(currentSkin);
    }
}

function updateStats() {
    if (myAccount == undefined || skins == undefined) return;
    var length = 0;
    var totalRate = 0;
    Object.keys(myAccount.account).forEach(function (key) {
        length++;
        totalRate += myAccount.account[key];
    });
    var average = Math.round((totalRate / length) * 100) / 100;
    if (length >= amountOfSkins) document.title = "FN Rate 🌟"
    var lockerScore = 0;
    var lockerSize = locker.length;
    locker.forEach(skinCode => {
        lockerScore += skins[getSkinIndexFromCode(skinCode)].rating;
    })
    lockerScore = Math.round(lockerScore * 10) / 10;
    var averageLockerRating = Math.round((lockerScore / lockerSize) * 10) / 10;

    document.getElementById("stats").innerHTML = "<i>Your stats:<br></i>Rated skins: " + length + "/" + amountOfSkins + "<br>Average rating: " + average + "<br>Karma: " + myAccount.karma + "<br>Amount of comments: " + myAccount.comments.length + "<br><span title='Account value in V-bucks, not accounting for Battlepass cost, STW cost or Starter packs.'>Account worth (?): " + accountWorth + " V-bucks</span><br>Average locker rating: " + averageLockerRating + "<br>Locker score: " + lockerScore + "<br>Locker size: " + lockerSize;
}

var rarities = ["common", "uncommon", "rare", "epic", "legendary", "unknown"];

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

function commentSort(a, b) {
    try {
        if (a.comments.length > b.comments.length)
            return -1;
        if (a.comments.length < b.comments.length)
            return 1;
        return 0;
    } catch (e) {}
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

function justSort /*lol*/(val) {
    /* if (val == "rating") skins.sort(rateSort);
    if (val == "rarity") skins.sort(raritySort);
    if (val == "myrating") skins.sort(personalRating)
    if (val == "votes") skins.sort(votes); */
    sortBy(val, true);
}

function sortBy(val, dontLoad) {
    if (val == "rating") skins.sort(rateSort);
    if (val == "rarity") skins.sort(raritySort);
    if (val == "myrating") skins.sort(personalRating)
    if (val == "votes") skins.sort(votes);
    if (val == "comments") skins.sort(commentSort);
    sortMode = val;
    if (dontLoad !== undefined) return;
    populateCollection();
    /* var i = 0;
    while (skins[i].code == "RECRUIT") i++;
    inspect(i) */
}

var cosmeticFilter = "all";


function filter(val) {
    cosmeticFilter = val;
    localStorage.setItem("filter", cosmeticFilter);
    populateCollection();
}

//var searchTimeout = setTimeout(() => {}, 0);
function search() {
    clearTimeout(searchTimeout);
    var searchTimeout = setTimeout(() => {
        populateCollection();
    }, 150);
}

const males = [
    "jaeger",
    "verge",
    "cobalt",
    "tech_ops",
    "cabbie",
    "malcore",
    "paradox",
    "krampus",
    "fishstick",
    "grimbles",
    "tender_defender",
    "black_knight",
    "ragnarok",
    "omega",
    "drift",
    "raven",
    "wild_card",
    "galaxy",
    "skull_trooper",
    "the_reaper",
    "overtaker",
    "battle_hound",
    "raptor",
    "omen",
    "beef_boss",
    "archetype",
    "sushi_master",
    "nite_nite",
    "love_ranger",
    "dark_voyager",
    "merry_marauder",
    "musha",
    "enforcer",
    "rex",
    "magnus",
    "wukong",
    "sky_stalker",
    "cloaked_star",
    "bandolier",
    "to_be_determined",
    "abstrakt",
    "leviathan",
    "jumpshot",
    "tomatohead",
    "venturion",
    "burnout",
    "crackshot",
    "noir",
    "the_visitor",
    "garrison",
    "chomp_sr.",
    "carbide",
    "brite_gunner",
    "funk_ops",
    "toxic_trooper",
    "vertex",
    "wingman",
    "midfield_maestro",
    "rogue_agent",
    "maverick",
    "squad_leader",
    "alpine_ace_(can)",
    "sledgehammer",
    "moisty_merman",
    "havoc",
    "rabbit_raider",
    "grill_sergeant",
    "hacivat",
    "liteshow",
    "rust_lord",
    "triage_trooper",
    "wreck_raider",
    "royale_bomber",
    "blue_squire",
    "sleuth",
    "super_striker",
    "alpine_ace_(fra)",
    "alpine_ace_(usa)",
    "blue_striker",
    "moniker",
    "battlehawk",
    "alpine_ace_(ger)",
    "mullet_marauder",
    "circuit_breaker",
    "alpine_ace_(gbr)",
    "armadillo",
    "stage_slayer",
    "yuletide_ranger",
    "warpaint",
    "diecast",
    "scoundrel",
    "alpine_ace",
    "flytrap",
    "far_out_man",
    "alpine_ace_(chn)",
    "alpine_ace_(kor)",
    "stalwart_sweeper",
    "codename_e.l.f.",
    "sun_tan_specialist",
    "sash_sergeant",
    "star-spangled_trooper",
    "absolute_zero",
    "hyperion",
    "backbone",
    "aerial_threat",
    "first_strike_specialist",
    "special_forces",
    "masked_fury",
    "midnight_ops",
    "desperado",
    "recruit_1", "radiant_striker",
    "aerial_assault_trooper",
    "sub_commander",
    "crimson_scout",
    "mission_specialist",
    "recon_scout",
    "recruit_6",
    "trooper",
    "recruit_8",
    "recruit_7",
    "infiltrator",
    "devastator",
    "ranger",
    "scout",
    "tracker",
    "highrise_assault_trooper",
    "dire",
    "dj_yonder",
    "giddy-up",
    "ludwig",
    "hay_man",
    "maximilian",
    "double_helix",
    "plague",
    "jack_gourdon",
    "hollowhead",
    "spider_knight",
    "guan_yu",
    "reflex",
    "ruckus",
    "shogun",
    "growler",
    "deadfire",
    "summit_striker",
    "sanctum",
    "dante",
    "frostbite",
    "brainiac",
    "patch_patroller",
    "a.i.m.",
    "end_zone",
    "gridiron",
    "spike",
    "strong_guard",
    "striped_soldier",
    "castor",
    "taro",
    "riot",
    "mothmando",
    "longshot",
    "cloudbreaker",
    "trog",
    "sgt._winter",
    "zenith",
    "the_ice_king",
    "frozen_love_ranger",
    "frozen_raven",
    "cloaked_shadow",
    "slushy_soldier",
    "prodigy",
    "red-nosed_ranger"

]

function populateCollection() {
    var search = document.getElementById("search").value;
    var indexZero = false;
    //document.getElementById("collection").innerHTML = "";

    if (cosmeticFilter === "locker" && locker.length == 0) {
        document.getElementById("collection").innerHTML = '<span id="loading-main">Locker empty!</span><span id="loading-tips">You can add items to your locker by clicking the +Locker button. Then you can evaluate the worth of your account and rating score by checking your stats in the options menu.</span>';
        return;
    }
    var populatedItems = 0;
    var collectionString = "";
    for (let i = 0; i < skins.length; i++) {
        var skip = false;
        if (cosmeticFilter != "all") {
            if (cosmeticFilter == "locker") {
                if (locker.indexOf(getSkinCode(skins[i])) == -1) skip = true;
            } else if (cosmeticFilter.length == 2 && cosmeticFilter[0] == "s") {
                if (skins[i].price.split(" ")[2] != "(" + cosmeticFilter.toUpperCase() + ")") skip = true;
            } else if (cosmeticFilter == "store") {
                if (!skins[i].inStore) skip = true;

            } else if (cosmeticFilter == "male" || cosmeticFilter == "female") {
                if (skins[i].type != "outfit") {
                    skip = true;
                } else {
                    if (skins[i].sex != cosmeticFilter) skip = true;
                }
            } else if (skins[i].type != cosmeticFilter) skip = true;
        }
        if (!skip) {
            populatedItems++;
            var skin = skins[i];
            var skip = false;
            var searches = search.toLowerCase().split(" ");
            searches.forEach(s => {
                if (skin.name.toLowerCase().indexOf(s) == -1) skip = true;
            });

            if ((!skip || search == false) && skin.code != undefined && skin.code !== "RECRUIT") {
                if (indexZero === false) indexZero = i;
                var rating = skin.rating;
                //var myRating??
                var warn = "";
                if (myAccount !== undefined) {

                    //if (myAccount.account[skin.code] === undefined && myAccount.account[skin.type.toLowerCase() + "_TYPE_" + skin.code] === undefined) warn = "!";
                }
                if (skin.code != undefined) {
                    var shopIcon = "";
                    if (skin.inStore) shopIcon = "<img src='img/shop_icon.png' class='shop-icon' title='In the item shop right now!'>"
                    collectionString += "<span title='" + skins[i].name + "' id='img_" + i + "' onclick='inspect(" + i + ", this)' class='container " + skin.rarity + "'> <img src='img/" + skin.projection.standing + ".png' title='Rating is going " + skin.projection.standing + ".' class='arrow'> " + shopIcon + " <img class='preview " + skin.rarity + "-block' draggable='false' style='background-color:" + skin.color + "' src=" + JSON.stringify(skin.thumb.src) + "> <span class='preivew-rating'> " + rating + " </span><span class='my-rating'>" + warn + "</span></span>"
                    try {
                        //document.getElementById("img_" + i).appendChild(skin.thumb)
                    } catch (e) {
                        console.warn("Problem with skin: " + skin.code, skin);
                    }
                }
            }
        }
    }
    document.getElementById("search-showing").innerText = populatedItems + " items";
    document.getElementById("collection").innerHTML = collectionString;
    if (indexZero !== false && !overwriteInspect) inspect(indexZero)
}


function setColor(val) {
    if (val == "rarity") colorSort = "rarity";
    if (val == "rating") colorSort = "rating";
    get();
}
/* 
function shadowColor(index, el){
    var originalColor = skins[index].color;
    var shadedColor = shadeColor(originalColor, 50);
    el.style.boxShadow = "0px 5px 0px " + shadedColor + ";"

    function shadeColor(color, percent) {   
        var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }
} */
/* 
var blocks = document.getElementsByClassName("preview");
var lastSkin = undefined;
 */


var lastElement = undefined;

function inspect(skinIndex, el) {
    currentSkin = skinIndex;
    /* Update URL for specific skin */
    var skin = skins[skinIndex];


    try {

        lastElement.classList.remove("preview-selected-" + lastElement.classList[1].substr(0, lastElement.classList[1].indexOf("-")));
    } catch (e) {}

    if (el !== undefined) {
        el = el.children[1 + (el.childElementCount - 4)];
        el.classList.toggle("preview-selected-" + skin.rarity);
        lastElement = el;
    } else {
        blocks = document.getElementsByClassName("preview");
        for (let i = 0; i < blocks.length; i++) {
            if (skin.name == blocks[i].parentElement.title) {
                blocks[i].classList.toggle("preview-selected-" + skin.rarity);
                lastElement = blocks[i];
                break;
            }
        }
    }


    /*    updateCanvas();
       graphCanvas.width = canvas.width;
       resetGraph(); */



    /* Update title of page, clearify the history what skins you were viewing. */
    document.title = "FN Rate - " + skin.name;

    if (dontPush) {
        dontPush = false;
    } else {
        window.history.pushState("", "FN Rate - " + skin.name, "/?skin=" + skin.code.toLowerCase() + "&type=" + skin.type.toLowerCase());
    }

    /* if (skin.type !== "outfit") {
        document.getElementById("full").style.top = "-10px";
    } else {
        document.getElementById("full").style.top = "0px";
    } */

    newColor = skins[skinIndex].color;
    applyThemeColor();

    document.getElementById("full").src = "";

    // Handle rating
    try {
        if (myAccount.account[skins[currentSkin].type + "_TYPE_" + skins[currentSkin].code] !== undefined) {
            thisRating = myAccount.account[skins[currentSkin].type + "_TYPE_" + skins[currentSkin].code];
        } else {
            thisRating = myAccount.account[skins[currentSkin].code];
        }
        if (thisRating == undefined) thisRating = 0;
        updateStars(thisRating);
    } catch (e) {}
    var rating = thisRating;

    hideConfirm();

    var sign = "+";
    if (locker.indexOf(getSkinCode(skins[currentSkin])) != -1) {
        sign = "-";
        if (document.getElementById("i-own-button").classList.length < 2) document.getElementById("i-own-button").classList.toggle("inventory-button-cheked")
    } else {
        if (document.getElementById("i-own-button").classList.length > 1) document.getElementById("i-own-button").classList.toggle("inventory-button-cheked")
    }
    // Update button text and colors
    document.getElementById("i-own-button").innerText = sign + " Locker";



    var skin = skins[skinIndex];
    document.getElementById("stars").innerHTML = "";
    var percentage = skin.projection.percentage;
    if (percentage.toString().length > 5) percentage = percentage.toString().substr(0, 4);
    var projectionTitle = "<span style='color:#48f142'>(" + percentage + "%) <img title='Rating is going up.' src='img/up.png' class='standing-profile'></span>"
    if (skin.projection.standing == "down") projectionTitle = "<span style='color:#f04250'>(" + percentage + "%) <img title='Rating is going down.' src='img/down.png' class='standing-profile'></span>"
    if (skin.projection.standing == "stable" || skin.projection.percentage == 0) projectionTitle = " <span style='color:#3d3d3d' title='Rating has not changed last 5 days.'>STABLE</span>"


    var higherRatedSameCategory = generateSpan((skins[skinIndex].stats.higherRatedSameCategory + 1), skins[skinIndex].type)
    var higherRatedSkins = generateSpan((skins[skinIndex].stats.higherRatedSkins + 1), "rank")

    function generateSpan(number, text) {
        const tierColors = ["#e2c75a", "#cecece", "#896b2a", "#7c7c7c"]
        var color = "";
        if (number - 1 > tierColors.length - 1) color = tierColors[tierColors.length - 1];
        else color = tierColors[number - 1];

        return " <span style='color:" + color + "'>#" + number + " " + text.split("_").join(" ").toUpperCase() + "</span> ";
    }

    document.getElementById("title").innerHTML = "<span style='color:" + skins[skinIndex].color + "'>" + skins[skinIndex].name.toUpperCase() + "</span>" + higherRatedSameCategory + " " + higherRatedSkins + projectionTitle;

    document.getElementById("full").src = skins[skinIndex].src;
    // Clear old alt images
    document.getElementById("third-insert").innerHTML = "";

    // Check for alternative images.
    if (skin.type == "outfit") {
        var loadingTimeoutOutfit = setTimeout(() => {}, 200);

        // Skin can have secondary or featured image (Alternative images, if so - display them.) 
        // Featured image, the one displayed in the item shop
        skin.featuredImage = new Image();
        skin.featuredImage.id = "third"
        skin.featuredImage.src = "img/featured/" + skin.code + ".png";
        skin.featuredImage.onload = () => {
            clearTimeout(loadingTimeoutOutfit)
            document.getElementById("third-insert").innerHTML = "";
            if (skins[currentSkin] == skin) document.getElementById("third-insert").appendChild(skin.featuredImage);
        }

        skin.featuredImage.onerror = () => {
            clearTimeout(loadingTimeoutOutfit)
            document.getElementById("third-insert").innerHTML = ""
        }

    }




    skins[skinIndex].comments.sort(dateSort);
    skins[skinIndex].comments.sort(karmaSort);

    function karmaSort(a, b) {
        if (a.karma > b.karma)
            return -1;
        if (a.karma < b.karma)
            return 1;
        return 0;
    }

    function dateSort(a, b) {
        if (a.date > b.date)
            return -1;
        if (a.date < b.date)
            return 1;
        return 0;
    }

    document.getElementById("amount-of-comments").innerText = skins[skinIndex].comments.length;
    var commentsString = "";

    skins[skinIndex].comments.forEach((comment, index) => {
        var downvoteSource = "img/vote_grey.png";
        var upvoteSource = "img/vote_grey.png";
        if (comment.action == "upvote") upvoteSource = "img/vote_green.png";
        if (comment.action == "downvote") downvoteSource = "img/vote_red.png";
        var karma = comment.karma;
        var percentage = comment.percentage;
        var karmaInfo = (Math.round((percentage * 100) * 100) / 100) + "% upvoted, " + comment.upvotes + " upvotes, " + comment.downvotes + " downvotes, " + (comment.upvotes + comment.downvotes) + " total votes."

        var dateString;
        var date = new Date(comment.date);
        var time = Date.now() - comment.date;
        var minutes = time / 1000 / 60;
        var hours = minutes / 60;
        var days = hours / 24;
        var years = days / 365;
        dateString = Math.round(minutes) + "m";
        if (hours >= 1) dateString = Math.round(hours) + "h";
        if (days >= 1) dateString = Math.round(days) + "d";
        else if (years >= 1) dateString = Math.round(years) + "y";

        var modClass = "";
        if (comment.mod) modClass = "adminComment";
        commentsString += '<div class="comment"> <span class="votes"> <img src="' + upvoteSource + '" alt="" class="upvote" title="Upvote this comment" onclick="commentVote(this, true)"> <span class="karma" title="' + karmaInfo + '">' + karma + '</span> <img src="' + downvoteSource + '" onclick="commentVote(this, false)" title="Downvote this comment" alt="" class="downvote"> </span> <span class="username ' + modClass + '" id="username_' + index + '" title="' + new Date(comment.date) + '">' + sanitizeHTML(comment.username) + ": <span class='date-ago'>" + dateString + "</span>" + '</span> <span class="message" id="message_' + index + '">' + sanitizeHTML(comment.message) + '</span> </div>';

        //document.getElementById("username_" + index).appendChild(document.createTextNode());

        //document.getElementById("message_" + index).appendChild(document.createTextNode(censorComment(comment.message)));
        //document.getElementById("username_" + index).title = ;

        /* document.getElementById("comments").innerHTML += '<div class="comment"> <span class="votes"> <img src="' + upvoteSource + '" alt="" class="upvote" title="Upvote this comment" onclick="commentVote(this, true)"> <span class="karma" title="' + karmaInfo + '">' + karma + '</span> <img src="' + downvoteSource + '" onclick="commentVote(this, false)" title="Downvote this comment" alt="" class="downvote"> </span> <span class="username" id="username_' + index + '"></span> <span class="message" id="message_' + index + '"></span> </div>';
        document.getElementById("username_" + index).appendChild(document.createTextNode(comment.username + ":"));
        if (comment.mod) document.getElementById("username_" + index).classList.toggle("adminComment");
        document.getElementById("message_" + index).appendChild(document.createTextNode(censorComment(comment.message)));
        document.getElementById("username_" + index).title = new Date(comment.date); */
    })

    if (skins[skinIndex].comments.length > 0) {
        document.getElementById("comments").innerHTML = commentsString;
    } else {
        document.getElementById("comments").innerHTML = '<span id="no-comments-here"> No comments yet, you can be the first to comment on this skin!</span>';
    }


    graphSettings.data = skin.history;
    defaultTheme.fg = skin.color;
    if (graphReady) resetGraph();

    //document.getElementById("image-wrap").style.background = skins[skinIndex].color;
    document.getElementById("rating").innerHTML = skins[skinIndex].rating;
    document.getElementById("rating").title = skins[skinIndex].exactRating;
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
        var times = 1;
        if (onMobile) times = .9; // Make bars 90% of the width for mobile users.
        bars[4 - i].style.width = (width * .9) + "%";
        bars[4 - i].innerHTML = votes[i]
    }
    updateStars(rating);
    document.getElementById("amount").innerHTML = totalVotes;
}

function sanitizeHTML(str) {
    var temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

var starsRating = undefined;

function updateStars(rating) {
    if (starsRating == rating && document.getElementById("stars").innerHTML != "") return;
    starsRating = rating;
    document.getElementById("stars").innerHTML = "";
    for (let i = 0; i < 5; i++) {
        var texture = "img/star_gold.png";
        if (i + 1 > rating) texture = "img/star_grey.png";
        document.getElementById("stars").innerHTML += "<img src=" + texture + " class='star' onclick='rate(" + (i + 1) + ")' onmouseover='updateStars(" + (i + 1) + ")' >"
    }
}

var onStars = false;
document.addEventListener("mousemove", e => {
    found = false;
    e.path.forEach(path => {
        if (path.id == "stars") {
            onStars = true;
            found = true;
        }
    })
    if (!found) {
        onStars = false;
        setTimeout(() => {
            if (!onstalled) resetStars();
        }, 50)
    }
})

socket.on("confirmedVote", pack => {
    if (pack.skin.indexOf(skins[currentSkin].code) !== -1 && pack.rating == thisRating) {
        confirmVote();
    }
})

function confirmVote() {
    document.getElementById("check").title = "Vote has been recorded."
    document.getElementById("check").src = "img/oh_hi_mark.png"
    document.getElementById("check").style.transform = "scale(1)";
}

function pendingVote() {
    document.getElementById("check").title = "Vote has been sent."
    document.getElementById("check").src = "img/unconfirmed.png"
    //document.getElementById("img_" + currentSkin).children[2].innerHTML = "";
    document.getElementById("check").style.transform = "scale(1)";
}

function hideConfirm() {
    document.getElementById("check").style.transform = "scale(0)";
}

function updateAccount(rating) {
    if (myAccount.account[skins[currentSkin].type + "_TYPE_" + skins[currentSkin].code] === undefined) {
        myAccount.account[skins[currentSkin.code]] = rating;
    } else {
        myAccount.account[skins[currentSkin].type + "_TYPE_" + skins[currentSkin].code] = rating;
    }
    myAccount.account[skins[currentSkin].code] = rating;
    thisRating = rating;
    updateStars(rating);
}

function getCurrentSkin() {
    if (myAccount.account)
        for (let skin of skins) {
            myacc
        }
}


function rate(rating) {
    if (rating === thisRating) return;
    rateUpdate = true;
    socket.emit("rate", {
        skin: skins[currentSkin].type + "_TYPE_" + skins[currentSkin].code,
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


var username = "Anonymous";
loadUsername();

function loadUsername() {
    var newUsername = localStorage.getItem("username");
    if (newUsername != undefined) {
        username = newUsername;

    }
}

function updateUsername(newUsername) {
    // Remember username
    localStorage.setItem("username", newUsername);
    username = newUsername;
}

addEventListener("keydown", e => {
    if (e.keyCode == 13) {
        if (document.getElementById("comment-submission") == document.activeElement) submitComment();
        else if(!overlayOpen) document.getElementById("comment-submission").focus();
    }
})

socket.on("err", error => alert(error))

var localComments = 0;

function submitComment() {
    var message = document.getElementById("comment-submission").value;
    if (message.indexOf("/mod") != -1) {
        localStorage.setItem("token", token) = message.split(" ")[1];
        return;
    }

    if (message.trim().length == 0) {
        alert("Message does not contain any characters!");
        return;
    }
    if (message.length == 0) return;


    if (username == "Anonymous" || username.trim().length == 0) {
        username = window.prompt("You have not choosen a username. Please enter a username. You can always change it the options menu!", username);
        if (username == "") {
            submitComment();
            return;
        }
        updateUsername(username);
    }

    var comment = {
        message: message,
        username: username,
        skin: skins[currentSkin].type + "_TYPE_" + skins[currentSkin].code,
        token: localStorage.getItem("token")
    }

    socket.emit("comment", comment)

    document.getElementById("comment-submission").value = "";

    var index = "local_" + localComments;
    localComments++;
    if (skins[currentSkin].comments.length < 1) document.getElementById("comments").innerHTML = "";
    document.getElementById("comments").innerHTML = '<div class="comment"> <span class="votes"> <img src="img/vote_grey.png" alt="" class="upvote" title="Upvote this comment" onclick="alert(' + "'Cannot vote on your own comment.'" + ')"> <span class="karma" title="Local comment">1</span> <img src="img/vote_grey.png" onclick="alert(' + "'Cannot vote on your own comment.'" + ')" title="Downvote this comment" alt="" class="downvote"> </span> <span class="username" id="username_' + index + '"></span> <span class="message" id="message_' + index + '"></span> </div>' + document.getElementById("comments").innerHTML;
    document.getElementById("username_" + index).appendChild(document.createTextNode(comment.username + ":"));
    document.getElementById("message_" + index).appendChild(document.createTextNode(comment.message));
}

function commentVote(comment, upvote) {

    var idString = comment.parentElement.parentElement.children[2].id.substr(8);
    var commentID = skins[currentSkin].comments[Number(idString)].id;

    var type = "upvote";
    if (!upvote) type = "downvote";



    if (skins[currentSkin].comments[Number(idString)].action == type) {
        if (skins[currentSkin].comments[Number(idString)].action == "downvote") comment.parentElement.children[1].innerHTML = Number(comment.parentElement.children[1].innerHTML) + 1;
        else comment.parentElement.children[1].innerHTML -= 1;
        comment.src = "img/vote_grey.png";
        type = "novote";
    } else if (upvote) {
        if (skins[currentSkin].comments[Number(idString)].action == "downvote") comment.parentElement.children[1].innerHTML = Number(comment.parentElement.children[1].innerHTML) + 2;
        else comment.parentElement.children[1].innerHTML = Number(comment.parentElement.children[1].innerHTML) + 1;
        comment.src = "img/vote_green.png";
    } else {
        if (skins[currentSkin].comments[Number(idString)].action == "upvote") comment.parentElement.children[1].innerHTML -= 2;
        else comment.parentElement.children[1].innerHTML -= 1;
        comment.src = "img/vote_red.png";
    }

    var index = 0;
    if (upvote) index = 2;
    comment.parentElement.children[index].src = "img/vote_grey.png";

    skins[currentSkin].comments[Number(idString)].action = type;
    socket.emit("commentVote", {
        id: commentID,
        type: type
    });
}

var locker = JSON.parse(localStorage.getItem("locker"));
    emitLocker();

if (locker == null) {
    locker = new Array();
}


function toggleLocker() {
    var skinCode = getSkinCode(skins[currentSkin]);

    var sign = "-";
    if (locker.indexOf(skinCode) != -1) {
        sign = "+";
        locker.splice(locker.indexOf(skinCode), 1); // Remove item from locker
    } else {
        locker.push(skinCode);
    }

    // Save locker
    localStorage.setItem("locker", JSON.stringify(locker));
    // Update button text and colors
    document.getElementById("i-own-button").innerText = sign + " Locker";
    document.getElementById("i-own-button").classList.toggle("inventory-button-cheked")

    calculateLockerValue();
}


function calculateLockerValue() {
    var totalPrice = 0;
    locker.forEach(lockerItem => {
        var price = skins[getSkinIndexFromCode(lockerItem)].price;
        price = price.split(",").join("");
        if (!isNaN(Number(price))) {
            // Pure V-bucks cost
            totalPrice += Number(price);
        }
    })

    accountWorth = totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    updateStats();
}


function getSkinCode(skin) {
    return skin.type.toLowerCase() + "_TYPE_" + skin.code.toUpperCase();
}

function getSkinIndexFromCode(code) {
    if (code.indexOf("_TYPE_") != -1) {
        var type = code.substr(0, code.indexOf("_TYPE_"));
        var code = code.substr(code.indexOf("_TYPE_") + 6, code.length);
        for (let i = 0; i < skins.length; i++) {
            if (code == skins[i].code && type.toLowerCase() == skins[i].type.toLowerCase()) {
                return i;
            }
        }
    } else {
        for (let i = 0; i < skins.length; i++) {
            if (skins[i].code == code) return i;
        }
    }
}

function emitLocker(){
    socket.emit("lockerPush", locker);
}