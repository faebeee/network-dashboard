const blessed = require('blessed');
const contrib = require('blessed-contrib');
const screen = blessed.screen();
const fetcher = require('./fetcher');

const downloadDataSets = [];
const uploadDataSets = [];
const fileSizeInBytes = 1024 * 1024 * 100;
const MAX_LENGTH = 50;
const INTERVALL = 1000;
const REQUEST_MAX = 100;
let counter = 0;


const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen })

const downloadLine = grid.set(1, 0, 5, 12, contrib.line, {
    label: 'Down Mbps'
    , tags: true
    , style: { line: 'blue' }
})
const uploadLine = grid.set(6, 0, 5, 12, contrib.line, {
    label: 'Up Mbps'
    , tags: true
    , style: { line: 'yellow' }
})

const LCD_CONFIG = {
    segmentWidth: 0.06 // how wide are the segments in % so 50% = 0.5
    , segmentInterval: 0.11 // spacing between the segments in % so 50% = 0.550% = 0.5
    , strokeWidth: 0.11 // spacing between the segments in % so 50% = 0.5
    , elements: 4 // how many elements in the display. or how many characters can be displayed.
    , display: 321 // what should be displayed before first call to setDisplay
    , elementSpacing: 4 // spacing between each element
    , elementPadding: 2 // how far away from the edges to put the elements
    , color: 'white' // color for the segments
    ,
};

const downloadMax = grid.set(0, 0, 1, 1, contrib.lcd, {
    ...LCD_CONFIG,
    label: 'Max Download',
});

const downloadMin = grid.set(0, 1, 1, 1, contrib.lcd, {
    ...LCD_CONFIG,
    label: 'Min Download',
});

const downloadAvg = grid.set(0, 2, 1, 1, contrib.lcd, {
    ...LCD_CONFIG,
    label: 'Avg Download',
});

const downloadCur = grid.set(0, 3, 1, 1, contrib.lcd, {
    ...LCD_CONFIG,
    label: 'Current Download',
});


screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
});

function fetchData() {
    fetcher((value) => {
        uploadDataSets.push(value)
    }, (value) => {
        downloadDataSets.push(value)
    }, () => {
        setTimeout(fetchData, INTERVALL);
    });
}

async function render() {

    downloadLine.setData([
        {
            title: 'Download',
            x: downloadDataSets,
            y: downloadDataSets
        }
    ]);
    uploadLine.setData([
        {
            title: 'Upload',
            x: uploadDataSets,
            y: uploadDataSets
        }
    ]);

    const avg = downloadDataSets.reduce((acc, v) => {
        return acc + v;
    }, 0) / downloadDataSets.length;

    downloadAvg.setDisplay(avg);
    downloadMax.setDisplay(Math.max(...downloadDataSets));
    downloadMin.setDisplay(Math.min(...downloadDataSets));
    if (downloadDataSets.length > 0) {
        downloadCur.setDisplay(downloadDataSets[downloadDataSets.length - 1]);
    }

    screen.render();

    setTimeout(() => render(), INTERVALL);
}

fetchData();
render();