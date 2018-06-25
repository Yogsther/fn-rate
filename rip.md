### rip_info.js
```javascript

    var col = document.getElementsByClassName("capital");
    var items = new Array();
    var imageSources = "";
    for(let i = 0; i < col.length; i++){
        el = col[i].parentElement
        // Rip data
        fnbrSrc = el.children[0].children[0].src
        name = el.children[1].innerText
        type = el.children[2].innerText.toLowerCase().split(" ").join("_");
        rarity = el.children[3].innerText.toLowerCase()
        code = name.split(" ").join("_").toUpperCase();
        price = el.children[4].innerText;
        src = "img/" + type.toLowerCase() + "/" + code + ".png";
        /* Items to include */
        if(["glider", "back_bling", "umbrella"].indexOf(type) !== -1){
            items.push({
                name: name,
                price: price,
                rarity: rarity,
                src: src,
                type: type,
                code: code
            });

            imageSources += "wget " + fnbrSrc + " -O " + src + "\n";
        }
    }

    console.log(imageSources);
    console.log("New items: " + items.length);
    





```