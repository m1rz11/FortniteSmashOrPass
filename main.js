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
let outfitInfo = document.getElementById('info');
let smashListElem = document.getElementById('smashlist');
let passListElem = document.getElementById('passlist');
let totalCounter = document.getElementById('totalcounter');
let smashCounter = document.getElementById('smashcounter');
let passCounter = document.getElementById('passcounter');

const jumpAnim= [
    {transform: "none"},
    {transform: "translate(0px, -15px)"},
    {transform: "translate(0px, -20px)"},
    {transform: "translate(0px, -15px)"},
    {transform: "none"}
];

const jumpAnimTiming = {
    duration: 300, iterations: 1, 
}

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
    const outfit = outfitList[current];

    try {
        outfitInfo.innerText = 
        `${outfit.rarity ? outfit.rarity.displayValue : ""}
        ${outfit.set ? outfit.set.value : ""}
        ${outfit.introduction ? outfit.introduction.text : ""}`;

        outfitName.innerText = outfit.name;
        outfitDescription.innerText = outfit.description;
        outfitImage.src = outfit.images.icon;
    } catch (e) {
        document.getElementById('smashbutton').disabled = true;
        document.getElementById('passbutton').disabled = true;
        outfitName.innerText = smashList.length > passList.length ? 'now go touch some grass' : 'Victory Royale =)';
        outfitDescription.innerText = "";
        outfitImage.src = 'https://media.tenor.com/qmhJIwtzERoAAAAd/the-rock-purx124.gif';
    }
    totalCounter.innerText = outfitList.length + ' remain';
    smashCounter.innerText = smashList.length;
    passCounter.innerText = passList.length;
}

function getOutfitDiv(name, image) {
    return `
        <div class="col-6 col-sm-4 col-md-3 col-lg-2">
            <img class="rounded img-fluid shadow-sm object-fit-contain w-100" src="`+image+`">
            <p class="fs-6">`+name+`</p>
        </div>
    `;
}

function smash() {
    const outfit = outfitList.splice(current,1)[0];
    smashList.unshift(outfit);
    smashListStr += getOutfitDiv(outfit.name, outfit.images.icon);
    smashListElem.innerHTML = smashListStr;
    datasaved = false;
    smashCounter.animate(jumpAnim, jumpAnimTiming);
    pickRandomOutfit();
}

function pass() {
    const outfit = outfitList.splice(current,1)[0];
    passList.unshift(outfit);
    passListStr += getOutfitDiv(outfit.name, outfit.images.icon);
    passListElem.innerHTML = passListStr;
    datasaved = false;
    passCounter.animate(jumpAnim, jumpAnimTiming);
    pickRandomOutfit();
}

function saveData(){
    let smashids = [];
    let passids = [];

    smashList.forEach(outfit => {
        smashids.push(outfit.id);
    });
    passList.forEach(outfit => {
        passids.push(outfit.id);
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
                if (currid === outfitList[o].id){
                    smashList.push(outfitList[o]);
                    smashListStr += getOutfitDiv(outfitList[o].name, outfitList[o].images.icon);
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
                if (currid === outfitList[o].id){
                    passList.push(outfitList[o]);
                    passListStr += getOutfitDiv(outfitList[o].name, outfitList[o].images.icon);
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
    return (await (await fetch(`https://fortnite-api.com/v2/cosmetics/br/search/all?type=outfit`)).json())
        .data.filter(outfit => outfit.name != "TBD");
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