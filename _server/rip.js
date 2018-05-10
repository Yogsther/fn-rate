/* Rip code */

var test = document.getElementsByClassName("col-sm-6");
var final = new Array();
for (let i = 0; i < test.length; i++) {
    var type = test[i].children[0].children[0].className.split(" ")[2];
    if (type == "outfit") {
        var rarity = test[i].children[0].className.split("-")[test[100].children[0].className.split("-").length - 1]
        var price = test[i].children[0].children[1].children[0].children[1].innerText.substr(1).replace(",", "");
        var image = test[i].children[0].children[0].src;
        var name = test[i].children[0].children[1].children[0].children[0].children[0].innerHTML;
        final.push({
            rarity: rarity,
            price: price,
            image: image,
            name: name,
            type: type
        });
        //console.log("Pushed! " + name);
    }
}
console.log(JSON.stringify(final));