/*
    Server-side socket.io main
*/

/** Choose a port */
var port = 25565;

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
    var skins;
    var users = loadUsers();
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
        for (let i = 0; i < skins.length; i++) {
            skins[i].code = skins[i].name.split(" ").join("_").toUpperCase();
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
        if (rating > 5 || rating < 1) {
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
            skins[i].votesArr = new Array();
            skins[i].rating = 0;
        }
        for (let i = 0; i < users.length; i++) {
            var user = JSON.parse(fs.readFileSync("users/" + users[i]));
            try {
                Object.keys(user).forEach(function (key) {
                    skins[getSkinIndexFromCode(key)].votesArr.push(user[key]);
                });
            } catch (e) {
            }
        }

        for (let i = 0; i < skins.length; i++) {
            if (skins[i].votesArr.length >= 1) {
                skins[i].rating = 0;
                var totalVotes = skins[i].votesArr.length;
                var voteSum = 0;
                skins[i].votesArr.forEach(vote => voteSum += vote);
                var rating = Math.round((voteSum / totalVotes) * 100) / 100;
                skins[i].rating = rating;
                skins[i].votes = totalVotes;
            }
        }
        console.log("Updated scores: " + new Date());
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
            socket.emit("skins", skins);
        })

        socket.on("rate", pack => {
            var user = getUser(ip);
            recordRating(pack.skin, user, pack.rating)
            emitUserAccount(socket);
            console.log("Rating: " + pack.skin + " : " + pack.rating);
        });

        /* END OF SOCKET */
    });
});