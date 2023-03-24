init();
const language = 'en_US';
let outfitList = [];
let smashList = [];
let smashListStr = '';
let passListStr = '';
let passList = [];
let current;
let datasaved = true;

let outfitImage = document.getElementById('image');
let outfitName = document.getElementById('name');
let outfitDescription = document.getElementById('description');
let smashListElem = document.getElementById('smashlist');
let passListElem = document.getElementById('passlist');
let totalCounter = document.getElementById('totalcounter');
let smashCounter = document.getElementById('smashcounter');
let passCounter = document.getElementById('passcounter');

function init(){
    getOutfitList().then(result => {
        outfitList = result;

        loadData();
        pickRandomOutfit();

        document.getElementById('loadmsg').style.display = 'none';
        document.getElementById('main').style.display = 'block';
    });
}

function pickRandomOutfit() {
    current = Math.floor(Math.random() * outfitList.length);
    const outfit = outfitList[current].item;

    try {
        outfitName.innerText = outfit.name;
        outfitDescription.innerText = outfit.description;
        outfitImage.src = outfit.images.information;
    } catch (e) {
        document.getElementById('smashbutton').remove();
        document.getElementById('passbutton').remove();
        outfitName.innerText = smashList.length > passList.length ? 'Now go touch some grass' : 'gg';
        outfitDescription.innerText = "";
        outfitImage.src = 'https://media.tenor.com/qmhJIwtzERoAAAAd/the-rock-purx124.gif';
    }
    totalCounter.innerText = outfitList.length + ' remain';
    smashCounter.innerText = smashList.length;
    passCounter.innerText = passList.length;
}

function smash() {
    const outfit = outfitList.splice(current,1)[0];
    smashList.unshift(outfit);
    smashListStr += outfit.item.name + '<br>';
    smashListElem.innerHTML = smashListStr;
    datasaved = false;
    pickRandomOutfit();
}

function pass() {
    const outfit = outfitList.splice(current,1)[0];
    passList.unshift(outfit);
    passListStr += outfit.item.name + '<br>';
    passListElem.innerHTML = passListStr;
    datasaved = false;
    pickRandomOutfit();
}

function saveData(){
    let smashids = [];
    let passids = [];

    smashList.forEach(outfit => {
        smashids.push(outfit.itemId);
    });
    passList.forEach(outfit => {
        passids.push(outfit.itemId);
    });

    localStorage.setItem('smashlist', JSON.stringify(smashids));
    localStorage.setItem('passlist', JSON.stringify(passids));

    datasaved = true;
}

function loadData(){
    const smashids = JSON.parse( (localStorage.getItem('smashlist') ?? '[]')).reverse();
    const passids = JSON.parse( (localStorage.getItem('passlist') ?? '[]')).reverse();

    // load smash list
    loadsmash:
        for (let i = smashids.length-1; i>=0; i--){
            const currid = smashids[i];

            for (let o in outfitList){
                if (currid === outfitList[o].itemId){
                    smashList.push(outfitList[o]);
                    smashListStr += outfitList[o].item.name+'<br>';
                    outfitList.splice(o,1);
                    smashids.splice(i, 1);

                    continue loadsmash;
                }
            }
        }

    // load pass list
    loadpass:
        for (let i = passids.length-1; i>=0; i--){
            const currid = passids[i];

            for (let o in outfitList){
                if (currid === outfitList[o].itemId){
                    passList.push(outfitList[o]);
                    passListStr += outfitList[o].item.name+'<br>';
                    outfitList.splice(o,1);
                    passids.splice(i, 1);

                    continue loadpass;
                }
            }
        }

    passListElem.innerHTML = passListStr;
    smashListElem.innerHTML = smashListStr;
}

function clearData(){
    smashList = [];
    passList = [];
    saveData();
}

function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

async function getOutfitList() {
    // get latest items list from fortnite api
    const itemList = (await (await fetch(`https://fortnite-api.theapinetwork.com/items/list`)).json()).data;

    outfitList = [];

    for (let item of itemList) {
        if(item.item.type === "outfit"){
            outfitList.push(item);
        }
    }

    return outfitList;
}

// save data every minute
setInterval(()=> {
    if (!datasaved){
        saveData();
    }
}, 30000);

window.onbeforeunload = () => {
    saveData();
}

// keyboard controls
document.onkeyup = (e) => {
    switch (e.code){
        case 'ArrowLeft':
            smash();
            break;
        case 'ArrowRight':
            pass();
            break;
    }
}