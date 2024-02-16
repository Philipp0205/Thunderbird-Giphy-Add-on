// Below is what we'll log to the console.
let giphyApiKey = '';
// listeners
document.addEventListener('DOMContentLoaded', function () {
    var goToPage1 = document.getElementById('hide-settings-button');
    var goToPage2 = document.getElementById('settings-button');
    var searchInput = document.getElementById('search-bar-input');
    var saveApiKeyButton = document.getElementById('save-api-key-button');
    var clearDataButton = document.getElementById('clear-gif-data-button');

    // go to page 2
    goToPage2.addEventListener('click', function () {
        document.getElementById('page1').style.display = 'none';
        document.getElementById('page2').style.display = 'block';
    });

    // go to page 1
    goToPage1.addEventListener('click', function () {
        document.getElementById('page2').style.display = 'none';
        document.getElementById('page1').style.display = 'block';
    });

    // clear data button
    /*

    clearDataButton.addEventListener('click', function () {
        clearAllData();
    });
    */

    // change api key 
    saveApiKeyButton.addEventListener('click', function (e) {
        const apiKey = document.getElementById('api-key-input').value;
        saveApiKey(apiKey);
    });

    // search gifs
    searchInput.addEventListener('keypress', function (e) {
        // if enter key is pressed search giphy
        if (e.key === 'Enter') {

            e.preventDefault();
            const keyword = e.target.value;
            console.log('keypress');
            searchGiphy(keyword);
        }
    });
    loadAndDisplayGifs();
    checkApiKey();
});

function saveApiKey(apiKey) {
    console.log(`Attempting to save API key: ${apiKey}`);
    browser.storage.local.set({ apiKey: apiKey })
        .then(() => console.log('API Key saved successfully.'))
        .catch((error) => console.error('Error saving API key:', error));
}

function loadAndDisplayGifs() {
    browser.storage.local.get('gifData').then((result) => {
        let gifData = result.gifData || [];
        displayGifs(gifData);
    });
}

function displayGifs(urls) {
    const container = document.getElementById('gif-container');
    container.innerHTML = ''; // Clear existing content
    console.log('display gifs: ' + urls.length);

    urls.forEach(url => {
        const gifElement = document.createElement('img');
        gifElement.src = url; // Adjust according to your data structure
        gifElement.alt = 'GIF';
        gifElement.style.cursor = 'pointer'; // Optional, to show it's clickable
        container.appendChild(gifElement);

        // Attach event listener to each GIF
        gifElement.addEventListener('click', () => {
            insertImageIntoEmail(gifElement.src);
        });

    });
}

async function searchGiphy(keyword) {
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${keyword}&limit=25&offset=0&rating=g&lang=en&bundle=messaging_non_clips`;
    clearGifData();

    try {
        const response = await fetch(url);
        const data = await response.json();
        const urls = data.data.map(gif => gif.images.fixed_height.url);
        console.log('Number of urls: ' + urls.length);
        saveGifData(urls);
        displayGifs(urls);
    } catch (error) {
        console.error('Error fetching GIFs:', error);
    }
}

function saveGifData(gifUrls) {
    browser.storage.local.get('gifData').then((result) => {
        let existingGifData = result.gifData || [];
        let updatedGifData = existingGifData.concat(gifUrls); // Concatenate new URLs with existing data
        browser.storage.local.set({ gifData: updatedGifData });
    });
}

function clearAllData() {
    browser.storage.local.remove('apiKey');
    clearGifData();
}

function clearGifData() {
    browser.storage.local.remove('gifData').then(() => {
        console.log('gifData has been removed');
        // Optionally, you can update the UI or perform other actions
        // after successfully removing the data.
        displayGifs([]); // Assuming you want to clear the displayed GIFs as well.
    });
    //browser.storage.local.remove('gifData');
}

function focusSearchBox() {
    document.getElementById('search-bar-input').focus();
}

async function insertImageIntoEmail(url) {
    let openTabs = await messenger.tabs.query();
    let composeTab = openTabs.filter(
        tab => ["messageCompose"].includes(tab.type)
    )[0];

    if (!composeTab) {
        console.log("No compose tab found.");
        return;
    }

    let composeDetails = await messenger.compose.getComposeDetails(composeTab.id);
    console.log(composeDetails);

    let htmlBody = composeDetails.body;

    let imageHtml = `<img moz-do-not-send="true" src="${url}" alt=""></img>`

    // Append the HTML to the existing body
    let updatedBody = htmlBody + imageHtml;

    // Set the updated body in the compose window
    messenger.compose.setComposeDetails(composeTab.id, { body: updatedBody });
}

// if there is no api key show a message in the gif-container
function checkApiKey() {
    // get api key and if not threre show a message
    browser.storage.local.get('apiKey').then((result) => {
        console.log("got api key: " + result.apiKey);
        document.getElementById('api-key-input').value = result.apiKey;
        giphyApiKey = result.apiKey;
        if (giphyApiKey === undefined || giphyApiKey === '') {
            document.getElementById('gif-container').innerHTML = 'Please enter your Giphy API Key in the settings page';
        }
    });
}