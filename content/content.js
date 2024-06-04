const dictionary = {};

const format = (template, ...args) => {
    return template.replace(/{([0-9]+)}/g, function (match, index) {
      return typeof args[index] === 'undefined' ? match : args[index];
    });
  }

const dictFromFile = (path) => {
    fetch(chrome.runtime.getURL(path))
        .then(response => response.text())
        .then(data => {
            const lines = data.split("\n");

            for (let i = 0; i < lines.length; ++i) {
                let j = lines[i].indexOf(' ');
                let hanzi = lines[i].slice(0, j);

                if (dictionary[hanzi] == undefined)
                    dictionary[hanzi] = lines[i].slice(j + 1);
            }
        });
}

dictFromFile("../resources/pinyin.txt");

const romanize = (selection) => {
    if (!selection) return "";

    let pinyin = "";
    let start = 0;

    while (start < selection.length) {
        let len = 1;
        let prev = selection.charAt(start);
        let query = selection.charAt(start);

        while (dictionary[query] && start + len < selection.length) {
            prev = query;
            query += selection.charAt(start + len);
            ++len;
        }

        if (dictionary[query]) {
            prev = query;
        }
        let temp = dictionary[prev];

        if (temp) {
            if (!pinyin.endsWith(" ")) {
                pinyin += " ";
            }
            pinyin += temp + " ";
        } else {
            pinyin += prev;
        }

        start += prev.length;
    }

    return pinyin.trim();
}

const pinyify = async (request, sender, sendResponse) => {
    const selection = request.type == "fromButton" ? window.getSelection().toString() : request.data;
    const romanized = romanize(selection);

    const tooltip = await fetch(chrome.runtime.getURL("../tooltip/tooltip.html")).then(response => response.text());
    const offset = window.getSelection().anchorOffset;
    const beforeSelected = window.getSelection().anchorNode.textContent.slice(0, offset)
    const afterSelected = window.getSelection().anchorNode.textContent.slice(offset + selection.length)

    const allTogether = beforeSelected + format(tooltip, selection, romanized) + afterSelected;
    window.getSelection().anchorNode.textContent = allTogether;
    return true;
}


chrome.runtime.onMessage.addListener(pinyify)

console.log("content loaded")