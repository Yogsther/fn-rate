/*
    Server-side socket.io main
*/

/** Choose a port */
//var port = 25565
var port = 25565

var express = require("express");
var socket = require("socket.io");
var crypt = require("bcrypt-nodejs");
const request = require('request');
const download = require('image-downloader')
var http = require('http');
var app = express();
/** Import file loader. */
var fs = require("fs");
var path = require('path');
var server = app.listen(port, function () {
    console.log("Listening to requests on port " + port);
    // Static files
    app.use(express.static("public"));
    // Socket setup
    var io = socket(server);
    var validCodes = new Array();
    var skins;
    var users = loadUsers();
    var cachedTotalVotes = 0;
    loadSkins();

    var check = setInterval(() => {
        console.log("Checking...");
        if (skins != undefined && users !== undefined) {
            clearInterval(check);
            updateGlobalScores();
            return;
        }
    }, 250);

    var update = setInterval(() => {
        users = loadUsers();
        updateGlobalScores()
    }, 10000)

    function loadSkins() {
        skins = JSON.parse(fs.readFileSync("skins.txt", "utf8"));

        // Inject default skins
        for (let i = 0; i < 8; i++) {
            skins.push({
                name: "Recruit " + (i + 1),
                price: "Default",
                type: "outfit",
                src: "img/" + "RECRUIT_" + (i + 1) + ".png",
                rarity: "common"
            })
        }

        for (let i = 0; i < skins.length; i++) {
            skins[i].code = skins[i].name.split(" ").join("_").toUpperCase();
            validCodes.push(skins[i].code);
            var dup = false;
            for (let j = 0; j < skins.length; j++) {
                //console.log("Checking: " + skin.name + " == " + skins[i].name);
                if (skins[j].name == skins[i].name && j != i) {
                    dup = j;
                    break;
                }
            }
            if (dup !== false) {
                console.log("Deteled dubplicate: " + skins[dup].name);
                skins.splice(dup, 1); // Delte
            }
        }

        /* Sort after rarity */
        var rarities = ["common", "uncommon", "rare", "epic", "legendary"];

        function raritySort(a, b) {
            if (rarities.indexOf(a.rarity) > rarities.indexOf(b.rarity))
                return -1;
            if (rarities.indexOf(a.rarity) < rarities.indexOf(b.rarity))
                return 1;
            return 0;
        }

        skins.sort(raritySort);
        console.log("-------------");
        console.log("Loaded skins!");

    }

    function loadUsers() {
        var u = fs.readdirSync("users");
        return u;
    }

    function getUser(ip) {
        if (ip.length > 100) return;
        /* Convert IP to string, that can be saved as file in Windows */
        while (ip.indexOf(".") != -1) ip = ip.replace(".", "_");
        while (ip.indexOf(":") != -1) ip = ip.replace(":", "_");
        while (ip.indexOf("f") != -1) ip = ip.replace("f", "");
        /* ip = ip.split("");

        ip = ip.join(""); */
        if (users.indexOf(ip + ".liv") != -1) {
            /* Old user */
            var account = loadUser(ip);
            return account;
        } else {
            /* New user */
            saveUser(ip, new Object());
            return {
                account: {},
                id: ip
            };
        }
    }

    function loadUser(id) {
        try {
            var acc = JSON.parse(fs.readFileSync("users/" + id + ".liv", "utf8"));
            return {
                account: acc,
                id: id
            };
        } catch (e) {
            console.log("ERR: Corrupt account: " + id);
            return;
        }
    }

    function saveUser(id, content) {
        try {
            fs.writeFileSync("users/" + id + ".liv", JSON.stringify(content));
        } catch (e) {
            console.log("ERR: Couldn't write id/ip: " + id);
        }
    }

    function recordRating(skinName, account, rating) {
        if (validCodes.indexOf(skinName) == -1) {
            console.log("ABUSE: Someone tried to rate an invalid skin!");
            return;
        } else if (rating > 5 || rating < 1) {
            console.log("ABUSE: Someone tried to rate an invalid rating!");
            return;
        } else {
            account.account[skinName] = Math.round(rating);
            saveUser(account.id, account.account);
        }
    }

    function updateGlobalScores() {
        for (let i = 0; i < skins.length; i++) {
            skins[i].votes = 0;
            skins[i].stars = [0, 0, 0, 0, 0];
            //skins[i].votesArr = new Array();
            skins[i].rating = 0;
        }
        for (let i = 0; i < users.length; i++) {
            var user = JSON.parse(fs.readFileSync("users/" + users[i]));
            try {
                Object.keys(user).forEach(function (key) {
                    //skins[getSkinIndexFromCode(key)].votesArr.push(user[key]);
                    skins[getSkinIndexFromCode(key)].stars[user[key] - 1]++;
                });
            } catch (e) {}
        }

        /* var totalVotesCount = 0;

        for (let i = 0; i < skins.length; i++) {
            if (skins[i].stars.reduce(add, 0) >= 1) {
                skins[i].rating = 0;
                totalVotesCount += skins[i].stars.reduce(add, 0);
                //totalVotesCount += skins[i].votesArr.length;
                var totalVotes = skins[i].stars.reduce(add, 0);
                //var totalVotes = skins[i].votesArr.length;
                var voteSum = 0;
                //skins[i].votesArr.forEach(vote => voteSum += vote);
                for (let j = 0; j < skins[i].stars.length; j++) {
                    voteSum += skins[i].stars[j] * (j + 1);
                }
                var rating = Math.round((voteSum / totalVotes) * 100) / 100;
                skins[i].rating = rating;
                skins[i].votes = totalVotes;
            }
        } */
        
        //console.log("Updated scores. New votes: " + newVotes + ". v/s: " + (newVotes / 10) + ". Total votes: " + cachedTotalVotes);
    }

    setTimeout(() => {
        hourReport();
    }, 10000 /* Ten seconds */)
    setInterval(() => {
        hourReport();
    }, 1000 * 60 * 60 /* One hour in ms */)


    function hourReport(){

        var totalVotesCount = 0;

        // Count votes
        for (let i = 0; i < skins.length; i++) {
            if (skins[i].stars.reduce(add, 0) >= 1) {
                skins[i].rating = 0;
                totalVotesCount += skins[i].stars.reduce(add, 0);
                //totalVotesCount += skins[i].votesArr.length;
                var totalVotes = skins[i].stars.reduce(add, 0);
                //var totalVotes = skins[i].votesArr.length;
                var voteSum = 0;
                //skins[i].votesArr.forEach(vote => voteSum += vote);
                for (let j = 0; j < skins[i].stars.length; j++) {
                    voteSum += skins[i].stars[j] * (j + 1);
                }
                var rating = Math.round((voteSum / totalVotes) * 100) / 100;
                skins[i].rating = rating;
                skins[i].votes = totalVotes;
            }
        }


        var newVotes = totalVotesCount - cachedTotalVotes;
        cachedTotalVotes = totalVotesCount
        console.log("------ Report ------\nHour report: " + new Date() + "\n" + 
            "New votes: " + newVotes + 
            "\nTotal votes: " + cachedTotalVotes + "\n--------------------"    
        );
    }

    function add(a, b) {
        return a + b;
    }


    function getSkinIndexFromCode(code) {
        for (let i = 0; i < skins.length; i++) {
            if (skins[i].code == code) return i;
        }
        return false;
    }

    function emitUserAccount(socket) {
        var acc = getUser(getIP(socket));
        acc.id = "*******";
        socket.emit("account", acc);
    }

    function getIP(socket) {
        return socket.request.connection.remoteAddress;
    }

    io.on("connection", function (socket) {

        var ip = getIP(socket);
        /* Send out data to user */
        socket.emit("skins", skins);
        emitUserAccount(socket);

        socket.on("get", () => {
            emitUserAccount(socket)
            socket.emit("skins", skins);
        })

        socket.on("rate", pack => {
            console.log("Rating: " + pack.skin + " : " + pack.rating);
            var user = getUser(ip);
            if (pack.rating > 100 || pack.rating < 0) return;
            recordRating(pack.skin, user, pack.rating)
            socket.emit("confirmedVote", {skin: pack.skin, rating: pack.rating});
            //emitUserAccount(socket);
        });

        /* END OF SOCKET */
    });
});